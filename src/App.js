import React, { useState, useEffect } from 'react';
import LandingPage from './pages/LandingPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import CategoryPage from './pages/CategoryPage';
import PackageDetailPage from './pages/PackageDetailPage';
import PassengerDetailsPage from './pages/PassengerDetailsPage';
import AddOnsPage from './pages/AddOnsPage';
import CheckoutPage from './pages/CheckoutPage';
import CustomerPortal from './pages/CustomerPortal';
import ShoppingCart from './pages/ShoppingCart';
import ShopPage from './pages/ShopPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import OrderSuccessPage from './pages/OrderSuccessPage';
import AdminDashboard from './pages/AdminDashboard';
import AdminLogin from './pages/AdminLogin';
import AIChatBot from './components/AIChatBot';
import PromoPopup from './components/PromoPopup';
import { CartProvider } from './context/CartContext';

// Error Boundary to prevent full app crash
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center p-8 max-w-md">
            <div className="text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Something went wrong</h2>
            <p className="text-gray-500 mb-6">An unexpected error occurred. Please refresh the page.</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors">
              Refresh Page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function App() {
  const [currentPage, setCurrentPage] = useState('landing');
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [user, setUser] = useState(null);
  const [orderData, setOrderData] = useState(null);
  const [bookingData, setBookingData] = useState({
    rooms: [],
    passengers: [],
    addons: [],
    contactInfo: {},
    emergencyContact: {}
  });

  useEffect(() => {
    // Check if user is logged in
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const navigate = (page, data = {}) => {
    setCurrentPage(page);
    if (data.package) setSelectedPackage(data.package);
    if (data.category) setSelectedCategory(data.category);
    if (data.bookingData) setBookingData(prev => ({ ...prev, ...data.bookingData }));
    if (data.orderData) setOrderData(data.orderData);
  };

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleAdminLogin = (adminData) => {
    // Admin login handler
    console.log('Admin logged in:', adminData);
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    navigate('landing');
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'landing':
        return <LandingPage navigate={navigate} user={user} onLogout={handleLogout} />;
      case 'about':
        return <AboutPage navigate={navigate} />;
      case 'contact':
        return <ContactPage navigate={navigate} />;
      case 'category':
        return <CategoryPage navigate={navigate} category={selectedCategory} />;
      case 'package':
        return <PackageDetailPage navigate={navigate} packageData={selectedPackage} bookingData={bookingData} />;
      case 'passengers':
        return <PassengerDetailsPage navigate={navigate} packageData={selectedPackage} bookingData={bookingData} />;
      case 'addons':
        return <AddOnsPage navigate={navigate} packageData={selectedPackage} bookingData={bookingData} />;
      case 'checkout':
        return <CheckoutPage navigate={navigate} packageData={selectedPackage} bookingData={bookingData} />;
      case 'portal':
        return <CustomerPortal navigate={navigate} />;
      case 'cart':
        return <ShoppingCart navigate={navigate} />;
      case 'shop':
        return <ShopPage navigate={navigate} />;
      case 'login':
        return <LoginPage navigate={navigate} onLogin={handleLogin} />;
      case 'register':
        return <RegisterPage navigate={navigate} />;
      case 'forgot-password':
        return <ForgotPasswordPage navigate={navigate} />;
      case 'success':
        return <OrderSuccessPage navigate={navigate} orderData={orderData} />;
      case 'admin-login':
        return <AdminLogin navigate={navigate} onAdminLogin={handleAdminLogin} />;
      case 'admin-dashboard':
        return <AdminDashboard navigate={navigate} />;
      default:
        return <LandingPage navigate={navigate} user={user} onLogout={handleLogout} />;
    }
  };

  return (
    <CartProvider>
      <ErrorBoundary>
        <div className="min-h-screen bg-gray-50">
          {renderPage()}
          <AIChatBot hidden={currentPage === 'admin-login' || currentPage === 'admin-dashboard'} />
          {currentPage === 'landing' && <PromoPopup />}
        </div>
      </ErrorBoundary>
    </CartProvider>
  );
}

export default App;
