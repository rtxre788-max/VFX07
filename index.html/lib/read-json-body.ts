export class RequestBodyTooLargeError extends Error {}

export async function readJsonBody(request: Request, maxBytes: number): Promise<unknown> {
  const reader = request.body?.getReader()
  if (!reader) throw new SyntaxError('Request body is empty.')

  const chunks: Uint8Array[] = []
  let totalBytes = 0

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      totalBytes += value.byteLength
      if (totalBytes > maxBytes) {
        await reader.cancel()
        throw new RequestBodyTooLargeError('Request body is too large.')
      }
      chunks.push(value)
    }
  } finally {
    reader.releaseLock()
  }

  const body = new Uint8Array(totalBytes)
  let offset = 0
  for (const chunk of chunks) {
    body.set(chunk, offset)
    offset += chunk.byteLength
  }

  return JSON.parse(new TextDecoder().decode(body)) as unknown
}
