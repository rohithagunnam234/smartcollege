import { useEffect, useState, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  Users, DollarSign, Clock, AlertCircle,
  BarChart3, Loader2, GraduationCap, Briefcase, Award, Search, Filter
} from 'lucide-react';
import StatCard from '@/components/StatCard';
import { studentApi, feeApi, documentApi } from '@/lib/api';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer, Cell
} from 'recharts';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface AnalyticsRow {
  label: string;
  students: number;
  collected: number;
  pending: number;
  totalFee: number;
  pct: number;
  avgAttendance: number;
  avgCGPA: number;
  totalBacklogs: number;
  placedCount: number;
  placementPending: number;
  unplacedCount: number;
}

interface StudentFeeInfo {
  id: string;
  name: string;
  rollNo: string;
  department: string;
  batch: string;
  totalFee: number;
  paidFee: number;
  dueFee: number;
  status: string;
}

// Custom tooltips
const CustomTooltip = ({ active, payload, label, suffix = "" }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-popover border border-border rounded-xl shadow-2xl p-4 text-sm animate-in zoom-in-95 duration-200">
      <p className="font-black mb-2 text-primary uppercase tracking-widest text-[10px]">{label}</p>
      <div className="space-y-1.5">
        {payload.map((p: any) => (
          <div key={p.name} className="flex items-center justify-between gap-4">
            <span className="text-muted-foreground flex items-center gap-1.5 text-xs">
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: p.color }} />
              {p.name}:
            </span>
            <span className="font-bold text-foreground">
              {p.name.includes('Fee') || p.name.includes('Revenue') || p.name.includes('Pending') ? '₹' : ''}
              {Number(p.value).toLocaleString()}
              {suffix}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

const BATCH_COLORS = [
  '#6366f1', '#8b5cf6', '#06b6d4', '#10b981',
  '#f59e0b', '#ef4444', '#ec4899', '#84cc16',
];

const AdminDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ students: 0, fees: 0, pendingFees: 0, pendingDocs: 0, placed: 0, offers: 0 });
  const [batchData, setBatchData] = useState<AnalyticsRow[]>([]);
  const [deptData, setDeptData] = useState<AnalyticsRow[]>([]);
  const [allStudentFees, setAllStudentFees] = useState<StudentFeeInfo[]>([]);
  
  const [activeTab, setActiveTab] = useState<'revenue' | 'enrollment' | 'academic' | 'placement' | 'individual'>('revenue');
  const [groupBy, setGroupBy] = useState<'batch' | 'department'>('batch');
  
  // Individual student filters
  const [searchQuery, setSearchQuery] = useState('');
  const [deptFilter, setDeptFilter] = useState('all');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [students, fees, docs] = await Promise.all([
          studentApi.getAll(),
          feeApi.getAll(),
          documentApi.getAll(),
        ]);

        const studentList: any[] = students.data;
        const feeList: any[] = fees.data;
        const docList: any[] = docs.data;

        const totalFees = feeList.reduce((s, f) => s + (f.paidFee || 0), 0);
        const pendingFees = feeList.reduce((s, f) => s + (f.dueFee || 0), 0);
        const pendingDocs = docList.filter((d) => d.status === 'Pending' || d.status === 'pending').length;

        const placedCount = studentList.filter(s => s.placed === 'Yes').length;
        const totalOffers = studentList.reduce((acc, s) => acc + (Number(s.companiesSelected) || 0), 0);

        setStats({ students: studentList.length, fees: totalFees, pendingFees, pendingDocs, placed: placedCount, offers: totalOffers });

        // Map fees to students for individual view
        const studentsWithFees: StudentFeeInfo[] = feeList.map(f => {
          const s = f.studentId || {};
          return {
            id: f._id,
            name: s.name || 'Name Not Linked',
            rollNo: s.rollNo || 'N/A',
            department: s.department || 'Unassigned',
            batch: s.batch || 'Unassigned',
            totalFee: f.totalFee || 0,
            paidFee: f.paidFee || 0,
            dueFee: f.dueFee || 0,
            status: f.status || 'Pending'
          };
        });
        setAllStudentFees(studentsWithFees);

        // Processor function for any grouping
        const processGrouping = (key: 'batch' | 'department'): AnalyticsRow[] => {
          const grouped: Record<string, any> = {};
          
          studentList.forEach(s => {
            const label = (s[key] && s[key].trim() !== "") ? s[key] : 'Not Assigned';
            if (!grouped[label]) {
              grouped[label] = {
                label, students: 0, collected: 0, pending: 0, totalFee: 0,
                attendance: [], cgpa: [], backlogs: 0,
                placed: 0, p_pending: 0, unplaced: 0
              };
            }
            grouped[label].students++;
            grouped[label].attendance.push(Number(s.attendance) || 0);
            grouped[label].cgpa.push(Number(s.cgpa) || 0);
            grouped[label].backlogs += Number(s.backlogs) || 0;

            const pStatus = s.placed || 'Pending';
            if (pStatus === 'Yes') grouped[label].placed++;
            else if (pStatus === 'Pending') grouped[label].p_pending++;
            else grouped[label].unplaced++;
          });

          feeList.forEach(f => {
            const s = f.studentId;
            const label = (s?.[key] && s[key].trim() !== "") ? s[key] : 'Not Assigned';
            if (grouped[label]) {
              grouped[label].totalFee += f.totalFee || 0;
              grouped[label].collected += f.paidFee || 0;
              grouped[label].pending += f.dueFee || 0;
            }
          });

          return Object.values(grouped).map((g: any) => ({
            label: g.label,
            students: g.students,
            collected: g.collected,
            pending: g.pending,
            totalFee: g.totalFee,
            pct: g.totalFee > 0 ? Math.round((g.collected / g.totalFee) * 100) : 0,
            avgAttendance: g.attendance.length ? Math.round(g.attendance.reduce((a: any, b: any) => a + b, 0) / g.attendance.length) : 0,
            avgCGPA: g.cgpa.length ? Number((g.cgpa.reduce((a: any, b: any) => a + b, 0) / g.cgpa.length).toFixed(2)) : 0,
            totalBacklogs: g.backlogs,
            placedCount: g.placed,
            placementPending: g.p_pending,
            unplacedCount: g.unplaced
          })).sort((a, b) => a.label.localeCompare(b.label));
        };

        setBatchData(processGrouping('batch'));
        setDeptData(processGrouping('department'));
      } catch (err) {
        console.error('Failed to fetch dashboard stats');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const currentChartData = useMemo(() => {
    return groupBy === 'batch' ? batchData : deptData;
  }, [groupBy, batchData, deptData]);

  const filteredIndividualFees = useMemo(() => {
    return allStudentFees.filter(s => {
      const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            s.rollNo.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesDept = deptFilter === 'all' || s.department === deptFilter;
      return matchesSearch && matchesDept;
    }).sort((a, b) => b.dueFee - a.dueFee).slice(0, 15);
  }, [allStudentFees, searchQuery, deptFilter]);

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin h-8 w-8 text-primary" />
      </div>
    );

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-foreground uppercase italic px-1">
            Admin <span className="text-primary">Intelligence</span> Dashboard
          </h1>
          <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-[0.2em] mt-1 px-1">Institutional Performance & Analytics</p>
        </div>
      </div>

      {/* Modern Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard title="Total Enrollment" value={stats.students.toString()} icon={Users} trend="Active Students" />
        {user?.role === 'admin' && (
          <>
            <StatCard title="Revenue Collected" value={`₹${(stats.fees / 100000).toFixed(1)}L`} icon={DollarSign} trend="Cumulative" trendUp />
            <StatCard title="Total Outstanding" value={`₹${(stats.pendingFees / 100000).toFixed(1)}L`} icon={Clock} trend="Pending Fees" />
            <StatCard title="Doc Compliance" value={stats.pendingDocs.toString()} icon={AlertCircle} trend="Incomplete Verification" />
          </>
        )}
        <StatCard title="Placement Rate" value={`${Math.round((stats.placed/stats.students)*100)}%`} icon={Briefcase} trend="Students Placed" trendUp />
        <StatCard title="Job Pipeline" value={stats.offers.toString()} icon={Award} trend="Total Selections" trendUp />
      </div>

      <div className="glass-card rounded-2xl p-6 border border-border shadow-xl relative overflow-hidden backdrop-blur-xl bg-card/40">
        <div className="absolute top-0 right-0 p-8 opacity-[0.05] pointer-events-none text-primary">
          <BarChart3 size={200} />
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8 relative z-10">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-lg shadow-primary/5">
              <BarChart3 className="text-primary h-6 w-6" />
            </div>
            <div>
              <h3 className="text-xl font-black text-foreground uppercase tracking-tight">Analytical Insights</h3>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[10px] uppercase font-black text-muted-foreground tracking-widest">Aggregate View</span>
                <span className="h-1 w-1 rounded-full bg-border" />
                <span className="text-[10px] uppercase font-black text-primary tracking-widest">Live Data</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 items-center">
            {/* Group By Toggle */}
            <div className="flex items-center bg-muted p-1 rounded-xl border border-border">
              <button 
                onClick={() => setGroupBy('batch')}
                className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${groupBy === 'batch' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
              >
                By Batch
              </button>
              <button 
                onClick={() => setGroupBy('department')}
                className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${groupBy === 'department' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
              >
                By Dept
              </button>
            </div>

            <div className="h-8 w-px bg-white/10 mx-1 hidden sm:block" />

            {/* Category Tabs */}
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'revenue', label: 'Revenue', adminOnly: true },
              { id: 'enrollment', label: 'Enrollment', adminOnly: false },
              { id: 'academic', label: 'Performance', adminOnly: false },
              { id: 'placement', label: 'Placements', adminOnly: false },
              { id: 'individual', label: 'Individual Student', adminOnly: true }
            ].filter(tab => !tab.adminOnly || user?.role === 'admin').map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border ${activeTab === tab.id ? 'bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/10 scale-105' : 'bg-muted text-muted-foreground border-border hover:bg-muted/80 hover:text-foreground'}`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          </div>
        </div>

        <div className="relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
          {activeTab === 'revenue' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-[0.25em]">Financial Distribution (₹)</p>
              </div>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={currentChartData} barGap={12}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                  <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 800, fill: 'currentColor' }} dy={10} className="text-muted-foreground" />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'currentColor' }} tickFormatter={(v) => `₹${(v/1000).toFixed(0)}k`} className="text-muted-foreground/60" />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'currentColor', opacity: 0.05 }} />
                  <Legend iconType="circle" wrapperStyle={{ paddingTop: 20, fontSize: 10, textTransform: 'uppercase', fontWeight: 900 }} />
                  <Bar dataKey="collected" name="Success Revenue" fill="#10b981" radius={[8, 8, 0, 0]} maxBarSize={40} />
                  <Bar dataKey="pending" name="Outstanding Amount" fill="#ef4444" radius={[8, 8, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {activeTab === 'enrollment' && (
            <div className="space-y-6">
              <p className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.25em]">Student Distribution</p>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={currentChartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                  <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 800, fill: 'currentColor' }} dy={10} className="text-muted-foreground" />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'currentColor' }} className="text-muted-foreground/60" />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'currentColor', opacity: 0.05 }} />
                  <Bar dataKey="students" name="Students" radius={[12, 12, 0, 0]} maxBarSize={60}>
                    {currentChartData.map((_, i) => <Cell key={i} fill={BATCH_COLORS[i % BATCH_COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {activeTab === 'academic' && (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              <div className="bg-muted/10 rounded-2xl p-6 border border-border">
                <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-6">Avg Attendance Metrics (%)</p>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={currentChartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                    <XAxis dataKey="label" tick={{ fontSize: 9, fill: 'currentColor' }} className="text-muted-foreground" />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 9, fill: 'currentColor' }} className="text-muted-foreground/60" />
                    <Tooltip content={<CustomTooltip suffix="%" />} />
                    <Bar dataKey="avgAttendance" name="Attendance" fill="#0ea5e9" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="bg-muted/10 rounded-2xl p-6 border border-border">
                <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-6">Avg Academic CGPA</p>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={currentChartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                    <XAxis dataKey="label" tick={{ fontSize: 9, fill: 'currentColor' }} className="text-muted-foreground" />
                    <YAxis domain={[0, 10]} tick={{ fontSize: 9, fill: 'currentColor' }} className="text-muted-foreground/60" />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="avgCGPA" name="CGPA" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {activeTab === 'placement' && (
            <div className="space-y-6">
              <p className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.25em]">Placement Funnel Analysis</p>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={currentChartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                  <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 800, fill: 'currentColor' }} dy={10} className="text-muted-foreground" />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'currentColor' }} className="text-muted-foreground/60" />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend iconType="circle" wrapperStyle={{ paddingTop: 20, fontSize: 10, textTransform: 'uppercase', fontWeight: 900 }} />
                  <Bar dataKey="placedCount" name="Successfully Placed" stackId="p" fill="#10b981" />
                  <Bar dataKey="placementPending" name="In Pipeline" stackId="p" fill="#f59e0b" />
                  <Bar dataKey="unplacedCount" name="Not Yet Seized" stackId="p" fill="#ef4444" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {activeTab === 'individual' && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="relative group md:col-span-2">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input 
                    placeholder="Search by student name or roll number..." 
                    className="pl-11 h-12 bg-muted/50 border-border rounded-xl text-sm focus:ring-primary focus:border-primary transition-all"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="relative">
                  <Select value={deptFilter} onValueChange={setDeptFilter}>
                    <SelectTrigger className="h-12 bg-white/5 border-white/10 rounded-xl text-sm">
                      <div className="flex items-center gap-2">
                        <Filter className="h-4 w-4 text-white/30" />
                        <SelectValue placeholder="All Departments" />
                      </div>
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-white/10 text-white">
                      <SelectItem value="all">All Departments</SelectItem>
                      {deptData.map(d => <SelectItem key={d.label} value={d.label}>{d.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="bg-muted/20 rounded-2xl p-6 border border-border">
                <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-8">Individual Fee Distribution (Max 15 Outstanding)</p>
                <div className="h-[450px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={filteredIndividualFees} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                      <XAxis 
                        dataKey="name" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fontSize: 9, fontWeight: 700, fill: 'currentColor' }} 
                        angle={-45} 
                        textAnchor="end"
                        interval={0}
                        className="text-muted-foreground"
                      />
                      <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fontSize: 9, fill: 'currentColor' }} 
                        className="text-muted-foreground/60"
                        tickFormatter={(v) => `₹${(v/1000).toFixed(0)}k`}
                      />
                      <Tooltip 
                        content={<CustomTooltip />}
                        cursor={{ fill: 'currentColor', opacity: 0.05 }}
                      />
                      <Bar dataKey="dueFee" name="Pending Fee" fill="#ef4444" radius={[6, 6, 0, 0]} barSize={24}>
                        {filteredIndividualFees.map((_, i) => (
                          <Cell key={i} fillOpacity={1 - (i * 0.03)} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {filteredIndividualFees.slice(0, 5).map(s => (
                  <div key={s.id} className="bg-muted/30 p-4 rounded-xl border border-border flex items-center justify-between group hover:bg-muted/50 transition-all">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center font-black text-primary text-xs">
                        {s.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-foreground group-hover:text-primary transition-colors">{s.name}</h4>
                        <p className="text-[10px] text-muted-foreground uppercase font-black tracking-tighter">{s.rollNo} • {s.department}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-black text-foreground italic">₹{s.dueFee.toLocaleString()}</p>
                      <p className="text-[9px] uppercase font-black text-destructive tracking-widest mt-0.5">Payment Required</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
