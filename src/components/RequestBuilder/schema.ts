import { z } from 'zod'

export const LIMITS = {
  concurrency: { min: 1, max: 500 },
  totalRequests: { min: 1, max: 10000 },
} as const

export const HTTP_METHODS = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'] as const

export const requestSchema = z.object({
  url: z.string().url('Введите валидный URL'),
  method: z.enum(HTTP_METHODS),
  headers: z.array(
    z.object({
      key: z.string(),
      value: z.string(),
    }),
  ),
  body: z.string().optional(),
  concurrency: z.number().min(LIMITS.concurrency.min).max(LIMITS.concurrency.max),
  totalRequests: z.number().min(LIMITS.totalRequests.min).max(LIMITS.totalRequests.max),
})

export type RequestFormData = z.infer<typeof requestSchema>
