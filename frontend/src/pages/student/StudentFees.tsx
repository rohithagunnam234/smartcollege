import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { feeApi } from '@/lib/api';
import StatusBadge from '@/components/StatusBadge';
import { DollarSign, Loader2, Calendar, Receipt, TrendingUp, History, Tag } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';

const StudentFees = () => {
  const { user } = useAuth();
  const [fees, setFees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMyFees = async () => {
    try {
      const studentId = user?._id || user?.id;
      const { data } = await feeApi.getMy(studentId);
      setFees(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error('Failed to fetch fee details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyFees();
  }, [user]);

  const totalPaid = fees.reduce((sum, f) => sum + (f.paidFee || 0), 0);
  const totalDue = fees.reduce((sum, f) => sum + (f.dueFee || 0), 0);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">My Fees</h1>
        <p className="text-muted-foreground">Detailed track of your academic, transport and hostel payments</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="glass-card rounded-xl p-5 border-0 shadow-lg bg-card">
           <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center mb-3"><TrendingUp className="h-5 w-5 text-primary" /></div>
           <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Total Cumulative Paid</p>
           <p className="text-2xl font-black mt-1 text-success">₹{totalPaid.toLocaleString()}</p>
        </div>
        <div className="glass-card rounded-xl p-5 border-0 shadow-lg bg-card">
           <div className="h-10 w-10 rounded-xl bg-warning/10 flex items-center justify-center mb-3"><History className="h-5 w-5 text-warning" /></div>
           <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Total Outstanding Dues</p>
           <p className="text-2xl font-black mt-1 text-warning">₹{totalDue.toLocaleString()}</p>
        </div>
        <div className="glass-card rounded-xl p-5 border-0 shadow-lg bg-card">
           <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center mb-3"><Receipt className="h-5 w-5 text-blue-500" /></div>
           <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Estimated Total Investment</p>
           <p className="text-2xl font-black mt-1">₹{(totalPaid + totalDue).toLocaleString()}</p>
        </div>
      </div>

      {loading ? (
         <div className="flex items-center justify-center py-20"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           {fees.map((f, idx) => (
              <div key={f._id} className="glass-card rounded-2xl overflow-hidden border-0 shadow-xl bg-card transition-all hover:translate-y-[-4px]">
                 <div className="bg-primary/5 p-4 border-b border-primary/10 flex justify-between items-center text-xs font-bold">
                    <div className="flex items-center gap-2">
                       <Tag className="h-4 w-4 text-primary" />
                       <Badge variant="outline" className="text-[10px] h-6 border-primary/20 bg-primary/10 tracking-widest uppercase">{f.feeType}</Badge>
                    </div>
                    <div className="flex items-center gap-2">
                       <Calendar className="h-4 w-4 text-primary" />
                       {f.academicYear}
                    </div>
                 </div>
                 <div className="p-6 grid grid-cols-2 gap-y-4 gap-x-6">
                    <div>
                       <p className="text-[10px] text-muted-foreground font-bold uppercase">Total Billable</p>
                       <p className="text-lg font-bold">₹{f.totalFee?.toLocaleString()}</p>
                    </div>
                    <div>
                       <p className="text-[10px] text-success font-bold uppercase">Paid Amount</p>
                       <p className="text-lg font-bold text-success font-black">₹{f.paidFee?.toLocaleString()}</p>
                    </div>
                    <div>
                       <p className="text-[10px] text-warning font-bold uppercase">Balance Due</p>
                       <p className="text-lg font-bold text-warning font-black">₹{f.dueFee?.toLocaleString()}</p>
                    </div>
                    <div className="flex flex-col justify-end items-end">
                       <StatusBadge status={f.status} />
                       {f.paidDate && <p className="text-[9px] text-muted-foreground mt-1">Last payment: {new Date(f.paidDate).toLocaleDateString()}</p>}
                    </div>
                 </div>
                 <div className="px-6 pb-6 mt-2">
                    <div className="h-2 bg-muted rounded-full overflow-hidden shadow-inner">
                       <div 
                         className="h-full bg-primary rounded-full transition-all duration-700 shadow-lg" 
                         style={{ width: `${Math.min(100, (f.paidFee / f.totalFee) * 100)}%` }} 
                       />
                    </div>
                 </div>
              </div>
           ))}
           {fees.length === 0 && (
             <div className="col-span-full glass-card rounded-xl p-20 text-center flex flex-col items-center justify-center text-muted-foreground bg-muted/5">
                <DollarSign className="h-16 w-16 mb-4 stroke-1 opacity-20" />
                <p className="text-lg font-bold">No academic fee records found yet.</p>
                <p className="text-sm">Please check back later or contact the accounts department.</p>
             </div>
           )}
        </div>
      )}
    </div>
  );
};

export default StudentFees;
