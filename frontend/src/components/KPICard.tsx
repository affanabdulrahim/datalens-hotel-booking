import { Profile } from "../api";

interface KPICardProps {
  title: string;
  value: string | number;
  icon: string;
  unit?: string;
  trend?: number;
  color?: "cyan" | "blue" | "purple" | "green";
}

export function KPICard({ 
  title, 
  value, 
  icon, 
  unit, 
  trend,
  color = "cyan"
}: KPICardProps) {
  const colorMap = {
    cyan: "from-cyan-500 to-cyan-600",
    blue: "from-blue-500 to-blue-600",
    purple: "from-purple-500 to-purple-600",
    green: "from-green-500 to-green-600",
  };

  return (
    <div className="kpi-card group">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-slate-400">{title}</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white">{value}</span>
            {unit && <span className="text-sm text-slate-400">{unit}</span>}
          </div>
          {trend !== undefined && (
            <div className={`mt-2 text-xs font-medium ${trend >= 0 ? "text-green-400" : "text-red-400"}`}>
              {trend >= 0 ? "↑" : "↓"} {Math.abs(trend)}%
            </div>
          )}
        </div>
        <div className={`rounded-lg bg-gradient-to-br ${colorMap[color]} p-3 text-xl transition group-hover:scale-110`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

interface KPIGridProps {
  profile: Profile;
  rowCount: number;
}

export function KPIGrid({ profile, rowCount }: KPIGridProps) {
  const totalNulls = profile.columns.reduce((sum, col) => sum + col.null_count, 0);
  const totalCells = rowCount * profile.column_count;
  const dataQuality = ((totalCells - totalNulls) / totalCells) * 100;

  const numericCols = profile.columns.filter((col) => col.detected_type === "numeric").length;
  const categoricalCols = profile.columns.filter((col) => col.detected_type === "categorical").length;

  return (
    <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <KPICard
        title="Total Records"
        value={rowCount.toLocaleString()}
        icon="📊"
        color="cyan"
      />
      <KPICard
        title="Columns"
        value={profile.column_count}
        icon="🔢"
        color="blue"
      />
      <KPICard
        title="Data Quality"
        value={dataQuality.toFixed(1)}
        unit="%"
        icon="✨"
        color="green"
      />
      <KPICard
        title="Missing Values"
        value={((totalNulls / totalCells) * 100).toFixed(1)}
        unit="%"
        icon="⚠️"
        color="purple"
      />
    </div>
  );
}
