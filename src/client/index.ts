import { io } from 'socket.io-client'
import type { Client, UserID } from '../types'

interface Query {
  nickname: string
  session?: string
  quickMatchRoom?: string
}

export class Connection {
  socket: Client
  on
  off
  once

  constructor(nickname: string, customRoom?: string) {
    const query: Query = {
      nickname,
    }

    const session = sessionStorage.getItem('yangsechan-session')
    if (session) query.session = session

    if (customRoom) this.socket = io({ query })
    else {
      // reconnect 시 quickMatchRoom 같이 전송 예정
      this.socket = io({ query })
      this.socket.on('quickMatch', room => query.quickMatchRoom = room)
    }

    const socket = this.socket
    socket.on('session', session => {
      sessionStorage.setItem('yangsechan-session', session)
      query.session = session
    })

    this.on = socket.on.bind(socket)
    this.off = socket.off.bind(socket)
    this.once = socket.once.bind(socket)
  }

  updateNickname(nickname: string) {
    this.socket.emit('nickname', nickname)
  }

  chat(msg: string) {
    this.socket.emit('chat', msg)
  }

  updateWord(user: UserID, word: string) {
    this.socket.emit('word', user, word)
  }

  guess(word: string) {
    this.socket.emit('guess', word)
  }

  leave() {
    this.socket.emit('leave')
  }
}
