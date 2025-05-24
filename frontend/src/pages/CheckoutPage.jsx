import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext'; // To prefill user info if available
import { placeOrder } from '../services/orderService';

const CheckoutPage = () => {
  const { cart, isLoading: isCartLoading, error: cartError, fetchCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [shippingAddress, setShippingAddress] = useState({
    fullName: user?.name || '', // Pre-fill if user is logged in
    addressLine1: '',
    addressLine2: '',
    city: '',
    stateProvince: '',
    postalCode: '',
    country: '',
    phone: '',
  });
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [orderError, setOrderError] = useState(null);
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    if (!isCartLoading && (!cart || cart.items.length === 0)) {
      // If cart is empty or becomes empty, redirect to products or cart page
      navigate('/products'); 
    }
  }, [cart, isCartLoading, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setShippingAddress(prev => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!shippingAddress.fullName.trim()) errors.fullName = "Full name is required.";
    if (!shippingAddress.addressLine1.trim()) errors.addressLine1 = "Address line 1 is required.";
    if (!shippingAddress.city.trim()) errors.city = "City is required.";
    if (!shippingAddress.postalCode.trim()) errors.postalCode = "Postal code is required.";
    if (!shippingAddress.country.trim()) errors.country = "Country is required.";
    if (!shippingAddress.phone.trim()) errors.phone = "Phone number is required.";
    // Basic phone regex (very simple, consider a library for robust validation)
    else if (!/^\+?[0-9\s-()]{7,20}$/.test(shippingAddress.phone)) errors.phone = "Invalid phone number format.";
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsPlacingOrder(true);
    setOrderError(null);

    const backendShippingAddress = {
        street: `${shippingAddress.addressLine1}${shippingAddress.addressLine2 ? ', ' + shippingAddress.addressLine2 : ''}`,
        city: shippingAddress.city,
        state: shippingAddress.stateProvince,
        postalCode: shippingAddress.postalCode,
        country: shippingAddress.country,
        // Note: Backend schema has 'shipping_address' as a single JSONB field.
        // The backend service's createOrder expects { userId, shippingAddress: { street, city, postalCode, country, state } }
        // The 'phone' number is not in the backend's 'shipping_address' JSONB structure in schema.sql
        // For now, it's collected but not directly passed if not in backend schema.
        // If it should be part of shipping_address, the backend service needs to handle it.
        // For now, let's assume the backend expects the defined structure.
    };


    try {
      const newOrder = await placeOrder(backendShippingAddress); // Pass the structured address
      await fetchCart(); // Refresh/clear cart from CartContext
      navigate(`/order-confirmation/${newOrder.id}`);
    } catch (err) {
      console.error('Error placing order:', err);
      setOrderError(err.message || 'Failed to place order. Please try again.');
    } finally {
      setIsPlacingOrder(false);
    }
  };
  
  if (isCartLoading) return <div className="p-4 text-center text-xl">Loading cart...</div>;
  if (cartError) return <div className="p-4 text-center text-red-500">Error loading cart: {cartError}</div>;
  if (!cart || cart.items.length === 0) {
    return (
      <div className="p-4 text-center text-xl text-gray-300 min-h-screen bg-gray-900 flex flex-col items-center justify-center">
        <p className="mb-4">Your cart is empty. Add some products before checking out.</p>
        <Link to="/products" className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded">
          Shop Products
        </Link>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 bg-gray-900 text-white min-h-screen">
      <div className="container mx-auto max-w-4xl">
        <h1 className="text-3xl sm:text-4xl font-bold text-indigo-400 mb-8 text-center">Checkout</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Shipping Address Form */}
          <div className="bg-gray-800 shadow-xl rounded-lg p-6">
            <h2 className="text-2xl font-semibold text-indigo-300 mb-6">Shipping Address</h2>
            <form onSubmit={handleSubmitOrder} noValidate>
              {/* Form fields */}
              {Object.keys(shippingAddress).map((key) => (
                <div className="mb-4" key={key}>
                  <label htmlFor={key} className="block text-sm font-medium text-gray-300 capitalize">
                    {key.replace(/([A-Z])/g, ' $1').replace('address Line', 'Address Line')}
                    {['fullName', 'addressLine1', 'city', 'postalCode', 'country', 'phone'].includes(key) ? '*' : ''}
                  </label>
                  <input
                    type={key === 'phone' ? 'tel' : 'text'}
                    id={key}
                    name={key}
                    value={shippingAddress[key]}
                    onChange={handleInputChange}
                    required={['fullName', 'addressLine1', 'city', 'postalCode', 'country', 'phone'].includes(key)}
                    className={`mt-1 block w-full px-3 py-2 bg-gray-700 border rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:text-sm ${formErrors[key] ? 'border-red-500' : 'border-gray-600'}`}
                  />
                  {formErrors[key] && <p className="mt-1 text-xs text-red-400">{formErrors[key]}</p>}
                </div>
              ))}
              
              <div className="mt-8">
                <h2 className="text-2xl font-semibold text-indigo-300 mb-4">Payment Method</h2>
                <p className="text-gray-300 bg-gray-700 p-3 rounded-md">Cash on Delivery (COD)</p>
              </div>

              {orderError && (
                <div className="mt-4 bg-red-700 border border-red-900 text-red-100 px-4 py-3 rounded" role="alert">
                  <strong className="font-bold">Order Error: </strong>
                  <span>{orderError}</span>
                </div>
              )}

              <button 
                type="submit"
                disabled={isPlacingOrder || isCartLoading}
                className="mt-8 w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg shadow-md transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isPlacingOrder ? 'Placing Order...' : `Place Order (${parseFloat(cart.totalPrice).toFixed(2)})`}
              </button>
            </form>
          </div>

          {/* Cart Summary */}
          <div className="bg-gray-800 shadow-xl rounded-lg p-6 md:sticky md:top-24 self-start">
            <h2 className="text-2xl font-semibold text-indigo-300 mb-6">Order Summary</h2>
            {cart.items.map(item => (
              <div key={item.cartItemId} className="flex justify-between items-center py-2 border-b border-gray-700 last:border-b-0">
                <div>
                  <p className="font-medium text-gray-200">{item.productName} (x{item.quantity})</p>
                  <p className="text-xs text-gray-400">Price per item: ${parseFloat(item.priceAtAddition).toFixed(2)}</p>
                </div>
                <p className="font-semibold text-gray-200">${(item.quantity * item.priceAtAddition).toFixed(2)}</p>
              </div>
            ))}
            <div className="mt-6 pt-4 border-t border-gray-700">
              <div className="flex justify-between items-center text-lg font-bold">
                <span className="text-indigo-300">Total Items:</span>
                <span className="text-gray-200">{cart.totalItems}</span>
              </div>
              <div className="flex justify-between items-center text-2xl font-extrabold mt-2">
                <span className="text-green-400">Grand Total:</span>
                <span className="text-green-400">${parseFloat(cart.totalPrice).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
