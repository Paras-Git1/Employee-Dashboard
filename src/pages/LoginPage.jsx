import { useState } from 'react';
import { useAuth } from '../auth/AuthContext.jsx';
import { EyeIcon, EyeOffIcon } from '../components/Icons.jsx';
import { Brand } from '../components/Logo.jsx';

const DEMO_ACCOUNTS = [
  { email: 'admin@aulten.com', password: 'admin123', who: 'Admin', what: 'admin@aulten.com / admin123 · sees the whole team' },
  { email: 'employee@aulten.com', password: 'employee123', who: 'Employee', what: 'employee@aulten.com / employee123 · own tasks only' },
];

export function LoginPage() {
  const { login, notice } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(email, password);
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  }

  return (
    <div className="login">
      <div className="login-card">
        <Brand />
        <h1>Sign in</h1>
        <p className="login-sub">See your CRM and Helpdesk work in one prioritized list.</p>

        {notice && <div className="banner banner-info" role="status">{notice}</div>}
        {error && <div className="banner banner-error" role="alert">{error}</div>}

        <form onSubmit={handleSubmit} noValidate>
          <label className="field field-block">
            <span className="field-label">Work email</span>
            <input type="email" autoComplete="username" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@aulten.com" />
          </label>
          <label className="field field-block">
            <span className="field-label">Password</span>
            <span className="password-wrap">
              <input type={showPassword ? 'text' : 'password'} autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} />
              <button type="button" className="icon-btn" onClick={() => setShowPassword((v) => !v)} aria-label={showPassword ? 'Hide password' : 'Show password'}>
                {showPassword ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
              </button>
            </span>
          </label>
          <button type="submit" className="btn btn-primary btn-block" disabled={submitting || !email || !password}>
            {submitting ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        {import.meta.env.DEV && (
          <div className="demo">
            <p className="demo-title">Demo accounts (click to fill)</p>
            {DEMO_ACCOUNTS.map((a) => (
              <button type="button" key={a.email} className="demo-account" onClick={() => { setEmail(a.email); setPassword(a.password); }}>
                <strong>{a.who}</strong><span>{a.what}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
