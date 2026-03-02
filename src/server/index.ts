import { Server } from 'socket.io'
import { users } from './users'
import { rooms } from './rooms'
import type { Client2Server, Server2Client, SocketData } from '../types'

export function createServer(...args: ConstructorParameters<typeof Server>) {
  const io = new Server<Client2Server, Server2Client, {}, SocketData>(...args)

  io.use(users)
  io.use(rooms)

  io.on('connect', socket => {
    const data = socket.data

    socket.on('chat', msg => {
      io.to([...socket.rooms]).emit('chat', data.id, msg)
    })

    socket.on('word', (user, word) => {
      // 자기 자신의 제시어 설정은 금지
      if (data.id == user) return

      for (const anotherSocket of io.sockets.sockets.values()) {
        if (anotherSocket.data.id != user) continue

        // 자기 자신을 **제외한** 유저에게 제시어 전달
        anotherSocket.to([...socket.rooms]).emit('word', user, word)
        break
      }
    })

    io.to([...socket.rooms]).emit('nickname', data.id, data.nickname)
  })

  return io
}
