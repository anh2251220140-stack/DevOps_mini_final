export const isInFilterRange = (transactionDate, filterType, range) => {
  if (!transactionDate) {
    return false
  }

  if (filterType === 'all') {
    return true
  }

  if (filterType === 'day') {
    return transactionDate === range.day
  }

  if (filterType === 'month') {
    return transactionDate.startsWith(range.month)
  }

  if (!range.from || !range.to) {
    return false
  }

  return transactionDate >= range.from && transactionDate <= range.to
}
