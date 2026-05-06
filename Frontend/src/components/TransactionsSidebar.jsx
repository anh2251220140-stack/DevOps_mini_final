//TransactionsSidebar.jsx
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
  transactions = [],
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
    <div className="admin-panel">
      {/* HEADER BẢNG */}
      <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Lịch sử giao dịch</h2>
        <button 
          type="button" 
          className="admin-btn" 
          onClick={onReload} 
          disabled={listLoading}
          style={{ padding: '8px 16px', fontSize: '0.9rem', display: 'flex', gap: '8px', alignItems: 'center' }}
        >
          {listLoading ? <span className="spinner-sm">⏳</span> : '🔄'} Làm mới
        </button>
      </div>

      {/* NỘI DUNG BẢNG */}
      <div className="panel-body">
        {listError && <p className="message error">{listError}</p>}
        {listNotice && <p className="message success">{listNotice}</p>}

        <div style={{ marginBottom: '20px', padding: '12px 20px', background: 'rgba(45, 212, 191, 0.08)', borderRadius: '8px', border: '1px dashed var(--accent)', display: 'inline-block' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--muted)', display: 'block', textTransform: 'uppercase', fontWeight: 'bold' }}>
            Tổng chi hiển thị
          </span>
          <strong style={{ fontSize: '1.4rem', color: 'var(--accent)' }}>
            {formatCurrency(totalAmount)}
          </strong>
        </div>

        <div className="transactions-list" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {!listLoading && !listError && transactions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--muted)' }}>
               <div style={{ fontSize: '3rem', marginBottom: '10px', opacity: 0.5 }}>📂</div>
               <p>Chưa có dữ liệu giao dịch nào.</p>
            </div>
          ) : (
            dayGroupedTransactions.map((dayGroup) => (
              <div 
                key={dayGroup.key}
                onClick={() => setSelectedDayModal(dayGroup.key)}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '16px 20px',
                  background: 'var(--input-bg)',
                  border: '1px solid var(--line)',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--accent)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--line)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div>
                  <strong style={{ display: 'block', color: 'var(--text-main)', fontSize: '1.1rem', marginBottom: '6px' }}>
                    {dayGroup.label}
                  </strong>
                  <span style={{ fontSize: '0.85rem', color: 'var(--muted)', background: 'var(--line)', padding: '4px 8px', borderRadius: '4px' }}>
                    {dayGroup.items.length} giao dịch
                  </span>
                </div>
                <strong style={{ color: 'var(--accent)', fontSize: '1.3rem' }}>
                  {formatCurrency(dayGroup.totalAmount)}
                </strong>
              </div>
            ))
          )}
        </div>
      </div>

      {/* MODAL CHI TIẾT GIAO DỊCH TRONG NGÀY (Sử dụng Portal của bạn) */}
      {selectedDayModal && createPortal(
        <div className="modal-overlay" onClick={() => setSelectedDayModal(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '550px' }}>
            <button className="modal-close-btn" onClick={() => setSelectedDayModal(null)}>&times;</button>
            
            <h3 className="modal-title">
              Chi tiết ngày {dayGroupedTransactions.find(g => g.key === selectedDayModal)?.label}
            </h3>
            
            <div className="modal-body scrollbar-thin" style={{ maxHeight: '60vh', overflowY: 'auto', paddingRight: '10px' }}>
              {dayGroupedTransactions.find(g => g.key === selectedDayModal)?.items.map((item, idx) => (
                <div 
                  key={item.id || idx} 
                  style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    padding: '15px', 
                    borderBottom: '1px solid var(--line)',
                    background: item.isDraft ? 'rgba(45, 212, 191, 0.08)' : 'transparent',
                    borderRadius: '8px',
                    marginBottom: '6px'
                  }}
                >
                  <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                    <span style={{ 
                      fontSize: '1.5rem', 
                      background: 'var(--line)', 
                      width: '48px', 
                      height: '48px', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      borderRadius: '12px' 
                    }}>
                      {item.category === 'Ăn uống' ? '🍔' : item.category === 'Di chuyển' ? '🚗' : item.category === 'Mua sắm' ? '🛒' : '💰'}
                    </span>
                    <div>
                      <strong style={{ display: 'block', color: 'var(--text-main)', fontSize: '1.05rem', marginBottom: '4px' }}>
                        {item.title}
                      </strong>
                      <span style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>
                        {item.category || 'Khác'}
                        {item.isDraft && <span style={{ marginLeft: '8px', background: 'var(--accent)', color: 'white', padding: '2px 6px', borderRadius: '4px', fontSize: '0.7rem' }}>Mới</span>}
                      </span>
                    </div>
                  </div>
                  <strong style={{ color: 'var(--text-main)', fontSize: '1.2rem' }}>
                    -{formatCurrency(Number(item.amount || 0))}
                  </strong>
                </div>
              ))}
            </div>

            <div className="modal-footer" style={{ borderTop: '2px solid var(--line)', paddingTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
              <span style={{ color: 'var(--muted)', fontWeight: '700', textTransform: 'uppercase', fontSize: '0.9rem', letterSpacing: '1px' }}>
                Tổng cộng
              </span>
              <strong style={{ fontSize: '1.8rem', color: 'var(--accent)' }}>
                {formatCurrency(dayGroupedTransactions.find(g => g.key === selectedDayModal)?.totalAmount || 0)}
              </strong>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}