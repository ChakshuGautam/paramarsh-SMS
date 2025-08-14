#!/usr/bin/env node

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const ROOT = path.resolve(__dirname, '..')
const DOCS = path.join(ROOT, 'docs')
const APPS = path.join(ROOT, 'apps')
const SERVICES = path.join(ROOT, 'services')
const OUT_DIR = path.join(ROOT, 'progress')

const exists = (p) => { try { fs.accessSync(p); return true } catch { return false } }
const readFileSafe = (p) => { try { return fs.readFileSync(p, 'utf8') } catch { return '' } }
const listFilesRecursive = (dir) => {
  const files = []
  if (!exists(dir)) return files
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  for (const e of entries) {
    const p = path.join(dir, e.name)
    if (e.isDirectory()) files.push(...listFilesRecursive(p))
    else files.push(p)
  }
  return files
}

function discoverModules() {
  const modulesDir = path.join(DOCS, 'Modules')
  const files = exists(modulesDir) ? fs.readdirSync(modulesDir) : []
  const docs = files.filter((f) => f.endsWith('.md')).filter((f) => !['README.md'].includes(f))
  return docs.map((f) => ({ key: f.replace(/\.md$/, ''), title: f.replace(/\.md$/, '').replace(/_/g, ' '), docPath: path.join(modulesDir, f) }))
}

function mapModuleToPaths(key) {
  const k = key.toLowerCase()
  const apiModules = path.join(APPS, 'api', 'src', 'modules')
  const webResources = path.join(APPS, 'web', 'app', 'admin', 'resources')
  const matches = []
  const pushIfExists = (label, p) => { if (exists(p)) matches.push({ label, path: p }) }
  if (k.includes('sis') || k === 'sis') {
    pushIfExists('api:students', path.join(apiModules, 'students'))
    pushIfExists('api:guardians', path.join(apiModules, 'guardians'))
    pushIfExists('api:enrollments', path.join(apiModules, 'enrollments'))
    pushIfExists('web:students', path.join(webResources, 'students'))
    pushIfExists('web:guardians', path.join(webResources, 'guardians'))
    pushIfExists('web:enrollments', path.join(webResources, 'enrollments'))
  }
  if (k.includes('attendance')) {
    pushIfExists('api:attendance', path.join(apiModules, 'attendance'))
    pushIfExists('web:attendanceRecords', path.join(webResources, 'attendanceRecords'))
  }
  if (k.includes('exams')) {
    pushIfExists('api:exams', path.join(apiModules, 'exams'))
    pushIfExists('api:marks', path.join(apiModules, 'marks'))
    pushIfExists('web:exams', path.join(webResources, 'exams'))
    pushIfExists('web:marks', path.join(webResources, 'marks'))
  }
  if (k.includes('fees') || k.includes('finance')) {
    pushIfExists('api:fee-structures', path.join(apiModules, 'fee-structures'))
    pushIfExists('api:fee-schedules', path.join(apiModules, 'fee-schedules'))
    pushIfExists('api:invoices', path.join(apiModules, 'invoices'))
    pushIfExists('api:payments', path.join(apiModules, 'payments'))
    pushIfExists('web:feeStructures', path.join(webResources, 'feeStructures'))
    pushIfExists('web:invoices', path.join(webResources, 'invoices'))
    pushIfExists('web:payments', path.join(webResources, 'payments'))
  }
  if (k.includes('communications')) {
    pushIfExists('api:files', path.join(apiModules, 'files'))
  }
  if (k.includes('timetable')) {
    pushIfExists('web:sections', path.join(webResources, 'sections'))
    pushIfExists('web:classes', path.join(webResources, 'classes'))
  }
  if (k.includes('hr') || k.includes('teacher') || k.includes('staff')) {
    pushIfExists('api:staff', path.join(apiModules, 'staff'))
    pushIfExists('web:staff', path.join(webResources, 'staff'))
    pushIfExists('web:teachers', path.join(webResources, 'teachers'))
  }
  if (k.includes('admissions') || k.includes('application')) {
    pushIfExists('api:applications', path.join(apiModules, 'applications'))
    pushIfExists('web:admissionsApplications', path.join(webResources, 'admissionsApplications'))
  }
  return matches
}

