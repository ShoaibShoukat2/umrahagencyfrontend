import React, { useState } from 'react';
import Navbar from '../components/Navbar';

const PassengerDetailsPage = ({ navigate, packageData, bookingData }) => {
  const [passengers, setPassengers] = useState(() => {
    const initial = [];
    bookingData.rooms.forEach(room => {
      for (let i = 0; i < room.num_adults; i++) {
        initial.push({ 
          room_number: room.room_number, 
          type: 'adult', 
          name: '', 
          phone: '', 
          dob: '', 
          gender: '', 
          passport_number: '', 
          passport_expiry: '', 
          passport_issue: '',
          passport_photo: null,
          photo_id: null
        });
      }
      const childCount = room.num_child_no_bed ?? room.num_children ?? 0;
      for (let i = 0; i < childCount; i++) {
        initial.push({ 
          room_number: room.room_number, 
          type: 'child', 
          name: '', 
          phone: '', 
          dob: '', 
          gender: '', 
          passport_number: '', 
          passport_expiry: '', 
          passport_issue: '',
          passport_photo: null,
          photo_id: null
        });
      }
      for (let i = 0; i < room.num_infants; i++) {
        initial.push({ 
          room_number: room.room_number, 
          type: 'infant', 
          name: '', 
          phone: '', 
          dob: '', 
          gender: '', 
          passport_number: '', 
          passport_expiry: '', 
          passport_issue: '',
          passport_photo: null,
          photo_id: null
        });
      }
    });
    return initial;
  });

  // Get logged-in user info
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const [selectedContactPerson, setSelectedContactPerson] = useState('');
  const [activeRoom, setActiveRoom] = useState(1); // Track which room accordion is open
  const [contactInfo, setContactInfo] = useState({
    name: user.name || '', 
    phone: user.phone || '', 
    email: user.email || '', 
    address: user.address || '', 
    unit: '', 
    postal_code: user.postal_code || ''
  });

  const [emergencyContact, setEmergencyContact] = useState({
    name: '', phone: '', relationship: ''
  });

  const handleContactPersonSelect = (index) => {
    if (index === '') {
      // Reset to user info
      setContactInfo({
        name: user.name || '', 
        phone: user.phone || '', 
        email: user.email || '', 
        address: user.address || '', 
        unit: '', 
        postal_code: user.postal_code || ''
      });
      setSelectedContactPerson('');
    } else {
      const passenger = passengers[parseInt(index)];
      setContactInfo({
        ...contactInfo,
        name: passenger.name,
        phone: passenger.phone
      });
      setSelectedContactPerson(index);
    }
  };

  const isRoomComplete = (roomNumber) => {
    const roomPassengers = passengers.filter(p => p.room_number === roomNumber);
    return roomPassengers.every(p => 
      p.name && p.phone && p.dob && p.gender && 
      p.passport_number && p.passport_expiry && p.passport_issue &&
      p.passport_photo && p.photo_id
    );
  };

  const handleRoomComplete = (roomNumber) => {
    if (isRoomComplete(roomNumber)) {
      // Move to next room if available
      const nextRoom = roomNumber + 1;
      if (nextRoom <= bookingData.rooms.length) {
        setActiveRoom(nextRoom);
      }
    } else {
      alert('Please fill in all passenger details for this room');
    }
  };

  const toggleRoom = (roomNumber) => {
    setActiveRoom(activeRoom === roomNumber ? null : roomNumber);
  };

  const updatePassenger = (index, field, value) => {
    const updated = [...passengers];
    updated[index][field] = value;
    setPassengers(updated);
  };

  const handleNext = () => {
    // Validation
    if (!contactInfo.name || !contactInfo.phone || !contactInfo.email || !contactInfo.address || !contactInfo.postal_code) {
      alert('Please fill in all contact information');
      return;
    }
    if (!emergencyContact.name || !emergencyContact.phone || !emergencyContact.relationship) {
      alert('Please fill in emergency contact information');
      return;
    }
    for (let p of passengers) {
      if (!p.name || !p.phone || !p.dob || !p.gender || !p.passport_number || !p.passport_expiry || !p.passport_issue) {
        alert('Please fill in all passenger details');
        return;
      }
      if (!p.passport_photo || !p.photo_id) {
        alert('Please upload passport photo and photo ID for all passengers');
        return;
      }
    }

    navigate('addons', { 
      bookingData: { 
        ...bookingData, 
        passengers, 
        contactInfo, 
        emergencyContact 
      } 
    });
  };

  const groupedPassengers = bookingData.rooms.map(room => ({
    room,
    passengers: passengers.filter(p => p.room_number === room.room_number)
  }));

  return (
    <div>
      <Navbar navigate={navigate} />
      
      <div className="max-w-4xl mx-auto px-4 py-8 pt-24 md:pt-28">
        <h1 className="text-3xl font-bold mb-8">Passenger Details</h1>

        {/* Passengers by Room - Accordion Style */}
        {groupedPassengers.map(({ room, passengers: roomPassengers }) => {
          const isOpen = activeRoom === room.room_number;
          const isComplete = isRoomComplete(room.room_number);
          
          return (
            <div key={room.room_number} className="bg-white rounded-lg shadow mb-4 overflow-hidden">
              {/* Accordion Header */}
              <div 
                onClick={() => toggleRoom(room.room_number)}
                className={`flex justify-between items-center p-6 cursor-pointer transition-all ${
                  isOpen ? 'bg-green-50 border-b-2 border-green-500' : 'hover:bg-gray-50'
                }`}>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                    isComplete ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600'
                  }`}>
                    {isComplete ? '✓' : room.room_number}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Room {room.room_number}</h2>
                    <p className="text-sm text-gray-600">{room.sharing_type} - {roomPassengers.length} passenger(s)</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  {isComplete && (
                    <span className="text-sm font-semibold text-green-600 bg-green-100 px-3 py-1 rounded-full">
                      Complete
                    </span>
                  )}
                  <svg 
                    className={`w-6 h-6 text-gray-600 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              {/* Accordion Content */}
              {isOpen && (
                <div className="p-6 bg-gray-50">
                  {roomPassengers.map((passenger, idx) => {
                    const globalIdx = passengers.indexOf(passenger);
                    return (
                      <div key={globalIdx} className="mb-6 p-4 bg-white border rounded-lg">
                        <h3 className="font-bold mb-3 capitalize text-lg text-green-700">
                          {passenger.type} {idx + 1}
                        </h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium mb-1">Full Name *</label>
                            <input type="text" value={passenger.name} onChange={(e) => updatePassenger(globalIdx, 'name', e.target.value)}
                                   className="w-full border rounded px-3 py-2" required />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium mb-1">Phone *</label>
                            <input type="tel" value={passenger.phone} onChange={(e) => updatePassenger(globalIdx, 'phone', e.target.value)}
                                   className="w-full border rounded px-3 py-2" required />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium mb-1">Date of Birth *</label>
                            <input type="date" value={passenger.dob} onChange={(e) => updatePassenger(globalIdx, 'dob', e.target.value)}
                                   className="w-full border rounded px-3 py-2" required />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium mb-1">Gender *</label>
                            <select value={passenger.gender} onChange={(e) => updatePassenger(globalIdx, 'gender', e.target.value)}
                                    className="w-full border rounded px-3 py-2" required>
                              <option value="">Select</option>
                              <option value="male">Male</option>
                              <option value="female">Female</option>
                            </select>
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium mb-1">Passport Number *</label>
                            <input type="text" value={passenger.passport_number} onChange={(e) => updatePassenger(globalIdx, 'passport_number', e.target.value)}
                                   className="w-full border rounded px-3 py-2" required />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium mb-1">Passport Expiry *</label>
                            <input type="date" value={passenger.passport_expiry} onChange={(e) => updatePassenger(globalIdx, 'passport_expiry', e.target.value)}
                                   className="w-full border rounded px-3 py-2" required />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium mb-1">Passport Issue Date *</label>
                            <input type="date" value={passenger.passport_issue} onChange={(e) => updatePassenger(globalIdx, 'passport_issue', e.target.value)}
                                   className="w-full border rounded px-3 py-2" required />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium mb-1">Passport Photo *</label>
                            <input 
                              type="file" 
                              accept="image/*,.pdf"
                              onChange={(e) => updatePassenger(globalIdx, 'passport_photo', e.target.files[0])}
                              className="w-full border rounded px-3 py-2" 
                              required 
                            />
                            <p className="text-xs text-gray-500 mt-1">Upload passport photo page (JPG, PNG, or PDF)</p>
                            {passenger.passport_photo && (
                              <p className="text-xs text-green-600 mt-1">✓ File uploaded: {passenger.passport_photo.name}</p>
                            )}
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium mb-1">Photo ID *</label>
                            <input 
                              type="file" 
                              accept="image/*,.pdf"
                              onChange={(e) => updatePassenger(globalIdx, 'photo_id', e.target.files[0])}
                              className="w-full border rounded px-3 py-2" 
                              required 
                            />
                            <p className="text-xs text-gray-500 mt-1">Upload NRIC/FIN or other photo ID (JPG, PNG, or PDF)</p>
                            {passenger.photo_id && (
                              <p className="text-xs text-green-600 mt-1">✓ File uploaded: {passenger.photo_id.name}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  
                  {/* Complete Room Button */}
                  <div className="mt-4 flex justify-end">
                    <button
                      onClick={() => handleRoomComplete(room.room_number)}
                      className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                        isComplete 
                          ? 'bg-green-500 text-white hover:bg-green-600' 
                          : 'bg-blue-500 text-white hover:bg-blue-600'
                      }`}>
                      {isComplete ? '✓ Room Complete - Continue' : 'Complete Room & Continue'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {/* Main Contact Person */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Main Contact Person</h2>
          
          {/* Dropdown to select from passengers */}
          <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <label className="block text-sm font-medium mb-2">Select Contact Person from Passengers (Optional)</label>
            <select 
              value={selectedContactPerson} 
              onChange={(e) => handleContactPersonSelect(e.target.value)}
              className="w-full border rounded px-3 py-2 bg-white">
              <option value="">-- Enter Manually or Select Below --</option>
              {passengers.map((passenger, index) => (
                <option key={index} value={index} disabled={!passenger.name || !passenger.phone}>
                  {passenger.name ? `${passenger.name} (${passenger.type}) - ${passenger.phone || 'No phone'}` : `Passenger ${index + 1} (Fill details first)`}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-600 mt-1">
              Fill passenger details first, then select from dropdown to auto-fill contact info
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Full Name *</label>
              <input type="text" value={contactInfo.name} onChange={(e) => setContactInfo({...contactInfo, name: e.target.value})}
                     className="w-full border rounded px-3 py-2" required />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Phone *</label>
              <input type="tel" value={contactInfo.phone} onChange={(e) => setContactInfo({...contactInfo, phone: e.target.value})}
                     className="w-full border rounded px-3 py-2" required />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Email *</label>
              <input type="email" value={contactInfo.email} onChange={(e) => setContactInfo({...contactInfo, email: e.target.value})}
                     className="w-full border rounded px-3 py-2" required />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Postal Code *</label>
              <input type="text" value={contactInfo.postal_code} onChange={(e) => setContactInfo({...contactInfo, postal_code: e.target.value})}
                     className="w-full border rounded px-3 py-2" required />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Address *</label>
              <textarea value={contactInfo.address} onChange={(e) => setContactInfo({...contactInfo, address: e.target.value})}
                        className="w-full border rounded px-3 py-2" rows="2" required />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Unit Number</label>
              <input type="text" value={contactInfo.unit} onChange={(e) => setContactInfo({...contactInfo, unit: e.target.value})}
                     className="w-full border rounded px-3 py-2" />
            </div>
          </div>
        </div>

        {/* Emergency Contact */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Emergency Contact (Next of Kin)</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Full Name *</label>
              <input type="text" value={emergencyContact.name} onChange={(e) => setEmergencyContact({...emergencyContact, name: e.target.value})}
                     className="w-full border rounded px-3 py-2" required />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Phone *</label>
              <input type="tel" value={emergencyContact.phone} onChange={(e) => setEmergencyContact({...emergencyContact, phone: e.target.value})}
                     className="w-full border rounded px-3 py-2" required />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Relationship *</label>
              <input type="text" value={emergencyContact.relationship} onChange={(e) => setEmergencyContact({...emergencyContact, relationship: e.target.value})}
                     className="w-full border rounded px-3 py-2" placeholder="e.g., Spouse, Parent" required />
            </div>
          </div>
        </div>

        <div className="flex justify-between">
          <button onClick={() => navigate('package', { package: packageData })} className="px-6 py-3 border rounded-lg hover:bg-gray-100">
            Back
          </button>
          <button onClick={handleNext} className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-secondary">
            Next: Add-ons
          </button>
        </div>
      </div>
    </div>
  );
};

export default PassengerDetailsPage;
