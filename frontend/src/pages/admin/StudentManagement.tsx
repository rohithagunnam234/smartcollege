import { useEffect, useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { UserPlus, Search, Filter, Loader2, Pencil, FileSpreadsheet, Check, X, Trash2 } from 'lucide-react';
import * as XLSX from 'xlsx';
import { toast } from 'sonner';
import { studentApi } from '@/lib/api';

import { useAuth } from '@/contexts/AuthContext';

const departments = ['CSE', 'ECE', 'ME', 'CE', 'EEE'];
const years = ['1', '2', '3', '4'];
const sections = ['A', 'B', 'C'];
const batches = ['2021-2025', '2022-2026', '2023-2027', '2024-2028'];

const StudentManagement = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterDept, setFilterDept] = useState('all');
  const [filterYear, setFilterYear] = useState('all');
  const [filterSection, setFilterSection] = useState('all');
  const [filterBatch, setFilterBatch] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<any>(null);
  const [editFormLoading, setEditFormLoading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadLoading, setUploadLoading] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadLoading(true);
    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);
        
        if (data.length === 0) {
          toast.error('The excel file is empty');
          return;
        }

        const res = await studentApi.addBulk({ students: data });
        toast.success(res.data.message || 'Students imported successfully');
        fetchStudents();
      } catch (err: any) {
        toast.error(err.response?.data?.message || 'Failed to parse or upload Excel file');
      } finally {
        setUploadLoading(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };
    reader.readAsBinaryString(file);
  };

  const fetchStudents = async () => {
    try {
      const { data } = await studentApi.getAll();
      setStudents(data);
    } catch (err: any) {
      toast.error('Failed to fetch students');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleStatusUpdate = async (id: string, status: string) => {
    try {
      await studentApi.updateStatus(id, status);
      toast.success(`Student ${status} successfully`);
      fetchStudents();
    } catch (error: any) {
      toast.error(error.response?.data?.message || `Failed to mark student as ${status}`);
    }
  };

  const filtered = students.filter((s) => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) || 
                      s.email.toLowerCase().includes(search.toLowerCase()) ||
                      (s.rollNo && s.rollNo.toLowerCase().includes(search.toLowerCase()));
    const matchDept = filterDept === 'all' || s.department === filterDept;
    const matchYear = filterYear === 'all' || s.year === filterYear;
    const matchSection = filterSection === 'all' || s.section === filterSection;
    const matchBatch = filterBatch === 'all' || s.batch === filterBatch;
    const matchStatus = filterStatus === 'all' || (s.status || 'pending') === filterStatus;
    return matchSearch && matchDept && matchYear && matchSection && matchBatch && matchStatus;
  });

  const handleAdd = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormLoading(true);
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    try {
      await studentApi.add({ ...data, role: 'student' });
      toast.success('Student added successfully');
      setDialogOpen(false);
      fetchStudents();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to add student');
    } finally {
      setFormLoading(false);
    }
  };

  const handleEdit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingStudent) return;
    setEditFormLoading(true);
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    
    // Remove empty password so it isn't updated unless typed
    if (!data.password) {
      delete data.password;
    }

    try {
      const studentId = editingStudent._id || editingStudent.id;
      await studentApi.update(studentId, data);
      toast.success('Student updated successfully');
      setEditDialogOpen(false);
      fetchStudents();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update student');
    } finally {
      setEditFormLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this student? This action cannot be undone.')) return;
    try {
      await studentApi.delete(id);
      toast.success('Student deleted successfully');
      fetchStudents();
    } catch (err: any) {
      toast.error('Failed to delete student');
    }
  };

  const openEditDialog = (student: any) => {
    setEditingStudent(student);
    setEditDialogOpen(true);
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Student Directory</h1>
          <p className="text-muted-foreground">Manage student registrations and profile details</p>
        </div>
        {isAdmin && (
          <div className="flex gap-2 items-center">
            <input 
              type="file" 
              accept=".xlsx, .xls, .csv" 
              ref={fileInputRef} 
              className="hidden" 
              onChange={handleFileUpload} 
            />
            <Button variant="outline" onClick={() => fileInputRef.current?.click()} disabled={uploadLoading}>
              {uploadLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <FileSpreadsheet className="h-4 w-4 mr-2" />}
              Upload Excel
            </Button>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button><UserPlus className="h-4 w-4 mr-2" />Add Student</Button>
              </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Add New Student</DialogTitle></DialogHeader>
              <form onSubmit={handleAdd} className="space-y-4 mt-2">
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>Name</Label><Input name="name" required placeholder="Full name" className="mt-1" /></div>
                  <div><Label>College Email</Label><Input name="email" required type="email" placeholder="Email" className="mt-1" /></div>
                  <div><Label>Personal Email</Label><Input name="personalEmail" type="email" placeholder="Personal Email" className="mt-1" /></div>
                  <div><Label>Password</Label><Input name="password" required type="password" placeholder="Password" className="mt-1" /></div>
                  <div><Label>Roll No</Label><Input name="rollNo" required placeholder="21XX..." className="mt-1" /></div>
                  <div><Label>Phone</Label><Input name="phone" required placeholder="Phone number" className="mt-1" /></div>
                  <div>
                    <Label>Batch</Label>
                    <Select name="batch" required><SelectTrigger className="mt-1"><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>{batches.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Department</Label>
                    <Select name="department" required><SelectTrigger className="mt-1"><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>{departments.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Year</Label>
                    <Select name="year" required><SelectTrigger className="mt-1"><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>{years.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Section</Label>
                    <Select name="section" required><SelectTrigger className="mt-1"><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>{sections.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div><Label>Semester</Label><Input name="semester" required type="number" min="1" max="8" placeholder="1-8" className="mt-1" /></div>
                  {/* Academic & Placement */}
                  <div><Label>Attendance (%)</Label><Input name="attendance" type="number" min="0" max="100" defaultValue="0" className="mt-1" /></div>
                  <div><Label>CGPA</Label><Input name="cgpa" type="number" min="0" max="10" step="0.01" defaultValue="0" className="mt-1" /></div>
                  <div><Label>Backlogs</Label><Input name="backlogs" type="number" min="0" defaultValue="0" className="mt-1" /></div>
                  <div>
                    <Label>Placed Status</Label>
                    <Select name="placed" defaultValue="Pending"><SelectTrigger className="mt-1"><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent><SelectItem value="Pending">Pending</SelectItem><SelectItem value="Yes">Yes</SelectItem><SelectItem value="No">No</SelectItem></SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-2 sm:col-span-1"><Label>Companies Selected</Label><Input name="companiesSelected" type="number" min="0" defaultValue="0" className="mt-1" /></div>
                </div>
                <Button type="submit" className="w-full" disabled={formLoading}>
                  {formLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Add Student
                </Button>
              </form>
            </DialogContent>
          </Dialog>
          </div>
        )}

        {/* Edit Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent>
            <DialogHeader><DialogTitle>Edit Student</DialogTitle></DialogHeader>
            {editingStudent && (
              <form onSubmit={handleEdit} className="space-y-4 mt-2">
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>Name</Label><Input name="name" required placeholder="Full name" defaultValue={editingStudent.name} className="mt-1" /></div>
                  <div><Label>College Email</Label><Input name="email" required type="email" placeholder="Email" defaultValue={editingStudent.email} className="mt-1" /></div>
                  <div><Label>Personal Email</Label><Input name="personalEmail" type="email" placeholder="Personal Email" defaultValue={editingStudent.personalEmail || ''} className="mt-1" /></div>
                  <div><Label>Password (Leave blank to keep current)</Label><Input name="password" type="password" placeholder="New Password" className="mt-1" /></div>
                  <div><Label>Roll No</Label><Input name="rollNo" required placeholder="Roll Number" defaultValue={editingStudent.rollNo || ''} className="mt-1" /></div>
                  <div><Label>Phone</Label><Input name="phone" required placeholder="Phone number" defaultValue={editingStudent.phone || ''} className="mt-1" /></div>
                  <div>
                    <Label>Batch</Label>
                    <Select name="batch" defaultValue={editingStudent.batch} required><SelectTrigger className="mt-1"><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>{batches.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Department</Label>
                    <Select name="department" defaultValue={editingStudent.department} required><SelectTrigger className="mt-1"><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>{departments.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Year</Label>
                    <Select name="year" defaultValue={editingStudent.year} required><SelectTrigger className="mt-1"><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>{years.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Section</Label>
                    <Select name="section" defaultValue={editingStudent.section} required><SelectTrigger className="mt-1"><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>{sections.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div><Label>Semester</Label><Input name="semester" defaultValue={editingStudent.semester} required type="number" min="1" max="8" className="mt-1" /></div>
                  {/* Academic & Placement */}
                  <div><Label>Attendance (%)</Label><Input name="attendance" type="number" min="0" max="100" defaultValue={editingStudent.attendance || 0} className="mt-1" /></div>
                  <div><Label>CGPA</Label><Input name="cgpa" type="number" min="0" max="10" step="0.01" defaultValue={editingStudent.cgpa || 0} className="mt-1" /></div>
                  <div><Label>Backlogs</Label><Input name="backlogs" type="number" min="0" defaultValue={editingStudent.backlogs || 0} className="mt-1" /></div>
                  <div>
                    <Label>Placed Status</Label>
                    <Select name="placed" defaultValue={editingStudent.placed || "Pending"}><SelectTrigger className="mt-1"><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent><SelectItem value="Pending">Pending</SelectItem><SelectItem value="Yes">Yes</SelectItem><SelectItem value="No">No</SelectItem></SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-2 sm:col-span-1"><Label>Companies Selected</Label><Input name="companiesSelected" type="number" min="0" defaultValue={editingStudent.companiesSelected || 0} className="mt-1" /></div>
                </div>
                <Button type="submit" className="w-full" disabled={editFormLoading}>
                  {editFormLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Update Student
                </Button>
              </form>
            )}
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="glass-card rounded-lg p-4 mb-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search students by Name or Roll No..." className="pl-10" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <Select value={filterBatch} onValueChange={setFilterBatch}>
            <SelectTrigger className="w-full sm:w-44"><Filter className="h-4 w-4 mr-2" /><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="all">All Batches</SelectItem>{batches.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent>
          </Select>
          {isAdmin && (
            <Select value={filterDept} onValueChange={setFilterDept}>
              <SelectTrigger className="w-full sm:w-44"><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="all">All Departments</SelectItem>{departments.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
            </Select>
          )}
          <Select value={filterYear} onValueChange={setFilterYear}>
            <SelectTrigger className="w-full sm:w-32"><SelectValue placeholder="Year" /></SelectTrigger>
            <SelectContent><SelectItem value="all">All Years</SelectItem>{years.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}</SelectContent>
          </Select>
          <Select value={filterSection} onValueChange={setFilterSection}>
            <SelectTrigger className="w-full sm:w-32"><SelectValue placeholder="Sec" /></SelectTrigger>
            <SelectContent><SelectItem value="all">All Sections</SelectItem>{sections.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
          </Select>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-full sm:w-32"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="glass-card rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Roll No</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Course</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Status</TableHead>
              {isAdmin && <TableHead className="text-right">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((s) => (
              <TableRow key={s._id || s.id}>
                <TableCell className="font-bold text-primary">{s.rollNo || 'N/A'}</TableCell>
                <TableCell className="font-medium">
                  <div>{s.name}</div>
                  <div className="text-xs text-muted-foreground">{s.email}</div>
                </TableCell>
                <TableCell>
                  <div className="font-semibold text-sm">{s.department} · {s.year} Year</div>
                  <div className="text-xs text-muted-foreground">Sec: {s.section} | Batch: {s.batch}</div>
                </TableCell>
                <TableCell>
                  <div className="text-sm">{s.phone || 'N/A'}</div>
                  {s.personalEmail && <div className="text-xs text-muted-foreground line-clamp-1">{s.personalEmail}</div>}
                </TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${(s.status || 'pending') === 'approved' ? 'bg-green-100 text-green-700' : (s.status || 'pending') === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {(s.status || 'pending').toUpperCase()}
                  </span>
                </TableCell>
                {isAdmin && (
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {(s.status || 'pending') === 'pending' && (
                        <>
                          <Button variant="ghost" size="icon" className="text-green-500 hover:text-green-600 hover:bg-green-100/20" onClick={() => handleStatusUpdate(s._id || s.id, 'approved')}>
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600 hover:bg-red-100/20" onClick={() => handleStatusUpdate(s._id || s.id, 'rejected')}>
                            <X className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                      <Button variant="ghost" size="icon" onClick={() => openEditDialog(s)}>
                        <Pencil className="h-4 w-4 text-blue-500" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(s._id || s.id)} title="Delete Student">
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No students found</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default StudentManagement;
