import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { documentApi } from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import { FileText, ExternalLink, Loader2, Info } from 'lucide-react';
import { toast } from 'sonner';

const StudentDocuments = () => {
  const { user } = useAuth();
  const [docs, setDocs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMyDocs = async () => {
    try {
      const studentId = user?._id || user?.id;
      const { data } = await documentApi.getMy(studentId);
      setDocs(data);
    } catch (err) {
      toast.error('Failed to fetch documents');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyDocs();
  }, [user]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">My Documents</h1>
        <p className="text-muted-foreground">View documents uploaded by administration</p>
      </div>

      <div className="glass-card rounded-xl p-4 mb-6 flex items-center gap-3 border-primary/20 bg-primary/5 shadow-sm">
        <Info className="h-5 w-5 text-primary shrink-0" />
        <p className="text-sm text-primary/80 font-medium">All academic and personal documents are managed and uploaded by the college administration.</p>
      </div>

      <div className="glass-card rounded-xl p-6 shadow-lg border-0 bg-card min-h-[400px]">
        <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          Verified Documents
        </h3>
        
        {loading ? (
          <div className="flex items-center justify-center py-20"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {docs.map(d => (
              <div key={d._id} className="flex items-center justify-between p-4 rounded-xl border bg-muted/20 hover:bg-muted/40 transition-all group">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-bold capitalize">{d.documentType.replace('_', ' ')}</p>
                    <p className="text-[10px] text-muted-foreground">Uploaded: {new Date(d.uploadedAt || d.createdAt).toLocaleDateString()}</p>
                    <div className="mt-1">
                       <Badge variant={d.status === 'Verified' ? 'default' : d.status === 'Rejected' ? 'destructive' : 'secondary'} className="text-[10px] h-5 px-1.5 uppercase">
                          {d.status}
                       </Badge>
                    </div>
                  </div>
                </div>
                <a 
                  href={d.fileUrl} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="h-10 w-10 rounded-lg flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all shadow-sm border border-primary/10"
                  title="View PDF"
                >
                  <ExternalLink className="h-5 w-5" />
                </a>
              </div>
            ))}
            {docs.length === 0 && (
              <div className="col-span-full flex flex-col items-center justify-center py-20 text-muted-foreground opacity-60">
                <FileText className="h-16 w-16 mb-4 stroke-1" />
                <p className="font-medium text-lg">No documents available yet</p>
                <p className="text-sm">Contact administration if your documents are missing.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDocuments;
