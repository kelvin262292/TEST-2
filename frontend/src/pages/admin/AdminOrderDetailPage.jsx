import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getOrderByAdmin, updateOrderStatus } from '../../services/orderService';
import { useAuth } from '../../contexts/AuthContext'; // For role checks if needed

const AdminOrderDetailPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [statusUpdateError, setStatusUpdateError] = useState(null);
  const [statusUpdateSuccess, setStatusUpdateSuccess] = useState('');

  // Available order statuses
  const orderStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

  const fetchOrderDetails = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setStatusUpdateError(null);
    setStatusUpdateSuccess('');
    try {
      const data = await getOrderByAdmin(orderId);
      setOrder(data);
    } catch (err) {
      console.error(`Error fetching order ${orderId} for admin:`, err);
      setError(err.message || `Failed to fetch order details for ID ${orderId}.`);
    } finally {
      setIsLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    fetchOrderDetails();
  }, [fetchOrderDetails]);

  const handleStatusChange = async (newStatus) => {
    if (!order || newStatus === order.status) return;

    setIsUpdatingStatus(true);
    setStatusUpdateError(null);
    setStatusUpdateSuccess('');
    try {
      const updatedOrder = await updateOrderStatus(orderId, newStatus);
      setOrder(updatedOrder); // Update local state with the response from backend
      setStatusUpdateSuccess(`Order status successfully updated to ${newStatus}.`);
    } catch (err) {
      console.error(`Error updating status for order ${orderId}:`, err);
      setStatusUpdateError(err.message || 'Failed to update order status.');
    } finally {
      setIsUpdatingStatus(false);
      setTimeout(() => { // Clear messages after a few seconds
            setStatusUpdateError(null);
            setStatusUpdateSuccess('');
        }, 3000);
    }
  };
  
  const formatAddress = (address) => {
    if (!address) return 'N/A';
    return `${address.street}, ${address.city}${address.state ? ', ' + address.state : ''}, ${address.postalCode}, ${address.country}`;
  };
  
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };


  if (isLoading) {
    return <div className="p-6 text-center text-xl text-gray-300">Loading order details...</div>;
  }

  if (error) {
    return (
      <div className="p-6 bg-gray-800 shadow-lg rounded-lg">
        <h2 className="text-2xl font-bold text-red-500 mb-6">Error Loading Order</h2>
        <div className="bg-red-700 border border-red-900 text-red-100 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
         <Link 
            to="/admin/orders" 
            className="mt-4 inline-block text-sm text-indigo-400 hover:text-indigo-300"
        >
            &larr; Back to Order List
        </Link>
      </div>
    );
  }

  if (!order) {
    return <div className="p-6 text-center text-xl text-gray-300">Order not found.</div>;
  }

  return (
    <div className="p-6 bg-gray-800 shadow-lg rounded-lg text-gray-200">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-indigo-400">Order Details - ID: {order.id}</h2>
        <Link 
          to="/admin/orders" 
          className="text-sm text-indigo-400 hover:text-indigo-300"
        >
          &larr; Back to Order List
        </Link>
      </div>

      {/* Status Update Feedback */}
      {statusUpdateError && (
        <div className="bg-red-700 border border-red-900 text-red-100 px-4 py-3 rounded relative mb-4" role="alert">
          <strong className="font-bold">Status Update Failed: </strong>
          <span className="block sm:inline">{statusUpdateError}</span>
        </div>
      )}
      {statusUpdateSuccess && (
        <div className="bg-green-700 border border-green-900 text-green-100 px-4 py-3 rounded relative mb-4" role="alert">
          <span className="block sm:inline">{statusUpdateSuccess}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        <div className="bg-gray-700 p-4 rounded-lg shadow">
          <h3 className="font-semibold text-indigo-300 mb-1">User ID:</h3>
          <p>{order.user_id || 'N/A'}</p>
          {/* Placeholder for user email - needs to be added to order details from backend if required */}
          {/* <h3 className="font-semibold text-indigo-300 mt-2 mb-1">User Email:</h3>
          <p>{order.user_email || 'N/A'}</p> */}
        </div>
        <div className="bg-gray-700 p-4 rounded-lg shadow">
          <h3 className="font-semibold text-indigo-300 mb-1">Order Date:</h3>
          <p>{formatDate(order.created_at)}</p>
        </div>
        <div className="bg-gray-700 p-4 rounded-lg shadow">
          <h3 className="font-semibold text-indigo-300 mb-1">Total Amount:</h3>
          <p className="text-xl font-bold text-green-400">${parseFloat(order.total_amount).toFixed(2)}</p>
        </div>
        <div className="bg-gray-700 p-4 rounded-lg shadow">
          <h3 className="font-semibold text-indigo-300 mb-1">Payment Method:</h3>
          <p>{order.payment_method}</p>
        </div>
        <div className="bg-gray-700 p-4 rounded-lg shadow">
          <h3 className="font-semibold text-indigo-300 mb-1">Payment Status:</h3>
          <p className="capitalize">{order.payment_status}</p>
        </div>
         <div className="bg-gray-700 p-4 rounded-lg shadow">
          <h3 className="font-semibold text-indigo-300 mb-1">Current Order Status:</h3>
          <p className="capitalize font-bold">{order.status}</p>
        </div>
      </div>

      <div className="bg-gray-700 p-4 rounded-lg shadow mb-6">
        <h3 className="font-semibold text-indigo-300 mb-1">Shipping Address:</h3>
        <p>{formatAddress(order.shipping_address)}</p>
      </div>

      {/* Update Order Status Section */}
      <div className="bg-gray-700 p-6 rounded-lg shadow mb-6">
        <h3 className="text-xl font-semibold text-indigo-300 mb-3">Update Order Status</h3>
        <div className="flex items-center space-x-3">
          <select
            value={order.status}
            onChange={(e) => handleStatusChange(e.target.value)}
            disabled={isUpdatingStatus}
            className="px-3 py-2 bg-gray-600 border border-gray-500 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {orderStatuses.map(status => (
              <option key={status} value={status} className="capitalize">{status.charAt(0).toUpperCase() + status.slice(1)}</option>
            ))}
          </select>
          <button
            onClick={() => handleStatusChange(document.querySelector('select').value)} // Re-submit current select value
            disabled={isUpdatingStatus}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-md shadow-md transition duration-150 ease-in-out disabled:opacity-50"
          >
            {isUpdatingStatus ? 'Updating...' : 'Save Status'}
          </button>
        </div>
      </div>

      {/* Order Items Table */}
      <div className="bg-gray-700 p-4 rounded-lg shadow">
        <h3 className="text-xl font-semibold text-indigo-300 mb-4">Order Items</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto">
            <thead className="bg-gray-600">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Product ID</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Product Name</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Quantity</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Price at Purchase</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Row Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-600">
              {order.items && order.items.length > 0 ? order.items.map(item => (
                <tr key={item.orderItemId || item.productId}>
                  <td className="px-4 py-3 whitespace-nowrap text-sm">{item.productId}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-indigo-300">{item.productName}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm">{item.quantity}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm">${parseFloat(item.priceAtPurchase).toFixed(2)}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm">${(item.quantity * parseFloat(item.priceAtPurchase)).toFixed(2)}</td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-400">No items found for this order.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminOrderDetailPage;
