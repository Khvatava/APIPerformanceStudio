import { z } from 'zod'

export const LIMITS = {
  concurrency: { min: 1, max: 500 },
  totalRequests: { min: 1, max: 10000 },
} as const

export const HTTP_METHODS = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'] as const

export const requestSchema = z
  .object({
    url: z.string().url('Введите валидный URL'),
    method: z.enum(HTTP_METHODS),
    headers: z.array(
      z.object({
        key: z.string(),
        value: z.string(),
      }),
    ),
    body: z.string().optional(),
    bodyIsJson: z.boolean(),
    concurrency: z.number().min(LIMITS.concurrency.min).max(LIMITS.concurrency.max),
    totalRequests: z.number().min(LIMITS.totalRequests.min).max(LIMITS.totalRequests.max),
  })
  .superRefine((data, ctx) => {
    if (!data.bodyIsJson) return
    const trimmed = data.body?.trim()
    if (!trimmed) return
    try {
      JSON.parse(trimmed)
    } catch {
      ctx.addIssue({
        code: 'custom',
        path: ['body'],
        message: 'Невалидный JSON',
      })
    }
  })

export type RequestFormData = z.infer<typeof requestSchema>
