import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Search, Filter, Eye, X, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const placeholderImg = '/placeholder-book.jpg';

const StaffBooks = () => {
  const [books, setBooks] = useState([]);
  const [query, setQuery] = useState('');
  const [error, setError] = useState('');
  const [selectedBook, setSelectedBook] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [selectedAuthor, setSelectedAuthor] = useState('All');
  const [inStock, setInStock] = useState(false);
  const [inLibrary, setInLibrary] = useState(false);
  const [sortBy, setSortBy] = useState('title');

  useEffect(() => {
    fetchBooks();
    // eslint-disable-next-line
  }, [query]);

  const fetchBooks = async () => {
    try {
      const res = await axios.get(`http://localhost:5176/api/books?search=${query}`);
      setBooks(res.data);
    } catch (err) {
      setError('Failed to load books');
    }
  };

  const handleViewBook = (book) => {
    setSelectedBook(book);
    setShowViewModal(true);
  };

  // Get unique genres and authors for filters
  const genres = ['All', ...new Set(books.map(book => book.genre))].filter(Boolean);
  const authors = ['All', ...new Set(books.map(book => book.author))].filter(Boolean);

  // Filter and sort books
  const filteredBooks = books
    .filter(book => {
      const matchesGenre = selectedGenre === 'All' || book.genre === selectedGenre;
      const matchesAuthor = selectedAuthor === 'All' || book.author === selectedAuthor;
      const matchesStock = !inStock || book.stockQuantity > 0;
      const matchesLibrary = !inLibrary || book.isAvailableInLibrary;
      return matchesGenre && matchesAuthor && matchesStock && matchesLibrary;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return a.title.localeCompare(b.title);
        case 'date':
          return new Date(b.publicationDate) - new Date(a.publicationDate);
        case 'price':
          return b.price - a.price;
        case 'stock':
          return b.stockQuantity - a.stockQuantity;
        default:
          return 0;
      }
    });

  const resetFilters = () => {
    setSelectedGenre('All');
    setSelectedAuthor('All');
    setInStock(false);
    setInLibrary(false);
    setSortBy('title');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Book Catalog</h1>
              <p className="text-gray-500 mt-1">Manage and view all books in the system</p>
            </div>
            <div className="relative w-full md:w-96">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search books by title, ISBN, or description..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
              />
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

        {/* Layout with Filters on Left */}
        <div className="flex gap-8">
          {/* Filters Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-full md:w-72 bg-white rounded-lg shadow-md border border-gray-200 p-6 sticky top-8 h-[calc(100vh-8rem)] overflow-y-auto"
          >
            <div className="flex items-center gap-2 mb-6">
              <Filter className="h-5 w-5 text-gray-600" />
              <h2 className="text-lg font-semibold text-gray-800">Filters</h2>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Author</label>
                <select
                  value={selectedAuthor}
                  onChange={(e) => setSelectedAuthor(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                >
                  {authors.map((author) => (
                    <option key={author} value={author}>
                      {author}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Genre</label>
                <select
                  value={selectedGenre}
                  onChange={(e) => setSelectedGenre(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                >
                  {genres.map((genre) => (
                    <option key={genre} value={genre}>
                      {genre}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Sort By</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                >
                  <option value="title">Title</option>
                  <option value="date">Publication Date</option>
                  <option value="price">Price</option>
                  <option value="stock">Stock Quantity</option>
                </select>
              </div>
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="inStock"
                    checked={inStock}
                    onChange={(e) => setInStock(e.target.checked)}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label htmlFor="inStock" className="text-sm font-medium text-gray-700">
                    In Stock Only
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="inLibrary"
                    checked={inLibrary}
                    onChange={(e) => setInLibrary(e.target.checked)}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label htmlFor="inLibrary" className="text-sm font-medium text-gray-700">
                    Available in Library
                  </label>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                onClick={resetFilters}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 border border-gray-300 rounded-md shadow-sm hover:bg-gray-200 transition-all duration-200 w-full justify-center"
              >
                <RefreshCw className="h-4 w-4" />
                Reset Filters
              </motion.button>
            </div>
          </motion.div>

          {/* Books Grid */}
          <div className="flex-1">
            <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-gray-800">Book Inventory</h2>
                  <div className="text-sm text-gray-500">
                    {filteredBooks.length} {filteredBooks.length === 1 ? 'book' : 'books'} total
                  </div>
                </div>

                {filteredBooks.length === 0 ? (
                  <div className="py-12 text-center">
                    <h3 className="mt-4 text-lg font-medium text-gray-700">No books found</h3>
                    <p className="mt-1 text-gray-500">Try adjusting your search or filters.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredBooks.map((book) => (
                      <motion.div
                        key={book.bookId}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="border border-gray-200 rounded-md bg-gray-50 hover:bg-gray-100 transition-all duration-200 overflow-hidden"
                      >
                        <div className="aspect-[3/4] relative">
                          <img
                            src={book.imageUrl ? `http://localhost:5176${book.imageUrl}` : placeholderImg}
                            alt={book.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = placeholderImg;
                            }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-200 flex items-end justify-center p-4">
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleViewBook(book)}
                              className="bg-white text-gray-900 px-4 py-2 rounded-md flex items-center gap-2 hover:bg-gray-100 transition-colors duration-200"
                            >
                              <Eye className="w-4 h-4" />
                              View Details
                            </motion.button>
                          </div>
                        </div>
                        <div className="p-4">
                          <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1">{book.title}</h3>
                          <p className="text-sm text-gray-600 mb-2 line-clamp-1">{book.author}</p>
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-900">
                              ${book.price?.toFixed(2)}
                            </span>
                            <span
                              className={`text-sm px-2 py-1 rounded-full ${
                                book.stockQuantity > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {book.stockQuantity} in stock
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* View Book Modal */}
        <AnimatePresence>
          {showViewModal && selectedBook && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-lg shadow-xl border border-gray-200 p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              >
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">{selectedBook.title}</h2>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setShowViewModal(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                  >
                    <X className="w-6 h-6" />
                  </motion.button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="aspect-[3/4] overflow-hidden rounded-md bg-gray-100">
                    <img
                      src={
                        selectedBook.imageUrl
                          ? `http://localhost:5176${selectedBook.imageUrl}`
                          : placeholderImg
                      }
                      alt={selectedBook.title}
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = placeholderImg;
                      }}
                    />
                  </div>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Author</h3>
                        <p className="mt-1 text-gray-900">{selectedBook.author || 'N/A'}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">ISBN</h3>
                        <p className="mt-1 text-gray-900">{selectedBook.isbn || 'N/A'}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Genre</h3>
                        <p className="mt-1 text-gray-900">{selectedBook.genre || 'N/A'}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Language</h3>
                        <p className="mt-1 text-gray-900">{selectedBook.language || 'N/A'}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Format</h3>
                        <p className="mt-1 text-gray-900">{selectedBook.format || 'N/A'}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Publisher</h3>
                        <p className="mt-1 text-gray-900">{selectedBook.publisher || 'N/A'}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Price</h3>
                        <p className="mt-1 text-gray-900">${selectedBook.price?.toFixed(2) || '0.00'}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Stock</h3>
                        <p className="mt-1 text-gray-900">{selectedBook.stockQuantity || 0} units</p>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Description</h3>
                      <p className="mt-1 text-gray-900">{selectedBook.description || 'No description available'}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Publication Date</h3>
                        <p className="mt-1 text-gray-900">
                          {selectedBook.publicationDate
                            ? new Date(selectedBook.publicationDate).toLocaleDateString()
                            : '-'}
                        </p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Library Available</h3>
                        <p className="mt-1 text-gray-900">
                          {selectedBook.isAvailableInLibrary ? 'Yes' : 'No'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default StaffBooks;