//TransactionsTable.jsx
import { useState } from 'react'
import { createPortal } from 'react-dom'
import { formatCurrency } from '../utils/formatCurrency'

// Helper: Định dạng ngày hiển thị VN
const dayFormatter = new Intl.DateTimeFormat('vi-VN', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
})

const formatDayLabel = (dateValue) => {
  if (!dateValue) return 'Không rõ ngày'
  const parsedDate = new Date(dateValue)
  return Number.isNaN(parsedDate.getTime()) ? 'Không rõ ngày' : dayFormatter.format(parsedDate)
}

const groupTransactionsByDay = (items) => {
  const dayMap = new Map()
  items.forEach((item) => {
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
    dayGroup.items.push(item)
  })

  return Array.from(dayMap.values())
    .sort((a, b) => new Date(b.key) - new Date(a.key))
    .map(group => ({
      ...group,
      items: group.items.sort((a, b) => (b.id || 0) - (a.id || 0))
    }))
}

export default function TransactionsSidebar({
  listLoading,
  listError,
  listNotice,
  transactions,
  liveDraftTransaction,
  onReload,
}) {
  const [selectedDayModal, setSelectedDayModal] = useState(null)

  const dayGroupedTransactions = groupTransactionsByDay(
    liveDraftTransaction ? [liveDraftTransaction, ...transactions] : transactions
  )

  const totalAmount = transactions.reduce(
    (sum, item) => sum + Number(item.amount || 0),
    0
  )

  return (
    <aside className="app-sidebar shadow-soft">
      {/* Header của Sidebar */}
      <div className="sidebar-header">
        <h2>Lịch sử</h2>
        <button 
          type="button" 
          className="btn-reload-mini" 
          onClick={onReload} 
          disabled={listLoading}
          title="Làm mới"
        >
          {listLoading ? <span className="spinner-sm"></span> : '🔄'}
        </button>
      </div>

      {/* Thông báo lỗi/thành công */}
      {listError && <div className="alert-mini message error">{listError}</div>}
      {listNotice && <div className="alert-mini message success">{listNotice}</div>}

      {/* Banner tóm tắt nhỏ gọn */}
      <div className="sidebar-summary">
        <div className="summary-box">
          <small>Tổng chi hiển thị</small>
          <div className="amount-highlight text-danger">{formatCurrency(totalAmount)}</div>
        </div>
      </div>

      {/* Danh sách cuộn bên trong sidebar */}
      <div className="sidebar-content scrollbar-thin">
        {!listLoading && !listError && transactions.length === 0 ? (
          <div className="empty-sidebar">
             <div className="empty-icon" style={{ fontSize: '1.5rem' }}>📂</div>
             <p>Chưa có dữ liệu</p>
          </div>
        ) : (
          dayGroupedTransactions.map((dayGroup) => (
            <div 
              className="day-item-mini" 
              key={dayGroup.key}
              onClick={() => setSelectedDayModal(dayGroup.key)}
            >
              <div className="day-info">
                <span className="day-label">{dayGroup.label}</span>
                <span className="day-count">{dayGroup.items.length} giao dịch</span>
              </div>
              <div className="day-amount">
                {formatCurrency(dayGroup.totalAmount)}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Giữ nguyên Modal chi tiết qua Portal để không bị gò bó trong Sidebar */}
      {selectedDayModal && createPortal(
        <div className="modal-overlay" onClick={() => setSelectedDayModal(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setSelectedDayModal(null)}>&times;</button>
            
            <h3 className="modal-title">
              Ngày {dayGroupedTransactions.find(g => g.key === selectedDayModal)?.label}
            </h3>
            
            <div className="modal-body scrollbar-thin" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
              {dayGroupedTransactions.find(g => g.key === selectedDayModal)?.items.map((item, idx) => (
                <div 
                  key={item.id || idx} 
                  className={`transaction-item-row ${item.isDraft ? 'transaction-row--draft' : ''}`}
                  style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    padding: '12px 0', 
                    borderBottom: '1px solid var(--line)' 
                  }}
                >
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <span style={{ fontSize: '1.2rem' }}>
                      {item.category === 'Ăn uống' ? '🍔' : item.category === 'Di chuyển' ? '🚗' : '💰'}
                    </span>
                    <div className="transaction-title-cell">
                      <strong>{item.title}</strong>
                      <span className="field-hint" style={{ fontSize: '0.75rem' }}>
                        {item.category || 'Khác'}
                        {item.isDraft && <span className="draft-badge" style={{ marginLeft: '8px' }}>Mới</span>}
                      </span>
                    </div>
                  </div>
                  <strong style={{ color: 'var(--text-main)' }}>
                    -{formatCurrency(Number(item.amount || 0))}
                  </strong>
                </div>
              ))}
            </div>

            <div className="modal-footer" style={{ borderTop: '2px solid var(--line)', paddingTop: '1rem' }}>
              <div style={{ textAlign: 'right', width: '100%' }}>
                <span className="modal-label">Tổng cộng</span>
                <div className="modal-value-large">
                  {formatCurrency(dayGroupedTransactions.find(g => g.key === selectedDayModal)?.totalAmount || 0)}
                </div>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </aside>
  )
}