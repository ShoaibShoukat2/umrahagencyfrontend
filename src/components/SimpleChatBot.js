import React, { useState } from 'react';

function SimpleChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { type: 'bot', text: 'Hello! 👋 Welcome to Umrah Agency. How can I help you today?' }
  ]);
  const [input, setInput] = useState('');

  const responses = {
    'hello': 'Hello! How can I assist you with your Umrah or Hajj booking?',
    'hi': 'Hi there! Welcome to Umrah Agency. What would you like to know?',
    'package': 'We offer Umrah, Hajj, Ziarah, and Holiday packages. Prices start from $1800. Would you like more details?',
    'price': 'Our packages start from $1800/person. Prices vary by room type and season. Contact us for exact pricing!',
    'book': 'To book: Browse packages → Select package → Choose room → Fill details → Make payment. Need help?',
    'contact': 'Contact us:\n📧 info@umrahagency.com\n📞 +65 1234 5678\n💬 WhatsApp: +65 9876 5432',
    'default': 'Thank you for your message! For detailed assistance, please contact us at +65 1234 5678 or info@umrahagency.com'
  };

  const handleSend = () => {
    if (!input.trim()) return;
    
    setMessages([...messages, { type: 'user', text: input }]);
    
    setTimeout(() => {
      const lowerInput = input.toLowerCase();
      let response = responses.default;
      
      for (let key in responses) {
        if (lowerInput.includes(key)) {
          response = responses[key];
          break;
        }
      }
      
      setMessages(prev => [...prev, { type: 'bot', text: response }]);
    }, 500);
    
    setInput('');
  };

  return (
    <div>
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-green-500 to-green-600 text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-all animate-bounce">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path>
          </svg>
        </button>
      )}

      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-96 max-w-[calc(100vw-3rem)] h-[500px] bg-white rounded-2xl shadow-2xl flex flex-col">
          <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-4 rounded-t-2xl flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🤖</span>
              <div>
                <h3 className="font-bold">Umrah Assistant</h3>
                <p className="text-xs opacity-90">Online</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:bg-white hover:bg-opacity-20 rounded-full p-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-2xl p-3 ${
                  msg.type === 'user' 
                    ? 'bg-green-500 text-white' 
                    : 'bg-white text-gray-800 shadow'
                }`}>
                  <p className="text-sm whitespace-pre-line">{msg.text}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 border-t">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Type your message..."
                className="flex-1 border rounded-full px-4 py-2 focus:outline-none focus:border-green-500"
              />
              <button
                onClick={handleSend}
                className="bg-green-500 text-white p-2 rounded-full hover:bg-green-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SimpleChatBot;
