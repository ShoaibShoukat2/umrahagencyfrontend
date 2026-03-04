import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { useCart } from '../context/CartContext';
import { api } from '../api';

const ShoppingCart = ({ navigate }) => {
  const { cartItems, removeFromCart, updateQuantity, clearCart, getCartTotal } = useCart();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('paynow');
  const [paymentScreenshot, setPaymentScreenshot] = useState(null);
  const [screenshotUploaded, setScreenshotUploaded] = useState(false);
  const [user, setUser] = useState(null);
  const [discountCode, setDiscountCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(null);
  const [discountLoading, setDiscountLoading] = useState(false);
  const [shippingInfo, setShippingInfo] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    unit: '',
    postal_code: ''
  });

  const getFinalTotal = () => {
    const total = getCartTotal();
    if (appliedDiscount) {
      return total - parseFloat(appliedDiscount.discount_amount);
    }
    return total;
  };

  const handleApplyDiscount = async () => {
    if (!discountCode.trim()) {
      alert('Please enter a discount code');
      return;
    }

    setDiscountLoading(true);
    try {
      const result = await api.validateDiscountCode(discountCode.toUpperCase(), getCartTotal().toFixed(2));
      
      if (result.valid) {
        setAppliedDiscount(result);
        alert(`Discount applied! You save $${result.discount_amount}`);
      } else if (result.error) {
        alert(result.error);
      }
    } catch (error) {
      console.error('Discount validation error:', error);
      alert('Error validating discount code');
    } finally {
      setDiscountLoading(false);
    }
  };

  const handleRemoveDiscount = () => {
    setAppliedDiscount(null);
    setDiscountCode('');
  };

  useEffect(() => {
    // Check if user is logged in
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      setUser(userData);
      // Pre-fill shipping info from user data
      setShippingInfo({
        name: userData.name || '',
        email: userData.email || '',
        phone: userData.phone || '',
        address: userData.address || '',
        unit: '',
        postal_code: userData.postal_code || ''
      });
    }
  }, []);

  const handleCheckout = async () => {
    // Check if user is logged in
    if (!user) {
      if (window.confirm('You need to login to place an order. Would you like to login now?')) {
        navigate('login');
      }
      return;
    }

    if (cartItems.length === 0) {
      alert('Your cart is empty!');
      return;
    }

    if (!shippingInfo.name || !shippingInfo.email || !shippingInfo.phone || !shippingInfo.address || !shippingInfo.postal_code) {
      alert('Please fill in all required shipping information');
      return;
    }

    // Check for screenshot if PayNow is selected
    if (paymentMethod === 'paynow' && !paymentScreenshot) {
      alert('Please upload payment screenshot for PayNow payment');
      return;
    }

    setIsCheckingOut(true);

    try {
      // Create order
      const orderData = {
        customer_email: user.email,
        items: cartItems.map(item => ({
          item_id: item.id,
          quantity: item.quantity,
          price: item.price
        })),
        shipping_info: shippingInfo,
        payment_method: paymentMethod,
        payment_screenshot: paymentScreenshot,
        total_amount: getFinalTotal(),
        discount_code: appliedDiscount ? appliedDiscount.code : null,
        discount_amount: appliedDiscount ? appliedDiscount.discount_amount : 0
      };

      // Call API to create order
      const result = await api.createItemOrder(orderData);
      
      console.log('Order created:', result);
      
      // Navigate to success page
      navigate('success', {
        orderData: {
          order_number: result.order_number,
          total_amount: result.total_amount,
          payment_method: paymentMethod
        }
      });
      clearCart();
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Error placing order. Please try again.');
      // Reset screenshot state on error
      setScreenshotUploaded(false);
      setPaymentScreenshot(null);
    } finally {
      setIsCheckingOut(false);
    }
  };

  return (
    <div>
      <Navbar navigate={navigate} />
      
      <div className="max-w-7xl mx-auto px-4 py-20 md:py-24">
        <h1 className="text-3xl md:text-4xl font-bold mb-6 md:mb-8 animate-slide-down">
          Shopping Cart <span className="text-primary">🛒</span>
        </h1>

        {cartItems.length === 0 ? (
          <div className="text-center py-12 md:py-20 animate-scale-in">
            <div className="text-6xl md:text-8xl mb-4 md:mb-6">🛒</div>
            <h2 className="text-2xl md:text-3xl font-bold mb-3 md:mb-4 text-gray-700">Your cart is empty</h2>
            <p className="text-gray-500 mb-6 md:mb-8 text-sm md:text-base">Add some travel essentials to get started!</p>
            <button 
              onClick={() => navigate('landing')}
              className="bg-primary text-white px-6 md:px-8 py-3 rounded-full font-bold hover:bg-secondary transform hover:scale-105 transition-all shadow-lg text-sm md:text-base">
              Continue Shopping
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-3 md:space-y-4">
              {cartItems.map((item, index) => (
                <div 
                  key={item.id} 
                  className="bg-white rounded-xl md:rounded-2xl shadow-lg p-4 md:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4 md:gap-6 animate-scale-in hover:shadow-xl transition-all"
                  style={{animationDelay: `${index * 0.1}s`}}>
                  <div className="w-20 h-20 md:w-24 md:h-24 bg-gradient-to-br from-green-100 to-green-200 rounded-xl flex items-center justify-center flex-shrink-0">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover rounded-xl" />
                    ) : (
                      <span className="text-3xl md:text-4xl">📦</span>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg md:text-xl font-bold mb-1 md:mb-2 truncate">{item.name}</h3>
                    <p className="text-xl md:text-2xl font-bold text-primary">${item.price}</p>
                  </div>

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 md:gap-4 w-full sm:w-auto">
                    <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-2">
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-8 h-8 bg-white rounded-lg font-bold hover:bg-primary hover:text-white transition-all text-sm md:text-base">
                        -
                      </button>
                      <span className="w-10 md:w-12 text-center font-bold text-sm md:text-base">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-8 h-8 bg-white rounded-lg font-bold hover:bg-primary hover:text-white transition-all text-sm md:text-base">
                        +
                      </button>
                    </div>

                    <button 
                      onClick={() => removeFromCart(item.id)}
                      className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-all">
                      <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>

                    <div className="text-right sm:min-w-[100px]">
                      <p className="text-xs md:text-sm text-gray-500">Subtotal</p>
                      <p className="text-xl md:text-2xl font-bold text-primary">${(parseFloat(item.price) * item.quantity).toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              ))}

              <button 
                onClick={clearCart}
                className="w-full border-2 border-red-300 text-red-600 py-3 rounded-lg font-semibold hover:bg-red-50 transition-all text-sm md:text-base">
                Clear Cart
              </button>
            </div>

            {/* Checkout Section */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-xl p-6 sticky top-24 animate-scale-in">
                <h2 className="text-2xl font-bold mb-6">Order Summary</h2>
                
                {/* Login Prompt if not logged in */}
                {!user && (
                  <div className="mb-6 p-4 bg-yellow-50 border-2 border-yellow-200 rounded-lg">
                    <p className="text-sm font-semibold text-yellow-800 mb-2">⚠️ Login Required</p>
                    <p className="text-xs text-yellow-700 mb-3">Please login to place your order</p>
                    <button 
                      onClick={() => navigate('login')}
                      className="w-full bg-primary text-white py-2 rounded-lg font-semibold hover:bg-secondary transition-all text-sm">
                      Login Now
                    </button>
                    <button 
                      onClick={() => navigate('register')}
                      className="w-full mt-2 border border-primary text-primary py-2 rounded-lg font-semibold hover:bg-green-50 transition-all text-sm">
                      Create Account
                    </button>
                  </div>
                )}
                
                {/* Discount Code Section */}
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <label className="block text-sm font-medium mb-2">Discount Code</label>
                  {!appliedDiscount ? (
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        value={discountCode}
                        onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
                        placeholder="Enter code"
                        disabled={!user}
                        className="flex-1 border rounded px-3 py-2 uppercase text-sm"
                      />
                      <button 
                        onClick={handleApplyDiscount}
                        disabled={discountLoading || !user}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded font-semibold disabled:opacity-50 text-sm">
                        {discountLoading ? 'Checking...' : 'Apply'}
                      </button>
                    </div>
                  ) : (
                    <div className="bg-green-50 border border-green-200 rounded p-3">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-semibold text-green-800 text-sm">{appliedDiscount.code}</p>
                          <p className="text-xs text-green-600">-${appliedDiscount.discount_amount} discount applied</p>
                        </div>
                        <button 
                          onClick={handleRemoveDiscount}
                          className="text-red-600 hover:text-red-800 text-xs font-semibold">
                          Remove
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-3 mb-6 pb-6 border-b">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal ({cartItems.reduce((sum, item) => sum + item.quantity, 0)} items)</span>
                    <span className="font-bold">${getCartTotal().toFixed(2)}</span>
                  </div>
                  {appliedDiscount && (
                    <div className="flex justify-between text-green-600">
                      <span className="font-medium">Discount ({appliedDiscount.code})</span>
                      <span className="font-bold">-${appliedDiscount.discount_amount}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-bold text-green-600">FREE</span>
                  </div>
                </div>

                <div className="flex justify-between mb-6 text-xl font-bold">
                  <span>Total</span>
                  <span className="text-primary">${getFinalTotal().toFixed(2)}</span>
                </div>

                {user && (
                  <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm font-semibold text-green-800">✓ Logged in as</p>
                    <p className="text-xs text-green-700">{user.email}</p>
                  </div>
                )}

                <div className="space-y-4 mb-6">
                  <h3 className="font-bold">Shipping Information</h3>
                  
                  <input 
                    type="text" 
                    placeholder="Full Name *"
                    value={shippingInfo.name}
                    onChange={(e) => setShippingInfo({...shippingInfo, name: e.target.value})}
                    disabled={!user}
                    className="w-full border rounded-lg px-4 py-3" 
                    required 
                  />
                  
                  <input 
                    type="email" 
                    placeholder="Email *"
                    value={shippingInfo.email}
                    onChange={(e) => setShippingInfo({...shippingInfo, email: e.target.value})}
                    disabled={!user}
                    className="w-full border rounded-lg px-4 py-3" 
                    required 
                  />
                  
                  <input 
                    type="tel" 
                    placeholder="Phone *"
                    value={shippingInfo.phone}
                    onChange={(e) => setShippingInfo({...shippingInfo, phone: e.target.value})}
                    disabled={!user}
                    className="w-full border rounded-lg px-4 py-3" 
                    required 
                  />
                  
                  <textarea 
                    placeholder="Address *"
                    value={shippingInfo.address}
                    onChange={(e) => setShippingInfo({...shippingInfo, address: e.target.value})}
                    disabled={!user}
                    className="w-full border rounded-lg px-4 py-3" 
                    rows="2"
                    required 
                  />
                  
                  <input 
                    type="text" 
                    placeholder="Unit Number"
                    value={shippingInfo.unit}
                    onChange={(e) => setShippingInfo({...shippingInfo, unit: e.target.value})}
                    disabled={!user}
                    className="w-full border rounded-lg px-4 py-3" 
                  />
                  
                  <input 
                    type="text" 
                    placeholder="Postal Code *"
                    value={shippingInfo.postal_code}
                    onChange={(e) => setShippingInfo({...shippingInfo, postal_code: e.target.value})}
                    disabled={!user}
                    className="w-full border rounded-lg px-4 py-3" 
                    required 
                  />
                </div>

                {/* Payment Method */}
                <div className="mb-6">
                  <h3 className="font-bold mb-3">Payment Method</h3>
                  <select 
                    value={paymentMethod} 
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full border rounded-lg px-4 py-3">
                    <option value="paynow">PayNow (Singapore)</option>
                    <option value="credit_card">Credit Card</option>
                    <option value="bank_transfer">Bank Transfer</option>
                  </select>
                </div>

                {/* PayNow QR Code */}
                {paymentMethod === 'paynow' && (
                  <div className="mb-6 p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border-2 border-purple-200">
                    <h3 className="font-bold text-center mb-3 text-purple-800 text-sm">Scan to Pay with PayNow</h3>
                    <div className="bg-white p-3 rounded-lg shadow-lg">
                      <img 
                        src="/paynow-qr.jpeg" 
                        alt="PayNow QR Code" 
                        className="w-full h-auto mx-auto"
                      />
                    </div>
                    <div className="mt-3 text-center">
                      <p className="text-sm font-semibold text-purple-800">Amount to Pay: ${getFinalTotal().toFixed(2)}</p>
                      <p className="text-sm font-semibold text-purple-800 mt-1">UEN: 199402129H</p>
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

                {/* Payment Screenshot Upload */}
                {paymentMethod === 'paynow' && (
                  <div className="mb-6">
                    <label className="block text-sm font-medium mb-2">
                      Payment Screenshot <span className="text-red-500">*</span>
                    </label>
                    
                    <input 
                      type="file" 
                      accept="image/*,.pdf"
                      onChange={(e) => setPaymentScreenshot(e.target.files[0])}
                      className="w-full border rounded-lg px-4 py-3 text-sm"
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

                <button 
                  onClick={handleCheckout}
                  disabled={isCheckingOut}
                  className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-4 rounded-full font-bold hover:from-green-600 hover:to-green-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed">
                  {isCheckingOut ? 'Processing...' : paymentMethod === 'paynow' ? 'Confirm Order' : 'Place Order'}
                </button>

                <button 
                  onClick={() => navigate('landing')}
                  className="w-full mt-4 border-2 border-gray-300 text-gray-700 py-3 rounded-full font-semibold hover:bg-gray-50 transition-all">
                  Continue Shopping
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShoppingCart;
