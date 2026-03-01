import { createSession, getUserNickname, handleDisconnect, queryUserId, updateUserNickname } from './session'
import type { ExtendedError } from 'socket.io'
import type { Socket } from '../../types'

export function users(socket: Socket, next: (err?: ExtendedError) => void) {
  let currentSession: string
  const query = socket.handshake.query, data = socket.data

  const io = socket.nsp.server

  // 유저가 나가면 disconnect 했음을 알리기
  socket.on('disconnect', () => {
    handleDisconnect(currentSession)
    io.to([...socket.rooms]).emit('disconnectedUser', data.id)
  })

  // 닉네임 변경 handler
  socket.on('nickname', nickname => {
    updateUserNickname(data.id, nickname)
    data.nickname = nickname
    io.to([...socket.rooms]).emit('nickname', data.id, nickname)
  })

  // 플레이어 나감 handler
  socket.on('leave', () => {
    socket.disconnect()
    io.to([...socket.rooms]).emit('leave', data.id)
  })

  // 클라이언트 세션이 올바른 세션인지 확인
  // 만약 올바르다면 이걸 사용, 아니면 새로운 세션 발급
  if (typeof query.session == 'string') {
    const id = queryUserId(query.session)
    const nickname = id && getUserNickname(id)
    if (nickname) {
      data.id = id
      data.nickname = nickname
      currentSession = query.session
      return next()
    }
  }

  // 닉네임이 없는 경우 error
  if (typeof query.nickname != 'string') return next(Error('닉네임이 업잖아여!'))
  data.nickname = query.nickname

  // 새로운 세션 발급 후 클라이언트 측에도 전달
  const [session, id] = createSession(data.nickname)
  currentSession = session
  data.id = id
  socket.emit('session', session)

  return next()
}
