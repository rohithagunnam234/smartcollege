import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Loader2, Pencil, Trash, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { messageApi } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

const StudentMessages = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<any[]>([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);

  const fetchMessages = async () => {
    if (!user?._id && !user?.id) return;
    try {
      const studentId = user._id || user.id;
      const { data } = await messageApi.getConversation(studentId);
      setMessages(data);
    } catch (err) {
      toast.error('Failed to fetch messages');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [user]);

  const handleSendOrEdit = async () => {
    if (!message.trim()) return;
    try {
      if (editingMessageId) {
        await messageApi.edit(editingMessageId, { message });
        toast.success('Message updated');
        setEditingMessageId(null);
      } else {
        await messageApi.send({ message });
      }
      setMessage('');
      fetchMessages();
    } catch (err) {
      toast.error(editingMessageId ? 'Failed to update message' : 'Failed to send message');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this message?')) return;
    try {
      await messageApi.delete(id);
      toast.success('Message deleted');
      fetchMessages();
    } catch (err) {
      toast.error('Failed to delete message');
    }
  };

  const startEdit = (msg: any) => {
    setEditingMessageId(msg._id);
    setMessage(msg.message);
  };
  
  const cancelEdit = () => {
    setEditingMessageId(null);
    setMessage('');
  };

  const isMyMessage = (m: any) => {
     return m.senderId?._id === user?.id || m.senderId === user?.id || m.senderId?._id === user?._id || m.senderId === user?._id;
  };

  return (
    <div>
      <div className="mb-6"><h1 className="text-2xl font-bold">Messages</h1><p className="text-muted-foreground">Chat with admin</p></div>

      <div className="glass-card rounded-lg overflow-hidden flex flex-col h-[calc(100vh-220px)] shadow-lg border-0">
        <div className="p-4 border-b flex items-center gap-3 bg-muted/20">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">A</div>
          <div><p className="font-medium text-sm">Admin Office</p><p className="text-xs text-muted-foreground">Ask anything about fees or documents</p></div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/5">
          {loading ? (
             <div className="flex justify-center p-8"><Loader2 className="animate-spin h-6 w-6 text-primary" /></div>
          ) : messages.map(m => {
             const isMe = isMyMessage(m);
             return (
              <div key={m._id} className={cn('flex group items-center gap-2', isMe ? 'justify-end flex-row-reverse' : 'justify-start')}>
                <div className={cn('max-w-[80%] rounded-2xl px-4 py-2.5 shadow-sm relative', isMe ? 'bg-primary text-primary-foreground rounded-tr-none' : 'bg-card border rounded-tl-none')}>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{m.message}</p>
                  <p className={cn('text-[10px] mt-1 text-right', isMe ? 'text-primary-foreground/60' : 'text-muted-foreground')}>{new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
                {isMe && (
                   <div className="opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-1">
                      <button onClick={() => startEdit(m)} className="h-6 w-6 rounded-full bg-muted flex items-center justify-center text-blue-500 hover:bg-blue-500/10"><Pencil className="h-3 w-3" /></button>
                      <button onClick={() => handleDelete(m._id)} className="h-6 w-6 rounded-full bg-muted flex items-center justify-center text-red-500 hover:bg-red-500/10"><Trash className="h-3 w-3" /></button>
                   </div>
                )}
              </div>
             );
          })}
          {!loading && messages.length === 0 && (
             <div className="text-center py-12 text-muted-foreground">No messages yet. Start a conversation!</div>
          )}
        </div>

        {editingMessageId && (
           <div className="bg-primary/5 px-4 py-2 flex justify-between items-center text-xs font-semibold border-t">
              <span className="text-primary flex items-center gap-2"><Pencil className="h-3 w-3"/> Editing message...</span>
              <button onClick={cancelEdit} className="text-muted-foreground hover:text-foreground"><X className="h-4 w-4"/></button>
           </div>
        )}
        <div className="p-4 border-t flex gap-2 bg-card">
          <Textarea 
            placeholder="Type your message here..." 
            className="min-h-[44px] max-h-32 resize-none rounded-xl bg-muted/50 border-0 focus-visible:ring-1" 
            value={message} 
            onChange={e => setMessage(e.target.value)} 
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendOrEdit(); } }} 
            rows={1} 
          />
          <Button onClick={handleSendOrEdit} size="icon" className="shrink-0 rounded-xl h-11 w-11 transition-transform active:scale-95"><Send className="h-4 w-4" /></Button>
        </div>
      </div>
    </div>
  );
};

export default StudentMessages;
