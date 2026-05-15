import { useMemo, useState } from 'react'
import { formatCurrency } from '../utils/formatCurrency'

const dayFormatter = new Intl.DateTimeFormat('vi-VN', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
})

const parseDateValue = (dateValue) => {
  const parsedDate = new Date(dateValue)
  return Number.isNaN(parsedDate.getTime()) ? 0 : parsedDate.getTime()
}

const formatDayLabel = (dateValue) => {
  if (!dateValue) return 'Không rõ ngày'
  const parsedDate = new Date(dateValue)
  return Number.isNaN(parsedDate.getTime()) ? 'Không rõ ngày' : dayFormatter.format(parsedDate)
}

const getTransactionKey = (item, index) => {
  if (item?.id !== undefined && item?.id !== null) {
    return String(item.id)
  }

  return `${item?.date || 'unknown'}-${item?.title || 'untitled'}-${index}`
}

const getCategoryIcon = (category) => {
  switch (category) {
    case 'Ăn uống':
      return '🍜'
    case 'Di chuyển':
      return '🚕'
    case 'Mua sắm':
      return '🛍️'
    case 'Giải trí':
      return '🎬'
    case 'Hóa đơn':
      return '🧾'
    default:
      return '💳'
  }
}

const groupTransactionsByDay = (items) => {
  const dayMap = new Map()

  items.forEach((item, index) => {
    const dayKey = item.date || 'unknown-day'

    if (!dayMap.has(dayKey)) {
      dayMap.set(dayKey, {
        key: dayKey,
        label: formatDayLabel(item.date),
        totalAmount: 0,
        items: [],
      })
    }

    const dayGroup = dayMap.get(dayKey)
    dayGroup.totalAmount += Number(item.amount || 0)
    dayGroup.items.push({
      ...item,
      internalKey: getTransactionKey(item, index),
    })
  })

  return Array.from(dayMap.values())
    .sort((a, b) => parseDateValue(b.key) - parseDateValue(a.key))
    .map((group) => ({
      ...group,
      items: group.items.sort((a, b) => {
        const idA = Number(a.id || 0)
        const idB = Number(b.id || 0)
        return idB - idA
      }),
    }))
}

const buildStatusLabel = (transaction) => {
  return transaction?.isDraft ? 'Mới thêm' : 'Đã lưu'
}

