import type { Request, Response, NextFunction } from 'express'
import { type ZodSchema, ZodError } from 'zod'
import { ValidationError } from '../utils/errors.js'

type RequestPart = 'body' | 'query' | 'params'

function applyParsed(req: Request, part: RequestPart, parsed: Record<string, unknown>): void {
  if (part === 'body') {
    req.body = parsed
    return
  }

  const target = req[part] as Record<string, unknown>
  for (const key of Object.keys(target)) {
    delete target[key]
  }
  Object.assign(target, parsed)
}

export function validate(schema: ZodSchema, part: RequestPart = 'body') {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      const parsed = schema.parse(req[part]) as Record<string, unknown>
      applyParsed(req, part, parsed)
      next()
    } catch (error) {
      if (error instanceof ZodError) {
        const errors: Record<string, string[]> = {}
        for (const issue of error.issues) {
          const path = issue.path.join('.') || 'root'
          if (!errors[path]) errors[path] = []
          errors[path].push(issue.message)
        }
        next(new ValidationError('Validation failed', errors))
        return
      }
      next(error)
    }
  }
}
