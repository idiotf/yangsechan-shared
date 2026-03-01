import { io } from 'socket.io-client'
import type { Client, UserID } from '../types'

interface Query {
  nickname: string
  session?: string
  quickMatchRoom?: string
}

export class Connection {
  socket: Client

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
    })
  }

  onUpdateNickname(cb: (user: UserID, nickname: string) => void) {
    this.socket.on('nickname', cb)
  }

  onChat(cb: (user: UserID, msg: string) => void) {
    this.socket.on('chat', cb)
  }

  onUpdateWord(cb: (user: UserID, word: string) => void) {
    this.socket.on('word', cb)
  }

  onGuess(cb: (user: UserID, word: string, isCorrect: boolean) => void) {
    this.socket.on('guess', cb)
  }

  onLeave(cb: (user: UserID) => void) {
    this.socket.on('leave', cb)
  }

  onDisconnected(cb: (user: UserID) => void) {
    this.socket.on('disconnectedUser', cb)
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
