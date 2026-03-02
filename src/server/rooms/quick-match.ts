import randomBase64 from '../rand-buffer'
import type { UserID } from '../../types'

interface QuickMatchRoom {
  id: string
  users: Set<UserID>
  words: Map<UserID, string>
  doneUsers: Set<UserID>
  disconnectedUsers: Map<UserID, ReturnType<typeof setTimeout>>
}

const roomsMap = new Map<string, QuickMatchRoom>()
const waitingQueue: ((room: QuickMatchRoom) => void)[] = []

const maxPlayers = 5

export async function joinQuick(id: UserID, signal: AbortSignal) {
  if (signal.aborted) throw signal.reason

  // 들어갈 수 있는 방이 존재하면 참가
  for (const [roomId, data] of roomsMap) {
    if (data.users.size < maxPlayers && !data.users.has(id)) {
      data.users.add(id)
      return roomId
    }
  }

  // 들어갈 수 없다면 waitingQueue에 추가
  return new Promise<string>(resolve => {
    function onAbort() {
      waitingQueue.splice(waitingQueue.indexOf(handler), 1)
    }

    function handler(room: QuickMatchRoom) {
      signal.removeEventListener('abort', onAbort)
      room.users.add(id)
      resolve(room.id)
    }

    waitingQueue.push(handler)
    // waitingQueue 인원 수가 꽉 차면 방 생성
    if (waitingQueue.length >= maxPlayers) {
      let id
      do id = randomBase64(32)
      while (roomsMap.has(id))

      const room: QuickMatchRoom = {
        id,
        users: new Set,
        words: new Map,
        doneUsers: new Set,
        disconnectedUsers: new Map,
      }

      for (const resolve of waitingQueue) resolve(room)
      waitingQueue.length = 0
    }

    // 플레이어가 나가면 waitingQueue에서 제거
    signal.addEventListener('abort', onAbort, { once: true })
  })
}

export function handleDisconnect(userId: UserID, roomId: string) {
  const room = roomsMap.get(roomId)
  if (!room) return

  // 3초 동안 disconnect 상태라면 quit
  room.disconnectedUsers.set(userId, setTimeout(() => {
    quit(userId, roomId)
  }, 3000))
}

export function quit(userId: UserID, roomId: string) {
  const room = roomsMap.get(roomId)
  if (!room) return

  room.users.delete(userId)
  room.disconnectedUsers.delete(userId)

  // 인원 수가 모자라므로 게임 초기화
  room.words.clear()
  room.doneUsers.clear()

  // 빈 자리에는 waitingQueue에 대기하던 유저가 참가
  waitingQueue.shift()?.(room)
}

export function reJoinQuick(userId: UserID, roomId: string) {
  const room = roomsMap.get(roomId)
  if (!room) return false

  // disconnectedUsers에 포함된 플레이어인지 확인
  // 무단으로 남의 퀵 매치 방에 들어오는 것과
  // 이미 참가한 방에 중복 접속하는 걸 방지
  const timeout = room.disconnectedUsers.get(userId)
  if (!timeout) return false
  clearTimeout(timeout)

  // 자신을 disconnectedUsers에서 제거하고 users에 추가
  room.users.add(userId)
  room.disconnectedUsers.delete(userId)
  return true
}
