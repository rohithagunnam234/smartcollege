import { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ExternalLink, CheckCircle, XCircle, Search, Filter, Loader2, Pencil, Trash, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { documentApi, studentApi } from '@/lib/api';

const batches = ['2021-2025', '2022-2026', '2023-2027', '2024-2028'];
const docTypes = ['10th_Marksheet', '12th_Marksheet', 'Transfer_Certificate', 'Aadhar_Card', 'College_ID'];

const DocumentVerification = () => {
  const [docs, setDocs] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterBatch, setFilterBatch] = useState('all');

  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingDoc, setEditingDoc] = useState<any>(null);
  const [formLoading, setFormLoading] = useState(false);

  const fetchData = async () => {
    try {
      const [docsRes, studentsRes] = await Promise.all([
        documentApi.getAll(),
        studentApi.getAll()
      ]);
      setDocs(Array.isArray(docsRes.data) ? docsRes.data : []);
      setStudents(Array.isArray(studentsRes.data) ? studentsRes.data : []);
    } catch (err) {
      toast.error('Failed to fetch documentation records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      await documentApi.updateStatus(id, { status });
      toast.success(`Document marked as ${status}`);
      fetchData();
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this document record?')) return;
    try {
      await documentApi.delete(id);
      toast.success('Document deleted');
      fetchData();
    } catch (err) {
      toast.error('Failed to delete document');
    }
  };

  const handleAdd = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormLoading(true);
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    try {
      await documentApi.upload(data.studentId as string, {
        documentType: data.documentType,
        fileUrl: data.fileUrl,
        status: 'Verified'
      });
      toast.success('Official document uploaded');
      setAddDialogOpen(false);
      fetchData();
    } catch (err) {
      toast.error('Failed to upload document');
    } finally {
      setFormLoading(false);
    }
  };

  const handleEdit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingDoc) return;
    setFormLoading(true);
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    try {
      await documentApi.update(editingDoc._id, data);
      toast.success('Document updated');
      setEditDialogOpen(false);
      fetchData();
    } catch (err) {
      toast.error('Failed to update details');
    } finally {
      setFormLoading(false);
    }
  };

  const filtered = docs.filter((d) => {
    const s = d.studentId || {};
    const matchSearch = String(s.name || '').toLowerCase().includes(search.toLowerCase()) || 
                      String(s.rollNo || '').toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'all' || d.status === filterStatus;
    const matchBatch = filterBatch === 'all' || s.batch === filterBatch;
    return matchSearch && matchStatus && matchBatch;
  });

  const getValidUrl = (url: string) => {
     if (!url) return '#';
     return url.startsWith('http') ? url : `https://${url}`;
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Document Hub</h1>
          <p className="text-muted-foreground">Manage official digital records for all students</p>
        </div>
        <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
          <DialogTrigger asChild><Button className="bg-primary hover:bg-primary/90 shadow-lg"><Plus className="h-4 w-4 mr-2" />Add Document</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>New Official Record</DialogTitle></DialogHeader>
            <form onSubmit={handleAdd} className="space-y-4 mt-2">
              <div>
                <Label>Select Student</Label>
                <Select name="studentId" required>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Choose student" /></SelectTrigger>
                  <SelectContent>
                    {students.map(s => <SelectItem key={s._id} value={s._id}>{s.rollNo} - {s.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-1 gap-4">
                <div>
                   <Label>Type</Label>
                   <Select name="documentType" required>
                      <SelectTrigger className="mt-1"><SelectValue placeholder="Select type" /></SelectTrigger>
                      <SelectContent>{docTypes.map(t => <SelectItem key={t} value={t}>{t.replace('_', ' ')}</SelectItem>)}</SelectContent>
                   </Select>
                </div>
                <div><Label>File URL (Direct Link)</Label><Input name="fileUrl" required placeholder="OneDrive/Drive Link" className="mt-1" /></div>
              </div>
              <Button type="submit" className="w-full" disabled={formLoading}>
                 {formLoading ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : null}
                 Upload Record
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="glass-card rounded-xl p-4 mb-5 shadow-sm border border-muted-foreground/10">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search records..." className="pl-10 h-10 border-0 bg-muted/50 focus-visible:ring-1" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <Select value={filterBatch} onValueChange={setFilterBatch}>
             <SelectTrigger className="w-full sm:w-44 h-10 bg-muted/50 border-0"><Filter className="h-4 w-4 mr-2" /><SelectValue placeholder="Batch" /></SelectTrigger>
             <SelectContent><SelectItem value="all">All Batches</SelectItem>{batches.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent>
          </Select>
          <div className="flex gap-1.5 overflow-x-auto pb-2 sm:pb-0">
            {['all', 'Verified', 'Pending', 'Rejected'].map((s) => (
              <Button key={s} variant={filterStatus === s ? 'default' : 'ghost'} size="sm" onClick={() => setFilterStatus(s)} className={cn("capitalize px-3 h-8 text-xs", filterStatus === s && "bg-primary text-white shadow-md")}>{s}</Button>
            ))}
          </div>
        </div>
      </div>

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Modify Record Details</DialogTitle></DialogHeader>
          {editingDoc && (
            <form onSubmit={handleEdit} className="space-y-4 mt-2">
              <div className="bg-muted/50 p-3 rounded-xl">
                 <p className="text-[10px] uppercase font-bold text-muted-foreground">Original Student</p>
                 <p className="text-sm font-bold">{editingDoc.studentId?.name} ({editingDoc.studentId?.rollNo})</p>
              </div>
              <div>
                <Label>Document Type</Label>
                <Select name="documentType" defaultValue={editingDoc.documentType}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>{docTypes.map(t => <SelectItem key={t} value={t}>{t.replace('_', ' ')}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Update File URL</Label><Input name="fileUrl" required defaultValue={editingDoc.fileUrl} className="mt-1" /></div>
              <div>
                <Label>Set Status</Label>
                <Select name="status" defaultValue={editingDoc.status}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                     {['Pending', 'Verified', 'Rejected'].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full" disabled={formLoading}>
                 {formLoading ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : null}
                 Apply Changes
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <div className="glass-card rounded-2xl overflow-hidden border-0 shadow-2xl bg-card">
        {loading ? (
             <div className="flex items-center justify-center p-20"><Loader2 className="animate-spin h-10 w-10 text-primary" /></div>
        ) : (
          <Table>
            <TableHeader className="bg-muted/30"><TableRow>
              <TableHead className="font-bold">Student Identity</TableHead>
              <TableHead className="font-bold">Record Type</TableHead>
              <TableHead className="font-bold">Verification</TableHead>
              <TableHead className="font-bold">View</TableHead>
              <TableHead className="text-right font-bold pr-6">Management</TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {filtered.map((d) => (
                <TableRow key={d._id} className="hover:bg-muted/10 transition-colors group">
                  <TableCell>
                    <div className="font-black text-primary text-sm">{d.studentId?.rollNo || 'UNKNOWN'}</div>
                    <div className="text-xs font-bold">{d.studentId?.name || 'N/A'}</div>
                    <div className="text-[9px] uppercase text-muted-foreground font-black tracking-tighter">{d.studentId?.batch} · {d.studentId?.department}</div>
                  </TableCell>
                  <TableCell>
                    <div className="capitalize text-xs font-black tracking-tight">{d.documentType?.replace('_', ' ')}</div>
                    <div className="text-[9px] text-muted-foreground mt-0.5 uppercase font-bold tracking-wider">
                      Submitted: {new Date(d.uploadedAt || d.createdAt).toLocaleDateString()}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={d.status === 'Verified' ? 'default' : d.status === 'Rejected' ? 'destructive' : 'secondary'} className="text-[9px] uppercase font-black">
                       {d.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm" asChild className="h-8 px-3 text-[10px] font-bold shadow-sm transition-all hover:bg-primary hover:text-white">
                       <a href={getValidUrl(d.fileUrl)} target="_blank" rel="noreferrer"><ExternalLink className="h-3 w-3 mr-1.5" />Preview Official PDF</a>
                    </Button>
                  </TableCell>
                  <TableCell className="text-right pr-6">
                    <div className="flex justify-end gap-1 translate-x-2 opacity-60 group-hover:opacity-100 transition-opacity">
                      {d.status !== 'Verified' && (
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-success hover:bg-success/10" onClick={() => handleUpdateStatus(d._id, 'Verified')}><CheckCircle className="h-4 w-4" /></Button>
                      )}
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-500 hover:bg-blue-500/10" onClick={() => { setEditingDoc(d); setEditDialogOpen(true); }}><Pencil className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:bg-red-500/10" onClick={() => handleDelete(d._id)}><Trash className="h-4 w-4" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow><TableCell colSpan={5} className="text-center py-24 text-muted-foreground font-medium">No records matching your search.<br/>Try adding a new official document.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
};

const cn = (...classes: any[]) => classes.filter(Boolean).join(' ');

export default DocumentVerification;
