import React, { useState, useEffect } from 'react';

const ProductForm = ({ initialData, onSubmit, isEditing, isLoading, serverError }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock_quantity: '',
    category_id: '', // Assuming category_id is a simple number input for now
  });
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        description: initialData.description || '',
        price: initialData.price || '',
        stock_quantity: initialData.stock_quantity || '',
        category_id: initialData.category_id || '',
      });
    } else {
      // Reset form if no initialData (e.g., for 'new' form after editing)
      setFormData({ name: '', description: '', price: '', stock_quantity: '', category_id: '' });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear validation error for this field on change
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = "Product name is required.";
    if (!formData.description.trim()) errors.description = "Description is required.";
    
    const price = parseFloat(formData.price);
    if (isNaN(price) || price <= 0) errors.price = "Price must be a positive number.";
    
    const stock = parseInt(formData.stock_quantity, 10);
    if (isNaN(stock) || stock < 0) errors.stock_quantity = "Stock quantity must be a non-negative integer.";
    
    if (formData.category_id.trim() && (isNaN(parseInt(formData.category_id, 10)) || parseInt(formData.category_id, 10) <=0) ) {
        errors.category_id = "Category ID must be a positive integer if provided.";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      const dataToSubmit = {
        ...formData,
        price: parseFloat(formData.price),
        stock_quantity: parseInt(formData.stock_quantity, 10),
        category_id: formData.category_id ? parseInt(formData.category_id, 10) : null, // Send null if empty
      };
      onSubmit(dataToSubmit);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-gray-700 p-6 sm:p-8 rounded-lg shadow-xl">
      {serverError && (
        <div className="bg-red-700 border border-red-900 text-red-100 px-4 py-3 rounded relative mb-4" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{typeof serverError === 'string' ? serverError : JSON.stringify(serverError)}</span>
        </div>
      )}

      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-300">Product Name*</label>
        <input
          type="text"
          name="name"
          id="name"
          value={formData.name}
          onChange={handleChange}
          required
          className={`mt-1 block w-full px-3 py-2 bg-gray-600 border rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:text-sm ${formErrors.name ? 'border-red-500' : 'border-gray-500'}`}
        />
        {formErrors.name && <p className="mt-1 text-xs text-red-400">{formErrors.name}</p>}
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-300">Description*</label>
        <textarea
          name="description"
          id="description"
          rows="4"
          value={formData.description}
          onChange={handleChange}
          required
          className={`mt-1 block w-full px-3 py-2 bg-gray-600 border rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:text-sm ${formErrors.description ? 'border-red-500' : 'border-gray-500'}`}
        />
        {formErrors.description && <p className="mt-1 text-xs text-red-400">{formErrors.description}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="price" className="block text-sm font-medium text-gray-300">Price*</label>
          <input
            type="number"
            name="price"
            id="price"
            value={formData.price}
            onChange={handleChange}
            required
            min="0.01"
            step="0.01"
            className={`mt-1 block w-full px-3 py-2 bg-gray-600 border rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:text-sm ${formErrors.price ? 'border-red-500' : 'border-gray-500'}`}
          />
          {formErrors.price && <p className="mt-1 text-xs text-red-400">{formErrors.price}</p>}
        </div>
        <div>
          <label htmlFor="stock_quantity" className="block text-sm font-medium text-gray-300">Stock Quantity*</label>
          <input
            type="number"
            name="stock_quantity"
            id="stock_quantity"
            value={formData.stock_quantity}
            onChange={handleChange}
            required
            min="0"
            step="1"
            className={`mt-1 block w-full px-3 py-2 bg-gray-600 border rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:text-sm ${formErrors.stock_quantity ? 'border-red-500' : 'border-gray-500'}`}
          />
          {formErrors.stock_quantity && <p className="mt-1 text-xs text-red-400">{formErrors.stock_quantity}</p>}
        </div>
      </div>
      
      <div>
        <label htmlFor="category_id" className="block text-sm font-medium text-gray-300">Category ID (Optional)</label>
        <input
          type="number"
          name="category_id"
          id="category_id"
          value={formData.category_id}
          onChange={handleChange}
          min="1"
          step="1"
          className={`mt-1 block w-full px-3 py-2 bg-gray-600 border rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:text-sm ${formErrors.category_id ? 'border-red-500' : 'border-gray-500'}`}
        />
        {formErrors.category_id && <p className="mt-1 text-xs text-red-400">{formErrors.category_id}</p>}
        {/* In a real app, this would ideally be a dropdown populated with categories */}
      </div>

      <div className="pt-2">
        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isLoading ? (isEditing ? 'Updating Product...' : 'Adding Product...') : (isEditing ? 'Update Product' : 'Add Product')}
        </button>
      </div>
    </form>
  );
};

export default ProductForm;
