import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext'; // To check if user is authenticated

const CartPage = () => {
  const { 
    cart, 
    isLoading, 
    error, 
    updateItemQuantity, 
    removeItemFromCart, 
    clearUserCart 
  } = useCart();
  const { isAuthenticated } = useAuth();

  // Local state for quantity inputs to avoid direct context updates on every keystroke
  const [itemQuantities, setItemQuantities] = useState({});

  // Initialize local quantities when cart data loads or changes
  React.useEffect(() => {
    if (cart && cart.items) {
      const quantities = {};
      cart.items.forEach(item => {
        quantities[item.cartItemId] = item.quantity;
      });
      setItemQuantities(quantities);
    }
  }, [cart]);

  const handleQuantityChange = (itemId, newQuantityStr) => {
    const newQuantity = parseInt(newQuantityStr, 10);
    setItemQuantities(prev => ({ ...prev, [itemId]: newQuantity }));
    // Debounce or provide an update button for actual API call
    // For simplicity, this example might update on blur or with a button
  };
  
  const handleUpdateItem = (itemId) => {
    const quantity = itemQuantities[itemId];
    if (quantity === undefined || isNaN(quantity) || quantity < 0) {
        // Handle invalid input, maybe show an error or reset to original quantity
        // For now, if it's invalid, we won't call the update.
        // Reset to original quantity from cart if needed
        const originalItem = cart.items.find(item => item.cartItemId === itemId);
        if (originalItem) {
            setItemQuantities(prev => ({ ...prev, [itemId]: originalItem.quantity }));
        }
        return;
    }
    updateItemQuantity(itemId, quantity);
  };


  if (!isAuthenticated) {
    return (
      <div className="p-4 text-center text-xl text-gray-300 min-h-screen bg-gray-900 flex flex-col items-center justify-center">
        <p>Please <Link to="/login" className="text-indigo-400 hover:underline">log in</Link> to view your cart.</p>
      </div>
    );
  }
  
  if (isLoading) {
    return <div className="p-4 text-center text-xl text-gray-300 min-h-screen bg-gray-900 flex items-center justify-center">Loading cart...</div>;
  }

  if (error) {
    return <div className="p-4 text-center text-red-400 min-h-screen bg-gray-900 flex items-center justify-center">Error: {error}</div>;
  }

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="p-4 text-center text-xl text-gray-300 min-h-screen bg-gray-900 flex flex-col items-center justify-center">
        <h1 className="text-3xl font-bold text-indigo-400 mb-6">Your Cart is Empty</h1>
        <Link to="/products" className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-md transition duration-150 ease-in-out">
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 bg-gray-900 text-white min-h-screen">
      <div className="container mx-auto max-w-3xl">
        <h1 className="text-3xl sm:text-4xl font-bold text-indigo-400 mb-8 text-center">Your Shopping Cart</h1>
        
        <div className="bg-gray-800 shadow-xl rounded-lg p-6 mb-8">
          {cart.items.map(item => (
            <div key={item.cartItemId} className="flex flex-col sm:flex-row items-center justify-between py-4 border-b border-gray-700 last:border-b-0">
              <div className="flex items-center mb-4 sm:mb-0">
                {/* Placeholder for image */}
                <div className="w-20 h-20 bg-gray-700 rounded-md mr-4 flex-shrink-0"></div>
                <div>
                  <h2 className="text-lg font-semibold text-indigo-300">{item.productName}</h2>
                  <p className="text-sm text-gray-400">Price: ${parseFloat(item.priceAtAddition).toFixed(2)}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 sm:space-x-4">
                <div className="flex items-center">
                  <label htmlFor={`quantity-${item.cartItemId}`} className="sr-only">Quantity</label>
                  <input 
                    type="number" 
                    id={`quantity-${item.cartItemId}`}
                    value={itemQuantities[item.cartItemId] || ''} 
                    onChange={(e) => handleQuantityChange(item.cartItemId, e.target.value)}
                    onBlur={() => handleUpdateItem(item.cartItemId)} // Update on blur
                    min="0" // Allow 0 to trigger removal on update
                    className="w-16 px-2 py-1 bg-gray-700 border border-gray-600 rounded-md text-white text-center focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  {/* Optional: Explicit update button if onBlur is not preferred 
                  <button onClick={() => handleUpdateItem(item.cartItemId)} className="ml-2 p-1 bg-blue-500 rounded">Update</button> 
                  */}
                </div>
                <p className="text-md font-semibold w-24 text-right">
                  Item Total: ${(parseFloat(item.priceAtAddition) * item.quantity).toFixed(2)}
                </p>
                <button 
                  onClick={() => removeItemFromCart(item.cartItemId)}
                  className="text-red-400 hover:text-red-600 font-semibold transition-colors"
                  title="Remove item"
                >
                  &times;
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-gray-800 shadow-xl rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Total Items:</h2>
            <p className="text-xl font-bold">{cart.totalItems}</p>
          </div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-indigo-300">Grand Total:</h2>
            <p className="text-2xl font-bold text-green-400">${parseFloat(cart.totalPrice).toFixed(2)}</p>
          </div>
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0 sm:space-x-4">
            <button 
              onClick={clearUserCart}
              className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-md transition duration-150 ease-in-out"
              disabled={isLoading}
            >
              {isLoading ? 'Clearing...' : 'Clear Cart'}
            </button>
            <Link 
              to="/checkout" // Placeholder for checkout page
              className="w-full sm:w-auto text-center bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-md transition duration-150 ease-in-out"
            >
              Proceed to Checkout
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
