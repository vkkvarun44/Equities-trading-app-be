import type { Request, Response, NextFunction } from 'express'
import { alpacaRequestContext } from '../integrations/alpaca/context.js'

export function alpacaTokenContext(req: Request, _res: Response, next: NextFunction): void {
  const header = req.headers['x-alpaca-token']
  const accessToken =
    typeof header === 'string' ? header : Array.isArray(header) ? header[0] : undefined

  alpacaRequestContext.run({ accessToken }, () => next())
}
