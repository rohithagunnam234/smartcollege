import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as ToasterSonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import DashboardLayout from "@/components/DashboardLayout";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import StudentManagement from "@/pages/admin/StudentManagement";
import FacultyManagement from "@/pages/admin/FacultyManagement";
import FeeManagement from "@/pages/admin/FeeManagement";
import DocumentVerification from "@/pages/admin/DocumentVerification";
import NoticeManagement from "@/pages/admin/NoticeManagement";
import AdminMessages from "@/pages/admin/AdminMessages";
import StudentDashboard from "@/pages/student/StudentDashboard";
import StudentFees from "@/pages/student/StudentFees";
import StudentDocuments from "@/pages/student/StudentDocuments";
import StudentNotices from "@/pages/student/StudentNotices";
import StudentMessages from "@/pages/student/StudentMessages";
import AcademicModule from "@/pages/AcademicModule";
import PlacementModule from "@/pages/PlacementModule";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const AdminRoute = ({ children }: { children: React.ReactNode }) => (
  <ProtectedRoute allowedRoles={['admin', 'faculty']}>
    <DashboardLayout>{children}</DashboardLayout>
  </ProtectedRoute>
);

const StudentRoute = ({ children }: { children: React.ReactNode }) => (
  <ProtectedRoute allowedRoles={['student']}>
    <DashboardLayout>{children}</DashboardLayout>
  </ProtectedRoute>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <ToasterSonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Admin / Faculty */}
            <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
            <Route path="/admin/students" element={<AdminRoute><StudentManagement /></AdminRoute>} />
            <Route path="/admin/faculty" element={<AdminRoute><FacultyManagement /></AdminRoute>} />
            <Route path="/admin/academic" element={<AdminRoute><AcademicModule /></AdminRoute>} />
            <Route path="/admin/placement" element={<AdminRoute><PlacementModule /></AdminRoute>} />
            <Route path="/admin/fees" element={<AdminRoute><FeeManagement /></AdminRoute>} />
            <Route path="/admin/documents" element={<AdminRoute><DocumentVerification /></AdminRoute>} />
            <Route path="/admin/notices" element={<AdminRoute><NoticeManagement /></AdminRoute>} />
            <Route path="/admin/messages" element={<AdminRoute><AdminMessages /></AdminRoute>} />

            {/* Student */}
            <Route path="/student" element={<StudentRoute><StudentDashboard /></StudentRoute>} />
            <Route path="/student/academic" element={<StudentRoute><AcademicModule /></StudentRoute>} />
            <Route path="/student/placement" element={<StudentRoute><PlacementModule /></StudentRoute>} />
            <Route path="/student/fees" element={<StudentRoute><StudentFees /></StudentRoute>} />
            <Route path="/student/documents" element={<StudentRoute><StudentDocuments /></StudentRoute>} />
            <Route path="/student/notices" element={<StudentRoute><StudentNotices /></StudentRoute>} />
            <Route path="/student/messages" element={<StudentRoute><StudentMessages /></StudentRoute>} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
