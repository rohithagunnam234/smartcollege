import { cn } from '@/lib/utils';

type Status = 'paid' | 'pending' | 'partial' | 'verified' | 'rejected';

const statusStyles: Record<Status, string> = {
  paid: 'bg-success/10 text-success',
  verified: 'bg-success/10 text-success',
  pending: 'bg-warning/10 text-warning',
  partial: 'bg-primary/10 text-primary',
  rejected: 'bg-destructive/10 text-destructive',
};

const StatusBadge = ({ status }: { status: string }) => {
  const s = status.toLowerCase() as Status;
  return (
    <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize', statusStyles[s] || 'bg-muted text-muted-foreground')}>
      {status}
    </span>
  );
};

export default StatusBadge;
