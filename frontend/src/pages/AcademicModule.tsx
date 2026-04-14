import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { academicApi } from '@/lib/api';
import { toast } from 'sonner';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BookOpen, GraduationCap, TrendingUp, Award, AlertCircle, Filter, Search, Loader2, Pencil } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import StatCard from '@/components/StatCard';

const AcademicModule = () => {
  const { user } = useAuth();
  const isStaff = ['admin', 'faculty'].includes(user?.role || '');
  const isFaculty = user?.role === 'faculty';
  const isAdmin = user?.role === 'admin';
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterDept, setFilterDept] = useState('all');
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [profile, setProfile] = useState<any>(null);

  const departments = ['CSE', 'ECE', 'ME', 'CE', 'EEE'];

  useEffect(() => {
    if (isStaff) {
      fetchRecords();
    } else {
      fetchProfile();
    }
  }, [isStaff]);

  const fetchRecords = async () => {
    try {
      const { data } = await academicApi.getRecords();
      setRecords(data);
    } catch (err) {
      toast.error('Failed to fetch academic records');
    } finally {
      setLoading(false);
    }
  };

  const fetchProfile = async () => {
    try {
      const { data } = await academicApi.getProfile();
      setProfile(data);
    } catch (err) {
      toast.error('Failed to fetch academic profile');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isFaculty) {
        toast.error('Only Faculty members can update academic records');
        return;
    }
    setEditLoading(true);
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    try {
      await academicApi.update(selectedRecord._id || selectedRecord.id, data);
      toast.success('Record updated successfully');
      setEditDialogOpen(false);
      fetchRecords();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update record');
    } finally {
      setEditLoading(false);
    }
  };

  const filtered = records.filter(s => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) || 
                      (s.rollNo && s.rollNo.toLowerCase().includes(search.toLowerCase()));
    const matchDept = filterDept === 'all' || s.department === filterDept;
    return matchSearch && matchDept;
  });

  if (!isStaff) {
    const displayUser = profile || user;
    return (
      <div className="space-y-8">
        <div className="mb-6">
          <h1 className="text-3xl font-black text-foreground/90 tracking-tight">Academic Page</h1>
          <p className="text-muted-foreground font-medium">Detailed academic performance metrics</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <StatCard title="Overall Attendance" value={`${displayUser?.attendance || 0}%`} icon={TrendingUp} trend="Current Semester" trendUp={Number(displayUser?.attendance) >= 75} />
           <StatCard title="Current CGPA" value={Number(displayUser?.cgpa || 0).toFixed(2)} icon={Award} trend="Cumulative" />
           <StatCard title="Active Backlogs" value={displayUser?.backlogs || '0'} icon={AlertCircle} trend="Immediate attention" trendUp={Number(displayUser?.backlogs) === 0} />
        </div>

        <div className="glass-card rounded-2xl p-8 shadow-xl border-0 bg-card/40 backdrop-blur-sm max-w-2xl">
           <h3 className="font-black text-xl mb-6 flex items-center gap-3"><BookOpen className="h-5 w-5 text-primary" />Academic Standing</h3>
           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <MetricItem label="Department" value={displayUser?.department} />
              <MetricItem label="Batch" value={displayUser?.batch} />
              <MetricItem label="Sem / Section" value={`${displayUser?.semester} Sem - ${displayUser?.section}`} />
              <MetricItem label="Year Number" value={`${displayUser?.year} Year`} />
              <MetricItem label="Roll Number" value={displayUser?.rollNo} />
           </div>
           
           <div className="mt-8 p-6 rounded-2xl bg-primary/5 border border-primary/10">
              <p className="text-xs font-bold uppercase tracking-widest text-primary mb-2">Performance Summary</p>
              <p className="text-sm text-foreground/70 leading-relaxed">
                 {Number(displayUser?.cgpa) >= 8 ? 'Outstanding performance! Maintain this consistency to excel in placements.' : 
                  Number(displayUser?.cgpa) >= 6 ? 'Good standing. Focus on core subjects to boost your score.' : 
                  'Need improvement. We recommend attending extra remedial classes.'}
              </p>
           </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Academic Module</h1>
          <p className="text-muted-foreground">Monitor and manage student academic performance</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard title="Average CGPA" value={(records.length > 0 ? records.reduce((acc, s) => acc + (s.cgpa || 0), 0) / records.length : 0).toFixed(2)} icon={Award} />
        <StatCard title="Avg Attendance" value={`${(records.length > 0 ? records.reduce((acc, s) => acc + (s.attendance || 0), 0) / records.length : 0).toFixed(1)}%`} icon={TrendingUp} />
        <StatCard title="Low Attendance" value={records.filter(s => (s.attendance || 0) < 75).length.toString()} icon={AlertCircle} />
      </div>

      <div className="glass-card rounded-lg p-4">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search students by name or roll no..." className="pl-10" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          {isAdmin && (
            <Select value={filterDept} onValueChange={setFilterDept}>
              <SelectTrigger className="w-full sm:w-48"><SelectValue placeholder="All Departments" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
              </SelectContent>
            </Select>
          )}
        </div>

        <div className="rounded-md border overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="font-bold">Roll No</TableHead>
                <TableHead className="font-bold">Student Name</TableHead>
                <TableHead className="font-bold">Dept/Year</TableHead>
                <TableHead className="font-bold text-center">Sem</TableHead>
                <TableHead className="font-bold">Attendance</TableHead>
                <TableHead className="font-bold">CGPA</TableHead>
                <TableHead className="font-bold text-center">Backlogs</TableHead>
                {isFaculty && <TableHead className="font-bold text-right">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={isFaculty ? 8 : 7} className="text-center py-20"><Loader2 className="animate-spin mx-auto h-8 w-8 text-primary/40" /></TableCell></TableRow>
              ) : filtered.map((s) => (
                <TableRow key={s._id || s.id}>
                  <TableCell className="font-bold text-primary">{s.rollNo}</TableCell>
                  <TableCell className="font-medium">{s.name}</TableCell>
                  <TableCell className="text-xs uppercase font-bold text-muted-foreground">{s.department} · {s.year}yr</TableCell>
                  <TableCell className="text-center font-bold">{s.semester}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                       <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${s.attendance < 75 ? 'bg-amber-500' : 'bg-green-500'}`} style={{ width: `${s.attendance || 0}%` }} />
                       </div>
                       <span className="text-xs font-bold">{s.attendance || 0}%</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-black text-primary">{Number(s.cgpa || 0).toFixed(2)}</TableCell>
                  <TableCell className="text-center">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${s.backlogs > 0 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                      {s.backlogs || 0}
                    </span>
                  </TableCell>
                  {isFaculty && (
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => { setSelectedRecord(s); setEditDialogOpen(true); }}>
                        <Pencil className="h-4 w-4 text-primary" />
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader><DialogTitle className="font-black">Edit Academic Record</DialogTitle></DialogHeader>
          {selectedRecord && (
            <form onSubmit={handleUpdate} className="space-y-4 mt-2">
              <div className="p-3 rounded-xl bg-primary/5 border border-primary/10 mb-2">
                <p className="text-xs font-bold text-primary">{selectedRecord.name}</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest">{selectedRecord.rollNo}</p>
              </div>
              <div className="grid gap-4">
                <div className="space-y-1.5">
                  <Label>Semester</Label>
                  <Input name="semester" type="number" min="1" max="8" defaultValue={selectedRecord.semester || 1} required />
                </div>
                <div className="space-y-1.5">
                  <Label>Attendance (%)</Label>
                  <Input name="attendance" type="number" min="0" max="100" defaultValue={selectedRecord.attendance || 0} required />
                </div>
                <div className="space-y-1.5">
                  <Label>CGPA</Label>
                  <Input name="cgpa" type="number" step="0.01" min="0" max="10" defaultValue={selectedRecord.cgpa || 0} required />
                </div>
                <div className="space-y-1.5">
                  <Label>Backlogs</Label>
                  <Input name="backlogs" type="number" min="0" defaultValue={selectedRecord.backlogs || 0} required />
                </div>
              </div>
              <Button type="submit" className="w-full rounded-xl mt-4" disabled={editLoading}>
                {editLoading ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : null} Save Academic Data
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

const MetricItem = ({ label, value, valueClass = "" }: any) => (
  <div className="flex items-center justify-between p-3 rounded-xl bg-muted/20 border border-muted/30">
     <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{label}</span>
     <span className={`text-sm font-bold ${valueClass}`}>{value}</span>
  </div>
);

export default AcademicModule;
