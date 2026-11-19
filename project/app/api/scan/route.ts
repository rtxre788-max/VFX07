import { analyzeLink } from '@/lib/link-scan'
import { readJsonBody, RequestBodyTooLargeError } from '@/lib/read-json-body'

const headers = { 'Cache-Control': 'no-store' }

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export async function POST(request: Request) {
  try {
    const body = await readJsonBody(request, 8_192)
    if (!isRecord(body) || typeof body.url !== 'string') {
      return Response.json({ error: 'Введите адрес сайта.' }, { status: 400, headers })
    }

    try {
      return Response.json(analyzeLink(body.url), { headers })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Не удалось проверить адрес.'
      return Response.json({ error: message }, { status: 400, headers })
    }
  } catch (error) {
    if (error instanceof RequestBodyTooLargeError) {
      return Response.json({ error: 'Запрос слишком большой.' }, { status: 413, headers })
    }
    return Response.json({ error: 'Некорректный запрос.' }, { status: 400, headers })
  }
}
