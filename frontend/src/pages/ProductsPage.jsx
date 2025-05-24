import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getAllProducts } from '../services/productService';
import { useCart } from '../contexts/CartContext'; // Import useCart
import { useAuth } from '../contexts/AuthContext'; // Import useAuth for checking authentication

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { addToCart, isLoading: isCartLoading, error: cartError } = useCart(); // Get cart context
  const { isAuthenticated } = useAuth(); // Get auth status
  const navigate = useNavigate();
  const [feedback, setFeedback] = useState({}); // To store feedback per product { productId: "message" }

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await getAllProducts();
        setProducts(data);
      } catch (err) {
        console.error("ProductsPage fetch error:", err);
        setError(err.message || 'Failed to fetch products. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const handleAddToCart = async (productId, productName) => {
    if (!isAuthenticated) {
      // Redirect to login or show a message
      // For simplicity, we might rely on a global message or redirect from addToCart in context
      // Or, show a specific message here:
      setFeedback({ [productId]: "Please log in to add items." });
      setTimeout(() => {
        setFeedback({});
        // navigate('/login', { state: { from: location } }); // location is not defined here, use window.location or pass it
      }, 2000);
      return;
    }
    setFeedback({ [productId]: "Adding..." });
    try {
      await addToCart(productId, 1); // Add 1 quantity by default from product listing
      setFeedback({ [productId]: `${productName} added!` });
    } catch (err) {
      setFeedback({ [productId]: cartError || "Failed to add." });
    }
    setTimeout(() => setFeedback({}), 2000); // Clear feedback after 2 seconds
  };


  if (isLoading) {
    return (
      <div className="p-4 text-center text-xl text-gray-300 min-h-screen bg-gray-900 flex items-center justify-center">
        Loading products...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center min-h-screen bg-gray-900 flex flex-col items-center justify-center">
        <div className="bg-red-700 border border-red-900 text-red-100 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="p-4 text-center text-xl text-gray-300 min-h-screen bg-gray-900 flex items-center justify-center">
        No products found.
      </div>
    );
  }

  return (
    <div className="p-4 bg-gray-900 text-white min-h-screen">
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold text-indigo-400 mb-8 text-center">Our Products</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <div 
              key={product.id} 
              className="bg-gray-800 rounded-lg shadow-lg overflow-hidden flex flex-col justify-between transform transition-all duration-300 hover:scale-105 hover:shadow-2xl"
            >
              <div>
                <Link to={`/products/${product.id}`} className="block">
                  <div className="w-full h-48 bg-gray-700 flex items-center justify-center">
                    <span className="text-gray-500 text-sm">Product Image</span>
                  </div>
                  <div className="p-4">
                    <h2 className="text-xl font-semibold text-indigo-300 mb-2 truncate" title={product.name}>
                      {product.name}
                    </h2>
                    <p className="text-gray-400 text-sm mb-3 h-10 overflow-hidden">
                      {product.description ? `${product.description.substring(0, 60)}...` : 'No description available.'}
                    </p>
                    <p className="text-2xl font-bold text-green-400 mb-1">
                      ${parseFloat(product.price).toFixed(2)}
                    </p>
                     <span className={`text-xs font-semibold ${
                        product.stock_quantity > 0 ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {product.stock_quantity > 0 ? `${product.stock_quantity} in stock` : 'Out of Stock'}
                    </span>
                  </div>
                </Link>
              </div>
              <div className="p-4 pt-0">
                {feedback[product.id] && (
                  <p className={`text-xs mb-2 ${feedback[product.id].includes("Failed") || feedback[product.id].includes("log in") ? 'text-red-400' : 'text-green-400'}`}>
                    {feedback[product.id]}
                  </p>
                )}
                <button
                  onClick={() => handleAddToCart(product.id, product.name)}
                  disabled={isCartLoading || !product.stock_quantity || product.stock_quantity === 0 || feedback[product.id] === "Adding..."}
                  className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-2 px-4 rounded-md transition duration-150 ease-in-out text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {feedback[product.id] === "Adding..." ? 'Adding...' : 'Add to Cart'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;
