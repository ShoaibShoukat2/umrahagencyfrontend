import React, { useState, useRef, useEffect } from 'react';
import { api } from '../api';

const QUICK_PROMPTS = [
  'Show Umrah packages',
  'What are your prices?',
  'How do I book?',
  'Contact details',
];

function AIChatBot({ hidden = false }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      type: 'bot',
      text: 'Assalamu Alaikum! 👋 Welcome to TM Fouzy Travel & Tours. I can help you with:\n\n• Package information\n• Booking inquiries\n• Pricing details\n• Travel dates\n• Contact information\n\nHow can I assist you today?',
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const getAIResponse = async (userMessage) => {
    try {
      const data = await api.sendChatMessage(userMessage);
      return data.response || 'Sorry, I could not generate a response. Please try again.';
    } catch (error) {
      console.error('Error getting AI response:', error);
      return (
        "I apologize, I'm having trouble right now. Please contact us directly:\n\n" +
        '📞 +65 6294 8044\n📧 enquiry@tmfouzy.sg\n💬 WhatsApp: +65 9820 1134'
      );
    }
  };

  const sendMessage = async (text) => {
    const userMessage = (text || '').trim();
    if (!userMessage || isTyping) return;

    setMessages((prev) => [...prev, { type: 'user', text: userMessage }]);
    setInput('');
    setIsTyping(true);

    try {
      const response = await getAIResponse(userMessage);
      setMessages((prev) => [...prev, { type: 'bot', text: response }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          type: 'bot',
          text: 'Sorry, I encountered an error. Please try again or contact us directly.',
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSend = () => sendMessage(input);

  if (hidden) return null;

  return (
    <div>
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 relative bg-gradient-to-r from-green-600 to-green-700 text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-all animate-pulse"
          aria-label="Open AI Chat Assistant"
        >
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
            />
          </svg>
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-bounce font-bold">
            AI
          </span>
        </button>
      )}

      {isOpen && (
        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-[420px] h-[min(600px,calc(100vh-2rem))] bg-white rounded-2xl shadow-2xl flex flex-col border-2 border-green-200">
          <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-4 rounded-t-2xl flex justify-between items-center flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="relative">
                <span className="text-3xl">🤖</span>
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-white" />
              </div>
              <div>
                <h3 className="font-bold text-lg">TM Fouzy AI Assistant</h3>
                <p className="text-xs opacity-90 flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  Online & Ready to Help
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-all"
              aria-label="Close chat"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-gray-50 to-white">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[85%] rounded-2xl p-3 shadow-md ${
                    msg.type === 'user'
                      ? 'bg-gradient-to-r from-green-500 to-green-600 text-white'
                      : 'bg-white text-gray-800 border border-gray-200'
                  }`}
                >
                  <p className="text-sm whitespace-pre-line leading-relaxed">{msg.text}</p>
                </div>
              </div>
            ))}

            {messages.length === 1 && !isTyping && (
              <div className="flex flex-wrap gap-2">
                {QUICK_PROMPTS.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => sendMessage(prompt)}
                    className="text-xs bg-green-50 hover:bg-green-100 text-green-800 border border-green-200 px-3 py-1.5 rounded-full transition-all"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            )}

            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white text-gray-800 rounded-2xl p-3 shadow-md border border-gray-200">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-bounce" />
                    <span
                      className="w-2 h-2 bg-green-500 rounded-full animate-bounce"
                      style={{ animationDelay: '0.2s' }}
                    />
                    <span
                      className="w-2 h-2 bg-green-500 rounded-full animate-bounce"
                      style={{ animationDelay: '0.4s' }}
                    />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 border-t bg-gray-50 flex-shrink-0">
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                placeholder="Ask me anything..."
                className="flex-1 border-2 border-gray-300 rounded-full px-4 py-3 focus:outline-none focus:border-green-500 transition-all"
                disabled={isTyping}
              />
              <button
                type="button"
                onClick={handleSend}
                disabled={isTyping || !input.trim()}
                className="bg-gradient-to-r from-green-500 to-green-600 text-white p-3 rounded-full hover:from-green-600 hover:to-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
                aria-label="Send message"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                  />
                </svg>
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">
              Powered by AI • Real-time package data
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default AIChatBot;
