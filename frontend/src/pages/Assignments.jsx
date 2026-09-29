import { useEffect, useState, useCallback } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

function today() { return new Date().toISOString().slice(0, 10); }

export default function Assignments() {
  const { user } = useAuth();
  const [tab, setTab] = useState('assign'); // 'assign' | 'expend'
  const [bases, setBases] = useState([]);
  const [equipmentTypes, setEquipmentTypes] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [expenditures, setExpenditures] = useState([]);
  const [error, setError] = useState('');

  const defaultBase = user.role === 'base_commander' ? user.baseId : '';

  const [assignForm, setAssignForm] = useState({
    baseId: defaultBase, equipmentTypeId: '', quantity: '', assignedToName: '', assignedDate: today(),
  });
  const [expendForm, setExpendForm] = useState({
    baseId: defaultBase, equipmentTypeId: '', quantity: '', expendedDate: today(), reason: '',
  });

  useEffect(() => {
    api.get('/bases').then((res) => setBases(res.data));
    api.get('/equipment-types').then((res) => setEquipmentTypes(res.data));
  }, []);

  const loadAssignments = useCallback(async () => {
    const params = defaultBase ? { baseId: defaultBase } : {};
    const { data } = await api.get('/assignments', { params });
    setAssignments(data.data);
  }, [defaultBase]);

  const loadExpenditures = useCallback(async () => {
    const params = defaultBase ? { baseId: defaultBase } : {};
    const { data } = await api.get('/expenditures', { params });
    setExpenditures(data.data);
  }, [defaultBase]);

  useEffect(() => { loadAssignments(); loadExpenditures(); }, [loadAssignments, loadExpenditures]);

  async function submitAssign(e) {
    e.preventDefault();
    setError('');
    try {
      await api.post('/assignments', { ...assignForm, quantity: Number(assignForm.quantity) });
      setAssignForm({ ...assignForm, equipmentTypeId: '', quantity: '', assignedToName: '' });
      loadAssignments();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create assignment');
    }
  }

  async function submitExpend(e) {
    e.preventDefault();
    setError('');
    try {
      await api.post('/expenditures', { ...expendForm, quantity: Number(expendForm.quantity) });
      setExpendForm({ ...expendForm, equipmentTypeId: '', quantity: '', reason: '' });
      loadExpenditures();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to record expenditure');
    }
  }

  async function markReturned(id) {
    await api.patch(`/assignments/${id}/return`, { returnedDate: today() });
    loadAssignments();
  }

  return (
    <div className="page">
      <h1>Assignments & Expenditures</h1>
      <div className="tabs">
        <button className={tab === 'assign' ? 'active' : ''} onClick={() => setTab('assign')}>Assignments</button>
        <button className={tab === 'expend' ? 'active' : ''} onClick={() => setTab('expend')}>Expenditures</button>
      </div>
      {error && <div className="error-banner">{error}</div>}

      {tab === 'assign' && (
        <>
          <form className="inline-form" onSubmit={submitAssign}>
            {!defaultBase && (
              <select required value={assignForm.baseId} onChange={(e) => setAssignForm({ ...assignForm, baseId: e.target.value })}>
                <option value="">Base</option>
                {bases.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            )}
            <select required value={assignForm.equipmentTypeId} onChange={(e) => setAssignForm({ ...assignForm, equipmentTypeId: e.target.value })}>
              <option value="">Equipment type</option>
              {equipmentTypes.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
            <input required type="number" min="1" placeholder="Quantity" value={assignForm.quantity}
              onChange={(e) => setAssignForm({ ...assignForm, quantity: e.target.value })} />
            <input required type="text" placeholder="Assigned to (name / service no.)" value={assignForm.assignedToName}
              onChange={(e) => setAssignForm({ ...assignForm, assignedToName: e.target.value })} />
            <input required type="date" value={assignForm.assignedDate}
              onChange={(e) => setAssignForm({ ...assignForm, assignedDate: e.target.value })} />
            <button type="submit">Assign</button>
          </form>

          <table className="data-table">
            <thead><tr><th>Date</th><th>Base</th><th>Equipment</th><th>Qty</th><th>Assigned To</th><th>Status</th><th></th></tr></thead>
            <tbody>
              {assignments.map((a) => (
                <tr key={a.id}>
                  <td>{a.assignedDate}</td><td>{a.base?.name}</td><td>{a.equipmentType?.name}</td>
                  <td>{a.quantity}</td><td>{a.assignedToName}</td>
                  <td><span className={`status-badge status-${a.status}`}>{a.status}</span></td>
                  <td>{a.status === 'assigned' && <button onClick={() => markReturned(a.id)}>Mark Returned</button>}</td>
                </tr>
              ))}
              {assignments.length === 0 && <tr><td colSpan="7">No assignments found</td></tr>}
            </tbody>
          </table>
        </>
      )}

      {tab === 'expend' && (
        <>
          <form className="inline-form" onSubmit={submitExpend}>
            {!defaultBase && (
              <select required value={expendForm.baseId} onChange={(e) => setExpendForm({ ...expendForm, baseId: e.target.value })}>
                <option value="">Base</option>
                {bases.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            )}
            <select required value={expendForm.equipmentTypeId} onChange={(e) => setExpendForm({ ...expendForm, equipmentTypeId: e.target.value })}>
              <option value="">Equipment type</option>
              {equipmentTypes.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
            <input required type="number" min="1" placeholder="Quantity" value={expendForm.quantity}
              onChange={(e) => setExpendForm({ ...expendForm, quantity: e.target.value })} />
            <input required type="date" value={expendForm.expendedDate}
              onChange={(e) => setExpendForm({ ...expendForm, expendedDate: e.target.value })} />
            <input type="text" placeholder="Reason (optional)" value={expendForm.reason}
              onChange={(e) => setExpendForm({ ...expendForm, reason: e.target.value })} />
            <button type="submit">Record Expenditure</button>
          </form>

          <table className="data-table">
            <thead><tr><th>Date</th><th>Base</th><th>Equipment</th><th>Qty</th><th>Reason</th></tr></thead>
            <tbody>
              {expenditures.map((ex) => (
                <tr key={ex.id}>
                  <td>{ex.expendedDate}</td><td>{ex.base?.name}</td><td>{ex.equipmentType?.name}</td>
                  <td>{ex.quantity}</td><td>{ex.reason || '-'}</td>
                </tr>
              ))}
              {expenditures.length === 0 && <tr><td colSpan="5">No expenditures found</td></tr>}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}
