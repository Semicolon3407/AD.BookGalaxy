import React, { useEffect, useState, Fragment } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Dialog, Transition } from '@headlessui/react';
import { Plus, Trash2, X, Megaphone } from 'lucide-react';
import { motion } from 'framer-motion';
import { Snackbar, Alert } from '@mui/material';

const Tooltip = ({ children, text }) => (
  <div className="relative group">
    {children}
    <span className="absolute z-20 left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover:block bg-gray-800 text-white text-xs rounded px-2 py-1 whitespace-nowrap shadow-lg transition-opacity duration-200 opacity-90">
      {text}
    </span>
  </div>
);

const AdminAnnouncements = () => {
  const { token } = useAuth();
  const [announcements, setAnnouncements] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState({ title: '', message: '', action: '' });
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    startTime: '',
    endTime: '',
    type: 'info'
  });
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get('http://localhost:5176/api/Announcements/all', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAnnouncements(res.data);
    } catch (err) {
      setError('Failed to fetch announcements');
      console.error('Error fetching announcements:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        startTime: new Date(formData.startTime).toISOString(),
        endTime: new Date(formData.endTime).toISOString()
      };

      await axios.post(
        'http://localhost:5176/api/Announcements',
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setSnackbarMessage({
        title: 'Announcement Added',
        message: `${formData.title} has been added successfully`,
        action: 'add'
      });
      setOpenSnackbar(true);
      
      fetchAnnouncements();
      setShowAddModal(false);
      setFormData({
        title: '',
        message: '',
        startTime: '',
        endTime: '',
        type: 'info'
      });
    } catch (err) {
      setError('Failed to add announcement');
      console.error('Error saving announcement:', err);
    }
  };

  const handleDelete = async () => {
    try {
      const announcementToDelete = announcements.find(a => a.announcementId === deleteId);
      await axios.delete(`http://localhost:5176/api/Announcements/${deleteId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setSnackbarMessage({
        title: 'Announcement Deleted',
        message: `${announcementToDelete.title} has been deleted successfully`,
        action: 'delete'
      });
      setOpenSnackbar(true);
      
      fetchAnnouncements();
      setShowDeleteModal(false);
      setDeleteId(null);
    } catch (err) {
      setError('Failed to delete announcement');
      console.error('Error deleting announcement:', err);
    }
  };

  const getTypeBadgeClass = (type) => {
    switch (type?.toLowerCase()) {
      case 'info':
        return 'bg-blue-100 text-blue-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeLabel = (type) => {
    if (!type) return 'Info';
    return type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();
  };

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
            backgroundColor: snackbarMessage.action === 'delete' ? '#DC2626' : '#4F46E5',
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
              <h1 className="text-2xl font-bold text-gray-900">Announcement Management</h1>
              <p className="text-gray-500 mt-1">Manage and view all announcements</p>
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
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-indigo-50 rounded-lg">
                <Megaphone className="h-6 w-6 text-indigo-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-800">Announcements</h2>
            </div>

            <div className="flex justify-end mb-6">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowAddModal(true)}
                className="bg-indigo-600 text-white px-4 py-2 rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200 flex items-center gap-2"
              >
                <Plus className="h-5 w-5" />
                Add New Announcement
              </motion.button>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
              </div>
            ) : announcements.length === 0 ? (
              <div className="py-12 text-center">
                <Megaphone className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-lg font-medium text-gray-700">No announcements found</h3>
                <p className="mt-1 text-gray-500">Get started by adding a new announcement.</p>
                <div className="mt-6">
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowAddModal(true)}
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                  >
                    <Plus className="-ml-1 mr-2 h-5 w-5" />
                    Add Announcement
                  </motion.button>
                </div>
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {announcements.map((announcement) => (
                  <motion.div
                    key={announcement.announcementId}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-md shadow-sm border border-gray-200 hover:shadow-md transition-all duration-300 p-4 relative"
                  >
                    <div className="absolute top-4 right-4">
                      <Tooltip text="Delete Announcement">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => { setDeleteId(announcement.announcementId); setShowDeleteModal(true); }}
                          className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                        >
                          <Trash2 className="h-5 w-5" />
                        </motion.button>
                      </Tooltip>
                    </div>

                    <div className="mb-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeBadgeClass(announcement.type)}`}>
                        {getTypeLabel(announcement.type)}
                      </span>
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => { setSelectedAnnouncement(announcement); setShowDetailModal(true); }}
                      className="text-lg font-semibold text-indigo-700 hover:underline focus:outline-none mb-2 text-left w-full"
                    >
                      {announcement.title}
                    </motion.button>

                    <div className="border-t border-gray-100 pt-4 mt-4">
                      <div className="flex justify-between text-sm text-gray-500">
                        <span>Start: {new Date(announcement.startTime).toLocaleDateString()}</span>
                        <span>End: {new Date(announcement.endTime).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Add Announcement Modal */}
        <Transition.Root show={showAddModal} as={Fragment}>
          <Dialog as="div" className="relative z-50" onClose={() => {
            setShowAddModal(false);
            setFormData({
              title: '',
              message: '',
              startTime: '',
              endTime: '',
              type: 'info'
            });
          }}>
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
                  <Dialog.Panel className="relative transform overflow-hidden rounded-xl shadow-2xl bg-white p-8 text-left max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                    <div className="absolute top-0 right-0 pt-4 pr-4">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        type="button"
                        className="rounded-full p-2 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                        onClick={() => {
                          setShowAddModal(false);
                          setFormData({
                            title: '',
                            message: '',
                            startTime: '',
                            endTime: '',
                            type: 'info'
                          });
                        }}
                      >
                        <span className="sr-only">Close</span>
                        <X className="h-6 w-6" aria-hidden="true" />
                      </motion.button>
                    </div>
                    <div className="sm:flex sm:items-start">
                      <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-indigo-100 sm:mx-0 sm:h-10 sm:w-10">
                        <Plus className="h-6 w-6 text-indigo-600" aria-hidden="true" />
                      </div>
                      <div className="mt-4 sm:mt-0 sm:ml-4 sm:text-left w-full">
                        <Dialog.Title as="h3" className="text-2xl font-bold text-gray-900 mb-6">
                          Add New Announcement
                        </Dialog.Title>
                        <form onSubmit={handleSubmit} className="space-y-6">
                          <div className="space-y-2">
                            <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title *</label>
                            <input
                              type="text"
                              name="title"
                              id="title"
                              value={formData.title}
                              onChange={handleInputChange}
                              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors bg-gray-50 shadow-sm"
                              required
                              placeholder="Enter announcement title"
                            />
                          </div>

                          <div className="space-y-2">
                            <label htmlFor="message" className="block text-sm font-medium text-gray-700">Message *</label>
                            <textarea
                              name="message"
                              id="message"
                              rows={4}
                              value={formData.message}
                              onChange={handleInputChange}
                              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors bg-gray-50 shadow-sm"
                              required
                              placeholder="Enter announcement message"
                            />
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <label htmlFor="startTime" className="block text-sm font-medium text-gray-700">Start Date *</label>
                              <input
                                type="date"
                                name="startTime"
                                id="startTime"
                                value={formData.startTime}
                                onChange={handleInputChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors bg-gray-50 shadow-sm"
                                required
                              />
                            </div>
                            <div className="space-y-2">
                              <label htmlFor="endTime" className="block text-sm font-medium text-gray-700">End Date *</label>
                              <input
                                type="date"
                                name="endTime"
                                id="endTime"
                                value={formData.endTime}
                                onChange={handleInputChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors bg-gray-50 shadow-sm"
                                required
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <label htmlFor="type" className="block text-sm font-medium text-gray-700">Type</label>
                            <select
                              name="type"
                              id="type"
                              value={formData.type}
                              onChange={handleInputChange}
                              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors bg-gray-50 shadow-sm"
                            >
                              <option value="info">Info</option>
                              <option value="warning">Warning</option>
                              <option value="error">Error</option>
                            </select>
                          </div>

                          <div className="flex justify-end gap-3">
                            <motion.button
                              whileHover={{ scale: 1.03 }}
                              whileTap={{ scale: 0.98 }}
                              type="button"
                              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                              onClick={() => {
                                setShowAddModal(false);
                                setFormData({
                                  title: '',
                                  message: '',
                                  startTime: '',
                                  endTime: '',
                                  type: 'info'
                                });
                              }}
                            >
                              Cancel
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.03 }}
                              whileTap={{ scale: 0.98 }}
                              type="submit"
                              className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                            >
                              Add Announcement
                            </motion.button>
                          </div>
                        </form>
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
                  <Dialog.Panel className="relative transform overflow-hidden rounded-xl shadow-2xl bg-white p-8 text-left max-w-md w-full">
                    <div className="sm:flex sm:items-start">
                      <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                        <Trash2 className="h-6 w-6 text-red-600" aria-hidden="true" />
                      </div>
                      <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                        <Dialog.Title as="h3" className="text-2xl font-bold text-gray-900 mb-4">
                          Delete Announcement
                        </Dialog.Title>
                        <div className="mt-2">
                          <p className="text-sm text-gray-600 mb-4">
                            Are you sure you want to delete this announcement? This action cannot be undone.
                          </p>
                          {announcements.find(a => a.announcementId === deleteId) && (
                            <div className="bg-gray-50 rounded-lg p-4 text-gray-700 text-sm shadow-sm">
                              <strong className="font-semibold">Title:</strong> {announcements.find(a => a.announcementId === deleteId).title}
                              <br />
                              <strong className="font-semibold">Message:</strong> {announcements.find(a => a.announcementId === deleteId).message}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="mt-6 flex flex-row-reverse gap-3">
                      <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.98 }}
                        type="button"
                        className="inline-flex justify-center rounded-lg bg-red-600 px-6 py-3 text-sm font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 transition-all"
                        onClick={handleDelete}
                      >
                        Delete
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.98 }}
                        type="button"
                        className="inline-flex justify-center rounded-lg border border-gray-200 bg-white px-6 py-3 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 transition-all"
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

        {showDetailModal && selectedAnnouncement && (
          <Transition.Root show={showDetailModal} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={() => setShowDetailModal(false)}>
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
                    <Dialog.Panel className="relative transform overflow-hidden rounded-xl shadow-2xl bg-white p-8 text-left max-w-lg w-full">
                      <Dialog.Title as="h3" className="text-2xl font-bold text-gray-900 mb-4">
                        {selectedAnnouncement.title}
                      </Dialog.Title>
                      <div className="mb-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeBadgeClass(selectedAnnouncement.type)}`}>
                          {getTypeLabel(selectedAnnouncement.type)}
                        </span>
                      </div>
                      <div className="mb-4 text-gray-700 whitespace-pre-line">
                        {selectedAnnouncement.message}
                      </div>
                      <div className="flex justify-between text-sm text-gray-500 border-t pt-4">
                        <span>Start: {new Date(selectedAnnouncement.startTime).toLocaleDateString()}</span>
                        <span>End: {new Date(selectedAnnouncement.endTime).toLocaleDateString()}</span>
                      </div>
                      <div className="mt-6 flex justify-end">
                        <motion.button
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.98 }}
                          type="button"
                          className="inline-flex justify-center rounded-lg border border-gray-200 bg-white px-6 py-3 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 transition-all"
                          onClick={() => setShowDetailModal(false)}
                        >
                          Close
                        </motion.button>
                      </div>
                    </Dialog.Panel>
                  </Transition.Child>
                </div>
              </div>
            </Dialog>
          </Transition.Root>
        )}
      </main>
    </div>
  );
};

export default AdminAnnouncements;