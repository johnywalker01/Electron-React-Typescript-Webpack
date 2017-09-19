declare const Buffer: any

export function encode(decoded: string) {
  return new Buffer(decoded).toString('base64')
}

export function decode(encoded: string) {
  return new Buffer(encoded, 'base64').toString('ascii')
}
