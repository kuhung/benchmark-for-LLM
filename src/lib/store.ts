import { openDB, IDBPDatabase } from 'idb'
import { BenchmarkSession, StatsSummary } from './benchmark/types'

const DB_NAME = 'llm-benchmark'
const DB_VERSION = 1
const STORE_NAME = 'sessions'

async function getDB(): Promise<IDBPDatabase> {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' })
      }
    },
  })
}

export async function saveSession(session: BenchmarkSession): Promise<void> {
  const db = await getDB()
  await db.put(STORE_NAME, session)
}

export async function getAllSessions(): Promise<BenchmarkSession[]> {
  const db = await getDB()
  const sessions = await db.getAll(STORE_NAME)
  return sessions.sort((a, b) => b.timestamp - a.timestamp)
}

export async function getSession(id: string): Promise<BenchmarkSession | undefined> {
  const db = await getDB()
  return db.get(STORE_NAME, id)
}

export async function deleteSession(id: string): Promise<void> {
  const db = await getDB()
  await db.delete(STORE_NAME, id)
}

export async function exportSession(session: BenchmarkSession): Promise<string> {
  return JSON.stringify(session, null, 2)
}

export async function importSession(json: string): Promise<BenchmarkSession> {
  const session = normalizeImportedSession(JSON.parse(json))
  await saveSession(session)
  return session
}

function normalizeImportedSession(value: unknown): BenchmarkSession {
  if (!isRecord(value)) {
    throw new Error('Invalid BenchmarkSession / JSON 不是有效的 BenchmarkSession')
  }

  const session = value as unknown as BenchmarkSession
  if (!session.id || !session.timestamp || !session.config || !Array.isArray(session.results)) {
    throw new Error('Missing required fields / JSON 缺少必要的测评会话字段')
  }

  return {
    ...session,
    results: session.results.map(result => ({
      ...result,
      singleConcurrency: normalizeAggregatedMetrics(result.singleConcurrency),
      concurrencyResults: result.concurrencyResults.map(concurrencyResult => ({
        ...concurrencyResult,
        metrics: normalizeAggregatedMetrics(concurrencyResult.metrics),
      })),
      rawResults: result.rawResults.map(raw => ({
        ...raw,
        requestEnd: raw.requestEnd ?? raw.tokenTimestamps.at(-1) ?? raw.requestStart,
      })),
    })),
  }
}

function normalizeAggregatedMetrics<T extends { ttft: StatsSummary; tps: StatsSummary; itl: StatsSummary; e2eLatency: StatsSummary }>(
  metrics: T
): T {
  return {
    ...metrics,
    ttft: normalizeStats(metrics.ttft),
    tps: normalizeStats(metrics.tps),
    itl: normalizeStats(metrics.itl),
    e2eLatency: normalizeStats(metrics.e2eLatency),
  }
}

function normalizeStats(stats: StatsSummary & { std_dev?: number }): StatsSummary {
  return {
    ...stats,
    stdDev: stats.stdDev ?? stats.std_dev ?? 0,
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}
