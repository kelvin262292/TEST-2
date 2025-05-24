import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import ProductForm from '../../components/admin/ProductForm';
import { getProductById, updateProduct } from '../../services/productService';

const AdminEditProductPage = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [initialData, setInitialData] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // Combined loading state for fetch and update
  const [serverError, setServerError] = useState(null);

  const fetchProductData = useCallback(async () => {
    setIsLoading(true);
    setServerError(null);
    try {
      const data = await getProductById(productId);
      // Ensure all form fields have string values or empty strings for controlled components
      setInitialData({
        name: data.name || '',
        description: data.description || '',
        price: data.price !== null && data.price !== undefined ? String(data.price) : '',
        stock_quantity: data.stock_quantity !== null && data.stock_quantity !== undefined ? String(data.stock_quantity) : '',
        category_id: data.category_id !== null && data.category_id !== undefined ? String(data.category_id) : '',
      });
    } catch (error) {
      console.error(`Failed to fetch product ${productId}:`, error);
      setServerError(error.message || `Failed to load product data for ID ${productId}.`);
      setInitialData(null); // Ensure form doesn't try to render with partial/old data
    } finally {
      setIsLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    fetchProductData();
  }, [fetchProductData]);

  const handleEditProduct = async (formData) => {
    setIsLoading(true);
    setServerError(null);
    try {
      await updateProduct(productId, formData);
      navigate('/admin/products', { state: { successMessage: `Product ID ${productId} updated successfully!` } });
    } catch (error) {
      console.error(`Failed to update product ${productId}:`, error);
      setServerError(error.message || 'An unexpected error occurred. Please try again.');
      setIsLoading(false); 
    }
  };

  if (isLoading && !initialData) { // Show loading only if data hasn't been fetched yet
    return (
      <div className="p-6 text-center text-xl text-gray-300">
        Loading product data...
      </div>
    );
  }
  
  // Show error if initialData is null after trying to fetch (and not loading anymore)
  // This means fetching failed and we can't render the form.
  if (!initialData && !isLoading) {
     return (
        <div className="p-6 bg-gray-800 shadow-lg rounded-lg">
             <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-red-500">Error Loading Product</h2>
                 <Link 
                    to="/admin/products" 
                    className="text-sm text-indigo-400 hover:text-indigo-300"
                >
                    &larr; Back to Product List
                </Link>
            </div>
            <div className="bg-red-700 border border-red-900 text-red-100 px-4 py-3 rounded relative" role="alert">
                <strong className="font-bold">Failed to load product: </strong>
                <span className="block sm:inline">{serverError || "Unknown error."}</span>
            </div>
        </div>
    );
  }


  return (
    <div className="p-6 bg-gray-800 shadow-lg rounded-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-indigo-400">Edit Product (ID: {productId})</h2>
        <Link 
          to="/admin/products" 
          className="text-sm text-indigo-400 hover:text-indigo-300"
        >
          &larr; Back to Product List
        </Link>
      </div>
      {/* Only render form if initialData is available */}
      {initialData && (
        <ProductForm 
          initialData={initialData}
          onSubmit={handleEditProduct} 
          isEditing={true} 
          isLoading={isLoading} // isLoading will be true during form submission
          serverError={serverError}
        />
      )}
    </div>
  );
};

export default AdminEditProductPage;
