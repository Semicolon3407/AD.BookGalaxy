import React, { useState, useEffect } from 'react';

function formatDateForInput(dateString) {
  if (!dateString) return '';
  const d = new Date(dateString);
  if (isNaN(d)) return '';
  return d.toISOString().split('T')[0];
}

const BookEditor = ({ onSubmit, initialData = {}, isEdit = false, onCancel }) => {
  const [form, setForm] = useState({
    title: '',
    author: '',
    genre: '',
    language: '',
    format: '',
    publisher: '',
    isbn: '',
    description: '',
    price: '',
    stockQuantity: '',
    isAvailableInLibrary: false,
    publicationDate: '',
    discountPercent: '',
    isOnSale: false,
    discountStart: '',
    discountEnd: '',
    Image: null,
    isAwardWinner: false,
    isBestseller: false
  });
  const [imagePreview, setImagePreview] = useState(initialData?.imageUrl ? `http://localhost:5176${initialData.imageUrl}` : '');
  const [errors, setErrors] = useState({});
  const [openSections, setOpenSections] = useState({
    basic: true,
    publishing: true,
    inventory: true,
    discount: true,
    cover: true,
    description: true,
    availability: true
  });

  useEffect(() => {
    if (isEdit && initialData) {
      setForm({
        ...form,
        ...initialData,
        isAvailableInLibrary: initialData.isAvailableInLibrary ?? initialData.IsAvailableInLibrary ?? false,
        isOnSale: initialData.isOnSale ?? initialData.IsOnSale ?? false,
        publicationDate: formatDateForInput(initialData.publicationDate),
        discountStart: formatDateForInput(initialData.discountStart),
        discountEnd: formatDateForInput(initialData.discountEnd),
        discountPercent: (initialData.discountPercent ?? '').toString(),
        Image: null,
        isAwardWinner: initialData.isAwardWinner ?? initialData.IsAwardWinner ?? false,
        isBestseller: initialData.isBestseller ?? initialData.IsBestseller ?? false
      });
      setImagePreview(initialData.imageUrl ? `http://localhost:5176${initialData.imageUrl}` : '');
    }
    // eslint-disable-next-line
  }, [initialData, isEdit]);

  const validateForm = () => {
    const newErrors = {};
    if (!form.title) newErrors.title = 'Title is required';
    if (!form.author) newErrors.author = 'Author is required';
    if (!form.genre) newErrors.genre = 'Genre is required';
    if (!form.language) newErrors.language = 'Language is required';
    if (!form.publisher) newErrors.publisher = 'Publisher is required';
    if (!form.isbn) newErrors.isbn = 'ISBN is required';
    if (!form.format) newErrors.format = 'Format is required';
    if (!form.publicationDate) newErrors.publicationDate = 'Publication date is required';
    if (!form.price || form.price <= 0) newErrors.price = 'Valid price is required';
    if (!form.stockQuantity || form.stockQuantity < 0) newErrors.stockQuantity = 'Valid stock quantity is required';
    if (!form.description) newErrors.description = 'Description is required';
    if (!isEdit && !form.Image) newErrors.Image = 'Book cover image is required';
    if (form.discountPercent && (form.discountPercent < 0 || form.discountPercent > 100)) {
      newErrors.discountPercent = 'Discount must be between 0 and 100';
    }
    if (form.isOnSale && (!form.discountStart || !form.discountEnd)) {
      newErrors.discountDates = 'Both discount start and end dates are required when on sale';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (type === 'file') {
      const file = files[0];
      if (file) {
        setForm(prev => ({
          ...prev,
          Image: file
        }));
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreview(reader.result);
        };
        reader.readAsDataURL(file);
      }
    } else {
      setForm((prev) => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value,
      }));
    }
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    const formData = new FormData();
    Object.keys(form).forEach(key => {
      if (key === 'Image') {
        if (form[key]) {
          formData.append('Image', form[key]);
        }
      } else if (['publicationDate', 'discountStart', 'discountEnd'].includes(key)) {
        if (form[key]) {
          const date = new Date(form[key]);
          formData.append(key, date.toISOString());
        }
      } else if (key === 'discountPercent') {
        formData.append('DiscountPercent', form[key] === '' ? 0 : form[key]);
      } else if (key === 'isOnSale') {
        formData.append('IsOnSale', form[key]);
      } else {
        formData.append(key, form[key]);
      }
    });
    onSubmit(formData);
  };

  const toggleSection = (section) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Top Navigation */}
        <div className="bg-white rounded-t-2xl shadow-lg p-6 mb-2">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-800">{isEdit ? 'Edit Book' : 'Add New Book'}</h2>
            <div className="flex gap-3">
              {onCancel && (
                <button
                  type="button"
                  onClick={onCancel}
                  className="px-6 py-2 border border-gray-300 text-gray-500 font-medium rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                onClick={handleSubmit}
                className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white font-semibold rounded-md shadow hover:from-indigo-700 hover:to-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all"
              >
                {isEdit ? 'Update Book' : 'Add Book'}
              </button>
            </div>
          </div>
        </div>

        <form className="bg-white rounded-b-2xl shadow-lg overflow-hidden">
          {/* Basic Information */}
          <section className="border-b border-gray-200">
            <div 
              className="flex justify-between items-center p-6 cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors"
              onClick={() => toggleSection('basic')}
            >
              <h3 className="text-lg font-semibold text-gray-700">Basic Information</h3>
              <svg 
                className={`w-5 h-5 text-gray-500 transform ${openSections.basic ? 'rotate-180' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
            {openSections.basic && (
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title *</label>
                  <input
                    id="title"
                    type="text"
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border ${errors.title ? 'border-red-500' : 'border-gray-300'} rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors`}
                    required
                    maxLength={200}
                    placeholder="Enter book title"
                  />
                  {errors.title && <p className="text-red-500 text-xs">{errors.title}</p>}
                </div>
                <div className="space-y-2">
                  <label htmlFor="author" className="block text-sm font-medium text-gray-700">Author *</label>
                  <input
                    id="author"
                    type="text"
                    name="author"
                    value={form.author}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border ${errors.author ? 'border-red-500' : 'border-gray-300'} rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors`}
                    required
                    maxLength={100}
                    placeholder="Enter author name"
                  />
                  {errors.author && <p className="text-red-500 text-xs">{errors.author}</p>}
                </div>
                <div className="space-y-2">
                  <label htmlFor="genre" className="block text-sm font-medium text-gray-700">Genre *</label>
                  <select
                    id="genre"
                    name="genre"
                    value={form.genre}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border ${errors.genre ? 'border-red-500' : 'border-gray-300'} rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors`}
                    required
                  >
                    <option value="">Select a genre</option>
                    <option value="Fiction">Fiction</option>
                    <option value="Non-Fiction">Non-Fiction</option>
                    <option value="Mystery">Mystery</option>
                    <option value="Science Fiction">Science Fiction</option>
                    <option value="Biography">Biography</option>
                  </select>
                  {errors.genre && <p className="text-red-500 text-xs">{errors.genre}</p>}
                </div>
                <div className="space-y-2">
                  <label htmlFor="language" className="block text-sm font-medium text-gray-700">Language *</label>
                  <select
                    id="language"
                    name="language"
                    value={form.language}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border ${errors.language ? 'border-red-500' : 'border-gray-300'} rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors`}
                    required
                  >
                    <option value="">Select a language</option>
                    <option value="English">English</option>
                    <option value="Spanish">Spanish</option>
                    <option value="French">French</option>
                    <option value="German">German</option>
                    <option value="Italian">Italian</option>
                    <option value="Nepali">Nepali</option>
                    <option value="Russian">Russian</option>
                    <option value="Japanese">Japanese</option>
                    <option value="Chinese">Chinese</option>
                    <option value="Arabic">Arabic</option>
                  </select>
                  {errors.language && <p className="text-red-500 text-xs">{errors.language}</p>}
                </div>
              </div>
            )}
          </section>

          {/* Publishing Details */}
          <section className="border-b border-gray-200">
            <div 
              className="flex justify-between items-center p-6 cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors"
              onClick={() => toggleSection('publishing')}
            >
              <h3 className="text-lg font-semibold text-gray-700">Publishing Details</h3>
              <svg 
                className={`w-5 h-5 text-gray-500 transform ${openSections.publishing ? 'rotate-180' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
            {openSections.publishing && (
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="publisher" className="block text-sm font-medium text-gray-700">Publisher *</label>
                  <input
                    id="publisher"
                    type="text"
                    name="publisher"
                    value={form.publisher}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border ${errors.publisher ? 'border-red-500' : 'border-gray-300'} rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors`}
                    required
                    maxLength={100}
                    placeholder="Enter publisher name"
                  />
                  {errors.publisher && <p className="text-red-500 text-xs">{errors.publisher}</p>}
                </div>
                <div className="space-y-2">
                  <label htmlFor="isbn" className="block text-sm font-medium text-gray-700">ISBN *</label>
                  <input
                    id="isbn"
                    type="text"
                    name="isbn"
                    value={form.isbn}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border ${errors.isbn ? 'border-red-500' : 'border-gray-300'} rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors`}
                    required
                    maxLength={13}
                    placeholder="Enter 13-digit ISBN"
                  />
                  {errors.isbn && <p className="text-red-500 text-xs">{errors.isbn}</p>}
                </div>
                <div className="space-y-2">
                  <label htmlFor="format" className="block text-sm font-medium text-gray-700">Format *</label>
                  <select
                    id="format"
                    name="format"
                    value={form.format}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border ${errors.format ? 'border-red-500' : 'border-gray-300'} rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors`}
                    required
                  >
                    <option value="">Select a format</option>
                    <option value="Hardcover">Hardcover</option>
                    <option value="Paperback">Paperback</option>
                    <option value="E-Book">E-Book</option>
                    <option value="Audiobook">Audiobook</option>
                    <option value="Mass Market Paperback">Mass Market Paperback</option>
                    <option value="Large Print">Large Print</option>
                    <option value="Board Book">Board Book</option>
                    <option value="Spiral Bound">Spiral Bound</option>
                    <option value="Comic Book">Comic Book</option>
                    <option value="Magazine">Magazine</option>
                  </select>
                  {errors.format && <p className="text-red-500 text-xs">{errors.format}</p>}
                </div>
                <div className="space-y-2">
                  <label htmlFor="publicationDate" className="block text-sm font-medium text-gray-700">Publication Date *</label>
                  <input
                    id="publicationDate"
                    type="date"
                    name="publicationDate"
                    value={form.publicationDate}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border ${errors.publicationDate ? 'border-red-500' : 'border-gray-300'} rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors`}
                    required
                  />
                  {errors.publicationDate && <p className="text-red-500 text-xs">{errors.publicationDate}</p>}
                </div>
                <div className="space-y-2">
                  <label className="flex items-center space-x-3">
                    <input
                      id="isAwardWinner"
                      name="isAwardWinner"
                      type="checkbox"
                      checked={form.isAwardWinner || false}
                      onChange={handleChange}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <span className="text-sm font-medium text-gray-700">Award Winner</span>
                  </label>
                </div>
                <div className="space-y-2">
                  <label className="flex items-center space-x-3">
                    <input
                      id="isBestseller"
                      name="isBestseller"
                      type="checkbox"
                      checked={form.isBestseller || false}
                      onChange={handleChange}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <span className="text-sm font-medium text-gray-700">Bestseller</span>
                  </label>
                </div>
              </div>
            )}
          </section>

          {/* Inventory & Pricing */}
          <section className="border-b border-gray-200">
            <div 
              className="flex justify-between items-center p-6 cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors"
              onClick={() => toggleSection('inventory')}
            >
              <h3 className="text-lg font-semibold text-gray-700">Inventory & Pricing</h3>
              <svg 
                className={`w-5 h-5 text-gray-500 transform ${openSections.inventory ? 'rotate-180' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
            {openSections.inventory && (
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="price" className="block text-sm font-medium text-gray-700">Price *</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-gray-500">$</span>
                    <input
                      id="price"
                      type="number"
                      name="price"
                      value={form.price}
                      onChange={handleChange}
                      className={`w-full pl-8 pr-4 py-2 border ${errors.price ? 'border-red-500' : 'border-gray-300'} rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors`}
                      required
                      min="0.01"
                      max="99999.99"
                      step="0.01"
                      placeholder="0.00"
                    />
                  </div>
                  {errors.price && <p className="text-red-500 text-xs">{errors.price}</p>}
                </div>
                <div className="space-y-2">
                  <label htmlFor="stockQuantity" className="block text-sm font-medium text-gray-700">Stock Quantity *</label>
                  <input
                    id="stockQuantity"
                    type="number"
                    name="stockQuantity"
                    value={form.stockQuantity}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border ${errors.stockQuantity ? 'border-red-500' : 'border-gray-300'} rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors`}
                    required
                    min="0"
                    placeholder="0"
                  />
                  {errors.stockQuantity && <p className="text-red-500 text-xs">{errors.stockQuantity}</p>}
                </div>
              </div>
            )}
          </section>

          {/* Discount Settings */}
          <section className="border-b border-gray-200">
            <div 
              className="flex justify-between items-center p-6 cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors"
              onClick={() => toggleSection('discount')}
            >
              <h3 className="text-lg font-semibold text-gray-700">Discount Settings</h3>
              <svg 
                className={`w-5 h-5 text-gray-500 transform ${openSections.discount ? 'rotate-180' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
            {openSections.discount && (
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="discountPercent" className="block text-sm font-medium text-gray-700">Discount Percentage</label>
                  <div className="relative">
                    <input
                      id="discountPercent"
                      type="number"
                      name="discountPercent"
                      value={form.discountPercent}
                      onChange={handleChange}
                      className={`w-full px-4 py-2 border ${errors.discountPercent ? 'border-red-500' : 'border-gray-300'} rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors`}
                      min="0"
                      max="100"
                      placeholder="0"
                    />
                    <span className="absolute right-3 top-2.5 text-gray-500">%</span>
                  </div>
                  {errors.discountPercent && <p className="text-red-500 text-xs">{errors.discountPercent}</p>}
                </div>
                <div className="space-y-2">
                  <label htmlFor="discountStart" className="block text-sm font-medium text-gray-700">Discount Start Date</label>
                  <input
                    id="discountStart"
                    type="date"
                    name="discountStart"
                    value={form.discountStart}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border ${errors.discountDates ? 'border-red-500' : 'border-gray-300'} rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors`}
                  />
                  {errors.discountDates && <p className="text-red-500 text-xs">{errors.discountDates}</p>}
                </div>
                <div className="space-y-2">
                  <label htmlFor="discountEnd" className="block text-sm font-medium text-gray-700">Discount End Date</label>
                  <input
                    id="discountEnd"
                    type="date"
                    name="discountEnd"
                    value={form.discountEnd}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border ${errors.discountDates ? 'border-red-500' : 'border-gray-300'} rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors`}
                  />
                </div>
              </div>
            )}
          </section>

          {/* Book Cover */}
          <section className="border-b border-gray-200">
            <div 
              className="flex justify-between items-center p-6 cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors"
              onClick={() => toggleSection('cover')}
            >
              <h3 className="text-lg font-semibold text-gray-700">Book Cover</h3>
              <svg 
                className={`w-5 h-5 text-gray-500 transform ${openSections.cover ? 'rotate-180' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
            {openSections.cover && (
              <div className="p-6">
                <div className="flex items-center justify-center w-full relative group">
                  <label
                    htmlFor="Image"
                    className={`flex flex-col items-center justify-center w-full h-64 border-2 ${errors.Image ? 'border-red-500' : 'border-gray-300'} border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors`}
                  >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      {!imagePreview ? (
                        <>
                          <svg className="w-8 h-8 mb-4 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                          </svg>
                          <p className="mb-2 text-sm text-gray-500">
                            <span className="font-semibold">Click to upload</span> or drag and drop
                          </p>
                          <p className="text-xs text-gray-500">PNG, JPG or JPEG (MAX. 800x400px)</p>
                        </>
                      ) : (
                        <img
                          src={imagePreview}
                          alt="Book cover preview"
                          className="max-h-56 object-contain rounded shadow-sm"
                        />
                      )}
                    </div>
                    <input
                      id="Image"
                      type="file"
                      name="Image"
                      onChange={handleChange}
                      accept="image/png,image/jpeg,image/jpg"
                      className="hidden"
                      required={!isEdit}
                    />
                  </label>
                  {imagePreview && (
                    <button
                      type="button"
                      onClick={() => { setImagePreview(''); setForm(prev => ({ ...prev, Image: null })); }}
                      className="absolute top-2 right-2 p-1 bg-gray-100 rounded-full hover:bg-gray-200 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
                {errors.Image && <p className="text-red-500 text-xs mt-2">{errors.Image}</p>}
              </div>
            )}
          </section>

          {/* Description */}
          <section className="border-b border-gray-200">
            <div 
              className="flex justify-between items-center p-6 cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors"
              onClick={() => toggleSection('description')}
            >
              <h3 className="text-lg font-semibold text-gray-700">Description</h3>
              <svg 
                className={`w-5 h-5 text-gray-500 transform ${openSections.description ? 'rotate-180' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
            {openSections.description && (
              <div className="p-6">
                <div className="space-y-2">
                  <textarea
                    id="description"
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border ${errors.description ? 'border-red-500' : 'border-gray-300'} rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors min-h-[120px]`}
                    placeholder="Enter book description..."
                    required
                    maxLength={2000}
                  />
                  <p className="text-xs text-gray-500">{form.description.length}/2000 characters</p>
                  {errors.description && <p className="text-red-500 text-xs">{errors.description}</p>}
                </div>
              </div>
            )}
          </section>

          {/* Availability */}
          <section>
            <div 
              className="flex justify-between items-center p-6 cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors"
              onClick={() => toggleSection('availability')}
            >
              <h3 className="text-lg font-semibold text-gray-700">Availability</h3>
              <svg 
                className={`w-5 h-5 text-gray-500 transform ${openSections.availability ? 'rotate-180' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
            {openSections.availability && (
              <div className="p-6 space-y-4">
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    name="isAvailableInLibrary"
                    checked={form.isAvailableInLibrary}
                    onChange={handleChange}
                    className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Available in Physical Library</span>
                </label>
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    name="isOnSale"
                    checked={form.isOnSale}
                    onChange={handleChange}
                    className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                  />
                  <span className="text-sm font-medium text-gray-700">On Sale</span>
                </label>
              </div>
            )}
          </section>
        </form>
      </div>
    </div>
  );
};

export default BookEditor;