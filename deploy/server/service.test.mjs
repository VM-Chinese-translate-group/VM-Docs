import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { spawn } from 'node:child_process'
import { createDeploymentServer } from './service.mjs'

const token = 'a'.repeat(48)
const payload = { site: 'docs', sha: 'b'.repeat(40), artifact_sha: 'c'.repeat(40) }

async function fixture(t, deploy) {
  const stateDir = await fs.mkdtemp(path.join(os.tmpdir(), 'vmct-api-'))
  const server = await createDeploymentServer({ token, stateDir, sites: ['docs'], deploy })
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve))
  t.after(() => { server.closeAllConnections(); server.close() })
  const origin = `http://127.0.0.1:${server.address().port}`
  const post = (headers = { Authorization: `Bearer ${token}` }, body = payload) => fetch(`${origin}/deploy`, {
    method: 'POST', headers, body: JSON.stringify(body),
  })
  const status = async (id) => (await fetch(`${origin}/jobs/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  })).json()
  return { stateDir, server, origin, post, status }
}

async function final(status, id) {
  for (let i = 0; i < 200; i++) {
    const job = await status(id)
    if (['succeeded', 'failed'].includes(job.status)) return job
    await new Promise((resolve) => setTimeout(resolve, 10))
  }
  throw new Error('Test timed out')
}

test('unauthorized and arbitrary site requests never run deployments', async (t) => {
  let calls = 0
  const { post } = await fixture(t, async () => { calls++ })
  assert.equal((await post({})).status, 401)
  assert.equal((await post(undefined, { ...payload, site: 'www' })).status, 400)
  assert.equal(calls, 0)
})

test('concurrent duplicate requests run once and report a persisted final result', async (t) => {
  let calls = 0
  const { post, status, stateDir } = await fixture(t, async (job) => {
    calls++
    return { sha: job.sha, artifactSha: job.artifactSha }
  })
  const responses = await Promise.all([post(), post(), post()])
  const jobs = await Promise.all(responses.map((response) => response.json()))
  assert.equal(new Set(jobs.map((job) => job.id)).size, 1)
  const result = await final(status, jobs[0].id)
  assert.equal(result.status, 'succeeded')
  assert.equal(calls, 1)
  const saved = JSON.parse(await fs.readFile(path.join(stateDir, 'jobs', `${result.id}.json`)))
  assert.equal(saved.status, 'succeeded')
  await fs.rm(stateDir, { recursive: true, force: true })
})

test('deployment errors are visible in final job status', async (t) => {
  const { post, status, stateDir } = await fixture(t, async () => { throw new Error('Health check failed') })
  const job = await (await post()).json()
  const result = await final(status, job.id)
  assert.equal(result.status, 'failed')
  assert.match(result.error, /Health check failed/)
  await fs.rm(stateDir, { recursive: true, force: true })
})

test('Actions client exits with an error for an unsuccessful server deployment', async (t) => {
  const { origin, stateDir } = await fixture(t, async () => { throw new Error('Deployment rollback') })
  const child = spawn('python3', [new URL('../../.github/scripts/deploy.py', import.meta.url).pathname], {
    env: { ...process.env, DEPLOY_TOKEN: token, DEPLOY_URL: `${origin}/deploy`,
      SOURCE_SHA: payload.sha, ARTIFACT_SHA: payload.artifact_sha, NO_PROXY: '127.0.0.1' },
    stdio: ['ignore', 'pipe', 'pipe'],
  })
  let output = ''
  child.stdout.on('data', (chunk) => { output += chunk })
  child.stderr.on('data', (chunk) => { output += chunk })
  const code = await new Promise((resolve) => child.on('exit', resolve))
  assert.equal(code, 1)
  assert.match(output, /::error::Server deployment failed: Deployment rollback/)
  assert.ok(!output.includes(token))
  await fs.rm(stateDir, { recursive: true, force: true })
})
