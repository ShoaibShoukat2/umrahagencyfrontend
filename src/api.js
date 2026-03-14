// API Base URL - Use environment variable or default to PythonAnywhere
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://Tmfauwaz.pythonanywhere.com/api';

export const api = {
  // Categories
  getCategories: async () => {
    const response = await fetch(`${API_BASE_URL}/categories/`);
    return response.json();
  },

  // Packages
  getPackages: async (filters = {}) => {
    const params = new URLSearchParams(filters);
    const response = await fetch(`${API_BASE_URL}/packages/?${params}`);
    return response.json();
  },

  getFeaturedPackages: async () => {
    const response = await fetch(`${API_BASE_URL}/packages/featured/`);
    return response.json();
  },


  

  getPackageBySlug: async (slug) => {
    const response = await fetch(`${API_BASE_URL}/packages/${slug}/`);
    return response.json();
  },

  // Items
  getItems: async (filters = {}) => {
    const params = new URLSearchParams(filters);
    const response = await fetch(`${API_BASE_URL}/items/?${params}`);
    return response.json();
  },

  // Tags
  getTags: async () => {
    const response = await fetch(`${API_BASE_URL}/tags/`);
    return response.json();
  },

  // Booking
  createBooking: async (bookingData) => {
    const formData = new FormData();
    
    // Add all fields to FormData
    formData.append('package_id', bookingData.package_id);
    formData.append('rooms', JSON.stringify(bookingData.rooms));
    formData.append('contact_info', JSON.stringify(bookingData.contact_info));
    formData.append('emergency_contact', JSON.stringify(bookingData.emergency_contact));
    
    // Prepare passengers data without files
    const passengersData = bookingData.passengers.map((p, index) => {
      const { passport_photo, photo_id, ...passengerWithoutFiles } = p;
      return passengerWithoutFiles;
    });
    formData.append('passengers', JSON.stringify(passengersData));
    
    // Add passenger files separately
    bookingData.passengers.forEach((passenger, index) => {
      if (passenger.passport_photo) {
        formData.append(`passenger_${index}_passport_photo`, passenger.passport_photo);
      }
      if (passenger.photo_id) {
        formData.append(`passenger_${index}_photo_id`, passenger.photo_id);
      }
    });
    
    formData.append('addons', JSON.stringify(bookingData.addons || []));
    formData.append('payment_amount', bookingData.payment_amount);
    formData.append('payment_method', bookingData.payment_method);
    
    // Add payment screenshot if exists
    if (bookingData.payment_screenshot) {
      formData.append('payment_screenshot', bookingData.payment_screenshot);
    }
    
    const response = await fetch(`${API_BASE_URL}/create-booking/`, {
      method: 'POST',
      body: formData,
    });
    return response.json();
  },

  // Customer Portal
  getCustomerBookings: async (email) => {
    const response = await fetch(`${API_BASE_URL}/bookings/?email=${email}`);
    return response.json();
  },

  addPayment: async (bookingId, paymentData, email) => {
    const formData = new FormData();
    formData.append('amount', paymentData.amount);
    formData.append('payment_method', paymentData.payment_method);
    
    // Add file if exists
    if (paymentData.payment_screenshot) {
      formData.append('payment_screenshot', paymentData.payment_screenshot);
    }
    
    const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}/add_payment/?email=${email}`, {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Payment failed');
    }
    
    return response.json();
  },

  getCustomer: async (email) => {
    const response = await fetch(`${API_BASE_URL}/customers/?email=${email}`);
    return response.json();
  },

  updateCustomer: async (customerId, customerData) => {
    const response = await fetch(`${API_BASE_URL}/customers/${customerId}/`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(customerData),
    });
    return response.json();
  },

  // Get customer item orders
  getCustomerItemOrders: async (email) => {
    const response = await fetch(`${API_BASE_URL}/item-orders/?email=${email}`);
    return response.json();
  },

  // Create item order
  createItemOrder: async (orderData) => {
    const formData = new FormData();
    
    formData.append('customer_email', orderData.customer_email);
    formData.append('items', JSON.stringify(orderData.items));
    formData.append('shipping_address', orderData.shipping_info.address);
    formData.append('shipping_unit', orderData.shipping_info.unit || '');
    formData.append('shipping_postal', orderData.shipping_info.postal_code);
    formData.append('total_amount', orderData.total_amount);
    
    if (orderData.payment_screenshot) {
      formData.append('payment_screenshot', orderData.payment_screenshot);
    }
    
    const response = await fetch(`${API_BASE_URL}/create-item-order/`, {
      method: 'POST',
      body: formData,
    });
    return response.json();
  },

  // Validate discount code
  validateDiscountCode: async (code, amount) => {
    const response = await fetch(`${API_BASE_URL}/validate-discount/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code, amount }),
    });
    return response.json();
  }
};

