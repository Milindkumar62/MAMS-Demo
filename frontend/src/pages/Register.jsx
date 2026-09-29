import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

// DEMO-ONLY page. Always creates a Logistics Officer account - see
// backend/src/controllers/authController.js for why. In a real deployment,
// this route (and the /api/auth/register endpoint behind it) should be
// disabled; accounts are created by an admin via the Users page instead.
export default function Register() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirm) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      await api.post('/auth/register', { name: form.name, email: form.email, password: form.password });
      // Registration returns a token too, but reusing login() keeps
      // AuthContext state/localStorage handling in exactly one place.
      await login(form.email, form.password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <form className="login-card" onSubmit={handleSubmit}>
        <h1>Create your Account</h1>
        {/* <p className="subtitle"></p> */}
        {/* <div className="callout-demo">
          Demo accounts are always created as <b>Logistics Officer</b> (view + record purchases/transfers,
          no admin or base-commander access). Real accounts are created by an admin.
        </div> */}
        {error && <div className="error-banner">{error}</div>}
        <label>
          Full name
          <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        </label>
        <label>
          Email
          <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
        </label>
        <label>
          Password
          <input type="password" minLength={8} value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })} required />
        </label>
        <label>
          Confirm password
          <input type="password" minLength={8} value={form.confirm}
            onChange={(e) => setForm({ ...form, confirm: e.target.value })} required />
        </label>
        <button type="submit" disabled={loading}>{loading ? 'Creating account...' : 'Create account'}</button>
        <p className="hint"><Link to="/login">Already have a login? Sign in</Link></p>
      </form>
    </div>
  );
}
