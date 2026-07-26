import { useState, useEffect } from 'react'

const API_URL = 'https://api.shamikmishra.com'

interface DailyStats {
  date: string
  views: number
  uniqueVisitors: number
}

interface ItemCount {
  name: string
  count: number
}

interface DailyBreakdown {
  date: string
  items: ItemCount[]
}

interface Stats {
  totalViews: number
  totalUniqueVisitors: number
  todayViews: number
  todayUniqueVisitors: number
  dailyStats: DailyStats[]
  topCommands: ItemCount[]
  countries: ItemCount[]
  countriesByDay: DailyBreakdown[]
  cities: ItemCount[]
  citiesByDay: DailyBreakdown[]
  regions: ItemCount[]
  timezones: ItemCount[]
  hourOfDay: ItemCount[]
  dayOfWeek: ItemCount[]
  devices: ItemCount[]
  browsers: ItemCount[]
  os: ItemCount[]
  referrers: ItemCount[]
  referrersByDay: DailyBreakdown[]
}

interface ServiceCost {
  service: string
  amount: number
}

interface Billing {
  currentMonth: string
  totalCost: number
  forecastedCost: number | null
  serviceBreakdown: ServiceCost[]
  lastUpdated: string
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

const DAY_ORDER = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY']
const DAY_SHORT: Record<string, string> = {
  'MONDAY': 'Mon', 'TUESDAY': 'Tue', 'WEDNESDAY': 'Wed', 'THURSDAY': 'Thu',
  'FRIDAY': 'Fri', 'SATURDAY': 'Sat', 'SUNDAY': 'Sun'
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

function BillingCard({ billing }: { billing: Billing | null }) {
  if (!billing) return null

  const updatedTime = billing.lastUpdated ? new Date(billing.lastUpdated).toLocaleTimeString() : ''

  return (
    <div style={styles.billingCard}>
      <div style={styles.billingHeader}>
        <span style={styles.billingTitle}>💰 AWS Bill ({billing.currentMonth})</span>
        <span style={styles.billingUpdated}>Updated {updatedTime}</span>
      </div>
      <div style={styles.billingAmount}>
        ${billing.totalCost.toFixed(2)}
        {billing.forecastedCost && (
          <span style={styles.billingForecast}> → ${billing.forecastedCost.toFixed(2)} est.</span>
        )}
      </div>
      <div style={styles.billingServices}>
        {billing.serviceBreakdown.slice(0, 5).map((s) => (
          <div key={s.service} style={styles.billingServiceRow}>
            <span style={styles.billingServiceName}>{s.service.replace('Amazon ', '').replace('AWS ', '')}</span>
            <span style={styles.billingServiceCost}>${s.amount.toFixed(2)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function Dashboard({ stats, billing, onLogout }: { stats: Stats; billing: Billing | null; onLogout: () => void }) {
  const maxViews = Math.max(...stats.dailyStats.map(d => d.views), 1)
  const sortedHours = [...stats.hourOfDay].sort((a, b) => parseInt(a.name) - parseInt(b.name))
  const sortedDays = [...stats.dayOfWeek].sort((a, b) => DAY_ORDER.indexOf(a.name) - DAY_ORDER.indexOf(b.name))

  return (
    <div style={styles.dashboard}>
      <div style={styles.header}>
        <h1 style={styles.title}>shamikmishra.com</h1>
        <div style={styles.headerRight}>
          <BillingCard billing={billing} />
          <button onClick={onLogout} style={styles.logoutButton}>Logout</button>
        </div>
      </div>

      <div style={styles.statsGrid}>
        <StatCard value={stats.totalViews} label="Total Views" />
        <StatCard value={stats.totalUniqueVisitors} label="Unique Visitors" />
        <StatCard value={stats.todayViews} label="Today Views" />
        <StatCard value={stats.todayUniqueVisitors} label="Today Unique" />
      </div>

      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Last 7 Days</h2>
        <div style={styles.chart}>
          {stats.dailyStats.map((day) => (
            <div key={day.date} style={styles.chartBar}>
              <div style={styles.barValue}>{day.views} / {day.uniqueVisitors}</div>
              <div style={{ ...styles.bar, height: `${Math.max((day.views / maxViews) * 100, 4)}%` }} />
              <div style={styles.barLabel}>{day.date.slice(5)}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={styles.gridTwo}>
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Hour of Day (UTC)</h2>
          <div style={styles.hourChart}>
            {sortedHours.map((h) => {
              const maxHour = Math.max(...stats.hourOfDay.map(x => x.count), 1)
              return (
                <div key={h.name} style={styles.hourBar}>
                  <div style={{ ...styles.hourFill, height: `${(h.count / maxHour) * 100}%` }} />
                  <div style={styles.hourLabel}>{h.name}</div>
                </div>
              )
            })}
          </div>
        </div>
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Day of Week</h2>
          <div style={styles.hourChart}>
            {sortedDays.map((d) => {
              const maxDay = Math.max(...stats.dayOfWeek.map(x => x.count), 1)
              return (
                <div key={d.name} style={styles.hourBar}>
                  <div style={{ ...styles.hourFill, height: `${(d.count / maxDay) * 100}%` }} />
                  <div style={styles.hourLabel}>{DAY_SHORT[d.name] || d.name}</div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <div style={styles.gridThree}>
        <ItemList title="Commands" items={stats.topCommands} />
        <ItemList title="Countries" items={stats.countries.map(c => ({ ...c, name: `${COUNTRY_FLAGS[c.name] || '🌍'} ${c.name}` }))} />
        <ItemList title="Cities" items={stats.cities} />
      </div>

      <div style={styles.gridThree}>
        <ItemList title="Regions" items={stats.regions} />
        <ItemList title="Timezones" items={stats.timezones} />
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
  const [billing, setBilling] = useState<Billing | null>(null)
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
        await fetchBilling()
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
    setBilling(null)
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

  const fetchBilling = async () => {
    try {
      const response = await fetch(`${API_URL}/billing`)
      if (response.ok) {
        const data = await response.json()
        setBilling(data)
      }
    } catch {
      // Billing is optional, don't show error
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
      const statsInterval = setInterval(fetchStats, 30000)
      const billingInterval = setInterval(fetchBilling, 300000)
      return () => {
        clearInterval(statsInterval)
        clearInterval(billingInterval)
      }
    }
  }, [authenticated])

  if (loading) return <div style={styles.loading}>Loading...</div>
  if (!authenticated) return <LoginForm onLogin={handleLogin} error={error} />
  if (!stats) return <div style={styles.loading}>Loading stats...</div>

  return <Dashboard stats={stats} billing={billing} onLogout={handleLogout} />
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
    alignItems: 'flex-start',
    marginBottom: '32px',
  },
  headerRight: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '16px',
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
  billingCard: {
    background: '#1a1a1a',
    padding: '12px 16px',
    borderRadius: '8px',
    minWidth: '200px',
  },
  billingHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '4px',
  },
  billingTitle: {
    fontSize: '11px',
    color: '#888',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  billingUpdated: {
    fontSize: '9px',
    color: '#555',
  },
  billingAmount: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#10b981',
    marginBottom: '8px',
  },
  billingForecast: {
    fontSize: '12px',
    color: '#888',
    fontWeight: 'normal',
  },
  billingServices: {
    borderTop: '1px solid #333',
    paddingTop: '8px',
  },
  billingServiceRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '10px',
    color: '#888',
    marginBottom: '2px',
  },
  billingServiceName: {
    maxWidth: '140px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  billingServiceCost: {
    fontFamily: 'monospace',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
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
  gridTwo: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '16px',
    marginBottom: '24px',
  },
  hourChart: {
    display: 'flex',
    alignItems: 'flex-end',
    gap: '2px',
    height: '100px',
    background: '#1a1a1a',
    padding: '16px',
    borderRadius: '12px',
  },
  hourBar: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    height: '100%',
  },
  hourFill: {
    width: '100%',
    background: '#3b82f6',
    borderRadius: '2px 2px 0 0',
    marginTop: 'auto',
    minHeight: '2px',
  },
  hourLabel: {
    fontSize: '8px',
    color: '#666',
    marginTop: '4px',
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
