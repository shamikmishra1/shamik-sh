import { useState, useEffect } from 'react'

const API_URL = 'https://api.shamikmishra.com'

interface DailyStats {
  date: string
  views: number
}

interface CommandStats {
  command: string
  count: number
}

interface CountryStats {
  country: string
  count: number
}

interface DeviceStats {
  device: string
  count: number
}

interface Stats {
  totalViews: number
  todayViews: number
  dailyStats: DailyStats[]
  topCommands: CommandStats[]
  topCountries: CountryStats[]
  devices: DeviceStats[]
}

const COUNTRY_FLAGS: Record<string, string> = {
  'NO': '🇳🇴', 'US': '🇺🇸', 'GB': '🇬🇧', 'DE': '🇩🇪', 'IN': '🇮🇳',
  'FR': '🇫🇷', 'SE': '🇸🇪', 'DK': '🇩🇰', 'NL': '🇳🇱', 'CA': '🇨🇦',
  'AU': '🇦🇺', 'JP': '🇯🇵', 'CN': '🇨🇳', 'BR': '🇧🇷', 'ES': '🇪🇸',
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

function Dashboard({ stats, onLogout }: { stats: Stats; onLogout: () => void }) {
  const maxViews = Math.max(...stats.dailyStats.map(d => d.views), 1)

  return (
    <div style={styles.dashboard}>
      <div style={styles.header}>
        <h1 style={styles.title}>shamikmishra.com</h1>
        <button onClick={onLogout} style={styles.logoutButton}>Logout</button>
      </div>

      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={styles.statValue}>{stats.totalViews}</div>
          <div style={styles.statLabel}>Total Views</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statValue}>{stats.todayViews}</div>
          <div style={styles.statLabel}>Today</div>
        </div>
      </div>

      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Last 7 Days</h2>
        <div style={styles.chart}>
          {stats.dailyStats.map((day) => (
            <div key={day.date} style={styles.chartBar}>
              <div style={styles.barValue}>{day.views}</div>
              <div
                style={{
                  ...styles.bar,
                  height: `${Math.max((day.views / maxViews) * 100, 4)}%`,
                }}
              />
              <div style={styles.barLabel}>{day.date.slice(5)}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={styles.gridTwo}>
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Top Commands</h2>
          <div style={styles.list}>
            {stats.topCommands.map((cmd) => (
              <div key={cmd.command} style={styles.listRow}>
                <code style={styles.code}>{cmd.command}</code>
                <span style={styles.count}>{cmd.count}</span>
              </div>
            ))}
            {stats.topCommands.length === 0 && (
              <div style={styles.empty}>No data yet</div>
            )}
          </div>
        </div>

        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Countries</h2>
          <div style={styles.list}>
            {stats.topCountries.map((c) => (
              <div key={c.country} style={styles.listRow}>
                <span>{COUNTRY_FLAGS[c.country] || '🌍'} {c.country}</span>
                <span style={styles.count}>{c.count}</span>
              </div>
            ))}
            {stats.topCountries.length === 0 && (
              <div style={styles.empty}>No data yet</div>
            )}
          </div>
        </div>
      </div>

      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Devices</h2>
        <div style={styles.deviceGrid}>
          {stats.devices.map((d) => (
            <div key={d.device} style={styles.deviceCard}>
              <div style={styles.deviceIcon}>
                {d.device === 'mobile' ? '📱' : d.device === 'tablet' ? '📱' : '💻'}
              </div>
              <div style={styles.deviceName}>{d.device}</div>
              <div style={styles.deviceCount}>{d.count}</div>
            </div>
          ))}
          {stats.devices.length === 0 && (
            <div style={styles.empty}>No data yet</div>
          )}
        </div>
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

  if (loading) {
    return <div style={styles.loading}>Loading...</div>
  }

  if (!authenticated) {
    return <LoginForm onLogin={handleLogin} error={error} />
  }

  if (!stats) {
    return <div style={styles.loading}>Loading stats...</div>
  }

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
    maxWidth: '900px',
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
    marginBottom: '32px',
  },
  sectionTitle: {
    fontSize: '14px',
    marginBottom: '16px',
    color: '#888',
    textTransform: 'uppercase',
    letterSpacing: '1px',
  },
  chart: {
    display: 'flex',
    alignItems: 'flex-end',
    gap: '8px',
    height: '160px',
    background: '#1a1a1a',
    padding: '20px',
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
    fontSize: '11px',
    color: '#666',
    marginTop: '8px',
  },
  barValue: {
    fontSize: '12px',
    color: '#fff',
    marginBottom: '4px',
  },
  gridTwo: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '24px',
  },
  list: {
    background: '#1a1a1a',
    borderRadius: '12px',
    overflow: 'hidden',
  },
  listRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '14px 16px',
    borderBottom: '1px solid #252525',
  },
  code: {
    color: '#3b82f6',
    fontFamily: 'monospace',
  },
  count: {
    color: '#888',
  },
  empty: {
    padding: '24px',
    textAlign: 'center',
    color: '#666',
  },
  deviceGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '16px',
  },
  deviceCard: {
    background: '#1a1a1a',
    padding: '20px',
    borderRadius: '12px',
    textAlign: 'center',
  },
  deviceIcon: {
    fontSize: '28px',
    marginBottom: '8px',
  },
  deviceName: {
    color: '#888',
    fontSize: '14px',
    textTransform: 'capitalize',
  },
  deviceCount: {
    color: '#3b82f6',
    fontSize: '20px',
    fontWeight: 'bold',
    marginTop: '4px',
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
