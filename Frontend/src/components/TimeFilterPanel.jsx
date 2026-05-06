import { useState } from 'react'
import { createPortal } from 'react-dom'
import { formatCurrency } from '../utils/formatCurrency'

const getFilterLabel = (filterType) => {
  const labels = {
    day: 'Theo ngày cụ thể',
    month: 'Theo tháng',
    range: 'Khoảng thời gian tùy chỉnh',
    all: 'Tất cả thời gian'
  };
  return labels[filterType] || labels.all;
}

export default function TimeFilterPanel({
  filterType,
  dayFilter,
  monthFilter,
  rangeFilter,
  totalAmount,
  filteredCount,
  setFilterType,
  setDayFilter,
  setMonthFilter,
  setRangeFilter,
  onOpenFilteredList, 
}) {
  const [showDetailModal, setShowDetailModal] = useState(false)

  return (
    <section className="panel filter-animated-container">
      {/* TÍCH HỢP SCSS ĐỂ ÉP KHUÔN LAYOUT CHUẨN XÁC */}
      <style>{`
        .filter-animated-container {
          animation: scaleIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.04);
          border-radius: 16px;
          border: 1px solid var(--line);
        }
        
        /* Cấu trúc Lưới chuẩn cho Form */
        .filter-layout-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 16px;
          padding: 15px;
          background: rgba(15, 118, 110, 0.02);
          border-radius: 12px;
          border: 1px dashed var(--line);
          margin-bottom: 20px;
        }
        
        .filter-row-split {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          animation: fadeIn 0.3s ease;
        }

        .filter-item-group {
          display: flex;
          flex-direction: column;
        }

        .input-label {
          display: block;
          font-size: 0.82rem;
          font-weight: 700;
          color: var(--muted);
          margin-bottom: 8px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .modern-input {
          width: 100%;
          padding: 12px 14px;
          border: 1px solid var(--line);
          border-radius: 8px;
          background: var(--input-bg);
          color: var(--input-text);
          font-size: 0.95rem;
          transition: all 0.3s ease;
          box-sizing: border-box; /* Ép không bị tràn viền */
        }

        .modern-input:focus {
          outline: none;
          border-color: var(--accent);
          box-shadow: 0 0 0 3px rgba(45, 212, 191, 0.15);
          transform: translateY(-1px);
        }

        /* Thẻ Tổng tiền đẹp mắt */
        .summary-card__main {
          transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
          border-radius: 14px !important;
          background: linear-gradient(145deg, var(--panel-bg), rgba(45, 212, 191, 0.04)) !important;
          border: 1px solid var(--line);
        }
        .summary-card__main:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 25px rgba(45, 212, 191, 0.12);
          border-color: var(--accent) !important;
        }
        
        .modal-animated-content {
          animation: modalPop 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
        
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-5px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes modalPop {
          from { opacity: 0; transform: scale(0.9) translateY(20px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>

      {/* Header Panel */}
      <div className="panel-header" style={{ paddingBottom: '15px', marginBottom: '15px', borderBottom: '1px solid var(--line)' }}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0, fontSize: '1.25rem' }}>
          <span>⏱️</span> Phân tích & Thống kê
        </h2>
      </div>
      
      {/* 1. KHU VỰC CHỌN BỘ LỌC (ĐÃ CĂN CHỈNH GRID CHUẨN) */}
      <div className="filter-layout-grid">
        
        {/* Hàng 1: Luôn là Kiểu thống kê (Full chiều ngang) */}
        <div className="filter-item-group">
          <label className="input-label">Kiểu thống kê</label>
          <select className="modern-input" value={filterType} onChange={(e) => setFilterType(e.target.value)}>
            <option value="all">Hiển thị tất cả giao dịch</option>
            <option value="day">Lọc theo một ngày cụ thể</option>
            <option value="month">Lọc theo một tháng</option>
            <option value="range">Lọc theo khoảng thời gian (Từ ngày - Đến ngày)</option>
          </select>
        </div>

        {/* Hàng 2: Render linh hoạt tùy theo Kiểu thống kê */}
        {filterType === 'day' && (
          <div className="filter-item-group" style={{ animation: 'fadeIn 0.3s' }}>
            <label className="input-label">Chọn ngày</label>
            <input className="modern-input" type="date" value={dayFilter} onChange={(e) => setDayFilter(e.target.value)} />
          </div>
        )}

        {filterType === 'month' && (
          <div className="filter-item-group" style={{ animation: 'fadeIn 0.3s' }}>
            <label className="input-label">Chọn tháng</label>
            <input className="modern-input" type="month" value={monthFilter} onChange={(e) => setMonthFilter(e.target.value)} />
          </div>
        )}

        {filterType === 'range' && (
          <div className="filter-row-split">
            <div className="filter-item-group">
              <label className="input-label">Từ ngày</label>
              <input className="modern-input" type="date" value={rangeFilter.from} onChange={(e) => setRangeFilter(prev => ({ ...prev, from: e.target.value }))} />
            </div>
            <div className="filter-item-group">
              <label className="input-label">Đến ngày</label>
              <input className="modern-input" type="date" value={rangeFilter.to} onChange={(e) => setRangeFilter(prev => ({ ...prev, to: e.target.value }))} />
            </div>
          </div>
        )}
      </div>

      {/* 2. THẺ HIỂN THỊ TỔNG QUAN (CÂN ĐỐI LẠI) */}
      <div className="summary-card summary-card--expandable" aria-live="polite">
        <div 
          className="summary-card__main"
          onClick={() => setShowDetailModal(true)}
          style={{ 
            display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
            padding: '24px 20px', cursor: 'pointer'
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <span style={{ color: 'var(--muted)', fontWeight: '700', textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '0.5px' }}>
              Tổng chi tiêu ({getFilterLabel(filterType)})
            </span>
            <strong style={{ fontSize: '2.4rem', lineHeight: '1.2', color: 'var(--accent)', textShadow: '0 2px 10px rgba(45, 212, 191, 0.15)' }}>
              {formatCurrency(totalAmount)}
            </strong>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-main)', background: 'var(--line)', padding: '4px 10px', borderRadius: '6px', fontWeight: '600' }}>
                {filteredCount} Giao dịch
              </span>
              <span style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>được tìm thấy</span>
            </div>
          </div>
          
          <div style={{ 
            width: '45px', height: '45px', borderRadius: '50%', background: 'rgba(45, 212, 191, 0.1)', 
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)',
            fontSize: '1.2rem', transition: 'transform 0.3s'
          }}>
            ➔
          </div>
        </div>

        {/* 3. MODAL CHI TIẾT THỐNG KÊ */}
        {showDetailModal && createPortal(
          <div className="modal-overlay" onClick={() => setShowDetailModal(false)}>
            <div className="modal-content modal-animated-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '450px' }}>
              <button className="modal-close-btn" onClick={() => setShowDetailModal(false)}>&times;</button>
              
              <h2 className="modal-title" style={{ borderBottom: 'none', paddingBottom: '0', marginBottom: '20px' }}>
                📊 Phân tích chi tiết
              </h2>

              <div style={{ 
                display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px'
              }}>
                <div style={{ background: 'var(--line)', padding: '15px', borderRadius: '12px' }}>
                  <span style={{ display: 'block', color: 'var(--muted)', fontSize: '0.85rem', marginBottom: '4px' }}>Hình thức lọc</span>
                  <strong style={{ fontSize: '1.05rem', color: 'var(--text-main)' }}>{getFilterLabel(filterType)}</strong>
                </div>
                
                <div style={{ background: 'var(--line)', padding: '15px', borderRadius: '12px' }}>
                  <span style={{ display: 'block', color: 'var(--muted)', fontSize: '0.85rem', marginBottom: '4px' }}>Số lượng mục</span>
                  <strong style={{ fontSize: '1.05rem', color: 'var(--text-main)' }}>{filteredCount} Giao dịch</strong>
                </div>

                <div 
                  onClick={() => {
                    setShowDetailModal(false);
                    if (onOpenFilteredList) onOpenFilteredList();
                  }}
                  style={{ 
                    gridColumn: '1 / -1', background: 'rgba(45, 212, 191, 0.08)', 
                    border: '1px solid var(--accent)', textAlign: 'center',
                    cursor: 'pointer', padding: '25px', borderRadius: '16px',
                    transition: 'all 0.2s ease', boxShadow: 'inset 0 0 20px rgba(45, 212, 191, 0.05)'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                  <span style={{ color: 'var(--accent)', fontWeight: '700', textTransform: 'uppercase', fontSize: '0.85rem', letterSpacing: '1px' }}>
                    Tổng tiền chi tiêu
                  </span>
                  <strong style={{ fontSize: '2.2rem', color: 'var(--accent)', display: 'block', marginTop: '8px' }}>
                    {formatCurrency(totalAmount)}
                  </strong>
                </div>

                <div style={{ background: 'var(--line)', padding: '15px', borderRadius: '12px' }}>
                  <span style={{ display: 'block', color: 'var(--muted)', fontSize: '0.85rem', marginBottom: '4px' }}>Trung bình chi</span>
                  <strong style={{ fontSize: '1.05rem', color: 'var(--text-main)' }}>
                    {formatCurrency(filteredCount > 0 ? totalAmount / filteredCount : 0)}
                  </strong>
                </div>
                
                <div style={{ background: 'var(--line)', padding: '15px', borderRadius: '12px' }}>
                  <span style={{ display: 'block', color: 'var(--muted)', fontSize: '0.85rem', marginBottom: '4px' }}>Dữ liệu lọc lúc</span>
                  <strong style={{ fontSize: '1.05rem', color: 'var(--text-main)' }}>
                    {filterType === 'day' ? dayFilter : 
                     filterType === 'month' ? monthFilter : 
                     filterType === 'range' ? `${rangeFilter.from || '?'} ➔ ${rangeFilter.to || '?'}` : 'Toàn thời gian'}
                  </strong>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}
      </div>
    </section>
  )
}