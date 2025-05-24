import React from 'react';

const AdminDashboardPage = () => {
  return (
    <div className="p-6 bg-gray-800 shadow-lg rounded-lg">
      <h2 className="text-2xl font-bold text-indigo-400 mb-6">Admin Dashboard</h2>
      <p className="text-gray-300">
        Welcome to the admin dashboard. Here you can get an overview of site activity,
        manage products, orders, and users.
      </p>
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Placeholder cards for dashboard widgets */}
        <div className="bg-gray-700 p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-indigo-300 mb-2">Total Products</h3>
          <p className="text-3xl font-bold text-white">150</p> {/* Example data */}
        </div>
        <div className="bg-gray-700 p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-indigo-300 mb-2">Pending Orders</h3>
          <p className="text-3xl font-bold text-white">25</p> {/* Example data */}
        </div>
        <div className="bg-gray-700 p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-indigo-300 mb-2">Total Users</h3>
          <p className="text-3xl font-bold text-white">500</p> {/* Example data */}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
