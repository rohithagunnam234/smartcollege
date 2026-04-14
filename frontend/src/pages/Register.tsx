import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { GraduationCap, Loader2, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

const departments = ['CSE', 'ECE', 'ME', 'CE', 'EEE'];
const years = ['1', '2', '3', '4'];
const sections = ['A', 'B', 'C'];
const batches = ['2021-2025', '2022-2026', '2023-2027', '2024-2028'];

const Register = () => {
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState('student');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    try {
      await authApi.register({ ...data });
      toast.success(`${data.role === 'faculty' ? 'Faculty' : 'Student'} registration successful. Please wait for admin approval.`);
      navigate('/login');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to register. Please check your details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-slate-950 py-12 overflow-y-auto">
      {/* 🏙️ Full-Page Background (Local College Image) */}
      <div
        className="fixed inset-0 bg-cover bg-center bg-no-repeat transition-all duration-1000"
        style={{ backgroundImage: "url('/assets/college.jpg')", filter: "blur(3px)", transform: "scale(1.05)" }}
      >
        <div className="absolute inset-0 bg-slate-950/70" />
      </div>

      {/* 📝 Integrated Register Section */}
      <div className="relative z-10 w-full max-w-2xl px-6 py-10 animate-fade-in flex flex-col items-center">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="h-14 w-14 rounded-2xl bg-primary flex items-center justify-center shadow-xl shadow-primary/30 mb-4">
            <GraduationCap className="h-7 w-7 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight mb-1 uppercase">
            {role === 'faculty' ? 'Faculty Registration' : 'Student Registration'}
          </h1>
          <p className="text-xs text-white/50 font-bold uppercase tracking-[0.35em]">Account Request</p>
        </div>

        <form onSubmit={handleSubmit} className="w-full space-y-4 bg-white/5 p-6 sm:p-8 rounded-2xl border border-white/10 shadow-2xl backdrop-blur-md">
          <div className="space-y-1.5 mb-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-white/50 ml-1">I am a</Label>
            <Select name="role" defaultValue="student" onValueChange={setRole} required>
              <SelectTrigger className="h-11 rounded-xl bg-white/5 border-white/15 text-white focus-visible:ring-primary/40">
                <SelectValue placeholder="Select Role" />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 text-white border-white/10">
                <SelectItem value="student">Student</SelectItem>
                <SelectItem value="faculty">Faculty</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-[10px] font-black uppercase tracking-widest text-white/50 ml-1">Name</Label>
              <Input name="name" required placeholder="John Doe" className="h-11 rounded-xl bg-white/5 border-white/15 text-white placeholder:text-white/20 focus-visible:ring-primary/40 focus-visible:bg-white/10 transition-all border text-sm" />
            </div>
            
            <div className="space-y-1.5">
              <Label className="text-[10px] font-black uppercase tracking-widest text-white/50 ml-1">Official Email</Label>
              <Input name="email" required type="email" placeholder="name@college.edu" className="h-11 rounded-xl bg-white/5 border-white/15 text-white placeholder:text-white/20 focus-visible:ring-primary/40 focus-visible:bg-white/10 transition-all border text-sm" />
            </div>

            <div className="space-y-1.5">
              <Label className="text-[10px] font-black uppercase tracking-widest text-white/50 ml-1">Personal Email</Label>
              <Input name="personalEmail" type="email" required={role === 'student'} placeholder={role === 'student' ? "personal@gmail.com" : "Optional"} className="h-11 rounded-xl bg-white/5 border-white/15 text-white placeholder:text-white/20 focus-visible:ring-primary/40 focus-visible:bg-white/10 transition-all border text-sm" />
            </div>

            <div className="space-y-1.5">
              <Label className="text-[10px] font-black uppercase tracking-widest text-white/50 ml-1">Password</Label>
              <Input name="password" required type="password" placeholder="••••••••" className="h-11 rounded-xl bg-white/5 border-white/15 text-white placeholder:text-white/20 focus-visible:ring-primary/40 focus-visible:bg-white/10 transition-all border text-sm" />
            </div>

            {role === 'student' && (
              <div className="space-y-1.5">
                <Label className="text-[10px] font-black uppercase tracking-widest text-white/50 ml-1">Roll No</Label>
                <Input name="rollNo" required placeholder="Ex: 21CSE001" className="h-11 rounded-xl bg-white/5 border-white/15 text-white placeholder:text-white/20 focus-visible:ring-primary/40 focus-visible:bg-white/10 transition-all border text-sm" />
              </div>
            )}

            <div className="space-y-1.5">
              <Label className="text-[10px] font-black uppercase tracking-widest text-white/50 ml-1">Phone Number</Label>
              <Input name="phone" required placeholder="+1 234 567 890" className="h-11 rounded-xl bg-white/5 border-white/15 text-white placeholder:text-white/20 focus-visible:ring-primary/40 focus-visible:bg-white/10 transition-all border text-sm" />
            </div>

            {/* Selects */}
            {role === 'student' && (
              <div className="space-y-1.5 pt-1">
                <Label className="text-[10px] font-black uppercase tracking-widest text-white/50 ml-1">Batch</Label>
                <Select name="batch" required>
                  <SelectTrigger className="h-11 rounded-xl bg-white/5 border-white/15 text-white focus-visible:ring-primary/40">
                    <SelectValue placeholder="Select Batch" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 text-white border-white/10">
                    {batches.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-1.5 pt-1">
              <Label className="text-[10px] font-black uppercase tracking-widest text-white/50 ml-1">Dept</Label>
              <Select name="department" required>
                <SelectTrigger className="h-11 rounded-xl bg-white/5 border-white/15 text-white focus-visible:ring-primary/40">
                  <SelectValue placeholder="Select Dept" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 text-white border-white/10">
                  {departments.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            {role === 'student' && (
              <>
                <div className="space-y-1.5 pt-1">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-white/50 ml-1">Year</Label>
                  <Select name="year" required>
                    <SelectTrigger className="h-11 rounded-xl bg-white/5 border-white/15 text-white focus-visible:ring-primary/40">
                      <SelectValue placeholder="Select Year" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 text-white border-white/10">
                      {years.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5 pt-1">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-white/50 ml-1">Section</Label>
                  <Select name="section" required>
                    <SelectTrigger className="h-11 rounded-xl bg-white/5 border-white/15 text-white focus-visible:ring-primary/40">
                      <SelectValue placeholder="Select Sec" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 text-white border-white/10">
                      {sections.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5 pt-1">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-white/50 ml-1">Semester</Label>
                  <Select name="semester" required>
                    <SelectTrigger className="h-11 rounded-xl bg-white/5 border-white/15 text-white focus-visible:ring-primary/40">
                      <SelectValue placeholder="Select Sem" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 text-white border-white/10">
                      {['1', '2', '3', '4', '5', '6', '7', '8'].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}
          </div>

          <Button type="submit" className="w-full h-11 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-sm shadow-lg shadow-primary/20 transition-all active:scale-[0.98] mt-6" disabled={loading}>
            {loading ? (
              <div className="flex items-center gap-2"><Loader2 className="animate-spin h-4 w-4" /> Requesting Access...</div>
            ) : (
              <div className="flex items-center justify-center gap-2">Submit Request <CheckCircle2 className="h-4 w-4 opacity-60" /></div>
            )}
          </Button>
        </form>

        <div className="mt-8 text-center space-y-4">
          <p className="text-xs text-white/60">
            Already have an account?{' '}
            <Link to="/login" className="text-primary font-bold hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
