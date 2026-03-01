import type { Socket as SocketIOSocket } from 'socket.io'
import type { Socket as SocketIOClient } from 'socket.io-client'

export type UserID = string

export type Socket = SocketIOSocket<Client2Server, Server2Client, {}, SocketData>
export type Client = SocketIOClient<Server2Client, Client2Server>

export interface Client2Server {
  nickname(nickname: string): void
  leave(): void
  chat(msg: string): void
  /**
   * @param user **자기 자신을 제외한** 유저 id
   */
  word(user: UserID, word: string): void
  guess(word: string): void
}

export interface Server2Client {
  session(session: string): void
  quickMatch(room: string): void
  /**
   * 새 유저 접속 시에도 nickname으로 emit 해야함
   */
  nickname(user: UserID, nickname: string): void
  disconnectedUser(user: UserID): void
  leave(user: UserID): void
  chat(user: UserID, msg: string): void
  /**
   * @param user **자기 자신을 제외한** 유저 id
   */
  word(user: UserID, word: string): void
  guess(user: UserID, word: string, isCorrect: boolean): void
}

export interface SocketData {
  id: UserID
  nickname: string
}