export default function TransactionsTable({
  listLoading,
  listError,
  listNotice,
  transactions = [],
  liveDraftTransaction,
  onReload,
}) {
  const [selectedDayKey, setSelectedDayKey] = useState(null)
  const [selectedTransactionKey, setSelectedTransactionKey] = useState(null)

  const displayedTransactions = useMemo(() => {
    return liveDraftTransaction ? [liveDraftTransaction, ...transactions] : transactions
  }, [liveDraftTransaction, transactions])

  const dayGroupedTransactions = useMemo(() => {
    return groupTransactionsByDay(displayedTransactions)
  }, [displayedTransactions])

  const totalAmount = useMemo(() => {
    return displayedTransactions.reduce((sum, item) => sum + Number(item.amount || 0), 0)
  }, [displayedTransactions])

  const activeDayKey = useMemo(() => {
    const hasSelectedDay = dayGroupedTransactions.some((group) => group.key === selectedDayKey)
    return hasSelectedDay ? selectedDayKey : null
  }, [dayGroupedTransactions, selectedDayKey])

  const selectedDayGroup = useMemo(() => {
    return dayGroupedTransactions.find((group) => group.key === activeDayKey) || null
  }, [activeDayKey, dayGroupedTransactions])

  const activeTransactionKey = useMemo(() => {
    if (!selectedDayGroup || selectedDayGroup.items.length === 0) return null

    const hasSelectedTransaction = selectedDayGroup.items.some(
      (item) => item.internalKey === selectedTransactionKey
    )

    return hasSelectedTransaction
      ? selectedTransactionKey
      : selectedDayGroup.items[0].internalKey
  }, [selectedDayGroup, selectedTransactionKey])

  const selectedTransaction = useMemo(() => {
    if (!selectedDayGroup) return null
    return (
      selectedDayGroup.items.find((item) => item.internalKey === activeTransactionKey) || null
    )
  }, [activeTransactionKey, selectedDayGroup])

  return (
    <div className="admin-panel">
      <style>{`
        .transactions-table-layout {
          display: grid;
          grid-template-columns: minmax(280px, 340px) minmax(0, 1fr);
          gap: 20px;
          align-items: start;
        }

        .transactions-day-list,
        .transactions-detail-panel {
          background: rgba(15, 118, 110, 0.03);
          border: 1px solid var(--line);
          border-radius: 16px;
          padding: 18px;
        }

        .transactions-day-button {
          width: 100%;
          border: 1px solid var(--line);
          border-radius: 14px;
          background: var(--panel-bg);
          color: var(--text-main);
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          padding: 16px 18px;
          cursor: pointer;
          transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
          text-align: left;
        }

        .transactions-day-button:hover {
          transform: translateY(-2px);
          border-color: var(--accent);
          box-shadow: 0 10px 24px rgba(15, 118, 110, 0.08);
        }

        .transactions-day-button.active {
          border-color: var(--accent);
          background: linear-gradient(135deg, rgba(15, 118, 110, 0.12), rgba(45, 212, 191, 0.05));
          box-shadow: 0 14px 28px rgba(15, 118, 110, 0.12);
        }

        .transaction-chip-list {
          display: grid;
          gap: 12px;
        }

        .transaction-chip {
          width: 100%;
          padding: 14px 16px;
          border-radius: 14px;
          border: 1px solid var(--line);
          background: var(--panel-bg);
          color: var(--text-main);
          cursor: pointer;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 14px;
          text-align: left;
          transition: transform 0.2s ease, border-color 0.2s ease, background 0.2s ease;
        }

        .transaction-chip:hover {
          transform: translateY(-1px);
          border-color: var(--accent);
        }

        .transaction-chip.active {
          border-color: var(--accent);
          background: rgba(15, 118, 110, 0.08);
        }

        .transaction-form-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 14px;
        }

        .transaction-form-field {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .transaction-form-field.full {
          grid-column: 1 / -1;
        }

        .transaction-form-label {
          font-size: 0.82rem;
          font-weight: 700;
          color: var(--muted);
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }

        .transaction-form-value {
          min-height: 46px;
          padding: 12px 14px;
          border-radius: 12px;
          border: 1px solid var(--line);
          background: var(--input-bg);
          color: var(--input-text);
          display: flex;
          align-items: center;
          font-weight: 600;
          box-sizing: border-box;
        }

        .transaction-summary-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 14px;
        }

        .transaction-summary-card {
          border: 1px solid var(--line);
          background: var(--panel-bg);
          border-radius: 14px;
          padding: 14px 16px;
        }

        .transaction-summary-card span {
          display: block;
          color: var(--muted);
          font-size: 0.8rem;
          text-transform: uppercase;
          font-weight: 700;
          margin-bottom: 6px;
          letter-spacing: 0.04em;
        }

        .transaction-summary-card strong {
          color: var(--text-main);
          font-size: 1.05rem;
        }

        @media (max-width: 960px) {
          .transactions-table-layout {
            grid-template-columns: 1fr;
          }

          .transaction-summary-grid,
          .transaction-form-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div
        className="panel-header"
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
      >
        <h2>Lịch sử giao dịch</h2>
        <button
          type="button"
          className="admin-btn"
          onClick={onReload}
          disabled={listLoading}
          style={{
            padding: '8px 16px',
            fontSize: '0.9rem',
            display: 'flex',
            gap: '8px',
            alignItems: 'center',
          }}
        >
          {listLoading ? <span className="spinner-sm">⏳</span> : '🔄'} Làm mới
        </button>
      </div>

      <div className="panel-body">
        {listError && <p className="message error">{listError}</p>}
        {listNotice && <p className="message success">{listNotice}</p>}

        <div
          style={{
            marginBottom: '20px',
            padding: '12px 20px',
            background: 'rgba(45, 212, 191, 0.08)',
            borderRadius: '8px',
            border: '1px dashed var(--accent)',
            display: 'inline-block',
          }}
        >
          <span
            style={{
              fontSize: '0.85rem',
              color: 'var(--muted)',
              display: 'block',
              textTransform: 'uppercase',
              fontWeight: 'bold',
            }}
          >
            Tổng chi hiển thị
          </span>
          <strong style={{ fontSize: '1.4rem', color: 'var(--accent)' }}>
            {formatCurrency(totalAmount)}
          </strong>
        </div>

        {listLoading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--muted)' }}>
            <div style={{ fontSize: '2rem', marginBottom: '10px', opacity: 0.5 }}>...</div>
            <p>Dang tai du lieu giao dich tu Supabase.</p>
          </div>
        ) : !listError && displayedTransactions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--muted)' }}>
            <div style={{ fontSize: '3rem', marginBottom: '10px', opacity: 0.5 }}>📂</div>
            <p>Chưa có dữ liệu giao dịch nào.</p>
          </div>
        ) : (
          <div className="transactions-table-layout">
            <section className="transactions-day-list">
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '14px',
                }}
              >
                <div>
                  <strong style={{ display: 'block', fontSize: '1rem' }}>Danh sách ngày</strong>
                  <span style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>
                    Nhấn vào một ngày để mở form chi tiết giao dịch
                  </span>
                </div>
              </div>

              <div style={{ display: 'grid', gap: '12px' }}>
                {dayGroupedTransactions.map((dayGroup) => (
                  <button
                    key={dayGroup.key}
                    type="button"
                    className={`transactions-day-button ${
                      activeDayKey === dayGroup.key ? 'active' : ''
                    }`}
                    onClick={() => {
                      setSelectedDayKey(dayGroup.key)
                      setSelectedTransactionKey(dayGroup.items[0]?.internalKey ?? null)
                    }}
                  >
                    <div>
                      <strong
                        style={{
                          display: 'block',
                          color: 'var(--text-main)',
                          fontSize: '1.05rem',
                          marginBottom: '6px',
                        }}
                      >
                        {dayGroup.label}
                      </strong>
                      <span
                        style={{
                          fontSize: '0.82rem',
                          color: 'var(--muted)',
                          background: 'var(--line)',
                          padding: '4px 8px',
                          borderRadius: '999px',
                        }}
                      >
                        {dayGroup.items.length} giao dịch
                      </span>
                    </div>
                    <strong style={{ color: 'var(--accent)', fontSize: '1.15rem' }}>
                      {formatCurrency(dayGroup.totalAmount)}
                    </strong>
                  </button>
                ))}
              </div>
            </section>

            <section className="transactions-detail-panel">
              {selectedDayGroup ? (
                <>
                  <div style={{ marginBottom: '18px' }}>
                    <h3 style={{ margin: 0, fontSize: '1.25rem' }}>
                      Form chi tiết ngày {selectedDayGroup.label}
                    </h3>
                    <p style={{ margin: '6px 0 0', color: 'var(--muted)' }}>
                      Danh sách đang hiển thị theo bộ lọc hiện tại. Chọn từng giao dịch để xem
                      đầy đủ thông tin.
                    </p>
                  </div>

                  <div className="transaction-summary-grid" style={{ marginBottom: '18px' }}>
                    <div className="transaction-summary-card">
                      <span>Ngày giao dịch</span>
                      <strong>{selectedDayGroup.label}</strong>
                    </div>
                    <div className="transaction-summary-card">
                      <span>Số giao dịch</span>
                      <strong>{selectedDayGroup.items.length} mục</strong>
                    </div>
                    <div className="transaction-summary-card">
                      <span>Tổng chi</span>
                      <strong style={{ color: 'var(--accent)' }}>
                        {formatCurrency(selectedDayGroup.totalAmount)}
                      </strong>
                    </div>
                  </div>

                  <div style={{ marginBottom: '18px' }}>
                    <strong style={{ display: 'block', marginBottom: '10px' }}>
                      Giao dịch trong ngày
                    </strong>
                    <div className="transaction-chip-list">
                      {selectedDayGroup.items.map((item) => (
                        <button
                          key={item.internalKey}
                          type="button"
                          className={`transaction-chip ${
                            activeTransactionKey === item.internalKey ? 'active' : ''
                          }`}
                          onClick={() => setSelectedTransactionKey(item.internalKey)}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <span
                              style={{
                                width: '42px',
                                height: '42px',
                                borderRadius: '12px',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                background: 'rgba(15, 118, 110, 0.08)',
                                fontSize: '1.25rem',
                              }}
                            >
                              {getCategoryIcon(item.category)}
                            </span>
                            <div>
                              <strong
                                style={{
                                  display: 'block',
                                  color: 'var(--text-main)',
                                  marginBottom: '4px',
                                }}
                              >
                                {item.title || 'Giao dịch chưa có tên'}
                              </strong>
                              <span style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>
                                {item.category || 'Khác'} • {buildStatusLabel(item)}
                              </span>
                            </div>
                          </div>
                          <strong style={{ color: 'var(--text-main)' }}>
                            {formatCurrency(Number(item.amount || 0))}
                          </strong>
                        </button>
                      ))}
                    </div>
                  </div>

                  {selectedTransaction ? (
                    <div>
                      <strong style={{ display: 'block', marginBottom: '12px' }}>
                        Phiếu chi tiết giao dịch
                      </strong>
                      <div className="transaction-form-grid">
                        <div className="transaction-form-field full">
                          <span className="transaction-form-label">Tên giao dịch</span>
                          <div className="transaction-form-value">
                            {selectedTransaction.title || 'Chưa có tiêu đề'}
                          </div>
                        </div>

                        <div className="transaction-form-field">
                          <span className="transaction-form-label">Danh mục</span>
                          <div className="transaction-form-value">
                            {selectedTransaction.category || 'Khác'}
                          </div>
                        </div>

                        <div className="transaction-form-field">
                          <span className="transaction-form-label">Trạng thái</span>
                          <div className="transaction-form-value">
                            {buildStatusLabel(selectedTransaction)}
                          </div>
                        </div>

                        <div className="transaction-form-field">
                          <span className="transaction-form-label">Ngày giao dịch</span>
                          <div className="transaction-form-value">
                            {formatDayLabel(selectedTransaction.date)}
                          </div>
                        </div>

                        <div className="transaction-form-field">
                          <span className="transaction-form-label">Số tiền</span>
                          <div
                            className="transaction-form-value"
                            style={{ color: 'var(--accent)', fontSize: '1.05rem' }}
                          >
                            {formatCurrency(Number(selectedTransaction.amount || 0))}
                          </div>
                        </div>

                        <div className="transaction-form-field full">
                          <span className="transaction-form-label">Mã giao dịch</span>
                          <div className="transaction-form-value">
                            {selectedTransaction.id ?? 'Chưa đồng bộ lên hệ thống'}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : null}
                </>
              ) : (
                <div
                  style={{
                    color: 'var(--muted)',
                    minHeight: '240px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center',
                    padding: '24px',
                  }}
                >
                  Nhấn vào một mục ngày giao dịch ở cột bên trái để hiển thị form chi tiết.
                </div>
              )}
            </section>
          </div>
        )}
      </div>
    </div>
  )
}
