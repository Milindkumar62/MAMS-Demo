import { useEffect, useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

// Shared filter controls (Date range, Base, Equipment Type) used across
// Dashboard, Purchases and Transfers pages.
export default function FilterBar({ filters, onChange }) {
  const { can, user } = useAuth();
  const [bases, setBases] = useState([]);
  const [equipmentTypes, setEquipmentTypes] = useState([]);

  useEffect(() => {
    api.get('/bases').then((res) => setBases(res.data));
    api.get('/equipment-types').then((res) => setEquipmentTypes(res.data));
  }, []);

  function update(field, value) {
    onChange({ ...filters, [field]: value });
  }

  return (
    <div className="filter-bar">
      <label>
        From
        <input type="date" value={filters.startDate} onChange={(e) => update('startDate', e.target.value)} />
      </label>
      <label>
        To
        <input type="date" value={filters.endDate} onChange={(e) => update('endDate', e.target.value)} />
      </label>
      <label>
        Base
        <select
          value={filters.baseId}
          onChange={(e) => update('baseId', e.target.value)}
          disabled={!can.seeAllBases}
        >
          <option value="">All bases</option>
          {bases.map((b) => (
            <option key={b.id} value={b.id}>{b.name}</option>
          ))}
        </select>
      </label>
      <label>
        Equipment Type
        <select value={filters.equipmentTypeId} onChange={(e) => update('equipmentTypeId', e.target.value)}>
          <option value="">All types</option>
          {equipmentTypes.map((t) => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </select>
      </label>
    </div>
  );
}
