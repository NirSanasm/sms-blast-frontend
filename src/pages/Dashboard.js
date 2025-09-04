import React, { useState, useEffect } from 'react';
import { MessageSquare, Send, Search, BarChart3, RefreshCw } from 'lucide-react';
import { userAPI, searchAPI, generateUserSession } from '../services/api';
import toast from 'react-hot-toast';
import ContactCard from '../components/ContactCard';
import StatsCard from '../components/StatsCard';
import MessageSelector from '../components/MessageSelector';
import SearchTab from '../components/SearchTab';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('sms');
  const [messages, setMessages] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [userSession] = useState(() => generateUserSession());

  useEffect(() => {
    loadMessages();
    loadStats();
  }, []);

  const loadMessages = async () => {
    try {
      const response = await userAPI.getMessages();
      const messagesData = response.data;
      if (Array.isArray(messagesData)) {
        setMessages(messagesData);
        if (messagesData.length > 0 && !selectedMessage) {
          setSelectedMessage(messagesData[0]);
        }
      } else {
        setMessages([]);
        toast.error('Failed to load messages: Invalid data format');
      }
    } catch (error) {
      toast.error('Failed to load messages');
      setMessages([]); // Also handle API call errors
    }
  };

  const loadStats = async () => {
    try {
      const response = await userAPI.getStats();
      setStats(response.data);
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const loadRandomContacts = async () => {
    if (!selectedMessage) {
      toast.error('Please select a message first');
      return;
    }

    setLoading(true);
    try {
      const response = await userAPI.getRandomContacts(selectedMessage.id, userSession);
      setContacts(response.data.contacts);
      toast.success(`Loaded ${response.data.contacts.length} contacts`);
    } catch (error) {
      if (error.response?.status === 429) {
        toast.error('Daily limit reached!');
      } else if (error.response?.status === 404) {
        toast.error('No available contacts found');
      } else {
        toast.error('Failed to load contacts');
      }
      setContacts([]);
    } finally {
      setLoading(false);
    }
  };

  const sendBatch = async (platform) => {
    if (!selectedMessage) {
      toast.error('Please select a message first');
      return;
    }

    if (contacts.length === 0) {
      toast.error('No contacts loaded');
      return;
    }

    setLoading(true);
    try {
      const apiCall = platform === 'sms' ? userAPI.sendSMSBatch : userAPI.sendWhatsAppBatch;
      const response = await apiCall({
        message_id: selectedMessage.id,
        platform,
        user_session: userSession
      });

      // Open links for each contact
      response.data.contacts.forEach((contact, index) => {
        setTimeout(() => {
          window.open(contact.url, '_blank');
        }, index * 1000); // 1 second delay between each link
      });

      toast.success(`${platform.toUpperCase()} batch sent to ${response.data.contacts.length} contacts`);
      
      // Refresh stats and clear contacts
      loadStats();
      setContacts([]);
      
    } catch (error) {
      if (error.response?.status === 429) {
        toast.error('Daily limit reached!');
      } else {
        toast.error(`Failed to send ${platform.toUpperCase()} batch`);
      }
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'sms', label: 'SMS', icon: MessageSquare },
    { id: 'whatsapp', label: 'WhatsApp', icon: Send },
    { id: 'search', label: 'Search', icon: Search },
    { id: 'stats', label: 'Stats', icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-gray-900">
              Broadcast Dashboard
            </h1>
            {stats && (
              <div className="text-sm text-gray-600">
                <span className="font-medium">{stats.daily_sent}</span> / {stats.daily_limit} sent today
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      {stats && (
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <StatsCard stats={stats} />
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center px-1 py-4 text-sm font-medium border-b-2 ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {(activeTab === 'sms' || activeTab === 'whatsapp') && (
          <div className="space-y-6">
            {/* Message Selection */}
            <MessageSelector
              messages={messages}
              selectedMessage={selectedMessage}
              onSelectMessage={setSelectedMessage}
            />

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4">
              <button
                onClick={loadRandomContacts}
                disabled={loading || !selectedMessage}
                className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Get Random Contacts
              </button>

              {contacts.length > 0 && (
                <button
                  onClick={() => sendBatch(activeTab)}
                  disabled={loading}
                  className={`flex items-center px-6 py-3 rounded-lg text-white ${
                    activeTab === 'sms'
                      ? 'bg-green-600 hover:bg-green-700'
                      : 'bg-emerald-600 hover:bg-emerald-700'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {activeTab === 'sms' ? (
                    <MessageSquare className="w-4 h-4 mr-2" />
                  ) : (
                    <Send className="w-4 h-4 mr-2" />
                  )}
                  Send {activeTab.toUpperCase()} ({contacts.length})
                </button>
              )}
            </div>

            {/* Contacts List */}
            {contacts.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-4">
                  Selected Contacts ({contacts.length})
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {contacts.map((contact) => (
                    <ContactCard key={contact.id} contact={contact} />
                  ))}
                </div>
              </div>
            )}

            {/* Selected Message Preview */}
            {selectedMessage && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-4">Message Preview</h3>
                <div className="border rounded-lg p-4 bg-gray-50">
                  <h4 className="font-medium text-gray-900 mb-2">
                    {selectedMessage.title}
                  </h4>
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {selectedMessage.content}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'search' && <SearchTab />}

        {activeTab === 'stats' && stats && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Detailed Statistics</h3>
              <StatsCard stats={stats} detailed={true} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;