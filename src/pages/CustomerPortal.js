import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { api } from '../api';

const CustomerPortal = ({ navigate }) => {
  const [email, setEmail] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [itemOrders, setItemOrders] = useState([]);
  const [customer, setCustomer] = useState(null);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('paynow');
  const [paymentScreenshot, setPaymentScreenshot] = useState(null);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [customerData, setCustomerData] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('bookings'); // 'bookings' or 'shop-orders'
  const [expandedBookings, setExpandedBookings] = useState({}); // Track which bookings are expanded
  const [expandedOrders, setExpandedOrders] = useState({}); // Track which shop orders are expanded

  // Toggle booking expansion
  const toggleBooking = (bookingId) => {
    setExpandedBookings(prev => ({
      ...prev,
      [bookingId]: !prev[bookingId]
    }));
  };

  // Toggle order expansion
  const toggleOrder = (orderId) => {
    setExpandedOrders(prev => ({
      ...prev,
      [orderId]: !prev[orderId]
    }));
  };

  // Check if user is already logged in
  useEffect(() => {
    const checkLoggedInUser = async () => {
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        const userData = JSON.parse(savedUser);
        setEmail(userData.email);
        console.log('Loading data for user:', userData.email);
        
        try {
          const [bookingsData, customerData, itemOrdersData] = await Promise.all([
            api.getCustomerBookings(userData.email),
            api.getCustomer(userData.email),
            api.getCustomerItemOrders(userData.email)
          ]);
          
          console.log('Bookings data:', bookingsData);
          console.log('Customer data:', customerData);
          console.log('Item orders data:', itemOrdersData);
          
          const bookings = Array.isArray(bookingsData) ? bookingsData : (bookingsData.results || []);
          const customers = Array.isArray(customerData) ? customerData : (customerData.results || []);
          const orders = Array.isArray(itemOrdersData) ? itemOrdersData : (itemOrdersData.results || []);
          
          console.log('Processed bookings:', bookings.length);
          console.log('Bookings array:', bookings);
          console.log('Processed orders:', orders.length);
          
          setBookings(bookings);
          setItemOrders(orders);
          setCustomer(customers[0] || null);
          setCustomerData(customers[0] || {});
          setIsLoggedIn(true);
        } catch (error) {
          console.error('Error loading user data:', error);
          alert('Error loading your data. Please check console for details.');
        }
      }
      setLoading(false);
    };
    
    checkLoggedInUser();
  }, []);

  const handleLogin = async () => {
    if (!email) {
      alert('Please enter your email');
      return;
    }

    console.log('Logging in with email:', email);

    try {
      const [bookingsData, customerData, itemOrdersData] = await Promise.all([
        api.getCustomerBookings(email),
        api.getCustomer(email),
        api.getCustomerItemOrders(email)
      ]);
      
      console.log('Login - Bookings data:', bookingsData);
      console.log('Login - Customer data:', customerData);
      console.log('Login - Item orders data:', itemOrdersData);
      
      // Handle both paginated and non-paginated responses
      const bookings = Array.isArray(bookingsData) ? bookingsData : (bookingsData.results || []);
      const customers = Array.isArray(customerData) ? customerData : (customerData.results || []);
      const orders = Array.isArray(itemOrdersData) ? itemOrdersData : (itemOrdersData.results || []);
      
      console.log('Login - Processed bookings:', bookings.length);
      console.log('Login - Processed orders:', orders.length);
      
      if (bookings.length > 0 || customers.length > 0 || orders.length > 0) {
        setBookings(bookings);
        setItemOrders(orders);
        setCustomer(customers[0] || null);
        setCustomerData(customers[0] || {});
        setIsLoggedIn(true);
      } else {
        alert('No bookings or orders found for this email');
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('Error loading your information. Check console for details.');
    }
  };

  const handleAddPayment = async () => {
    console.log('=== Add Payment Debug ===');
    console.log('Payment Amount:', paymentAmount);
    console.log('Payment Method:', paymentMethod);
    console.log('Payment Screenshot:', paymentScreenshot);
    console.log('Selected Booking ID:', selectedBooking?.id);
    console.log('Balance Amount:', selectedBooking?.balance_amount);
    
    if (!paymentAmount || parseFloat(paymentAmount) <= 0) {
      alert('Please enter a valid payment amount');
      return;
    }

    if (parseFloat(paymentAmount) > parseFloat(selectedBooking.balance_amount)) {
      alert('Payment amount cannot exceed balance amount');
      return;
    }

    // Check for screenshot if PayNow is selected
    if (paymentMethod === 'paynow' && !paymentScreenshot) {
      alert('Please upload payment screenshot for PayNow payment');
      return;
    }

    setPaymentLoading(true);

    try {
      console.log('Calling API with:', {
        booking_id: selectedBooking.id,
        amount: paymentAmount,
        payment_method: paymentMethod,
        has_screenshot: !!paymentScreenshot
      });
      
      const result = await api.addPayment(selectedBooking.id, {
        amount: paymentAmount,
        payment_method: paymentMethod,
        payment_screenshot: paymentScreenshot
      }, email);
      
      console.log('Payment result:', result);
      
      if (result.error) {
        alert(`Error: ${result.error}`);
        return;
      }
      
      alert('Payment added successfully!');
      
      // Reset form
      setPaymentAmount('');
      setPaymentScreenshot(null);
      setSelectedBooking(null);
      
      // Reload bookings
      const bookingsData = await api.getCustomerBookings(email);
      const bookings = Array.isArray(bookingsData) ? bookingsData : (bookingsData.results || []);
      setBookings(bookings);
    } catch (error) {
      console.error('Payment error:', error);
      console.error('Error details:', error.message);
      alert(`Error processing payment: ${error.message || 'Please try again'}`);
      setPaymentScreenshot(null);
    } finally {
      setPaymentLoading(false);
    }
  };

  const handleUpdateCustomer = async () => {
    try {
      await api.updateCustomer(customer.id, customerData);
      alert('Profile updated successfully!');
      setEditMode(false);
      setCustomer(customerData);
    } catch (error) {
      console.error('Update error:', error);
      alert('Error updating profile');
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div>
        <Navbar navigate={navigate} />
        <div className="max-w-md mx-auto px-4 py-16 pt-28 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your portal...</p>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div>
        <Navbar navigate={navigate} />
        
        <div className="max-w-md mx-auto px-4 py-16 pt-28">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h1 className="text-3xl font-bold mb-6 text-center">Customer Portal</h1>
            <p className="text-gray-600 mb-6 text-center">Enter your email to access your bookings</p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Email Address</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                       className="w-full border rounded-lg px-4 py-3" placeholder="your@email.com" />
              </div>
              
              <button onClick={handleLogin} className="w-full bg-primary text-white py-3 rounded-lg font-bold hover:bg-secondary">
                Access Portal
              </button>
              
              <div className="text-center text-sm text-gray-600">
                <p>Don't have an account? <button onClick={() => navigate('register')} className="text-primary hover:underline font-medium">Register here</button></p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar navigate={navigate} />
      
        <div className="max-w-7xl mx-auto px-4 py-8 pt-24 md:pt-28">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">My Portal</h1>
            <p className="text-sm text-gray-600 mt-1">Logged in as: {email}</p>
          </div>
          <button 
            onClick={() => {
              setIsLoggedIn(false);
              setEmail('');
              setBookings([]);
              setItemOrders([]);
              setCustomer(null);
            }} 
            className="text-gray-600 hover:text-red-600 px-4 py-2 rounded-lg hover:bg-red-50 transition-all">
            Logout from Portal
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Section */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Profile</h2>
                {!editMode && (
                  <button onClick={() => setEditMode(true)} className="text-primary text-sm">Edit</button>
                )}
              </div>
              
              {editMode ? (
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">Email</label>
                    <input type="email" value={customerData.email || ''} onChange={(e) => setCustomerData({...customerData, email: e.target.value})}
                           className="w-full border rounded px-3 py-2" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Phone</label>
                    <input type="tel" value={customerData.phone || ''} onChange={(e) => setCustomerData({...customerData, phone: e.target.value})}
                           className="w-full border rounded px-3 py-2" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Address</label>
                    <textarea value={customerData.address || ''} onChange={(e) => setCustomerData({...customerData, address: e.target.value})}
                              className="w-full border rounded px-3 py-2" rows="2" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Unit Number</label>
                    <input type="text" value={customerData.unit_number || ''} onChange={(e) => setCustomerData({...customerData, unit_number: e.target.value})}
                           className="w-full border rounded px-3 py-2" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Postal Code</label>
                    <input type="text" value={customerData.postal_code || ''} onChange={(e) => setCustomerData({...customerData, postal_code: e.target.value})}
                           className="w-full border rounded px-3 py-2" />
                  </div>
                  <div className="flex gap-2">
                    <button onClick={handleUpdateCustomer} className="flex-1 bg-primary text-white py-2 rounded hover:bg-secondary">
                      Save
                    </button>
                    <button onClick={() => { setEditMode(false); setCustomerData(customer); }} className="flex-1 border py-2 rounded hover:bg-gray-100">
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">Email:</span> {customer?.email}</p>
                  <p><span className="font-medium">Phone:</span> {customer?.phone}</p>
                  <p><span className="font-medium">Address:</span> {customer?.address}</p>
                  {customer?.unit_number && <p><span className="font-medium">Unit:</span> {customer.unit_number}</p>}
                  <p><span className="font-medium">Postal Code:</span> {customer?.postal_code}</p>
                </div>
              )}
            </div>
          </div>

          {/* Bookings and Shop Orders Section */}
          <div className="lg:col-span-2">
            {/* Tabs */}
            <div className="flex gap-4 mb-6 border-b">
              <button 
                onClick={() => setActiveTab('bookings')}
                className={`pb-3 px-4 font-semibold transition-all ${
                  activeTab === 'bookings' 
                    ? 'border-b-2 border-green-600 text-green-600' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}>
                My Bookings ({bookings.length})
              </button>
              <button 
                onClick={() => setActiveTab('shop-orders')}
                className={`pb-3 px-4 font-semibold transition-all ${
                  activeTab === 'shop-orders' 
                    ? 'border-b-2 border-green-600 text-green-600' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}>
                Shop Orders ({itemOrders.length})
              </button>
            </div>

            {/* Bookings Tab */}
            {activeTab === 'bookings' && (
              <div>
                <h2 className="text-2xl font-bold mb-4">My Bookings</h2>
                
                {bookings.length === 0 ? (
                  <div className="bg-white rounded-lg shadow p-8 text-center">
                    <p className="text-gray-500 mb-4">No bookings found</p>
                    <button 
                      onClick={() => navigate('category', { category: 'umrah-packages' })}
                      className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg">
                      Browse Packages
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">{bookings.map(booking => {
                    const isExpanded = expandedBookings[booking.id];
                    
                    return (
                  <div key={booking.id} className="bg-white rounded-lg shadow">
                    {/* Booking Header - Always Visible */}
                    <div 
                      className="p-6 cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => toggleBooking(booking.id)}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <h3 className="text-xl font-bold">{booking.package_name}</h3>
                            <span className={`inline-block px-3 py-1 rounded text-sm ${
                              booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                              booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              booking.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                              'bg-blue-100 text-blue-800'
                            }`}>
                              {booking.status.toUpperCase()}
                            </span>
                          </div>
                          <p className="text-gray-600 mt-1">Booking #{booking.booking_number}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600">Total</p>
                          <p className="text-2xl font-bold">${booking.total_amount}</p>
                          <button className="mt-2 text-primary hover:text-secondary transition-colors">
                            {isExpanded ? '▲ Collapse' : '▼ Expand'}
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4 mt-4 p-4 bg-gray-50 rounded">
                        <div>
                          <p className="text-sm text-gray-600">Paid</p>
                          <p className="text-lg font-bold text-green-600">${booking.paid_amount}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Balance</p>
                          <p className="text-lg font-bold text-red-600">${booking.balance_amount}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Rooms</p>
                          <p className="text-lg font-bold">{booking.rooms?.length || 0}</p>
                        </div>
                      </div>
                    </div>

                    {/* Booking Details - Collapsible */}
                    {isExpanded && (
                      <div className="px-6 pb-6 border-t">{/* Room Details */}
                    {booking.rooms && booking.rooms.length > 0 && (
                      <div className="mb-4">
                        <h4 className="font-bold mb-2">Room Details</h4>
                        <div className="space-y-3">
                          {booking.rooms.map((room, index) => (
                            <div key={room.id} className="border rounded-lg p-4 bg-gray-50">
                              <div className="flex justify-between items-start mb-2">
                                <div>
                                  <p className="font-semibold text-lg">Room {room.room_number}</p>
                                  <p className="text-sm text-gray-600">{room.sharing_type.replace('_', ' ').toUpperCase()}</p>
                                </div>
                                <div className="text-right">
                                  <p className="text-sm text-gray-600">Room Total</p>
                                  <p className="font-bold text-lg">${room.subtotal}</p>
                                </div>
                              </div>
                              
                              <div className="grid grid-cols-3 gap-2 mb-3 text-sm">
                                <div className="bg-white p-2 rounded">
                                  <p className="text-gray-600">Adults</p>
                                  <p className="font-semibold">{room.num_adults}</p>
                                </div>
                                <div className="bg-white p-2 rounded">
                                  <p className="text-gray-600">Children</p>
                                  <p className="font-semibold">{room.num_children}</p>
                                </div>
                                <div className="bg-white p-2 rounded">
                                  <p className="text-gray-600">Infants</p>
                                  <p className="font-semibold">{room.num_infants}</p>
                                </div>
                              </div>

                              {room.passengers && room.passengers.length > 0 && (
                                <div>
                                  <p className="text-sm font-semibold mb-2">Passengers:</p>
                                  <div className="space-y-1">
                                    {room.passengers.map((passenger, pIndex) => (
                                      <div key={passenger.id} className="text-sm bg-white p-2 rounded flex justify-between">
                                        <span>
                                          <span className="font-medium">{passenger.full_name}</span>
                                          <span className="text-gray-500 ml-2">({passenger.passenger_type})</span>
                                        </span>
                                        <span className="text-gray-600">{passenger.passport_number}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Invoice Button */}
                    <div className="mb-4">
                      <button 
                        onClick={() => window.open(`https://Tmfauwaz.pythonanywhere.com/api/bookings/${booking.id}/invoice/?email=${email}`, '_blank')}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-semibold transition-all flex items-center justify-center gap-2">
                        <span>📄</span>
                        <span>Download Invoice (PDF)</span>
                      </button>
                    </div>

                    {parseFloat(booking.balance_amount) > 0 && (
                      <div>
                        {selectedBooking?.id === booking.id ? (
                          <div className="border-t pt-4 mt-4">
                            <h4 className="font-bold mb-3">Make a Payment</h4>
                            
                            <div className="mb-4">
                              <label className="block text-sm font-medium mb-1">Payment Method</label>
                              <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}
                                      disabled={paymentScreenshot !== null}
                                      className="w-full border rounded px-3 py-2 disabled:bg-gray-100 disabled:cursor-not-allowed">
                                <option value="paynow">PayNow (Singapore)</option>
                                <option value="credit_card">Credit Card</option>
                                <option value="bank_transfer">Bank Transfer</option>
                                <option value="paypal">PayPal</option>
                              </select>
                              {paymentScreenshot && (
                                <p className="text-xs text-orange-600 mt-1">
                                  ⚠️ Payment method locked after screenshot upload
                                </p>
                              )}
                            </div>

                            {/* PayNow QR Code */}
                            {paymentMethod === 'paynow' && (
                              <div className="mb-4 p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border-2 border-purple-200">
                                <h3 className="font-bold text-center mb-3 text-purple-800 text-sm">Scan to Pay with PayNow</h3>
                                <div className="bg-white p-3 rounded-lg shadow-lg">
                                  <img 
                                    src="/paynow-qr.jpeg" 
                                    alt="PayNow QR Code" 
                                    className="w-full h-auto mx-auto max-w-[200px]"
                                  />
                                </div>
                                <div className="mt-3 text-center">
                                  <p className="text-sm font-semibold text-purple-800">UEN: 199402129H</p>
                                  <p className="text-xs text-gray-600 mt-1">TM Fouzy Travel & Tours Pte Ltd</p>
                                  <p className="text-xs text-gray-500 mt-2">Scan QR code with your banking app</p>
                                </div>
                                <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded">
                                  <p className="text-xs text-yellow-800">
                                    ⚠️ After payment, please upload screenshot below
                                  </p>
                                </div>
                              </div>
                            )}

                            <div className="mb-3">
                              <label className="block text-sm font-medium mb-1">Payment Amount (Balance: ${booking.balance_amount})</label>
                              <input type="number" min="0" max={booking.balance_amount} step="0.01"
                                     value={paymentAmount} onChange={(e) => setPaymentAmount(e.target.value)}
                                     disabled={paymentScreenshot !== null}
                                     className="w-full border rounded px-3 py-2 disabled:bg-gray-100 disabled:cursor-not-allowed" placeholder="0.00" />
                              {paymentScreenshot && (
                                <p className="text-xs text-orange-600 mt-1">
                                  ⚠️ Amount locked after screenshot upload
                                </p>
                              )}
                            </div>

                            {/* Payment Screenshot Upload */}
                            {paymentMethod === 'paynow' && (
                              <div className="mb-4">
                                <label className="block text-sm font-medium mb-2">
                                  Payment Screenshot <span className="text-red-500">*</span>
                                </label>
                                
                                <input 
                                  type="file" 
                                  accept="image/*,.pdf"
                                  onChange={(e) => setPaymentScreenshot(e.target.files[0])}
                                  className="w-full border rounded px-3 py-2"
                                  required
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                  Upload payment screenshot (JPG, PNG, PDF - Max 5MB)
                                </p>
                                {paymentScreenshot && (
                                  <p className="text-xs text-green-600 mt-1">
                                    ✓ File selected: {paymentScreenshot.name}
                                  </p>
                                )}
                              </div>
                            )}

                            <div className="flex gap-2">
                              <button 
                                onClick={handleAddPayment} 
                                disabled={paymentLoading}
                                className="flex-1 bg-primary text-white py-2 rounded hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed">
                                {paymentLoading ? 'Processing...' : paymentMethod === 'paynow' ? 'Confirm Payment' : 'Submit Payment'}
                              </button>
                              <button onClick={() => {
                                setSelectedBooking(null);
                                setPaymentAmount('');
                                setPaymentScreenshot(null);
                              }} className="flex-1 border py-2 rounded hover:bg-gray-100">
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button onClick={() => setSelectedBooking(booking)} className="w-full bg-primary text-white py-2 rounded hover:bg-secondary">
                            Make Payment
                          </button>
                        )}
                      </div>
                    )}

                    {booking.payments && booking.payments.length > 0 && (
                      <div className="border-t pt-4 mt-4">
                        <h4 className="font-bold mb-2">Payment History</h4>
                        <div className="space-y-2">
                          {booking.payments.map(payment => (
                            <div key={payment.id} className="flex justify-between items-center text-sm p-3 bg-gray-50 rounded-lg">
                              <div className="flex-1">
                                <p className="font-semibold">{payment.payment_number}</p>
                                <p className="text-xs text-gray-600">
                                  {new Date(payment.created_at).toLocaleDateString('en-US', { 
                                    year: 'numeric', 
                                    month: 'long', 
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </p>
                                <p className="text-xs text-gray-600">{payment.payment_method_display}</p>
                              </div>
                              <div className="text-right">
                                <p className="font-bold text-green-600">${payment.amount}</p>
                                <button 
                                  onClick={() => window.open(`https://Tmfauwaz.pythonanywhere.com/api/payments/${payment.id}/receipt/?email=${email}`, '_blank')}
                                  className="mt-1 text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded transition-all">
                                  Download Receipt (PDF)
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                      </div>
                    )}
                  </div>
                  );
                })}
              </div>
            )}
              </div>
            )}

            {/* Shop Orders Tab */}
            {activeTab === 'shop-orders' && (
              <div>
                <h2 className="text-2xl font-bold mb-4">Shop Orders</h2>
                
                {itemOrders.length === 0 ? (
                  <div className="bg-white rounded-lg shadow p-8 text-center">
                    <p className="text-gray-500 mb-4">No shop orders found</p>
                    <button 
                      onClick={() => navigate('shop')}
                      className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg">
                      Browse Shop
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {itemOrders.map(order => {
                      const isExpanded = expandedOrders[order.id];
                      
                      return (
                      <div key={order.id} className="bg-white rounded-lg shadow">
                        {/* Order Header - Always Visible */}
                        <div 
                          className="p-6 cursor-pointer hover:bg-gray-50 transition-colors"
                          onClick={() => toggleOrder(order.id)}
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center gap-3">
                                <h3 className="text-xl font-bold">Order #{order.order_number}</h3>
                                <span className={`inline-block px-3 py-1 rounded text-sm ${
                                  order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                                  order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                                  order.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                                  order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  {order.status.toUpperCase()}
                                </span>
                              </div>
                              <p className="text-gray-600 text-sm mt-1">
                                {new Date(order.created_at).toLocaleDateString('en-US', { 
                                  year: 'numeric', 
                                  month: 'long', 
                                  day: 'numeric' 
                                })}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-gray-600">Total</p>
                              <p className="text-2xl font-bold text-green-600">${order.total_amount}</p>
                              <button className="mt-2 text-primary hover:text-secondary transition-colors">
                                {isExpanded ? '▲ Collapse' : '▼ Expand'}
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Order Details - Collapsible */}
                        {isExpanded && (
                          <div className="px-6 pb-6 border-t">
                            {/* Order Items */}
                            <div className="pt-4">
                              <h4 className="font-bold mb-3">Items</h4>
                              <div className="space-y-3">
                                {order.items && order.items.map(item => (
                                  <div key={item.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded">
                                    {item.item_image && (
                                      <img src={item.item_image} alt={item.item_name} className="w-16 h-16 object-cover rounded" />
                                    )}
                                    <div className="flex-1">
                                      <p className="font-semibold">{item.item_name}</p>
                                      <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                                    </div>
                                    <div className="text-right">
                                      <p className="font-bold">${item.subtotal}</p>
                                      <p className="text-xs text-gray-500">${item.price} each</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Shipping Info */}
                            {order.shipping_address && (
                              <div className="border-t pt-4 mt-4">
                                <h4 className="font-bold mb-2">Shipping Address</h4>
                                <p className="text-sm text-gray-600">{order.shipping_address}</p>
                                {order.shipping_unit && <p className="text-sm text-gray-600">Unit: {order.shipping_unit}</p>}
                                {order.shipping_postal && <p className="text-sm text-gray-600">Postal Code: {order.shipping_postal}</p>}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerPortal;
