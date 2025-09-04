import React from 'react';
import { ChevronDown } from 'lucide-react';

const MessageSelector = ({ messages = [], selectedMessage, onSelectMessage }) => {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">Select Message Template</h3>
      <div className="relative">
        <select
          value={selectedMessage?.id || ''}
          onChange={(e) => {
            const message = messages.find(m => m.id === parseInt(e.target.value));
            onSelectMessage(message);
          }}
          className="w-full p-3 border border-gray-300 rounded-lg bg-white appearance-none pr-10 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        >
          <option value="">Select a message template...</option>
          {messages.map((message) => (
            <option key={message.id} value={message.id}>
              {message.title}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
      </div>
      
      {selectedMessage && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2">{selectedMessage.title}</h4>
          <p className="text-gray-700 text-sm whitespace-pre-wrap">
            {selectedMessage.content}
          </p>
        </div>
      )}
    </div>
  );
};

export default MessageSelector;