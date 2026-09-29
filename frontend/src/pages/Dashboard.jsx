import { useEffect, useState, useCallback } from 'react';
import api from '../api/axios';
import FilterBar from '../components/FilterBar';
import MetricCard from '../components/MetricCard';
import Modal from '../components/Modal';
import { useAuth } from '../context/AuthContext';

function firstOfMonth() {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().slice(0, 10);
}
function today() {
  return new Date().toISOString().slice(0, 10);
}

export default function Dashboard() {
  const { user } = useAuth();
  const [filters, setFilters] = useState({
    startDate: firstOfMonth(),
    endDate: today(),
    baseId: user.role === 'base_commander' ? user.baseId : '',
    equipmentTypeId: '',
  });
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showDetail, setShowDetail] = useState(false);
  const [detail, setDetail] = useState(null);

  const loadMetrics = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/dashboard', { params: filters });
      setMetrics(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { loadMetrics(); }, [loadMetrics]);

  async function openNetMovementDetail() {
    const { data } = await api.get('/dashboard/net-movement-detail', { params: filters });
    setDetail(data);
    setShowDetail(true);
  }

  return (
    <div className="page">
      <h1>Dashboard</h1>
      <FilterBar filters={filters} onChange={setFilters} />

      {loading && <p>Loading...</p>}
      {error && <div className="error-banner">{error}</div>}

      {metrics && !loading && (
        <div className="metrics-grid">
          <MetricCard label="Opening Balance" value={metrics.openingBalance} />
          <MetricCard label="Closing Balance" value={metrics.closingBalance} />
          <MetricCard
            label="Net Movement"
            value={metrics.netMovement}
            highlight
            onClick={openNetMovementDetail}
          />
          <MetricCard label="Assigned" value={metrics.assigned} />
          <MetricCard label="Expended" value={metrics.expended} />
        </div>
      )}

      {showDetail && detail && (
        <Modal title="Net Movement Detail" onClose={() => setShowDetail(false)}>
          <section>
            <h4>Purchases ({metrics.purchases})</h4>
            <table>
              <thead><tr><th>Date</th><th>Base</th><th>Equipment</th><th>Qty</th></tr></thead>
              <tbody>
                {detail.purchases.map((p) => (
                  <tr key={p.id}>
                    <td>{p.purchaseDate}</td><td>{p.base?.name}</td>
                    <td>{p.equipmentType?.name}</td><td>{p.quantity}</td>
                  </tr>
                ))}
                {detail.purchases.length === 0 && <tr><td colSpan="4">No purchases in range</td></tr>}
              </tbody>
            </table>
          </section>
          <section>
            <h4>Transfers In ({metrics.transfersIn})</h4>
            <table>
              <thead><tr><th>Date</th><th>From</th><th>To</th><th>Equipment</th><th>Qty</th></tr></thead>
              <tbody>
                {detail.transfersIn.map((t) => (
                  <tr key={t.id}>
                    <td>{t.transferDate}</td><td>{t.fromBase?.name}</td><td>{t.toBase?.name}</td>
                    <td>{t.equipmentType?.name}</td><td>{t.quantity}</td>
                  </tr>
                ))}
                {detail.transfersIn.length === 0 && <tr><td colSpan="5">No transfers in</td></tr>}
              </tbody>
            </table>
          </section>
          <section>
            <h4>Transfers Out ({metrics.transfersOut})</h4>
            <table>
              <thead><tr><th>Date</th><th>From</th><th>To</th><th>Equipment</th><th>Qty</th></tr></thead>
              <tbody>
                {detail.transfersOut.map((t) => (
                  <tr key={t.id}>
                    <td>{t.transferDate}</td><td>{t.fromBase?.name}</td><td>{t.toBase?.name}</td>
                    <td>{t.equipmentType?.name}</td><td>{t.quantity}</td>
                  </tr>
                ))}
                {detail.transfersOut.length === 0 && <tr><td colSpan="5">No transfers out</td></tr>}
              </tbody>
            </table>
          </section>
        </Modal>
      )}
    </div>
  );
}
