import { handleDisconnect, joinQuick, reJoinQuick } from './quick-match'
import { joinTo } from './custom-rooms'
import type { ExtendedError } from 'socket.io'
import type { Socket } from '../../types'

export async function rooms(socket: Socket, next: (err?: ExtendedError) => void) {
  const query = socket.handshake.query, data = socket.data

  if (typeof query.customRoom == 'string') {
    const joined = joinTo(data.id, query.customRoom)
    if (joined) {
      await socket.join(`customRoomPlay-${query.customRoom}`)
      return next()
    } else {
      return next(Error('방에 들어갈 수가 없어요ㅠㅠ'))
    }
  }

  if (typeof query.quickJoinRoom == 'string') {
    const joined = reJoinQuick(data.id, query.quickJoinRoom)
    if (joined) {
      await socket.join(`quickMatchPlay-${query.quickJoinRoom}`)
      return next()
    } else {
      return next(Error('방에 들어갈 수가 없어요ㅠㅠ'))
    }
  }

  const controller = new AbortController
  socket.on('disconnect', reason => {
    controller.abort(reason)
    for (const room of socket.rooms.keys()) handleDisconnect(data.id, room)
  })

  const quickMatchRoom = await joinQuick(data.id, controller.signal)
  socket.emit('quickMatch', quickMatchRoom)
  await socket.join(`quickMatchPlay-${quickMatchRoom}`)

  return next()
}
