import type { RequestFormData } from '../components/RequestBuilder/schema'
import type { HttpMethod, RequestConfig } from '../types'

const METHODS_WITH_BODY: ReadonlyArray<HttpMethod> = ['POST', 'PUT', 'PATCH']

export function formDataToConfig(data: RequestFormData): RequestConfig {
  const allowsBody = METHODS_WITH_BODY.includes(data.method)
  const trimmedBody = data.body?.trim()

  const { bodyIsJson: _bodyIsJson, headers, ...rest } = data

  return {
    ...rest,
    body: allowsBody && trimmedBody ? data.body : undefined,
    headers: Object.fromEntries(
      headers.filter(h => h.key.trim() !== '').map(h => [h.key, h.value]),
    ),
  }
}
