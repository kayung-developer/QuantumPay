// FILE: src/pages/admin/ManageBlogPage.js

import React, { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { toast } from 'react-hot-toast';

// --- Component Imports ---
import DashboardLayout from '../../components/layout/DashboardLayout';
import Button from '../../components/common/Button';
import Spinner from '../../components/common/Spinner';
import BlogFormModal from '../../components/admin/BlogFormModal';

// --- Hook Imports ---
import { useApi, useApiPost } from '../../hooks/useApi';

// --- Icon Imports ---
import { PlusIcon, BookOpenIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

const ManageBlogPage = () => {
    const { data: posts, loading, error, request: refetchPosts } = useApi('/admin/blog-posts/all');
    const { post: deletePost } = useApiPost('', { method: 'DELETE' });

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedPost, setSelectedPost] = useState(null);

    const handleOpenCreate = () => {
        setSelectedPost(null);
        setIsModalOpen(true);
    };

    const handleOpenEdit = (post) => {
        setSelectedPost(post);
        setIsModalOpen(true);
    };

    const handleModalClose = () => {
        setIsModalOpen(false);
        setSelectedPost(null); // Clear selection on close
    };

    const handleSaveSuccess = (isEditing) => {
        handleModalClose();
        refetchPosts();
        toast.success(`Blog post has been successfully ${isEditing ? 'updated' : 'created'}.`);
    };

    const handleDelete = async (post) => {
        if (window.confirm(`Are you sure you want to delete the post titled "${post.title}"? This action cannot be undone.`)) {
            const result = await deletePost({}, { url: `/admin/blog-posts/${post.id}` });
            if (result.success) {
                toast.success("Blog post deleted.");
                refetchPosts();
            }
        }
    };

    const renderContent = () => {
        if (loading) return <div className="p-12 text-center"><Spinner /></div>;
        if (error) return <div className="p-12 text-center text-red-400">Could not load blog posts. Please try again.</div>;
        if (!posts || posts.length === 0) {
            return (
                 <div className="p-12 text-center text-neutral-500 dark:text-neutral-400 border-2 border-dashed border-neutral-300 dark:border-neutral-700 rounded-lg">
                    <BookOpenIcon className="h-12 w-12 mx-auto"/>
                    <p className="mt-2 font-semibold">No blog posts have been created yet.</p>
                    <p className="mt-1 text-sm">Click "New Post" to write your first article.</p>
                </div>
            );
        }

        return (
             <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-neutral-200 dark:divide-neutral-800">
                    <thead className="bg-neutral-50 dark:bg-neutral-800/50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase">Title & Author</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase">Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase">Status</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                        {posts.map(post => (
                            <tr key={post.id}>
                                <td className="px-6 py-4">
                                    <div className="font-medium text-neutral-900 dark:text-white">{post.title}</div>
                                    <div className="text-sm text-neutral-500 dark:text-neutral-400">{post.author.full_name}</div>
                                </td>
                                <td className="px-6 py-4 text-sm text-neutral-500 dark:text-neutral-300">{format(parseISO(post.publication_date), 'MMM d, yyyy')}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${post.is_published ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300' : 'bg-neutral-100 dark:bg-neutral-700 text-neutral-800 dark:text-neutral-300'}`}>
                                        {post.is_published ? 'Published' : 'Draft'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right space-x-2">
                                    <Button onClick={() => handleOpenEdit(post)} variant="ghost" size="sm"><PencilIcon className="h-4 w-4"/></Button>
                                    <Button onClick={() => handleDelete(post)} variant="ghost" size="sm"><TrashIcon className="h-4 w-4 text-red-500"/></Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };

    return (
        <DashboardLayout pageTitle="Manage Blog Posts">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-3xl font-bold font-display text-neutral-900 dark:text-white">Blog Content</h1>
                    <p className="mt-1 text-neutral-600 dark:text-neutral-400">Create, edit, and publish articles for your public blog.</p>
                </div>
                <Button onClick={handleOpenCreate}>
                    <PlusIcon className="h-5 w-5 mr-2"/>New Post
                </Button>
            </div>
            {renderContent()}

            {isModalOpen && (
                <BlogFormModal
                    isOpen={isModalOpen}
                    onClose={handleModalClose}
                    onSuccess={handleSaveSuccess}
                    post={selectedPost}
                />
            )}
        </DashboardLayout>
    );
};

export default ManageBlogPage;