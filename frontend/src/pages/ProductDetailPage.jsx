import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getProductById } from '../services/productService';
import { useCart } from '../contexts/CartContext'; // Import useCart
import { useAuth } from '../contexts/AuthContext'; // Import useAuth to check authentication

const ProductDetailPage = () => {
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const [isLoadingProduct, setIsLoadingProduct] = useState(true);
  const [productError, setProductError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [feedbackMessage, setFeedbackMessage] = useState(''); // For add to cart feedback

  const { addToCart, isLoading: isLoadingCart, error: cartError } = useCart(); // Get cart context
  const { isAuthenticated } = useAuth(); // Get auth status
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProductDetails = async () => {
      if (!productId) return;
      setIsLoadingProduct(true);
      setProductError(null);
      try {
        const data = await getProductById(productId);
        setProduct(data);
      } catch (err) {
        console.error(`Error fetching product details for ID ${productId}:`, err);
        setProductError(err.message || `Failed to fetch product details for product ID ${productId}.`);
      } finally {
        setIsLoadingProduct(false);
      }
    };
    fetchProductDetails();
  }, [productId]);

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      // Redirect to login or show a message
      setFeedbackMessage('You must be logged in to add items to the cart.');
      setTimeout(() => navigate('/login', { state: { from: location } }), 2000);
      return;
    }
    if (!product || quantity <= 0) return;
    
    setFeedbackMessage(''); // Clear previous feedback
    try {
      await addToCart(product.id, quantity);
      setFeedbackMessage(`${product.name} (x${quantity}) added to cart!`);
      // Optionally clear message after a few seconds
      setTimeout(() => setFeedbackMessage(''), 3000);
    } catch (err) {
      // Error is already handled by CartContext, but we can show specific feedback here too
      setFeedbackMessage(cartError || 'Failed to add item. Please try again.');
       setTimeout(() => setFeedbackMessage(''), 3000);
    }
  };

  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value, 10);
    if (value > 0 && value <= (product?.stock_quantity || 1)) {
      setQuantity(value);
    } else if (value <= 0) {
      setQuantity(1);
    } else if (product?.stock_quantity && value > product.stock_quantity) {
      setQuantity(product.stock_quantity);
    }
  };


  if (isLoadingProduct) {
    return (
      <div className="p-4 text-center text-xl text-gray-300 min-h-screen bg-gray-900 flex items-center justify-center">
        Loading product details...
      </div>
    );
  }

  if (productError) {
    return (
      <div className="p-4 text-center min-h-screen bg-gray-900 flex flex-col items-center justify-center">
        <div className="bg-red-700 border border-red-900 text-red-100 px-4 py-3 rounded relative mb-4" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{productError}</span>
        </div>
        <Link to="/products" className="text-indigo-400 hover:text-indigo-500 underline">
          Back to Products
        </Link>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="p-4 text-center text-xl text-gray-300 min-h-screen bg-gray-900 flex items-center justify-center">
        Product not found.
         <Link to="/products" className="ml-2 text-indigo-400 hover:text-indigo-500 underline">
          Back to Products
        </Link>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 bg-gray-900 text-white min-h-screen">
      <div className="container mx-auto max-w-4xl">
        <div className="bg-gray-800 shadow-2xl rounded-lg overflow-hidden md:flex">
          <div className="md:w-1/2 bg-gray-700 flex items-center justify-center p-8">
            <div className="w-full h-64 md:h-96 bg-gray-600 rounded flex items-center justify-center">
              <span className="text-gray-400 text-xl">Product Image Placeholder</span>
            </div>
          </div>

          <div className="md:w-1/2 p-6 md:p-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-indigo-400 mb-4">{product.name}</h1>
            <p className="text-gray-300 mb-6 leading-relaxed">
              {product.description || 'No description available.'}
            </p>
            <div className="mb-6">
              <span className="text-gray-400 text-sm">Category: </span>
              <span className="text-indigo-300 font-semibold">{product.category_name || 'N/A'}</span>
            </div>
            <div className="flex justify-between items-center mb-6">
              <p className="text-4xl font-extrabold text-green-400">
                ${parseFloat(product.price).toFixed(2)}
              </p>
              <span className={`px-3 py-1 text-sm font-semibold rounded-full ${
                product.stock_quantity > 0 ? 'bg-green-600 text-green-100' : 'bg-red-600 text-red-100'
              }`}>
                {product.stock_quantity > 0 ? `${product.stock_quantity} in stock` : 'Out of Stock'}
              </span>
            </div>

            {/* Quantity Input and Add to Cart Button */}
            <div className="flex items-center space-x-4 mb-6">
              <label htmlFor="quantity" className="text-sm font-medium text-gray-300">Quantity:</label>
              <input
                type="number"
                id="quantity"
                name="quantity"
                min="1"
                max={product.stock_quantity || 1}
                value={quantity}
                onChange={handleQuantityChange}
                className="w-20 px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                disabled={!product.stock_quantity || product.stock_quantity === 0}
              />
            </div>
            
            {/* Feedback Message Area */}
            {feedbackMessage && (
              <div className={`mb-4 p-3 rounded-md text-sm ${
                cartError || feedbackMessage.startsWith('You must be logged in') ? 'bg-red-700 text-red-100' : 'bg-green-700 text-green-100'
              }`}>
                {feedbackMessage}
              </div>
            )}
            {cartError && !feedbackMessage && ( // Show general cart error if no specific feedback is set
                 <div className="mb-4 p-3 rounded-md text-sm bg-red-700 text-red-100">
                    Error: {cartError}
                </div>
            )}


            <button 
              type="button"
              onClick={handleAddToCart}
              disabled={isLoadingCart || !product.stock_quantity || product.stock_quantity === 0}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg shadow-md transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoadingCart ? 'Adding...' : 'Add to Cart'}
            </button>

            <div className="mt-8 text-center">
              <Link to="/products" className="text-indigo-400 hover:text-indigo-500 underline transition-colors duration-300">
                &larr; Back to All Products
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
