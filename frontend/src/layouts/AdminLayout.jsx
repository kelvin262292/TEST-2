import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext'; // To display user info or logout

const AdminLayout = () => {
  const { user, logout } = useAuth();

  const navLinkClasses = ({ isActive }) => 
    `block px-4 py-2 rounded-md text-sm font-medium transition-colors duration-150 ease-in-out ${
      isActive 
        ? 'bg-indigo-700 text-white' 
        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
    }`;

  return (
    <div className="min-h-screen flex bg-gray-900 text-white">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-gray-800 p-6 space-y-4 shadow-lg fixed h-full">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-indigo-400">Admin Panel</h1>
          {user && (
            <p className="text-xs text-gray-400 mt-1">Logged in as: {user.name}</p>
          )}
        </div>
        <nav className="space-y-2">
          <NavLink to="/admin/dashboard" className={navLinkClasses}>
            Dashboard
          </NavLink>
          <NavLink to="/admin/products" className={navLinkClasses}>
            Manage Products
          </NavLink>
          <NavLink to="/admin/orders" className={navLinkClasses}>
            Manage Orders
          </NavLink>
          {/* Add more admin links as needed */}
        </nav>
        <div className="absolute bottom-6 left-6 right-6">
          <NavLink to="/" className="block w-full text-center px-4 py-2 rounded-md text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white">
            Back to Site
          </NavLink>
           <button 
            onClick={logout} 
            className="mt-2 w-full text-left px-4 py-2 rounded-md text-sm font-medium text-red-400 hover:bg-red-700 hover:text-white transition-colors duration-150 ease-in-out"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 ml-64 p-6 sm:p-8">
        {/* Outlet renders the matched child route's component */}
        <Outlet /> 
      </main>
    </div>
  );
};

export default AdminLayout;
