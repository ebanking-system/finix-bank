import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import {
  FiMessageSquare,
  FiX,
  FiSend,
  FiRefreshCw,
  FiCpu,
  FiUser,
  FiCheckCircle,
  FiBookOpen,
  FiZap,
  FiMaximize2,
  FiMinimize2,
} from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';

// Default FinixBot backend service URL (FastAPI running on port 8000)
const FINIXBOT_API_URL = import.meta.env.VITE_FINIXBOT_URL || 'http://localhost:8000';

const quickTopics = [
  'What are the loan interest rates?',
  'Check my loan status',
  'How do I complete KYC?',
  'What is Fixed Deposit interest?',
  'Check my account balance',
  'How to transfer money?',
];

const FinixBotWidget = () => {
  const { token, user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 'welcome-1',
      sender: 'bot',
      text: `Hello ${user?.firstName || 'Valued Customer'}! 👋 I'm **FinixBot**, your 24/7 AI Banking Assistant. How can I help you today?`,
      citations: [],
      source: 'system',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (textToSend) => {
    const query = textToSend || inputValue;
    if (!query.trim() || loading) return;

    const userMsg = {
      id: Date.now().toString(),
      sender: 'user',
      text: query.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputValue('');
    setLoading(true);

    try {
      const conversation_history = messages
        .filter((m) => m.source !== 'system')
        .slice(-6)
        .map((m) => ({
          role: m.sender === 'user' ? 'user' : 'assistant',
          content: m.text,
        }));

      const response = await axios.post(`${FINIXBOT_API_URL}/chat`, {
        query: query.trim(),
        jwt: token || localStorage.getItem('jwt') || null,
        conversation_history,
      });

      const data = response.data;
      const botMsg = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: data.answer || "I'm not sure about that. Please rephrase or contact support.",
        citations: data.citations || [],
        source: data.source || 'faq',
        execution_time_sec: data.execution_time_sec,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (error) {
      console.error('FinixBot chat error:', error);
      const detail = error.response?.data?.detail || error.response?.data?.message;
      const errorMsg = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: detail
          ? `FinixBot error: ${detail}`
          : "I'm having trouble connecting to FinixBot AI service right now. Please ensure `finixbot-service` is running on port 8000.",
        citations: [],
        source: 'error',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: Date.now().toString(),
        sender: 'bot',
        text: `Chat reset. How else can I assist you today?`,
        citations: [],
        source: 'system',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="relative group bg-gradient-to-r from-navy-900 to-navy-800 text-white p-4 rounded-full shadow-2xl hover:scale-105 transition-all duration-300 flex items-center justify-center border border-navy-700/80 cursor-pointer"
          title="Open FinixBot Assistant"
        >
          <div className="w-7 h-7 flex items-center justify-center">
            <FiCpu className="w-7 h-7 text-coral-400 group-hover:rotate-12 transition-transform duration-300" />
          </div>
          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white animate-pulse" />
        </button>
      )}

      {/* Chat Window Panel */}
      {isOpen && (
        <div
          className={`bg-white rounded-3xl shadow-2xl border border-slate-200/90 flex flex-col transition-all duration-300 overflow-hidden ${
            isExpanded
              ? 'w-[90vw] sm:w-[600px] h-[85vh] max-h-[750px]'
              : 'w-[92vw] sm:w-[410px] h-[560px]'
          }`}
        >
          {/* Header Bar */}
          <div className="bg-gradient-to-r from-navy-900 via-navy-800 to-slate-900 text-white p-4 sm:p-5 flex items-center justify-between border-b border-navy-700/80">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-coral-500/20 border border-coral-400/40 flex items-center justify-center text-coral-400 font-bold shadow-xs">
                <FiCpu className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-sm tracking-wide">FINIXBOT AI</h3>
                  <span className="bg-emerald-500/20 text-emerald-300 text-[10px] px-2 py-0.5 rounded-full font-semibold border border-emerald-500/40 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" /> Online
                  </span>
                </div>
                <p className="text-[11px] text-slate-300">RAG AI Assistant • Instant Banking Help</p>
              </div>
            </div>

            <div className="flex items-center gap-1 text-slate-300">
              <button
                onClick={handleClearChat}
                className="p-2 hover:text-white hover:bg-navy-800 rounded-xl transition-colors cursor-pointer"
                title="Clear Chat"
              >
                <FiRefreshCw className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-2 hover:text-white hover:bg-navy-800 rounded-xl transition-colors cursor-pointer hidden sm:block"
                title={isExpanded ? 'Compress Window' : 'Expand Window'}
              >
                {isExpanded ? <FiMinimize2 className="w-4 h-4" /> : <FiMaximize2 className="w-4 h-4" />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:text-white hover:bg-navy-800 rounded-xl transition-colors cursor-pointer"
                title="Close Chat"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Quick Trending Topics */}
          <div className="p-3 bg-slate-50 border-b border-slate-200/80 overflow-x-auto whitespace-nowrap scrollbar-none flex gap-2">
            {quickTopics.map((topic, i) => (
              <button
                key={i}
                onClick={() => handleSendMessage(topic)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold bg-white border border-slate-200 text-slate-700 hover:border-coral-500 hover:text-coral-600 transition-all cursor-pointer shadow-2xs shrink-0"
              >
                <FiZap className="w-3 h-3 text-amber-500" /> {topic}
              </button>
            ))}
          </div>

          {/* Messages Body */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50/50 text-xs">
            {messages.map((msg) => {
              const isUser = msg.sender === 'user';
              return (
                <div
                  key={msg.id}
                  className={`flex items-start gap-2.5 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  <div
                    className={`w-8 h-8 rounded-2xl flex items-center justify-center shrink-0 shadow-2xs text-xs ${
                      isUser
                        ? 'bg-coral-500 text-white'
                        : 'bg-navy-900 text-coral-400 border border-navy-700'
                    }`}
                  >
                    {isUser ? <FiUser className="w-4 h-4" /> : <FiCpu className="w-4 h-4" />}
                  </div>

                  <div className={`max-w-[82%] space-y-1.5 ${isUser ? 'items-end' : 'items-start'}`}>
                    <div
                      className={`p-3.5 rounded-2xl text-xs leading-relaxed shadow-2xs ${
                        isUser
                          ? 'bg-navy-900 text-white rounded-tr-xs font-medium'
                          : 'bg-white border border-slate-200/90 text-slate-800 rounded-tl-xs'
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{msg.text}</p>

                      {/* Source Citation Badge */}
                      {msg.source && msg.source !== 'system' && msg.source !== 'error' && (
                        <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center gap-2 flex-wrap text-[10px]">
                          {msg.source === 'live_api' ? (
                            <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-md font-bold border border-emerald-200">
                              <FiCheckCircle className="w-3 h-3 text-emerald-600" /> Source: Live Account Data
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 bg-sky-50 text-sky-700 px-2 py-0.5 rounded-md font-bold border border-sky-200">
                              <FiBookOpen className="w-3 h-3 text-sky-600" /> Source: Finix FAQ
                            </span>
                          )}

                          {msg.citations && msg.citations.length > 0 && (
                            <span className="text-slate-400">
                              Docs: {msg.citations.join(', ')}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    <span className="text-[10px] text-slate-400 block px-1">
                      {msg.timestamp}
                    </span>
                  </div>
                </div>
              );
            })}

            {loading && (
              <div className="flex items-start gap-2.5">
                <div className="w-8 h-8 rounded-2xl bg-navy-900 text-coral-400 flex items-center justify-center shrink-0 border border-navy-700">
                  <FiCpu className="w-4 h-4 animate-bounce" />
                </div>
                <div className="p-3.5 bg-white border border-slate-200/90 rounded-2xl rounded-tl-xs shadow-2xs text-slate-500 text-xs flex items-center gap-2">
                  <span className="w-2 h-2 bg-coral-500 rounded-full animate-ping" />
                  Thinking and searching Finix knowledge base...
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Footer */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 bg-white border-t border-slate-200 flex items-center gap-2"
          >
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask FinixBot a question..."
              className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-coral-500 focus:bg-white transition-all font-medium"
            />
            <button
              type="submit"
              disabled={loading || !inputValue.trim()}
              className="p-3 bg-coral-500 hover:bg-coral-600 disabled:opacity-50 text-white rounded-2xl transition-all cursor-pointer shadow-xs flex items-center justify-center shrink-0"
              title="Send Message"
            >
              <FiSend className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default FinixBotWidget;
