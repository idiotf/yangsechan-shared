import type { UserID } from '../../types'

interface CustomRoom {
  users: Set<UserID>
  words: Map<UserID, string>
  doneUsers: Set<UserID>
  disconnectedUsers: Set<UserID>
  maxPlayers: number
}

const roomsMap = new Map<string, CustomRoom>()

export function joinTo(userId: UserID, roomId: string) {
  const room = roomsMap.get(roomId)
  if (
    !room ||
    room.users.size >= room.maxPlayers || // 최대 인원수 초과 방지
    room.users.has(userId) // 중복 접속 방지
  ) return false

  room.users.add(userId)
  return true
}
