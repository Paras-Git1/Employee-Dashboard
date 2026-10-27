import { useAuth } from './auth/AuthContext.jsx';
import { Dashboard } from './components/Dashboard.jsx';
import { Logo } from './components/Logo.jsx';
import { LoginPage } from './pages/LoginPage.jsx';

export default function App() {
  const { user, checking } = useAuth();
  if (checking) {
    return (
      <div className="boot" role="status">
        <Logo size={48} />
        <span className="sr-only">Loading…</span>
      </div>
    );
  }
  return user ? <Dashboard key={user.id} /> : <LoginPage />;
}
