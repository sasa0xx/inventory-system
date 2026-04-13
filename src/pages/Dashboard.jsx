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

function Dashboard({ products, workers, sales, purchases, settings }) {
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
      alert('AI Backend connection failed.');
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
    labels: last7Days.map(d => new Date(d).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })),
    datasets: [{ label: 'Sales', data: Object.values(salesByDay), borderColor: 'var(--accent-primary)', backgroundColor: 'rgba(139, 92, 246, 0.1)', fill: true, tension: 0.4 }]
  };

  // Tracking the team's wizardry
  const radarChart = {
    labels: workers.map(w => w.name.split(' ')[0]),
    datasets: [{ label: 'Total Revenue', data: workers.map(w => w.totalSales), borderColor: 'var(--accent-primary)', backgroundColor: 'rgba(139, 92, 246, 0.2)', borderWidth: 2 }]
  };

  // Money coming in vs Money going out
  const comparisonChart = {
    labels: ['Finances'],
    datasets: [
      { label: 'Revenue', data: [totalSales], backgroundColor: 'var(--accent-success)', borderRadius: 8 },
      { label: 'Purchases', data: [totalPurchases], backgroundColor: 'var(--accent-danger)', borderRadius: 8 }
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
              <h3>Portfolio Value</h3>
              <p className="stat-number">${totalValue.toLocaleString()}</p>
            </div>
            <div className="stat-card">
              <h3 style={{ color: 'var(--accent-success)' }}>Revenue</h3>
              <p className="stat-number" style={{ color: 'var(--accent-success)' }}>${totalSales.toLocaleString()}</p>
            </div>
            <div className="stat-card">
              <h3 style={{ color: 'var(--accent-primary)' }}>Net Profit</h3>
              <p className="stat-number" style={{ color: 'var(--accent-primary)' }}>${profit.toLocaleString()}</p>
            </div>
            <div className="stat-card">
              <h3>Total Units</h3>
              <p className="stat-number">{totalProducts}</p>
            </div>
          </div>
        )}

        <div className="dashboard-layout">
          
          {/* MAIN COLUMN */}
          <div className="main-col">
            {settings.dashboardVisibility.ai && (
              <div className="ai-section">
                <h3>🧠 AI Strategic Restock</h3>
                <div className="ai-controls">
                  <input type="number" value={budget} onChange={(e) => setBudget(e.target.value)} placeholder="Enter budget..." />
                  <button className="btn-primary" onClick={generateAIList}>
                    {loading ? 'Analyzing...' : 'Generate Forecast'}
                  </button>
                </div>
                {aiList && (
                  <div className="ai-results">
                    <table>
                      <thead><tr><th>Product</th><th>Qty</th><th>Subtotal</th><th>Profit</th></tr></thead>
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
                  <h3>Sales Velocity</h3>
                  <div className="chart-container"><Line data={momentumChart} options={chartOptions} /></div>
                </div>
                <div className="chart-card">
                  <h3>Worker Performance</h3>
                  <div className="chart-container"><Radar data={radarChart} options={chartOptions} /></div>
                </div>
                <div className="chart-card">
                  <h3>Stock Allocation</h3>
                  <div className="chart-container"><Doughnut data={categoryChart} options={chartOptions} /></div>
                </div>
                <div className="chart-card">
                  <h3>Revenue vs Spends</h3>
                  <div className="chart-container"><Bar data={comparisonChart} options={chartOptions} /></div>
                </div>
              </div>
            )}

            {settings.dashboardVisibility.workers && (
              <div className="workers-section">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <h3>👥 Team Performance</h3>
                  {topWorker && <span className="badge-top">Top: {topWorker.name}</span>}
                </div>
                <table>
                  <thead>
                    <tr>
                      <th>Worker Name</th>
                      <th>Sales Count</th>
                      <th>Total Generated</th>
                      <th>Status</th>
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
                            {w.totalSales > 0 ? 'Active' : 'No Sales'}
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
            <div className="chart-card">
              <h3>Low Stock Alerts</h3>
              <div className="chart-container" style={{ height: '300px' }}><PolarArea data={polarChart} options={chartOptions} /></div>
            </div>
            
            {settings.dashboardVisibility.recentSales && (
              <div className="recent-sales">
                <h3>Live Feed</h3>
                <div className="feed-container">
                  <table>
                    <tbody>
                      {sales.slice(-12).reverse().map(s => (
                        <tr key={s.id}>
                          <td>
                            <div style={{ fontWeight: '600' }}>{s.productName}</div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{new Date(s.date).toLocaleTimeString()}</div>
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
