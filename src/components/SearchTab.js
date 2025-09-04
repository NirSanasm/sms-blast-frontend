import React, { useState } from 'react';
import { Search, Phone, User } from 'lucide-react';
import { searchAPI } from '../services/api';
import toast from 'react-hot-toast';

const SearchTab = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    try {
      const response = await searchAPI.searchPhone(query);
      setSearchResults(response.data.contacts);
    } catch (error) {
      toast.error('Search failed');
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    
    // Debounced search
    clearTimeout(window.searchTimeout);
    window.searchTimeout = setTimeout(() => {
      handleSearch(value);
    }, 300);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Phone Number Search</h3>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={handleInputChange}
            placeholder="Enter phone number..."
            className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
        
        {loading && (
          <div className="mt-4 text-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600 mx-auto"></div>
            <p className="text-sm text-gray-500 mt-2">Searching...</p>
          </div>
        )}

        {searchResults.length > 0 && (
          <div className="mt-6">
            <h4 className="text-md font-medium text-gray-900 mb-3">
              Search Results ({searchResults.length})
            </h4>
            <div className="space-y-2">
              {searchResults.map((contact) => (
                <div
                  key={contact.id}
                  className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-primary-600" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{contact.name}</p>
                    <div className="flex items-center text-sm text-gray-500">
                      <Phone className="w-3 h-3 mr-1" />
                      <span>{contact.phone}</span>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => window.open(`sms:${contact.phone}`, '_blank')}
                      className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                      title="Send SMS"
                    >
                      <Phone className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => window.open(`https://wa.me/${contact.phone.replace('+', '')}`, '_blank')}
                      className="p-2 text-emerald-600 hover:bg-emerald-100 rounded-lg transition-colors"
                      title="Send WhatsApp"
                    >
                      <Search className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {searchQuery && !loading && searchResults.length === 0 && (
          <div className="mt-6 text-center text-gray-500">
            <p>No contacts found matching "{searchQuery}"</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchTab;