import './DashboardCharts.css';

export function ActivityChart({ activity = [] }) {
  const counts = new Map(activity.map((item) => [item.date, Number(item.count)]));
  const today = new Date();
  const days = Array.from({ length: 30 }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - 29 + index);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    return { date: key, count: counts.get(key) || 0 };
  });
  const maximum = Math.max(1, ...days.map((item) => item.count));
  const points = days
    .map((item, index) => `${index * 20},${130 - (item.count / maximum) * 112}`)
    .join(' ');
  const areaPath = `M 0 140 L ${points.replaceAll(' ', ' L ')} L 580 140 Z`;

  return (
    <div className="crm-activity-chart">
      <svg viewBox="0 0 580 165" role="img" aria-label="Daily registrations over the last 30 days">
        <defs>
          <linearGradient id="activity-fill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#79d34b" stopOpacity=".42" />
            <stop offset="100%" stopColor="#79d34b" stopOpacity=".02" />
          </linearGradient>
        </defs>
        {[30, 65, 100, 135].map((y) => (
          <line key={y} x1="0" x2="580" y1={y} y2={y} className="crm-chart-grid" />
        ))}
        <path d={areaPath} fill="url(#activity-fill)" />
        <polyline
          points={points}
          fill="none"
          stroke="#52b52c"
          strokeWidth="3"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        {days
          .filter((day) => day.count > 0)
          .map((day, index) => {
            const dayIndex = days.indexOf(day);
            return (
              <circle
                key={day.date}
                cx={dayIndex * 20}
                cy={130 - (day.count / maximum) * 112}
                r="3.5"
                fill="#fff"
                stroke="#45a925"
                strokeWidth="2"
                aria-label={`${day.date}: ${day.count} registrations`}
              />
            );
          })}
      </svg>
      <div className="crm-chart-labels">
        {[0, 5, 10, 15, 20, 25, 29].map((index) => (
          <span key={days[index].date}>
            {new Date(`${days[index].date}T00:00:00`).toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric',
            })}
          </span>
        ))}
      </div>
    </div>
  );
}

export function CategoryDonut({ categories = [] }) {
  const active = categories.filter((category) => category.is_active);
  const colors = ['#48a52a', '#f28c18', '#883bd7', '#25bfd2', '#397df0', '#ec5890', '#85a0ac'];
  const segmentSize = active.length ? 100 / active.length : 100;
  const stops = active.map(
    (category, index) =>
      `${colors[index % colors.length]} ${index * segmentSize}% ${(index + 1) * segmentSize}%`,
  );
  const background = active.length ? `conic-gradient(${stops.join(', ')})` : '#e8edf0';

  return (
    <div className="crm-category-chart">
      <div className="crm-donut" style={{ background }}>
        <div>
          <strong>{active.length}</strong>
          <span>Categories</span>
        </div>
      </div>
      <div className="crm-category-legend">
        {active.map((category, index) => (
          <div key={category.id}>
            <i style={{ background: colors[index % colors.length] }} />
            <span>{category.title}</span>
            <b>{category.images_count}</b>
          </div>
        ))}
      </div>
    </div>
  );
}
