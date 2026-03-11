import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { api } from '../api';

const CheckoutPage = ({ navigate, packageData, bookingData }) => {
  const [pkg, setPkg] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('credit_card');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentType, setPaymentType] = useState('deposit');
  const [paymentScreenshot, setPaymentScreenshot] = useState(null);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [discountCode, setDiscountCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(null);
  const [discountLoading, setDiscountLoading] = useState(false);

  useEffect(() => {
    // Check if user is logged in
    const savedUser = localStorage.getItem('user');
    if (!savedUser) {
      alert('Please login to continue with booking');
      navigate('login');
      return;
    }
    setUser(JSON.parse(savedUser));
    loadPackage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadPackage = async () => {
    try {
      const data = await api.getPackageBySlug(packageData.slug);
      setPkg(data);
      // Calculate deposit based on number of passengers
      const totalPax = getTotalPax();
      const depositAmount = parseFloat(data.min_deposit_amount) * totalPax;
      setPaymentAmount(depositAmount.toFixed(2));
    } catch (error) {
      console.error('Error loading package:', error);
    }
  };

  const getTotalPax = () => {
    let total = 0;
    bookingData.rooms.forEach(room => {
      total += (room.num_adults || 0) + (room.num_children || 0) + (room.num_infants || 0);
    });
    return total;
  };

  const getMinimumDeposit = () => {
    if (!pkg) return 0;
    const totalPax = getTotalPax();
    return (parseFloat(pkg.min_deposit_amount) * totalPax).toFixed(2);
  };

  const calculateTotal = () => {
    if (!pkg) return 0;
    
    let total = 0;
    
    // Calculate room costs
    bookingData.rooms.forEach(room => {
      const roomPrice = pkg.room_prices.find(rp => rp.sharing_type === room.sharing_type);
      if (roomPrice) {
        // Handle missing keys with defaults
        const numAdults = room.num_adults || 0;
        const numChildren = room.num_children || 0;
        const numInfants = room.num_infants || 0;
        const numPeople = numAdults + numChildren + numInfants;
        
        total += parseFloat(roomPrice.price) * numPeople;
      }
    });
    
    // Calculate addon costs
    bookingData.addons?.forEach(addon => {
      total += parseFloat(addon.price) * addon.quantity;
    });
    
    return total.toFixed(2);
  };

  const getFinalTotal = () => {
    const total = parseFloat(calculateTotal());
    if (appliedDiscount) {
      return (total - appliedDiscount.discount_amount).toFixed(2);
    }
    return total.toFixed(2);
  };

  const handleApplyDiscount = async () => {
    if (!discountCode.trim()) {
      alert('Please enter a discount code');
      return;
    }

    setDiscountLoading(true);
    try {
      const result = await api.validateDiscountCode(discountCode.toUpperCase(), calculateTotal());
      
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

  const handleSubmit = async () => {
    if (!paymentAmount || parseFloat(paymentAmount) <= 0) {
      alert('Please enter a valid payment amount');
      return;
    }

    // Check for screenshot if PayNow is selected
    if (paymentMethod === 'paynow' && !paymentScreenshot) {
      alert('Please upload payment screenshot for PayNow payment');
      return;
    }

    const total = parseFloat(getFinalTotal());
    const amount = parseFloat(paymentAmount);
    const minDeposit = parseFloat(getMinimumDeposit());

    // Minimum deposit is per pax
    if (amount < minDeposit) {
      alert(`Minimum deposit amount is $${minDeposit} (${pkg.min_deposit_amount} per pax × ${getTotalPax()} pax)`);
      return;
    }

    if (amount > total) {
      alert('Payment amount cannot exceed total amount');
      return;
    }

    setLoading(true);

    try {
      // Use logged-in user's email for booking
      const contactInfoWithUserEmail = {
        ...bookingData.contactInfo,
        email: user.email  // Override with logged-in user's email
      };

      const bookingPayload = {
        package_id: pkg.id,
        rooms: bookingData.rooms,
        contact_info: contactInfoWithUserEmail,
        emergency_contact: bookingData.emergencyContact,
        passengers: bookingData.passengers,
        addons: bookingData.addons || [],
        payment_amount: amount,
        payment_method: paymentMethod,
        payment_screenshot: paymentScreenshot,
        discount_code: appliedDiscount ? appliedDiscount.code : null
      };

      console.log('=== CHECKOUT DEBUG ===');
      console.log('Booking payload rooms:', bookingPayload.rooms);
      console.log('Number of rooms:', bookingPayload.rooms.length);
      console.log('Number of passengers:', bookingPayload.passengers.length);

      const result = await api.createBooking(bookingPayload);
      
      // Navigate to success page with order data
      navigate('success', { 
        orderData: {
          booking_number: result.booking_number,
          total_amount: total,
          payment_method: paymentMethod
        }
      });
    } catch (error) {
      console.error('Booking error:', error);
      alert('Booking failed. Please try again.');
      // Reset screenshot state on error so user can try again
      setPaymentScreenshot(null);
    } finally {
      setLoading(false);
    }
  };

  if (!pkg) return <div>Loading...</div>;

  const total = calculateTotal();

  return (
    <div>
      <Navbar navigate={navigate} />
      
      <div className="max-w-6xl mx-auto px-4 py-8 pt-24 md:pt-28">
        <div className="flex items-center gap-4 mb-8">
          <button 
            onClick={() => navigate('addons', { packageData, bookingData })}
            className="flex items-center gap-2 text-gray-600 hover:text-primary transition-all">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="font-semibold">Back</span>
          </button>
          <h1 className="text-3xl font-bold">Checkout & Summary</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Summary */}
          <div className="lg:col-span-2 space-y-6">
            {/* Package Summary */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold mb-4">Package Details</h2>
              <div className="flex items-start gap-4">
                {pkg.featured_image && (
                  <img src={pkg.featured_image} alt={pkg.name} className="w-32 h-32 object-cover rounded" />
                )}
                <div>
                  <h3 className="font-bold text-lg">{pkg.name}</h3>
                  <p className="text-gray-600">{pkg.location}</p>
                  <p className="text-gray-600">{new Date(pkg.travel_date).toLocaleDateString()} - {new Date(pkg.return_date).toLocaleDateString()}</p>
                  <p className="text-gray-600">{pkg.duration_days}D/{pkg.duration_nights}N</p>
                </div>
              </div>
            </div>

            {/* Rooms Summary */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold mb-4">Rooms</h2>
              {bookingData.rooms.map(room => {
                const roomPrice = pkg.room_prices.find(rp => rp.sharing_type === room.sharing_type);
                // Handle missing keys with defaults
                const numAdults = room.num_adults || 0;
                const numChildren = room.num_children || 0;
                const numInfants = room.num_infants || 0;
                const numPeople = numAdults + numChildren + numInfants;
                const subtotal = roomPrice ? parseFloat(roomPrice.price) * numPeople : 0;
                
                return (
                  <div key={room.room_number} className="mb-4 pb-4 border-b last:border-b-0">
                    <div className="flex justify-between">
                      <div>
                        <p className="font-bold">Room {room.room_number} - {roomPrice?.sharing_type_display}</p>
                        <p className="text-sm text-gray-600">
                          {numAdults} Adult(s), {numChildren} Child(ren), {numInfants} Infant(s)
                        </p>
                      </div>
                      <p className="font-bold">${subtotal.toFixed(2)}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Passengers Summary */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold mb-4">Passengers</h2>
              {bookingData.rooms.map(room => {
                const roomPassengers = bookingData.passengers.filter(p => p.room_number === room.room_number);
                return (
                  <div key={room.room_number} className="mb-4">
                    <h3 className="font-bold mb-2">Room {room.room_number}</h3>
                    <ul className="space-y-1">
                      {roomPassengers.map((p, idx) => (
                        <li key={idx} className="text-sm text-gray-700">
                          {p.name} ({p.type}) - {p.gender}
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>

            {/* Add-ons Summary */}
            {bookingData.addons && bookingData.addons.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold mb-4">Add-ons</h2>
                {bookingData.addons.map((addon, idx) => (
                  <div key={idx} className="flex justify-between mb-2">
                    <span>{addon.addon_name} x {addon.quantity}</span>
                    <span className="font-bold">${(parseFloat(addon.price) * addon.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Contact Information */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold mb-4">Contact Information</h2>
              <div className="space-y-2 text-sm">
                <p><span className="font-medium">Name:</span> {bookingData.contactInfo.name}</p>
                <p><span className="font-medium">Email:</span> {bookingData.contactInfo.email}</p>
                <p><span className="font-medium">Phone:</span> {bookingData.contactInfo.phone}</p>
                <p><span className="font-medium">Address:</span> {bookingData.contactInfo.address}</p>
                <p><span className="font-medium">Emergency Contact:</span> {bookingData.emergencyContact.name} ({bookingData.emergencyContact.relationship}) - {bookingData.emergencyContact.phone}</p>
              </div>
            </div>
          </div>

          {/* Payment Section */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-6 sticky top-20">
              <h2 className="text-xl font-bold mb-4">Payment</h2>
              
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
                      className="flex-1 border rounded px-3 py-2 uppercase"
                    />
                    <button 
                      onClick={handleApplyDiscount}
                      disabled={discountLoading}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded font-semibold disabled:opacity-50">
                      {discountLoading ? 'Checking...' : 'Apply'}
                    </button>
                  </div>
                ) : (
                  <div className="bg-green-50 border border-green-200 rounded p-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-semibold text-green-800">{appliedDiscount.code}</p>
                        <p className="text-sm text-green-600">-${appliedDiscount.discount_amount} discount applied</p>
                      </div>
                      <button 
                        onClick={handleRemoveDiscount}
                        className="text-red-600 hover:text-red-800 text-sm font-semibold">
                        Remove
                      </button>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="mb-6">
                <div className="flex justify-between mb-2">
                  <span className="font-medium">Subtotal:</span>
                  <span className="text-lg font-bold">${total}</span>
                </div>
                {appliedDiscount && (
                  <div className="flex justify-between mb-2 text-green-600">
                    <span className="font-medium">Discount:</span>
                    <span className="font-bold">-${appliedDiscount.discount_amount}</span>
                  </div>
                )}
                <div className="flex justify-between mb-2 pt-2 border-t">
                  <span className="font-medium">Total Amount:</span>
                  <span className="text-2xl font-bold text-primary">${getFinalTotal()}</span>
                </div>
                <div className="text-sm text-gray-600 mb-2">
                  Minimum Deposit: ${getMinimumDeposit()} ({pkg.min_deposit_amount} per pax × {getTotalPax()} pax)
                </div>
              </div>

              {/* Payment Policy Information */}
              <div className="mb-6 p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
                <h3 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  Payment Policy
                </h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Minimum deposit: <strong>${getMinimumDeposit()}</strong> (${pkg.min_deposit_amount} per pax) to confirm booking</li>
                  <li>• Pay any amount anytime after deposit</li>
                  <li>• Full payment required <strong>1 month before travel date</strong></li>
                  <li>• Additional payments can be made in Customer Portal</li>
                </ul>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Payment Type</label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input type="radio" name="paymentType" value="deposit" checked={paymentType === 'deposit'}
                           onChange={(e) => { setPaymentType(e.target.value); setPaymentAmount(getMinimumDeposit()); }}
                           disabled={paymentScreenshot !== null}
                           className="mr-2 disabled:cursor-not-allowed" />
                    <span className={paymentScreenshot !== null ? 'text-gray-400' : ''}>Deposit (${getMinimumDeposit()})</span>
                  </label>
                  <label className="flex items-center">
                    <input type="radio" name="paymentType" value="full" checked={paymentType === 'full'}
                           onChange={(e) => { setPaymentType(e.target.value); setPaymentAmount(getFinalTotal()); }}
                           disabled={paymentScreenshot !== null}
                           className="mr-2 disabled:cursor-not-allowed" />
                    <span className={paymentScreenshot !== null ? 'text-gray-400' : ''}>Pay in Full (${getFinalTotal()})</span>
                  </label>
                  <label className="flex items-center">
                    <input type="radio" name="paymentType" value="custom" checked={paymentType === 'custom'}
                           onChange={(e) => setPaymentType(e.target.value)}
                           disabled={paymentScreenshot !== null}
                           className="mr-2 disabled:cursor-not-allowed" />
                    <span className={paymentScreenshot !== null ? 'text-gray-400' : ''}>Custom Amount (Min ${getMinimumDeposit()})</span>
                  </label>
                </div>
                {paymentScreenshot && (
                  <p className="text-xs text-orange-600 mt-2">
                    ⚠️ Payment type locked after screenshot upload
                  </p>
                )}
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Payment Amount</label>
                <input type="number" min={getMinimumDeposit()} max={total} step="0.01" value={paymentAmount}
                       onChange={(e) => {
                         const value = parseFloat(e.target.value);
                         const minDeposit = parseFloat(getMinimumDeposit());
                         if (value < minDeposit && e.target.value !== '') {
                           alert(`Minimum payment amount is $${minDeposit} (${pkg.min_deposit_amount} per pax × ${getTotalPax()} pax)`);
                           setPaymentAmount(getMinimumDeposit());
                         } else {
                           setPaymentAmount(e.target.value);
                         }
                       }}
                       onBlur={(e) => {
                         const value = parseFloat(e.target.value);
                         const minDeposit = parseFloat(getMinimumDeposit());
                         if (value < minDeposit && e.target.value !== '') {
                           setPaymentAmount(getMinimumDeposit());
                         }
                       }}
                       disabled={paymentScreenshot !== null}
                       className="w-full border rounded px-3 py-2 disabled:bg-gray-100 disabled:cursor-not-allowed" />
                {paymentScreenshot && (
                  <p className="text-xs text-orange-600 mt-1">
                    ⚠️ Amount locked after screenshot upload
                  </p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Minimum: ${getMinimumDeposit()} | Maximum: ${getFinalTotal()}
                </p>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Payment Method</label>
                <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}
                        className="w-full border rounded px-3 py-2">
                  <option value="paynow">PayNow (Singapore)</option>
                  <option value="credit_card">Credit Card</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="paypal">PayPal</option>
                </select>
              </div>

              {/* PayNow QR Code */}
              {paymentMethod === 'paynow' && (
                <div className="mb-6 p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border-2 border-purple-200">
                  <h3 className="font-bold text-center mb-3 text-purple-800">Scan to Pay with PayNow</h3>
                  <div className="bg-white p-3 rounded-lg shadow-lg">
                    <img 
                      src="/paynow-qr.jpeg" 
                      alt="PayNow QR Code" 
                      className="w-full h-auto mx-auto"
                    />
                  </div>
                  <div className="mt-3 text-center">
                    <p className="text-sm font-semibold text-purple-800">Amount to Pay: ${paymentAmount}</p>
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

              <button onClick={handleSubmit} disabled={loading}
                      className="w-full bg-primary text-white py-3 rounded-lg font-bold hover:bg-secondary disabled:bg-gray-400 disabled:cursor-not-allowed">
                {loading ? 'Processing...' : paymentMethod === 'paynow' ? 'Confirm Booking' : `Pay $${paymentAmount}`}
              </button>

              <p className="text-xs text-gray-500 mt-4 text-center">
                By completing this booking, you agree to our terms and conditions.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
