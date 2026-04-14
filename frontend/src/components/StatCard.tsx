import { LucideIcon } from 'lucide-react';

interface Props {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  trendUp?: boolean;
  className?: string;
}

const StatCard = ({ title, value, icon: Icon, trend, trendUp, className = '' }: Props) => (
  <div className={`glass-card rounded-lg p-5 animate-fade-in ${className}`}>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-muted-foreground">{title}</p>
        <p className="text-2xl font-bold mt-1">{value}</p>
        {trend && (
          <p className={`text-xs mt-1 ${trendUp ? 'text-success' : 'text-destructive'}`}>
            {trendUp ? '↑' : '↓'} {trend}
          </p>
        )}
      </div>
      <div className="h-11 w-11 rounded-lg bg-primary/10 flex items-center justify-center">
        <Icon className="h-5 w-5 text-primary" />
      </div>
    </div>
  </div>
);

export default StatCard;
