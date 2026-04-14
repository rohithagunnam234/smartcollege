import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import StatCard from '@/components/StatCard';
import { DollarSign, FileCheck, Bell, Clock, User as UserIcon, Mail, Phone, Calendar, GraduationCap, MapPin, X, Loader2, Pencil, Key, BookOpen, Award, Briefcase, Target, TrendingUp, AlertCircle } from 'lucide-react';
import { noticeApi, feeApi, studentApi } from '@/lib/api';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const StudentDashboard = () => {
  const { user, login, token } = useAuth(); // login to refresh user data context
  const [notices, setNotices] = useState<any[]>([]);
  const [fees, setFees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedNotice, setSelectedNotice] = useState<any>(null);
  
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [editLoading, setEditLoading] = useState(false);

  const fetchData = async () => {
    try {
      const studentId = user?._id || user?.id;
      const [noticeRes, feeRes] = await Promise.allSettled([
        noticeApi.getMy(studentId),
        feeApi.getMy(studentId)
      ]);

      if (noticeRes.status === 'fulfilled') setNotices(Array.isArray(noticeRes.value.data) ? noticeRes.value.data : []);
      if (feeRes.status === 'fulfilled') setFees(Array.isArray(feeRes.value.data) ? feeRes.value.data : []);
      else setFees([]);
    } catch (err) {
      console.error('Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchData();
  }, [user]);

  const handleUpdateProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setEditLoading(true);
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    try {
      const res = await studentApi.updateProfile(data);
      // Update local storage and context
      const updatedUser = { ...user, ...res.data };
      if (token) {
        login(updatedUser, token);
      } else {
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
      toast.success('Profile updated successfully');
      setEditProfileOpen(false);
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setEditLoading(false);
    }
  };

  const totalDue = fees.reduce((sum, f) => sum + (f.dueFee || 0), 0);

  return (
    <div>
      <div className="mb-6 px-1">
        <h1 className="text-3xl font-black text-foreground/90 tracking-tight">University Dashboard</h1>
        <p className="text-sm text-muted-foreground font-medium flex items-center gap-2 mt-1">
           <GraduationCap className="h-4 w-4 text-primary" /> {user?.name} · {user?.rollNo} · {user?.batch} Batch
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <StatCard title="Academic Docs" value="Verified" icon={FileCheck} trend="Latest status" trendUp />
        <StatCard title="Total Dues" value={`₹${totalDue.toLocaleString()}`} icon={DollarSign} trend={totalDue > 0 ? "Pending payment" : "All cleared"} trendUp={totalDue === 0} />
        <StatCard title="Recent Notices" value={notices.length.toString()} icon={Bell} trend="New updates" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Profile Card */}
        <div className="glass-card rounded-2xl p-6 shadow-xl border-0 bg-card/40 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                 <UserIcon className="h-7 w-7" />
              </div>
              <div>
                <h3 className="font-black text-xl tracking-tight">My Profile</h3>
                <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest mt-0.5"></p>
              </div>
            </div>
            <Dialog open={editProfileOpen} onOpenChange={setEditProfileOpen}>
               <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="rounded-xl h-9 px-4 border-primary/20 hover:bg-primary hover:text-white transition-all">
                    <Pencil className="h-3.5 w-3.5 mr-2" /> Edit Profile
                  </Button>
               </DialogTrigger>
               <DialogContent className="rounded-3xl max-w-sm">
                  <DialogHeader><DialogTitle className="font-black">Update Personal Info</DialogTitle></DialogHeader>
                  <form onSubmit={handleUpdateProfile} className="space-y-4 mt-2">
                     <div><Label>Full Name</Label><Input name="name" defaultValue={user?.name} required className="mt-1 rounded-xl" /></div>
                     <div><Label>College Email</Label><Input name="email" defaultValue={user?.email} required type="email" className="mt-1 rounded-xl" /></div>
                     <div><Label>Personal Email</Label><Input name="personalEmail" defaultValue={user?.personalEmail} type="email" className="mt-1 rounded-xl" /></div>
                     <div><Label>Phone Number</Label><Input name="phone" defaultValue={user?.phone} required className="mt-1 rounded-xl" /></div>
                     <div><Label>New Password (Optional)</Label><Input name="password" type="password" placeholder="Leave blank to keep same" className="mt-1 rounded-xl" /></div>
                     <Button type="submit" className="w-full rounded-xl" disabled={editLoading}>
                        {editLoading ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : null} Save Updates
                     </Button>
                  </form>
               </DialogContent>
            </Dialog>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <ProfileItem icon={GraduationCap} label="Roll Number" value={user?.rollNo} />
            <ProfileItem icon={Mail} label="College Email" value={user?.email} className="truncate" />
            <ProfileItem icon={Mail} label="Personal Email" value={user?.personalEmail || '—'} className="truncate" />
            <ProfileItem icon={Phone} label="Contact" value={user?.phone || 'N/A'} />
            <ProfileItem icon={Calendar} label="Current Year" value={`${user?.year} Year (Section ${user?.section})`} />
            <ProfileItem icon={MapPin} label="Department" value={user?.department} />
            <ProfileItem icon={ActivityIcon} label="Enrollment" value="Active Student" valueClass="text-success font-black" />
          </div>
        </div>

        {/* Notices Feed */}
        <div className="glass-card rounded-2xl p-6 shadow-xl border-0 bg-card/40 backdrop-blur-sm flex flex-col h-[450px]">
          <h3 className="font-black text-lg mb-6 flex items-center gap-3 shrink-0"><Bell className="h-5 w-5 text-primary" />Live Broadcasts</h3>
          <div className="space-y-4 overflow-y-auto pr-3 custom-scrollbar flex-1">
            {notices.map(n => (
              <div 
                key={n._id} 
                className="flex items-center gap-4 p-4 rounded-2xl hover:bg-primary/5 transition-all cursor-pointer border border-muted/20 hover:border-primary/30 bg-muted/5 group"
                onClick={() => setSelectedNotice(n)}
              >
                <div className="h-12 w-12 rounded-xl bg-card flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all shadow-sm"><Clock className="h-6 w-6" /></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-black truncate text-foreground/90">{n.title}</p>
                  <p className="text-[10px] text-muted-foreground flex items-center mt-1 font-bold uppercase tracking-widest">
                    {new Date(n.createdAt).toLocaleDateString()} · Official {n.department}
                  </p>
                </div>
              </div>
            ))}
            {!loading && notices.length === 0 && (
              <div className="py-24 text-center">
                <div className="h-20 w-20 bg-muted/20 rounded-full flex items-center justify-center mx-auto mb-4"><Bell className="h-10 w-10 text-muted/20 stroke-1" /></div>
                <p className="text-sm font-bold text-muted-foreground/50 uppercase tracking-widest">No Active Notices</p>
              </div>
            )}
            {loading && (
              <div className="flex justify-center py-20"><Loader2 className="animate-spin h-8 w-8 text-primary/40" /></div>
            )}
          </div>
        </div>
      </div>

      {/* Academic and Placement Modules */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
        {/* Academic Module */}
        <div className="glass-card rounded-2xl p-6 shadow-xl border-0 bg-card/40 backdrop-blur-sm">
          <div className="flex items-center gap-4 mb-6">
            <div className="h-12 w-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 shadow-inner">
               <BookOpen className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-black text-xl tracking-tight">Academic Overview</h3>
              <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest mt-0.5">Current Standing</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <ProfileItem 
               icon={TrendingUp} 
               label="Attendance" 
               value={`${user?.attendance || 0}%`} 
               valueClass={Number(user?.attendance) >= 75 ? "text-green-500" : "text-amber-500"} 
            />
            <ProfileItem 
               icon={Award} 
               label="CGPA" 
               value={Number(user?.cgpa || 0).toFixed(2)} 
               valueClass="text-primary" 
            />
            <ProfileItem 
               icon={AlertCircle} 
               label="Active Backlogs" 
               value={user?.backlogs || '0'} 
               valueClass={Number(user?.backlogs) > 0 ? "text-red-500" : "text-green-500"} 
               className="md:col-span-2" 
            />
          </div>
        </div>

        {/* Placement Module */}
        <div className="glass-card rounded-2xl p-6 shadow-xl border-0 bg-card/40 backdrop-blur-sm">
           <div className="flex items-center gap-4 mb-6">
            <div className="h-12 w-12 rounded-xl bg-green-500/10 flex items-center justify-center text-green-500 shadow-inner">
               <Briefcase className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-black text-xl tracking-tight">Placement Status</h3>
              <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest mt-0.5">Career & Opportunities</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <ProfileItem 
                icon={Target} 
                label="Placement Status" 
                value={user?.placed || 'Pending'} 
                valueClass={user?.placed === 'Yes' ? "text-green-500 font-bold" : user?.placed === 'No' ? "text-red-500 font-bold" : "text-amber-500 font-bold"} 
            />
            <ProfileItem 
                icon={Briefcase} 
                label="Companies Selected" 
                value={user?.companiesSelected || '0'} 
                valueClass="text-primary font-bold" 
            />
          </div>
        </div>
      </div>

      {/* Notice Dialog */}
      <Dialog open={!!selectedNotice} onOpenChange={() => setSelectedNotice(null)}>
        <DialogContent className="max-w-md rounded-3xl border-0 shadow-2xl overflow-hidden p-0 bg-background/95 backdrop-blur-md">
          <div className="bg-primary/5 p-6 border-b border-primary/10">
             <DialogHeader>
                <DialogTitle className="text-2xl font-black text-primary leading-tight">{selectedNotice?.title}</DialogTitle>
                <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest mt-1 opacity-60">
                   {selectedNotice?.department} · {selectedNotice?.createdAt && new Date(selectedNotice.createdAt).toLocaleDateString()}
                </p>
             </DialogHeader>
          </div>
          <div className="p-8">
             <div className="p-6 rounded-2xl bg-muted/30 border border-primary/5 shadow-inner">
                <p className="text-sm leading-relaxed whitespace-pre-wrap font-medium text-foreground/80">{selectedNotice?.message}</p>
             </div>
             <div className="mt-8 flex justify-end">
                <Button onClick={() => setSelectedNotice(null)} className="rounded-2xl px-8 h-12 font-bold shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95">Acknowledge</Button>
             </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const ProfileItem = ({ icon: Icon, label, value, className = "", valueClass = "" }: any) => (
  <div className={`flex items-center gap-4 p-4 rounded-xl bg-muted/10 border border-muted/20 hover:bg-muted/20 transition-colors ${className}`}>
    <div className="h-10 w-10 rounded-lg bg-card flex items-center justify-center text-muted-foreground shadow-sm">
       <Icon className="h-5 w-5" />
    </div>
    <div className="min-w-0">
       <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">{label}</p>
       <p className={`text-sm font-bold text-foreground/90 truncate ${valueClass}`}>{value}</p>
    </div>
  </div>
);

const ActivityIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
);

export default StudentDashboard;
