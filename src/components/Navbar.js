import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';

const Navbar = ({ navigate }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [user, setUser] = useState(null);
  const { getCartCount } = useCart();
  const cartCount = getCartCount();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    
    // Check for logged in user
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    setIsSidebarOpen(false);
    navigate('landing');
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white shadow-lg py-3' : 'bg-transparent py-4'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <button 
              onClick={() => navigate('landing')} 
              className="flex items-center group">
              <img 
                src="/logo.jpeg" 
                alt="Umrah Agency" 
                className="h-14 w-auto md:h-16 lg:h-20 object-contain transform group-hover:scale-105 transition-transform"
              />
            </button>
            
            {/* Right Side - Login/Register & Burger Menu */}
            <div className="flex items-center gap-3">
              {/* Cart Button */}
              <button 
                onClick={() => navigate('cart')} 
                className={`relative p-2 transition-all ${
                  isScrolled ? 'text-gray-700 hover:text-green-600' : 'text-white hover:text-green-300'
                }`}>
                <span className="text-2xl">🛒</span>
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                    {cartCount}
                  </span>
                )}
              </button>

              {/* Login/Register or User Info */}
              {user ? (
                <div className="hidden md:flex items-center gap-2">
                  <span className={`text-sm font-medium ${isScrolled ? 'text-gray-700' : 'text-gray-900 bg-white/90 px-3 py-1 rounded-full'}`}>
                    Hi, {user.name}
                  </span>
                  <button 
                    onClick={() => navigate('portal')} 
                    className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg transition-all font-semibold shadow-md">
                    My Portal
                  </button>
                </div>
              ) : (
                <div className="hidden md:flex items-center gap-2">
                  <button 
                    onClick={() => navigate('login')} 
                    className={`px-4 py-2 rounded-lg transition-all font-medium ${
                      isScrolled 
                        ? 'text-gray-700 hover:text-green-600 hover:bg-green-50' 
                        : 'text-white hover:text-green-300 hover:bg-white/10'
                    }`}>
                    Login
                  </button>
                  <button 
                    onClick={() => navigate('register')} 
                    className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg transition-all font-semibold shadow-md">
                    Register
                  </button>
                </div>
              )}

              {/* Burger Menu Button */}
              <button 
                onClick={() => setIsSidebarOpen(true)}
                className="p-2 rounded-lg transition-all hover:bg-gray-100">
                <svg className="w-7 h-7" fill="none" stroke="#000000" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-50 transition-opacity"
          onClick={closeSidebar}></div>
      )}

      {/* Sidebar Menu */}
      <div className={`fixed top-0 right-0 h-full w-80 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
        isSidebarOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="flex justify-between items-center p-6 border-b">
            <h2 className="text-xl font-bold text-gray-900">Menu</h2>
            <button 
              onClick={closeSidebar}
              className="text-gray-500 hover:text-gray-700 p-2 hover:bg-gray-100 rounded-lg transition-all">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* User Info (Mobile) */}
          {user && (
            <div className="md:hidden p-6 bg-green-50 border-b">
              <p className="text-sm text-gray-600 mb-1">Welcome back,</p>
              <p className="text-lg font-bold text-gray-900">{user.name}</p>
            </div>
          )}

          {/* Menu Items */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="space-y-2">
              <button 
                onClick={() => { navigate('landing'); closeSidebar(); }} 
                className="w-full text-left text-gray-700 hover:text-green-600 hover:bg-green-50 px-4 py-3 rounded-lg transition-all font-medium flex items-center gap-3">
                <span className="text-xl">🏠</span>
                <span>Home</span>
              </button>
              
              <button 
                onClick={() => { navigate('about'); closeSidebar(); }} 
                className="w-full text-left text-gray-700 hover:text-green-600 hover:bg-green-50 px-4 py-3 rounded-lg transition-all font-medium flex items-center gap-3">
                <span className="text-xl">ℹ️</span>
                <span>About Us</span>
              </button>

              <div className="pt-2 pb-2">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 mb-2">Packages</p>
                <button 
                  onClick={() => { navigate('category', { category: 'umrah-packages' }); closeSidebar(); }} 
                  className="w-full text-left text-gray-700 hover:text-green-600 hover:bg-green-50 px-4 py-3 rounded-lg transition-all font-medium flex items-center gap-3">
                  <span className="text-xl">🕋</span>
                  <span>Umrah Packages</span>
                </button>
                
                <button 
                  onClick={() => { navigate('category', { category: 'hajj-packages' }); closeSidebar(); }} 
                  className="w-full text-left text-gray-700 hover:text-green-600 hover:bg-green-50 px-4 py-3 rounded-lg transition-all font-medium flex items-center gap-3">
                  <span className="text-xl">🌙</span>
                  <span>Hajj Packages</span>
                </button>
                
                <button 
                  onClick={() => { navigate('category', { category: 'ziarah-tours' }); closeSidebar(); }} 
                  className="w-full text-left text-gray-700 hover:text-green-600 hover:bg-green-50 px-4 py-3 rounded-lg transition-all font-medium flex items-center gap-3">
                  <span className="text-xl">🏛️</span>
                  <span>Ziarah Tours</span>
                </button>
                
                <button 
                  onClick={() => { navigate('category', { category: 'holiday-packages' }); closeSidebar(); }} 
                  className="w-full text-left text-gray-700 hover:text-green-600 hover:bg-green-50 px-4 py-3 rounded-lg transition-all font-medium flex items-center gap-3">
                  <span className="text-xl">✈️</span>
                  <span>Holiday Packages</span>
                </button>
              </div>

              <button 
                onClick={() => { navigate('shop'); closeSidebar(); }} 
                className="w-full text-left text-gray-700 hover:text-green-600 hover:bg-green-50 px-4 py-3 rounded-lg transition-all font-medium flex items-center gap-3">
                <span className="text-xl">🛍️</span>
                <span>Shop</span>
              </button>
              
              <button 
                onClick={() => { navigate('contact'); closeSidebar(); }} 
                className="w-full text-left text-gray-700 hover:text-green-600 hover:bg-green-50 px-4 py-3 rounded-lg transition-all font-medium flex items-center gap-3">
                <span className="text-xl">📞</span>
                <span>Contact Us</span>
              </button>

              {user && (
                <button 
                  onClick={() => { navigate('portal'); closeSidebar(); }} 
                  className="w-full text-left text-gray-700 hover:text-green-600 hover:bg-green-50 px-4 py-3 rounded-lg transition-all font-medium flex items-center gap-3">
                  <span className="text-xl">👤</span>
                  <span>My Portal</span>
                </button>
              )}

              <div className="pt-2 border-t">
                <button 
                  onClick={() => { navigate('admin-login'); closeSidebar(); }} 
                  className="w-full text-left text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 px-4 py-3 rounded-lg transition-all font-medium flex items-center gap-3 shadow-md mt-2">
                  <span className="text-xl">🔐</span>
                  <span>Admin Login</span>
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar Footer */}
          <div className="p-6 border-t bg-gray-50">
            {user ? (
              <button 
                onClick={handleLogout}
                className="w-full bg-red-500 hover:bg-red-600 text-white px-4 py-3 rounded-lg font-semibold transition-all shadow-md">
                Logout
              </button>
            ) : (
              <div className="space-y-2 md:hidden">
                <button 
                  onClick={() => { navigate('login'); closeSidebar(); }}
                  className="w-full bg-white border-2 border-green-600 text-green-600 hover:bg-green-50 px-4 py-3 rounded-lg font-semibold transition-all">
                  Login
                </button>
                <button 
                  onClick={() => { navigate('register'); closeSidebar(); }}
                  className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg font-semibold transition-all shadow-md">
                  Register
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;
