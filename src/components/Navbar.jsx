import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import './Navbar.css'

function Navbar({ settings, setSettings, alarms, setAlarms }) {
  const location = useLocation();
  const [showSettings, setShowSettings] = useState(false);
  const [showAlarms, setShowAlarms] = useState(false);

  const toggleVisibility = (key) => {
    setSettings({
      ...settings,
      dashboardVisibility: {
        ...settings.dashboardVisibility,
        [key]: !settings.dashboardVisibility[key]
      }
    });
  };

  const colors = [
    { name: 'Purple', hex: '#8b5cf6' },
    { name: 'Blue', hex: '#3b82f6' },
    { name: 'Emerald', hex: '#10b981' },
    { name: 'Rose', hex: '#f43f5e' },
    { name: 'Amber', hex: '#f59e0b' }
  ];

  const currentLanguage = settings.language || 'en';
  const unreadCount = alarms.filter(a => !a.read).length;

  const t = {
    en: {
      logo: 'Inventory Intelligence',
      home: 'Home',
      dashboard: 'Dashboard',
      settings: 'Settings',
      uiCustomization: 'UI Customization',
      accentColor: 'Accent Color',
      dashboardSections: 'Dashboard Sections',
      notifications: 'Notifications',
      noAlarms: 'No new alarms',
      clearAll: 'Clear All',
      lowStock: 'Low Stock Alerts'
    },
    ar: {
      logo: 'ذكاء المخزون',
      home: 'الرئيسية',
      dashboard: 'لوحة التحكم',
      settings: 'الإعدادات',
      uiCustomization: 'تخصيص الواجهة',
      accentColor: 'لون التمييز',
      dashboardSections: 'أقسام لوحة التحكم',
      notifications: 'التنبيهات',
      noAlarms: 'لا توجد تنبيهات جديدة',
      clearAll: 'مسح الكل',
      lowStock: 'تنبيهات انخفاض المخزون'
    }
  }[currentLanguage];

  const markAllRead = () => {
    setAlarms(alarms.map(a => ({ ...a, read: true })));
  };

  const clearAlarms = () => {
    setAlarms([]);
    setShowAlarms(false);
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        <h1 className="nav-logo">{t.logo}</h1>
        <div className="nav-links">
          <Link 
            to="/" 
            className={location.pathname === '/' ? 'nav-link active' : 'nav-link'}
          >
            {t.home}
          </Link>
          <Link 
            to="/dashboard" 
            className={location.pathname === '/dashboard' ? 'nav-link active' : 'nav-link'}
          >
            {t.dashboard}
          </Link>
          
          <button 
            className="icon-btn" 
            onClick={() => setSettings({...settings, theme: settings.theme === 'dark' ? 'light' : 'dark'})}
            title={settings.theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {settings.theme === 'dark' ? '☀️' : '🌙'}
          </button>

          <button 
            className="icon-btn" 
            onClick={() => setSettings({...settings, language: currentLanguage === 'en' ? 'ar' : 'en'})}
            title={currentLanguage === 'en' ? 'Switch to Arabic' : 'Switch to English'}
          >
            🌐
          </button>

          <div style={{ position: 'relative' }}>
            <button 
              className="icon-btn" 
              onClick={() => {
                setShowAlarms(!showAlarms);
                setShowSettings(false);
                if (!showAlarms) markAllRead();
              }}
            >
              🔔
              {unreadCount > 0 && <span className="notification-dot"></span>}
            </button>

            {showAlarms && (
              <div className="alarms-dropdown">
                <div className="alarms-header">
                  <span>{t.notifications}</span>
                  <button onClick={clearAlarms} style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem' }}>{t.clearAll}</button>
                </div>
                <div className="alarms-list">
                  {alarms.length === 0 ? (
                    <p style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-secondary)' }}>{t.noAlarms}</p>
                  ) : (
                    alarms.map(alarm => (
                      <div key={alarm.id} className={`alarm-item ${alarm.type}`}>
                        <p>{alarm.message}</p>
                        <span>{new Date(alarm.date).toLocaleTimeString()}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          <button 
            className="settings-toggle-btn nav-link" 
            onClick={() => {
              setShowSettings(!showSettings);
              setShowAlarms(false);
            }}
            style={{ 
              background: 'var(--bg-hover)', 
              marginLeft: '0.5rem'
            }}
          >
            ⚙️
          </button>
        </div>
      </div>


      {showSettings && (
        <div className="settings-dropdown" style={{
          position: 'absolute',
          top: '100%',
          right: currentLanguage === 'ar' ? 'auto' : '2rem',
          left: currentLanguage === 'ar' ? '2rem' : 'auto',
          padding: '1.5rem',
          borderRadius: '0 0 12px 12px',
          zIndex: 1000,
          minWidth: '280px',
          background: 'var(--bg-navbar)',
          border: '1px solid var(--border-color)',
          borderTop: 'none',
          boxShadow: 'var(--shadow)'
        }}>
          <h4 style={{ marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', color: 'var(--text-primary)' }}>{t.uiCustomization}</h4>
          
          <div style={{ marginBottom: '1.5rem' }}>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>{t.accentColor}</p>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {colors.map(color => (
                <div 
                  key={color.hex}
                  onClick={() => setSettings({...settings, accentColor: color.hex})}
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    background: color.hex,
                    cursor: 'pointer',
                    border: settings.accentColor === color.hex ? '2px solid white' : 'none'
                  }}
                  title={color.name}
                />
              ))}
            </div>
          </div>

          <div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>{t.dashboardSections}</p>
            {['ai', 'stats', 'charts', 'workers', 'recentSales', 'lowStock'].map(key => (
              <label key={key} className="settings-checkbox-row">
                <input 
                  type="checkbox" 
                  checked={settings.dashboardVisibility[key] !== false} 
                  onChange={() => toggleVisibility(key)}
                />
                <span style={{ fontSize: '0.85rem' }}>
                  {key === 'lowStock' ? t.lowStock : key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}
    </nav>
  )
}

export default Navbar
