import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Send, Search, Loader2, Plus, Pencil, Trash, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { messageApi, studentApi } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

const AdminMessages = () => {
  const { user: adminUser } = useAuth();
  const [conversations, setConversations] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [reply, setReply] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [msgLoading, setMsgLoading] = useState(false);
  const [newChatDialogOpen, setNewChatDialogOpen] = useState(false);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);

  const fetchConversations = async (selectFirst = true) => {
    try {
      const { data } = await messageApi.getConversations();
      setConversations(data);
      if (selectFirst && data.length > 0 && !selectedConversation) {
        setSelectedConversation(data[0]);
      }
    } catch (err) {
      toast.error('Failed to fetch conversations');
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const { data } = await studentApi.getAll();
      setStudents(data);
    } catch (err) {
      console.error('Failed to fetch students');
    }
  };

  const fetchMessages = async (studentId: string) => {
    setMsgLoading(true);
    try {
      const { data } = await messageApi.getConversation(studentId);
      setMessages(data);
    } catch (err) {
      toast.error('Failed to fetch messages');
    } finally {
      setMsgLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations();
    fetchStudents();
  }, []);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation.id);
    }
  }, [selectedConversation]);

  const filtered = conversations.filter(c => 
    c.student?.name?.toLowerCase().includes(search.toLowerCase()) || 
    c.student?.rollNo?.toLowerCase().includes(search.toLowerCase())
  );

  const handleSendOrEdit = async () => {
    if (!reply.trim() || !selectedConversation) return;
    try {
      if (editingMessageId) {
        await messageApi.edit(editingMessageId, { message: reply });
        toast.success('Message updated');
        setEditingMessageId(null);
      } else {
        await messageApi.reply({
          studentId: selectedConversation.id,
          message: reply
        });
      }
      setReply('');
      fetchMessages(selectedConversation.id);
      fetchConversations(false); // Refresh last message in sidebar
    } catch (err) {
      toast.error(editingMessageId ? 'Failed to update reply' : 'Failed to send reply');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this message?')) return;
    try {
      await messageApi.delete(id);
      toast.success('Message deleted');
      if (selectedConversation) {
        fetchMessages(selectedConversation.id);
        fetchConversations(false);
      }
    } catch (err) {
      toast.error('Failed to delete message');
    }
  };

  const startEdit = (msg: any) => {
    setEditingMessageId(msg._id);
    setReply(msg.message);
  };

  const cancelEdit = () => {
    setEditingMessageId(null);
    setReply('');
  };

  const startNewChat = async (studentId: string) => {
    const student = students.find(s => s._id === studentId);
    if (!student) return;

    // Check if conversation already exists
    const existing = conversations.find(c => c.id === studentId);
    if (existing) {
       setSelectedConversation(existing);
    } else {
       // Create a temporary conversation object to select it
       setSelectedConversation({
          id: studentId,
          student: student,
          lastMessage: '',
          time: null
       });
       setMessages([]);
    }
    setNewChatDialogOpen(false);
  };

  const isMyMessage = (m: any) => {
     return m.senderId?._id === adminUser?.id || m.senderId === adminUser?.id;
  };

  if (loading) return <div className="flex items-center justify-center h-screen"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>;

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Messages</h1>
          <p className="text-muted-foreground">Student communications</p>
        </div>
        <Dialog open={newChatDialogOpen} onOpenChange={setNewChatDialogOpen}>
          <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-2" />New Chat</Button></DialogTrigger>
          <DialogContent>
             <DialogHeader><DialogTitle>Start New Conversation</DialogTitle></DialogHeader>
             <div className="space-y-4 pt-4">
                <Label>Select Student</Label>
                <Select onValueChange={startNewChat}>
                   <SelectTrigger><SelectValue placeholder="Choose a student by Roll No" /></SelectTrigger>
                   <SelectContent>
                      {students.map(s => <SelectItem key={s._id} value={s._id}>{s.rollNo} - {s.name}</SelectItem>)}
                   </SelectContent>
                </Select>
             </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="glass-card rounded-xl overflow-hidden shadow-xl flex h-[calc(100vh-220px)] border-0">
        {/* Sidebar */}
        <div className="w-80 border-r flex flex-col shrink-0 bg-muted/10">
          <div className="p-4 border-b">
            <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Search students..." className="pl-10 rounded-lg" value={search} onChange={e => setSearch(e.target.value)} /></div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {filtered.map(c => (
              <button key={c.id} onClick={() => setSelectedConversation(c)} className={cn('w-full text-left p-4 border-b hover:bg-muted/50 transition-all border-l-4 border-l-transparent', selectedConversation?.id === c.id && 'bg-muted/50 border-l-primary')}>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary shrink-0">{c.student?.name?.charAt(0)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-0.5">
                      <p className="text-sm font-semibold truncate">{c.student?.name}</p>
                      {c.time && <span className="text-[10px] text-muted-foreground">{new Date(c.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{c.lastMessage || 'No messages yet'}</p>
                    <p className="text-[10px] text-primary mt-0.5 font-medium">{c.student?.rollNo}</p>
                  </div>
                </div>
              </button>
            ))}
            {filtered.length === 0 && <div className="p-8 text-center text-sm text-muted-foreground">No conversations found.<br/>Click "New Chat" to start one.</div>}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col bg-card">
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b flex items-center justify-between bg-muted/30">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">{selectedConversation.student?.name?.charAt(0)}</div>
                  <div>
                    <p className="font-semibold text-sm">{selectedConversation.student?.name}</p>
                    <p className="text-xs text-muted-foreground font-medium">{selectedConversation.student?.rollNo} · {selectedConversation.student?.department}</p>
                  </div>
                </div>
              </div>

              {/* Message List */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {msgLoading ? (
                  <div className="flex justify-center p-12"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>
                ) : messages.map((m: any) => {
                  const isMe = isMyMessage(m);
                  return (
                  <div key={m._id} className={cn('flex group items-center gap-2', isMe ? 'justify-end flex-row-reverse' : 'justify-start')}>
                    <div className={cn('max-w-[75%] rounded-2xl px-4 py-2.5 shadow-sm transition-all', isMe ? 'bg-primary text-primary-foreground rounded-tr-none' : 'bg-muted rounded-tl-none border-0')}>
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{m.message}</p>
                      <p className={cn('text-[10px] mt-1 text-right', isMe ? 'text-primary-foreground/60' : 'text-muted-foreground')}>
                         {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    {isMe && (
                       <div className="opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-1">
                          <button onClick={() => startEdit(m)} className="h-6 w-6 rounded-full bg-muted flex items-center justify-center text-blue-500 hover:bg-blue-500/10"><Pencil className="h-3 w-3" /></button>
                          <button onClick={() => handleDelete(m._id)} className="h-6 w-6 rounded-full bg-muted flex items-center justify-center text-red-500 hover:bg-red-500/10"><Trash className="h-3 w-3" /></button>
                       </div>
                    )}
                  </div>
                )})}
                {messages.length === 0 && !msgLoading && (
                   <div className="flex flex-col items-center justify-center h-full text-muted-foreground opacity-60">
                      <Send className="h-12 w-12 mb-2 stroke-1" />
                      <p>Send a message to start the conversation.</p>
                   </div>
                )}
              </div>

              {/* Edit Indicator */}
              {editingMessageId && (
                 <div className="bg-primary/5 px-4 py-2 flex justify-between items-center text-xs font-semibold border-t">
                    <span className="text-primary flex items-center gap-2"><Pencil className="h-3 w-3"/> Editing message...</span>
                    <button onClick={cancelEdit} className="text-muted-foreground hover:text-foreground"><X className="h-4 w-4"/></button>
                 </div>
              )}

              {/* Reply Input */}
              <div className="p-4 border-t bg-muted/20">
                <div className="flex gap-2 items-end max-w-4xl mx-auto">
                  <Textarea 
                    placeholder="Type your reply here..." 
                    className="min-h-[44px] max-h-48 resize-none rounded-xl bg-card shadow-sm border-0 focus-visible:ring-1" 
                    value={reply} 
                    onChange={e => setReply(e.target.value)} 
                    onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendOrEdit(); } }} 
                    rows={1} 
                  />
                  <Button 
                    onClick={handleSendOrEdit} 
                    size="icon" 
                    className="shrink-0 h-11 w-11 rounded-xl shadow-lg transition-all active:scale-95"
                    disabled={!reply.trim()}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-8 text-center bg-muted/5">
              <div className="bg-primary/5 p-6 rounded-full mb-4"><MessageSquareIcon className="h-12 w-12 text-primary/40" /></div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Your Conversations</h3>
              <p className="max-w-xs mb-6">Select a student from the list or start a new chat to begin communicating.</p>
              <Button onClick={() => setNewChatDialogOpen(true)} variant="outline" className="rounded-full px-6">Start New Chat</Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const MessageSquareIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
);

export default AdminMessages;
