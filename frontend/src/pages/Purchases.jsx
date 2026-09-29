import { useEffect, useState, useCallback } from 'react';
import api from '../api/axios';
import FilterBar from '../components/FilterBar';
import { useAuth } from '../context/AuthContext';

function today() { return new Date().toISOString().slice(0, 10); }

export default function Purchases() {
  const { can, user } = useAuth();
  const [filters, setFilters] = useState({
    startDate: '', endDate: '',
    baseId: user.role === 'base_commander' ? user.baseId : '',
    equipmentTypeId: '',
  });
  const [purchases, setPurchases] = useState([]);
  const [bases, setBases] = useState([]);
  const [equipmentTypes, setEquipmentTypes] = useState([]);
  const [form, setForm] = useState({
    baseId: '', equipmentTypeId: '', quantity: '', purchaseDate: today(), supplier: '',
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
    const { data } = await api.get('/purchases', { params });
    setPurchases(data.data);
  }, [filters]);

  useEffect(() => { load(); }, [load]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await api.post('/purchases', { ...form, quantity: Number(form.quantity) });
      setForm({ baseId: '', equipmentTypeId: '', quantity: '', purchaseDate: today(), supplier: '' });
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to record purchase');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="page">
      <h1>Purchases</h1>

      {can.recordPurchase && (
        <form className="inline-form" onSubmit={handleSubmit}>
          <select required value={form.baseId} onChange={(e) => setForm({ ...form, baseId: e.target.value })}>
            <option value="">Base</option>
            {bases.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
          <select required value={form.equipmentTypeId} onChange={(e) => setForm({ ...form, equipmentTypeId: e.target.value })}>
            <option value="">Equipment type</option>
            {equipmentTypes.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
          <input required type="number" min="1" placeholder="Quantity" value={form.quantity}
            onChange={(e) => setForm({ ...form, quantity: e.target.value })} />
          <input required type="date" value={form.purchaseDate}
            onChange={(e) => setForm({ ...form, purchaseDate: e.target.value })} />
          <input type="text" placeholder="Supplier (optional)" value={form.supplier}
            onChange={(e) => setForm({ ...form, supplier: e.target.value })} />
          <button type="submit" disabled={submitting}>Record Purchase</button>
        </form>
      )}
      {error && <div className="error-banner">{error}</div>}

      <FilterBar filters={filters} onChange={setFilters} />

      <table className="data-table">
        <thead>
          <tr><th>Date</th><th>Base</th><th>Equipment</th><th>Category</th><th>Qty</th><th>Supplier</th></tr>
        </thead>
        <tbody>
          {purchases.map((p) => (
            <tr key={p.id}>
              <td>{p.purchaseDate}</td>
              <td>{p.base?.name}</td>
              <td>{p.equipmentType?.name}</td>
              <td>{p.equipmentType?.category}</td>
              <td>{p.quantity}</td>
              <td>{p.supplier || '-'}</td>
            </tr>
          ))}
          {purchases.length === 0 && <tr><td colSpan="6">No purchases found</td></tr>}
        </tbody>
      </table>
    </div>
  );
}
