import React, { useState, useEffect } from 'react';
import {
  Send,
  Lock,
  Paperclip,
  ShieldCheck,
  CheckCheck,
  Sparkles,
  User,
  Image,
  FileText,
  Clock,
  PhoneCall,
} from 'lucide-react';
import { ChatMessage, Tutor, UserProfile } from '../types.ts';

interface Props {
  user: UserProfile;
  initialTutor?: Tutor | null;
}

const SAMPLE_CHATS = [
  {
    id: 1,
    name: 'Dr. Mark Kigozi',
    subject: 'Physics & Pure Mathematics',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    online: true,
    school: "King's College Budo",
  },
  {
    id: 2,
    name: 'Sarah Namubiru',
    subject: 'Organic Chemistry & Biochemistry',
    avatar: 'https://images.unsplash.com/photo-1580894732444-8ecded7900cd?w=150',
    online: true,
    school: "Mt. St. Mary's College Namagunga",
  },
  {
    id: 3,
    name: 'David Ochieng',
    subject: 'Computer Science & ICT',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    online: false,
    school: "St. Mary's College Kisubi",
  },
];

export const MessagingPortal: React.FC<Props> = ({ user, initialTutor }) => {
  const [selectedContact, setSelectedContact] = useState<any>(
    initialTutor
      ? {
          id: initialTutor.id,
          name: initialTutor.fullName,
          subject: initialTutor.subjects,
          avatar: initialTutor.avatar,
          online: true,
          school: initialTutor.schoolName,
        }
      : SAMPLE_CHATS[0]
  );

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);
  const [attachedDoc, setAttachedDoc] = useState<string | null>(null);

  useEffect(() => {
    if (initialTutor) {
      setSelectedContact({
        id: initialTutor.id,
        name: initialTutor.fullName,
        subject: initialTutor.subjects,
        avatar: initialTutor.avatar,
        online: true,
        school: initialTutor.schoolName,
      });
    }
  }, [initialTutor]);

  useEffect(() => {
    fetchMessages();
  }, [selectedContact]);

  const fetchMessages = async () => {
    try {
      const res = await fetch(`/api/messages/${user.id}/${selectedContact.id}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const contentType = res.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        throw new Error('Non-JSON response');
      }
      const data = await res.json();
      if (Array.isArray(data)) {
        setMessages(data);
      } else {
        setMessages([]);
      }
    } catch (e: any) {
      console.warn('Network sync notice in MessagingPortal:', e?.message || e);
      setMessages((prev) => (Array.isArray(prev) ? prev : []));
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() && !attachedDoc) return;

    setSending(true);
    try {
      const content = attachedDoc
        ? `${inputText.trim()} [Shared Document: ${attachedDoc}]`
        : inputText.trim();

      const res = await fetch('/api/messages/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderId: user.id,
          receiverId: selectedContact.id,
          senderName: user.fullName,
          content,
          isEncrypted: true,
          attachmentUrl: attachedDoc ? '/docs/homework_sample.pdf' : null,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send message');

      setMessages((prev) => [...prev, data]);
      setInputText('');
      setAttachedDoc(null);
    } catch (err: any) {
      alert(err.message || 'Send error');
    } finally {
      setSending(false);
    }
  };

  const handleQuickPrompt = (prompt: string) => {
    setInputText(prompt);
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden h-[75vh] flex flex-col md:flex-row">
      {/* Contact List Sidebar */}
      <div className="w-full md:w-72 lg:w-80 border-b md:border-b-0 md:border-r border-slate-200 flex flex-col bg-slate-50/50">
        <div className="p-4 border-b border-slate-200 bg-white">
          <h3 className="font-bold text-sm text-slate-900">Direct Messages</h3>
          <p className="text-[11px] text-slate-500">End-to-End Encrypted Tutors & Peers</p>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {SAMPLE_CHATS.map((contact) => (
            <button
              key={contact.id}
              onClick={() => setSelectedContact(contact)}
              className={`w-full p-3 rounded-2xl text-left flex items-center gap-3 transition-all ${
                selectedContact.id === contact.id
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'hover:bg-slate-100 text-slate-800'
              }`}
            >
              <div className="relative">
                <img
                  src={contact.avatar}
                  alt={contact.name}
                  className="w-10 h-10 rounded-xl object-cover"
                />
                {contact.online && (
                  <span
                    className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full ring-2 ${
                      selectedContact.id === contact.id ? 'ring-blue-600 bg-emerald-400' : 'ring-white bg-emerald-500'
                    }`}
                  />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-xs truncate">{contact.name}</h4>
                  <span
                    className={`text-[9px] ${
                      selectedContact.id === contact.id ? 'text-blue-200' : 'text-slate-400'
                    }`}
                  >
                    Active
                  </span>
                </div>
                <p
                  className={`text-[10px] truncate ${
                    selectedContact.id === contact.id ? 'text-blue-100' : 'text-slate-500'
                  }`}
                >
                  {contact.subject}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Chat Canvas */}
      <div className="flex-1 flex flex-col min-w-0 bg-white">
        {/* Chat Header */}
        <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between bg-white">
          <div className="flex items-center gap-3">
            <img
              src={selectedContact.avatar}
              alt={selectedContact.name}
              className="w-9 h-9 rounded-xl object-cover"
            />
            <div>
              <h4 className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                <span>{selectedContact.name}</span>
                <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-md">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  E2EE
                </span>
              </h4>
              <p className="text-[10px] text-slate-500">{selectedContact.school}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="hidden sm:inline-flex items-center gap-1 text-[10px] text-slate-400 font-mono">
              <Lock className="w-3 h-3 text-emerald-600" />
              <span>AES-256 Protocol</span>
            </span>
          </div>
        </div>

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/40">
          {!Array.isArray(messages) || messages.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">
              <Lock className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="font-semibold text-slate-700">Encrypted Conversation Channel</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Messages and shared homework materials are end-to-end encrypted.
              </p>
            </div>
          ) : (
            (Array.isArray(messages) ? messages : []).map((msg) => {
              const isMine = msg.senderId === user.id;
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-md p-3.5 rounded-2xl text-xs space-y-1 shadow-xs ${
                      isMine
                        ? 'bg-blue-600 text-white rounded-br-xs'
                        : 'bg-white border border-slate-200 text-slate-800 rounded-bl-xs'
                    }`}
                  >
                    {!isMine && (
                      <span className="text-[10px] font-bold text-blue-600 block">
                        {msg.senderName}
                      </span>
                    )}
                    <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>

                    {msg.attachmentUrl && (
                      <div
                        className={`mt-2 p-2 rounded-xl flex items-center gap-2 text-[11px] ${
                          isMine ? 'bg-blue-700 text-blue-100' : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        <FileText className="w-4 h-4 shrink-0" />
                        <span className="truncate">Encrypted_Study_Sheet.pdf</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-1 px-1">
                    <span>
                      {new Date(msg.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                    {isMine && <CheckCheck className="w-3 h-3 text-blue-500" />}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Quick Question Chips */}
        <div className="px-4 py-2 bg-slate-50 border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto scrollbar-none text-[10px]">
          <span className="text-slate-400 font-semibold whitespace-nowrap">Quick prompts:</span>
          <button
            onClick={() => handleQuickPrompt('Could you please review question 4 of the past paper?')}
            className="px-2.5 py-1 bg-white border border-slate-200 hover:border-blue-300 text-slate-600 rounded-lg whitespace-nowrap transition-colors"
          >
            Review Q4 Past Paper
          </button>
          <button
            onClick={() => handleQuickPrompt('Are you available for a 30-min masterclass drill?')}
            className="px-2.5 py-1 bg-white border border-slate-200 hover:border-blue-300 text-slate-600 rounded-lg whitespace-nowrap transition-colors"
          >
            Book 30m Drill
          </button>
          <button
            onClick={() => handleQuickPrompt('Here is my solved homework worksheet attached.')}
            className="px-2.5 py-1 bg-white border border-slate-200 hover:border-blue-300 text-slate-600 rounded-lg whitespace-nowrap transition-colors"
          >
            Submit Homework Notes
          </button>
        </div>

        {/* Message Input Box */}
        <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              const name = attachedDoc ? null : 'Past_Paper_Solution.pdf';
              setAttachedDoc(name);
            }}
            className={`p-2.5 rounded-xl transition-colors ${
              attachedDoc ? 'bg-blue-100 text-blue-700' : 'text-slate-400 hover:bg-slate-100'
            }`}
            title="Attach Document or Photo"
          >
            <Paperclip className="w-4 h-4" />
          </button>

          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={attachedDoc ? `Attached: ${attachedDoc} — Add caption...` : `Message ${selectedContact.name}...`}
            className="flex-1 px-3.5 py-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
          />

          <button
            type="submit"
            disabled={sending}
            className="p-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-xs transition-colors disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