function computeImplementationScore(paths) {
  if (paths.length === 0) return { score: 0, details: [] }
  const details = paths.map(({ label, path: p }) => {
    const existsFlag = exists(p)
    const files = existsFlag ? listFilesRecursive(p).length : 0
    return { label, path: p, exists: existsFlag, files }
  })
  const existing = details.filter((d) => d.exists)
  const score = Math.round((existing.length / details.length) * 100)
  return { score, details }
}

function checkOpenApiCoverage(modTitle) {
  const openapi = readFileSafe(path.join(DOCS, 'API', 'openapi.yaml'))
  if (!openapi) return { present: false, matchedPaths: [] }
  const key = modTitle.toLowerCase()
  const patterns = ['students','guardians','enrollments','attendance','exams','marks','fees','invoices','payments','files','admissions','timetable','hr','teachers','staff','analytics','library','transport']
  const matched = patterns.filter((p) => key.includes(p) || openapi.includes(`/${p}`))
  return { present: matched.length > 0, matchedPaths: matched }
}

function detectHorizontals() {
  const signals = {
    openapiSpec: exists(path.join(DOCS, 'API', 'openapi.yaml')),
    responsesConventionsDoc: exists(path.join(DOCS, 'API', 'Responses_and_Conventions.md')),
    errorProblemDto: exists(path.join(APPS, 'api', 'src', 'common', 'problem.dto.ts')) || exists(path.join(APPS, 'api', 'src', 'common', 'problem.filter.ts')),
    tenancyGuard: exists(path.join(APPS, 'api', 'src', 'common', 'guards', 'branch.guard.ts')),
    healthModule: exists(path.join(APPS, 'api', 'src', 'modules', 'health', 'health.module.ts')),
    backendTests: exists(path.join(APPS, 'api', 'test')) && fs.readdirSync(path.join(APPS, 'api', 'test')).length > 0,
    webTests: exists(path.join(APPS, 'web', 'app', 'admin', '__tests__')) && fs.readdirSync(path.join(APPS, 'web', 'app', 'admin', '__tests__')).length > 0,
    mockApi: exists(path.join(SERVICES, 'mock-api')),
    adminReferenceComponents: (() => {
      const resDir = path.join(APPS, 'web', 'app', 'admin', 'resources')
      if (!exists(resDir)) return false
      const files = listFilesRecursive(resDir)
      return files.some((f) => /\.tsx$/.test(f) && /Reference(Field|Input)/.test(readFileSafe(f)))
    })(),
    adminCrudStructure: (() => {
      const resDir = path.join(APPS, 'web', 'app', 'admin', 'resources')
      if (!exists(resDir)) return false
      const dirs = fs.readdirSync(resDir).filter((d) => exists(path.join(resDir, d)))
      // consider present if at least 5 resources have List/Show/Edit/Create files
      let count = 0
      for (const d of dirs) {
        const base = path.join(resDir, d)
        if (exists(path.join(base, 'List.tsx')) || exists(path.join(base, 'List.ts'))) count++
      }
      return count >= 5
    })(),
  }
  // score (simple average)
  const values = Object.values(signals).map((v) => (v ? 1 : 0))
  const score = Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 100)
  return { score, signals }
}

