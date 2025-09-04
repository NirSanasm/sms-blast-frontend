import React from 'react';
import { BarChart3, MessageSquare, Send, AlertCircle } from 'lucide-react';

const StatsCard = ({ stats, detailed = false }) => {
  const progressPercentage = (stats.daily_sent / stats.daily_limit) * 100;

  if (!detailed) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center">
            <BarChart3 className="w-5 h-5 text-blue-600 mr-2" />
            <div>
              <p className="text-sm font-medium text-blue-900">Daily Sent</p>
              <p className="text-xl font-bold text-blue-600">{stats.daily_sent}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-center">
            <MessageSquare className="w-5 h-5 text-green-600 mr-2" />
            <div>
              <p className="text-sm font-medium text-green-900">SMS Sent</p>
              <p className="text-xl font-bold text-green-600">{stats.sms_count}</p>
            </div>
          </div>
        </div>

        <div className="bg-emerald-50 rounded-lg p-4">
          <div className="flex items-center">
            <Send className="w-5 h-5 text-emerald-600 mr-2" />
            <div>
              <p className="text-sm font-medium text-emerald-900">WhatsApp</p>
              <p className="text-xl font-bold text-emerald-600">{stats.whatsapp_count}</p>
            </div>
          </div>
        </div>

        <div className="bg-orange-50 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-orange-600 mr-2" />
            <div>
              <p className="text-sm font-medium text-orange-900">Remaining</p>
              <p className="text-xl font-bold text-orange-600">{stats.remaining}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Progress Bar */}
      <div>
        <div className="flex justify-between text-sm font-medium text-gray-900 mb-2">
          <span>Daily Usage</span>
          <span>{stats.daily_sent} / {stats.daily_limit}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className={`h-3 rounded-full transition-all duration-300 ${
              progressPercentage >= 90
                ? 'bg-red-500'
                : progressPercentage >= 75
                ? 'bg-yellow-500'
                : 'bg-green-500'
            }`}
            style={{ width: `${Math.min(progressPercentage, 100)}%` }}
          ></div>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          {progressPercentage.toFixed(1)}% of daily limit used
        </p>
      </div>

      {/* Detailed Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100">Total Sent Today</p>
              <p className="text-3xl font-bold">{stats.daily_sent}</p>
            </div>
            <BarChart3 className="w-8 h-8 text-blue-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100">SMS Messages</p>
              <p className="text-3xl font-bold">{stats.sms_count}</p>
            </div>
            <MessageSquare className="w-8 h-8 text-green-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-emerald-100">WhatsApp Messages</p>
              <p className="text-3xl font-bold">{stats.whatsapp_count}</p>
            </div>
            <Send className="w-8 h-8 text-emerald-200" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsCard;