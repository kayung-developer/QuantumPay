// FILE: src/pages/admin/ManageUsersPage.js

import React, { useState, useEffect } from 'react';
import { format, parseISO } from 'date-fns';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';

// --- Component Imports ---
import DashboardLayout from '../../components/layout/DashboardLayout';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import { toast } from 'react-hot-toast';

// --- Hook Imports ---
import { useApi, useApiPost } from '../../hooks/useApi';

// --- Icon Imports ---
import { PencilSquareIcon, CheckCircleIcon, XCircleIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';

// --- User Edit Modal Sub-Component ---
const UserEditModal = ({ isOpen, onClose, user, onUserUpdate }) => {
    const { post: updateUser, loading } = useApiPost(`/admin/users/${user?.id}`, { method: 'PUT' });

    if (!user) return null;

    const UserEditSchema = Yup.object().shape({
        role: Yup.string().oneOf(['user', 'admin', 'superuser']).required('Role is required'),
        is_active: Yup.boolean().required('Status is required'),
        kyc_status: Yup.string().oneOf(['not_submitted', 'pending_review', 'verified', 'rejected']).required('KYC status is required'),
    });

    const handleSubmit = async (values) => {
        const result = await updateUser(values);
        if (result.success) {
            onUserUpdate(result.data); // Pass updated user back to parent for instant UI update
            onClose();
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Edit User: ${user.full_name}`}>
            <Formik initialValues={{ role: user.role, is_active: user.is_active, kyc_status: user.kyc_status }} validationSchema={UserEditSchema} onSubmit={handleSubmit} enableReinitialize>
                {({ errors, touched }) => (
                    <Form className="space-y-6">
                        <div>
                            <label htmlFor="role" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">Role</label>
                            <Field as="select" name="role" id="role" className="mt-1 block w-full pl-3 pr-10 py-2 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-md text-neutral-900 dark:text-white focus:outline-none focus:ring-primary focus:border-primary">
                                <option value="user">User</option>
                                <option value="admin">Admin</option>
                                <option value="superuser">Superuser</option>
                            </Field>
                        </div>
                        <div>
                            <label htmlFor="kyc_status" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">KYC Status</label>
                            <Field as="select" name="kyc_status" id="kyc_status" className="mt-1 block w-full pl-3 pr-10 py-2 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-md text-neutral-900 dark:text-white focus:outline-none focus:ring-primary focus:border-primary">
                                <option value="not_submitted">Not Submitted</option>
                                <option value="pending_review">Pending Review</option>
                                <option value="verified">Verified</option>
                                <option value="rejected">Rejected</option>
                            </Field>
                        </div>
                        <div className="flex items-center">
                            <Field type="checkbox" name="is_active" id="is_active" className="h-4 w-4 text-primary bg-neutral-100 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700 rounded focus:ring-primary" />
                            <label htmlFor="is_active" className="ml-2 block text-sm text-neutral-700 dark:text-neutral-300">Account Active</label>
                        </div>
                        <div className="pt-4 flex justify-end space-x-3 border-t border-neutral-200 dark:border-neutral-800">
                            <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                            <Button type="submit" isLoading={loading}>Save Changes</Button>
                        </div>
                    </Form>
                )}
            </Formik>
        </Modal>
    );
};

// --- Main ManageUsersPage Component ---
const ManageUsersPage = () => {
    const [users, setUsers] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [countryFilter, setCountryFilter] = useState('');

    // [THE FIX] API URL is now dynamic based on the filter state.
    const apiUrl = countryFilter ? `/admin/users?country_code=${countryFilter}` : '/admin/users';
    const { data: fetchedUsers, loading, error } = useApi(apiUrl); // useApi will refetch when apiUrl changes.

    useEffect(() => {
        if (fetchedUsers) setUsers(fetchedUsers);
    }, [fetchedUsers]);

    const handleEditClick = (user) => {
        setSelectedUser(user);
        setIsModalOpen(true);
    };

    // [THE FIX] This callback allows for instant UI updates without a full refetch.
    const handleUserUpdate = (updatedUser) => {
        setUsers(prevUsers => prevUsers.map(u => u.id === updatedUser.id ? updatedUser : u));
        toast.success("User updated successfully!");
    };

    return (
        <DashboardLayout pageTitle="Manage Users">
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold font-display text-neutral-900 dark:text-white">User Management</h1>
                    <p className="mt-1 text-neutral-600 dark:text-neutral-400">View, search, and manage all platform users.</p>
                </div>

                <div className="flex justify-end">
                    <select value={countryFilter} onChange={(e) => setCountryFilter(e.target.value)} className="block pl-3 pr-10 py-2 bg-white dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700 rounded-md text-neutral-900 dark:text-white focus:ring-primary">
                        <option value="">All Countries</option>
                        <option value="NG">Nigeria</option><option value="KE">Kenya</option><option value="GH">Ghana</option><option value="ZA">South Africa</option><option value="US">United States</option>
                    </select>
                </div>

                <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg shadow-lg overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-neutral-200 dark:divide-neutral-800">
                            <thead className="bg-neutral-50 dark:bg-neutral-800/50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase">User</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase">Country</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase">Role</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase">KYC</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase">Joined</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                                {loading ? (<tr><td colSpan="7" className="text-center py-10">Loading users...</td></tr>) : error ? (<tr><td colSpan="7" className="text-center py-10 text-red-400">Failed to load users.</td></tr>) : (
                                    users.map(user => (
                                        <tr key={user.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50">
                                            <td className="px-6 py-4 whitespace-nowrap"><div className="text-sm font-medium text-neutral-900 dark:text-white">{user.full_name}</div><div className="text-sm text-neutral-500 dark:text-neutral-400">{user.email}</div></td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-600 dark:text-neutral-300"><span className={`fi fi-${user.country_code?.toLowerCase()} mr-2`}></span>{user.country_code}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-600 dark:text-neutral-300 capitalize">{user.role === 'superuser' && <ShieldCheckIcon className="h-5 w-5 text-primary-light inline-block mr-1"/>}{user.role}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">{user.is_active ? <span className="inline-flex items-center text-green-500"><CheckCircleIcon className="h-5 w-5 mr-1"/>Active</span> : <span className="inline-flex items-center text-red-500"><XCircleIcon className="h-5 w-5 mr-1"/>Inactive</span>}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-600 dark:text-neutral-300 capitalize">{user.kyc_status.replace('_', ' ')}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500 dark:text-neutral-400">{format(parseISO(user.created_at), 'MMM d, yyyy')}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium"><Button variant="ghost" size="sm" onClick={() => handleEditClick(user)}><PencilSquareIcon className="h-5 w-5"/></Button></td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            <UserEditModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} user={selectedUser} onUserUpdate={handleUserUpdate} />
        </DashboardLayout>
    );
};

export default ManageUsersPage;