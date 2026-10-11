import http from 'node:http'
import fs from 'node:fs/promises'
import path from 'node:path'
import { createHash, timingSafeEqual } from 'node:crypto'
import { pathToFileURL } from 'node:url'
import { updateSite } from './update-site.mjs'

export async function createDeploymentServer({ token, stateDir, sites, deploy }) {
  if (!token || token.length < 32) throw new Error('DEPLOY_TOKEN 至少需要 32 字符')
  const jobsDir = path.join(stateDir, 'jobs')
  await fs.mkdir(jobsDir, { recursive: true, mode: 0o700 })
  const jobs = new Map()
  const pending = []
  const secret = Buffer.from(`Bearer ${token}`)
  let running = false
  let admissions = Promise.resolve()
  async function save(job) {
    job.updatedAt = new Date().toISOString()
    const target = path.join(jobsDir, `${job.id}.json`)
    await fs.writeFile(`${target}.new`, JSON.stringify(job), { mode: 0o600 })
    await fs.rename(`${target}.new`, target)
  }
  for (const file of await fs.readdir(jobsDir)) {
    if (!/^[a-f0-9]{32}\.json$/.test(file)) continue
    const job = JSON.parse(await fs.readFile(path.join(jobsDir, file), 'utf8'))
    if (!sites.includes(job.site)) continue
    jobs.set(job.id, job)
    if (['queued', 'running'].includes(job.status)) {
      job.status = 'queued'
      await save(job)
      pending.push(job)
    }
  }
  async function drain() {
    if (running) return
    running = true
    try {
      while (pending.length) {
        const job = pending.shift()
        job.status = 'running'
        await save(job)
        try {
          job.result = await deploy(job)
          job.status = 'succeeded'
        } catch (error) {
          job.status = 'failed'
          job.error = String(error.message).slice(0, 2000)
        }
        await save(job)
        console.log(JSON.stringify({ id: job.id, site: job.site, status: job.status, error: job.error }))
      }
    } finally { running = false }
  }
  function reply(res, status, value) {
    res.writeHead(status, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' })
    res.end(JSON.stringify(value))
  }
  const server = http.createServer(async (req, res) => {
    try {
      const received = Buffer.from(req.headers.authorization || '')
      if (received.length !== secret.length || !timingSafeEqual(received, secret))
        return reply(res, 401, { error: 'Unauthorized' })
      const url = new URL(req.url, 'http://localhost')
      const status = /^\/(?:deploy\/)?jobs\/([a-f0-9]{32})$/.exec(url.pathname)
      if (req.method === 'GET' && status) {
        const job = jobs.get(status[1])
        return reply(res, job ? 200 : 404, job || { error: 'Job not found' })
      }
      if (req.method !== 'POST' || url.pathname !== '/deploy')
        return reply(res, 404, { error: 'Not found' })
      let body = ''
      for await (const chunk of req) {
        body += chunk
        if (Buffer.byteLength(body) > 4096) return reply(res, 413, { error: 'Request too large' })
      }
      let payload
      try { payload = JSON.parse(body) } catch { return reply(res, 400, { error: 'Invalid JSON' }) }
      if (!payload || typeof payload !== 'object' || !sites.includes(payload.site) || !/^[a-f0-9]{40}$/.test(payload.sha || '') ||
          !/^[a-f0-9]{40}$/.test(payload.artifact_sha || ''))
        return reply(res, 400, { error: 'Invalid site or revision' })
      const id = createHash('sha256').update(`${payload.site}:${payload.sha}:${payload.artifact_sha}`).digest('hex').slice(0, 32)
      const admission = admissions.then(async () => {
        if (jobs.has(id)) return jobs.get(id)
        if (pending.length >= 100) return null
        const job = { id, site: payload.site, sha: payload.sha, artifactSha: payload.artifact_sha,
          status: 'queued', createdAt: new Date().toISOString() }
        // Persist before acknowledging receipt. An interrupted daemon can resume.
        await save(job)
        jobs.set(id, job)
        pending.push(job)
        return job
      })
      admissions = admission.catch(() => {})
      const job = await admission
      if (!job) return reply(res, 429, { error: 'Deployment queue full' })
      reply(res, 202, job)
      void drain().catch((error) => { console.error(error.message); process.exitCode = 1 })
    } catch (error) {
      console.error(error.message)
      if (!res.headersSent) reply(res, 500, { error: 'Internal error' })
      else res.destroy()
    }
  })
  server.requestTimeout = 15000
  void drain().catch((error) => { console.error(error.message); process.exitCode = 1 })
  return server
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const stateDir = process.env.DEPLOY_STATE_DIR || '/var/lib/vmct-static-deploy'
  const config = JSON.parse(await fs.readFile(process.env.DEPLOY_SITES_FILE || '/etc/vmct-static-deploy/sites.json', 'utf8'))
  const server = await createDeploymentServer({ token: process.env.DEPLOY_TOKEN, stateDir,
    sites: Object.keys(config), deploy: (job) => updateSite(job, config[job.site], stateDir) })
  server.listen(Number(process.env.PORT || 8790), process.env.HOST || '172.17.0.1', () => {
    console.log('Static deployment API ready')
  })
}
