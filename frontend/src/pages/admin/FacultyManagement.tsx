import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { UserPlus, Search, Loader2, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { facultyApi } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

const departments = ['CSE', 'ECE', 'ME', 'CE', 'EEE'];

const FacultyManagement = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [faculty, setFaculty] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterDept, setFilterDept] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingFaculty, setEditingFaculty] = useState<any>(null);
  const [editFormLoading, setEditFormLoading] = useState(false);

  const fetchFaculty = async () => {
    try {
      const { data } = await facultyApi.getAll();
      setFaculty(data);
    } catch (err: any) {
      toast.error('Failed to fetch faculty members');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFaculty();
  }, []);

  const handleAdd = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormLoading(true);
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    try {
      await facultyApi.add(data);
      toast.success('Faculty member added successfully');
      setDialogOpen(false);
      fetchFaculty();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to add faculty');
    } finally {
      setFormLoading(false);
    }
  };

  const handleEdit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingFaculty) return;
    setEditFormLoading(true);
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    
    if (!data.password) delete data.password;

    try {
      const id = editingFaculty._id || editingFaculty.id;
      await facultyApi.update(id, data);
      toast.success('Faculty member updated successfully');
      setEditDialogOpen(false);
      fetchFaculty();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update faculty');
    } finally {
      setEditFormLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this faculty member?')) return;
    try {
      await facultyApi.delete(id);
      toast.success('Faculty member deleted');
      fetchFaculty();
    } catch (err: any) {
      toast.error('Failed to delete faculty');
    }
  };

  const filtered = faculty.filter((f) => {
    const matchSearch = f.name.toLowerCase().includes(search.toLowerCase()) || 
                      f.email.toLowerCase().includes(search.toLowerCase());
    const matchDept = filterDept === 'all' || f.department === filterDept;
    return matchSearch && matchDept;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Faculty Management</h1>
          <p className="text-muted-foreground">Manage teaching and administrative staff</p>
        </div>
        {isAdmin && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-xl"><UserPlus className="h-4 w-4 mr-2" />Add Faculty</Button>
            </DialogTrigger>
            <DialogContent className="rounded-2xl max-w-md">
              <DialogHeader><DialogTitle className="font-black">Add New Faculty</DialogTitle></DialogHeader>
              <form onSubmit={handleAdd} className="space-y-4 mt-2">
                <div className="space-y-3">
                  <div className="space-y-1.5"><Label>Name</Label><Input name="name" required placeholder="Name" /></div>
                  <div className="space-y-1.5">
                    <Label>Mails</Label>
                    <div className="grid grid-cols-1 gap-2">
                      <Input name="email" required type="email" placeholder="Official Email" />
                      <Input name="personalEmail" type="email" placeholder="Personal Email (Optional)" />
                    </div>
                  </div>
                  <div className="space-y-1.5"><Label>Password</Label><Input name="password" required type="password" placeholder="Password" /></div>
                  <div className="space-y-1.5"><Label>Phone Number</Label><Input name="phone" required placeholder="Phone" /></div>
                  <div className="space-y-1.5">
                    <Label>Dept</Label>
                    <Select name="department" required>
                      <SelectTrigger><SelectValue placeholder="Select Dept" /></SelectTrigger>
                      <SelectContent>{departments.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                </div>
                <Button type="submit" className="w-full rounded-xl" disabled={formLoading}>
                  {formLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null} Add Faculty Member
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="glass-card rounded-2xl p-4">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search faculty..." className="pl-10" value={search} onChange={e => setSearch(e.target.value)} />
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

        <div className="rounded-xl border overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="font-bold">Name</TableHead>
                <TableHead className="font-bold">Contact</TableHead>
                <TableHead className="font-bold">Department</TableHead>
                <TableHead className="font-bold">Status</TableHead>
                {isAdmin && <TableHead className="text-right font-bold">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={5} className="text-center py-10"><Loader2 className="animate-spin mx-auto h-6 w-6 text-primary/40" /></TableCell></TableRow>
              ) : filtered.map((f) => (
                <TableRow key={f._id || f.id}>
                  <TableCell className="font-medium">{f.name}</TableCell>
                  <TableCell>
                    <div className="text-sm">{f.email}</div>
                    <div className="text-xs text-muted-foreground">{f.phone}</div>
                  </TableCell>
                  <TableCell><span className="text-xs font-bold uppercase py-1 px-2 rounded-lg bg-primary/5 text-primary">{f.department}</span></TableCell>
                  <TableCell>
                    <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-full ${f.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                      {f.status || 'Pending'}
                    </span>
                  </TableCell>
                  {isAdmin && (
                    <TableCell className="text-right space-x-2">
                      <Button variant="ghost" size="sm" onClick={() => { setEditingFaculty(f); setEditDialogOpen(true); }}><Pencil className="h-4 w-4 text-primary" /></Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(f._id || f.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="rounded-2xl max-w-md">
          <DialogHeader><DialogTitle className="font-black">Edit Faculty Member</DialogTitle></DialogHeader>
          {editingFaculty && (
            <form onSubmit={handleEdit} className="space-y-4 mt-2">
              <div className="space-y-3">
                <div className="space-y-1.5"><Label>Name</Label><Input name="name" required defaultValue={editingFaculty.name} /></div>
                <div className="space-y-1.5">
                  <Label>Mails</Label>
                  <div className="grid grid-cols-1 gap-2">
                    <Input name="email" required type="email" defaultValue={editingFaculty.email} />
                    <Input name="personalEmail" type="email" defaultValue={editingFaculty.personalEmail || ''} placeholder="Personal Email" />
                  </div>
                </div>
                <div className="space-y-1.5"><Label>Password (empty to keep current)</Label><Input name="password" type="password" placeholder="New Password" /></div>
                <div className="space-y-1.5"><Label>Phone Number</Label><Input name="phone" required defaultValue={editingFaculty.phone} /></div>
                <div className="space-y-1.5">
                  <Label>Dept</Label>
                  <Select name="department" defaultValue={editingFaculty.department} required>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{departments.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Status</Label>
                  <Select name="status" defaultValue={editingFaculty.status || "approved"} required>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button type="submit" className="w-full rounded-xl" disabled={editFormLoading}>
                {editFormLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null} Save Changes
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FacultyManagement;
