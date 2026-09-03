import { useEffect, useState } from 'react';
import { Navigate, NavLink, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import './App.css';

const defaultRegisterForm = {
  fullName: '',
  email: '',
  password: '',
  phone: '',
};

const defaultLoginForm = {
  email: '',
  password: '',
};

const demoAccounts = [
  { label: 'Aarav', email: 'aarav@shopkart.com', password: 'demo123' },
  { label: 'Meera', email: 'meera@shopkart.com', password: 'demo123' },
  { label: 'Rohan', email: 'rohan@shopkart.com', password: 'demo123' },
];

async function apiRequest(path, method = 'GET', body = null) {
  const options = {
    method,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(`/customers${path}`, options);
  const contentType = response.headers.get('content-type') || '';
  const data = contentType.includes('application/json') ? await response.json() : {};

  if (!response.ok) {
    throw new Error(data.message || 'Request failed');
  }

  return data;
}

function AuthPage({ user, setUser, setStatus }) {
  const [mode, setMode] = useState('login');
  const [registerForm, setRegisterForm] = useState(defaultRegisterForm);
  const [loginForm, setLoginForm] = useState(defaultLoginForm);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleRegisterChange = (event) => {
    const { name, value } = event.target;
    setRegisterForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleLoginChange = (event) => {
    const { name, value } = event.target;
    setLoginForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleRegister = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setStatus({ type: '', text: '' });

    try {
      const data = await apiRequest('/register', 'POST', registerForm);
      setStatus({ type: 'success', text: data.message || 'Registration successful' });
      setMode('login');
      setRegisterForm(defaultRegisterForm);
    } catch (error) {
      setStatus({ type: 'error', text: error.message });
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogin = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setStatus({ type: '', text: '' });

    try {
      const data = await apiRequest('/login', 'POST', loginForm);
      setUser(data.customer);
      setStatus({ type: 'success', text: data.message || 'Welcome back!' });
      setLoginForm(defaultLoginForm);
      navigate('/profile');
    } catch (error) {
      setStatus({ type: 'error', text: error.message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-grid">
      <section className="auth-card">
        <div className="card-header">
          <h2>{mode === 'login' ? 'Welcome back' : 'Create your account'}</h2>
          <p>
            {mode === 'login'
              ? 'Sign in to continue shopping securely.'
              : 'Register to start your ShopKart account.'}
          </p>
        </div>

        {mode === 'login' ? (
          <form onSubmit={handleLogin} className="auth-form">
            <div className="demo-box">
              <p>Demo accounts</p>
              <div className="demo-list">
                {demoAccounts.map((account) => (
                  <button
                    key={account.email}
                    type="button"
                    className="demo-account"
                    onClick={() => {
                      setLoginForm({ email: account.email, password: account.password });
                      setStatus({ type: 'success', text: `${account.label} account loaded` });
                    }}
                  >
                    {account.label}
                  </button>
                ))}
              </div>
            </div>

            <label>
              Email
              <input
                type="email"
                name="email"
                value={loginForm.email}
                onChange={handleLoginChange}
                placeholder="you@example.com"
                required
              />
            </label>

            <label>
              Password
              <input
                type="password"
                name="password"
                value={loginForm.password}
                onChange={handleLoginChange}
                placeholder="••••••••"
                required
              />
            </label>

            <button type="submit" disabled={submitting}>
              {submitting ? 'Signing in...' : 'Login'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="auth-form">
            <label>
              Full name
              <input
                type="text"
                name="fullName"
                value={registerForm.fullName}
                onChange={handleRegisterChange}
                placeholder="John Smith"
                required
              />
            </label>

            <label>
              Email
              <input
                type="email"
                name="email"
                value={registerForm.email}
                onChange={handleRegisterChange}
                placeholder="you@example.com"
                required
              />
            </label>

            <label>
              Phone
              <input
                type="tel"
                name="phone"
                value={registerForm.phone}
                onChange={handleRegisterChange}
                placeholder="9876543210"
                required
              />
            </label>

            <label>
              Password
              <input
                type="password"
                name="password"
                value={registerForm.password}
                onChange={handleRegisterChange}
                placeholder="At least 6 characters"
                minLength={6}
                required
              />
            </label>

            <button type="submit" disabled={submitting}>
              {submitting ? 'Creating account...' : 'Register'}
            </button>
          </form>
        )}

        <div className="form-switch">
          <span>{mode === 'login' ? 'Need an account?' : 'Already a customer?'}</span>
          <button type="button" onClick={() => setMode(mode === 'login' ? 'register' : 'login')}>
            {mode === 'login' ? 'Create account' : 'Login here'}
          </button>
        </div>
      </section>

      <aside className="feature-card">
        <div className="feature-badge">Secure checkout</div>
        <h3>Built for customer auth</h3>
        <ul>
          <li>Register with full name, email, phone, and password</li>
          <li>Login with JWT-based cookie authentication</li>
          <li>View your account profile after sign-in</li>
        </ul>
      </aside>
    </div>
  );
}

function ProfilePage({ user, setUser, setStatus }) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await apiRequest('/logout', 'POST');
    } catch (error) {
      console.error(error);
    } finally {
      setUser(null);
      setStatus({ type: 'success', text: 'Logged out successfully.' });
      navigate('/login');
    }
  };

  const overviewCards = [
    { label: 'Orders', value: '12', detail: 'This month' },
    { label: 'Saved items', value: '08', detail: 'In wishlist' },
    { label: 'Rewards', value: '2.4k', detail: 'Points' },
  ];

  const recentOrders = [
    { name: 'Wireless Earbuds', status: 'Delivered', price: '₹2,499' },
    { name: 'Smart Watch', status: 'In transit', price: '₹8,999' },
    { name: 'Running Shoes', status: 'Preparing', price: '₹4,299' },
  ];

  const wishlist = [
    { name: 'Noise Cancelling Headphones', price: '₹6,499' },
    { name: 'Leather Backpack', price: '₹2,199' },
    { name: 'Portable Speaker', price: '₹1,799' },
  ];

  const navItems = [
    { label: 'Overview', path: '/profile' },
    { label: 'Orders', path: '/orders' },
    { label: 'Wishlist', path: '/wishlist' },
    { label: 'Profile', path: '/profile#details' },
  ];

  const isOrdersPage = location.pathname === '/orders';
  const isWishlistPage = location.pathname === '/wishlist';

  return (
    <div className="dashboard-shell">
      <nav className="dashboard-nav">
        <div className="nav-brand">ShopKart</div>
        <div className="nav-links">
          {navItems.map((item) => (
            <NavLink
              key={item.label}
              to={item.path}
              className={({ isActive }) => (isActive ? 'active' : '')}
            >
              {item.label}
            </NavLink>
          ))}
        </div>
        <button className="logout-button compact" onClick={handleLogout} type="button">
          Logout
        </button>
      </nav>

      <section className="welcome-panel">
        <div>
          <p className="eyebrow accent">{isOrdersPage ? 'Your activity' : isWishlistPage ? 'Saved for later' : 'Welcome back'}</p>
          <h2>
            {isOrdersPage ? 'Your orders' : isWishlistPage ? 'Your wishlist' : `Hello, ${user.fullName}`}
          </h2>
        </div>
        <div className="welcome-badge">{isOrdersPage ? '3 recent orders' : isWishlistPage ? '3 saved items' : 'Premium member'}</div>
      </section>

      {!isOrdersPage && !isWishlistPage && (
        <>
          <div className="summary-grid">
            {overviewCards.map((card) => (
              <div key={card.label} className="summary-card">
                <span>{card.label}</span>
                <strong>{card.value}</strong>
                <small>{card.detail}</small>
              </div>
            ))}
          </div>

          <div className="content-grid">
            <section className="profile-card dashboard-panel" id="details">
              <div className="card-header profile-header">
                <h2>My profile</h2>
              </div>
              <div className="profile-row">
                <span className="label">Name</span>
                <strong>{user.fullName}</strong>
              </div>
              <div className="profile-row">
                <span className="label">Email</span>
                <strong>{user.email}</strong>
              </div>
              <div className="profile-row">
                <span className="label">Phone</span>
                <strong>{user.phone}</strong>
              </div>
            </section>

            <section className="profile-card dashboard-panel">
              <div className="card-header profile-header">
                <h2>Recent orders</h2>
              </div>
              <ul className="order-list">
                {recentOrders.map((order) => (
                  <li key={order.name}>
                    <div>
                      <strong>{order.name}</strong>
                      <small>{order.status}</small>
                    </div>
                    <span>{order.price}</span>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </>
      )}

      {isOrdersPage && (
        <section className="profile-card dashboard-panel full-panel">
          <div className="card-header profile-header">
            <h2>Order history</h2>
            <span className="panel-note">All recent purchases</span>
          </div>
          <ul className="order-list">
            {recentOrders.map((order, index) => (
              <li key={order.name}>
                <div>
                  <strong>Order #SK-{2024 + index}</strong>
                  <small>{order.name} · {order.status}</small>
                </div>
                <span>{order.price}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {isWishlistPage && (
        <section className="profile-card dashboard-panel full-panel">
          <div className="card-header profile-header">
            <h2>Saved items</h2>
            <span className="panel-note">Ready when you are</span>
          </div>
          <ul className="order-list">
            {wishlist.map((item) => (
              <li key={item.name}>
                <div>
                  <strong>{item.name}</strong>
                  <small>In your wishlist</small>
                </div>
                <span>{item.price}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState({ type: '', text: '' });

  useEffect(() => {
    const checkSession = async () => {
      try {
        const data = await apiRequest('/me');
        setUser(data);
      } catch (error) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, []);

  if (loading) {
    return (
      <div className="app-shell">
        <div className="loading-card">Checking your session...</div>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <div className="topbar">
        <div>
          <p className="eyebrow">Customer Portal</p>
          <h1>ShopKart</h1>
        </div>
      </div>

      {status.text && <div className={`status-banner ${status.type}`}>{status.text}</div>}

      <Routes>
        <Route
          path="/login"
          element={
            user ? <Navigate to="/profile" replace /> : <AuthPage user={user} setUser={setUser} setStatus={setStatus} />
          }
        />

        <Route
          path="/profile"
          element={user ? <ProfilePage user={user} setUser={setUser} setStatus={setStatus} /> : <Navigate to="/login" replace />}
        />

        <Route
          path="/orders"
          element={user ? <ProfilePage user={user} setUser={setUser} setStatus={setStatus} /> : <Navigate to="/login" replace />}
        />

        <Route
          path="/wishlist"
          element={user ? <ProfilePage user={user} setUser={setUser} setStatus={setStatus} /> : <Navigate to="/login" replace />}
        />

        <Route path="*" element={<Navigate to={user ? '/profile' : '/login'} replace />} />
      </Routes>
    </div>
  );
}

export default App;
