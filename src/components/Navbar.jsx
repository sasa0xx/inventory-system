import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import './Navbar.css'

function Navbar({ settings, setSettings }) {
  const location = useLocation();
  const [showSettings, setShowSettings] = useState(false);

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

  return (
    <nav className="navbar">
      <div className="nav-container">
        <h1 className="nav-logo">Inventory Intelligence</h1>
        <div className="nav-links">
          <Link 
            to="/" 
            className={location.pathname === '/' ? 'nav-link active' : 'nav-link'}
          >
            Home
          </Link>
          <Link 
            to="/dashboard" 
            className={location.pathname === '/dashboard' ? 'nav-link active' : 'nav-link'}
          >
            Dashboard
          </Link>
          <button 
            className="settings-toggle-btn nav-link" 
            onClick={() => setShowSettings(!showSettings)}
            style={{ 
              background: 'var(--bg-hover)', 
              marginLeft: '0.5rem'
            }}
          >
            Settings ⚙️
          </button>
        </div>
      </div>


      {showSettings && (
        <div className="settings-dropdown" style={{
          position: 'absolute',
          top: '100%',
          right: '2rem',
          padding: '1.5rem',
          borderRadius: '0 0 12px 12px',
          zIndex: 1000,
          minWidth: '280px',
          background: 'var(--bg-navbar)',
          border: '1px solid var(--border-color)',
          borderTop: 'none',
          boxShadow: 'var(--shadow)'
        }}>
          <h4 style={{ marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', color: 'var(--text-primary)' }}>UI Customization</h4>
          
          <div style={{ marginBottom: '1.5rem' }}>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Accent Color</p>
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

          <div style={{ marginBottom: '1.5rem' }}>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.8rem' }}>Display Settings</p>
            <button 
              onClick={() => setSettings({...settings, theme: settings.theme === 'dark' ? 'light' : 'dark'})}
              style={{
                width: '100%',
                padding: '0.6rem',
                background: 'var(--accent-primary)',
                color: 'white',
                borderRadius: '8px',
                fontSize: '0.85rem',
                cursor: 'pointer'
              }}
            >
              Switch to {settings.theme === 'dark' ? '☀️ Light Mode' : '🌙 Dark Mode'}
            </button>
          </div>

          <div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Dashboard Sections</p>
            {Object.keys(settings.dashboardVisibility).map(key => (
              <label key={key} className="settings-checkbox-row">
                <input 
                  type="checkbox" 
                  checked={settings.dashboardVisibility[key]} 
                  onChange={() => toggleVisibility(key)}
                />
                <span style={{ fontSize: '0.85rem' }}>
                  {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
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
