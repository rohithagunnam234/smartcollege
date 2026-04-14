import { ReactNode, useState, useMemo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  LayoutDashboard, Users, DollarSign, FileCheck, Bell, MessageSquare,
  LogOut, Menu, X, GraduationCap, Upload, ChevronRight, BookOpen, Briefcase
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItem {
  label: string;
  path: string;
  icon: React.ElementType;
}

const adminNav: NavItem[] = [
  { label: 'Dashboard', path: '/admin', icon: LayoutDashboard },
  { label: 'Students', path: '/admin/students', icon: Users },
  { label: 'Faculty', path: '/admin/faculty', icon: Users },
  { label: 'Academic', path: '/admin/academic', icon: BookOpen },
  { label: 'Placement', path: '/admin/placement', icon: Briefcase },
  { label: 'Fees', path: '/admin/fees', icon: DollarSign },
  { label: 'Documents', path: '/admin/documents', icon: FileCheck },
  { label: 'Notices', path: '/admin/notices', icon: Bell },
  { label: 'Messages', path: '/admin/messages', icon: MessageSquare },
];

const studentNav: NavItem[] = [
  { label: 'Dashboard', path: '/student', icon: LayoutDashboard },
  { label: 'Academic', path: '/student/academic', icon: BookOpen },
  { label: 'Placement', path: '/student/placement', icon: Briefcase },
  { label: 'My Fees', path: '/student/fees', icon: DollarSign },
  { label: 'Documents', path: '/student/documents', icon: Upload },
  { label: 'Notices', path: '/student/notices', icon: Bell },
  { label: 'Messages', path: '/student/messages', icon: MessageSquare },
];

const DashboardLayout = ({ children }: { children: ReactNode }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const nav = useMemo(() => {
    if (user?.role === 'admin') return adminNav;
    if (user?.role === 'faculty') {
      return adminNav.filter(item => !['Fees', 'Documents'].includes(item.label));
    }
    return studentNav;
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={cn(
        'fixed lg:sticky top-0 left-0 z-50 h-screen w-64 bg-sidebar flex flex-col transition-transform duration-300',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      )}>
        <div className="p-5 flex items-center gap-3 border-b border-sidebar-border">
          <div className="h-9 w-9 rounded-lg bg-sidebar-primary flex items-center justify-center">
            <GraduationCap className="h-5 w-5 text-sidebar-primary-foreground" />
          </div>
          <div>
            <h1 className="font-bold text-sidebar-foreground text-sm">Smart College</h1>
            <p className="text-xs text-sidebar-muted capitalize">{user?.role} Panel</p>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden ml-auto text-sidebar-muted hover:text-sidebar-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {nav.map((item) => {
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                  active
                    ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-md shadow-sidebar-primary/25'
                    : 'text-sidebar-muted hover:text-sidebar-foreground hover:bg-sidebar-accent'
                )}
              >
                <item.icon className="h-4.5 w-4.5" />
                <span>{item.label}</span>
                {active && <ChevronRight className="h-4 w-4 ml-auto" />}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-sidebar-border">
          <div className="flex items-center gap-3 px-3 py-2 mb-2">
            <div className="h-8 w-8 rounded-full bg-sidebar-accent flex items-center justify-center text-xs font-bold text-sidebar-foreground">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sidebar-foreground truncate">{user?.name}</p>
              <p className="text-xs text-sidebar-muted truncate">{user?.rollNo || user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-sidebar-muted hover:text-destructive hover:bg-sidebar-accent transition-colors"
          >
            <LogOut className="h-4 w-4" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 min-w-0">
        <header className="sticky top-0 z-30 h-14 bg-card/80 backdrop-blur-md border-b flex items-center px-4 lg:px-6">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden mr-3 text-muted-foreground hover:text-foreground">
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex-1" />
        </header>
        <div className="p-4 lg:p-6 max-w-7xl mx-auto animate-fade-in">
          {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
