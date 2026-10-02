import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Send, MessageSquare, ShieldCheck, Sparkles } from 'lucide-react';
import useAuthStore from '../store/authStore';
import api, { getAccessToken } from '../api/axiosConfig';
import io from 'socket.io-client';

export default function Chat() {
  const { applicationId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [socket, setSocket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [connected, setConnected] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // 1. Fetch initial message history
    const fetchMessages = async () => {
      try {
        const res = await api.get(`/messages/${applicationId}`);
        setMessages(res.data.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load chat');
      } finally {
        setLoading(false);
      }
    };
    fetchMessages();

    // 2. Setup Socket.io
    const token = getAccessToken();
    const socketUrl =
      import.meta.env.VITE_SOCKET_URL ||
      (import.meta.env.DEV ? 'http://localhost:5000' : undefined);
    const newSocket = io(socketUrl, {
      auth: { token },
    });

    newSocket.on('connect', () => {
      setConnected(true);
      newSocket.emit('join_match', applicationId);
    });

    newSocket.on('disconnect', () => {
      setConnected(false);
    });

    newSocket.on('receive_message', (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    newSocket.on('error', (errMsg) => {
      setError(errMsg);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [applicationId]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !socket) return;

    socket.emit('send_message', { applicationId, content: newMessage });
    setNewMessage('');
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6 mt-8">
        <div className="glass-dark rounded-2xl border border-white/10 p-12 text-center">
          <div className="w-10 h-10 border-2 border-[#d4af37] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-zinc-400 font-mono text-sm">
            Connecting to secure messaging channel...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6 mt-8">
        <div className="glass-dark rounded-2xl border border-rose-500/30 p-8 text-center">
          <p className="text-rose-400 text-sm mb-4">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-xs hover:bg-white/10 transition-colors inline-flex items-center gap-2"
          >
            <ArrowLeft size={14} /> Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 mt-4 h-[84vh] flex flex-col">
      {/* Header */}
      <div className="glass-dark rounded-t-2xl border border-white/10 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
            title="Go back"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display font-semibold text-lg text-white">
                Direct Production Chat
              </h1>
              <span className="flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/5 text-zinc-400 border border-white/10">
                <ShieldCheck size={11} className="text-[#d4af37]" /> Encrypted
              </span>
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span
                className={`w-2 h-2 rounded-full ${connected ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]' : 'bg-amber-400 animate-pulse'}`}
              />
              <span className="text-[11px] text-zinc-400 font-mono">
                {connected ? 'Real-time connected' : 'Reconnecting...'}
              </span>
            </div>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs text-zinc-500 font-mono">
          <Sparkles size={13} className="text-[#d4af37]" />
          <span>Talent Direct Connect</span>
        </div>
      </div>

      {/* Messages Canvas */}
      <div className="flex-1 bg-[#0d0e12]/80 backdrop-blur-md p-6 overflow-y-auto border-x border-white/5">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center text-zinc-500">
            <div className="w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-3">
              <MessageSquare size={24} className="text-[#d4af37]/70" />
            </div>
            <p className="text-sm font-medium text-white">Direct Line Initialized</p>
            <p className="text-xs text-zinc-400 max-w-xs mt-1">
              Say hello or discuss casting call dates, creative vision, and logistics.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg, i) => {
              const senderId = msg.senderId?._id || msg.senderId;
              const isMe = senderId === user.id;
              return (
                <motion.div
                  key={msg._id || `${senderId}-${msg.createdAt || i}`}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[75%] sm:max-w-[65%] rounded-2xl px-4 py-3 shadow-lg ${
                      isMe
                        ? 'bg-gradient-to-r from-[#d4af37] via-amber-400 to-[#d4af37] text-zinc-950 font-normal rounded-br-sm shadow-[0_4px_16px_rgba(212,175,55,0.2)]'
                        : 'glass-dark border border-white/10 text-zinc-100 rounded-bl-sm'
                    }`}
                  >
                    <p className="text-sm leading-relaxed select-text">{msg.content}</p>
                    <span
                      className={`text-[10px] font-mono mt-1.5 block text-right ${
                        isMe ? 'text-zinc-900/70 font-medium' : 'text-zinc-500'
                      }`}
                    >
                      {msg.createdAt
                        ? new Date(msg.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : ''}
                    </span>
                  </div>
                </motion.div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Dock */}
      <div className="glass-dark rounded-b-2xl border border-white/10 p-4">
        <form onSubmit={handleSend} className="flex items-center gap-3">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37] transition-all"
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || !connected}
            className="btn-gold px-5 py-3 rounded-xl flex items-center gap-2 text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            <span className="hidden sm:inline">Send</span>
            <Send size={15} />
          </button>
        </form>
      </div>
    </div>
  );
}
