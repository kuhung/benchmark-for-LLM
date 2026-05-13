import { openDB, IDBPDatabase } from 'idb'
import { BenchmarkSession } from './benchmark/types'

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
  const session = JSON.parse(json) as BenchmarkSession
  await saveSession(session)
  return session
}
