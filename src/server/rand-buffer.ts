const randomBase64 = (bytes: number) =>
  crypto.getRandomValues(Buffer.allocUnsafe(bytes)).toString('base64url')

export default randomBase64
