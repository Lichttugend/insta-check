interface StatsCardProps {
  label: string;
  value: number;
  icon: React.ReactNode;
  bgColor: string;
  textColor: string;
}

export default function StatsCard({ label, value, icon, bgColor, textColor }: StatsCardProps) {
  return (
    <div className={`${bgColor} rounded-2xl p-4 flex items-center gap-3`}>
      <div className={`${textColor} opacity-80`}>{icon}</div>
      <div>
        <p className={`text-2xl font-bold ${textColor}`}>{value.toLocaleString()}</p>
        <p className={`text-xs ${textColor} opacity-70 font-medium`}>{label}</p>
      </div>
    </div>
  );
}
