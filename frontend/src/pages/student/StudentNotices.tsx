import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { noticeApi } from '@/lib/api';
import { Bell, Calendar, Trash2, Loader2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

const StudentNotices = () => {
  const { user } = useAuth();
  const [notices, setNotices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dismissed, setDismissed] = useState<string[]>(() => {
    const saved = localStorage.getItem(`dismissed_notices_${user?.id || user?._id}`);
    return saved ? JSON.parse(saved) : [];
  });

  const fetchNotices = async () => {
    try {
      const studentId = user?._id || user?.id;
      const { data } = await noticeApi.getMy(studentId);
      setNotices(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error('Failed to load notices');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchNotices();
  }, [user]);

  const handleDismiss = (id: string) => {
    const newDismissed = [...dismissed, id];
    setDismissed(newDismissed);
    localStorage.setItem(`dismissed_notices_${user?.id || user?._id}`, JSON.stringify(newDismissed));
    toast.info('Notice dismissed from your view');
  };

  const activeNotices = notices.filter(n => !dismissed.includes(n._id));

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-black text-foreground flex items-center gap-3">
           University Broadcasts <Sparkles className="h-5 w-5 text-yellow-500 fill-yellow-500" />
        </h1>
        <p className="text-muted-foreground font-medium">Important official announcements filtered for your category</p>
      </div>

      <div className="space-y-5">
        {loading ? (
             <div className="flex items-center justify-center p-20"><Loader2 className="animate-spin h-10 w-10 text-primary/40" /></div>
        ) : activeNotices.map((n) => (
          <div key={n._id} className="glass-card rounded-2xl p-6 border-0 shadow-xl bg-card transition-all hover:bg-muted/10 group">
            <div className="flex gap-5">
              <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0 shadow-inner group-hover:scale-110 transition-transform"><Bell className="h-6 w-6" /></div>
              <div className="flex-1">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-black text-xl leading-tight text-foreground/90">{n.title}</h3>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-10 w-10 text-destructive/40 hover:text-destructive hover:bg-destructive/10 rounded-xl" 
                    onClick={() => handleDismiss(n._id)}
                    title="Dismiss this notice"
                  >
                    <Trash2 className="h-5 w-5" />
                  </Button>
                </div>
                <p className="text-muted-foreground leading-relaxed font-medium mb-6">{n.message}</p>
                <div className="flex items-center gap-4">
                  <span className="text-[10px] font-black uppercase tracking-widest bg-primary/10 text-primary px-3 py-1.5 rounded-xl border border-primary/5">Official {n.department}</span>
                  <span className="text-[10px] text-muted-foreground ml-auto font-black flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" />{new Date(n.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
        {!loading && activeNotices.length === 0 && (
          <div className="text-center py-32 bg-muted/20 rounded-3xl border-2 border-dashed border-muted/50">
             <div className="h-16 w-16 bg-muted/40 rounded-full flex items-center justify-center mx-auto mb-4"><Bell className="h-8 w-8 text-muted stroke-1" /></div>
             <p className="text-muted-foreground font-bold text-lg">No active notices.</p>
             <p className="text-xs text-muted-foreground/60 mt-1">You've cleared your broadcast list for now!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentNotices;
