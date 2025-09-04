import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  MessageSquare, 
  Upload, 
  Download, 
  Plus, 
  Edit, 
  Trash2, 
  LogOut,
  BarChart3,
  FileText
} from 'lucide-react';
import { adminAPI } from '../services/api';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [messages, setMessages] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [editingMessage, setEditingMessage] = useState(null);
  const [messageForm, setMessageForm] = useState({ title: '', content: '' });
  const navigate = useNavigate();

  useEffect(() => {
    // Check if logged in
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/admin');
      return;
    }
    
    loadData();
  }, [navigate]);

  const loadData = async () => {
    try {
      const [messagesRes, statsRes] = await Promise.all([
        adminAPI.getMessages(),
        adminAPI.getStats()
      ]);
      setMessages(messagesRes.data);
      setStats(statsRes.data);
    } catch (error) {
      toast.error('Failed to load data');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    toast.success('Logged out successfully');
    navigate('/admin');
  };

  const handleFileUpload = async () => {
    if (!uploadFile) {
      toast.error('Please select a file');
      return;
    }

    setLoading(true);
    try {
      const response = await adminAPI.uploadContacts(uploadFile);
      toast.success(`Upload successful! Added: ${response.data.added}, Updated: ${response.data.updated}`);
      setUploadFile(null);
      loadData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      const response = await adminAPI.downloadTemplate();
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'contacts_template.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Template downloaded');
    } catch (error) {
      toast.error('Failed to download template');
    }
  };

  const handleSaveMessage = async () => {
    if (!messageForm.title || !messageForm.content) {
      toast.error('Please fill all fields');
      return;
    }

    setLoading(true);
    try {
      if (editingMessage) {
        await adminAPI.updateMessage(editingMessage.id, messageForm);
        toast.success('Message updated successfully');
      } else {
        await adminAPI.createMessage(messageForm);
        toast.success('Message created successfully');
      }
      
      setShowMessageModal(false);
      setEditingMessage(null);
      setMessageForm({ title: '', content: '' });
      loadData();
    } catch (error) {
      toast.error('Failed to save message');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMessage = async (id) => {
    if (!window.confirm('Are you sure you want to delete this message?')) {
      return;
    }

    try {
      await adminAPI.deleteMessage(id);
      toast.success('Message deleted successfully');
      loadData();
    } catch (error) {
      toast.error('Failed to delete message');
    }
  };

  const openEditModal = (message) => {
    setEditingMessage(message);
    setMessageForm({ title: message.title, content: message.content });
    setShowMessageModal(true);
  };

  const openNewModal = () => {
    setEditingMessage(null);
    setMessageForm({ title: '', content: '' });
    setShowMessageModal(true);
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'contacts', label: 'Contacts', icon: Users },
    { id: 'messages', label: 'Messages', icon: MessageSquare },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            <button
              onClick={handleLogout}
              className="flex items-center px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </button>
          </div>
        </div>
      </div>

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
        {activeTab === 'overview' && stats && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <Users className="w-8 h-8 text-blue-600 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Contacts</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.total_contacts}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <MessageSquare className="w-8 h-8 text-green-600 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Messages</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.total_messages}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <BarChart3 className="w-8 h-8 text-purple-600 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">Today's Sends</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.today_sent}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'contacts' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Contact Management</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Upload Contacts */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                  <div className="text-center">
                    <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h4 className="text-lg font-medium text-gray-900 mb-2">Upload Contacts</h4>
                    <p className="text-sm text-gray-500 mb-4">
                      Upload a CSV file with Name and Phone columns
                    </p>
                    
                    <input
                      type="file"
                      accept=".csv"
                      onChange={(e) => setUploadFile(e.target.files[0])}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                    />
                    
                    {uploadFile && (
                      <button
                        onClick={handleFileUpload}
                        disabled={loading}
                        className="mt-4 w-full flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50"
                      >
                        {loading ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        ) : (
                          <Upload className="w-4 h-4 mr-2" />
                        )}
                        Upload Contacts
                      </button>
                    )}
                  </div>
                </div>

                {/* Download Template */}
                <div className="border border-gray-200 rounded-lg p-6">
                  <div className="text-center">
                    <Download className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h4 className="text-lg font-medium text-gray-900 mb-2">CSV Template</h4>
                    <p className="text-sm text-gray-500 mb-4">
                      Download the CSV template with correct format
                    </p>
                    
                    <button
                      onClick={handleDownloadTemplate}
                      className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download Template
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'messages' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Message Templates</h3>
              <button
                onClick={openNewModal}
                className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Message
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {messages.map((message) => (
                <div key={message.id} className="bg-white rounded-lg shadow p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h4 className="text-lg font-medium text-gray-900">{message.title}</h4>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => openEditModal(message)}
                        className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteMessage(message.id)}
                        className="p-2 text-red-600 hover:bg-red-100 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm line-clamp-3">{message.content}</p>
                  <div className="mt-4 text-xs text-gray-500">
                    Created: {new Date(message.created_at).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>

            {messages.length === 0 && (
              <div className="text-center py-12">
                <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No messages yet</h3>
                <p className="text-gray-500">Create your first message template to get started</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Message Modal */}
      {showMessageModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-lg bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingMessage ? 'Edit Message' : 'New Message'}
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title
                  </label>
                  <input
                    type="text"
                    value={messageForm.title}
                    onChange={(e) => setMessageForm({...messageForm, title: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Enter message title..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Content
                  </label>                  <textarea
                    value={messageForm.content}
                    onChange={(e) => setMessageForm({...messageForm, content: e.target.value})}
                    rows={6}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Enter message content..."
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-4 mt-6">
                <button
                  onClick={() => setShowMessageModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveMessage}
                  disabled={loading}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2 inline-block"></div>
                  ) : null}
                  {editingMessage ? 'Update' : 'Create'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;