// Admin APIs
export const adminApi = {
  // Admin Login
  login: async (username, password) => {
    const response = await fetch(`${API_BASE_URL}/admin/login/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Login failed');
    }
    return response.json();
  },

  // Get all bookings (admin)
  getBookings: async () => {
    const response = await fetch(`${API_BASE_URL}/bookings/`);
    return response.json();
  },

  // Get all orders (admin)
  getOrders: async () => {
    const response = await fetch(`${API_BASE_URL}/item-orders/`);
    return response.json();
  },

  // Update booking status
  updateBookingStatus: async (bookingId, status) => {
    const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}/update_status/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    return response.json();
  },

  // Update order status
  updateOrderStatus: async (orderId, status) => {
    const response = await fetch(`${API_BASE_URL}/item-orders/${orderId}/update_status/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    return response.json();
  },

  // Delete booking
  deleteBooking: async (bookingId) => {
    const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}/`, {
      method: 'DELETE'
    });
    return response.ok;
  },

  // Delete order
  deleteOrder: async (orderId) => {
    const response = await fetch(`${API_BASE_URL}/item-orders/${orderId}/`, {
      method: 'DELETE'
    });
    return response.ok;
  },

  // Package CRUD
  createPackage: async (packageData) => {
    const response = await fetch(`${API_BASE_URL}/admin/packages/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(packageData)
    });
    return response.json();
  },

  updatePackage: async (packageId, packageData) => {
    console.log('Updating package:', packageId, packageData);
    const response = await fetch(`${API_BASE_URL}/admin/packages/${packageId}/`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(packageData)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Update failed:', errorData);
      throw new Error(errorData.error || 'Failed to update package');
    }
    
    const result = await response.json();
    console.log('Update successful:', result);
    return result;
  },

  deletePackage: async (packageId) => {
    const response = await fetch(`${API_BASE_URL}/admin/packages/${packageId}/`, {
      method: 'DELETE'
    });
    return response.ok;
  },

  // Category CRUD
  createCategory: async (categoryData) => {
    const response = await fetch(`${API_BASE_URL}/admin/categories/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(categoryData)
    });
    return response.json();
  },

  updateCategory: async (categoryId, categoryData) => {
    const response = await fetch(`${API_BASE_URL}/admin/categories/${categoryId}/`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(categoryData)
    });
    return response.json();
  },

  deleteCategory: async (categoryId) => {
    const response = await fetch(`${API_BASE_URL}/admin/categories/${categoryId}/`, {
      method: 'DELETE'
    });
    return response.ok;
  },

  // Item CRUD
  createItem: async (itemData) => {
    const response = await fetch(`${API_BASE_URL}/admin/items/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(itemData)
    });
    return response.json();
  },

  updateItem: async (itemId, itemData) => {
    const response = await fetch(`${API_BASE_URL}/admin/items/${itemId}/`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(itemData)
    });
    return response.json();
  },

  deleteItem: async (itemId) => {
    const response = await fetch(`${API_BASE_URL}/admin/items/${itemId}/`, {
      method: 'DELETE'
    });
    return response.ok;
  },

  // User Management
  getUsers: async () => {
    const response = await fetch(`${API_BASE_URL}/admin/users/`);
    return response.json();
  },

  createUser: async (userData) => {
    const response = await fetch(`${API_BASE_URL}/admin/users/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    return response.json();
  },

  updateUser: async (userId, userData) => {
    const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    return response.json();
  },

  deleteUser: async (userId) => {
    const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/`, {
      method: 'DELETE'
    });
    return response.ok;
  },

  // Customer Management
  getCustomers: async () => {
    const response = await fetch(`${API_BASE_URL}/admin/customers/`);
    return response.json();
  },

  getTourLeaders: async () => {
    const response = await fetch(`${API_BASE_URL}/admin/customers/tour_leaders/`);
    return response.json();
  },

  toggleTourLeader: async (customerId) => {
    const response = await fetch(`${API_BASE_URL}/admin/customers/${customerId}/toggle_tour_leader/`, {
      method: 'POST'
    });
    return response.json();
  },

  // Package Import/Export
  exportPackages: async () => {
    window.open(`${API_BASE_URL}/packages/export/`, '_blank');
  },

  importPackages: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await fetch(`${API_BASE_URL}/packages/import/`, {
      method: 'POST',
      body: formData
    });
    return response.json();
  },

  getPackagePassengers: async (packageId) => {
    const response = await fetch(`${API_BASE_URL}/packages/${packageId}/passengers/`);
    return response.json();
  },

  exportPackagePassengers: async (packageId) => {
    window.open(`${API_BASE_URL}/packages/${packageId}/passengers/export/`, '_blank');
  },

  // Payments
  getPayments: async () => {
    const response = await fetch(`${API_BASE_URL}/payments/`);
    return response.json();
  },

  updatePaymentStatus: async (paymentId, status) => {
    const response = await fetch(`${API_BASE_URL}/payments/${paymentId}/update_status/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    return response.json();
  },

  // Customer Documents
  getCustomerDocuments: async (customerEmail) => {
    const response = await fetch(`${API_BASE_URL}/customer-documents/?email=${customerEmail}`);
    return response.json();
  },

  uploadCustomerDocument: async (documentData) => {
    const formData = new FormData();
    formData.append('customer', documentData.customer_id);
    if (documentData.booking_id) {
      formData.append('booking', documentData.booking_id);
    }
    formData.append('document_type', documentData.document_type);
    formData.append('title', documentData.title);
    formData.append('description', documentData.description || '');
    formData.append('file', documentData.file);
    formData.append('is_important', documentData.is_important || false);
    if (documentData.expiry_date) {
      formData.append('expiry_date', documentData.expiry_date);
    }

    const response = await fetch(`${API_BASE_URL}/customer-documents/upload/`, {
      method: 'POST',
      body: formData
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to upload document');
    }
    
    return response.json();
  },

  deleteCustomerDocument: async (documentId) => {
    const response = await fetch(`${API_BASE_URL}/customer-documents/${documentId}/`, {
      method: 'DELETE'
    });
    return response.ok;
  }
};
