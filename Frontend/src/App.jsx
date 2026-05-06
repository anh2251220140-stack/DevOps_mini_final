import { useEffect, useMemo, useState } from 'react'
import ExpenseForm from './components/ExpenseForm'
import TimeFilterPanel from './components/TimeFilterPanel'
import TransactionsSidebar from './components/TransactionsSidebar'
import { defaultForm, initialTransactions } from './constants/transactions'
import { formatCurrency } from './utils/formatCurrency'
import { isInFilterRange } from './utils/transactionFilters'
import { fetchTransactions, addTransaction } from './api/transactions'
import './App.css'

// ============================================================================
// COMPONENT: HEALTH CHECK FORM (Chỉ tập trung check Backend)
// ============================================================================
const HealthCheckForm = () => {
  const apiUrl = import.meta.env.VITE_API_URL || ''
  const [status, setStatus] = useState('loading') // loading | success | error
  const [errorMessage, setErrorMessage] = useState('')

  // Tự động kiểm tra ngay khi Component được mount
  useEffect(() => {
    const checkConnection = async () => {
      if (!apiUrl) {
        setStatus('error')
        setErrorMessage('Chưa cấu hình biến VITE_API_URL trong file .env')
        return
      }

      try {
        const healthUrl = `${apiUrl.replace(/\/+$/, '')}/health`
        const res = await fetch(healthUrl)
        
        if (res.ok) {
          setStatus('success')
        } else {
          setStatus('error')
          setErrorMessage(`Lỗi từ server: ${res.status} ${res.statusText}`)
        }
      } catch (error) {
        console.error('Health check failed:', error)
        setStatus('error')
        setErrorMessage('Không thể kết nối đến Supabase (Backend từ chối kết nối hoặc không hoạt động)')
      }
    }

    checkConnection()
  }, [apiUrl])

  const handleOpenUrl = () => {
    if (apiUrl) {
      window.open(apiUrl, '_blank')
    } else {
      alert('Không có URL để mở! Vui lòng kiểm tra lại file .env')
    }
  }

  return (
    <div className="health-check-wrapper">
      <style>{`
        .health-check-wrapper {
          max-width: 600px;
          margin: 0 auto;
        }
        .health-panel {
          background: var(--panel-bg);
          border-radius: 12px;
          border: 1px solid var(--line);
          box-shadow: 0 10px 25px rgba(0,0,0,0.05);
          overflow: hidden;
        }
        .health-header {
          background: linear-gradient(135deg, var(--accent), #0f172a);
          color: white;
          padding: 20px 25px;
        }
        .health-header h2 { margin: 0; font-size: 1.4rem; display: flex; align-items: center; gap: 10px; }
        .health-header p { margin: 5px 0 0; font-size: 0.9rem; opacity: 0.8; }
        .health-body { padding: 25px; }
        .health-form-group { margin-bottom: 20px; }
        .health-form-group label { display: block; margin-bottom: 8px; font-weight: 600; color: var(--muted); }
        
        .api-url-display {
          padding: 12px 15px; background: var(--input-bg); 
          border: 1px solid var(--line); border-radius: 8px;
          font-family: monospace; font-size: 1rem; color: var(--text-main);
          margin-bottom: 15px;
          word-break: break-all;
        }

        .health-actions { display: flex; gap: 12px; margin-top: 15px; }

        .health-btn-outline {
          padding: 0 20px; height: 42px; background: transparent; color: var(--text-main);
          border: 1px solid var(--line); border-radius: 8px; font-weight: bold; cursor: pointer;
          transition: all 0.2s; display: flex; align-items: center; gap: 6px;
        }
        .health-btn-outline:hover { background: rgba(15, 118, 110, 0.05); border-color: var(--accent); color: var(--accent); }
        
        .health-result {
          padding: 15px 20px; border-radius: 8px;
          border-left: 4px solid transparent;
          animation: slideDown 0.3s ease;
          display: flex;
          align-items: center;
        }
        .health-result.loading { background: rgba(59, 130, 246, 0.08); border-left-color: #3b82f6; }
        .health-result.success { background: rgba(16, 185, 129, 0.08); border-left-color: #10b981; }
        .health-result.error { background: rgba(239, 68, 68, 0.08); border-left-color: #ef4444; flex-direction: column; align-items: flex-start; gap: 10px; }
        
        .status-badge { font-weight: bold; font-size: 1.1rem; }
        .error-message { font-size: 0.95rem; color: var(--text-main); }
        
        @keyframes slideDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      <div className="health-panel">
        <div className="health-header">
          <h2>🏥 Trạng thái Dữ liệu</h2>
          <p>Tự động kiểm tra kết nối hệ thống</p>
        </div>
        
        <div className="health-body">
          <div className="health-form-group">
            <label>Cấu hình máy chủ hiện tại</label>
            <div className="api-url-display">
              {apiUrl ? apiUrl : '⚠️ Chưa tìm thấy VITE_API_URL trong file .env'}
            </div>
            
            {status === 'loading' && (
              <div className="health-result loading">
                <div className="status-badge" style={{ color: '#3b82f6' }}>
                  ⏳ Đang kết nối đến Supabase...
                </div>
              </div>
            )}

            {status === 'success' && (
              <div className="health-result success">
                <div className="status-badge" style={{ color: '#10b981' }}>
                  ✅ Đã kết nối đến Supabase thành công
                </div>
              </div>
            )}

            {status === 'error' && (
              <div className="health-result error">
                <div className="status-badge" style={{ color: '#ef4444' }}>
                  ❌ Lỗi kết nối
                </div>
                <div className="error-message">
                  <strong>Chi tiết: </strong> {errorMessage}
                </div>
              </div>
            )}

            <div className="health-actions">
              <button onClick={handleOpenUrl} className="health-btn-outline">
                🌐 Kiểm tra api
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// APP CHÍNH
// ============================================================================
function App() {
  // --- STATES DỮ LIỆU ---
  const [transactions, setTransactions] = useState(initialTransactions)
  const [formData, setFormData] = useState(defaultForm)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [submitSuccess, setSubmitSuccess] = useState('')
  const [isDarkMode, setIsDarkMode] = useState(false)

  // Bộ lọc
  const [filterType, setFilterType] = useState('all')
  const [dayFilter, setDayFilter] = useState(new Date().toISOString().slice(0, 10))
  const [monthFilter, setMonthFilter] = useState(new Date().toISOString().slice(0, 7))
  const [rangeFilter, setRangeFilter] = useState({ from: '', to: '' })

  // --- ĐIỀU HƯỚNG TABS ---
  const [activeTab, setActiveTab] = useState('overview') 

  // --- LOGIC HÀM ---
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!formData.title || !formData.amount) return

    setIsSubmitting(true)
    setSubmitError('')
    setSubmitSuccess('')

    try {
      const createdTransaction = await addTransaction({
        title: formData.title,
        amount: Number(formData.amount),
        category: formData.category,
        date: formData.date,
      })

      setTransactions((prev) => [createdTransaction, ...prev])
      setFormData(defaultForm)
      setSubmitSuccess('Đã thêm thành công!')
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Lỗi khi gọi backend.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // --- TÍNH TOÁN DỮ LIỆU ---
  const filteredTransactions = useMemo(() => {
    const range = { day: dayFilter, month: monthFilter, from: rangeFilter.from, to: rangeFilter.to }
    return transactions.filter((item) => isInFilterRange(item.date, filterType, range))
  }, [transactions, filterType, dayFilter, monthFilter, rangeFilter])

  const totalAmount = useMemo(() => {
    return filteredTransactions.reduce((sum, item) => sum + Number(item.amount || 0), 0)
  }, [filteredTransactions])

  useEffect(() => {
    const loadTransactions = async () => {
      try {
        const data = await fetchTransactions()
        setTransactions(Array.isArray(data) ? data : [])
      } catch (error) {
        console.warn('Không thể tải dữ liệu giao dịch:', error)
      }
    }

    loadTransactions()
  }, [])

  const grandTotalAmount = useMemo(() => {
    return transactions.reduce((sum, item) => sum + Number(item.amount || 0), 0)
  }, [transactions])

  const highestExpense = useMemo(() => {
    if (transactions.length === 0) return 0
    return Math.max(...transactions.map(t => Number(t.amount || 0)))
  }, [transactions])

  return (
    <div className={`admin-layout ${isDarkMode ? 'theme-dark' : ''}`}>
      {/* CỘT TRÁI: SIDEBAR CÓ ĐIỀU HƯỚNG TAB */}
      <aside className="admin-sidebar">
        <div className="sidebar-brand">
          <h2>💰 EXPENSE</h2>
          <p>Quản lý Chi tiêu</p>
        </div>
        
        <nav className="sidebar-nav">
          <button 
            className={`btn-nav ${activeTab === 'overview' ? 'active' : ''}`} 
            onClick={() => setActiveTab('overview')}
          >
            <span>📊</span> Tổng hợp
          </button>
          <button 
            className={`btn-nav ${activeTab === 'expense_form' ? 'active' : ''}`} 
            onClick={() => setActiveTab('expense_form')}
          >
            <span>💸</span> Thêm khoản chi
          </button>
          <button 
            className={`btn-nav ${activeTab === 'time_filter' ? 'active' : ''}`} 
            onClick={() => setActiveTab('time_filter')}
          >
            <span>📈</span> Tổng chi theo thời gian
          </button>
          <button 
            className={`btn-nav ${activeTab === 'history' ? 'active' : ''}`} 
            onClick={() => setActiveTab('history')}
          >
            <span>📑</span> Lịch sử giao dịch
          </button>
          
          <div style={{ margin: '15px 10px', height: '1px', background: 'var(--line)' }}></div>

          <button 
            className={`btn-nav ${activeTab === 'health' ? 'active' : ''}`} 
            onClick={() => setActiveTab('health')}
          >
            <span>🏥</span> Trạng thái hệ thống
          </button>
        </nav>
        
        <div className="sidebar-footer">
          <button onClick={() => setIsDarkMode(!isDarkMode)} className="theme-toggle-btn">
            {isDarkMode ? '☀️ Chế độ sáng' : '🌙 Chế độ tối'}
          </button>
        </div>
      </aside>

      {/* KHUNG BÊN PHẢI: HEADER + NỘI DUNG */}
      <div className="admin-wrapper">
        
        {/* HEADER TOP */}
        <header className="admin-header">
          <div className="header-info">
            <span style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--text-main)' }}>
              {activeTab === 'overview' && 'Bảng điều khiển tổng hợp'}
              {activeTab === 'expense_form' && 'Nhập liệu giao dịch'}
              {activeTab === 'time_filter' && 'Phân tích & Thống kê'}
              {activeTab === 'history' && 'Quản lý lịch sử giao dịch'}
              {activeTab === 'health' && 'Kiểm tra trạng thái máy chủ'}
            </span>
          </div>
        </header>

        {/* NỘI DUNG CHÍNH - RENDER THEO TAB */}
        <main className="admin-content">
          
          {/* TAB 1: TỔNG HỢP */}
          {activeTab === 'overview' && (
            <>
              <section className="overview-grid">
                <article className="overview-card overview-card--primary">
                  <div className="card-icon">💵</div>
                  <div className="card-data">
                    <span>Tổng chi tiêu</span>
                    <strong>{formatCurrency(grandTotalAmount)}</strong>
                  </div>
                </article>
                <article className="overview-card">
                  <div className="card-icon">📑</div>
                  <div className="card-data">
                    <span>Theo bộ lọc ({filteredTransactions.length} GD)</span>
                    <strong>{formatCurrency(totalAmount)}</strong>
                  </div>
                </article>
                <article className="overview-card">
                  <div className="card-icon">🔥</div>
                  <div className="card-data">
                    <span>Chi lớn nhất</span>
                    <strong>{formatCurrency(highestExpense)}</strong>
                  </div>
                </article>
              </section>

              <div className="content-grid">
                <div className="content-col-main">
                  <ExpenseForm
                    formData={formData}
                    isSubmitting={isSubmitting}
                    submitError={submitError}
                    submitSuccess={submitSuccess}
                    onInputChange={handleInputChange}
                    onSubmit={handleSubmit}
                  />
                </div>
                <div className="content-col-side">
                  <TimeFilterPanel
                    filterType={filterType}
                    dayFilter={dayFilter}
                    monthFilter={monthFilter}
                    rangeFilter={rangeFilter}
                    totalAmount={totalAmount}
                    filteredCount={filteredTransactions.length}
                    setFilterType={setFilterType}
                    setDayFilter={setDayFilter}
                    setMonthFilter={setMonthFilter}
                    setRangeFilter={setRangeFilter}
                  />
                </div>
              </div>

              <div className="transactions-section">
                <TransactionsSidebar transactions={filteredTransactions} onReload={() => window.location.reload()} />
              </div>
            </>
          )}

          {/* TAB 2: THÊM KHOẢN CHI */}
          {activeTab === 'expense_form' && (
            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
              <ExpenseForm
                formData={formData}
                isSubmitting={isSubmitting}
                submitError={submitError}
                submitSuccess={submitSuccess}
                onInputChange={handleInputChange}
                onSubmit={handleSubmit}
              />
            </div>
          )}

          {/* TAB 3: BỘ LỌC THỜI GIAN */}
          {activeTab === 'time_filter' && (
            <div style={{ maxWidth: '600px', margin: '0 auto' }}>
              <TimeFilterPanel
                filterType={filterType}
                dayFilter={dayFilter}
                monthFilter={monthFilter}
                rangeFilter={rangeFilter}
                totalAmount={totalAmount}
                filteredCount={filteredTransactions.length}
                setFilterType={setFilterType}
                setDayFilter={setDayFilter}
                setMonthFilter={setMonthFilter}
                setRangeFilter={setRangeFilter}
              />
            </div>
          )}

          {/* TAB 4: LỊCH SỬ GIAO DỊCH */}
          {activeTab === 'history' && (
            <div className="transactions-section">
              <TransactionsSidebar transactions={filteredTransactions} onReload={() => window.location.reload()} />
            </div>
          )}

          {/* TAB 5: HEALTH CHECK */}
          {activeTab === 'health' && (
            <HealthCheckForm />
          )}

        </main>
      </div>
    </div>
  )
}

export default App