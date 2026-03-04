import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { api } from '../api';

const PackageDetailPage = ({ navigate, packageData, bookingData }) => {
  const [pkg, setPkg] = useState(null);
  const [rooms, setRooms] = useState([{ id: 1, sharing_type: '', num_adults: 0, num_child_no_bed: 0, num_infants: 0 }]);

  // Define max adults per room type
  const maxAdultsPerType = {
    'single': 1,
    'double': 2,
    'triple': 3,
    'quad': 4
  };

  // Calculate price for a single room
  const calculateRoomPrice = (room) => {
    if (!room.sharing_type || !pkg) return 0;
    
    const roomPrice = pkg.room_prices.find(rp => rp.sharing_type === room.sharing_type);
    if (!roomPrice) return 0;
    
    // Get the base price per person (room price is per person)
    const pricePerPerson = parseFloat(roomPrice.price);
    
    // Calculate prices
    const adultPrice = pricePerPerson * room.num_adults;
    const childNoBedPrice = (pricePerPerson * (pkg.child_no_bed_price_percentage / 100)) * room.num_child_no_bed;
    const infantPrice = (pricePerPerson * (pkg.infant_price_percentage / 100)) * room.num_infants;
    
    return adultPrice + childNoBedPrice + infantPrice;
  };

  // Calculate total price for all rooms
  const calculateTotalPrice = () => {
    return rooms.reduce((total, room) => total + calculateRoomPrice(room), 0);
  };

  useEffect(() => {
    if (packageData?.slug) {
      loadPackageDetails();
    }
  }, [packageData]);

  const loadPackageDetails = async () => {
    try {
      const data = await api.getPackageBySlug(packageData.slug);
      setPkg(data);
    } catch (error) {
      console.error('Error loading package:', error);
    }
  };

  const addRoom = () => {
    setRooms([...rooms, { id: rooms.length + 1, sharing_type: '', num_adults: 0, num_child_no_bed: 0, num_infants: 0 }]);
  };

  const removeRoom = (id) => {
    if (rooms.length > 1) {
      setRooms(rooms.filter(room => room.id !== id));
    }
  };

  const updateRoom = (id, field, value) => {
    setRooms(rooms.map(room => {
      if (room.id === id) {
        const updatedRoom = { ...room, [field]: value };
        
        // If sharing type changed, reset adults to 0
        if (field === 'sharing_type') {
          updatedRoom.num_adults = 0;
        }
        
        // Enforce max adults based on room type
        if (field === 'num_adults' && updatedRoom.sharing_type) {
          const maxAdults = maxAdultsPerType[updatedRoom.sharing_type] || 4;
          if (value > maxAdults) {
            alert(`${updatedRoom.sharing_type} room can only have maximum ${maxAdults} adult(s)`);
            updatedRoom.num_adults = maxAdults;
          }
        }
        
        return updatedRoom;
      }
      return room;
    }));
  };

  const handleNext = () => {
    // Check if user is logged in
    const savedUser = localStorage.getItem('user');
    if (!savedUser) {
      if (window.confirm('You need to login to continue booking. Would you like to login now?')) {
        navigate('login');
      }
      return;
    }

    const validRooms = rooms.filter(r => r.sharing_type && (r.num_adults > 0 || r.num_child_no_bed > 0 || r.num_infants > 0));
    
    console.log('=== BOOKING DEBUG ===');
    console.log('Total rooms in state:', rooms.length);
    console.log('All rooms:', rooms);
    console.log('Valid rooms:', validRooms.length);
    console.log('Valid rooms data:', validRooms);
    
    if (validRooms.length === 0) {
      alert('Please select at least one room with passengers');
      return;
    }
    
    const roomsWithNumbers = validRooms.map((r, i) => ({ ...r, room_number: i + 1 }));
    console.log('Rooms being sent to next page:', roomsWithNumbers);
    
    navigate('passengers', { bookingData: { ...bookingData, rooms: roomsWithNumbers } });
  };

  if (!pkg) return <div>Loading...</div>;

  return (
    <div>
      <Navbar navigate={navigate} />
      
      <div className="max-w-7xl mx-auto px-4 py-8 pt-24 md:pt-28">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {pkg.featured_image && (
              <img src={pkg.featured_image} alt={pkg.name} className="w-full h-96 object-cover rounded-lg mb-6" />
            )}
            
            <h1 className="text-4xl font-bold mb-4">{pkg.name}</h1>
            
            <div className="flex items-center gap-4 mb-6">
              <span className="bg-green-100 text-green-800 px-3 py-1 rounded">{pkg.category.name}</span>
              <span className="text-gray-600">📅 {new Date(pkg.travel_date).toLocaleDateString()} - {new Date(pkg.return_date).toLocaleDateString()}</span>
              <span className="text-gray-600">⏱️ {pkg.duration_days}D/{pkg.duration_nights}N</span>
              <span className="text-gray-600">📍 {pkg.location}</span>
            </div>

            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h2 className="text-2xl font-bold mb-4">Description</h2>
              <p className="text-gray-700 whitespace-pre-line">{pkg.description}</p>
            </div>

            {(pkg.hotel_name || pkg.hotel_country || pkg.hotel_star_rating) && (
              <div className="bg-gradient-to-r from-cyan-50 to-blue-50 rounded-lg shadow-lg p-6 mb-6 border-2 border-cyan-200">
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  🏨 Hotel Details
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {pkg.hotel_image && (
                    <div className="md:col-span-2">
                      <img src={pkg.hotel_image} alt={pkg.hotel_name || 'Hotel'} className="w-full h-64 object-cover rounded-lg shadow-md" />
                    </div>
                  )}
                  {pkg.hotel_name && (
                    <div className="bg-white p-4 rounded-lg shadow">
                      <p className="text-sm text-gray-600 mb-1">Hotel Name</p>
                      <p className="text-lg font-semibold text-gray-900">{pkg.hotel_name}</p>
                    </div>
                  )}
                  {pkg.hotel_star_rating && (
                    <div className="bg-white p-4 rounded-lg shadow">
                      <p className="text-sm text-gray-600 mb-1">Rating</p>
                      <p className="text-lg font-semibold text-yellow-600">
                        {'⭐'.repeat(pkg.hotel_star_rating)} {pkg.hotel_star_rating} Star{pkg.hotel_star_rating > 1 ? 's' : ''}
                      </p>
                    </div>
                  )}
                  {pkg.hotel_country && (
                    <div className="bg-white p-4 rounded-lg shadow md:col-span-2">
                      <p className="text-sm text-gray-600 mb-1">Location</p>
                      <p className="text-lg font-semibold text-gray-900">📍 {pkg.hotel_country}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {pkg.itinerary && (
              <div className="bg-white rounded-lg shadow p-6 mb-6">
                <h2 className="text-2xl font-bold mb-4">Itinerary</h2>
                <p className="text-gray-700 whitespace-pre-line">{pkg.itinerary}</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {pkg.inclusions && (
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-xl font-bold mb-4 text-green-600">✓ Inclusions</h2>
                  <p className="text-gray-700 whitespace-pre-line">{pkg.inclusions}</p>
                </div>
              )}
              
              {pkg.exclusions && (
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-xl font-bold mb-4 text-red-600">✗ Exclusions</h2>
                  <p className="text-gray-700 whitespace-pre-line">{pkg.exclusions}</p>
                </div>
              )}
            </div>

            {/* Complimentary Items/Gifts */}
            {pkg.complimentary_items && (
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg shadow-lg p-6 mb-6 border-2 border-purple-200">
                <h2 className="text-xl font-bold mb-4 text-purple-700 flex items-center gap-2">
                  <span>🎁</span>
                  <span>Complimentary Gifts</span>
                </h2>
                <p className="text-gray-800 whitespace-pre-line leading-relaxed">{pkg.complimentary_items}</p>
              </div>
            )}

            {pkg.images && pkg.images.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-2xl font-bold mb-4">Gallery</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {pkg.images.map(img => (
                    <img key={img.id} src={img.image} alt={img.caption} className="w-full h-48 object-cover rounded" />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Booking Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-6 sticky top-20">
              <h2 className="text-2xl font-bold mb-6">Book This Package</h2>
              
              <div className="mb-6">
                <h3 className="font-bold mb-3">Room Prices</h3>
                
                {/* Child and Infant Pricing Info */}
                <div className="bg-blue-50 p-3 rounded mb-3 text-sm">
                  <div className="flex justify-between py-1">
                    <span className="text-gray-700">Infant</span>
                    <span className="font-semibold text-gray-800">
                      ${(pkg.room_prices[0]?.price * (pkg.infant_price_percentage / 100)).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-gray-700">Child (No Bed)</span>
                    <span className="font-semibold text-gray-800">
                      ${(pkg.room_prices[0]?.price * (pkg.child_no_bed_price_percentage / 100)).toFixed(2)}
                    </span>
                  </div>
                </div>
                
                {/* Adult Room Prices */}
                {pkg.room_prices.filter(rp => rp.available).map(rp => (
                  <div key={rp.id} className="flex justify-between py-2 border-b">
                    <span>{rp.sharing_type_display}</span>
                    <span className="font-bold">${rp.price}</span>
                  </div>
                ))}
              </div>

              {rooms.map((room, index) => {
                const roomPrice = calculateRoomPrice(room);
                const selectedRoomType = pkg.room_prices.find(rp => rp.sharing_type === room.sharing_type);
                
                return (
                <div key={room.id} className="mb-6 p-4 border rounded-lg bg-gray-50">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-bold">Room {index + 1}</h3>
                    {rooms.length > 1 && (
                      <button onClick={() => removeRoom(room.id)} className="text-red-500 text-sm hover:text-red-700">Remove</button>
                    )}
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium mb-1">Room Type</label>
                      <select value={room.sharing_type} onChange={(e) => updateRoom(room.id, 'sharing_type', e.target.value)}
                              className="w-full border rounded px-3 py-2">
                        <option value="">Select Type</option>
                        {pkg.room_prices.filter(rp => rp.available).map(rp => (
                          <option key={rp.id} value={rp.sharing_type}>{rp.sharing_type_display} - ${rp.price}/person</option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="block text-sm font-medium mb-1">Adults</label>
                        <input 
                          type="number" 
                          min="0" 
                          max={room.sharing_type ? maxAdultsPerType[room.sharing_type] : 4}
                          value={room.num_adults} 
                          onChange={(e) => updateRoom(room.id, 'num_adults', parseInt(e.target.value) || 0)}
                          className="w-full border rounded px-2 py-1" 
                          disabled={!room.sharing_type}
                        />
                        {room.sharing_type && (
                          <span className="text-xs text-gray-500">Max: {maxAdultsPerType[room.sharing_type]}</span>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Child (No Bed)</label>
                        <input type="number" min="0" value={room.num_child_no_bed}
                               onChange={(e) => updateRoom(room.id, 'num_child_no_bed', parseInt(e.target.value) || 0)}
                               className="w-full border rounded px-2 py-1" />
                        {room.sharing_type && (
                          <span className="text-xs text-gray-500">{pkg.child_no_bed_price_percentage}% of adult</span>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Infants</label>
                        <input type="number" min="0" value={room.num_infants}
                               onChange={(e) => updateRoom(room.id, 'num_infants', parseInt(e.target.value) || 0)}
                               className="w-full border rounded px-2 py-1" />
                        {room.sharing_type && (
                          <span className="text-xs text-gray-500">{pkg.infant_price_percentage}% of adult</span>
                        )}
                      </div>
                    </div>

                    {/* Price Breakdown */}
                    {room.sharing_type && (room.num_adults > 0 || room.num_child_no_bed > 0 || room.num_infants > 0) && (
                      <div className="mt-3 p-3 bg-white rounded border">
                        <div className="text-sm space-y-1">
                          {room.num_adults > 0 && (
                            <div className="flex justify-between">
                              <span>{room.num_adults} Adult(s) × ${selectedRoomType.price}</span>
                              <span className="font-semibold">${(selectedRoomType.price * room.num_adults).toFixed(2)}</span>
                            </div>
                          )}
                          {room.num_child_no_bed > 0 && (
                            <div className="flex justify-between text-blue-600">
                              <span>{room.num_child_no_bed} Child(ren) No Bed × ${(selectedRoomType.price * (pkg.child_no_bed_price_percentage / 100)).toFixed(2)}</span>
                              <span className="font-semibold">${(selectedRoomType.price * (pkg.child_no_bed_price_percentage / 100) * room.num_child_no_bed).toFixed(2)}</span>
                            </div>
                          )}
                          {room.num_infants > 0 && (
                            <div className="flex justify-between text-green-600">
                              <span>{room.num_infants} Infant(s) × ${(selectedRoomType.price * (pkg.infant_price_percentage / 100)).toFixed(2)}</span>
                              <span className="font-semibold">${(selectedRoomType.price * (pkg.infant_price_percentage / 100) * room.num_infants).toFixed(2)}</span>
                            </div>
                          )}
                          <div className="flex justify-between pt-2 border-t font-bold text-primary">
                            <span>Room Total:</span>
                            <span>${roomPrice.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )})}


              <button onClick={addRoom} className="w-full border-2 border-dashed border-gray-300 rounded-lg py-2 mb-4 hover:border-primary">
                + Add Another Room
              </button>

              {/* Total Price Summary */}
              {calculateTotalPrice() > 0 && (
                <div className="mb-4 p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg border-2 border-green-200">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-sm text-gray-600">Total Package Price</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {rooms.reduce((sum, r) => sum + r.num_adults, 0)} Adults, {' '}
                        {rooms.reduce((sum, r) => sum + r.num_child_no_bed, 0)} Child (No Bed), {' '}
                        {rooms.reduce((sum, r) => sum + r.num_infants, 0)} Infants
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-primary">${calculateTotalPrice().toFixed(2)}</div>
                      <div className="text-xs text-gray-600">for {rooms.length} room(s)</div>
                    </div>
                  </div>
                </div>
              )}

              <button onClick={handleNext} className="w-full bg-primary text-white py-3 rounded-lg font-bold hover:bg-secondary">
                Next: Passenger Details
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PackageDetailPage;
