import React from 'react';
import { useAuth } from '../contexts/AuthContext'; // To access user and logout

const DashboardPage = () => {
  const { user, logout } = useAuth();

  return (
    <div className="p-4 bg-gray-900 text-white min-h-screen">
      <div className="container mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-indigo-400">Dashboard</h1>
          <button
            onClick={logout}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-md shadow-md transition duration-150 ease-in-out"
          >
            Logout
          </button>
        </div>

        {user && (
          <div className="bg-gray-800 p-6 rounded-lg shadow-xl">
            <h2 className="text-2xl font-semibold mb-4">Welcome, {user.name}!</h2>
            <p className="text-gray-300 mb-2">
              <strong>Email:</strong> {user.email}
            </p>
            <p className="text-gray-300 mb-2">
              <strong>Roles:</strong> {user.roles && user.roles.join(', ')}
            </p>
            <p className="text-gray-300">
              This is your protected dashboard area. Only logged-in users can see this.
            </p>
          </div>
        )}

        <div className="mt-8 p-6 bg-gray-800 rounded-lg shadow-xl">
          <h3 className="text-xl font-semibold mb-4">Your Activity</h3>
          <p className="text-gray-400">
            (Placeholder for user-specific activity or content)
          </p>
          {/* Example: Link to manage products if user is admin */}
          {user && user.roles && user.roles.includes('admin') && (
            <div className="mt-4">
              <a href="/admin/products" className="text-indigo-400 hover:text-indigo-500">
                Manage Products (Admin)
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
