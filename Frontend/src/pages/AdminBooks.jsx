import React, { useEffect, useState, Fragment } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import BookEditor from "../components/BookEditor";
import { Dialog, Transition } from '@headlessui/react';
import { Plus, Edit, Trash2, Eye, X, BookOpen, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { Snackbar, Alert } from '@mui/material';

const placeholderImg = '/placeholder-book.jpg';

const Tooltip = ({ children, text }) => (
  <div className="relative group">
    {children}
    <span className="absolute z-20 left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover:block bg-gray-800 text-white text-xs rounded px-2 py-1 whitespace-nowrap shadow-lg transition-opacity duration-200 opacity-90">
      {text}
    </span>
  </div>
);

const AdminBooks = () => {
  const { token } = useAuth();
  const [books, setBooks] = useState([]);
  const [error, setError] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState({ title: '', message: '', action: '' });
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const booksPerPage = 9;

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get('http://localhost:5176/api/books', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBooks(res.data);
    } catch (err) {
      setError('Failed to fetch books');
      console.error('Error fetching books:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddBook = async (formData) => {
    try {
      const res = await axios.post('http://localhost:5176/api/books', formData, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
      });
      
      setSnackbarMessage({
        title: 'Book Added',
        message: `${formData.get('title')} has been added successfully`,
        action: 'add'
      });
      setOpenSnackbar(true);
      
      fetchBooks();
      setShowAddModal(false);
    } catch (err) {
      setError('Failed to add book');
      console.error('Error adding book:', err);
    }
  };

  const handleUpdateBook = async (formData) => {
    try {
      await axios.put(`http://localhost:5176/api/books/${selectedBook.bookId}`, formData, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
      });
      
      setSnackbarMessage({
        title: 'Book Updated',
        message: `${formData.get('title')} has been updated successfully`,
        action: 'update'
      });
      setOpenSnackbar(true);
      
      fetchBooks();
      setShowEditModal(false);
      setSelectedBook(null);
    } catch (err) {
      setError('Failed to update book');
      console.error('Error updating book:', err);
    }
  };

  const handleDeleteBook = async () => {
    try {
      const bookToDelete = books.find(book => book.bookId === deleteId);
      await axios.delete(`http://localhost:5176/api/books/${deleteId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      setSnackbarMessage({
        title: 'Book Deleted',
        message: `${bookToDelete.title} has been deleted successfully`,
        action: 'delete'
      });
      setOpenSnackbar(true);
      
      fetchBooks();
      setShowDeleteModal(false);
      setDeleteId(null);
    } catch (err) {
      setError('Failed to delete book');
      console.error('Error deleting book:', err);
    }
  };

  // Calculate pagination
  const indexOfLastBook = currentPage * booksPerPage;
  const indexOfFirstBook = indexOfLastBook - booksPerPage;
  const currentBooks = books.slice(indexOfFirstBook, indexOfLastBook);
  const totalPages = Math.ceil(books.length / booksPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const isValidDate = (d) => d && !isNaN(new Date(d).getTime());

  return (
    <div className="min-h-screen bg-gray-50">
      <Snackbar
        open={openSnackbar}
        autoHideDuration={2000}
        onClose={() => setOpenSnackbar(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        sx={{
          '& .MuiSnackbarContent-root': {
            minWidth: '380px',
            background: '#ffffff',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            borderRadius: '6px',
            padding: '0'
          }
        }}
      >
        <Alert
          onClose={() => setOpenSnackbar(false)}
          severity="success"
          variant="filled"
          sx={{
            width: '100%',
            padding: '16px 20px',
            backgroundColor: snackbarMessage.action === 'delete' ? '#DC2626' :
                           snackbarMessage.action === 'update' ? '#047857' :
                           '#4F46E5',
            '& .MuiAlert-icon': {
              marginRight: '12px',
              fontSize: '22px',
              opacity: 1,
              padding: '2px'
            },
            '& .MuiAlert-message': {
              padding: '4px 0',
              fontFamily: '"Inter", sans-serif',
              fontSize: '14px',
              fontWeight: 500,
              lineHeight: 1.5
            },
            '& .MuiAlert-action': {
              padding: '0 8px',
              marginRight: '-8px'
            },
            '& .MuiIconButton-root': {
              color: '#ffffff',
              padding: '4px',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)'
              }
            },
            '& .MuiSvgIcon-root': {
              fontSize: '20px'
            }
          }}
        >
          <div className="flex flex-col">
            <span className="font-medium">{snackbarMessage.title}</span>
            <span className="text-white/90 text-sm mt-0.5">{snackbarMessage.message}</span>
          </div>
        </Alert>
      </Snackbar>
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Book Management</h1>
              <p className="text-gray-500 mt-1">Manage your book inventory</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add New Book
            </motion.button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
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
              <h2 className="text-xl font-semibold text-gray-800">Book Inventory</h2>
              <div className="text-sm text-gray-500">
                {books.length} {books.length === 1 ? 'book' : 'books'} total
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-12 w-12 text-indigo-600 animate-spin" />
              </div>
            ) : books.length === 0 ? (
              <div className="py-12 text-center">
                <BookOpen className="mx-auto h-16 w-16 text-gray-300" />
                <h3 className="mt-4 text-lg font-medium text-gray-700">No books found</h3>
                <p className="mt-1 text-gray-500">Get started by adding a new book.</p>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowAddModal(true)}
                  className="mt-6 inline-flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Add Book
                </motion.button>
              </div>
            ) : (
              <>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {currentBooks.map((book) => (
                    <motion.div
                      key={book.bookId}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white rounded-md border border-gray-200 hover:shadow-md transition-all duration-300 p-4 group relative"
                    >
                      <div className="relative mb-4">
                        <div className="h-48 bg-gray-50 rounded-lg flex items-center justify-center overflow-hidden">
                          <img
                            src={book.imageUrl ? `http://localhost:5176${book.imageUrl}` : placeholderImg}
                            alt={book.title}
                            className="object-contain h-full max-h-44 w-auto"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = placeholderImg;
                            }}
                          />
                        </div>
                        {book.isOnSale && (
                          <div className="absolute top-2 left-2 bg-green-600 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center">
                            <span>Sale</span>
                          </div>
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1 truncate">{book.title}</h3>
                        <p className="text-gray-600 text-sm mb-2 truncate">{book.author}</p>
                        <div className="flex justify-between items-center mb-3">
                          <span className="font-bold text-indigo-700">${book.price?.toFixed(2)}</span>
                          <span
                            className={`text-sm px-2 py-1 rounded-full ${
                              book.stockQuantity > 0
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {book.stockQuantity > 0
                              ? `${book.stockQuantity} in stock`
                              : 'Out of stock'}
                          </span>
                        </div>
                        <div className="flex justify-end space-x-2">
                          <Tooltip text="View Details">
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => {
                                setSelectedBook(book);
                                setShowViewModal(true);
                              }}
                              className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors"
                            >
                              <Eye className="h-5 w-5" />
                            </motion.button>
                          </Tooltip>
                          <Tooltip text="Edit Book">
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => {
                                setSelectedBook(book);
                                setShowEditModal(true);
                              }}
                              className="p-2 text-gray-500 hover:text-yellow-600 hover:bg-yellow-50 rounded-full transition-colors"
                            >
                              <Edit className="h-5 w-5" />
                            </motion.button>
                          </Tooltip>
                          <Tooltip text="Delete Book">
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => {
                                setDeleteId(book.bookId);
                                setShowDeleteModal(true);
                              }}
                              className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                            >
                              <Trash2 className="h-5 w-5" />
                            </motion.button>
                          </Tooltip>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="mt-8 flex items-center justify-center space-x-2">
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className={`p-2 rounded-lg ${
                        currentPage === 1
                          ? 'text-gray-400 cursor-not-allowed'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </motion.button>

                    {[...Array(totalPages)].map((_, index) => (
                      <motion.button
                        key={index + 1}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handlePageChange(index + 1)}
                        className={`px-4 py-2 rounded-lg ${
                          currentPage === index + 1
                            ? 'bg-indigo-600 text-white'
                            : 'text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        {index + 1}
                      </motion.button>
                    ))}

                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className={`p-2 rounded-lg ${
                        currentPage === totalPages
                          ? 'text-gray-400 cursor-not-allowed'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <ChevronRight className="h-5 w-5" />
                    </motion.button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>

      {/* Add Book Modal */}
      <Transition.Root show={showAddModal} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => setShowAddModal(false)}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
          </Transition.Child>

          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white p-6 text-left shadow-xl border max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                  <div className="absolute top-0 right-0 pt-4 pr-4">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      type="button"
                      className="rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                      onClick={() => setShowAddModal(false)}
                    >
                      <span className="sr-only">Close</span>
                      <X className="h-6 w-6" aria-hidden="true" />
                    </motion.button>
                  </div>
                  <div className="sm:flex sm:items-start">
                    <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-indigo-100 sm:mx-0 sm:h-10 sm:w-10">
                      <Plus className="h-6 w-6 text-indigo-600" aria-hidden="true" />
                    </div>
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                      <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                        Add New Book
                      </Dialog.Title>
                      <div className="mt-2">
                        <BookEditor onSubmit={handleAddBook} />
                      </div>
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition.Root>

      {/* Edit Book Modal */}
      <Transition.Root show={showEditModal} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => setShowEditModal(false)}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
          </Transition.Child>

          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white p-6 text-left shadow-xl border max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                  <div className="absolute top-0 right-0 pt-4 pr-4">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      type="button"
                      className="rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                      onClick={() => setShowEditModal(false)}
                    >
                      <span className="sr-only">Close</span>
                      <X className="h-6 w-6" aria-hidden="true" />
                    </motion.button>
                  </div>
                  <div className="sm:flex sm:items-start">
                    <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-yellow-100 sm:mx-0 sm:h-10 sm:w-10">
                      <Edit className="h-6 w-6 text-yellow-600" aria-hidden="true" />
                    </div>
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                      <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                        Edit Book
                      </Dialog.Title>
                      <div className="mt-2">
                        <BookEditor
                          onSubmit={handleUpdateBook}
                          initialData={selectedBook}
                          isEdit={true}
                        />
                      </div>
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition.Root>

      {/* View Book Modal */}
      <Transition.Root show={showViewModal} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => setShowViewModal(false)}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
          </Transition.Child>

          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white p-6 text-left shadow-xl border max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                  <div className="absolute top-0 right-0 pt-4 pr-4">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      type="button"
                      className="rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                      onClick={() => setShowViewModal(false)}
                    >
                      <span className="sr-only">Close</span>
                      <X className="h-6 w-6" aria-hidden="true" />
                    </motion.button>
                  </div>
                  <div className="sm:flex sm:items-start">
                    <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-indigo-100 sm:mx-0 sm:h-10 sm:w-10">
                      <Eye className="h-6 w-6 text-indigo-600" aria-hidden="true" />
                    </div>
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                      <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                        Book Details
                      </Dialog.Title>
                      <div className="mt-4">
                        {selectedBook && (
                          <div className="space-y-6">
                            <div className="flex gap-6">
                              <div className="flex-shrink-0">
                                <img
                                  src={
                                    selectedBook.imageUrl
                                      ? `http://localhost:5176${selectedBook.imageUrl}`
                                      : placeholderImg
                                  }
                                  alt={selectedBook.title}
                                  className="h-48 w-32 object-cover rounded-lg shadow-md"
                                />
                              </div>
                              <div className="flex-1">
                                <h4 className="text-xl font-bold text-gray-900">
                                  {selectedBook.title}
                                </h4>
                                <p className="text-gray-600">{selectedBook.author}</p>
                                <div className="mt-2 flex items-center justify-between">
                                  <span className="text-2xl font-bold text-indigo-700">
                                    ${selectedBook.price?.toFixed(2)}
                                  </span>
                                  {selectedBook.isOnSale && (
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                      On Sale
                                    </span>
                                  )}
                                </div>
                                <div className="mt-2">
                                  <span
                                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                      selectedBook.stockQuantity > 0
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-red-100 text-red-800'
                                    }`}
                                  >
                                    {selectedBook.stockQuantity > 0
                                      ? `${selectedBook.stockQuantity} in stock`
                                      : 'Out of stock'}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="border-t border-gray-200 pt-4">
                              <h5 className="font-medium text-gray-900 mb-3">Details</h5>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <p className="text-sm text-gray-500">ISBN</p>
                                  <p className="text-sm font-medium">
                                    {selectedBook.isbn || '-'}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-sm text-gray-500">Genre</p>
                                  <p className="text-sm font-medium">
                                    {selectedBook.genre || '-'}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-sm text-gray-500">Language</p>
                                  <p className="text-sm font-medium">
                                    {selectedBook.language || '-'}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-sm text-gray-500">Format</p>
                                  <p className="text-sm font-medium">
                                    {selectedBook.format || '-'}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-sm text-gray-500">Publisher</p>
                                  <p className="text-sm font-medium">
                                    {selectedBook.publisher || '-'}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-sm text-gray-500">Publication Date</p>
                                  <p className="text-sm font-medium">
                                    {selectedBook.publicationDate
                                      ? new Date(
                                          selectedBook.publicationDate
                                        ).toLocaleDateString()
                                      : '-'}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-sm text-gray-500">Library Availability</p>
                                  <p className="text-sm font-medium">
                                    {selectedBook.isAvailableInLibrary
                                      ? 'Available'
                                      : 'Not Available'}
                                  </p>
                                </div>
                              </div>
                            </div>

                            {selectedBook.isOnSale && (
                              <div className="border-t border-gray-200 pt-4">
                                <h5 className="font-medium text-gray-900 mb-3">
                                  Discount Information
                                </h5>
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <p className="text-sm text-gray-500">Discount Percentage</p>
                                    <p className="text-sm font-medium">
                                      {selectedBook.discountPercent}%
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-gray-500">Discount Period</p>
                                    <p className="text-sm font-medium">
                                      {isValidDate(selectedBook.discountStart) &&
                                      isValidDate(selectedBook.discountEnd)
                                        ? `${new Date(
                                            selectedBook.discountStart
                                          ).toLocaleDateString()} - ${new Date(
                                            selectedBook.discountEnd
                                          ).toLocaleDateString()}`
                                        : 'Not specified'}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            )}

                            <div className="border-t border-gray-200 pt-4">
                              <h5 className="font-medium text-gray-900 mb-3">Description</h5>
                              <p className="text-sm text-gray-700 whitespace-pre-line">
                                {selectedBook.description || 'No description available.'}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition.Root>

      {/* Delete Confirmation Modal */}
      <Transition.Root show={showDeleteModal} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => setShowDeleteModal(false)}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
          </Transition.Child>

          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white p-6 text-left shadow-xl border max-w-lg w-full">
                  <div className="sm:flex sm:items-start">
                    <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                      <Trash2 className="h-6 w-6 text-red-600" aria-hidden="true" />
                    </div>
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                      <Dialog.Title as="h3" className="text {
                        text-lg font-medium leading-6 text-gray-900">
                        Delete Book
                      </Dialog.Title>
                      <div className="mt-2">
                        <p className="text-sm text-gray-500">
                          Are you sure you want to delete this book? This action cannot be undone.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.98 }}
                      type="button"
                      className="inline-flex w-full justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm"
                      onClick={handleDeleteBook}
                    >
                      Delete
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.98 }}
                      type="button"
                      className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                      onClick={() => setShowDeleteModal(false)}
                    >
                      Cancel
                    </motion.button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition.Root>
    </div>
  );
};

export default AdminBooks;