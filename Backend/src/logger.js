const timestamp = () => new Date().toISOString()

export const logInfo = (message, meta = {}) => {
  console.log(
    JSON.stringify({
      level: 'info',
      message,
      timestamp: timestamp(),
      ...meta,
    }),
  )
}

export const logError = (message, error, meta = {}) => {
  console.error(
    JSON.stringify({
      level: 'error',
      message,
      timestamp: timestamp(),
      details: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      ...meta,
    }),
  )
}
