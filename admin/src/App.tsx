import { useState, useEffect } from 'react'

const API_URL = 'https://api.shamikmishra.com'

interface DailyStats {
  date: string
  views: number
}

interface ItemCount {
  name: string
  count: number
}

interface Stats {
  totalViews: number
  todayViews: number
  dailyStats: DailyStats[]
  topCommands: ItemCount[]
  countries: ItemCount[]
  devices: ItemCount[]
  browsers: ItemCount[]
  os: ItemCount[]
  referrers: ItemCount[]
}

const COUNTRY_FLAGS: Record<string, string> = {
  'NO': '🇳🇴', 'US': '🇺🇸', 'GB': '🇬🇧', 'DE': '🇩🇪', 'IN': '🇮🇳',
  'FR': '🇫🇷', 'SE': '🇸🇪', 'DK': '🇩🇰', 'NL': '🇳🇱', 'CA': '🇨🇦',
  'AU': '🇦🇺', 'JP': '🇯🇵', 'CN': '🇨🇳', 'BR': '🇧🇷', 'ES': '🇪🇸',
  'IT': '🇮🇹', 'PL': '🇵🇱', 'RU': '🇷🇺', 'KR': '🇰🇷', 'MX': '🇲🇽',
}

const BROWSER_ICONS: Record<string, string> = {
  'Chrome': '🌐', 'Safari': '🧭', 'Firefox': '🦊', 'Edge': '🔷', 'Opera': '🔴', 'Other': '❓'
}

const OS_ICONS: Record<string, string> = {
  'Windows': '🪟', 'macOS': '🍎', 'iOS': '📱', 'Android': '🤖', 'Linux': '🐧', 'Other': '❓'
}

function LoginForm({ onLogin, error }: { onLogin: (password: string) => void; error: string | null }) {
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    await onLogin(password)
    setLoading(false)
  }

  return (
    <div style={styles.loginContainer}>
      <div style={styles.loginBox}>
        <h1 style={styles.loginTitle}>Admin</h1>
        <form onSubmit={handleSubmit}>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            style={styles.input}
            autoFocus
            disabled={loading}
          />
          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? 'Verifying...' : 'Login'}
          </button>
          {error && <div style={styles.loginError}>{error}</div>}
        </form>
      </div>
    </div>
  )
}

function StatCard({ value, label }: { value: number; label: string }) {
  return (
    <div style={styles.statCard}>
      <div style={styles.statValue}>{value.toLocaleString()}</div>
      <div style={styles.statLabel}>{label}</div>
    </div>
  )
}

function ItemList({ title, items, iconMap }: { title: string; items: ItemCount[]; iconMap?: Record<string, string> }) {
  return (
    <div style={styles.section}>
      <h2 style={styles.sectionTitle}>{title}</h2>
      <div style={styles.list}>
        {items.map((item) => (
          <div key={item.name} style={styles.listRow}>
            <span>
              {iconMap?.[item.name] ?? ''} {item.name}
            </span>
            <span style={styles.count}>{item.count}</span>
          </div>
        ))}
        {items.length === 0 && <div style={styles.empty}>No data yet</div>}
      </div>
    </div>
  )
}

