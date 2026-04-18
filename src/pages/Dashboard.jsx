import { useState } from 'react';
import { 
  Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, 
  LinearScale, BarElement, LineElement, PointElement, Title, 
  Filler, RadialLinearScale 
} from 'chart.js';
import { Pie, Bar, Line, Doughnut, Radar, PolarArea } from 'react-chartjs-2';
import './Dashboard.css';

ChartJS.register(
  ArcElement, Tooltip, Legend, CategoryScale, LinearScale, 
  BarElement, LineElement, PointElement, Title, Filler, RadialLinearScale
);

function Dashboard({ products, workers, sales, purchases, settings, addAlarm }) {
  const currentLanguage = settings?.language || 'en';

  const t = {
    en: {
      stats: {
        portfolio: 'Portfolio Value',
        revenue: 'Revenue',
        profit: 'Net Profit',
        units: 'Total Units'
      },
      ai: {
        title: '🧠 AI Strategic Restock',
        placeholder: 'Enter budget...',
        button: 'Generate Forecast',
        loading: 'Analyzing...',
        table: { product: 'Product', qty: 'Qty', subtotal: 'Subtotal', profit: 'Profit' },
        error: 'AI Backend connection failed.'
      },
      charts: {
        velocity: 'Sales Velocity',
        performance: 'Worker Performance',
        allocation: 'Stock Allocation',
        comparison: 'Revenue vs Spends',
        lowStock: 'Low Stock Alerts',
        labels: { sales: 'Sales', revenue: 'Total Revenue', purchases: 'Purchases' }
      },
      team: {
        title: '👥 Team Performance',
        top: 'Top',
        table: { name: 'Worker Name', count: 'Sales Count', total: 'Total Generated', status: 'Status' },
        status: { active: 'Active', idle: 'No Sales' }
      },
      feed: {
        title: 'Live Feed'
      }
    },
    ar: {
      stats: {
        portfolio: 'قيمة المحفظة',
        revenue: 'الإيرادات',
        profit: 'صافي الربح',
        units: 'إجمالي الوحدات'
      },
      ai: {
        title: '🧠 إعادة التخزين الاستراتيجي بالذكاء الاصطناعي',
        placeholder: 'أدخل الميزانية...',
        button: 'إنشاء التوقعات',
        loading: 'جاري التحليل...',
        table: { product: 'المنتج', qty: 'الكمية', subtotal: 'المجموع الفرعي', profit: 'الربح' },
        error: 'فشل الاتصال بخادم الذكاء الاصطناعي.'
      },
      charts: {
        velocity: 'سرعة المبيعات',
        performance: 'أداء الموظفين',
        allocation: 'توزيع المخزون',
        comparison: 'الإيرادات مقابل المصروفات',
        lowStock: 'تنبيهات انخفاض المخزون',
        labels: { sales: 'المبيعات', revenue: 'إجمالي الإيرادات', purchases: 'المشتريات' }
      },
      team: {
        title: '👥 أداء الفريق',
        top: 'الأفضل',
        table: { name: 'اسم الموظف', count: 'عدد المبيعات', total: 'إجمالي المحقق', status: 'الحالة' },
        status: { active: 'نشط', idle: 'لا مبيعات' }
      },
      feed: {
        title: 'التغذية المباشرة'
      }
    }
  }[currentLanguage];

  const [budget, setBudget] = useState(1000);
  const [aiList, setAiList] = useState(null);
  const [loading, setLoading] = useState(false);

  const isDark = settings.theme === 'dark';
  const gridColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
  const textColor = isDark ? '#94a3b8' : '#64748b';
  const titleColor = isDark ? '#f8fafc' : '#0f172a';

  // Making the charts actually readable at 3 AM. 
  // Coffee is the only reason these colors work.
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { labels: { color: textColor, font: { size: 10, weight: '600' } } },
      tooltip: { 
        backgroundColor: isDark ? '#1e293b' : '#ffffff', 
        titleColor: titleColor, 
        bodyColor: textColor, 
        borderColor: isDark ? '#334155' : '#e2e8f0', 
        borderWidth: 1 
      }
    },
    scales: {
      y: { 
        grid: { color: gridColor }, 
        ticks: { color: textColor, font: { size: 10 } } 
      },
      x: { 
        grid: { color: gridColor }, 
        ticks: { color: textColor, font: { size: 10 } } 
      },
      r: { 
        grid: { color: gridColor }, 
        angleLines: { color: gridColor }, 
        pointLabels: { color: textColor, font: { size: 10, weight: '600' } }, 
        ticks: { display: false } 
      }
    }
  };

  const generateAIList = async () => {
    setLoading(true);
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
    try {
      const response = await fetch(`${apiUrl}/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          products: products.map(p => ({ ...p, costPrice: p.costPrice || (p.price * 0.7) })),
          sales, budget: parseFloat(budget), current_date: new Date().toISOString()
        })
      });
      const data = await response.json();
      setAiList(data.recommendations);
    } catch (error) {
      addAlarm(t.ai.error, 'warning');
    } finally { setLoading(false); }
  };


  // Crunching the numbers. Hope the math is right!
  const totalProducts = products.reduce((sum, p) => sum + p.quantity, 0);
  const totalValue = products.reduce((sum, p) => sum + (p.quantity * p.price), 0);
  const totalSales = sales.reduce((sum, s) => sum + s.total, 0);
  const totalPurchases = purchases.reduce((sum, p) => sum + p.total, 0);
  const profit = totalSales - totalPurchases;

  // Where did all our stock go? (The Doughnut Edition)
  const catData = {};
  products.forEach(p => catData[p.category] = (catData[p.category] || 0) + p.quantity);
  const categoryChart = {
    labels: Object.keys(catData),
    datasets: [{ data: Object.values(catData), backgroundColor: ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#ec4899'], borderWidth: 0 }]
  };

  // Are we getting rich yet? (Area Chart)
  const getLast7Days = () => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      days.push(date.toISOString().split('T')[0]);
    }
    return days;
  };
  const last7Days = getLast7Days();
  const salesByDay = {};
  last7Days.forEach(day => { salesByDay[day] = 0; });
  sales.forEach(s => { if (salesByDay[s.date.split('T')[0]] !== undefined) salesByDay[s.date.split('T')[0]] += s.total; });
  const momentumChart = {
    labels: last7Days.map(d => new Date(d).toLocaleDateString(currentLanguage === 'ar' ? 'ar-EG' : undefined, { month: 'short', day: 'numeric' })),
    datasets: [{ label: t.charts.labels.sales, data: Object.values(salesByDay), borderColor: 'var(--accent-primary)', backgroundColor: 'rgba(139, 92, 246, 0.1)', fill: true, tension: 0.4 }]
  };

  // Tracking the team's wizardry
  const radarChart = {
    labels: workers.map(w => w.name.split(' ')[0]),
    datasets: [{ label: t.charts.labels.revenue, data: workers.map(w => w.totalSales), borderColor: 'var(--accent-primary)', backgroundColor: 'rgba(139, 92, 246, 0.2)', borderWidth: 2 }]
  };

  // Money coming in vs Money going out
  const comparisonChart = {
    labels: [currentLanguage === 'ar' ? 'المالية' : 'Finances'],
    datasets: [
      { label: t.charts.labels.revenue, data: [totalSales], backgroundColor: 'var(--accent-success)', borderRadius: 8 },
      { label: t.charts.labels.purchases, data: [totalPurchases], backgroundColor: 'var(--accent-danger)', borderRadius: 8 }
    ]
  };

  // Red alert! these things are running out!
  const lowStockProducts = products.filter(p => p.quantity <= p.minStock);
  const polarChart = {
    labels: lowStockProducts.map(p => p.name),
    datasets: [{ data: lowStockProducts.map(p => p.quantity), backgroundColor: 'rgba(239, 68, 68, 0.6)', borderWidth: 0 }]
  };

  const topWorker = [...workers].sort((a, b) => b.totalSales - a.totalSales)[0];

  return (
    <div className="dashboard-page">
      <div className="page-container">
        
        {/* STATS STRIP */}
        {settings.dashboardVisibility.stats && (
          <div className="stats-grid">
            <div className="stat-card">
              <h3>{t.stats.portfolio}</h3>
              <p className="stat-number">${totalValue.toLocaleString()}</p>
            </div>
            <div className="stat-card">
              <h3 style={{ color: 'var(--accent-success)' }}>{t.stats.revenue}</h3>
              <p className="stat-number" style={{ color: 'var(--accent-success)' }}>${totalSales.toLocaleString()}</p>
            </div>
            <div className="stat-card">
              <h3 style={{ color: 'var(--accent-primary)' }}>{t.stats.profit}</h3>
              <p className="stat-number" style={{ color: 'var(--accent-primary)' }}>${profit.toLocaleString()}</p>
            </div>
            <div className="stat-card">
              <h3>{t.stats.units}</h3>
              <p className="stat-number">{totalProducts}</p>
            </div>
          </div>
        )}

        <div className="dashboard-layout">
          
          {/* MAIN COLUMN */}
          <div className="main-col">
            {settings.dashboardVisibility.ai && (
              <div className="ai-section">
                <h3>{t.ai.title}</h3>
                <div className="ai-controls">
                  <input type="number" value={budget} onChange={(e) => setBudget(e.target.value)} placeholder={t.ai.placeholder} />
                  <button className="btn-primary" onClick={generateAIList}>
                    {loading ? t.ai.loading : t.ai.button}
                  </button>
                </div>
                {aiList && (
                  <div className="ai-results">
                    <table>
                      <thead><tr><th>{t.ai.table.product}</th><th>{t.ai.table.qty}</th><th>{t.ai.table.subtotal}</th><th>{t.ai.table.profit}</th></tr></thead>
                      <tbody>
                        {aiList.map((item, i) => (
                          <tr key={i}><td>{item.name}</td><td>{item.quantity}</td><td>${item.totalCost.toFixed(0)}</td><td style={{color: 'var(--accent-success)', fontWeight: '600'}}>+${item.totalProfit.toFixed(0)}</td></tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {settings.dashboardVisibility.charts && (
              <div className="charts-grid">
                <div className="chart-card">
                  <h3>{t.charts.velocity}</h3>
                  <div className="chart-container"><Line data={momentumChart} options={chartOptions} /></div>
                </div>
                <div className="chart-card">
                  <h3>{t.charts.performance}</h3>
                  <div className="chart-container"><Radar data={radarChart} options={chartOptions} /></div>
                </div>
                <div className="chart-card">
                  <h3>{t.charts.allocation}</h3>
                  <div className="chart-container"><Doughnut data={categoryChart} options={chartOptions} /></div>
                </div>
                <div className="chart-card">
                  <h3>{t.charts.comparison}</h3>
                  <div className="chart-container"><Bar data={comparisonChart} options={chartOptions} /></div>
                </div>
              </div>
            )}

            {settings.dashboardVisibility.workers && (
              <div className="workers-section">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <h3>{t.team.title}</h3>
                  {topWorker && <span className="badge-top">{t.team.top}: {topWorker.name}</span>}
                </div>
                <table>
                  <thead>
                    <tr>
                      <th>{t.team.table.name}</th>
                      <th>{t.team.table.count}</th>
                      <th>{t.team.table.total}</th>
                      <th>{t.team.table.status}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {workers.sort((a, b) => b.totalSales - a.totalSales).map(w => (
                      <tr key={w.id} className={w.id === topWorker?.id ? 'top-worker' : ''}>
                        <td>{w.name}</td>
                        <td>{w.salesCount}</td>
                        <td style={{ fontWeight: '600', color: 'var(--accent-success)' }}>${w.totalSales.toFixed(2)}</td>
                        <td>
                          <span className={`status-pill ${w.totalSales > 0 ? 'active' : 'idle'}`}>
                            {w.totalSales > 0 ? t.team.status.active : t.team.status.idle}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* SIDEBAR COLUMN */}
          <div className="side-col">
            {settings.dashboardVisibility.lowStock !== false && (
              <div className="chart-card">
                <h3>{t.charts.lowStock}</h3>
                <div className="chart-container" style={{ height: '300px' }}><PolarArea data={polarChart} options={chartOptions} /></div>
              </div>
            )}
            
            {settings.dashboardVisibility.recentSales && (
              <div className="recent-sales">
                <h3>{t.feed.title}</h3>
                <div className="feed-container">
                  <table>
                    <tbody>
                      {sales.slice(-12).reverse().map(s => (
                        <tr key={s.id}>
                          <td>
                            <div style={{ fontWeight: '600' }}>{s.productName}</div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{new Date(s.date).toLocaleTimeString(currentLanguage === 'ar' ? 'ar-EG' : undefined)}</div>
                          </td>
                          <td style={{ fontWeight: '700', color: 'var(--accent-success)', textAlign: 'right' }}>
                            +${s.total.toFixed(0)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  )

}

export default Dashboard
