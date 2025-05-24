import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getAllOrdersForAdmin } from '../../services/orderService'; // Assuming this service function exists
import { useAuth } from '../../contexts/AuthContext'; // For role checks if needed, though AdminRoute handles access

const AdminOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // For formatting dates
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  const fetchOrders = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getAllOrdersForAdmin();
      setOrders(data);
    } catch (err) {
      console.error("AdminOrdersPage fetch error:", err);
      setError(err.message || 'Failed to fetch orders.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  if (isLoading) {
    return (
      <div className="p-6 text-center text-xl text-gray-300">
        Loading orders...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-gray-800 shadow-lg rounded-lg">
        <h2 className="text-2xl font-bold text-red-500 mb-6">Error Fetching Orders</h2>
        <div className="bg-red-700 border border-red-900 text-red-100 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
        <button 
            onClick={fetchOrders} 
            className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-md shadow-md transition duration-150 ease-in-out"
        >
            Retry Fetching Orders
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-800 shadow-lg rounded-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-indigo-400">Manage Orders</h2>
        {/* Placeholder for any actions like "Create Order" if applicable, or filters */}
      </div>

      {isLoading && <p className="text-center text-gray-400 py-2">Refreshing order list...</p>}

      <div className="overflow-x-auto bg-gray-700 rounded-lg shadow">
        <table className="min-w-full table-auto">
          <thead className="bg-gray-600">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Order ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">User ID</th>
              {/* Consider adding User Email if available directly or via a join in backend */}
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Order Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Total Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Payment Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-600">
            {orders.length > 0 ? orders.map((order) => (
              <tr key={order.id} className="hover:bg-gray-650 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-indigo-300">{order.id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-200">{order.user_id || 'N/A'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-200">{formatDate(order.created_at)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-200">${parseFloat(order.total_amount).toFixed(2)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    order.status === 'pending' ? 'bg-yellow-600 text-yellow-100' :
                    order.status === 'processing' ? 'bg-blue-600 text-blue-100' :
                    order.status === 'shipped' ? 'bg-teal-600 text-teal-100' :
                    order.status === 'delivered' ? 'bg-green-600 text-green-100' :
                    order.status === 'cancelled' ? 'bg-red-600 text-red-100' :
                    'bg-gray-500 text-gray-100'
                  }`}>
                    {order.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                   <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    order.payment_status === 'paid' ? 'bg-green-600 text-green-100' :
                    order.payment_status === 'unpaid' ? 'bg-yellow-600 text-yellow-100' :
                    'bg-gray-500 text-gray-100'
                  }`}>
                    {order.payment_status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <Link
                    to={`/admin/orders/${order.id}`}
                    className="text-indigo-400 hover:text-indigo-300 transition-colors"
                  >
                    View Details
                  </Link>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="7" className="px-6 py-4 text-center text-sm text-gray-400">
                  No orders found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminOrdersPage;
