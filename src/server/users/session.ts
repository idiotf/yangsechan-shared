import randomBase64 from '../rand-buffer'
import type { UserID } from '../../types'

const sessionMap = new Map<string, UserID>()
const timeoutMap = new Map<string, ReturnType<typeof setTimeout>>()

const nicknameMap = new Map<UserID, string>()

function deleteUser(id: UserID) {
  nicknameMap.delete(id)
}

function deleteSession(session: string) {
  sessionMap.delete(session)
  timeoutMap.delete(session)
}

export function handleDisconnect(session: string) {
  clearTimeout(timeoutMap.get(session))
  timeoutMap.set(session, setTimeout(() => {
    const id = sessionMap.get(session)
    if (id) deleteUser(id)

    deleteSession(session)
  }, 3 * 60 * 1000))
}

export function createSession(nickname: string) {
  let session, id

  do session = randomBase64(32)
  while (sessionMap.has(session))

  do id = randomBase64(32)
  while (nicknameMap.has(session))

  sessionMap.set(session, id)
  nicknameMap.set(id, nickname)

  return [session, id] as const
}

export function queryUserId(session: string) {
  clearTimeout(timeoutMap.get(session))
  timeoutMap.delete(session)
  return sessionMap.get(session)
}

export function getUserNickname(id: UserID) {
  return nicknameMap.get(id)
}

export function updateUserNickname(id: UserID, nickname: string) {
  nicknameMap.set(id, nickname)
}
