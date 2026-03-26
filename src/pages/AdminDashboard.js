import React, { useState, useEffect } from 'react';
import { api, adminApi } from '../api';
import DocumentUploadSection from '../components/DocumentUploadSection';

const AdminDashboard = ({ navigate }) => {
  const [adminUser, setAdminUser] = useState(null);
  const [activeSection, setActiveSection] = useState('overview');
  const [activeCategoryTab, setActiveCategoryTab] = useState('all');
  const [stats, setStats] = useState({
    totalBookings: 0, totalRevenue: 0, pendingBookings: 0,
    totalCustomers: 0, totalPackages: 0, totalOrders: 0
  });
  const [statsYear, setStatsYear] = useState(new Date().getFullYear());
  const [data, setData] = useState({
    bookings: [], packages: [], orders: [], categories: [], items: [], users: [], payments: []
  });
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [formData, setFormData] = useState({});
  const [passengers, setPassengers] = useState([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [tourLeaders, setTourLeaders] = useState([]);
  const [bookingRooms, setBookingRooms] = useState([{ id: 1, sharing_type: 'double', num_adults: 1, num_children: 0, num_infants: 0, passengers: [] }]);
  const [discountCode, setDiscountCode] = useState('');
  const [bookingSearch, setBookingSearch] = useState('');
  const [packageStatusFilter, setPackageStatusFilter] = useState('all'); // 'all','active','inactive','featured'

  useEffect(() => {
    const admin = localStorage.getItem('adminUser');
    if (!admin) {
      navigate('admin-login');
      return;
    }
    setAdminUser(JSON.parse(admin));
    loadAllData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadAllData = async () => {
    try {
      setLoading(true);
      console.log('Loading admin data...');
      
      const [bookings, packages, orders, categories, items, users, payments, tourLeadersData, customersData] = await Promise.all([
        adminApi.getBookings(), api.getPackages(), adminApi.getOrders(),
        api.getCategories(), api.getItems(), adminApi.getUsers(), adminApi.getPayments(),
        adminApi.getTourLeaders(), adminApi.getCustomers()
      ]);

      console.log('Raw data received:', { bookings, packages, orders, categories, items, users, payments, tourLeadersData, customersData });

      const bookingsArray = Array.isArray(bookings) ? bookings : (bookings.results || []);
      const packagesArray = Array.isArray(packages) ? packages : (packages.results || []);
      const ordersArray = Array.isArray(orders) ? orders : (orders.results || []);
      const categoriesArray = Array.isArray(categories) ? categories : (categories.results || []);
      const itemsArray = Array.isArray(items) ? items : (items.results || []);
      const usersArray = Array.isArray(users) ? users : (users.results || []);
      const paymentsArray = Array.isArray(payments) ? payments : (payments.results || []);
      const tourLeadersArray = Array.isArray(tourLeadersData) ? tourLeadersData : (tourLeadersData.results || []);
      const customersArray = Array.isArray(customersData) ? customersData : (customersData.results || []);

      console.log('Processed arrays:', { 
        bookings: bookingsArray.length, 
        packages: packagesArray.length, 
        orders: ordersArray.length,
        categories: categoriesArray.length,
        items: itemsArray.length,
        users: usersArray.length,
        payments: paymentsArray.length,
        customers: customersArray.length
      });
      
      console.log('Orders data sample:', ordersArray.slice(0, 2));

      const totalRevenue = bookingsArray.reduce((sum, b) => sum + parseFloat(b.paid_amount || 0), 0);
      const pendingBookings = bookingsArray.filter(b => b.status === 'pending').length;

      // Year-filtered stats
      const currentYear = statsYear;
      const filteredBookings = currentYear === 'all'
        ? bookingsArray
        : bookingsArray.filter(b => new Date(b.created_at).getFullYear() === parseInt(currentYear));
      const filteredRevenue = currentYear === 'all'
        ? totalRevenue
        : filteredBookings.reduce((sum, b) => sum + parseFloat(b.paid_amount || 0), 0);

      setStats({
        totalBookings: filteredBookings.length, totalRevenue: filteredRevenue,
        pendingBookings: filteredBookings.filter(b => b.status === 'pending').length,
        totalCustomers: new Set(filteredBookings.map(b => b.customer?.email)).size,
        totalPackages: packagesArray.length, totalOrders: ordersArray.length
      });

      setData({
        bookings: bookingsArray, packages: packagesArray, orders: ordersArray,
        categories: categoriesArray, items: itemsArray, users: usersArray, payments: paymentsArray,
        customers: customersArray
      });
      
      setTourLeaders(tourLeadersArray);
      
      console.log('Data loaded successfully!');
    } catch (error) {
      console.error('Error loading data:', error);
      alert('Error loading data: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminUser');
    navigate('landing');
  };

  const handleUpdateBookingStatus = async (bookingId, newStatus) => {
    try {
      await adminApi.updateBookingStatus(bookingId, newStatus);
      alert('Booking status updated successfully!');
      loadAllData(); // Reload data
    } catch (error) {
      console.error('Error updating booking status:', error);
      alert('Failed to update booking status');
    }
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await adminApi.updateOrderStatus(orderId, newStatus);
      alert('Order status updated successfully!');
      loadAllData(); // Reload data
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('Failed to update order status');
    }
  };

  const handleUpdatePaymentStatus = async (paymentId, newStatus) => {
    try {
      await adminApi.updatePaymentStatus(paymentId, newStatus);
      alert(`Payment ${newStatus === 'completed' ? 'accepted' : 'rejected'} successfully!`);
      loadAllData(); // Reload data
    } catch (error) {
      console.error('Error updating payment status:', error);
      alert('Failed to update payment status');
    }
  };

  const handleDeleteBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to delete this booking?')) return;
    try {
      await adminApi.deleteBooking(bookingId);
      alert('Booking deleted successfully!');
      loadAllData();
    } catch (error) {
      console.error('Error deleting booking:', error);
      alert('Failed to delete booking');
    }
  };

  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to delete this order?')) return;
    try {
      await adminApi.deleteOrder(orderId);
      alert('Order deleted successfully!');
      loadAllData();
    } catch (error) {
      console.error('Error deleting order:', error);
      alert('Failed to delete order');
    }
  };

  const openModal = (type, item = null) => {
    setModalType(type);
    setSelectedItem(item);
    setFormData(item || {});
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setModalType('');
    setSelectedItem(null);
    setFormData({});
    setBookingRooms([{ id: 1, sharing_type: 'double', num_adults: 1, num_children: 0, num_infants: 0, passengers: [] }]);
    setDiscountCode('');
  };

  const addRoom = () => {
    const newRoom = {
      id: bookingRooms.length + 1,
      sharing_type: 'double',
      num_adults: 1,
      num_children: 0,
      num_infants: 0,
      passengers: []
    };
    setBookingRooms([...bookingRooms, newRoom]);
  };

  const removeRoom = (roomId) => {
    if (bookingRooms.length > 1) {
      setBookingRooms(bookingRooms.filter(r => r.id !== roomId));
    }
  };

  const updateRoom = (roomId, field, value) => {
    setBookingRooms(bookingRooms.map(room => 
      room.id === roomId ? { ...room, [field]: value } : room
    ));
  };

  const getTotalPax = (room) => {
    return parseInt(room.num_adults || 0) + parseInt(room.num_children || 0) + parseInt(room.num_infants || 0);
  };

  const addPassengerToRoom = (roomId) => {
    setBookingRooms(bookingRooms.map(room => {
      if (room.id === roomId) {
        const newPassenger = {
          id: (room.passengers.length + 1),
          full_name: '',
          date_of_birth: '',
          gender: '',
          phone: '',
          passport_number: '',
          passport_expiry: '',
          passport_issue_date: '',
          passenger_type: 'adult'
        };
        return { ...room, passengers: [...room.passengers, newPassenger] };
      }
      return room;
    }));
  };

  const removePassengerFromRoom = (roomId, passengerId) => {
    setBookingRooms(bookingRooms.map(room => {
      if (room.id === roomId) {
        return { ...room, passengers: room.passengers.filter(p => p.id !== passengerId) };
      }
      return room;
    }));
  };

  const updatePassenger = (roomId, passengerId, field, value) => {
    setBookingRooms(bookingRooms.map(room => {
      if (room.id === roomId) {
        return {
          ...room,
          passengers: room.passengers.map(p =>
            p.id === passengerId ? { ...p, [field]: value } : p
          )
        };
      }
      return room;
    }));
  };

  const applyDiscount = async () => {
    if (!discountCode) {
      alert('Please enter a discount code');
      return;
    }
    try {
      const result = await api.validateDiscountCode(discountCode, formData.total_amount || 0);
      if (result.valid) {
        // setDiscountAmount(result.discount_amount);
        alert(`Discount applied: $${result.discount_amount}`);
      } else {
        alert(result.message || 'Invalid discount code');
        // setDiscountAmount(0);
      }
    } catch (error) {
      // console.error('Error validating discount:', error);
      // alert('Failed to validate discount code');
      // setDiscountAmount(0);
    }
  };


  const handleFormChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmitForm = async () => {
    try {
      if (modalType === 'add-package') {
        await adminApi.createPackage(formData);
        alert('Package created successfully!');
      } else if (modalType === 'edit-package') {
        console.log('Editing package with ID:', selectedItem.id);
        console.log('Form data:', formData);
        await adminApi.updatePackage(selectedItem.id, formData);
        alert('Package updated successfully!');
      } else if (modalType === 'add-category') {
        await adminApi.createCategory(formData);
        alert('Category created successfully!');
      } else if (modalType === 'edit-category') {
        await adminApi.updateCategory(selectedItem.id, formData);
        alert('Category updated successfully!');
      } else if (modalType === 'add-item') {
        await adminApi.createItem(formData);
        alert('Item created successfully!');
      } else if (modalType === 'edit-item') {
        await adminApi.updateItem(selectedItem.id, formData);
        alert('Item updated successfully!');
      } else if (modalType === 'add-user') {
        await adminApi.createUser(formData);
        alert('User created successfully!');
      } else if (modalType === 'add-booking') {
        await handleCreateWalkInBooking();
        return; // Return early as handleCreateWalkInBooking handles closing
      } else if (modalType === 'add-payment') {
        await handleCreateManualPayment();
        return; // Return early as handleCreateManualPayment handles closing
      }
      closeModal();
      loadAllData();
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Error: ' + error.message);
    }
  };

  const handleCreateWalkInBooking = async () => {
    try {
      // Validate required fields
      if (!formData.package_id || !formData.customer_email || !formData.contact_name || 
          !formData.contact_phone || !formData.num_adults || !formData.payment_amount ||
          !formData.passenger_name || !formData.passenger_dob || !formData.passenger_gender ||
          !formData.passenger_phone || !formData.passenger_passport || !formData.passenger_passport_expiry) {
        alert('Please fill in all required fields including passenger details');
        return;
      }

      // Prepare passenger data
      const passengerData = {
        full_name: formData.passenger_name,
        date_of_birth: formData.passenger_dob,
        gender: formData.passenger_gender,
        phone: formData.passenger_phone,
        passport_number: formData.passenger_passport,
        passport_expiry: formData.passenger_passport_expiry,
        passport_issue_date: formData.passenger_passport_issue || ''
      };

      // Prepare booking data
      const bookingData = {
        package_id: formData.package_id,
        customer_email: formData.customer_email,
        rooms: [{
          sharing_type: formData.room_type || 'double',
          num_adults: parseInt(formData.num_adults) || 1,
          num_children: parseInt(formData.num_children) || 0,
          num_infants: parseInt(formData.num_infants) || 0,
        }],
        contact_info: {
          name: formData.contact_name,
          phone: formData.contact_phone,
          email: formData.customer_email,
        },
        emergency_contact: {
          name: formData.contact_name,
          phone: formData.contact_phone,
          relationship: 'Self'
        },
        passengers: [passengerData],
        addons: [],
        payment_amount: parseFloat(formData.payment_amount),
        payment_method: formData.payment_method || 'cash',
        special_requests: formData.special_requests || ''
      };

      const response = await api.createBooking(bookingData);
      
      if (response.error) {
        alert('Error: ' + response.error);
      } else {
        alert('Walk-in booking created successfully! Booking #: ' + response.booking_number);
        closeModal();
        loadAllData();
      }
    } catch (error) {
      console.error('Error creating walk-in booking:', error);
      alert('Failed to create booking. Please try again.');
    }
  };

  const handleCreateManualPayment = async () => {
    try {
      console.log('Form Data:', formData);
      console.log('Booking ID:', formData.booking_id);
      console.log('Booking Search:', formData.booking_search);
      
      if (!formData.booking_search || formData.booking_search.length < 5) {
        alert('Please enter the last 5 digits of the booking number');
        return;
      }

      if (!formData.booking_id || formData.booking_id === '') {
        alert('Please select a booking from the dropdown. Current value: ' + formData.booking_id);
        return;
      }

      if (!formData.payment_amount || !formData.payment_method) {
        alert('Please fill in payment amount and method');
        return;
      }

      const bookingId = parseInt(formData.booking_id);
      console.log('Parsed Booking ID:', bookingId);
      
      const booking = data.bookings.find(b => b.id === bookingId);
      console.log('Found Booking:', booking);
      
      if (!booking) {
        alert('Booking not found with ID: ' + bookingId);
        return;
      }

      const email = booking.customer?.email || booking.contact_email;
      
      await api.addPayment(booking.id, {
        amount: formData.payment_amount,
        payment_method: formData.payment_method,
        remarks: formData.payment_remarks || ''
      }, email);

      alert('Manual payment added successfully!');
      closeModal();
      loadAllData();
    } catch (error) {
      console.error('Error adding manual payment:', error);
      alert('Failed to add payment: ' + (error.message || 'Unknown error'));
    }
  };

  const handleDeletePackage = async (packageId) => {
    if (!window.confirm('Are you sure you want to delete this package?')) return;
    try {
      await adminApi.deletePackage(packageId);
      alert('Package deleted successfully!');
      loadAllData();
    } catch (error) {
      console.error('Error deleting package:', error);
      alert('Failed to delete package');
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    try {
      await adminApi.deleteCategory(categoryId);
      alert('Category deleted successfully!');
      loadAllData();
    } catch (error) {
      console.error('Error deleting category:', error);
      alert('Failed to delete category');
    }
  };

  const handleDeleteItem = async (itemId) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    try {
      await adminApi.deleteItem(itemId);
      alert('Item deleted successfully!');
      loadAllData();
    } catch (error) {
      console.error('Error deleting item:', error);
      alert('Failed to delete item');
    }
  };

  const handleExportPackages = () => {
    adminApi.exportPackages();
  };

  const handleImportPackages = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    try {
      const result = await adminApi.importPackages(file);
      alert(result.message || 'Packages imported successfully!');
      loadAllData();
    } catch (error) {
      console.error('Error importing packages:', error);
      alert('Failed to import packages');
    }
  };

  const handleViewPassengers = async (packageId) => {
    try {
      const data = await adminApi.getPackagePassengers(packageId);
      setPassengers(data.passengers || []);
      setSelectedItem({ id: packageId, name: data.package_name, total: data.total_passengers });
      setModalType('view-passengers');
      setShowModal(true);
    } catch (error) {
      console.error('Error loading passengers:', error);
      alert('Failed to load passengers');
    }
  };

  const handleExportPassengers = (packageId) => {
    adminApi.exportPackagePassengers(packageId);
  };

  const StatCard = ({ icon, title, value, color, subtitle, onClick }) => (
    <div onClick={onClick}
      className={`bg-gradient-to-br ${color} rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-all cursor-pointer`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-white/80 text-sm font-medium mb-1">{title}</p>
          <p className="text-3xl font-bold">{value}</p>
          {subtitle && <p className="text-white/70 text-xs mt-1">{subtitle}</p>}
        </div>
        <div className="text-5xl opacity-80">{icon}</div>
      </div>
    </div>
  );

  const getStatusBadge = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800', confirmed: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800', cancelled: 'bg-red-100 text-red-800',
      processing: 'bg-purple-100 text-purple-800', shipped: 'bg-indigo-100 text-indigo-800',
      delivered: 'bg-green-100 text-green-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Menu Button */}
      <button 
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 bg-purple-600 text-white p-3 rounded-lg shadow-lg">
        <span className="text-2xl">{mobileMenuOpen ? '✕' : '☰'}</span>
      </button>

      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div 
          onClick={() => setMobileMenuOpen(false)}
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
        />
      )}

      {/* Left Sidebar */}
      <div className={`fixed left-0 top-0 h-full w-64 bg-gradient-to-b from-purple-900 to-indigo-900 text-white shadow-2xl z-40 flex flex-col transition-transform duration-300 ${
        mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        {/* Header - Fixed */}
        <div className="p-6 flex-shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-4xl">🔐</span>
            <div>
              <h2 className="text-xl font-bold">Admin Panel</h2>
              <p className="text-purple-200 text-xs">{adminUser?.username}</p>
            </div>
          </div>
        </div>

        {/* Navigation - Scrollable */}
        <nav className="flex-1 overflow-y-auto px-6 space-y-2 pb-32" style={{scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.3) transparent'}}>
            <button onClick={() => { setActiveSection('overview'); setMobileMenuOpen(false); }}
              className={`w-full text-left px-4 py-3 rounded-lg transition-all flex items-center gap-3 ${
                activeSection === 'overview' ? 'bg-white/20 font-semibold' : 'hover:bg-white/10'
              }`}>
              <span className="text-xl">📊</span>
              <span>Overview</span>
            </button>

            <button onClick={() => { setActiveSection('bookings'); setMobileMenuOpen(false); }}
              className={`w-full text-left px-4 py-3 rounded-lg transition-all flex items-center gap-3 ${
                activeSection === 'bookings' ? 'bg-white/20 font-semibold' : 'hover:bg-white/10'
              }`}>
              <span className="text-xl">📅</span>
              <span>Bookings</span>
              <span className="ml-auto bg-white/20 px-2 py-1 rounded-full text-xs">{data.bookings.length}</span>
            </button>

            <button onClick={() => { setActiveSection('packages'); setMobileMenuOpen(false); }}
              className={`w-full text-left px-4 py-3 rounded-lg transition-all flex items-center gap-3 ${
                activeSection === 'packages' ? 'bg-white/20 font-semibold' : 'hover:bg-white/10'
              }`}>
              <span className="text-xl">📦</span>
              <span>Packages</span>
              <span className="ml-auto bg-white/20 px-2 py-1 rounded-full text-xs">{data.packages.length}</span>
            </button>

            <button onClick={() => { setActiveSection('orders'); setMobileMenuOpen(false); }}
              className={`w-full text-left px-4 py-3 rounded-lg transition-all flex items-center gap-3 ${
                activeSection === 'orders' ? 'bg-white/20 font-semibold' : 'hover:bg-white/10'
              }`}>
              <span className="text-xl">🛍️</span>
              <span>Shop Orders</span>
              <span className="ml-auto bg-white/20 px-2 py-1 rounded-full text-xs">{data.orders.length}</span>
            </button>

            <button onClick={() => { setActiveSection('payments'); setMobileMenuOpen(false); }}
              className={`w-full text-left px-4 py-3 rounded-lg transition-all flex items-center gap-3 ${
                activeSection === 'payments' ? 'bg-white/20 font-semibold' : 'hover:bg-white/10'
              }`}>
              <span className="text-xl">💳</span>
              <span>Payments</span>
              <span className="ml-auto bg-white/20 px-2 py-1 rounded-full text-xs">{data.payments?.length || 0}</span>
            </button>

            <button onClick={() => { setActiveSection('categories'); setMobileMenuOpen(false); }}
              className={`w-full text-left px-4 py-3 rounded-lg transition-all flex items-center gap-3 ${
                activeSection === 'categories' ? 'bg-white/20 font-semibold' : 'hover:bg-white/10'
              }`}>
              <span className="text-xl">🏷️</span>
              <span>Categories</span>
              <span className="ml-auto bg-white/20 px-2 py-1 rounded-full text-xs">{data.categories.length}</span>
            </button>

            <button onClick={() => { setActiveSection('items'); setMobileMenuOpen(false); }}
              className={`w-full text-left px-4 py-3 rounded-lg transition-all flex items-center gap-3 ${
                activeSection === 'items' ? 'bg-white/20 font-semibold' : 'hover:bg-white/10'
              }`}>
              <span className="text-xl">🛒</span>
              <span>Shop Items</span>
              <span className="ml-auto bg-white/20 px-2 py-1 rounded-full text-xs">{data.items.length}</span>
            </button>

            <button onClick={() => { setActiveSection('users'); setMobileMenuOpen(false); }}
              className={`w-full text-left px-4 py-3 rounded-lg transition-all flex items-center gap-3 ${
                activeSection === 'users' ? 'bg-white/20 font-semibold' : 'hover:bg-white/10'
              }`}>
              <span className="text-xl">👥</span>
              <span>Users</span>
              <span className="ml-auto bg-white/20 px-2 py-1 rounded-full text-xs">{data.users.length}</span>
            </button>

            <button onClick={() => { setActiveSection('customers'); setMobileMenuOpen(false); }}
              className={`w-full text-left px-4 py-3 rounded-lg transition-all flex items-center gap-3 ${
                activeSection === 'customers' ? 'bg-white/20 font-semibold' : 'hover:bg-white/10'
              }`}>
              <span className="text-xl">👤</span>
              <span>Customers</span>
            </button>

            <button onClick={() => { setActiveSection('documents'); setMobileMenuOpen(false); }}
              className={`w-full text-left px-4 py-3 rounded-lg transition-all flex items-center gap-3 ${
                activeSection === 'documents' ? 'bg-white/20 font-semibold' : 'hover:bg-white/10'
              }`}>
              <span className="text-xl">📄</span>
              <span>Documents</span>
            </button>

            <button onClick={() => { setActiveSection('qr-tags'); setMobileMenuOpen(false); }}
              className={`w-full text-left px-4 py-3 rounded-lg transition-all flex items-center gap-3 ${
                activeSection === 'qr-tags' ? 'bg-white/20 font-semibold' : 'hover:bg-white/10'
              }`}>
              <span className="text-xl">🪪</span>
              <span>ID & Bag Tags</span>
            </button>
          </nav>

        {/* Footer Buttons - Fixed */}
        <div className="p-6 flex-shrink-0 space-y-2 border-t border-white/10">
            <button onClick={() => navigate('landing')}
              className="w-full bg-white/10 hover:bg-white/20 px-4 py-3 rounded-lg transition-all flex items-center gap-3">
              <span className="text-xl">🏠</span>
              <span>Back to Website</span>
            </button>
            <button onClick={handleLogout}
              className="w-full bg-red-500/80 hover:bg-red-600 px-4 py-3 rounded-lg transition-all flex items-center gap-3">
              <span className="text-xl">🚪</span>
              <span>Logout</span>
            </button>
          </div>
      </div>

      {/* Main Content */}
      <div className="lg:ml-64 p-4 md:p-8 pt-20 lg:pt-8">
        <div className="mb-8">
          <h1 className="text-2xl md:text-4xl font-bold text-gray-900 mb-2">
            {activeSection === 'overview' && '📊 Dashboard Overview'}
            {activeSection === 'bookings' && '📅 Manage Bookings'}
            {activeSection === 'packages' && '📦 Manage Packages'}
            {activeSection === 'orders' && '🛍️ Manage Shop Orders'}
            {activeSection === 'payments' && '💳 Manage Payments'}
            {activeSection === 'categories' && '🏷️ Manage Categories'}
            {activeSection === 'items' && '� Manage Shop Items'}
            {activeSection === 'users' && '👥 Manage Users'}
            {activeSection === 'customers' && '👤 Manage Customers & Tour Leaders'}
            {activeSection === 'documents' && '📄 Customer Documents'}
            {activeSection === 'qr-tags' && '🪪 ID & Bag Tags'}
          </h1>
          <p className="text-gray-600">Welcome back, {adminUser?.username}</p>
        </div>

        {/* Overview Section */}
        {activeSection === 'overview' && (
          <div>
            {/* Year Filter */}
            <div className="flex flex-wrap items-center gap-3 mb-6 bg-white rounded-xl shadow p-4">
              <span className="text-sm font-semibold text-gray-600">Stats for:</span>
              {['all', 2024, 2025, 2026, 2027].map(y => (
                <button
                  key={y}
                  onClick={() => {
                    setStatsYear(y);
                    const filtered = y === 'all' ? data.bookings : data.bookings.filter(b => new Date(b.created_at).getFullYear() === parseInt(y));
                    const revenue = filtered.reduce((sum, b) => sum + parseFloat(b.paid_amount || 0), 0);
                    setStats(prev => ({
                      ...prev,
                      totalBookings: filtered.length,
                      totalRevenue: revenue,
                      pendingBookings: filtered.filter(b => b.status === 'pending').length,
                      totalCustomers: new Set(filtered.map(b => b.customer?.email)).size,
                    }));
                  }}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                    statsYear === y ? 'bg-purple-600 text-white shadow' : 'bg-gray-100 text-gray-700 hover:bg-purple-100'
                  }`}>
                  {y === 'all' ? 'All Time' : y}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              <StatCard icon="📊" title="Total Bookings" value={stats.totalBookings}
                color="from-blue-500 to-blue-600" subtitle={`${stats.pendingBookings} pending`}
                onClick={() => setActiveSection('bookings')} />
              {adminUser?.is_superuser && (
                <StatCard icon="💰" title="Total Revenue" value={`$${stats.totalRevenue.toFixed(2)}`}
                  color="from-green-500 to-green-600" onClick={() => setActiveSection('bookings')} />
              )}
              <StatCard icon="👥" title="Total Customers" value={stats.totalCustomers}
                color="from-purple-500 to-purple-600" />
              <StatCard icon="📦" title="Packages" value={stats.totalPackages}
                color="from-orange-500 to-orange-600" onClick={() => setActiveSection('packages')} />
              <StatCard icon="🛍️" title="Shop Orders" value={stats.totalOrders}
                color="from-pink-500 to-pink-600" onClick={() => setActiveSection('orders')} />
              <StatCard icon="⏳" title="Pending Bookings" value={stats.pendingBookings}
                color="from-yellow-500 to-yellow-600" onClick={() => setActiveSection('bookings')} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <span>📅</span> Recent Bookings
                </h3>
                <div className="space-y-3">
                  {data.bookings.slice(0, 5).map(booking => (
                    <div key={booking.id} className="border-l-4 border-blue-500 pl-4 py-2 hover:bg-gray-50 transition-all rounded">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold text-gray-900">{booking.booking_number}</p>
                          <p className="text-sm text-gray-600">{booking.package_name}</p>
                          <p className="text-xs text-gray-500">{booking.customer?.email}</p>
                        </div>
                        <div className="text-right">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(booking.status)}`}>
                            {booking.status}
                          </span>
                          <p className="text-sm font-bold text-green-600 mt-1">${booking.total_amount}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <span>🛍️</span> Recent Orders
                </h3>
                <div className="space-y-3">
                  {data.orders.slice(0, 5).map(order => (
                    <div key={order.id} className="border-l-4 border-purple-500 pl-4 py-2 hover:bg-gray-50 transition-all rounded">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold text-gray-900">{order.order_number}</p>
                          <p className="text-xs text-gray-500">{order.customer?.email}</p>
                        </div>
                        <div className="text-right">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(order.status)}`}>
                            {order.status}
                          </span>
                          <p className="text-sm font-bold text-purple-600 mt-1">${order.total_amount}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Bookings Section */}
        {activeSection === 'bookings' && (
          <div>
            <div className="mb-6 flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => openModal('add-booking')}
                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-6 py-3 rounded-lg font-semibold shadow-lg transition-all flex items-center gap-2">
                <span className="text-xl">➕</span>
                Add Walk-in Booking
              </button>
              <input
                type="text"
                placeholder="Search by name, email, booking #..."
                value={bookingSearch}
                onChange={e => setBookingSearch(e.target.value)}
                className="flex-1 border-2 border-gray-300 rounded-lg px-4 py-3 focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
              />
            </div>

            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-bold">Booking #</th>
                      <th className="px-6 py-4 text-left text-sm font-bold">Customer Name</th>
                      <th className="px-6 py-4 text-left text-sm font-bold">Email</th>
                      <th className="px-6 py-4 text-left text-sm font-bold">Package</th>
                      <th className="px-6 py-4 text-left text-sm font-bold">Pax</th>
                      <th className="px-6 py-4 text-left text-sm font-bold">Status</th>
                      <th className="px-6 py-4 text-left text-sm font-bold">Total</th>
                      <th className="px-6 py-4 text-left text-sm font-bold">Paid</th>
                      <th className="px-6 py-4 text-left text-sm font-bold">Balance</th>
                      <th className="px-6 py-4 text-left text-sm font-bold">Date</th>
                      <th className="px-6 py-4 text-left text-sm font-bold">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {data.bookings
                      .filter(b => {
                        if (!bookingSearch) return true;
                        const q = bookingSearch.toLowerCase();
                        return (
                          b.booking_number?.toLowerCase().includes(q) ||
                          b.contact_name?.toLowerCase().includes(q) ||
                          b.customer?.email?.toLowerCase().includes(q) ||
                          b.package_name?.toLowerCase().includes(q)
                        );
                      })
                      .map(booking => {
                        const totalPax = (booking.rooms || []).reduce((sum, r) =>
                          sum + (r.num_adults || 0) + (r.num_children || 0) + (r.num_infants || 0), 0);
                        return (
                        <tr key={booking.id} className="hover:bg-blue-50 transition-all">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{booking.booking_number}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                            {booking.contact_name || booking.customer?.email?.split('@')[0] || 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{booking.customer?.email}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">{booking.package_name}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-center">
                            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full">{totalPax || '—'}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <select
                              value={booking.status}
                              onChange={(e) => handleUpdateBookingStatus(booking.id, e.target.value)}
                              className={`px-3 py-1 rounded-full text-xs font-medium border-2 ${getStatusBadge(booking.status)}`}>
                              <option value="pending">Pending</option>
                              <option value="confirmed">Confirmed</option>
                              <option value="completed">Completed</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">${booking.total_amount}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-semibold">${booking.paid_amount}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-semibold">${booking.balance_amount}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(booking.created_at).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                            <button
                              onClick={() => openModal('view-booking', booking)}
                              className="text-blue-600 hover:text-blue-800 font-medium">
                              View
                            </button>
                            <button
                              onClick={() => handleDeleteBooking(booking.id)}
                              className="text-red-600 hover:text-red-800 font-medium">
                              Delete
                            </button>
                          </td>
                        </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Packages Section */}
        {activeSection === 'packages' && (
          <div>
            <div className="mb-6 flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => openModal('add-package')}
                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-4 md:px-6 py-3 rounded-lg font-semibold shadow-lg transition-all flex items-center justify-center gap-2 text-sm md:text-base">
                <span className="text-xl">➕</span>
                Add New Package
              </button>
              <button
                onClick={handleExportPackages}
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-4 md:px-6 py-3 rounded-lg font-semibold shadow-lg transition-all flex items-center justify-center gap-2 text-sm md:text-base">
                <span className="text-xl">📥</span>
                Export Packages
              </button>
              <label className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white px-4 md:px-6 py-3 rounded-lg font-semibold shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer text-sm md:text-base">
                <span className="text-xl">📤</span>
                Import Packages
                <input type="file" accept=".csv" onChange={handleImportPackages} className="hidden" />
              </label>
            </div>

            {/* Category Tabs */}
            <div className="mb-4 border-b-2 border-gray-200 -mx-4 px-4 md:mx-0 md:px-0">
              <div className="flex gap-0 overflow-x-auto scrollbar-hide">
                <button
                  onClick={() => setActiveCategoryTab('all')}
                  className={`px-4 md:px-8 py-4 font-semibold transition-all whitespace-nowrap border-b-4 text-sm md:text-base ${
                    activeCategoryTab === 'all' 
                      ? 'border-purple-600 text-purple-600' 
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}>
                  All Packages
                </button>
                {data.categories.filter(cat => cat.category_type !== 'item').map(category => (
                  <button
                    key={category.id}
                    onClick={() => setActiveCategoryTab(category.slug)}
                    className={`px-4 md:px-8 py-4 font-semibold transition-all whitespace-nowrap border-b-4 text-sm md:text-base ${
                      activeCategoryTab === category.slug 
                        ? 'border-purple-600 text-purple-600' 
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}>
                    {category.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Status Filter */}
            <div className="flex flex-wrap gap-2 mb-6">
              {[
                { key: 'all', label: 'All', color: 'bg-gray-600' },
                { key: 'active', label: '✓ Active (Online)', color: 'bg-green-600' },
                { key: 'inactive', label: '✗ Inactive (Hidden)', color: 'bg-red-500' },
                { key: 'featured', label: '⭐ Featured', color: 'bg-yellow-500' },
              ].map(f => (
                <button key={f.key} onClick={() => setPackageStatusFilter(f.key)}
                  className={`px-4 py-2 rounded-full text-sm font-semibold text-white transition-all ${
                    packageStatusFilter === f.key ? f.color + ' shadow-lg scale-105' : 'bg-gray-300 text-gray-700'
                  }`}>
                  {f.label}
                </button>
              ))}
            </div>
                      ? 'border-purple-600 text-purple-600' 
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}>
                  All Packages
                </button>
                {data.categories.filter(cat => cat.category_type !== 'item').map(category => (
                  <button
                    key={category.id}
                    onClick={() => setActiveCategoryTab(category.slug)}
                    className={`px-4 md:px-8 py-4 font-semibold transition-all whitespace-nowrap border-b-4 text-sm md:text-base ${
                      activeCategoryTab === category.slug 
                        ? 'border-purple-600 text-purple-600' 
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}>
                    {category.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.packages
              .filter(pkg => activeCategoryTab === 'all' || data.categories.find(cat => cat.slug === activeCategoryTab)?.name === pkg.category_name)
              .filter(pkg => {
                if (packageStatusFilter === 'active') return pkg.is_active;
                if (packageStatusFilter === 'inactive') return !pkg.is_active;
                if (packageStatusFilter === 'featured') return pkg.is_featured;
                return true;
              })
              .map(pkg => (
              <div key={pkg.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all">
                {pkg.featured_image && (
                  <div className="relative">
                    <img src={pkg.featured_image} alt={pkg.name} className="w-full h-48 object-cover" />
                    <div className="absolute top-2 left-2 flex gap-1">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${pkg.is_active ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                        {pkg.is_active ? '● Online' : '● Hidden'}
                      </span>
                      {pkg.is_featured && <span className="bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full text-xs font-bold">⭐ Featured</span>}
                    </div>
                  </div>
                )}
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2 text-gray-900">{pkg.name}</h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{pkg.short_description}</p>
                  
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <p className="text-sm text-gray-500">From</p>
                      <p className="text-2xl font-bold text-green-600">${pkg.min_price}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">{pkg.duration_days}D/{pkg.duration_nights}N</p>
                      <p className="text-sm font-medium">{new Date(pkg.travel_date).toLocaleDateString()}</p>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-3 rounded-lg mb-3">
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Target</p>
                        <p className="text-lg font-bold text-blue-600">{pkg.max_capacity || 0}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Registered</p>
                        <p className="text-lg font-bold text-green-600">{pkg.registered_pax || 0}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Balance</p>
                        <p className="text-lg font-bold text-orange-600">{pkg.balance_seats || 0}</p>
                      </div>
                    </div>
                    <div className="mt-2">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full transition-all"
                          style={{ width: `${pkg.max_capacity > 0 ? ((pkg.registered_pax || 0) / pkg.max_capacity * 100) : 0}%` }}>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 text-center mt-1">
                        {pkg.max_capacity > 0 ? Math.round((pkg.registered_pax || 0) / pkg.max_capacity * 100) : 0}% Full
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <button
                      onClick={() => handleViewPassengers(pkg.id)}
                      className="bg-indigo-500 hover:bg-indigo-600 text-white px-3 py-2 rounded-lg text-sm font-medium transition-all">
                      👥 Passengers
                    </button>
                    <button
                      onClick={() => handleExportPassengers(pkg.id)}
                      className="bg-cyan-500 hover:bg-cyan-600 text-white px-3 py-2 rounded-lg text-sm font-medium transition-all">
                      📥 Export
                    </button>
                    <button
                      onClick={() => window.open(`https://Tmfauwaz.pythonanywhere.com/api/qr/rooming-list/${pkg.id}/print/`, '_blank')}
                      className="bg-purple-500 hover:bg-purple-600 text-white px-3 py-2 rounded-lg text-sm font-medium transition-all">
                      🪪 ID Tags
                    </button>
                    <button
                      onClick={() => window.open(`https://Tmfauwaz.pythonanywhere.com/api/qr/bulk-tags/${pkg.id}/`, '_blank')}
                      className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-2 rounded-lg text-sm font-medium transition-all">
                      🧳 Bag Tags
                    </button>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => openModal('edit-package', pkg)}
                      className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-all">
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeletePackage(pkg.id)}
                      className="flex-1 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition-all">
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          </div>
        )}

        {/* Orders Section */}
        {activeSection === 'orders' && (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-bold">Order #</th>
                    <th className="px-6 py-4 text-left text-sm font-bold">Customer</th>
                    <th className="px-6 py-4 text-left text-sm font-bold">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-bold">Amount</th>
                    <th className="px-6 py-4 text-left text-sm font-bold">Date</th>
                    <th className="px-6 py-4 text-left text-sm font-bold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {data.orders.map(order => (
                    <tr key={order.id} className="hover:bg-purple-50 transition-all">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{order.order_number}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {order.shipping_name || order.customer_email || order.customer?.email || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select 
                          value={order.status}
                          onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                          className={`px-3 py-1 rounded-full text-xs font-medium border-2 ${getStatusBadge(order.status)}`}>
                          <option value="pending">Pending</option>
                          <option value="processing">Processing</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                          <option value="refunded">Refunded</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">${order.total_amount}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(order.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                        <button
                          onClick={() => openModal('view-order', order)}
                          className="text-blue-600 hover:text-blue-800 font-medium">
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Payments Section */}
        {activeSection === 'payments' && (
          <div>
            <div className="mb-6">
              <button
                onClick={() => openModal('add-payment')}
                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-6 py-3 rounded-lg font-semibold shadow-lg transition-all flex items-center gap-2">
                <span className="text-xl">➕</span>
                Add Manual Payment
              </button>
            </div>

            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-green-500 to-green-600 text-white">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-bold">Payment #</th>
                    <th className="px-6 py-4 text-left text-sm font-bold">Booking #</th>
                    <th className="px-6 py-4 text-left text-sm font-bold">Customer</th>
                    <th className="px-6 py-4 text-left text-sm font-bold">Amount</th>
                    <th className="px-6 py-4 text-left text-sm font-bold">Method</th>
                    <th className="px-6 py-4 text-left text-sm font-bold">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-bold">Screenshot</th>
                    <th className="px-6 py-4 text-left text-sm font-bold">Date</th>
                    <th className="px-6 py-4 text-left text-sm font-bold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {(data.payments || []).map(payment => {
                    const booking = data.bookings.find(b => b.id === payment.booking);
                    return (
                    <tr key={payment.id} className="hover:bg-green-50 transition-all">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{payment.payment_number}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => openModal('view-booking', booking)}
                          className="text-blue-600 hover:text-blue-800 font-semibold underline">
                          {booking?.booking_number || payment.booking}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {payment.customer_name || booking?.contact_name || payment.customer_email || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">${payment.amount}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 capitalize">{payment.payment_method}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(payment.status)}`}>
                          {payment.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {payment.payment_screenshot ? (
                          <button
                            onClick={() => window.open(payment.payment_screenshot, '_blank')}
                            className="text-blue-600 hover:text-blue-800 font-medium text-sm">
                            View 🖼️
                          </button>
                        ) : (
                          <span className="text-gray-400 text-sm">No screenshot</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(payment.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                        {payment.status === 'pending' && adminUser?.is_superuser && (
                          <>
                            <button
                              onClick={() => handleUpdatePaymentStatus(payment.id, 'completed')}
                              className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded font-medium">
                              ✓ Accept
                            </button>
                            <button
                              onClick={() => handleUpdatePaymentStatus(payment.id, 'rejected')}
                              className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded font-medium">
                              ✗ Reject
                            </button>
                          </>
                        )}
                        {payment.status === 'pending' && !adminUser?.is_superuser && (
                          <span className="text-yellow-600 font-medium text-xs">Awaiting approval</span>
                        )}
                        {payment.status === 'completed' && (
                          <span className="text-green-600 font-medium">Accepted</span>
                        )}
                        {payment.status === 'rejected' && (
                          <span className="text-red-600 font-medium">Rejected</span>
                        )}
                      </td>
                    </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
          </div>
        )}

        {/* Categories Section */}
        {activeSection === 'categories' && (
          <div>
            <div className="mb-6">
              <button
                onClick={() => openModal('add-category')}
                className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-6 py-3 rounded-lg font-semibold shadow-lg transition-all flex items-center gap-2">
                <span className="text-xl">➕</span>
                Add New Category
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {data.categories.map(cat => (
              <div key={cat.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all">
                {cat.image && (
                  <img src={cat.image} alt={cat.name} className="w-full h-32 object-cover" />
                )}
                <div className="p-6">
                  <h3 className="text-lg font-bold mb-2 text-gray-900">{cat.name}</h3>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">{cat.description}</p>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => openModal('edit-category', cat)}
                      className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-lg text-sm font-medium transition-all">
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(cat.id)}
                      className="flex-1 bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg text-sm font-medium transition-all">
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          </div>
        )}

        {/* Items Section */}
        {activeSection === 'items' && (
          <div>
            <div className="mb-6">
              <button
                onClick={() => openModal('add-item')}
                className="bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white px-6 py-3 rounded-lg font-semibold shadow-lg transition-all flex items-center gap-2">
                <span className="text-xl">➕</span>
                Add New Item
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {data.items.map(item => (
              <div key={item.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all">
                {item.image && (
                  <img src={item.image} alt={item.name} className="w-full h-48 object-cover" />
                )}
                <div className="p-6">
                  <h3 className="text-lg font-bold mb-2 text-gray-900">{item.name}</h3>
                  <p className="text-2xl font-bold text-green-600 mb-2">${item.price}</p>
                  <p className="text-sm text-gray-600 mb-4">Stock: {item.stock_quantity}</p>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => openModal('edit-item', item)}
                      className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-lg text-sm font-medium transition-all">
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteItem(item.id)}
                      className="flex-1 bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg text-sm font-medium transition-all">
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          </div>
        )}

        {/* Users Section */}
        {activeSection === 'users' && (
          <div>
            <div className="mb-6">
              <button
                onClick={() => openModal('add-user')}
                className="bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white px-6 py-3 rounded-lg font-semibold shadow-lg transition-all flex items-center gap-2">
                <span className="text-xl">➕</span>
                Add New User
              </button>
            </div>

            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-bold">Username</th>
                      <th className="px-6 py-4 text-left text-sm font-bold">Email</th>
                      <th className="px-6 py-4 text-left text-sm font-bold">Name</th>
                      <th className="px-6 py-4 text-left text-sm font-bold">Staff</th>
                      <th className="px-6 py-4 text-left text-sm font-bold">Active</th>
                      <th className="px-6 py-4 text-left text-sm font-bold">Joined</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {data.users.map(user => (
                      <tr key={user.id} className="hover:bg-indigo-50 transition-all">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.username}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{user.email}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{user.first_name} {user.last_name}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${user.is_staff ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                            {user.is_staff ? 'Yes' : 'No'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {user.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(user.date_joined).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Customers Section */}
        {activeSection === 'customers' && (
          <div>
            <div className="mb-6 bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-gray-700">
                <span className="font-semibold">💡 Tip:</span> Mark customers as "Tour Leader" to assign them to packages. 
                Tour leaders will appear in the dropdown when creating/editing packages.
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-cyan-500 to-cyan-600 text-white">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-bold">Email</th>
                      <th className="px-6 py-4 text-left text-sm font-bold">Phone</th>
                      <th className="px-6 py-4 text-left text-sm font-bold">Display Name</th>
                      <th className="px-6 py-4 text-left text-sm font-bold">Bookings</th>
                      <th className="px-6 py-4 text-left text-sm font-bold">Tour Leader</th>
                      <th className="px-6 py-4 text-left text-sm font-bold">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {data.customers && data.customers.length > 0 ? (
                      data.customers.map(customer => (
                        <tr key={customer.id} className="hover:bg-cyan-50 transition-all">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{customer.email}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{customer.phone}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {customer.display_name || 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {data.bookings.filter(b => b.customer?.id === customer.id).length}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${customer.is_tour_leader ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                              {customer.is_tour_leader ? '✓ Yes' : 'No'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <button
                              onClick={async () => {
                                try {
                                  await adminApi.toggleTourLeader(customer.id);
                                  alert(`Customer ${customer.is_tour_leader ? 'removed from' : 'marked as'} tour leader!`);
                                  loadAllData();
                                } catch (error) {
                                  console.error('Error toggling tour leader:', error);
                                  alert('Failed to update tour leader status');
                                }
                              }}
                              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                customer.is_tour_leader 
                                  ? 'bg-red-500 hover:bg-red-600 text-white' 
                                  : 'bg-green-500 hover:bg-green-600 text-white'
                              }`}>
                              {customer.is_tour_leader ? 'Remove Tour Leader' : 'Mark as Tour Leader'}
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                          No customers found. Customers are created when they make bookings.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Documents Section */}
        {activeSection === 'documents' && (
          <div>
            <DocumentUploadSection customers={data.customers || []} packages={data.packages || []} />
          </div>
        )}

        {/* QR Tags Section */}
        {activeSection === 'qr-tags' && (
          <div>
            <p className="text-gray-600 mb-6">Select a package to export ID tags or Bag tags for all passengers.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {data.packages.filter(p => p.is_active).map(pkg => (
                <div key={pkg.id} className="bg-white rounded-xl shadow-lg p-6">
                  <h3 className="font-bold text-lg mb-1">{pkg.name}</h3>
                  <p className="text-sm text-gray-500 mb-4">{pkg.registered_pax || 0} passengers · {new Date(pkg.travel_date).toLocaleDateString()}</p>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => window.open(`https://Tmfauwaz.pythonanywhere.com/api/qr/rooming-list/${pkg.id}/print/`, '_blank')}
                      className="bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg font-semibold text-sm transition-all">
                      🪪 Print ID Tags
                    </button>
                    <button
                      onClick={() => window.open(`https://Tmfauwaz.pythonanywhere.com/api/qr/bulk-tags/${pkg.id}/`, '_blank')}
                      className="bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-lg font-semibold text-sm transition-all">
                      🧳 Print Bag Tags
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modal for Add/Edit */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-6 flex justify-between items-center">
              <h2 className="text-2xl font-bold">
                {modalType === 'view-booking' && '👁️ View Booking Details'}
                {modalType === 'view-order' && '👁️ View Order Details'}
                {modalType === 'view-passengers' && '👥 Passenger List'}
                {modalType.includes('add') && `➕ Add New ${modalType.split('-')[1]}`}
                {modalType.includes('edit') && `✏️ Edit ${modalType.split('-')[1]}`}
              </h2>
              <button onClick={closeModal} className="text-white hover:bg-white/20 p-2 rounded-lg transition-all">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6">
              {/* View Booking/Order Details */}
              {(modalType === 'view-booking' || modalType === 'view-order' || modalType === 'view-passengers') && selectedItem ? (
                <div className="space-y-6">
                  {modalType === 'view-passengers' && (
                    <>
                      <div className="bg-indigo-50 p-4 rounded-lg">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">👥 Passenger List</h3>
                        <p className="text-gray-700"><span className="font-semibold">Package:</span> {selectedItem.name}</p>
                        <p className="text-gray-700"><span className="font-semibold">Total Passengers:</span> {selectedItem.total}</p>
                      </div>

                      <div className="bg-white rounded-lg overflow-hidden border-2 border-gray-200">
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white">
                              <tr>
                                <th className="px-4 py-3 text-left text-xs font-bold">Booking #</th>
                                <th className="px-4 py-3 text-left text-xs font-bold">Full Name</th>
                                <th className="px-4 py-3 text-left text-xs font-bold">DOB</th>
                                <th className="px-4 py-3 text-left text-xs font-bold">Phone</th>
                                <th className="px-4 py-3 text-left text-xs font-bold">Passport #</th>
                                <th className="px-4 py-3 text-left text-xs font-bold">Passport Expiry</th>
                                <th className="px-4 py-3 text-left text-xs font-bold">Issue Date</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                              {passengers.map((passenger, idx) => (
                                <tr key={idx} className="hover:bg-indigo-50">
                                  <td className="px-4 py-3 text-sm">{passenger.booking_number}</td>
                                  <td className="px-4 py-3 text-sm font-medium">{passenger.full_name}</td>
                                  <td className="px-4 py-3 text-sm">{passenger.date_of_birth}</td>
                                  <td className="px-4 py-3 text-sm">{passenger.phone}</td>
                                  <td className="px-4 py-3 text-sm font-semibold">{passenger.passport_number}</td>
                                  <td className="px-4 py-3 text-sm">{passenger.passport_expiry}</td>
                                  <td className="px-4 py-3 text-sm">{passenger.passport_issue_date || 'N/A'}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <button 
                          onClick={() => handleExportPassengers(selectedItem.id)}
                          className="flex-1 bg-gradient-to-r from-cyan-500 to-cyan-600 text-white px-6 py-3 rounded-lg font-semibold">
                          📥 Export to CSV
                        </button>
                        <button onClick={closeModal}
                          className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 px-6 py-3 rounded-lg font-semibold">
                          Close
                        </button>
                      </div>
                    </>
                  )}
                  {modalType === 'view-booking' && (
                    <>
                      <div className="grid grid-cols-2 gap-6">
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <h3 className="text-lg font-bold text-gray-900 mb-3">📋 Booking Info</h3>
                          <div className="space-y-2">
                            <p><span className="text-gray-600">Booking #:</span> <span className="font-semibold">{selectedItem.booking_number}</span></p>
                            <p><span className="text-gray-600">Package:</span> <span className="font-semibold">{selectedItem.package_name}</span></p>
                            <p><span className="text-gray-600">Customer:</span> <span className="font-semibold">{selectedItem.customer?.email}</span></p>
                            <p><span className="text-gray-600">Status:</span> <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(selectedItem.status)}`}>{selectedItem.status}</span></p>
                          </div>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <h3 className="text-lg font-bold text-gray-900 mb-3">💰 Financial</h3>
                          <div className="space-y-2">
                            <p><span className="text-gray-600">Total:</span> <span className="text-xl font-bold">${selectedItem.total_amount}</span></p>
                            <p><span className="text-gray-600">Paid:</span> <span className="text-lg font-bold text-green-600">${selectedItem.paid_amount}</span></p>
                            <p><span className="text-gray-600">Balance:</span> <span className="text-lg font-bold text-red-600">${selectedItem.balance_amount}</span></p>
                          </div>
                        </div>
                      </div>
                      {selectedItem.payments && selectedItem.payments.length > 0 && (
                        <div className="bg-blue-50 p-4 rounded-lg">
                          <h3 className="text-lg font-bold text-gray-900 mb-3">💳 Payment Screenshots</h3>
                          <div className="grid grid-cols-2 gap-4">
                            {selectedItem.payments.map((payment, idx) => (
                              <div key={idx} className="bg-white p-3 rounded-lg border-2 border-gray-200">
                                <p className="text-sm font-semibold mb-1">{payment.payment_number}</p>
                                <p className="text-xs text-gray-600 mb-2">${payment.amount} - {new Date(payment.created_at).toLocaleDateString()}</p>
                                {payment.payment_screenshot ? (
                                  <div>
                                    <img src={payment.payment_screenshot} alt="Payment" className="w-full h-40 object-cover rounded cursor-pointer hover:opacity-80" onClick={() => window.open(payment.payment_screenshot, '_blank')} />
                                    <button onClick={() => window.open(payment.payment_screenshot, '_blank')} className="mt-2 w-full bg-blue-500 text-white px-2 py-1 rounded text-xs">View Full</button>
                                  </div>
                                ) : (
                                  <div className="bg-gray-100 h-40 rounded flex items-center justify-center"><p className="text-xs text-gray-500">No screenshot</p></div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                  {modalType === 'view-order' && (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <h3 className="text-lg font-bold text-gray-900 mb-3">📦 Order Info</h3>
                          <p><span className="text-gray-600">Order #:</span> <span className="font-semibold">{selectedItem.order_number}</span></p>
                          <p><span className="text-gray-600">Customer:</span> <span className="font-semibold">{selectedItem.customer?.email}</span></p>
                          <p><span className="text-gray-600">Status:</span> <span className={`font-semibold ${selectedItem.status === 'delivered' ? 'text-green-600' : selectedItem.status === 'cancelled' ? 'text-red-600' : selectedItem.status === 'refunded' ? 'text-orange-600' : 'text-blue-600'}`}>{selectedItem.status?.toUpperCase()}</span></p>
                          <p><span className="text-gray-600">Amount:</span> <span className="text-xl font-bold text-green-600">${selectedItem.total_amount}</span></p>
                          <p><span className="text-gray-600">Date:</span> <span className="font-medium">{new Date(selectedItem.created_at).toLocaleDateString()}</span></p>
                        </div>
                        
                        <div className="bg-green-50 p-4 rounded-lg">
                          <h3 className="text-lg font-bold text-gray-900 mb-3">📍 Shipping Address</h3>
                          <p className="font-semibold">{selectedItem.shipping_name || 'N/A'}</p>
                          <p className="text-gray-700">{selectedItem.shipping_address || 'N/A'}</p>
                          <p className="text-gray-700">{selectedItem.shipping_city || ''} {selectedItem.shipping_postal_code || ''}</p>
                          <p className="text-gray-700">{selectedItem.shipping_country || ''}</p>
                          <p className="text-gray-700 mt-2"><span className="text-gray-600">Phone:</span> {selectedItem.shipping_phone || 'N/A'}</p>
                        </div>
                      </div>

                      <div className="bg-blue-50 p-4 rounded-lg">
                        <h3 className="text-lg font-bold text-gray-900 mb-3">🛒 Order Items</h3>
                        <div className="space-y-2">
                          {selectedItem.items?.map((item, idx) => (
                            <div key={idx} className="flex justify-between items-center bg-white p-3 rounded">
                              <div className="flex items-center gap-3">
                                {item.item_image && <img src={item.item_image} alt={item.item_name} className="w-12 h-12 object-cover rounded" />}
                                <div>
                                  <p className="font-semibold">{item.item_name}</p>
                                  <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                                </div>
                              </div>
                              <p className="font-bold">${item.price}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="bg-yellow-50 p-4 rounded-lg">
                        <h3 className="text-lg font-bold text-gray-900 mb-3">💳 Payment Screenshot</h3>
                        {selectedItem.payment_screenshot ? (
                          <div>
                            <img src={selectedItem.payment_screenshot} alt="Payment" className="w-full h-48 object-cover rounded cursor-pointer" onClick={() => window.open(selectedItem.payment_screenshot, '_blank')} />
                            <button onClick={() => window.open(selectedItem.payment_screenshot, '_blank')} className="mt-2 w-full bg-blue-500 text-white px-3 py-2 rounded">View Full Size</button>
                          </div>
                        ) : (
                          <div className="bg-gray-100 h-48 rounded flex items-center justify-center"><p className="text-gray-500">No screenshot uploaded</p></div>
                        )}
                      </div>
                    </>
                  )}
                  <button onClick={closeModal} className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-3 rounded-lg font-semibold">Close</button>
                </div>
              ) : (
              <>
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4">
                <p className="text-blue-800 text-sm">
                  Fill in the form below. Required fields are marked with *
                </p>
              </div>
              
              <div className="space-y-4">
                {modalType.includes('package') && (
                  <>
                    <input type="text" placeholder="Package Name *" value={formData.name || ''} 
                      onChange={(e) => handleFormChange('name', e.target.value)}
                      className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:border-purple-500 focus:ring-2 focus:ring-purple-200" />
                    <input type="text" placeholder="Slug (e.g., umrah-package-2026)" value={formData.slug || ''} 
                      onChange={(e) => handleFormChange('slug', e.target.value)}
                      className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:border-purple-500 focus:ring-2 focus:ring-purple-200" />
                    <textarea placeholder="Short Description" value={formData.short_description || ''} 
                      onChange={(e) => handleFormChange('short_description', e.target.value)}
                      className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:border-purple-500 focus:ring-2 focus:ring-purple-200" rows="2"></textarea>
                    <textarea placeholder="Full Description *" value={formData.description || ''} 
                      onChange={(e) => handleFormChange('description', e.target.value)}
                      className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:border-purple-500 focus:ring-2 focus:ring-purple-200" rows="4"></textarea>
                    <input type="text" placeholder="Location (e.g., Makkah, Madinah) *" value={formData.location || ''} 
                      onChange={(e) => handleFormChange('location', e.target.value)}
                      className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:border-purple-500 focus:ring-2 focus:ring-purple-200" />
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Featured Image URL</label>
                      <input type="text" placeholder="https://example.com/package-image.jpg" value={formData.featured_image || ''} 
                        onChange={(e) => handleFormChange('featured_image', e.target.value)}
                        className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:border-purple-500 focus:ring-2 focus:ring-purple-200" />
                      <p className="text-xs text-gray-500 mt-1">Enter the full URL of the featured image</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Travel Date *</label>
                        <input type="date" value={formData.travel_date || ''} 
                          onChange={(e) => handleFormChange('travel_date', e.target.value)}
                          className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:border-purple-500 focus:ring-2 focus:ring-purple-200" />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Return Date *</label>
                        <input type="date" value={formData.return_date || ''} 
                          onChange={(e) => handleFormChange('return_date', e.target.value)}
                          className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:border-purple-500 focus:ring-2 focus:ring-purple-200" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Duration Days *</label>
                        <input type="number" placeholder="10" value={formData.duration_days || ''} 
                          onChange={(e) => handleFormChange('duration_days', e.target.value)}
                          className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:border-purple-500 focus:ring-2 focus:ring-purple-200" />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Duration Nights *</label>
                        <input type="number" placeholder="9" value={formData.duration_nights || ''} 
                          onChange={(e) => handleFormChange('duration_nights', e.target.value)}
                          className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:border-purple-500 focus:ring-2 focus:ring-purple-200" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Maximum Capacity (Target Seats) *</label>
                      <input type="number" placeholder="50" value={formData.max_capacity || ''} 
                        onChange={(e) => handleFormChange('max_capacity', e.target.value)}
                        className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:border-purple-500 focus:ring-2 focus:ring-purple-200" />
                      <p className="text-xs text-gray-500 mt-1">Total number of passengers this package can accommodate</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center gap-3">
                        <input type="checkbox" id="is_featured" checked={formData.is_featured || false} 
                          onChange={(e) => handleFormChange('is_featured', e.target.checked)}
                          className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500" />
                        <label htmlFor="is_featured" className="text-sm font-medium text-gray-700">Featured Package</label>
                      </div>
                      <div className="flex items-center gap-3">
                        <input type="checkbox" id="pkg_is_active" checked={formData.is_active !== false} 
                          onChange={(e) => handleFormChange('is_active', e.target.checked)}
                          className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500" />
                        <label htmlFor="pkg_is_active" className="text-sm font-medium text-gray-700">Active</label>
                      </div>
                    </div>

                    <div className="bg-cyan-50 p-4 rounded-lg">
                      <h4 className="font-bold text-gray-900 mb-3">🏨 Hotel Details (Optional)</h4>
                      <div className="space-y-3">
                        <input type="text" placeholder="Hotel Name" value={formData.hotel_name || ''} 
                          onChange={(e) => handleFormChange('hotel_name', e.target.value)}
                          className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:border-purple-500 focus:ring-2 focus:ring-purple-200" />
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Star Rating</label>
                            <select value={formData.hotel_star_rating || ''} 
                              onChange={(e) => handleFormChange('hotel_star_rating', e.target.value)}
                              className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:border-purple-500 focus:ring-2 focus:ring-purple-200">
                              <option value="">Select Rating</option>
                              <option value="1">⭐ 1 Star</option>
                              <option value="2">⭐⭐ 2 Stars</option>
                              <option value="3">⭐⭐⭐ 3 Stars</option>
                              <option value="4">⭐⭐⭐⭐ 4 Stars</option>
                              <option value="5">⭐⭐⭐⭐⭐ 5 Stars</option>
                            </select>
                          </div>
                          <input type="text" placeholder="Country" value={formData.hotel_country || ''} 
                            onChange={(e) => handleFormChange('hotel_country', e.target.value)}
                            className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:border-purple-500 focus:ring-2 focus:ring-purple-200" />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Hotel Image URL</label>
                          <input type="text" placeholder="https://example.com/hotel-image.jpg" value={formData.hotel_image || ''} 
                            onChange={(e) => handleFormChange('hotel_image', e.target.value)}
                            className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:border-purple-500 focus:ring-2 focus:ring-purple-200" />
                          <p className="text-xs text-gray-500 mt-1">Enter the full URL of the hotel image</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-green-50 p-4 rounded-lg">
                      <h4 className="font-bold text-gray-900 mb-3">👨‍✈️ Tour Leader (Optional)</h4>
                      <select 
                        value={formData.tour_leader || ''} 
                        onChange={(e) => handleFormChange('tour_leader', e.target.value)}
                        className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:border-purple-500 focus:ring-2 focus:ring-purple-200">
                        <option value="">-- Select Tour Leader --</option>
                        {tourLeaders.map(leader => (
                          <option key={leader.id} value={leader.id}>
                            {leader.display_name} ({leader.email})
                          </option>
                        ))}
                      </select>
                      <p className="text-xs text-gray-600 mt-2">Select a customer marked as tour leader. Manage tour leaders in the Customers section.</p>
                    </div>
                  </>
                )}
                
                {modalType.includes('category') && (
                  <>
                    <input type="text" placeholder="Category Name *" value={formData.name || ''} 
                      onChange={(e) => handleFormChange('name', e.target.value)}
                      className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:border-purple-500 focus:ring-2 focus:ring-purple-200" />
                    <input type="text" placeholder="Slug (e.g., umrah-packages)" value={formData.slug || ''} 
                      onChange={(e) => handleFormChange('slug', e.target.value)}
                      className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:border-purple-500 focus:ring-2 focus:ring-purple-200" />
                    <textarea placeholder="Description" value={formData.description || ''} 
                      onChange={(e) => handleFormChange('description', e.target.value)}
                      className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:border-purple-500 focus:ring-2 focus:ring-purple-200" rows="3"></textarea>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Category Image URL</label>
                      <input type="text" placeholder="https://example.com/image.jpg" value={formData.image || ''} 
                        onChange={(e) => handleFormChange('image', e.target.value)}
                        className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:border-purple-500 focus:ring-2 focus:ring-purple-200" />
                      <p className="text-xs text-gray-500 mt-1">Enter the full URL of the image</p>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Category Type</label>
                      <select value={formData.category_type || 'package'} 
                        onChange={(e) => handleFormChange('category_type', e.target.value)}
                        className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:border-purple-500 focus:ring-2 focus:ring-purple-200">
                        <option value="package">Package</option>
                        <option value="item">Item</option>
                      </select>
                    </div>
                    <div className="flex items-center gap-3">
                      <input type="checkbox" id="is_active" checked={formData.is_active !== false} 
                        onChange={(e) => handleFormChange('is_active', e.target.checked)}
                        className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500" />
                      <label htmlFor="is_active" className="text-sm font-medium text-gray-700">Active</label>
                    </div>
                  </>
                )}
                
                {modalType.includes('item') && (
                  <>
                    <input type="text" placeholder="Item Name *" value={formData.name || ''} 
                      onChange={(e) => handleFormChange('name', e.target.value)}
                      className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:border-purple-500 focus:ring-2 focus:ring-purple-200" />
                    <input type="text" placeholder="Slug (e.g., prayer-mat)" value={formData.slug || ''} 
                      onChange={(e) => handleFormChange('slug', e.target.value)}
                      className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:border-purple-500 focus:ring-2 focus:ring-purple-200" />
                    <textarea placeholder="Description" value={formData.description || ''} 
                      onChange={(e) => handleFormChange('description', e.target.value)}
                      className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:border-purple-500 focus:ring-2 focus:ring-purple-200" rows="3"></textarea>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Item Image URL</label>
                      <input type="text" placeholder="https://example.com/item-image.jpg" value={formData.image || ''} 
                        onChange={(e) => handleFormChange('image', e.target.value)}
                        className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:border-purple-500 focus:ring-2 focus:ring-purple-200" />
                      <p className="text-xs text-gray-500 mt-1">Enter the full URL of the image</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Price *</label>
                        <input type="number" step="0.01" placeholder="99.99" value={formData.price || ''} 
                          onChange={(e) => handleFormChange('price', e.target.value)}
                          className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:border-purple-500 focus:ring-2 focus:ring-purple-200" />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Stock Quantity *</label>
                        <input type="number" placeholder="100" value={formData.stock_quantity || ''} 
                          onChange={(e) => handleFormChange('stock_quantity', e.target.value)}
                          className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:border-purple-500 focus:ring-2 focus:ring-purple-200" />
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <input type="checkbox" id="item_is_active" checked={formData.is_active !== false} 
                        onChange={(e) => handleFormChange('is_active', e.target.checked)}
                        className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500" />
                      <label htmlFor="item_is_active" className="text-sm font-medium text-gray-700">Active</label>
                    </div>
                  </>
                )}
                
                {modalType.includes('user') && (
                  <>
                    <input type="text" placeholder="Username *" value={formData.username || ''} 
                      onChange={(e) => handleFormChange('username', e.target.value)}
                      className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:border-purple-500 focus:ring-2 focus:ring-purple-200" />
                    <input type="email" placeholder="Email *" value={formData.email || ''} 
                      onChange={(e) => handleFormChange('email', e.target.value)}
                      className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:border-purple-500 focus:ring-2 focus:ring-purple-200" />
                    <input type="password" placeholder="Password *" value={formData.password || ''} 
                      onChange={(e) => handleFormChange('password', e.target.value)}
                      className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:border-purple-500 focus:ring-2 focus:ring-purple-200" />
                  </>
                )}

                {modalType.includes('booking') && (
                  <>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Select Package *</label>
                      <select value={formData.package_id || ''} 
                        onChange={(e) => handleFormChange('package_id', e.target.value)}
                        className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:border-purple-500 focus:ring-2 focus:ring-purple-200">
                        <option value="">Choose a package...</option>
                        {data.packages.map(pkg => (
                          <option key={pkg.id} value={pkg.id}>{pkg.name} - ${pkg.min_price}</option>
                        ))}
                      </select>
                    </div>

                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-bold text-gray-900 mb-3">Customer Information</h4>
                      <div className="grid grid-cols-2 gap-3">
                        <input type="email" placeholder="Customer Email *" value={formData.customer_email || ''} 
                          onChange={(e) => handleFormChange('customer_email', e.target.value)}
                          className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:border-purple-500 focus:ring-2 focus:ring-purple-200" />
                        <input type="text" placeholder="Contact Name *" value={formData.contact_name || ''} 
                          onChange={(e) => handleFormChange('contact_name', e.target.value)}
                          className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:border-purple-500 focus:ring-2 focus:ring-purple-200" />
                        <input type="tel" placeholder="Contact Phone *" value={formData.contact_phone || ''} 
                          onChange={(e) => handleFormChange('contact_phone', e.target.value)}
                          className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 col-span-2" />
                      </div>
                    </div>

                    <div className="bg-green-50 p-4 rounded-lg">
                      <h4 className="font-bold text-gray-900 mb-3">Booking Details</h4>
                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Adults</label>
                          <input type="number" min="1" placeholder="1" value={formData.num_adults || ''} 
                            onChange={(e) => handleFormChange('num_adults', e.target.value)}
                            className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:border-purple-500 focus:ring-2 focus:ring-purple-200" />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Children</label>
                          <input type="number" min="0" placeholder="0" value={formData.num_children || ''} 
                            onChange={(e) => handleFormChange('num_children', e.target.value)}
                            className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:border-purple-500 focus:ring-2 focus:ring-purple-200" />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Infants</label>
                          <input type="number" min="0" placeholder="0" value={formData.num_infants || ''} 
                            onChange={(e) => handleFormChange('num_infants', e.target.value)}
                            className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:border-purple-500 focus:ring-2 focus:ring-purple-200" />
                        </div>
                      </div>
                      <div className="mt-3">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Room Type</label>
                        <select value={formData.room_type || 'double'} 
                          onChange={(e) => handleFormChange('room_type', e.target.value)}
                          className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:border-purple-500 focus:ring-2 focus:ring-purple-200">
                          <option value="single">Single</option>
                          <option value="double">Double</option>
                          <option value="triple">Triple</option>
                          <option value="quad">Quad</option>
                        </select>
                      </div>
                    </div>

                    <div className="bg-purple-50 p-4 rounded-lg">
                      <h4 className="font-bold text-gray-900 mb-3">Passenger Details</h4>
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <input type="text" placeholder="Full Name *" value={formData.passenger_name || ''} 
                            onChange={(e) => handleFormChange('passenger_name', e.target.value)}
                            className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:border-purple-500 focus:ring-2 focus:ring-purple-200" />
                          <input type="date" placeholder="Date of Birth *" value={formData.passenger_dob || ''} 
                            onChange={(e) => handleFormChange('passenger_dob', e.target.value)}
                            className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:border-purple-500 focus:ring-2 focus:ring-purple-200" />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <select value={formData.passenger_gender || ''} 
                            onChange={(e) => handleFormChange('passenger_gender', e.target.value)}
                            className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:border-purple-500 focus:ring-2 focus:ring-purple-200">
                            <option value="">Select Gender *</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                          </select>
                          <input type="tel" placeholder="Phone Number *" value={formData.passenger_phone || ''} 
                            onChange={(e) => handleFormChange('passenger_phone', e.target.value)}
                            className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:border-purple-500 focus:ring-2 focus:ring-purple-200" />
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                          <input type="text" placeholder="Passport Number *" value={formData.passenger_passport || ''} 
                            onChange={(e) => handleFormChange('passenger_passport', e.target.value)}
                            className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:border-purple-500 focus:ring-2 focus:ring-purple-200" />
                          <input type="date" placeholder="Passport Expiry *" value={formData.passenger_passport_expiry || ''} 
                            onChange={(e) => handleFormChange('passenger_passport_expiry', e.target.value)}
                            className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:border-purple-500 focus:ring-2 focus:ring-purple-200" />
                          <input type="date" placeholder="Passport Issue Date" value={formData.passenger_passport_issue || ''} 
                            onChange={(e) => handleFormChange('passenger_passport_issue', e.target.value)}
                            className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:border-purple-500 focus:ring-2 focus:ring-purple-200" />
                        </div>
                      </div>
                    </div>

                    <div className="bg-yellow-50 p-4 rounded-lg">
                      <h4 className="font-bold text-gray-900 mb-3">Payment Information</h4>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Payment Amount *</label>
                          <input type="number" step="0.01" placeholder="0.00" value={formData.payment_amount || ''} 
                            onChange={(e) => handleFormChange('payment_amount', e.target.value)}
                            className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:border-purple-500 focus:ring-2 focus:ring-purple-200" />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Payment Method</label>
                          <select value={formData.payment_method || 'cash'} 
                            onChange={(e) => handleFormChange('payment_method', e.target.value)}
                            className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:border-purple-500 focus:ring-2 focus:ring-purple-200">
                            <option value="cash">Cash</option>
                            <option value="paynow">PayNow</option>
                            <option value="bank_transfer">Bank Transfer</option>
                            <option value="credit_card">Credit Card</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <textarea placeholder="Special Requests (Optional)" value={formData.special_requests || ''} 
                      onChange={(e) => handleFormChange('special_requests', e.target.value)}
                      className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:border-purple-500 focus:ring-2 focus:ring-purple-200" rows="3"></textarea>
                  </>
                )}

                {modalType === 'add-payment' && (
                  <>
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-bold text-gray-900 mb-3">💳 Manual Payment Entry</h4>
                      <p className="text-sm text-gray-600 mb-4">Add a payment received at the shop or office</p>
                      
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Booking Number (Last 5 digits) *</label>
                          <input 
                            type="text" 
                            placeholder="Enter last 5 digits (e.g., 12345)" 
                            maxLength="5"
                            value={formData.booking_search || ''} 
                            onChange={(e) => {
                              const value = e.target.value.toUpperCase();
                              // Find matching bookings
                              const matches = data.bookings.filter(b => 
                                b.booking_number.slice(-5) === value || b.booking_number.includes(value)
                              );
                              setFormData(prev => ({
                                ...prev,
                                booking_search: value,
                                booking_matches: matches,
                                booking_id: '' // Reset selection when search changes
                              }));
                            }}
                            className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:border-purple-500 focus:ring-2 focus:ring-purple-200" 
                          />
                        </div>

                        {formData.booking_matches && formData.booking_matches.length > 0 && (
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Select Booking *</label>
                            <select 
                              value={formData.booking_id || ''} 
                              onChange={(e) => {
                                console.log('Selected booking ID:', e.target.value);
                                setFormData(prev => ({...prev, booking_id: e.target.value}));
                              }}
                              className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:border-purple-500 focus:ring-2 focus:ring-purple-200">
                              <option value="">Choose from matches...</option>
                              {formData.booking_matches.map(booking => (
                                <option key={booking.id} value={booking.id}>
                                  {booking.booking_number} - {booking.contact_name} - ${booking.balance_amount} remaining
                                </option>
                              ))}
                            </select>
                          </div>
                        )}

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Payment Amount *</label>
                            <input type="number" step="0.01" placeholder="0.00" value={formData.payment_amount || ''} 
                              onChange={(e) => handleFormChange('payment_amount', e.target.value)}
                              className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:border-purple-500 focus:ring-2 focus:ring-purple-200" />
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Payment Method *</label>
                            <select value={formData.payment_method || 'cash'} 
                              onChange={(e) => handleFormChange('payment_method', e.target.value)}
                              className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:border-purple-500 focus:ring-2 focus:ring-purple-200">
                              <option value="cash">Cash</option>
                              <option value="paynow">PayNow</option>
                              <option value="bank_transfer">Bank Transfer</option>
                              <option value="credit_card">Credit Card</option>
                            </select>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Remarks / Notes (Optional)</label>
                          <textarea 
                            placeholder="Add any notes about this payment..." 
                            value={formData.payment_remarks || ''} 
                            onChange={(e) => handleFormChange('payment_remarks', e.target.value)}
                            className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:border-purple-500 focus:ring-2 focus:ring-purple-200" 
                            rows="3">
                          </textarea>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
              
              <div className="flex gap-3 mt-6">
                <button onClick={handleSubmitForm}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all">
                  Save
                </button>
                <button onClick={closeModal}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 px-6 py-3 rounded-lg font-semibold transition-all">
                  Cancel
                </button>
              </div>
              </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
