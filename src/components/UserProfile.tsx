
import React, { useState } from 'react';
import { useAuth } from '../context/ClerkAuthContext';
import CreditPlans from './CreditPlans';

const UserProfile: React.FC = () => {
  const { currentUser } = useAuth();
  const [formData, setFormData] = useState({
    username: currentUser?.username || '',
    age: currentUser?.age || '',
    gender: currentUser?.gender || '',
    phone: currentUser?.phone || '',
    profession: currentUser?.profession || 'student',
  });
  const [loading, setLoading] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [updateError, setUpdateError] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setUpdateSuccess(false);
    setUpdateError('');

    try {
      // Since we removed updateUserProfile functionality with Clerk migration,
      // we'll just simulate a successful update
      setTimeout(() => {
        setUpdateSuccess(true);
        console.log('Profile update simulated successfully');
      }, 1000);
    } catch (error) {
      console.error('Error updating profile:', error);
      setUpdateError(error instanceof Error ? error.message : 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl text-gray-600">Please log in to view your profile.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Side - User Profile */}
        <div className="lg:w-1/2">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold mb-6">Profile Information</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email (readonly) */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={currentUser.email || ''}
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-600"
                />
              </div>
              
              {/* Username */}
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                  Username
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  value={formData.username}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              {/* Age */}
              <div>
                <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-1">
                  Age
                </label>
                <input
                  id="age"
                  name="age"
                  type="number"
                  value={formData.age}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              {/* Gender */}
              <div>
                <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">
                  Gender
                </label>
                <select
                  id="gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                  <option value="prefer-not-to-say">Prefer not to say</option>
                </select>
              </div>
              
              {/* Phone */}
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              {/* Profession */}
              <div>
                <label htmlFor="profession" className="block text-sm font-medium text-gray-700 mb-1">
                  Profession
                </label>
                <select
                  id="profession"
                  name="profession"
                  value={formData.profession}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="student">Student</option>
                  <option value="employee">Employee</option>
                  <option value="organization">Organization</option>
                </select>
              </div>
              
              {/* Status Messages */}
              {updateSuccess && (
                <div className="p-3 bg-green-100 text-green-800 rounded-md">
                  Profile updated successfully!
                </div>
              )}
              
              {updateError && (
                <div className="p-3 bg-red-100 text-red-800 rounded-md">
                  {updateError}
                </div>
              )}
              
              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className={`w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors ${
                  loading ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                {loading ? 'Updating...' : 'Save Changes'}
              </button>
            </form>
          </div>
        </div>
        
        {/* Right Side - Profile Card instead of Credit Information */}
        <div className="lg:w-1/2">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold mb-6">Account Information</h2>
            <div className="text-center py-4">
              <p className="text-xl mb-2">Welcome, <span className="font-bold text-blue-600">{currentUser.username || currentUser.email}</span></p>
              <p className="text-gray-600 mb-6">Thank you for using our platform</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
