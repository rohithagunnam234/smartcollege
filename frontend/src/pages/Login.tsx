import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { authApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { GraduationCap, Loader2, Mail, Lock, CheckCircle2, User, Shield, Users } from 'lucide-react';
import { toast } from 'sonner';

/**
 * 🎓 Smart College Login Portal
 * Integrated design with local university photography.
 */
const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [loginType, setLoginType] = useState<'student' | 'admin' | 'faculty'>('student');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await authApi.login({ email, password });
      
      if (data.user.role !== loginType && !(loginType === 'admin' && data.user.role === 'faculty')) {
        toast.error(`Invalid portal. Please use the correct login tab.`);
        setLoading(false);
        return;
      }

      login(data.user, data.token);
      navigate(['admin', 'faculty'].includes(data.user.role) ? '/admin' : '/student');
      toast.success('Access Granted. Welcome!');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-slate-950">
      {/* 🏙️ Full-Page Background (Local College Image) */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-1000"
        style={{ backgroundImage: "url('/assets/college.jpg')", filter: "blur(3px)", transform: "scale(1.05)" }}
      >
        {/* Overlay to maintain contrast */}
        <div className="absolute inset-0 bg-slate-950/50" />
      </div>

      {/* 🔐 Integrated Login Section */}
      <div className="relative z-10 w-full max-w-lg px-8 py-12 animate-fade-in flex flex-col items-center">

        <div className="mb-8 flex flex-col items-center text-center">
          <div className="h-14 w-14 rounded-2xl bg-primary flex items-center justify-center shadow-xl shadow-primary/30 mb-4">
            <GraduationCap className="h-7 w-7 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight mb-1">SMART COLLEGE</h1>
          <p className="text-xs text-white/50 font-bold uppercase tracking-[0.35em]">
            {loginType === 'admin' ? 'Administration Portal' : 'Student Portal'}
          </p>
        </div>

        <div className="w-full flex bg-white/5 rounded-xl p-1 border border-white/10 mb-8">
          <button
            type="button"
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-bold rounded-lg transition-all ${loginType === 'student' ? 'bg-primary text-white shadow-md' : 'text-white/50 hover:text-white/80'}`}
            onClick={() => setLoginType('student')}
          >
            <User className="h-4 w-4" /> Student
          </button>
          <button
            type="button"
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-bold rounded-lg transition-all ${loginType !== 'student' ? 'bg-primary text-white shadow-md' : 'text-white/50 hover:text-white/80'}`}
            onClick={() => setLoginType('admin')}
          >
            <Shield className="h-4 w-4" /> Admin/Faculty
          </button>
        </div>

        <form onSubmit={handleSubmit} className="w-full space-y-5">
          <div className="space-y-1.5">
            <Label className="text-[10px] font-black uppercase tracking-widest text-white/50 ml-1">Official Email</Label>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30 transition-colors group-focus-within:text-primary" />
              <Input
                type="email"
                placeholder="name@college.com"
                required
                className="h-11 rounded-xl bg-white/5 border-white/15 text-white placeholder:text-white/20 pl-11 focus-visible:ring-primary/40 focus-visible:bg-white/10 transition-all border text-sm"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-[10px] font-black uppercase tracking-widest text-white/50 ml-1">Access Key</Label>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30 transition-colors group-focus-within:text-primary" />
              <Input
                type="password"
                placeholder="••••••••"
                required
                className="h-11 rounded-xl bg-white/5 border-white/15 text-white placeholder:text-white/20 pl-11 focus-visible:ring-primary/40 focus-visible:bg-white/10 transition-all border text-sm"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>
          </div>

          <Button type="submit" className="w-full h-11 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-sm shadow-lg shadow-primary/20 transition-all active:scale-[0.98] mt-2" disabled={loading}>
            {loading ? (
              <div className="flex items-center gap-2"><Loader2 className="animate-spin h-4 w-4" /> Signing in...</div>
            ) : (
              <div className="flex items-center justify-center gap-2">Sign In <CheckCircle2 className="h-4 w-4 opacity-60" /></div>
            )}
          </Button>
        </form>

          <div className="mt-8 text-center space-y-4 animate-fade-in">
            <p className="text-xs text-white/60">
              Need access?{' '}
              <Link to="/register" className="text-primary font-bold hover:underline">
                Request Approval
              </Link>
            </p>
          </div>
        
        <div className={`text-center ${loginType === 'admin' ? 'mt-8' : 'mt-4'} transition-all`}>
          <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.4em]">© 2003 Administrative Center</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
