import { useEffect, useState, useCallback } from 'react';
import api from '../api/axios';
import FilterBar from '../components/FilterBar';
import { useAuth } from '../context/AuthContext';

function today() { return new Date().toISOString().slice(0, 10); }

export default function Transfers() {
  const { can, user } = useAuth();
  const [filters, setFilters] = useState({
    startDate: '', endDate: '',
    baseId: user.role === 'base_commander' ? user.baseId : '',
    equipmentTypeId: '',
  });
  const [transfers, setTransfers] = useState([]);
  const [bases, setBases] = useState([]);
  const [equipmentTypes, setEquipmentTypes] = useState([]);
  const [form, setForm] = useState({
    fromBaseId: user.role === 'base_commander' ? user.baseId : '',
    toBaseId: '', equipmentTypeId: '', quantity: '', transferDate: today(), notes: '',
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.get('/bases').then((res) => setBases(res.data));
    api.get('/equipment-types').then((res) => setEquipmentTypes(res.data));
  }, []);

  const load = useCallback(async () => {
    const params = {};
    if (filters.startDate && filters.endDate) {
      params.startDate = filters.startDate;
      params.endDate = filters.endDate;
    }
    if (filters.baseId) params.baseId = filters.baseId;
    if (filters.equipmentTypeId) params.equipmentTypeId = filters.equipmentTypeId;
    const { data } = await api.get('/transfers', { params });
    setTransfers(data.data);
  }, [filters]);

  useEffect(() => { load(); }, [load]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (form.fromBaseId === form.toBaseId) {
      setError('Source and destination base must differ');
      return;
    }
    setSubmitting(true);
    try {
      await api.post('/transfers', { ...form, quantity: Number(form.quantity) });
      setForm({ ...form, toBaseId: '', equipmentTypeId: '', quantity: '', notes: '', transferDate: today() });
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create transfer');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="page">
      <h1>Transfers</h1>

      {can.createTransfer && (
        <form className="inline-form" onSubmit={handleSubmit}>
          <select required value={form.fromBaseId} disabled={user.role === 'base_commander'}
            onChange={(e) => setForm({ ...form, fromBaseId: e.target.value })}>
            <option value="">From base</option>
            {bases.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
          <select required value={form.toBaseId} onChange={(e) => setForm({ ...form, toBaseId: e.target.value })}>
            <option value="">To base</option>
            {bases.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
          <select required value={form.equipmentTypeId} onChange={(e) => setForm({ ...form, equipmentTypeId: e.target.value })}>
            <option value="">Equipment type</option>
            {equipmentTypes.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
          <input required type="number" min="1" placeholder="Quantity" value={form.quantity}
            onChange={(e) => setForm({ ...form, quantity: e.target.value })} />
          <input required type="date" value={form.transferDate}
            onChange={(e) => setForm({ ...form, transferDate: e.target.value })} />
          <input type="text" placeholder="Notes (optional)" value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          <button type="submit" disabled={submitting}>Create Transfer</button>
        </form>
      )}
      {error && <div className="error-banner">{error}</div>}

      <FilterBar filters={filters} onChange={setFilters} />

      <table className="data-table">
        <thead>
          <tr><th>Date</th><th>From</th><th>To</th><th>Equipment</th><th>Qty</th><th>Status</th></tr>
        </thead>
        <tbody>
          {transfers.map((t) => (
            <tr key={t.id}>
              <td>{t.transferDate}</td>
              <td>{t.fromBase?.name}</td>
              <td>{t.toBase?.name}</td>
              <td>{t.equipmentType?.name}</td>
              <td>{t.quantity}</td>
              <td><span className={`status-badge status-${t.status}`}>{t.status}</span></td>
            </tr>
          ))}
          {transfers.length === 0 && <tr><td colSpan="6">No transfers found</td></tr>}
        </tbody>
      </table>
    </div>
  );
}
