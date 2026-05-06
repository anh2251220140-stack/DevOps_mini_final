import { formatCurrency } from '../utils/formatCurrency'

const categoryOptions = ['Ăn uống', 'Di chuyển', 'Mua sắm', 'Hóa đơn', 'Giải trí', 'Y tế', 'Học tập', 'Gia đình', 'Khác']
const amountOptions = [10000, 20000, 50000, 100000, 200000, 500000, 1000000]

export default function ExpenseForm({
  formData,
  currentTime,
  isSubmitting,
  submitError,
  submitSuccess,
  onInputChange,
  onSubmit,
}) {
  const previewAmount = Number(formData.amount || 0)
  
  // Xử lý Icon động dựa trên Category đang chọn
  const categoryIcon = formData.category === 'Ăn uống' ? '🍔' : 
                       formData.category === 'Di chuyển' ? '🚗' : 
                       formData.category === 'Mua sắm' ? '🛒' : '💰'

  // Xử lý hiển thị ngày format VN
  const displayDate = formData.date 
    ? new Date(formData.date).toLocaleDateString('vi-VN') 
    : 'Chưa chọn ngày'

  return (
    <section className="panel admin-panel form-animated-container">
      {/* TÍCH HỢP SCSS ANIMATION */}
      <style>{`
        .form-animated-container {
          animation: slideUpFade 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.04);
          border: 1px solid var(--line);
          border-radius: 16px;
          overflow: hidden;
        }
        .form-control {
          transition: all 0.3s ease;
          background: var(--input-bg);
          border-radius: 10px;
        }
        .form-control:focus {
          transform: translateY(-2px);
          box-shadow: 0 8px 16px rgba(45, 212, 191, 0.1), 0 0 0 3px rgba(45, 212, 191, 0.2);
          border-color: var(--accent);
        }
        .btn-submit {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          border-radius: 10px;
          box-shadow: 0 4px 12px rgba(15, 118, 110, 0.2);
        }
        .btn-submit:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(15, 118, 110, 0.3);
          background: linear-gradient(135deg, var(--accent), #0f766e);
        }
        .btn-submit:active:not(:disabled) {
          transform: translateY(1px);
        }
        
        /* Chỉnh lại thẻ Preview */
        .expense-preview-box {
          animation: fadeIn 0.8s ease forwards;
          border-radius: 12px;
          background: rgba(45, 212, 191, 0.05);
          border: 1px dashed var(--accent);
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 20px;
          margin-top: 24px;
        }

        @keyframes slideUpFade {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>

      <div className="panel-header">
        <h2 style={{ fontSize: '1.3rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>✨</span> Thêm khoản chi tiêu mới
        </h2>
      </div>

      <div className="panel-body">
        <form className="admin-form" onSubmit={onSubmit}>
          {/* Lưới 2 cột cho các input */}
          <div className="form-grid-2col">
            <div className="form-group">
              <label>Tên khoản chi</label>
              <input
                name="title"
                value={formData.title}
                onChange={onInputChange}
                placeholder="Ví dụ: Ăn tối"
                required
                className="form-control"
              />
            </div>

            <div className="form-group">
              <label>Số tiền (VND)</label>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={onInputChange}
                min="1000"
                step="1000"
                inputMode="numeric"
                placeholder="50000"
                list="expense-amount-options"
                required
                className="form-control"
              />
              <datalist id="expense-amount-options">
                {amountOptions.map((option) => (
                  <option key={option} value={option} />
                ))}
              </datalist>
            </div>

            <div className="form-group">
              <label>Loại chi tiêu</label>
              <select name="category" value={formData.category} onChange={onInputChange} className="form-control">
                {categoryOptions.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Ngày chi</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={onInputChange}
                required
                className="form-control"
              />
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-submit admin-btn" disabled={isSubmitting}>
              {isSubmitting ? 'Đang xử lý...' : 'Thêm giao dịch'}
            </button>
          </div>
        </form>

        {/* Preview Card đã được làm lại hoàn thiện */}
        <div className="expense-preview-box">
          <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
            <span style={{ 
              fontSize: '1.6rem', background: 'var(--input-bg)', width: '50px', height: '50px', 
              display: 'flex', alignItems: 'center', justifyContent: 'center', 
              borderRadius: '14px', border: '1px solid var(--line)' 
            }}>
              {categoryIcon}
            </span>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <span className="badge" style={{ background: 'var(--accent)', color: 'white', padding: '3px 6px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 'bold' }}>
                  XEM TRƯỚC
                </span>
                <strong style={{ fontSize: '1.1rem', color: 'var(--text-main)' }}>
                  {formData.title || 'Tên giao dịch...'}
                </strong>
              </div>
              <span style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>
                {formData.category || 'Khác'} • {displayDate}
              </span>
            </div>
          </div>
          
          <strong className="amount-text" style={{ fontSize: '1.4rem', color: 'var(--accent)' }}>
            {formatCurrency(previewAmount)}
          </strong>
        </div>

        {submitError && <p className="message error" style={{ animation: 'fadeIn 0.3s' }}>{submitError}</p>}
        {submitSuccess && <p className="message success" style={{ animation: 'fadeIn 0.3s' }}>{submitSuccess}</p>}
      </div>
    </section>
  )
}