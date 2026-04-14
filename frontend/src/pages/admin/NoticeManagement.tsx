import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Bell, Plus, Trash2, Loader2, Pencil } from 'lucide-react';
import { toast } from 'sonner';
import { noticeApi } from '@/lib/api';

const departments = ['CSE', 'ECE', 'ME', 'CE', 'EEE', 'All'];
const years = ['1', '2', '3', '4', 'All'];

const NoticeManagement = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [notices, setNotices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingNotice, setEditingNotice] = useState<any>(null);

  const fetchNotices = async () => {
    try {
      const { data } = await noticeApi.getAll();
      setNotices(data);
    } catch (err) {
      toast.error('Failed to fetch notices');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotices();
  }, []);

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormLoading(true);
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    try {
      await noticeApi.create(data);
      toast.success('Notice published');
      setAddDialogOpen(false);
      fetchNotices();
    } catch (err: any) {
      toast.error(err.response?.data || 'Failed to create notice');
    } finally {
      setFormLoading(false);
    }
  };

  const handleEdit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingNotice) return;
    setFormLoading(true);
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    try {
      await noticeApi.update(editingNotice._id, data);
      toast.success('Notice updated');
      setEditDialogOpen(false);
      fetchNotices();
    } catch (err: any) {
      toast.error(err.response?.data || 'Failed to update notice');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this notice?')) return;
    try {
      await noticeApi.delete(id);
      toast.success('Notice deleted');
      fetchNotices();
    } catch (err) {
      toast.error('Failed to delete notice');
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Notice Management</h1>
          <p className="text-muted-foreground">Broadcast official updates to students and staff</p>
        </div>
        {isAdmin && (
          <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
            <DialogTrigger asChild><Button className="shadow-lg"><Plus className="h-4 w-4 mr-2" />New Notice</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Create Official Notice</DialogTitle></DialogHeader>
              <form onSubmit={handleCreate} className="space-y-4 mt-2">
                <div><Label>Title</Label><Input name="title" required placeholder="Notice title" className="mt-1" /></div>
                <div><Label>Message</Label><Textarea name="message" required placeholder="Type your message here..." className="mt-1" rows={4} /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Target Department</Label>
                    <Select name="department" defaultValue="All"><SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                      <SelectContent>{departments.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Target Year</Label>
                    <Select name="year" defaultValue="All"><SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                      <SelectContent>{years.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={formLoading}>
                  {formLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Publish Notice
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Notice</DialogTitle></DialogHeader>
          {editingNotice && (
            <form onSubmit={handleEdit} className="space-y-4 mt-2">
              <div><Label>Title</Label><Input name="title" required defaultValue={editingNotice.title} className="mt-1" /></div>
              <div><Label>Message</Label><Textarea name="message" required defaultValue={editingNotice.message} className="mt-1" rows={4} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Target Department</Label>
                  <Select name="department" defaultValue={editingNotice.department}><SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>{departments.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Target Year</Label>
                  <Select name="year" defaultValue={editingNotice.year}><SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>{years.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={formLoading}>
                {formLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Update Notice
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <div className="space-y-4">
        {loading ? (
             <div className="flex items-center justify-center p-12"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>
        ) : notices.map((n) => (
          <div key={n._id} className="glass-card rounded-xl p-6 border-0 shadow-lg bg-card transition-all hover:bg-muted/5">
            <div className="flex gap-4">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0"><Bell className="h-6 w-6" /></div>
              <div className="flex-1">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-lg leading-tight">{n.title}</h3>
                  {isAdmin && (
                    <div className="flex gap-1">
                       <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-500" onClick={() => { setEditingNotice(n); setEditDialogOpen(true); }}><Pencil className="h-4 w-4" /></Button>
                       <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(n._id)}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  )}
                </div>
                <p className="text-muted-foreground mb-4 text-sm leading-relaxed">{n.message}</p>
                <div className="flex flex-wrap gap-2 items-center">
                  <span className="text-[10px] font-bold uppercase tracking-widest bg-primary/10 text-primary px-2 py-1 rounded-md">Dept: {n.department}</span>
                  <span className="text-[10px] font-bold uppercase tracking-widest bg-muted px-2 py-1 rounded-md">Year: {n.year}</span>
                  <span className="text-[10px] text-muted-foreground ml-auto font-bold">{new Date(n.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
        {!loading && notices.length === 0 && (
          <div className="text-center py-20 bg-muted/20 rounded-2xl border-2 border-dashed border-muted">
             <Bell className="h-12 w-12 mx-auto text-muted mb-2 opacity-20" />
             <p className="text-muted-foreground font-medium">No notices published yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NoticeManagement;
