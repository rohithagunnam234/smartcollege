import { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import StatusBadge from '@/components/StatusBadge';
import { DollarSign, Plus, Search, Loader2, Pencil, Trash, Filter, Calendar, Tag } from 'lucide-react';
import { toast } from 'sonner';
import { feeApi, studentApi } from '@/lib/api';

const departments = ['CSE', 'ECE', 'ME', 'CE', 'EEE'];
const years = ['1', '2', '3', '4'];
const batches = ['2021-2025', '2022-2026', '2023-2027', '2024-2028'];
const feeTypes = ["Academic", "Transport", "Hostel", "Semester", "Examination", "Other"];

const FeeManagement = () => {
  const [fees, setFees] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterDept, setFilterDept] = useState('all');
  const [filterYear, setFilterYear] = useState('all');
  const [filterBatch, setFilterBatch] = useState('all');
  const [filterAcadYear, setFilterAcadYear] = useState('all');
  const [filterType, setFilterType] = useState('all');
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingFee, setEditingFee] = useState<any>(null);
  const [editFormLoading, setEditFormLoading] = useState(false);

  const fetchFees = async () => {
    try {
      const { data } = await feeApi.getAll();
      setFees(data);
    } catch (err: any) {
      toast.error('Failed to fetch fees');
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const { data } = await studentApi.getAll();
      setStudents(data);
    } catch (err) {
      console.error('Failed to fetch students');
    }
  };

  useEffect(() => {
    fetchFees();
    fetchStudents();
  }, []);

  const academicYears = Array.from(new Set(fees.map(f => f.academicYear))).sort();

  const filtered = fees.filter(f => {
    const s = f.studentId || {};
    const matchSearch = (s.name || '').toLowerCase().includes(search.toLowerCase()) || 
                      (s.rollNo || '').toLowerCase().includes(search.toLowerCase());
    const matchDept = filterDept === 'all' || s.department === filterDept;
    const matchYear = filterYear === 'all' || s.year === filterYear;
    const matchBatch = filterBatch === 'all' || s.batch === filterBatch;
    const matchAcadYear = filterAcadYear === 'all' || f.academicYear === filterAcadYear;
    const matchType = filterType === 'all' || f.feeType === filterType;
    return matchSearch && matchDept && matchYear && matchBatch && matchAcadYear && matchType;
  });

  const totalCollected = fees.reduce((sum, f) => sum + (f.paidFee || 0), 0);
  const totalDue = fees.reduce((sum, f) => sum + (f.dueFee || 0), 0);

  const handleAssign = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormLoading(true);
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    
    if (!data.studentId) {
       toast.error('Please select a student');
       setFormLoading(false);
       return;
    }

    if (Number(data.paidFee || 0) > Number(data.totalFee)) {
       toast.error('Paid fee cannot be more than total fee');
       setFormLoading(false);
       return;
    }

    try {
      await feeApi.assign({
        studentId: data.studentId,
        totalFee: Number(data.totalFee),
        paidFee: Number(data.paidFee || 0),
        academicYear: data.academicYear,
        feeType: data.feeType
      });
      toast.success('Fee assigned successfully');
      setDialogOpen(false);
      fetchFees();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to assign fee');
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingFee) return;
    setEditFormLoading(true);
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    
    if (editingFee.paidFee + Number(data.paidFee || 0) > Number(data.totalFee)) {
       toast.error('Total paid amount cannot exceed total fee amount');
       setEditFormLoading(false);
       return;
    }
    
    try {
      await feeApi.update(editingFee._id, {
        totalFee: Number(data.totalFee),
        paidFee: Number(data.paidFee),
        academicYear: data.academicYear,
        feeType: data.feeType
      });
      toast.success('Fee record updated');
      setEditDialogOpen(false);
      fetchFees();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update fee');
    } finally {
      setEditFormLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this fee record?')) return;
    try {
      await feeApi.delete(id);
      toast.success('Fee record deleted');
      fetchFees();
    } catch (err: any) {
      toast.error('Failed to delete fee record');
    }
  };

  const openEditDialog = (fee: any) => {
    setEditingFee(fee);
    setEditDialogOpen(true);
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Fee Administration</h1>
          <p className="text-muted-foreground">Categorized tracking of multiple fee types</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild><Button className="shadow-lg"><Plus className="h-4 w-4 mr-2" />Assign Categorized Fee</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Categorized Fee Assignment</DialogTitle></DialogHeader>
            <form onSubmit={handleAssign} className="space-y-4 mt-2">
              <div>
                <Label>Select Student</Label>
                <Select name="studentId" required>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Roll No" /></SelectTrigger>
                  <SelectContent>
                    {students.map(s => <SelectItem key={s._id} value={s._id}>{s.rollNo} - {s.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                   <Label>Fee Category</Label>
                   <Select name="feeType" required defaultValue="Academic">
                     <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                     <SelectContent>{feeTypes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                   </Select>
                </div>
                <div><Label>Academic Year</Label><Input name="academicYear" required placeholder="2024-2025" className="mt-1" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Total Fee (₹)</Label><Input name="totalFee" required type="number" placeholder="50000" className="mt-1" /></div>
                <div><Label>Initial Paid (₹)</Label><Input name="paidFee" type="number" placeholder="0" className="mt-1" /></div>
              </div>
              <Button type="submit" className="w-full" disabled={formLoading}>
                {formLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Create Fee Record
              </Button>
            </form>
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent>
            <DialogHeader><DialogTitle>Edit Fee Details</DialogTitle></DialogHeader>
            {editingFee && (
              <form onSubmit={handleUpdate} className="space-y-4 mt-2">
                <div className="p-3 border rounded-xl bg-muted/30">
                  <p className="text-[10px] text-muted-foreground uppercase font-bold">Student</p>
                  <p className="text-sm font-bold text-primary">{editingFee.studentId?.rollNo} - {editingFee.studentId?.name}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Category</Label>
                    <Select name="feeType" defaultValue={editingFee.feeType}>
                      <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                      <SelectContent>{feeTypes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div><Label>Year</Label><Input name="academicYear" required defaultValue={editingFee.academicYear} className="mt-1" /></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>Total Fee (₹)</Label><Input name="totalFee" required type="number" defaultValue={editingFee.totalFee} className="mt-1" /></div>
                  <div><Label>Add Payment (₹)</Label><Input name="paidFee" required type="number" defaultValue={0} className="mt-1" /></div>
                </div>
                <Button type="submit" className="w-full" disabled={editFormLoading}>
                  {editFormLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Save Changes
                </Button>
              </form>
            )}
          </DialogContent>
        </Dialog>
      </div>

      <div className="glass-card rounded-xl p-4 mb-4 space-y-4 shadow-md bg-card border-0">
        <div className="flex flex-col sm:flex-row gap-3">
           <div className="relative flex-1">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
             <Input placeholder="Search students..." className="pl-10 h-10" value={search} onChange={e => setSearch(e.target.value)} />
           </div>
           <Select value={filterType} onValueChange={setFilterType}>
             <SelectTrigger className="w-full sm:w-40 h-10"><Tag className="h-4 w-4 mr-2" /><SelectValue placeholder="Fee Type" /></SelectTrigger>
             <SelectContent><SelectItem value="all">All Types</SelectItem>{feeTypes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
           </Select>
           <Select value={filterAcadYear} onValueChange={setFilterAcadYear}>
             <SelectTrigger className="w-full sm:w-40 h-10"><Calendar className="h-4 w-4 mr-2" /><SelectValue placeholder="Acad Year" /></SelectTrigger>
             <SelectContent><SelectItem value="all">All Acad Years</SelectItem>{academicYears.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}</SelectContent>
           </Select>
           <Select value={filterBatch} onValueChange={setFilterBatch}>
             <SelectTrigger className="w-full sm:w-40 h-10"><Filter className="h-4 w-4 mr-2" /><SelectValue placeholder="Batch" /></SelectTrigger>
             <SelectContent><SelectItem value="all">All Batches</SelectItem>{batches.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent>
           </Select>
           <Select value={filterDept} onValueChange={setFilterDept}>
             <SelectTrigger className="w-full sm:w-32 h-10"><SelectValue placeholder="Dept" /></SelectTrigger>
             <SelectContent><SelectItem value="all">All Depts</SelectItem>{departments.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
           </Select>
        </div>
      </div>

      <div className="glass-card rounded-2xl overflow-hidden border-0 shadow-2xl bg-card">
        {loading ? (
          <div className="flex items-center justify-center p-12"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>
        ) : (
          <Table>
            <TableHeader className="bg-muted/30"><TableRow>
              <TableHead className="font-bold">Roll No</TableHead>
              <TableHead className="font-bold">Student</TableHead>
              <TableHead className="font-bold">Category</TableHead>
              <TableHead className="font-bold">Year</TableHead>
              <TableHead className="font-bold text-right">Total & Paid</TableHead>
              <TableHead className="font-bold text-center">Status</TableHead>
              <TableHead className="text-right font-bold pr-6">Management</TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {filtered.map(f => (
                <TableRow key={f._id} className="hover:bg-muted/10 transition-colors">
                  <TableCell className="font-black text-primary">{f.studentId?.rollNo}</TableCell>
                  <TableCell>
                    <div className="font-bold text-sm">{f.studentId?.name || 'Unknown'}</div>
                    <div className="text-[10px] text-muted-foreground uppercase font-medium">{f.studentId?.department} · {f.studentId?.batch}</div>
                  </TableCell>
                  <TableCell><Badge variant="outline" className="text-[10px] border-primary/20 bg-primary/5">{f.feeType}</Badge></TableCell>
                  <TableCell className="text-xs font-bold">{f.academicYear}</TableCell>
                  <TableCell className="text-right">
                    <div className="text-xs font-black">₹{f.totalFee?.toLocaleString()}</div>
                    <div className="text-[10px] text-success font-black">
                      Paid: ₹{f.paidFee?.toLocaleString()}
                      {f.paidDate && (
                        <span className="ml-1 text-muted-foreground text-[9px] font-bold tracking-widest uppercase opacity-70 block">
                          ON {new Date(f.paidDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    <div className="text-[9px] text-warning font-black uppercase mt-0.5">Due: ₹{f.dueFee?.toLocaleString()}</div>
                  </TableCell>
                  <TableCell className="text-center"><StatusBadge status={f.status} /></TableCell>
                  <TableCell className="text-right pr-6 space-x-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditDialog(f)} title="Edit"><Pencil className="h-4 w-4 text-blue-500" /></Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDelete(f._id)} title="Delete"><Trash className="h-4 w-4 text-red-500" /></Button>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow><TableCell colSpan={7} className="text-center py-20 text-muted-foreground font-medium">No records found matching filters.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
};

export default FeeManagement;
