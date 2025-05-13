import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Dialog, Transition } from '@headlessui/react';
import { Trash2, User, Users, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

const UserManagement = () => {
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState('members');
  const [members, setMembers] = useState([]);
  const [staffs, setStaffs] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [newStaff, setNewStaff] = useState({
    name: '',
    email: '',
    password: '',
    position: ''
  });
  const [showStaffModal, setShowStaffModal] = useState(false);
  const staffModalRef = useRef(null);
  const [showDeleteMemberModal, setShowDeleteMemberModal] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState(null);

  useEffect(() => {
    if (activeTab === 'members') {
      fetchMembers();
    } else {
      fetchStaffs();
    }
  }, [activeTab]);

  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === 'Escape') setShowStaffModal(false);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (staffModalRef.current && !staffModalRef.current.contains(event.target)) {
        setShowStaffModal(false);
      }
    }
    if (showStaffModal) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showStaffModal]);

  const fetchMembers = async () => {
    try {
      const res = await axios.get('http://localhost:5176/api/Admin/members', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMembers(res.data);
    } catch (err) {
      setError('Failed to load members');
    } finally {
      setLoading(false);
    }
  };

  const fetchStaffs = async () => {
    try {
      const res = await axios.get('http://localhost:5176/api/Admin/staffs', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStaffs(res.data);
    } catch (err) {
      setError('Failed to load staff');
    } finally {
      setLoading(false);
    }
  };

  const handleAddStaff = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5176/api/Admin/staffs', newStaff, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNewStaff({ name: '', email: '', password: '', position: '' });
      setStaffs(prev => [...prev, res.data.staff]);
      setError('');
      setShowStaffModal(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add staff member');
    }
  };

  const handleDeleteStaff = async (staffId) => {
    if (!staffId) {
      setError('Invalid staff ID');
      return;
    }
    if (!window.confirm('Are you sure you want to delete this staff member?')) return;
    
    try {
      await axios.delete(`http://localhost:5176/api/Admin/staffs/${staffId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStaffs(prev => prev.filter(staff => staff.staffId !== staffId));
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete staff member');
    }
  };

  const handleDeleteMember = async (memberId) => {
    if (!memberId) {
      setError('Invalid member ID');
      return;
    }
    const member = members.find(m => m.memberId === memberId);
    setMemberToDelete(member);
    setShowDeleteMemberModal(true);
  };

  const confirmDeleteMember = async () => {
    if (!memberToDelete) return;
    try {
      await axios.delete(`http://localhost:5176/api/Admin/members/${memberToDelete.memberId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMembers(prev => prev.filter(member => member.memberId !== memberToDelete.memberId));
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete member');
    } finally {
      setShowDeleteMemberModal(false);
      setMemberToDelete(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-12 w-12 text-indigo-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
              <p className="text-gray-500 mt-1">Manage members and staff accounts</p>
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
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </motion.div>
        )}

        {/* Tabs */}
        <div className="mb-6">
          <div className="flex space-x-4 border-b border-gray-200">
            <button
              onClick={() => setActiveTab('members')}
              className={`px-4 py-3 font-medium text-sm rounded-t-lg transition-all ${
                activeTab === 'members'
                  ? 'bg-white border-t border-l border-r border-gray-200 text-indigo-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-white/50'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Users className={`w-5 h-5 ${activeTab === 'members' ? 'text-indigo-600' : 'text-gray-500'}`} />
                <span>Members</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('staff')}
              className={`px-4 py-3 font-medium text-sm rounded-t-lg transition-all ${
                activeTab === 'staff'
                  ? 'bg-white border-t border-l border-r border-gray-200 text-blue-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-white/50'
              }`}
            >
              <div className="flex items-center space-x-2">
                <User className={`w-5 h-5 ${activeTab === 'staff' ? 'text-blue-600' : 'text-gray-500'}`} />
                <span>Staff</span>
              </div>
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
          {/* Members Tab */}
          {activeTab === 'members' && (
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-800">Member Directory</h2>
                <div className="text-sm text-gray-500">
                  {members.length} {members.length === 1 ? 'member' : 'members'} total
                </div>
              </div>

              {members.length === 0 ? (
                <div className="py-12 text-center">
                  <Users className="mx-auto h-16 w-16 text-gray-300" />
                  <h3 className="mt-4 text-lg font-medium text-gray-700">No members found</h3>
                  <p className="mt-1 text-gray-500">When members register, they'll appear here.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Name
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Email
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Join Date
                        </th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {members.map((member) => (
                        <tr key={member.memberId} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="bg-indigo-100 h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 mr-3">
                                <span className="text-indigo-600 font-medium">
                                  {member.fullName?.charAt(0).toUpperCase() || 'M'}
                                </span>
                              </div>
                              <div className="text-sm font-medium text-gray-900">{member.fullName}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {member.email}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(member.joinDate).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              onClick={() => handleDeleteMember(member.memberId)}
                              className="text-red-600 hover:text-red-900"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Staff Tab */}
          {activeTab === 'staff' && (
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-800">Staff Management</h2>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowStaffModal(true)}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Add Staff
                </motion.button>
              </div>

              {staffs.length === 0 ? (
                <div className="py-12 text-center">
                  <User className="mx-auto h-16 w-16 text-gray-300" />
                  <h3 className="mt-4 text-lg font-medium text-gray-700">No staff members</h3>
                  <p className="mt-1 text-gray-500">Get started by adding a new staff member.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Name
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Email
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Position
                        </th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {staffs.map((staff) => (
                        <tr key={staff.staffId} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="bg-blue-100 h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 mr-3">
                                <span className="text-blue-600 font-medium">
                                  {staff.name?.charAt(0).toUpperCase() || 'S'}
                                </span>
                              </div>
                              <div className="text-sm font-medium text-gray-900">{staff.name}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {staff.email}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                              {staff.position}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              onClick={() => handleDeleteStaff(staff.staffId)}
                              className="text-red-600 hover:text-red-900"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Add Staff Modal */}
      {showStaffModal && (
        <div className="fixed z-50 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div ref={staffModalRef} className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
                    <User className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Add new staff member</h3>
                    <div className="mt-2">
                      <form onSubmit={handleAddStaff} className="space-y-4">
                        <div>
                          <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
                          <input
                            type="text"
                            id="name"
                            value={newStaff.name}
                            onChange={(e) => setNewStaff({...newStaff, name: e.target.value})}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            required
                          />
                        </div>
                        <div>
                          <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                          <input
                            type="email"
                            id="email"
                            value={newStaff.email}
                            onChange={(e) => setNewStaff({...newStaff, email: e.target.value})}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            required
                          />
                        </div>
                        <div>
                          <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                          <input
                            type="password"
                            id="password"
                            value={newStaff.password}
                            onChange={(e) => setNewStaff({...newStaff, password: e.target.value})}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            required
                          />
                        </div>
                        <div>
                          <label htmlFor="position" className="block text-sm font-medium text-gray-700">Position</label>
                          <input
                            type="text"
                            id="position"
                            value={newStaff.position}
                            onChange={(e) => setNewStaff({...newStaff, position: e.target.value})}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            required
                          />
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={handleAddStaff}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Add Staff
                </motion.button>
                <button
                  type="button"
                  onClick={() => setShowStaffModal(false)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Member Confirmation Modal */}
      <Transition.Root show={showDeleteMemberModal} as={React.Fragment}>
        <Dialog as="div" className="fixed z-50 inset-0 overflow-y-auto" onClose={() => setShowDeleteMemberModal(false)}>
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <Transition.Child
              as={React.Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Dialog.Overlay className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
            </Transition.Child>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <Transition.Child
              as={React.Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                      <Trash2 className="h-6 w-6 text-red-600" aria-hidden="true" />
                    </div>
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                      <Dialog.Title as="h3" className="text-lg leading-6 font-medium text-gray-900">
                        Delete Member
                      </Dialog.Title>
                      <div className="mt-2">
                        <p className="text-sm text-gray-500">
                          Are you sure you want to delete this member? This action cannot be undone.
                        </p>
                        {memberToDelete && (
                          <div className="mt-4 bg-gray-50 p-3 rounded-md">
                            <p className="text-sm font-medium text-gray-700">
                              <span className="font-semibold">Name:</span> {memberToDelete.fullName}
                            </p>
                            <p className="text-sm font-medium text-gray-700 mt-1">
                              <span className="font-semibold">Email:</span> {memberToDelete.email}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                    onClick={confirmDeleteMember}
                  >
                    Delete
                  </motion.button>
                  <button
                    type="button"
                    onClick={() => setShowDeleteMemberModal(false)}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition.Root>
    </div>
  );
};

export default UserManagement;