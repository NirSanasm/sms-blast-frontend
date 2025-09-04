import React from 'react';
import { Phone, User } from 'lucide-react';

const ContactCard = ({ contact }) => {
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center space-x-3">
        <div className="flex-shrink-0">
          <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-primary-600" />
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">
            {contact.name}
          </p>
          <div className="flex items-center text-sm text-gray-500">
            <Phone className="w-3 h-3 mr-1" />
            <span className="truncate">{contact.phone}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactCard;