import { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  Bell,
  ChevronRight,
  ExternalLink,
  LineChart,
  Loader2,
  LogOut,
  Plus,
  Search,
  Settings,
  ShoppingBag,
  Sparkles,
  Trash2,
  TrendingDown,
  TrendingUp,
  User,
  Zap
} from 'lucide-react';
import {
  Line,
  LineChart as RechartsLineChart,
  ResponsiveContainer,
  Tooltip,
  YAxis
} from 'recharts';
import {
  clearToken,
  createProduct,
  getMe,
  getProducts,
  getStoredToken,
  requestOtp,
  scrapeProduct,
  storeToken,
  verifyOtp
} from './lib/api.js';

const currencySymbol = '₹';
const formatCurrency = (value) => `${currencySymbol}${Number(value).toFixed(2)}`;

function Button({ children, className = '', variant = 'primary', ...props }) {
  return (
    <button className={`button button-${variant} ${className}`} {...props}>
      {children}
    </button>
  );
}

function LandingPage({ onEnter }) {
  return (
    <div className="page">
      <header className="topbar glass">
        <div className="brand">
          <div className="brand-mark">P</div>
          <span>PricePulse</span>
        </div>
        <nav className="nav-links">
          <a href="#features">Features</a>
          <button type="button" onClick={onEnter}>Dashboard</button>
        </nav>
        <Button onClick={onEnter}>Log In</Button>
      </header>

      <main>
        <section className="hero">
          <div className="hero-media" aria-hidden="true">
            <div className="hero-grid">
              <div className="hero-product large">
                <ShoppingBag />
                <span>Noise-cancelling headphones</span>
                <strong>{formatCurrency(179.99)}</strong>
              </div>
              <div className="hero-product">
                <LineChart />
                <span>Price trend</span>
                <strong>-18%</strong>
              </div>
              <div className="hero-product">
                <Bell />
                <span>Target hit</span>
                <strong>{formatCurrency(149.0)}</strong>
              </div>
            </div>
          </div>
          <div className="hero-copy">
            <div className="eyebrow">
              <Activity size={14} />
              AI-assisted price tracking
            </div>
            <h1>PricePulse</h1>
            <p>
              Track products, monitor target prices, and keep a live history of the deals you care about.
            </p>
            <div className="hero-actions">
              <Button onClick={onEnter} className="button-lg">
                Log In To Track
                <ChevronRight size={20} />
              </Button>
              <a href="#features" className="button button-secondary button-lg">See Features</a>
            </div>
          </div>
        </section>

        <section id="features" className="features">
          {[
            ['Smart capture', 'Paste a product URL and PricePulse tries to extract name, image, price, and retailer.'],
            ['MongoDB history', 'Products and price history are persisted through the Express API.'],
            ['Decision hints', 'Buy-now or wait labels help you scan your tracked items quickly.']
          ].map(([title, description]) => (
            <article className="feature-card" key={title}>
              <Sparkles />
              <h2>{title}</h2>
              <p>{description}</p>
            </article>
          ))}
        </section>
      </main>
    </div>
  );
}

