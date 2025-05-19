import React, { useState, useEffect } from 'react';
import axios from 'axios';
import BookForm from './BookForm';
import { motion } from 'framer-motion';

const placeholderImg = '/placeholder-book.jpg';

const BookList = () => {
  const [books, setBooks] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [error, setError] = useState('');
  const [deleteId, setDeleteId] = useState(null);

  const fetchBooks = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/books');
      setBooks(response.data);
    } catch (error) {
      setError('Failed to fetch books');
      console.error('Error fetching books:', error);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  const handleAddBook = async (formData) => {
    try {
      await axios.post('http://localhost:5000/api/books', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setShowAddModal(false);
      fetchBooks();
    } catch (error) {
      setError('Failed to add book');
      console.error('Error adding book:', error);
    }
  };

  const handleEditBook = async (formData) => {
    try {
      await axios.put(`http://localhost:5000/api/books/${selectedBook.bookId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setShowEditModal(false);
      fetchBooks();
    } catch (error) {
      setError('Failed to update book');
      console.error('Error updating book:', error);
    }
  };

  const handleDeleteBook = async () => {
    try {
      await axios.delete(`http://localhost:5000/api/books/${deleteId}`);
      setShowDeleteModal(false);
      setDeleteId(null);
      fetchBooks();
    } catch (error) {
      setError('Failed to delete book');
      console.error('Error deleting book:', error);
    }
  };

  const openDeleteModal = (bookId) => {
    setDeleteId(bookId);
    setShowDeleteModal(true);
  };

  const handleViewBook = (book) => {
    setSelectedBook(book);
    setShowViewModal(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Book List</h1>
              <p className="text-gray-500 mt-1">Manage and view all books</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-6 p-4 bg-red-50 rounded-md text-center text-red-600 flex items-center justify-center text-sm"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            {error}
          </motion.div>
        )}

        <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-50 rounded-lg">
                  <svg className="h-6 w-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-gray-800">Books</h2>
              </div>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowAddModal(true)}
                className="bg-indigo-600 text-white px-4 py-2 rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Book
              </motion.button>
            </div>

            {books.length === 0 ? (
              <div className="py-12 text-center">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 4v16m8-8H4" />
                </svg>
                <h3 className="mt-2 text-lg font-medium text-gray-700">No books found</h3>
                <p className="mt-1 text-gray-500">Get started by adding a new book.</p>
                <div className="mt-6">
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowAddModal(true)}
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                  >
                    <svg className="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Add Book
                  </motion.button>
                </div>
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {books.map((book) => (
                  <motion.div
                    key={book.bookId}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-md shadow-sm border border-gray-200 hover:shadow-md transition-all duration-300 flex flex-col relative"
                  >
                    {book.isOnSale && (
                      <div className="absolute top-4 left-4 flex items-center gap-2">
                        <span className="inline-block w-3 h-3 rounded-full bg-green-500"></span>
                        <span className="text-green-700 font-semibold text-sm">On Sale!</span>
                      </div>
                    )}
                    <div className="h-48 bg-gray-50 flex items-center justify-center rounded-t-md overflow-hidden">
                      <img
                        src={book.imageUrl ? `http://localhost:5000${book.imageUrl}` : placeholderImg}
                        alt={book.title}
                        className="object-contain h-full w-full"
                        onError={e => { e.target.onerror = null; e.target.src = placeholderImg; }}
                      />
                    </div>
                    <div className="p-4 flex-1 flex flex-col">
                      <h2 className="text-lg font-semibold text-gray-900 mb-2 truncate">{book.title}</h2>
                      <p className="text-gray-600 text-sm mb-1 truncate">by {book.author}</p>
                      <p className="text-indigo-600 font-medium mb-2">${book.price?.toFixed(2)}</p>
                      <p className="text-gray-500 text-sm mb-3">Stock: {book.stockQuantity}</p>
                      <div className="flex gap-2 mt-auto">
                        <motion.button
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleViewBook(book)}
                          className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-md hover:bg-indigo-100 text-sm font-medium flex items-center gap-1"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          View
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => { setSelectedBook(book); setShowEditModal(true); }}
                          className="bg-yellow-50 text-yellow-700 px-3 py-1 rounded-md hover:bg-yellow-100 text-sm font-medium flex items-center gap-1"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5h2m-1 0v14m-7-7h14" />
                          </svg>
                          Edit
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => openDeleteModal(book.bookId)}
                          className="bg-red-50 text-red-700 px-3 py-1 rounded-md hover:bg-red-100 text-sm font-medium flex items-center gap-1"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                          Delete
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Add Book Modal */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl border border-gray-200 p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Add New Book</h2>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowAddModal(false)}
                  className="text-gray-400 hover:text-gray-600 focus:outline-none"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </motion.button>
              </div>
              <BookForm onSubmit={handleAddBook} onCancel={() => setShowAddModal(false)} />
            </div>
          </div>
        )}

        {/* Edit Book Modal */}
        {showEditModal && selectedBook && (
          <div className="fixed inset-0 z-50 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl border border-gray-200 p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Edit Book</h2>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowEditModal(false)}
                  className="text-gray-400 hover:text-gray-600 focus:outline-none"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </motion.button>
              </div>
              <BookForm onSubmit={handleEditBook} initialData={selectedBook} isEdit={true} onCancel={() => setShowEditModal(false)} />
            </div>
          </div>
        )}

        {/* View Book Modal */}
        {showViewModal && selectedBook && (
          <div className="fixed inset-0 z-50 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl border border-gray-200 p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-semibold text-gray-900">{selectedBook.title}</h2>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowViewModal(false)}
                  className="text-gray-400 hover:text-gray-600 focus:outline-none"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </motion.button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="h-64 overflow-hidden rounded-md bg-gray-50 flex items-center justify-center">
                  <img
                    src={selectedBook.imageUrl ? `http://localhost:5000${selectedBook.imageUrl}` : placeholderImg}
                    alt={selectedBook.title}
                    className="w-full h-full object-contain"
                    onError={e => { e.target.onerror = null; e.target.src = placeholderImg; }}
                  />
                </div>
                <div className="space-y-3">
                  <div>
                    <h3 className="font-medium text-gray-700">Author</h3>
                    <p className="text-gray-600">{selectedBook.author}</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-700">ISBN</h3>
                    <p className="text-gray-600">{selectedBook.isbn}</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-700">Description</h3>
                    <p className="text-gray-600">{selectedBook.description}</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-700">Genre</h3>
                    <p className="text-gray-600">{selectedBook.genre}</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-700">Language</h3>
                    <p className="text-gray-600">{selectedBook.language}</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-700">Format</h3>
                    <p className="text-gray-600">{selectedBook.format}</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-700">Publisher</h3>
                    <p className="text-gray-600">{selectedBook.publisher}</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-700">Price</h3>
                    <p className="text-gray-600">${selectedBook.price?.toFixed(2)}</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-700">Publication Date</h3>
                    <p className="text-gray-600">{selectedBook.publicationDate ? new Date(selectedBook.publicationDate).toLocaleDateString() : '-'}</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-700">Available in Library</h3>
                    <p className="text-gray-600">{selectedBook.isAvailableInLibrary ? 'Yes' : 'No'}</p>
                  </div>
                </div>
              </div>
              <div className="mt-6 flex justify-end">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowViewModal(false)}
                  className="px-6 py-2 border border-gray-300 text-gray-700 font-medium rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                >
                  Close
                </motion.button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 z-50 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl border border-gray-200 p-6 max-w-md w-full">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Delete Book</h2>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowDeleteModal(false)}
                  className="text-gray-400 hover:text-gray-600 focus:outline-none"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </motion.button>
              </div>
              <p className="text-sm text-gray-600 mb-6">Are you sure you want to delete this book? This action cannot be undone.</p>
              <div className="flex justify-end gap-3">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleDeleteBook}
                  className="px-4 py-2 bg-red-600 text-white font-medium rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                >
                  Delete
                </motion.button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default BookList;