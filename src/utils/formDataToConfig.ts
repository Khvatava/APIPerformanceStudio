// src/utils/formDataToConfig.ts
import type { RequestFormData } from '../components/RequestBuilder/schema'
import type { HttpMethod, RequestConfig } from '../types'

// Методы, у которых тело запроса разрешено HTTP-спецификацией.
// GET и DELETE с body вызывают TypeError в fetch.
const METHODS_WITH_BODY: ReadonlyArray<HttpMethod> = ['POST', 'PUT', 'PATCH']

/**
 * Превращает данные формы (headers как массив пар) в RequestConfig (headers как Record).
 *
 * Зачем: форма хранит [{key, value}, ...] для UI (можно добавлять/удалять строки,
 * иметь одновременно несколько пустых ключей). А fetch принимает Record<string, string>.
 *
 * Пустые ключи отбрасываем — юзер мог добавить строку и не заполнить.
 * Если ключ повторяется, побеждает последний (поведение Object.fromEntries).
 *
 * Body выкидываем для GET/DELETE и для пустой строки —
 * иначе fetch падает с "Request with GET/HEAD method cannot have body".
 */
export function formDataToConfig(data: RequestFormData): RequestConfig {
  const allowsBody = METHODS_WITH_BODY.includes(data.method)
  const trimmedBody = data.body?.trim()

  // bodyIsJson — поле формы, не часть RequestConfig. Деструктурируем, чтобы оно
  // не утекло в worker через ...rest.
  const { bodyIsJson: _bodyIsJson, headers, ...rest } = data

  return {
    ...rest,
    // undefined → поле просто не уйдёт в fetch (вместо пустой строки '')
    body: allowsBody && trimmedBody ? data.body : undefined,
    headers: Object.fromEntries(
      headers.filter(h => h.key.trim() !== '').map(h => [h.key, h.value]),
    ),
  }
}
