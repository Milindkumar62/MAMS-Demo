export default function MetricCard({ label, value, onClick, highlight }) {
  return (
    <div className={`metric-card ${highlight ? 'clickable' : ''}`} onClick={onClick}>
      <div className="metric-label">{label}</div>
      <div className="metric-value">{value}</div>
      {highlight && <div className="metric-hint">Click for details</div>}
    </div>
  );
}
