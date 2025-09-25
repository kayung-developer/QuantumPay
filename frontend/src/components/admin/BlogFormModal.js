import React from 'react';
import Modal from '../common/Modal';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import FormInput from '../common/FormInput';
import Button from '../common/Button';
import { useApiPost } from '../../hooks/useApi';
import { Switch } from '@headlessui/react';

const BlogSchema = Yup.object().shape({
    title: Yup.string().min(5, 'Title is too short').required('Title is required'),
    summary: Yup.string().max(300, 'Must be 300 characters or less').required('A short summary is required'),
    content: Yup.string().min(100, 'Content is too short').required('The post content is required'),
    image_url: Yup.string().url('Must be a valid URL').required('Header image URL is required'),
    tags: Yup.string().required('At least one tag is required (comma-separated)'),
    read_time_minutes: Yup.number().min(1, 'Must be at least 1 minute').required('Read time is required'),
    is_published: Yup.boolean(),
});

const BlogFormModal = ({ isOpen, onClose, onSuccess, post }) => {
    const isEditing = !!post;
    const endpoint = isEditing ? `/admin/blog-posts/${post.id}` : '/admin/blog-posts';
    const { post: savePost, loading } = useApiPost(endpoint, { method: isEditing ? 'PUT' : 'POST' });

    const handleSubmit = async (values) => {
        const payload = {
            ...values,
            read_time_minutes: parseInt(values.read_time_minutes, 10),
        };
        const result = await savePost(payload);
        if (result.success) {
            onSuccess(isEditing);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={isEditing ? 'Edit Blog Post' : 'Create New Post'} size="2xl">
            <Formik
                initialValues={{
                    title: post?.title || '',
                    summary: post?.summary || '',
                    content: post?.content || '',
                    image_url: post?.image_url || '',
                    tags: post?.tags || '',
                    read_time_minutes: post?.read_time_minutes || 5,
                    is_published: post?.is_published ?? false,
                }}
                validationSchema={BlogSchema}
                onSubmit={handleSubmit}
                enableReinitialize
            >
                {({ values, setFieldValue }) => (
                    <Form className="space-y-4">
                        <FormInput name="title" label="Post Title" />
                        <FormInput name="image_url" label="Header Image URL" placeholder="https://example.com/image.png" />
                        <FormInput as="textarea" name="summary" label="Summary (for list view, max 300 chars)" rows={3} />
                        <FormInput as="textarea" name="content" label="Full Content (Markdown supported)" rows={12} />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormInput name="tags" label="Tags (comma-separated)" placeholder="product, update, security" />
                            <FormInput name="read_time_minutes" label="Read Time (minutes)" type="number" />
                        </div>
                        <div className="flex items-center justify-between p-3 bg-neutral-100 dark:bg-neutral-800 rounded-lg">
                             <span className="flex-grow flex flex-col">
                                <span className="text-sm font-medium text-neutral-900 dark:text-white">Publish Post</span>
                                <span className="text-sm text-neutral-500 dark:text-neutral-400">Published posts will be visible on the public blog page.</span>
                            </span>
                            <Switch
                                checked={values.is_published}
                                onChange={(value) => setFieldValue('is_published', value)}
                                className={`${values.is_published ? 'bg-primary' : 'bg-neutral-200 dark:bg-neutral-700'} relative inline-flex h-6 w-11 items-center rounded-full transition-colors`}
                            >
                                <span className={`${values.is_published ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}/>
                            </Switch>
                        </div>
                        <div className="pt-4 flex justify-end">
                            <Button type="submit" isLoading={loading}>{isEditing ? 'Save Changes' : 'Create Post'}</Button>
                        </div>
                    </Form>
                )}
            </Formik>
        </Modal>
    );
};

export default BlogFormModal;