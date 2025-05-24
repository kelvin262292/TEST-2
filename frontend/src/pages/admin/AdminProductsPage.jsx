import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getAllProducts, deleteProduct } from '../../services/productService';
import { useAuth } from '../../contexts/AuthContext'; // For potential role checks if needed, though AdminRoute handles access

const AdminProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteError, setDeleteError] = useState(null); // Specific error for delete operations
  const [deleteSuccess, setDeleteSuccess] = useState(''); // Success message for delete

  // Memoize fetchProducts to prevent re-fetching on every render if not needed
  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setDeleteError(null);
    setDeleteSuccess('');
    try {
      const data = await getAllProducts();
      setProducts(data);
    } catch (err) {
      console.error("AdminProductsPage fetch error:", err);
      setError(err.message || 'Failed to fetch products.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleDeleteProduct = async (productId, productName) => {
    if (window.confirm(`Are you sure you want to delete product: ${productName} (ID: ${productId})? This action cannot be undone.`)) {
      setIsLoading(true); // Use main loading state or a specific delete loading state
      setDeleteError(null);
      setDeleteSuccess('');
      try {
        await deleteProduct(productId);
        setDeleteSuccess(`Product ${productName} (ID: ${productId}) deleted successfully.`);
        // Refresh product list
        fetchProducts(); // Re-fetch all products
        // Alternative: Optimistically update UI by filtering out the deleted product
        // setProducts(prevProducts => prevProducts.filter(p => p.id !== productId));
      } catch (err) {
        console.error(`Error deleting product ${productId}:`, err);
        setDeleteError(err.message || `Failed to delete product ${productName}.`);
      } finally {
        setIsLoading(false);
         setTimeout(() => { // Clear messages after a few seconds
            setDeleteError(null);
            setDeleteSuccess('');
        }, 3000);
      }
    }
  };

  if (isLoading && products.length === 0) { // Show initial loading only if no products are yet displayed
    return (
      <div className="p-6 text-center text-xl text-gray-300">
        Loading products...
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-800 shadow-lg rounded-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-indigo-400">Manage Products</h2>
        <Link
          to="/admin/products/new"
          className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-md shadow-md transition duration-150 ease-in-out"
        >
          Add New Product
        </Link>
      </div>

      {error && (
        <div className="bg-red-700 border border-red-900 text-red-100 px-4 py-3 rounded relative mb-4" role="alert">
          <strong className="font-bold">Error fetching products: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      {deleteError && (
        <div className="bg-red-700 border border-red-900 text-red-100 px-4 py-3 rounded relative mb-4" role="alert">
          <strong className="font-bold">Error deleting product: </strong>
          <span className="block sm:inline">{deleteError}</span>
        </div>
      )}
      {deleteSuccess && (
        <div className="bg-green-700 border border-green-900 text-green-100 px-4 py-3 rounded relative mb-4" role="alert">
          <span className="block sm:inline">{deleteSuccess}</span>
        </div>
      )}

      {isLoading && <p className="text-center text-gray-400 py-2">Refreshing product list...</p>}


      <div className="overflow-x-auto bg-gray-700 rounded-lg shadow">
        <table className="min-w-full table-auto">
          <thead className="bg-gray-600">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Price</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Stock</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Category</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-600">
            {products.length > 0 ? products.map((product) => (
              <tr key={product.id} className="hover:bg-gray-650 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-200">{product.id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-indigo-300">{product.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-200">${parseFloat(product.price).toFixed(2)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-200">{product.stock_quantity}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-200">{product.category_name || product.category_id || 'N/A'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  <Link
                    to={`/admin/products/edit/${product.id}`}
                    className="text-yellow-400 hover:text-yellow-300 transition-colors"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDeleteProduct(product.id, product.name)}
                    className="text-red-500 hover:text-red-400 transition-colors"
                    disabled={isLoading} // Disable while any loading is happening
                  >
                    Delete
                  </button>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-400">
                  No products found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminProductsPage;
