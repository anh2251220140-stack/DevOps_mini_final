export const defaultForm = {
  title: '',
  amount: '',
  category: '',
  date: new Date().toISOString().slice(0, 10),
}

export const initialTransactions = [
  {
    id: 1,
    title: 'Mua đồ ăn',
    amount: 120000,
    category: 'Ăn uống',
    date: '2026-04-21',
    createdAt: '2026-04-21T08:15:00',
  },
  {
    id: 2,
    title: 'Gửi xe',
    amount: 10000,
    category: 'Di chuyển',
    date: '2026-04-20',
    createdAt: '2026-04-20T18:40:00',
  },
]
