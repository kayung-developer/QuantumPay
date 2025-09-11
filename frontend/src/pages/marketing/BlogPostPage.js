import React from 'react';
import { useParams, Link } from 'react-router-dom';
import useApi from '../../hooks/useApi';
import Spinner from '../../components/common/Spinner';
import { motion } from 'framer-motion';
import { format, parseISO } from 'date-fns';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

const BlogPostPage = () => {
    const { postId } = useParams();
    const { data: post, loading, error } = useApi(`/content/blog-posts/${postId}`);

    const renderContent = () => {
        if (loading) {
            return <div className="flex justify-center py-40"><Spinner size="lg" /></div>;
        }
        if (error) {
            return <p className="text-center text-red-400">Could not find this blog post. It may have been moved or deleted.</p>;
        }
        if (!post) {
            return null; // or a not found component
        }
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
            >
                <div className="text-center mb-12">
                    <div className="flex items-center justify-center space-x-2">
                        {post.tags.map(tag => (
                            <span key={tag} className="px-2 py-1 text-xs font-medium text-primary-light bg-primary/20 rounded-full capitalize">{tag}</span>
                        ))}
                    </div>
                    <h1 className="mt-4 text-4xl font-bold tracking-tight text-white sm:text-5xl font-display">
                        {post.title}
                    </h1>
                    <div className="mt-6 text-sm text-neutral-400">
                        <span>By {post.author}</span> &bull; <span>{format(parseISO(post.publication_date), 'MMMM d, yyyy')}</span> &bull; <span>{post.read_time_minutes} min read</span>
                    </div>
                </div>

                <div className="aspect-video w-full max-w-4xl mx-auto rounded-lg overflow-hidden border border-neutral-800">
                     <img className="w-full h-full object-cover" src={post.image_url} alt={post.title} />
                </div>

                {/* In a real CMS, this would be sanitized HTML. For our mock, we can use dangerouslySetInnerHTML */}
                <div
                    className="prose prose-invert prose-lg mx-auto mt-12 text-neutral-300 prose-headings:text-white prose-a:text-primary hover:prose-a:text-primary-light"
                    dangerouslySetInnerHTML={{ __html: post.content }}
                />

                <div className="mt-16 text-center">
                    <Link to="/blog" className="inline-flex items-center text-primary hover:text-primary-light transition-colors">
                        <ArrowLeftIcon className="h-4 w-4 mr-2"/>
                        Back to all articles
                    </Link>
                </div>
            </motion.div>
        );
    }


    return (
        <div className="bg-neutral-950">
            <div className="pt-24 pb-20 sm:pt-32 sm:pb-28">
                <div className="mx-auto max-w-4xl px-6 lg:px-8">
                   {renderContent()}
                </div>
            </div>
        </div>
    );
};

export default BlogPostPage;