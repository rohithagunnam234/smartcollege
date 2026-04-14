import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { placementApi, jobApi } from '@/lib/api';
import { toast } from 'sonner';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Briefcase, Target, Search, Loader2, Pencil, CheckCircle2, Clock, Plus, Building, FileText, Check, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import StatCard from '@/components/StatCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

const PlacementModule = () => {
  const { user } = useAuth();
  const isStaff = ['admin', 'faculty'].includes(user?.role || '');
  const isFaculty = user?.role === 'faculty';
  const isAdmin = user?.role === 'admin';
  const [records, setRecords] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [jobsLoading, setJobsLoading] = useState(false);
  const [appsLoading, setAppsLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [filterDept, setFilterDept] = useState('all');
  
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [profile, setProfile] = useState<any>(null);

  const [jobDialogOpen, setJobDialogOpen] = useState(false);
  const [createJobLoading, setCreateJobLoading] = useState(false);

  const [activeTab, setActiveTab] = useState('overview');

  const departments = ['CSE', 'ECE', 'ME', 'CE', 'EEE'];

  useEffect(() => {
    fetchInitialData();
  }, [isStaff]);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      if (isStaff) {
        await Promise.all([fetchRecords(), fetchJobs(), fetchApplications()]);
      } else {
        await Promise.all([fetchProfile(), fetchJobs(), fetchApplications()]);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecords = async () => {
    try {
      const { data } = await placementApi.getRecords();
      setRecords(data.filter((s: any) => s.year === '4'));
    } catch (err) {
      toast.error('Failed to fetch placement records');
    }
  };

  const fetchProfile = async () => {
    try {
      const { data } = await placementApi.getProfile();
      setProfile(data);
    } catch (err) {
      toast.error('Failed to fetch placement profile');
    }
  };

  const fetchJobs = async () => {
    setJobsLoading(true);
    try {
      const { data } = await jobApi.getJobs();
      setJobs(data);
    } catch (err) {
      toast.error('Failed to fetch jobs');
    } finally {
      setJobsLoading(false);
    }
  };

  const fetchApplications = async () => {
    setAppsLoading(true);
    try {
      const { data } = await jobApi.getApplications();
      setApplications(data);
    } catch (err) {
      toast.error('Failed to fetch applications');
    } finally {
      setAppsLoading(false);
    }
  };

  const handleUpdateRecord = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isFaculty) {
        toast.error('Only TPO/Faculty can update placement records');
        return;
    }
    setEditLoading(true);
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    try {
      await placementApi.update(selectedRecord._id || selectedRecord.id, data);
      toast.success('Placement record updated successfully');
      setEditDialogOpen(false);
      fetchRecords();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update record');
    } finally {
      setEditLoading(false);
    }
  };

  const handleCreateJob = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isStaff) return;
    
    setCreateJobLoading(true);
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    try {
      await jobApi.createJob(data);
      toast.success('Job posted successfully');
      setJobDialogOpen(false);
      fetchJobs();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create job');
    } finally {
      setCreateJobLoading(false);
    }
  };

  const handleApplyJob = async (jobId: string) => {
    try {
      await jobApi.applyForJob(jobId);
      toast.success('Applied successfully!');
      fetchApplications();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to apply');
    }
  };

  const handleUpdateAppStatus = async (appId: string, status: string) => {
    if (!isStaff) return;
    try {
      await jobApi.updateApplicationStatus(appId, { status });
      toast.success(`Application marked as ${status}`);
      fetchApplications();
      if (status === 'Selected') fetchRecords();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    }
  };

  const handleToggleJob = async (jobId: string) => {
    if (!isStaff) return;
    try {
      await jobApi.toggleJobStatus(jobId);
      toast.success('Job status updated');
      fetchJobs();
    } catch (err: any) {
      toast.error('Failed to toggle job status');
    }
  };

  const filteredRecords = records.filter(s => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) || 
                      (s.rollNo && s.rollNo.toLowerCase().includes(search.toLowerCase()));
    const matchDept = filterDept === 'all' || s.department === filterDept;
    return matchSearch && matchDept;
  });

  if (loading) {
    return <div className="flex justify-center items-center h-[60vh]"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>;
  }

  // Students not in 4th year cannot access this module
  if (!isStaff && user?.year !== '4' && profile?.year !== '4') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
            <Briefcase className="h-10 w-10 text-primary/40" />
        </div>
        <h2 className="text-2xl font-black text-foreground/80">Placement Module Restricted</h2>
        <p className="text-muted-foreground text-center max-w-md">Campus placements and career tracking are only applicable for students in their 4th year of study.</p>
        <div className="mt-4 p-4 rounded-xl bg-muted/30 border border-muted/50 text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Current Year: {user?.year || 'N/A'}
        </div>
      </div>
    );
  }

  const displayUser = profile || user;
  const isPlaced = displayUser?.placed === 'Yes';

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-foreground/90 tracking-tight">Placement & Career</h1>
          <p className="text-muted-foreground font-medium">Manage job postings, applications, and placement tracks</p>
        </div>
        {isStaff && (
          <Button onClick={() => setJobDialogOpen(true)} className="gap-2 rounded-xl">
            <Plus className="h-4 w-4" /> Post New Job
          </Button>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 max-w-md bg-muted p-1 rounded-2xl border border-border backdrop-blur-md">
           <TabsTrigger value="overview" className="rounded-xl data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all font-black text-[10px] uppercase tracking-widest text-muted-foreground">{isStaff ? 'Analytics' : 'My Journey'}</TabsTrigger>
           <TabsTrigger value="jobs" className="rounded-xl data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all font-black text-[10px] uppercase tracking-widest text-muted-foreground">Available Openings</TabsTrigger>
           <TabsTrigger value="applications" className="rounded-xl data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all font-black text-[10px] uppercase tracking-widest text-muted-foreground">Tracking</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6 space-y-6">
          {!isStaff ? (
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-6 rounded-2xl bg-card border border-border shadow-sm">
                   <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">Final Status</p>
                   <h4 className="text-3xl font-black text-foreground">{displayUser?.placed === 'Yes' ? 'SELECTED' : 'IN PROCESS'}</h4>
                   <p className="text-xs font-medium text-muted-foreground mt-1 italic">
                      {displayUser?.placed === 'Yes' ? 'Congratulations!' : 'Keep applying to eligible companies'}
                   </p>
                </div>
                <div className="p-6 rounded-2xl bg-card border border-border shadow-sm">
                   <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">Offers</p>
                   <h4 className="text-3xl font-black text-primary">{displayUser?.companiesSelected || '0'}</h4>
                   <p className="text-xs font-medium text-muted-foreground mt-1">Total Companies</p>
                </div>
                {displayUser?.selectedCompanies && (
                   <div className="md:col-span-2 p-6 rounded-2xl bg-card border border-border shadow-sm">
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">Hired By</p>
                      <p className="text-sm font-bold text-foreground">{displayUser?.selectedCompanies}</p>
                   </div>
                )}
             </div>
          ) : (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="p-6 rounded-[2rem] bg-card border border-border shadow-sm">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">Cohort Success</p>
                    <h4 className="text-3xl font-black text-foreground">{records.filter(s => s.placed === 'Yes').length}</h4>
                    <p className="text-[10px] text-muted-foreground font-bold uppercase">Placed Students</p>
                  </div>
                  <div className="p-6 rounded-[2rem] bg-card border border-border shadow-sm">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">Efficiency</p>
                    <h4 className="text-3xl font-black text-primary">{(records.length > 0 ? (records.filter(s => s.placed === 'Yes').length / records.length) * 100 : 0).toFixed(1)}%</h4>
                    <p className="text-[10px] text-muted-foreground font-bold uppercase">Average Rate</p>
                  </div>
                  <div className="p-6 rounded-[2rem] bg-card border border-border shadow-sm">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">Total Pool</p>
                    <h4 className="text-3xl font-black text-foreground">{records.length}</h4>
                    <p className="text-[10px] text-muted-foreground font-bold uppercase">Eligible Batch</p>
                  </div>
                  <div className="p-6 rounded-[2rem] bg-card border border-border shadow-sm">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">In Pipeline</p>
                    <h4 className="text-3xl font-black text-amber-500">{records.filter(s => s.placed !== 'Yes' && s.placed !== 'No').length}</h4>
                    <p className="text-[10px] text-muted-foreground font-bold uppercase">Waiting Results</p>
                  </div>
                </div>

                <div className="glass-card rounded-[2.5rem] p-8 border border-border/50">
                  <div className="flex flex-col sm:flex-row gap-4 mb-8 items-center">
                    <div className="relative flex-1 group w-full">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                      <Input placeholder="Search students for placement status..." className="pl-12 bg-muted/50 border-border rounded-2xl h-12 text-sm focus:ring-primary/20" value={search} onChange={e => setSearch(e.target.value)} />
                    </div>
                    <Select value={filterDept} onValueChange={setFilterDept}>
                      <SelectTrigger className="w-full sm:w-56 bg-muted/50 border-border rounded-2xl h-12 text-muted-foreground font-bold text-xs uppercase tracking-widest"><SelectValue /></SelectTrigger>
                      <SelectContent className="bg-popover border-border text-foreground">
                        <SelectItem value="all">Global Search</SelectItem>
                        {departments.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="rounded-[1.5rem] border border-border overflow-hidden bg-muted/20">
                    <Table>
                      <TableHeader className="bg-muted border-b border-border">
                        <TableRow className="hover:bg-transparent border-0">
                          <TableHead className="font-black text-[10px] uppercase tracking-widest text-muted-foreground h-14">Identity</TableHead>
                          <TableHead className="font-black text-[10px] uppercase tracking-widest text-muted-foreground h-14">Academic</TableHead>
                          <TableHead className="font-black text-[10px] uppercase tracking-widest text-muted-foreground h-14 text-center">Offers</TableHead>
                          <TableHead className="font-black text-[10px] uppercase tracking-widest text-muted-foreground h-14">Companies</TableHead>
                          <TableHead className="font-black text-[10px] uppercase tracking-widest text-muted-foreground h-14">Status</TableHead>
                          {isFaculty && <TableHead className="font-black text-[10px] uppercase tracking-widest text-muted-foreground h-14 text-right">Edit</TableHead>}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredRecords.map((s) => (
                          <TableRow key={s._id || s.id} className="hover:bg-muted/50 transition-colors border-border">
                            <TableCell>
                               <div>
                                  <p className="font-black text-foreground">{s.name}</p>
                                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{s.rollNo}</p>
                               </div>
                            </TableCell>
                            <TableCell>
                               <div className="flex items-center gap-2">
                                  <Badge variant="outline" className="text-[9px] font-black tracking-widest bg-muted border-border text-muted-foreground">{s.department}</Badge>
                                  <span className="text-xs font-bold text-muted-foreground">{s.cgpa || '0.0'} CGPA</span>
                               </div>
                            </TableCell>
                            <TableCell className="text-center">
                               <span className="h-8 w-8 rounded-full bg-primary/10 text-primary inline-flex items-center justify-center font-black text-xs border border-primary/20">
                                  {s.companiesSelected || 0}
                               </span>
                            </TableCell>
                            <TableCell className="max-w-[150px] truncate text-muted-foreground text-xs font-medium italic">
                               {s.selectedCompanies || '---'}
                            </TableCell>
                            <TableCell>
                              <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl border ${s.placed === 'Yes' ? 'bg-green-500/10 text-green-700 border-green-500/20' : s.placed === 'No' ? 'bg-red-500/10 text-red-700 border-red-500/20' : 'bg-amber-500/10 text-amber-700 border-amber-500/20'}`}>
                                {s.placed || 'Pending'}
                              </span>
                            </TableCell>
                            {isFaculty && (
                              <TableCell className="text-right">
                                <Button variant="ghost" size="icon" className="rounded-xl hover:bg-muted" onClick={() => { setSelectedRecord(s); setEditDialogOpen(true); }}>
                                  <Pencil className="h-4 w-4 text-muted-foreground" />
                                </Button>
                              </TableCell>
                            )}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="jobs" className="mt-6 space-y-6 outline-none">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             {jobsLoading ? (
                 <div className="col-span-full flex justify-center py-12"><Loader2 className="animate-spin text-primary h-10 w-10 opacity-40" /></div>
             ) : jobs.length === 0 ? (
                 <div className="col-span-full text-center py-24 bg-white/5 rounded-3xl border-2 border-dashed border-white/10">
                    <Building className="h-12 w-12 mx-auto text-white/10 mb-2" />
                    <p className="text-white/30 font-bold uppercase tracking-widest text-xs">No active opportunities</p>
                 </div>
             ) : (
                jobs.map(job => {
                   const hasApplied = applications.some((app: any) => 
                      (app.job?._id === job._id || app.job === job._id) && 
                      (isStaff ? false : app.student?._id === user?.id || app.student === user?.id)
                   );
                   
                   const isEligible = !isStaff ? (
                      (job.minCgpa ? (displayUser?.cgpa || 0) >= job.minCgpa : true) &&
                      (job.eligibleDepts?.length > 0 ? job.eligibleDepts.includes(displayUser?.department) : true)
                   ) : true;
                   
                   return (
                     <div key={job._id} className="p-6 rounded-2xl bg-card border border-border shadow-sm flex flex-col h-full hover:shadow-md transition-shadow">
                       <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="font-black text-foreground">{job.title}</h3>
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{job.company}</p>
                          </div>
                          <Badge variant="outline" className={`text-[9px] font-black uppercase tracking-widest border-0 ${isEligible ? 'bg-green-500/10 text-green-600' : 'bg-red-500/10 text-red-600'}`}>
                             {isEligible ? 'ELIGIBLE' : 'INELIGIBLE'}
                          </Badge>
                       </div>

                       <div className="grid grid-cols-2 gap-4 mb-6">
                          <div>
                             <p className="text-[9px] font-black text-muted-foreground/40 uppercase tracking-widest mb-1">Package</p>
                             <p className="text-sm font-bold text-foreground">{job.package || '---'}</p>
                          </div>
                          <div>
                             <p className="text-[9px] font-black text-muted-foreground/40 uppercase tracking-widest mb-1">Min CGPA</p>
                             <p className="text-sm font-bold text-foreground">{job.minCgpa || '0.0'}</p>
                          </div>
                       </div>

                       <div className="pt-4 border-t border-border flex items-center justify-between mt-auto">
                          <div className="text-[10px] font-bold text-muted-foreground/60">
                             Ends: {new Date(job.deadline).toLocaleDateString()}
                          </div>
                          
                          {!isStaff ? (
                             <Button 
                                size="sm" 
                                onClick={() => handleApplyJob(job._id)} 
                                disabled={job.status !== 'open' || hasApplied || isPlaced || !isEligible}
                                className="rounded-xl px-4 font-black text-[10px] bg-primary text-primary-foreground shadow-sm shadow-primary/20 h-9"
                             >
                                {isPlaced ? 'HIRED' : !isEligible ? 'LOCKED' : hasApplied ? 'APPLIED' : 'APPLY'}
                             </Button>
                          ) : (
                             <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleToggleJob(job._id)}
                                className="rounded-xl text-[10px] font-black uppercase text-muted-foreground h-9"
                             >
                                {job.status === 'open' ? 'CLOSE' : 'OPEN'}
                             </Button>
                          )}
                       </div>
                     </div>
                   );
                })
             )}
          </div>
        </TabsContent>

        <TabsContent value="applications" className="mt-6 space-y-6">
           <div className="glass-card rounded-2xl p-4 overflow-hidden border border-border bg-card shadow-sm">
              <Table>
                <TableHeader className="bg-muted border-b border-border">
                  <TableRow className="hover:bg-transparent border-0">
                     {isStaff && <TableHead className="font-black text-[10px] uppercase tracking-widest text-muted-foreground">Student</TableHead>}
                     {isStaff && <TableHead className="font-black text-[10px] uppercase tracking-widest text-muted-foreground text-center">Identity</TableHead>}
                     <TableHead className="font-black text-[10px] uppercase tracking-widest text-muted-foreground">Company</TableHead>
                     <TableHead className="font-black text-[10px] uppercase tracking-widest text-muted-foreground">Position</TableHead>
                     <TableHead className="font-black text-[10px] uppercase tracking-widest text-muted-foreground">Recruitment Status</TableHead>
                     {isStaff && <TableHead className="font-black text-[10px] uppercase tracking-widest text-muted-foreground text-right">Action</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                   {appsLoading ? (
                      <TableRow><TableCell colSpan={7} className="text-center py-20"><Loader2 className="animate-spin h-8 w-8 text-muted-foreground/20 mx-auto" /></TableCell></TableRow>
                   ) : applications.length === 0 ? (
                      <TableRow><TableCell colSpan={7} className="text-center py-20 text-muted-foreground/40 font-bold uppercase tracking-widest text-xs">No activity yet</TableCell></TableRow>
                   ) : applications.map(app => (
                      <TableRow key={app._id} className="border-border hover:bg-muted/30">
                         {isStaff && (
                            <TableCell className="font-black text-foreground">
                               {app.student?.name}
                            </TableCell>
                         )}
                         {isStaff && (
                            <TableCell className="text-center text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                               {app.student?.rollNo}
                            </TableCell>
                         )}
                         <TableCell className="font-black text-primary">{app.job?.company}</TableCell>
                         <TableCell className="text-muted-foreground font-medium text-xs">{app.job?.title}</TableCell>
                         <TableCell>
                            <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1.5 rounded-lg border ${app.status === 'Selected' ? 'bg-green-500/10 text-green-700 border-green-500/20' : app.status === 'Rejected' ? 'bg-red-500/10 text-red-700 border-red-500/20' : 'bg-amber-500/10 text-amber-700 border-amber-500/20'}`}>
                              {app.status === 'Selected' ? 'SELECTED' : app.status === 'Rejected' ? 'NOT SELECTED' : 'EVALUATING'}
                            </span>
                         </TableCell>
                         {isStaff && (
                            <TableCell className="text-right space-x-2">
                               {app.status === 'Pending' ? (
                                  <>
                                  <Button size="icon" variant="ghost" className="h-8 w-8 text-green-600 hover:bg-green-500/10 rounded-xl" onClick={() => handleUpdateAppStatus(app._id, 'Selected')}>
                                     <Check className="h-4 w-4" />
                                  </Button>
                                  <Button size="icon" variant="ghost" className="h-8 w-8 text-red-600 hover:bg-red-500/10 rounded-xl" onClick={() => handleUpdateAppStatus(app._id, 'Rejected')}>
                                     <X className="h-4 w-4" />
                                  </Button>
                                  </>
                               ) : (
                                  <span className="text-[10px] font-black text-muted-foreground/30 uppercase pr-2">Decision Made</span>
                               )}
                            </TableCell>
                         )}
                      </TableRow>
                   ))}
                </TableBody>
              </Table>
           </div>
        </TabsContent>
      </Tabs>

      {/* Record Update Dialog for Staff */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader><DialogTitle className="font-black">Update Placement Status</DialogTitle></DialogHeader>
          {selectedRecord && (
            <form onSubmit={handleUpdateRecord} className="space-y-4 mt-2">
              <div className="p-3 rounded-xl bg-primary/5 border border-primary/10 mb-2">
                <p className="text-xs font-bold text-primary">{selectedRecord.name}</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest">{selectedRecord.rollNo}</p>
              </div>
              <div className="grid gap-4">
                <div className="space-y-1.5">
                  <Label>Placement Status</Label>
                  <Select name="placed" defaultValue={selectedRecord.placed || "Pending"}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Pending">Pending</SelectItem>
                      <SelectItem value="Yes">Yes</SelectItem>
                      <SelectItem value="No">No</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Total Offers</Label>
                  <Input name="companiesSelected" type="number" min="0" defaultValue={selectedRecord.companiesSelected || 0} required />
                </div>
                <div className="space-y-1.5">
                  <Label>Company Names</Label>
                  <Input name="selectedCompanies" placeholder="e.g. Google, Microsoft" defaultValue={selectedRecord.selectedCompanies || ""} />
                </div>
              </div>
              <Button type="submit" className="w-full rounded-xl mt-4" disabled={editLoading}>
                {editLoading ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : null} Save Career Data
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Post New Job Dialog */}
      <Dialog open={jobDialogOpen} onOpenChange={setJobDialogOpen}>
        <DialogContent className="max-w-md rounded-3xl border-0 bg-neutral-900 text-white shadow-2xl">
          <DialogHeader><DialogTitle className="font-black text-2xl tracking-tighter">New Opportunity</DialogTitle></DialogHeader>
          <form onSubmit={handleCreateJob} className="space-y-5 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                 <Label className="text-[10px] font-black uppercase tracking-widest text-white/40">Company *</Label>
                 <Input name="company" placeholder="E.g. Google" required className="bg-white/5 border-white/10 rounded-xl" />
              </div>
              <div className="space-y-2">
                 <Label className="text-[10px] font-black uppercase tracking-widest text-white/40">Job Title *</Label>
                 <Input name="title" placeholder="E.g. SDE" required className="bg-white/5 border-white/10 rounded-xl" />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-white/40">Package</Label>
                  <Input name="package" placeholder="12 LPA" className="bg-white/5 border-white/10 rounded-xl" />
               </div>
               <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-white/40">Min CGPA</Label>
                  <Input name="minCgpa" type="number" step="0.1" placeholder="8.0" className="bg-white/5 border-white/10 rounded-xl" defaultValue="0" />
               </div>
            </div>

            <div className="space-y-2">
               <Label className="text-[10px] font-black uppercase tracking-widest text-white/40">Eligible Departments</Label>
               <div className="flex flex-wrap gap-2 p-3 bg-white/5 border border-white/10 rounded-xl">
                  {['CSE', 'ECE', 'ME', 'CE', 'EEE'].map(dept => (
                    <div key={dept} className="flex items-center gap-2">
                       <input type="checkbox" name="eligibleDepts" value={dept} className="rounded border-white/20 bg-white/5" defaultChecked />
                       <span className="text-xs font-bold text-white/60">{dept}</span>
                    </div>
                  ))}
               </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-white/40">Type</Label>
                  <Select name="jobType" defaultValue="Full-time">
                    <SelectTrigger className="bg-white/5 border-white/10 rounded-xl text-white/60"><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="Full-time">Full-time</SelectItem><SelectItem value="Internship">Internship</SelectItem></SelectContent>
                  </Select>
               </div>
               <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-white/40">Deadline</Label>
                  <Input type="date" name="deadline" required className="bg-white/5 border-white/10 rounded-xl" />
               </div>
            </div>

            <div className="space-y-2">
               <Label className="text-[10px] font-black uppercase tracking-widest text-white/40">Description</Label>
               <Textarea name="description" placeholder="Requirements..." rows={3} className="bg-white/5 border-white/10 rounded-xl" />
            </div>

            <Button type="submit" className="w-full rounded-2xl mt-4 font-black uppercase tracking-widest text-[11px] h-12 shadow-xl shadow-primary/20 transition-all hover:scale-[1.02]" disabled={createJobLoading}>
              {createJobLoading ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : 'Broadcast Opportunity'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

    </div>
  );
};

export default PlacementModule;
