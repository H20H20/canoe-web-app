import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Send, Paperclip } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

interface Message {
  id: string;
  sender_id?: string;
  content?: string;
  message?: string;
  text?: string;
  created_at?: string;
  message_type?: string;
  metadata?: { timestamp?: string };
}

export default function Chat() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const contactName = (location.state as any)?.name || 'Chat';
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval>>(undefined);

  const fetchMessages = (chatId: string) => {
    api.get(`/chat/${chatId}/messages`)
      .then((r) => api.parseResponse<{ data?: any }>(r))
      .then((result) => {
        const raw = result.data;
        const list = Array.isArray(raw) ? raw : (raw?.messages || []);
        setMessages(list);
      })
      .catch(() => {});
  };

  useEffect(() => {
    if (!id) return;
    fetchMessages(id);
    pollRef.current = setInterval(() => fetchMessages(id), 3000);
    return () => clearInterval(pollRef.current);
  }, [id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const handleSend = async () => {
    const content = text.trim();
    if (!content || sending) return;
    setSending(true);
    setText('');
    try {
      await api.parseResponse(await api.post(`/chat/${id}/messages`, { content, message_type: 'text' }));
      if (id) fetchMessages(id);
    } catch { }
    setSending(false);
  };

  const formatTime = (msg: Message) => {
    const ts = msg.metadata?.timestamp || msg.created_at;
    if (!ts) return '';
    return new Date(ts).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  return (
    <div className="max-w-3xl mx-auto flex flex-col h-[calc(100vh-7rem)]">
      {/* Header */}
      <div className="bg-white rounded-t-xl border-b border-gray-200 px-4 py-3 flex items-center gap-3 shrink-0">
        <button onClick={() => navigate('/chats')} className="text-gray-400 hover:text-primary">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="w-9 h-9 rounded-full bg-primary-light text-primary flex items-center justify-center font-semibold">{contactName[0]}</div>
        <div>
          <p className="font-semibold text-gray-900 text-sm">{contactName}</p>
          <p className="text-xs text-gray-400">online</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto bg-gray-50 px-4 py-4 space-y-2">
        {messages.map((msg) => {
          const isMe = msg.sender_id === user?.user_id;
          const content = msg.content || msg.message || msg.text || '';
          return (
            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[70%] rounded-2xl px-4 py-2 ${isMe ? 'bg-primary text-white rounded-br-md' : 'bg-white text-gray-900 shadow-sm rounded-bl-md'}`}>
                <p className="text-sm whitespace-pre-wrap">{content}</p>
                <p className={`text-[10px] mt-1 ${isMe ? 'text-white/60' : 'text-gray-400'} text-right`}>{formatTime(msg)}</p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="bg-white border-t border-gray-200 px-4 py-3 flex items-center gap-3 shrink-0 rounded-b-xl">
        <button className="text-gray-400 hover:text-primary"><Paperclip className="w-5 h-5" /></button>
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Type a message..."
          className="flex-1 bg-surface rounded-full px-4 py-2 text-sm outline-none"
        />
        <button onClick={handleSend} disabled={!text.trim() || sending} className="w-9 h-9 bg-primary text-white rounded-full flex items-center justify-center hover:bg-primary-dark transition disabled:opacity-40">
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
