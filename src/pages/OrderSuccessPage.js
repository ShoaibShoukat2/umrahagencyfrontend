import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';

const OrderSuccessPage = ({ navigate, orderData }) => {
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    // Trigger animation after mount
    setTimeout(() => setShowContent(true), 100);
  }, []);

  const handleGoHome = () => {
    navigate('landing');
  };

  const handleViewOrders = () => {
    navigate('portal');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
      <Navbar navigate={navigate} />
      
      <div className="max-w-2xl mx-auto px-4 py-20">
        <div className={`bg-white rounded-3xl shadow-2xl p-8 md:p-12 text-center transform transition-all duration-700 ${showContent ? 'scale-100 opacity-100' : 'scale-90 opacity-0'}`}>
          
          {/* Success Icon */}
          <div className="mb-6 animate-bounce">
            <div className="w-24 h-24 md:w-32 md:h-32 mx-auto bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-lg">
              <svg className="w-12 h-12 md:w-16 md:h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
          </div>

          {/* Success Message */}
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4 animate-slide-down">
            🎉 Order Successful!
          </h1>
          
          <p className="text-lg md:text-xl text-gray-600 mb-8 animate-fade-in">
            Thank you for your booking! Your order has been confirmed.
          </p>

          {/* Order Details */}
          {orderData && (
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 mb-8 animate-scale-in">
              <div className="space-y-3 text-left">
                {orderData.booking_number && (
                  <div className="flex justify-between items-center border-b border-purple-200 pb-2">
                    <span className="text-gray-600 font-medium">Booking Number:</span>
                    <span className="text-purple-700 font-bold text-lg">{orderData.booking_number}</span>
                  </div>
                )}
                {orderData.order_number && (
                  <div className="flex justify-between items-center border-b border-purple-200 pb-2">
                    <span className="text-gray-600 font-medium">Order Number:</span>
                    <span className="text-purple-700 font-bold text-lg">{orderData.order_number}</span>
                  </div>
                )}
                {orderData.total_amount && (
                  <div className="flex justify-between items-center border-b border-purple-200 pb-2">
                    <span className="text-gray-600 font-medium">Total Amount:</span>
                    <span className="text-green-600 font-bold text-lg">${parseFloat(orderData.total_amount).toFixed(2)}</span>
                  </div>
                )}
                {orderData.payment_method && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 font-medium">Payment Method:</span>
                    <span className="text-gray-800 font-semibold capitalize">{orderData.payment_method}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Info Message */}
          <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 mb-8 animate-fade-in">
            <p className="text-sm text-blue-800">
              📧 A confirmation email has been sent to your registered email address.
              <br />
              You can track your order status in the Customer Portal.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-4">
            <button
              onClick={handleGoHome}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-4 rounded-full font-bold text-lg hover:from-purple-600 hover:to-pink-600 transform hover:scale-105 transition-all shadow-lg flex items-center justify-center gap-3 group">
              <svg className="w-6 h-6 transform group-hover:-translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
              </svg>
              Back to Home
            </button>

            <button
              onClick={handleViewOrders}
              className="w-full border-2 border-purple-500 text-purple-600 py-4 rounded-full font-bold text-lg hover:bg-purple-50 transform hover:scale-105 transition-all flex items-center justify-center gap-3">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
              </svg>
              View My Orders
            </button>
          </div>

          {/* Decorative Elements */}
          <div className="mt-8 flex justify-center gap-2">
            <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-pink-400 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
          </div>
        </div>

        {/* Floating Confetti Effect */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `-20px`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${3 + Math.random() * 2}s`
              }}>
              <div className={`w-3 h-3 ${['bg-purple-400', 'bg-pink-400', 'bg-blue-400', 'bg-green-400', 'bg-yellow-400'][Math.floor(Math.random() * 5)]} rounded-full opacity-70`}></div>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0% {
            transform: translateY(-20px) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(360deg);
            opacity: 0;
          }
        }
        .animate-float {
          animation: float linear infinite;
        }
      `}</style>
    </div>
  );
};

export default OrderSuccessPage;
