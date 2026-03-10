import React, { useState, useEffect } from 'react';
import { adminApi } from '../api';

const DocumentUploadSection = ({ customers }) => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [formData, setFormData] = useState({
    customer_id: '',
    booking_id: '',
    document_type: 'visa',
    title: '',
    description: '',
    file: null,
    is_important: false,
    expiry_date: ''
  });

  const documentTypes = [
    { value: 'visa', label: '📋 Visa', color: 'bg-purple-100 text-purple-800' },
    { value: 'ticket', label: '✈️ Flight Ticket', color: 'bg-red-100 text-red-800' },
    { value: 'hotel', label: '🏨 Hotel Voucher', color: 'bg-orange-100 text-orange-800' },
    { value: 'itinerary', label: '📅 Travel Itinerary', color: 'bg-blue-100 text-blue-800' },
    { value: 'insurance', label: '🛡️ Travel Insurance', color: 'bg-teal-100 text-teal-800' },
    { value: 'vaccination', label: '💉 Vaccination Certificate', color: 'bg-pink-100 text-pink-800' },
    { value: 'passport', label: '🛂 Passport Copy', color: 'bg-indigo-100 text-indigo-800' },
    { value: 'other', label: '📁 Other', color: 'bg-gray-100 text-gray-800' }
  ];

  useEffect(() => {
    if (selectedCustomer) {
      loadCustomerDocuments(selectedCustomer.email);
    }
  }, [selectedCustomer]);

  const loadCustomerDocuments = async (email) => {
    try {
      setLoading(true);
      const docs = await adminApi.getCustomerDocuments(email);
      setDocuments(Array.isArray(docs) ? docs : []);
    } catch (error) {
      console.error('Error loading documents:', error);
      alert('Error loading documents');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert('File size must be less than 10MB');
        return;
      }
      setFormData({ ...formData, file });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.customer_id || !formData.file || !formData.title) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      await adminApi.uploadCustomerDocument(formData);
      alert('Document uploaded successfully!');
      setShowUploadForm(false);
      setFormData({
        customer_id: '',
        booking_id: '',
        document_type: 'visa',
        title: '',
        description: '',
        file: null,
        is_important: false,
        expiry_date: ''
      });
      if (selectedCustomer) {
        loadCustomerDocuments(selectedCustomer.email);
      }
    } catch (error) {
      console.error('Error uploading document:', error);
      alert('Error uploading document: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (documentId) => {
    if (!window.confirm('Are you sure you want to delete this document?')) {
      return;
    }

    try {
      setLoading(true);
      await adminApi.deleteCustomerDocument(documentId);
      alert('Document deleted successfully!');
      if (selectedCustomer) {
        loadCustomerDocuments(selectedCustomer.email);
      }
    } catch (error) {
      console.error('Error deleting document:', error);
      alert('Error deleting document');
    } finally {
      setLoading(false);
    }
  };

  const getDocumentTypeInfo = (type) => {
    return documentTypes.find(dt => dt.value === type) || documentTypes[documentTypes.length - 1];
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">📄 Customer Documents</h2>
          <p className="text-gray-600 mt-1">Upload and manage customer travel documents</p>
        </div>
        <button
          onClick={() => setShowUploadForm(!showUploadForm)}
          className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all font-semibold shadow-lg flex items-center gap-2"
        >
          <span className="text-xl">{showUploadForm ? '✕' : '+'}</span>
          {showUploadForm ? 'Cancel' : 'Upload Document'}
        </button>
      </div>

      {/* Upload Form */}
      {showUploadForm && (
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border-2 border-green-200">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Upload New Document</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Customer Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Customer * <span className="text-red-500">Required</span>
                </label>
                <select
                  value={formData.customer_id}
                  onChange={(e) => {
                    const customerId = e.target.value;
                    const customer = customers.find(c => c.id === parseInt(customerId));
                    setFormData({ ...formData, customer_id: customerId });
                    setSelectedCustomer(customer);
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                >
                  <option value="">Select Customer</option>
                  {customers.map(customer => (
                    <option key={customer.id} value={customer.id}>
                      {customer.user?.username || customer.email} - {customer.email}
                    </option>
                  ))}
                </select>
              </div>

              {/* Document Type */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Document Type *
                </label>
                <select
                  value={formData.document_type}
                  onChange={(e) => setFormData({ ...formData, document_type: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                >
                  {documentTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Document Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Saudi Visa, Flight Ticket SQ123"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
              </div>

              {/* Expiry Date */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Expiry Date (Optional)
                </label>
                <input
                  type="date"
                  value={formData.expiry_date}
                  onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Description (Optional)
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Additional notes about this document..."
                rows="3"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            {/* File Upload */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Upload File * <span className="text-gray-500">(Max 10MB)</span>
              </label>
              <input
                type="file"
                onChange={handleFileChange}
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              />
              {formData.file && (
                <p className="mt-2 text-sm text-green-600">
                  ✓ Selected: {formData.file.name} ({(formData.file.size / 1024 / 1024).toFixed(2)} MB)
                </p>
              )}
            </div>

            {/* Important Checkbox */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_important"
                checked={formData.is_important}
                onChange={(e) => setFormData({ ...formData, is_important: e.target.checked })}
                className="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500"
              />
              <label htmlFor="is_important" className="text-sm font-semibold text-gray-700">
                ⭐ Mark as Important/Urgent
              </label>
            </div>

            {/* Submit Button */}
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Uploading...' : '📤 Upload Document'}
              </button>
              <button
                type="button"
                onClick={() => setShowUploadForm(false)}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all font-semibold"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Customer Documents List */}
      {selectedCustomer && (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-green-600 to-teal-600 p-4">
            <h3 className="text-xl font-bold text-white">
              Documents for: {selectedCustomer.user?.username || selectedCustomer.email}
            </h3>
            <p className="text-white/90 text-sm">{selectedCustomer.email}</p>
          </div>

          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading documents...</p>
            </div>
          ) : documents.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <p className="text-4xl mb-4">📭</p>
              <p>No documents uploaded yet for this customer</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Title</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Description</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Uploaded</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {documents.map(doc => {
                    const typeInfo = getDocumentTypeInfo(doc.document_type);
                    return (
                      <tr key={doc.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${typeInfo.color}`}>
                            {typeInfo.label}
                          </span>
                          {doc.is_important && (
                            <span className="ml-2 text-yellow-500">⭐</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-semibold text-gray-900">{doc.title}</div>
                          {doc.expiry_date && (
                            <div className="text-xs text-gray-500">Expires: {new Date(doc.expiry_date).toLocaleDateString()}</div>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                          {doc.description || '-'}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          <div>{new Date(doc.created_at).toLocaleDateString()}</div>
                          <div className="text-xs text-gray-500">by {doc.uploaded_by_name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex gap-2">
                            <a
                              href={doc.file_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-all text-sm font-semibold"
                            >
                              📥 View
                            </a>
                            <button
                              onClick={() => handleDelete(doc.id)}
                              className="px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-all text-sm font-semibold"
                            >
                              🗑️ Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Instructions */}
      {!selectedCustomer && !showUploadForm && (
        <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
          <h3 className="text-lg font-bold text-blue-900 mb-3">📌 How to Upload Documents</h3>
          <ol className="list-decimal list-inside space-y-2 text-blue-800">
            <li>Click "Upload Document" button above</li>
            <li>Select the customer from the dropdown</li>
            <li>Choose document type (Visa, Ticket, Hotel, etc.)</li>
            <li>Enter document title and optional description</li>
            <li>Upload the file (PDF, Image, or Document)</li>
            <li>Mark as important if urgent</li>
            <li>Click "Upload Document" to save</li>
          </ol>
          <p className="mt-4 text-sm text-blue-700">
            💡 Customers will see these documents in their mobile app's "Document Wallet"
          </p>
        </div>
      )}
    </div>
  );
};

export default DocumentUploadSection;
