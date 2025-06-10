
import React from 'react';

const CreditPlans: React.FC = () => {
  return (
    <div className="max-w-6xl mx-auto p-6 flex items-center justify-center">
      <div className="bg-white rounded-lg p-8 shadow-lg text-center max-w-3xl w-full">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Free Access</h2>
        <p className="text-xl text-gray-600 mb-8">
          All features are now completely free to use!
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <div className="flex items-center space-x-3 text-gray-700">
            <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
            <span>Unlimited Projects</span>
          </div>
          
          <div className="flex items-center space-x-3 text-gray-700">
            <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
            <span>All Features Included</span>
          </div>
          
          <div className="flex items-center space-x-3 text-gray-700">
            <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
            <span>No Credit Limits</span>
          </div>
          
          <div className="flex items-center space-x-3 text-gray-700">
            <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
            <span>Private Projects</span>
          </div>
          
          <div className="flex items-center space-x-3 text-gray-700">
            <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
            <span>Custom Domains</span>
          </div>
          
          <div className="flex items-center space-x-3 text-gray-700">
            <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
            <span>Priority Support</span>
          </div>
        </div>

        <div className="mt-12 flex justify-center">
          <button className="px-8 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">
            Start Creating Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreditPlans;
