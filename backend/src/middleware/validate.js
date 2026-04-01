import { AppError } from './errorHandler.js'

export function validate(schema, target = 'body') {
  return (req, _res, next) => {
    const result = schema.safeParse(req[target])
    if (!result.success) {
      return next(new AppError('Validation failed', 422, result.error.flatten()))
    }

    req[target] = result.data
    next()
  }
}