function Dashboard({ stats, onLogout }: { stats: Stats; onLogout: () => void }) {
  const maxViews = Math.max(...stats.dailyStats.map(d => d.views), 1)

  return (
    <div style={styles.dashboard}>
      <div style={styles.header}>
        <h1 style={styles.title}>shamikmishra.com</h1>
        <button onClick={onLogout} style={styles.logoutButton}>Logout</button>
      </div>

      <div style={styles.statsGrid}>
        <StatCard value={stats.totalViews} label="Total Views" />
        <StatCard value={stats.todayViews} label="Today" />
      </div>

      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Last 7 Days</h2>
        <div style={styles.chart}>
          {stats.dailyStats.map((day) => (
            <div key={day.date} style={styles.chartBar}>
              <div style={styles.barValue}>{day.views}</div>
              <div style={{ ...styles.bar, height: `${Math.max((day.views / maxViews) * 100, 4)}%` }} />
              <div style={styles.barLabel}>{day.date.slice(5)}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={styles.gridThree}>
        <ItemList title="Commands" items={stats.topCommands} />
        <ItemList title="Countries" items={stats.countries.map(c => ({ ...c, name: `${COUNTRY_FLAGS[c.name] || '🌍'} ${c.name}` }))} />
        <ItemList title="Referrers" items={stats.referrers} />
      </div>

      <div style={styles.gridThree}>
        <ItemList title="Devices" items={stats.devices} iconMap={{ mobile: '📱', tablet: '📱', desktop: '💻' }} />
        <ItemList title="Browsers" items={stats.browsers} iconMap={BROWSER_ICONS} />
        <ItemList title="OS" items={stats.os} iconMap={OS_ICONS} />
      </div>
    </div>
  )
}

function App() {
  const [authenticated, setAuthenticated] = useState(false)
  const [stats, setStats] = useState<Stats | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const handleLogin = async (password: string) => {
    setError(null)
    try {
      const response = await fetch(`${API_URL}/auth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })

      if (response.ok) {
        setAuthenticated(true)
        localStorage.setItem('admin_auth', password)
        await fetchStats()
      } else {
        setError('Invalid password')
      }
    } catch {
      setError('Failed to connect')
    }
  }

  const handleLogout = () => {
    setAuthenticated(false)
    setStats(null)
    localStorage.removeItem('admin_auth')
  }

  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_URL}/stats`)
      if (!response.ok) throw new Error('Failed to fetch stats')
      const data = await response.json()
      setStats(data)
    } catch {
      setError('Failed to load stats')
    }
  }

  useEffect(() => {
    const savedPassword = localStorage.getItem('admin_auth')
    if (savedPassword) {
      handleLogin(savedPassword).finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (authenticated) {
      const interval = setInterval(fetchStats, 30000)
      return () => clearInterval(interval)
    }
  }, [authenticated])

  if (loading) return <div style={styles.loading}>Loading...</div>
  if (!authenticated) return <LoginForm onLogin={handleLogin} error={error} />
  if (!stats) return <div style={styles.loading}>Loading stats...</div>

  return <Dashboard stats={stats} onLogout={handleLogout} />
}

const styles: Record<string, React.CSSProperties> = {
  loginContainer: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#0a0a0a',
  },
  loginBox: {
    background: '#1a1a1a',
    padding: '40px',
    borderRadius: '12px',
    width: '320px',
  },
  loginTitle: {
    color: '#fff',
    marginBottom: '24px',
    textAlign: 'center',
    fontSize: '24px',
  },
  input: {
    width: '100%',
    padding: '14px',
    marginBottom: '16px',
    border: '1px solid #333',
    borderRadius: '8px',
    background: '#0a0a0a',
    color: '#fff',
    fontSize: '16px',
  },
  button: {
    width: '100%',
    padding: '14px',
    border: 'none',
    borderRadius: '8px',
    background: '#3b82f6',
    color: '#fff',
    fontSize: '16px',
    cursor: 'pointer',
  },
  loginError: {
    color: '#ef4444',
    marginTop: '12px',
    textAlign: 'center',
    fontSize: '14px',
  },
  dashboard: {
    minHeight: '100vh',
    background: '#0a0a0a',
    color: '#fff',
    padding: '32px',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '32px',
  },
  title: {
    fontSize: '24px',
    margin: 0,
  },
  logoutButton: {
    padding: '8px 16px',
    border: '1px solid #333',
    borderRadius: '6px',
    background: 'transparent',
    color: '#888',
    cursor: 'pointer',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '16px',
    marginBottom: '32px',
  },
  statCard: {
    background: '#1a1a1a',
    padding: '24px',
    borderRadius: '12px',
    textAlign: 'center',
  },
  statValue: {
    fontSize: '42px',
    fontWeight: 'bold',
    color: '#3b82f6',
  },
  statLabel: {
    color: '#888',
    marginTop: '8px',
    fontSize: '14px',
  },
  section: {
    marginBottom: '24px',
  },
  sectionTitle: {
    fontSize: '12px',
    marginBottom: '12px',
    color: '#666',
    textTransform: 'uppercase',
    letterSpacing: '1px',
  },
  chart: {
    display: 'flex',
    alignItems: 'flex-end',
    gap: '8px',
    height: '140px',
    background: '#1a1a1a',
    padding: '16px',
    borderRadius: '12px',
  },
  chartBar: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    height: '100%',
  },
  bar: {
    width: '100%',
    background: 'linear-gradient(180deg, #3b82f6 0%, #1d4ed8 100%)',
    borderRadius: '4px 4px 0 0',
    marginTop: 'auto',
  },
  barLabel: {
    fontSize: '10px',
    color: '#666',
    marginTop: '6px',
  },
  barValue: {
    fontSize: '11px',
    color: '#fff',
    marginBottom: '4px',
  },
  gridThree: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '16px',
    marginBottom: '24px',
  },
  list: {
    background: '#1a1a1a',
    borderRadius: '12px',
    overflow: 'hidden',
    maxHeight: '240px',
    overflowY: 'auto',
  },
  listRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '10px 14px',
    borderBottom: '1px solid #252525',
    fontSize: '13px',
  },
  count: {
    color: '#666',
    fontFamily: 'monospace',
  },
  empty: {
    padding: '20px',
    textAlign: 'center',
    color: '#555',
    fontSize: '13px',
  },
  loading: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#0a0a0a',
    color: '#fff',
  },
}

export default App
