import { useEffect, useState, useCallback } from 'react';
import api from '../api/axios';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [bases, setBases] = useState([]);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'logistics_officer', baseId: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    const { data } = await api.get('/users');
    setUsers(data);
  }, []);

  useEffect(() => {
    api.get('/bases').then((res) => setBases(res.data));
    load();
  }, [load]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);
    try {
      const payload = { ...form };
      if (payload.role !== 'base_commander') delete payload.baseId;
      await api.post('/users', payload);
      setSuccess(`Login created for ${form.email}`);
      setForm({ name: '', email: '', password: '', role: 'logistics_officer', baseId: '' });
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create user');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeactivate(id) {
    if (!window.confirm('Deactivate this user? They will no longer be able to log in.')) return;
    await api.patch(`/users/${id}/deactivate`);
    load();
  }

  return (
    <div className="page">
      <h1>User Accounts</h1>
      {/* <p style={{ color: '#666', marginTop: '-0.5rem' }}>
        Only Admins can create logins. This is intentional — see the project README for why there's
        no public sign-up.
      </p> */}

      <form className="inline-form" onSubmit={handleSubmit}>
        <input required type="text" placeholder="Full name" value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <input required type="email" placeholder="Email" value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <input required type="password" placeholder="Password (min 8 chars)" value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })} />
        <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
          <option value="admin">Admin</option>
          <option value="base_commander">Base Commander</option>
          <option value="logistics_officer">Logistics Officer</option>
        </select>
        {form.role === 'base_commander' && (
          <select required value={form.baseId} onChange={(e) => setForm({ ...form, baseId: e.target.value })}>
            <option value="">Assign to base</option>
            {bases.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
        )}
        <button type="submit" disabled={submitting}>Create Login</button>
      </form>
      {error && <div className="error-banner">{error}</div>}
      {success && <div className="metric-card" style={{ padding: '0.5rem 1rem', color: 'var(--success)' }}>{success}</div>}

      <table className="data-table">
        <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Base</th><th>Status</th><th></th></tr></thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id}>
              <td>{u.name}</td><td>{u.email}</td>
              <td style={{ textTransform: 'capitalize' }}>{u.role.replace('_', ' ')}</td>
              <td>{u.baseName || 'All bases'}</td>
              <td>{u.isActive ? 'Active' : 'Deactivated'}</td>
              <td>{u.isActive && <button onClick={() => handleDeactivate(u.id)}>Deactivate</button>}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
