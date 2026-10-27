import React, { useState, useRef, useEffect } from 'react';
import Markdown from 'react-markdown';
import {
  Bot,
  Send,
  X,
  Sparkles,
  Maximize2,
  Minimize2,
  Trash2,
  Copy,
  Check,
  HelpCircle,
  BookOpen,
  GraduationCap,
  MessageCircle,
  ChevronDown,
  Loader2,
  Zap,
} from 'lucide-react';
import { UserProfile } from '../types.ts';

interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
  modelUsed?: string;
}

interface Props {
  user: UserProfile;
  currentView: string;
}

const STARTER_SUGGESTIONS = [
  '📐 How to find turning points in Calculus?',
  "⚡ State & explain Faraday's Law of Induction",
  '🧪 How to calculate moles in neutralization?',
  '📖 Analyze the Honia river in The River Between',
  '🎟️ How do I book a lesson with MTN/Airtel?',
  '🎓 How do I verify my Student ID Card?',
];

export const GemmaHelperBot: React.FC<Props> = ({ user, currentView }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome-1',
      role: 'model',
      text: `Hello **${user.fullName.split(' ')[0]}**! 👋 I am your **Gemma Helper Bot**, powered by Google's Gemma model architecture.\n\nI am here across all pages of Edura High to help you with:\n- 📝 **Homework & Exam Questions** (Math, Physics, Chemistry, Biology, Literature & more)\n- 🔍 **Step-by-step Formulas & UNEB/Cambridge marking guides**\n- 💡 **Help using the platform** (booking tutors, classes, notes)\n\nWhat can I assist you with today?`,
      timestamp: 'Just now',
      modelUsed: 'Gemma 4',
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen, messages]);

  const handleSendMessage = async (customText?: string) => {
    const textToSend = customText || inputMessage;
    if (!textToSend.trim() || isLoading) return;

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      role: 'user',
      text: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!customText) setInputMessage('');
    setIsLoading(true);

    try {
      // Exclude static greetings from history payload so the first turn sent to API is always user-initiated
      const historyPayload = messages
        .filter((m) => m.id !== 'welcome-1' && !m.id.startsWith('reset-'))
        .map((m) => ({
          role: m.role,
          text: m.text,
        }));

      const res = await fetch('/api/helper-bot/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          history: historyPayload,
          studentSector: user.sector,
          gradeLevel: user.gradeLevel,
          schoolName: user.schoolName,
          currentView,
        }),
      });

      const data = await res.json();

      const botMsg: Message = {
        id: `b-${Date.now()}`,
        role: 'model',
        text: data.reply || "I'm ready to help! Could you please ask that again?",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        modelUsed: data.modelUsed ? data.modelUsed.replace('models/', '') : 'Gemma 4',
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.error('Helper bot chat error:', err);
      const errorMsg: Message = {
        id: `err-${Date.now()}`,
        role: 'model',
        text: "I am having temporary trouble connecting to the network. You can also explore the verified notes in the **Scholar Library** tab anytime!",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        modelUsed: 'Gemma Offline',
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyText = (text: string, id: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const handleClearHistory = () => {
    setMessages([
      {
        id: `reset-${Date.now()}`,
        role: 'model',
        text: "Chat cleared! Ask me anything about your subjects, lessons, or platform features.",
        timestamp: 'Just now',
        modelUsed: 'Gemma 4',
      },
    ]);
  };

  return (
    <>
      {/* Floating Trigger Button (Visible across all web pages) */}
      <div className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-40 flex flex-col items-end">
        {!isOpen && (
          <div className="mb-2 hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-slate-900/90 backdrop-blur-md text-white rounded-full text-xs font-semibold shadow-lg animate-bounce border border-slate-700/60">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Need help? Ask Gemma Bot</span>
          </div>
        )}

        <button
          onClick={() => setIsOpen((prev) => !prev)}
          className={`relative group flex items-center justify-center p-3.5 sm:p-4 rounded-2xl shadow-xl transition-all duration-300 cursor-pointer ${
            isOpen
              ? 'bg-slate-800 text-white rotate-90 scale-95'
              : 'bg-gradient-to-tr from-violet-600 via-indigo-600 to-blue-600 text-white hover:scale-105 hover:shadow-indigo-500/30'
          }`}
          title="Open Gemma Helper Bot"
          aria-label="Open Gemma Helper Bot"
        >
          {isOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <>
              <Bot className="w-6 h-6 animate-pulse" />
              <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-cyan-500"></span>
              </span>
            </>
          )}
        </button>
      </div>

      {/* Floating Chat Drawer / Window */}
      {isOpen && (
        <div
          className={`fixed z-50 transition-all duration-300 flex flex-col bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden ${
            isExpanded
              ? 'inset-3 sm:inset-6 md:inset-x-24 md:inset-y-10'
              : 'bottom-24 sm:bottom-20 right-3 sm:right-6 w-[calc(100vw-1.5rem)] sm:w-[420px] h-[550px] max-h-[80vh]'
          }`}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-violet-700 via-indigo-700 to-blue-700 p-4 text-white flex items-center justify-between shrink-0 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-inner">
                <Bot className="w-5 h-5 text-cyan-300" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm tracking-tight">Gemma Helper Bot</h3>
                  <span className="px-1.5 py-0.5 rounded-full text-[9px] font-extrabold bg-cyan-400 text-slate-950 uppercase tracking-wide flex items-center gap-0.5">
                    <Zap className="w-2.5 h-2.5 fill-current" /> Gemma
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-violet-100">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse" />
                  <span>Student Q&A Assistant • Active</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleClearHistory}
                className="p-1.5 rounded-xl hover:bg-white/15 text-violet-200 hover:text-white transition-colors cursor-pointer"
                title="Clear Conversation"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsExpanded((prev) => !prev)}
                className="p-1.5 rounded-xl hover:bg-white/15 text-violet-200 hover:text-white transition-colors hidden sm:block cursor-pointer"
                title={isExpanded ? 'Collapse' : 'Expand'}
              >
                {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-xl hover:bg-white/15 text-violet-200 hover:text-white transition-colors cursor-pointer"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Context Strip */}
          <div className="bg-violet-50/80 px-4 py-2 border-b border-violet-100/80 flex items-center justify-between text-[11px] text-violet-900 shrink-0">
            <span className="truncate">
              Student: <strong>{user.fullName}</strong> ({user.gradeLevel || 'Secondary'})
            </span>
            <span className="px-2 py-0.5 bg-violet-100 rounded-md font-semibold text-[10px] shrink-0 text-violet-800">
              Page: {currentView}
            </span>
          </div>

          {/* Chat Messages Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
            {messages.map((m) => {
              const isUser = m.role === 'user';
              return (
                <div
                  key={m.id}
                  className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} animate-in fade-in duration-200`}
                >
                  <div
                    className={`max-w-[88%] rounded-2xl p-3.5 text-xs shadow-xs leading-relaxed ${
                      isUser
                        ? 'bg-blue-600 text-white rounded-tr-none'
                        : 'bg-white text-slate-800 border border-slate-200/80 rounded-tl-none'
                    }`}
                  >
                    {!isUser && (
                      <div className="flex items-center justify-between gap-2 pb-1.5 mb-1.5 border-b border-slate-100 text-[10px] text-slate-500 font-semibold">
                        <span className="flex items-center gap-1 text-violet-700 font-bold">
                          <Bot className="w-3 h-3 text-violet-600" />
                          {m.modelUsed || 'Gemma'}
                        </span>
                        <button
                          onClick={() => handleCopyText(m.text, m.id)}
                          className="hover:text-slate-800 flex items-center gap-1 cursor-pointer"
                          title="Copy Answer"
                        >
                          {copiedId === m.id ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-600" />
                              <span className="text-emerald-600">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}

                    {isUser ? (
                      <div className="whitespace-pre-wrap font-sans">
                        {m.text}
                      </div>
                    ) : (
                      <div className="prose prose-slate prose-xs max-w-none text-xs leading-relaxed text-slate-800 space-y-1.5 [&>p]:mb-2 [&>ul]:list-disc [&>ul]:pl-4 [&>ol]:list-decimal [&>ol]:pl-4 [&>h3]:font-bold [&>h3]:text-violet-900 [&>h3]:text-xs [&>h3]:mt-2 [&>h3]:mb-1 [&>h4]:font-bold [&>h4]:text-slate-900 [&>h4]:mt-2 [&>blockquote]:border-l-2 [&>blockquote]:border-violet-400 [&>blockquote]:pl-2 [&>blockquote]:italic">
                        <Markdown>{m.text}</Markdown>
                      </div>
                    )}

                    <div
                      className={`text-[9px] mt-1.5 text-right ${
                        isUser ? 'text-blue-100' : 'text-slate-500'
                      }`}
                    >
                      {m.timestamp}
                    </div>
                  </div>
                </div>
              );
            })}

            {isLoading && (
              <div className="flex items-start gap-2">
                <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-none p-3 shadow-xs flex items-center gap-2 text-xs text-slate-500">
                  <Loader2 className="w-4 h-4 text-violet-600 animate-spin" />
                  <span>Gemma is preparing your solution...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Starter Suggestions */}
          {messages.length <= 3 && !isLoading && (
            <div className="p-2.5 bg-white border-t border-slate-100 overflow-x-auto scrollbar-none flex gap-1.5 shrink-0">
              {STARTER_SUGGESTIONS.map((suggestion, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(suggestion)}
                  className="text-[11px] whitespace-nowrap px-2.5 py-1 bg-slate-100 hover:bg-violet-50 hover:text-violet-700 text-slate-700 rounded-full border border-slate-200 transition-colors shrink-0 cursor-pointer"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}

          {/* Input Box */}
          <div className="p-3 bg-white border-t border-slate-200 shrink-0">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <input
                ref={inputRef}
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Ask Gemma a homework or platform question..."
                disabled={isLoading}
                className="flex-1 px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:bg-white transition-all"
              />
              <button
                type="submit"
                disabled={!inputMessage.trim() || isLoading}
                className="p-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 disabled:opacity-40 text-white shadow-xs transition-all cursor-pointer flex items-center justify-center shrink-0"
                title="Send Message"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
