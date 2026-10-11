import fs from 'node:fs/promises'
import path from 'node:path'
import os from 'node:os'
import { spawn } from 'node:child_process'
import { publishStatic } from './publish-static.mjs'

async function run(args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(args[0], args.slice(1), { ...options, timeout: 120000,
      stdio: ['ignore', 'pipe', 'pipe'] })
    let output = '', error = ''
    child.stdout.on('data', (chunk) => { output += chunk })
    child.stderr.on('data', (chunk) => { error = (error + chunk).slice(-4000) })
    child.on('error', reject)
    child.on('close', (code, signal) => {
      if (code === 0) resolve(output.trim())
      else reject(new Error(`${args[0]} failed (${signal || code}): ${error}`))
    })
  })
}

async function rejectLinks(directory) {
  for (const entry of await fs.readdir(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name)
    if (entry.isSymbolicLink()) throw new Error('产物包含符号链接，拒绝发布')
    if (entry.isDirectory()) await rejectLinks(file)
    else if (!entry.isFile()) throw new Error('产物包含特殊文件，拒绝发布')
  }
}

export async function updateSite(job, config, stateDir) {
  const cache = path.join(stateDir, 'cache', `${job.site}.git`)
  await fs.mkdir(path.dirname(cache), { recursive: true })
  if (!(await fs.stat(cache).catch(() => null))) await run(['git', 'init', '--bare', cache])
  const git = ['git', '-C', cache]
  let fetched = false
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      await run([...git, '-c', 'http.version=HTTP/1.1', 'fetch', '--depth=1', config.repository,
        `refs/heads/${config.branch}:refs/heads/artifact`, '--force'])
      fetched = true; break
    } catch (error) { if (attempt === 2) throw error }
  }
  if (!fetched) throw new Error('无法获取构建产物')
  const artifact = await run([...git, 'rev-parse', 'artifact'])
  if (artifact !== job.artifactSha) throw new Error('构建产物已被新版本替代，拒绝部署过期任务')
  const manifest = JSON.parse(await run([...git, 'show', `${artifact}:deployment.json`]))
  if (manifest.sha !== job.sha || manifest.repository !== config.repositoryName)
    throw new Error('构建产物来源或源代码版本不匹配')
  const work = await fs.mkdtemp(path.join(os.tmpdir(), 'vmct-static-'))
  try {
    const archive = path.join(work, 'artifact.tar')
    const output = path.join(work, 'site')
    await fs.mkdir(output)
    await run([...git, 'archive', '--format=tar', `--output=${archive}`, artifact])
    await run(['tar', '-xf', archive, '-C', output, '--no-same-owner', '--no-same-permissions'])
    await rejectLinks(output)
    for (const file of config.requiredFiles || ['index.html']) {
      const stat = await fs.stat(path.join(output, file))
      if (!stat.isFile() || stat.size === 0) throw new Error(`产物缺少 ${file}`)
    }
    process.env.SITE_HEALTH_HOST = config.host
    process.env.SITE_HEALTH_ORIGIN = 'https://127.0.0.1'
    const release = await publishStatic({ source: output, target: config.target })
    return { sha: job.sha, artifactSha: artifact, release }
  } finally { await fs.rm(work, { recursive: true, force: true }) }
}
