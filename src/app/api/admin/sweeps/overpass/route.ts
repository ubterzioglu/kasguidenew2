import { spawn } from 'node:child_process'
import path from 'node:path'

import { getReviewAdminAccessError, jsonFail, jsonOk } from '@/lib/api-helpers'
import { OverpassSweepRunBodySchema } from '@/lib/api-schemas'
import { getSweepDashboardSnapshot } from '@/lib/place-sweep-store'

export const dynamic = 'force-dynamic'

type OverpassScriptResult = {
  gridKey?: string
  cellId?: string
  inserted?: number
  uniquePlaces?: number
  fetched?: number
  status?: string
  dryRun?: boolean
}

export async function POST(request: Request) {
  const authError = getReviewAdminAccessError(request)

  if (authError) {
    return authError
  }

  const rawBody = await request.json().catch(() => null)
  const parsed = OverpassSweepRunBodySchema.safeParse(rawBody)

  if (!parsed.success) {
    return jsonFail(`Gecersiz istek: ${parsed.error.issues[0]?.message ?? 'bilinmeyen hata'}`)
  }

  const { gridX, gridY, cellSizeMeters, regionName, dryRun } = parsed.data

  try {
    const result = await runOverpassGridSweep({
      gridX,
      gridY,
      cellSizeMeters,
      regionName,
      dryRun,
    })

    const snapshot = await getSweepDashboardSnapshot(500)

    return jsonOk({
      message: dryRun
        ? `Overpass dry-run tamamlandi (${result.gridKey ?? `X${gridX}Y${gridY}`}).`
        : `Overpass sweep tamamlandi (${result.gridKey ?? `X${gridX}Y${gridY}`}).`,
      result,
      snapshot,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Overpass sweep baslatilamadi.'
    return jsonFail(message, 500)
  }
}

async function runOverpassGridSweep(input: {
  gridX: number
  gridY: number
  cellSizeMeters: number
  regionName?: string
  dryRun: boolean
}) {
  const scriptPath = path.join(process.cwd(), 'scripts', 'import-overpass-grid.ts')
  const args = [
    '--no-warnings=MODULE_TYPELESS_PACKAGE_JSON',
    '--experimental-strip-types',
    scriptPath,
    `--grid-x=${input.gridX}`,
    `--grid-y=${input.gridY}`,
    `--cell-size-meters=${input.cellSizeMeters}`,
  ]

  if (input.regionName?.trim()) {
    args.push(`--region=${encodeURIComponent(input.regionName.trim())}`)
  }

  if (input.dryRun) {
    args.push('--dry-run')
  }

  const { stdout, stderr, exitCode } = await spawnProcess(process.execPath, args, process.cwd())

  if (exitCode !== 0) {
    throw new Error(extractErrorMessage(stderr, stdout))
  }

  const parsed = parseJsonFromOutput(stdout)

  if (!parsed) {
    throw new Error('Overpass sweep ciktisi okunamadi.')
  }

  return parsed
}

function spawnProcess(command: string, args: string[], cwd: string) {
  return new Promise<{ stdout: string; stderr: string; exitCode: number | null }>((resolve, reject) => {
    const child = spawn(command, args, {
      cwd,
      env: process.env,
      stdio: ['ignore', 'pipe', 'pipe'],
    })

    let stdout = ''
    let stderr = ''

    child.stdout.on('data', (chunk) => {
      stdout += chunk.toString()
    })

    child.stderr.on('data', (chunk) => {
      stderr += chunk.toString()
    })

    child.on('error', reject)
    child.on('close', (exitCode) => {
      resolve({ stdout, stderr, exitCode })
    })
  })
}

function parseJsonFromOutput(output: string): OverpassScriptResult | null {
  const trimmed = output.trim()

  if (!trimmed) {
    return null
  }

  for (let index = trimmed.lastIndexOf('{'); index >= 0; index = trimmed.lastIndexOf('{', index - 1)) {
    try {
      return JSON.parse(trimmed.slice(index)) as OverpassScriptResult
    } catch {
      continue
    }
  }

  return null
}

function extractErrorMessage(stderr: string, stdout: string) {
  const message = stderr.trim() || stdout.trim()
  return message || 'Overpass sweep basarisiz oldu.'
}