function AuthPage({ onAuthenticated, onHome }) {
  const [identifier, setIdentifier] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState('identifier');
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  async function handleRequestOtp(event) {
    event.preventDefault();
    setLoading(true);
    setError('');
    setNotice('');

    try {
      const result = await requestOtp(identifier);
      setStep('otp');
      setNotice(result.message || 'OTP sent.');
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOtp(event) {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await verifyOtp(identifier, otp);
      storeToken(result.token);
      onAuthenticated(result.user);
    } catch (verifyError) {
      setError(verifyError.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <header className="topbar glass">
        <button className="brand" type="button" onClick={onHome}>
          <div className="brand-mark">P</div>
          <span>PricePulse</span>
        </button>
      </header>

      <main className="auth-main">
        <section className="auth-panel glass">
          <div className="auth-copy">
            <div className="eyebrow"><Sparkles size={14} /> Secure OTP Login</div>
            <h1>Sign in to PricePulse</h1>
            <p>Use your email address or phone number. The dashboard opens only after a valid OTP is verified.</p>
          </div>

          {step === 'identifier' ? (
            <form className="form" onSubmit={handleRequestOtp}>
              <label>
                <span>Email or phone number</span>
                <input required placeholder="you@example.com or +919876543210" value={identifier} onChange={(event) => setIdentifier(event.target.value)} />
              </label>
              <Button type="submit" disabled={loading}>
                {loading ? <Loader2 className="spin" size={18} /> : <Bell size={18} />}
                Send OTP
              </Button>
            </form>
          ) : (
            <form className="form" onSubmit={handleVerifyOtp}>
              <label>
                <span>OTP</span>
                <input required placeholder="Enter any OTP" value={otp} onChange={(event) => setOtp(event.target.value)} />
              </label>
              <Button type="submit" disabled={loading || otp.trim().length === 0}>
                {loading ? <Loader2 className="spin" size={18} /> : <User size={18} />}
                Verify & Continue
              </Button>
              <button className="text-button" type="button" onClick={() => setStep('identifier')}>Use a different email or phone</button>
            </form>
          )}

          {notice && <div className="notice success">{notice}</div>}
          {error && <div className="notice danger">{error}</div>}
        </section>
      </main>
    </div>
  );
}

function AddProductDialog({ onAdd }) {
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [manualMode, setManualMode] = useState(false);
  const [manual, setManual] = useState({
    name: '',
    currentPrice: '',
    targetPrice: '',
    imageUrl: '',
    retailer: '',
    url: ''
  });

  async function handleScrape(event) {
    event.preventDefault();
    if (!url) return;

    setLoading(true);
    try {
      const details = await scrapeProduct(url);
      await onAdd({
        ...details,
        targetPrice: details.currentPrice * 0.9
      });
      setUrl('');
      setOpen(false);
    } finally {
      setLoading(false);
    }
  }

  async function handleManualSubmit(event) {
    event.preventDefault();
    await onAdd({
      ...manual,
      currentPrice: Number(manual.currentPrice),
      targetPrice: Number(manual.targetPrice || manual.currentPrice),
      imageUrl: manual.imageUrl || 'https://picsum.photos/seed/manual-product/600/400',
      retailer: manual.retailer || 'Manual Entry',
      url: manual.url || '#'
    });
    setManual({ name: '', currentPrice: '', targetPrice: '', imageUrl: '', retailer: '', url: '' });
    setOpen(false);
  }

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus size={18} />
        Track New Product
      </Button>
      {open && (
        <div className="modal-backdrop" role="presentation" onMouseDown={() => setOpen(false)}>
          <section className="modal glass" role="dialog" aria-modal="true" onMouseDown={(event) => event.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h2>{manualMode ? 'Add Product Manually' : 'Product URL Capture'}</h2>
                <p>{manualMode ? 'Enter the product details yourself.' : 'Paste a product URL and the server will try to extract details.'}</p>
              </div>
              <button className="icon-button" type="button" onClick={() => setOpen(false)}>×</button>
            </div>

            <div className="segmented">
              <button className={!manualMode ? 'active' : ''} type="button" onClick={() => setManualMode(false)}>URL</button>
              <button className={manualMode ? 'active' : ''} type="button" onClick={() => setManualMode(true)}>Manual</button>
            </div>

            {manualMode ? (
              <form className="form" onSubmit={handleManualSubmit}>
                <input required placeholder="Product name" value={manual.name} onChange={(event) => setManual({ ...manual, name: event.target.value })} />
                <input required type="number" min="0" step="0.01" placeholder="Current price" value={manual.currentPrice} onChange={(event) => setManual({ ...manual, currentPrice: event.target.value })} />
                <input type="number" min="0" step="0.01" placeholder="Target price" value={manual.targetPrice} onChange={(event) => setManual({ ...manual, targetPrice: event.target.value })} />
                <input placeholder="Image URL" value={manual.imageUrl} onChange={(event) => setManual({ ...manual, imageUrl: event.target.value })} />
                <input placeholder="Retailer" value={manual.retailer} onChange={(event) => setManual({ ...manual, retailer: event.target.value })} />
                <input placeholder="Product URL" value={manual.url} onChange={(event) => setManual({ ...manual, url: event.target.value })} />
                <Button type="submit">Save Product</Button>
              </form>
            ) : (
              <form className="form" onSubmit={handleScrape}>
                <div className="input-with-icon">
                  <Search size={18} />
                  <input required type="url" placeholder="https://store.com/product/..." value={url} onChange={(event) => setUrl(event.target.value)} />
                </div>
                <Button type="submit" disabled={loading}>
                  {loading ? <Loader2 className="spin" size={18} /> : <Sparkles size={18} />}
                  {loading ? 'Analyzing Page...' : 'Extract Details'}
                </Button>
              </form>
            )}
          </section>
        </div>
      )}
    </>
  );
}

function PriceChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <RechartsLineChart data={data}>
        <Line type="monotone" dataKey="price" stroke="rgb(118 123 255)" strokeWidth={2} dot={false} />
        <YAxis hide domain={['dataMin - 10', 'dataMax + 10']} />
        <Tooltip
          content={({ active, payload }) => {
            if (!active || !payload?.length) return null;
            return <div className="chart-tip">{formatCurrency(payload[0].value)}</div>;
          }}
        />
      </RechartsLineChart>
    </ResponsiveContainer>
  );
}

function ProductCard({ product }) {
  const latestPrice = Number(product.currentPrice) || 0;
  const history = product.priceHistory?.length ? product.priceHistory : [{ price: latestPrice, date: new Date().toISOString() }];
  const previousPrice = history[history.length - 2]?.price || latestPrice;
  const priceDropped = latestPrice < previousPrice;
  const priceDiff = Math.abs(latestPrice - previousPrice);
  const diffPercent = previousPrice ? ((priceDiff / previousPrice) * 100).toFixed(1) : '0.0';
  const progressToTarget = latestPrice ? Math.min(100, ((Number(product.targetPrice) || latestPrice) / latestPrice) * 100) : 0;
  const fallbackImage = `https://picsum.photos/seed/${encodeURIComponent(product.retailer || product.name || 'product')}/600/400`;

  return (
    <article className="product-card">
      <div className="product-image">
        <img
          src={product.imageUrl || fallbackImage}
          alt={product.name}
          referrerPolicy="no-referrer"
          onError={(event) => {
            event.currentTarget.onerror = null;
            event.currentTarget.src = fallbackImage;
          }}
        />
        <div className="badge-stack">
          <span className="badge">{product.retailer}</span>
          <span className={`badge ${product.recommendation === 'buy_now' ? 'good' : 'warn'}`}>
            <Zap size={13} />
            {product.recommendation === 'buy_now' ? 'Buy Now' : 'Wait'}
          </span>
        </div>
      </div>
      <div className="product-body">
        <div>
          <h3>{product.name}</h3>
          <p>Last checked {product.lastChecked || 'recently'}</p>
        </div>
        <div className="price-row">
          <div>
            <span>Current Price</span>
            <strong>{formatCurrency(latestPrice)}</strong>
          </div>
          <div className={priceDropped ? 'delta down' : 'delta up'}>
            {priceDropped ? <TrendingDown size={15} /> : <TrendingUp size={15} />}
            {diffPercent}%
          </div>
          <div className="target">
            <span>Target</span>
            <strong>{formatCurrency(Number(product.targetPrice || latestPrice))}</strong>
          </div>
        </div>
        <div className="progress-label">
          <span>Progress to target</span>
          <strong>{progressToTarget.toFixed(0)}%</strong>
        </div>
        <div className="progress-track">
          <span style={{ width: `${progressToTarget}%` }} />
        </div>
        <div className="mini-chart">
          <PriceChart data={history} />
        </div>
      </div>
      <footer className="product-actions">
        <Button variant="secondary" className="grow">
          <Bell size={17} />
          Manage Alerts
        </Button>
        <a className="icon-link" href={product.url} target="_blank" rel="noreferrer" aria-label={`Open ${product.name}`}>
          <ExternalLink size={18} />
        </a>
      </footer>
    </article>
  );
}

function Dashboard({ onHome, onLogout, user }) {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState('');

  async function loadProducts() {
    setLoading(true);
    try {
      setProducts(await getProducts());
    } catch (error) {
      setNotice(error.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProducts();
  }, []);

  async function handleAddProduct(data) {
    const product = {
      name: data.name,
      imageUrl: data.imageUrl || 'https://picsum.photos/seed/placeholder/600/400',
      currentPrice: Number(data.currentPrice),
      targetPrice: Number(data.targetPrice || data.currentPrice * 0.9),
      retailer: data.retailer || 'Unknown',
      url: data.url || '#',
      lastChecked: 'Just now',
      recommendation: Number(data.currentPrice) <= Number(data.targetPrice) ? 'buy_now' : 'wait',
      priceHistory: [{ date: new Date().toISOString(), price: Number(data.currentPrice) }]
    };
    const result = await createProduct(product);
    setProducts((current) => [{ ...product, id: result.id }, ...current]);
    setNotice(`${product.name} is now being tracked.`);
  }

  const filteredProducts = useMemo(() => {
    const query = search.toLowerCase();
    return products.filter((product) => (
      product.name?.toLowerCase().includes(query) ||
      product.retailer?.toLowerCase().includes(query)
    ));
  }, [products, search]);

  const retailerCount = new Set(products.map((product) => product.retailer)).size;

  return (
    <div className="dashboard-shell">
      <aside className="sidebar">
        <button className="brand sidebar-brand" type="button" onClick={onHome}>
          <div className="brand-mark">P</div>
          <span>PricePulse</span>
        </button>
        <div className="sidebar-nav">
          <a className="active" href="#dashboard"><Activity size={18} /> Dashboard</a>
          <a href="#tracked"><ShoppingBag size={18} /> Tracked Products</a>
          <a href="#alerts"><Bell size={18} /> Alerts</a>
          <a href="#settings"><Settings size={18} /> Settings</a>
        </div>
      </aside>

      <main className="dashboard-main">
        <header className="dashboard-top glass">
          <div className="input-with-icon search-box">
            <Search size={18} />
            <input placeholder="Search tracked items..." value={search} onChange={(event) => setSearch(event.target.value)} />
          </div>
          <div className="profile">
            <div>
              <strong>{user?.identifier || 'Signed in'}</strong>
              <span>{user?.channel === 'phone' ? 'Phone verified' : 'Email verified'}</span>
            </div>
            <User size={20} />
            <button className="icon-button" type="button" onClick={onLogout} aria-label="Log out">
              <LogOut size={18} />
            </button>
          </div>
        </header>

        <section className="dashboard-content" id="dashboard">
          <div className="dashboard-heading">
            <div>
              <div className="eyebrow"><Activity size={14} /> Real-time pulse</div>
              <h1>Price Tracker</h1>
              <p>Monitoring {products.length} products across the web.</p>
            </div>
            <AddProductDialog onAdd={handleAddProduct} />
          </div>

          {notice && (
            <button className="notice" type="button" onClick={() => setNotice('')}>
              {notice}
            </button>
          )}

          <div className="stats">
            <Stat label="Total Tracked" value={products.length} trend={products.length > 0 ? 'Active monitoring' : 'Ready to start'} />
            <Stat label="Active Alerts" value="0" trend="No price hits yet" />
            <Stat label="Tracked Retailers" value={retailerCount} trend="Across retailers" />
            <Stat label="Market Pulse" value="Live" trend="Synced with MongoDB" />
          </div>

          {loading ? (
            <div className="empty-state">
              <Loader2 className="spin" size={40} />
              <p>Syncing with database...</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="empty-state">
              <ShoppingBag size={52} />
              <h2>No items tracked yet</h2>
              <p>Add your first product URL to start monitoring price drops and trends.</p>
            </div>
          ) : (
            <div className="product-grid" id="tracked">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

function Stat({ label, value, trend }) {
  return (
    <article className="stat">
      <span>{label}</span>
      <strong>{value}</strong>
      <p>{trend}</p>
    </article>
  );
}

export default function App() {
  const [view, setView] = useState(() => window.location.hash === '#dashboard' && getStoredToken() ? 'dashboard' : 'home');
  const [user, setUser] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(Boolean(getStoredToken()));

  useEffect(() => {
    async function loadSession() {
      if (!getStoredToken()) {
        setCheckingAuth(false);
        return;
      }

      try {
        const result = await getMe();
        setUser(result.user);
        setView('dashboard');
      } catch {
        clearToken();
        setUser(null);
        setView('home');
      } finally {
        setCheckingAuth(false);
      }
    }

    loadSession();
  }, []);

  useEffect(() => {
    window.location.hash = view === 'dashboard' ? 'dashboard' : view === 'auth' ? 'login' : '';
  }, [view]);

  function handleAuthenticated(nextUser) {
    setUser(nextUser);
    setView('dashboard');
  }

  function handleLogout() {
    clearToken();
    setUser(null);
    setView('home');
  }

  if (checkingAuth) {
    return (
      <div className="empty-state full-screen">
        <Loader2 className="spin" size={40} />
        <p>Checking session...</p>
      </div>
    );
  }

  if (view === 'dashboard') {
    return <Dashboard user={user} onHome={() => setView('home')} onLogout={handleLogout} />;
  }

  if (view === 'auth') {
    return <AuthPage onHome={() => setView('home')} onAuthenticated={handleAuthenticated} />;
  }

  return <LandingPage onEnter={() => setView('auth')} />;
}
