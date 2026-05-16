import crypto from 'crypto'

export function verifyEcartPaySignature(
  timestamp:  string,
  webhookId:  string,
  data:       unknown,
  secret:     string,
  received:   string
): boolean {
  const base     = `${timestamp}.${webhookId}.${JSON.stringify(data)}`
  const expected = `SHA256=${crypto.createHmac('sha256', secret).update(base).digest('hex')}`
  return expected === received
}