function main() {
  if (!exists(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true })
  const modules = discoverModules()
  const records = modules.map((m) => {
    const implPaths = mapModuleToPaths(m.key)
    const impl = computeImplementationScore(implPaths)
    const api = checkOpenApiCoverage(m.title)
    return { module: m.key, title: m.title, docPath: path.relative(ROOT, m.docPath), implementation: impl, openapi: api }
  })
  const horizontals = detectHorizontals()
  const overall = {
    generatedAt: new Date().toISOString(),
    mockApiPresent: horizontals.signals.mockApi,
    horizontals,
    modules: records,
    summary: {
      documentedModules: records.length,
      avgImplementationScore: Math.round(records.reduce((a, r) => a + r.implementation.score, 0) / (records.length || 1)),
      implementedModules: records.filter((r) => r.implementation.score > 0).length,
    },
  }
  fs.writeFileSync(path.join(OUT_DIR, 'status.json'), JSON.stringify(overall, null, 2), 'utf8')

  const lines = []
  lines.push('# Project Progress Status')
  lines.push('')
  lines.push(`Generated: ${overall.generatedAt}`)
  lines.push('')
  lines.push(`Mock API Present: ${overall.mockApiPresent ? 'Yes' : 'No'}`)
  lines.push('')
  lines.push('## Horizontals (Signals)')
  lines.push('')
  lines.push(`Score: ${horizontals.score}%`)
  for (const [k, v] of Object.entries(horizontals.signals)) {
    lines.push(`- ${k}: ${v ? 'Yes' : 'No'}`)
  }
  lines.push('')
  lines.push('| Module | Doc | Impl Score | Impl Areas | OpenAPI |')
  lines.push('|---|---|---:|---|---|')
  for (const r of records) {
    const areas = r.implementation.details.map((d) => `${d.label}${d.exists ? '' : ' (missing)'}`).join(', ')
    const api = r.openapi.present ? r.openapi.matchedPaths.join('/') : '—'
    lines.push(`| ${r.title} | ${r.docPath} | ${r.implementation.score}% | ${areas || '—'} | ${api} |`)
  }
  fs.writeFileSync(path.join(OUT_DIR, 'STATUS.md'), lines.join('\n') + '\n', 'utf8')

  // Narrative quality assessment
  const q = []
  q.push('# Quality Assessment (Subjective — Auto-drafted)')
  q.push('')
  q.push('This is a first-pass subjective narrative based on signals and repository structure. Please edit as needed.')
  q.push('')
  q.push('## Strengths')
  const s = horizontals.signals
  if (s.openapiSpec) q.push('- OpenAPI spec present; endpoints and schemas defined.')
  if (s.responsesConventionsDoc) q.push('- Response conventions documented (pagination, errors).')
  if (s.errorProblemDto) q.push('- Backend includes Problem+JSON handler components.')
  if (s.tenancyGuard) q.push('- Tenancy/branch guard present — indicates multi-tenant scoping.')
  if (s.healthModule) q.push('- Health module present for basic observability.')
  if (s.backendTests || s.webTests) q.push('- Test scaffolding exists (backend and/or web).')
  if (s.mockApi) q.push('- Mock API service available for FE dev.')
  if (s.adminReferenceComponents) q.push('- Admin uses reference components for relations.')
  if (s.adminCrudStructure) q.push('- Admin resources are structured consistently across modules.')

  q.push('')
  q.push('## Gaps / Risks')
  if (!s.adminReferenceComponents) q.push('- Admin lists/forms may not uniformly use relational reference components.')
  if (!s.errorProblemDto) q.push('- Problem+JSON may not be wired across all controllers.')
  q.push('- Communications module implementation may be partial (heuristic uses files module as proxy).')
  q.push('- Timetable domain lacks explicit backend module; only UI-side section/class resources mapped.')
  q.push('- Analytics and several modules are documentation-only with no backend/frontend implementation yet.')
  q.push('- Observability beyond healthcheck (structured logging, tracing, metrics) not detected.')

  q.push('')
  q.push('## Recommendations')
  q.push('- Add explicit timetable backend module and align OpenAPI paths.')
  q.push('- Implement communications (templates, campaigns, messages) server module per spec.')
  q.push('- Expand Problem+JSON and RFC7807 coverage uniformly; include correlation ids.')
  q.push('- Add tests per module and coverage tracking; include Cypress for admin flows.')
  q.push('- Add structured logging and tracing; expose /metrics for Prometheus if applicable.')
  q.push('- Track module maturity in this report (e.g., Draft/In Progress/Ready).')

  fs.writeFileSync(path.join(OUT_DIR, 'QUALITY.md'), q.join('\n') + '\n', 'utf8')

  console.log(`Wrote ${path.join(OUT_DIR, 'status.json')}, STATUS.md and QUALITY.md`)
}

main()
