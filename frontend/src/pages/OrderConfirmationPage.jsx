import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getOrderById } from '../services/orderService'; // Assuming you have this service function
import { useAuth } from '../contexts/AuthContext'; // To ensure user is authenticated

const OrderConfirmationPage = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      // Should be handled by ProtectedRoute, but as a fallback
      setIsLoading(false);
      setError("User not authenticated.");
      return;
    }

    if (orderId) {
      setIsLoading(true);
      setError(null);
      getOrderById(orderId)
        .then(data => {
          setOrder(data);
        })
        .catch(err => {
          console.error(`Error fetching order ${orderId}:`, err);
          setError(err.message || `Failed to fetch order details for order ID ${orderId}.`);
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setError("No order ID provided.");
      setIsLoading(false);
    }
  }, [orderId, isAuthenticated]);

  if (isLoading) {
    return (
      <div className="p-4 text-center text-xl text-gray-300 min-h-screen bg-gray-900 flex items-center justify-center">
        Loading order confirmation...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center min-h-screen bg-gray-900 flex flex-col items-center justify-center">
        <div className="bg-red-700 border border-red-900 text-red-100 px-4 py-3 rounded relative mb-4" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
        <Link to="/" className="text-indigo-400 hover:text-indigo-500 underline">
          Go to Homepage
        </Link>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="p-4 text-center text-xl text-gray-300 min-h-screen bg-gray-900 flex items-center justify-center">
        Order details not found.
      </div>
    );
  }
  
  // Helper to format shipping address from JSONB
  const formatAddress = (address) => {
    if (!address) return 'N/A';
    // Assuming address is an object like { street, city, state, postalCode, country }
    return `${address.street}, ${address.city}${address.state ? ', ' + address.state : ''}, ${address.postalCode}, ${address.country}`;
  };

  return (
    <div className="p-4 sm:p-8 bg-gray-900 text-white min-h-screen flex items-center justify-center">
      <div className="container mx-auto max-w-2xl bg-gray-800 shadow-2xl rounded-lg p-8 text-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-green-400 mx-auto mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h1 className="text-3xl sm:text-4xl font-bold text-green-400 mb-4">Thank You For Your Order!</h1>
        <p className="text-gray-300 mb-8 text-lg">
          Your order has been placed successfully. We'll process it shortly.
        </p>

        <div className="bg-gray-700 rounded-md p-6 text-left space-y-4 mb-8">
          <div>
            <span className="font-semibold text-indigo-300">Order ID:</span>
            <span className="ml-2 text-gray-200">{order.id}</span>
          </div>
          <div>
            <span className="font-semibold text-indigo-300">Total Amount:</span>
            <span className="ml-2 text-gray-200">${parseFloat(order.total_amount).toFixed(2)}</span>
          </div>
          <div>
            <span className="font-semibold text-indigo-300">Shipping Address:</span>
            <span className="ml-2 text-gray-200">{formatAddress(order.shipping_address)}</span>
          </div>
           <div>
            <span className="font-semibold text-indigo-300">Payment Method:</span>
            <span className="ml-2 text-gray-200">{order.payment_method}</span>
          </div>
           <div>
            <span className="font-semibold text-indigo-300">Order Status:</span>
            <span className="ml-2 text-gray-200 capitalize">{order.status}</span>
          </div>
        </div>
        
        <h2 className="text-xl font-semibold text-indigo-300 mb-3">Order Items:</h2>
        <div className="bg-gray-700 rounded-md p-4 text-left space-y-2 mb-8 max-h-60 overflow-y-auto">
            {order.items && order.items.map(item => (
                <div key={item.orderItemId || item.productId} className="flex justify-between text-sm">
                    <span>{item.productName || `Product ID: ${item.productId}`} (x{item.quantity})</span>
                    <span>${parseFloat(item.priceAtPurchase).toFixed(2)}</span>
                </div>
            ))}
        </div>


        <Link 
          to="/products" 
          className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-lg shadow-md transition-all duration-300 ease-in-out text-lg"
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  );
};

export default OrderConfirmationPage;
