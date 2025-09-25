import React from 'react';
import { useParams, Link } from 'react-router-dom';
import useApi from '../../hooks/useApi';
import { motion } from 'framer-motion';
import { format, parseISO } from 'date-fns';
import { ArrowLeftIcon, ShareIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import Button from '../../components/common/Button';

// --- [NEW] Skeleton Loader Component ---
const BlogPostSkeletonLoader = () => (
    <div className="animate-pulse">
        <div className="text-center mb-12">
            <div className="h-6 w-24 bg-neutral-200 dark:bg-neutral-700 rounded-full mx-auto"></div>
            <div className="mt-4 h-12 w-3/4 bg-neutral-200 dark:bg-neutral-700 rounded mx-auto"></div>
            <div className="mt-2 h-8 w-1/2 bg-neutral-200 dark:bg-neutral-700 rounded mx-auto"></div>
            <div className="mt-6 h-5 w-1/3 bg-neutral-200 dark:bg-neutral-700 rounded mx-auto"></div>
        </div>
        <div className="aspect-video w-full max-w-4xl mx-auto rounded-lg bg-neutral-200 dark:bg-neutral-800"></div>
        <div className="mx-auto mt-12 space-y-4 max-w-2xl">
            <div className="h-6 w-full bg-neutral-200 dark:bg-neutral-700 rounded"></div>
            <div className="h-6 w-5/6 bg-neutral-200 dark:bg-neutral-700 rounded"></div>
            <div className="h-6 w-full bg-neutral-200 dark:bg-neutral-700 rounded"></div>
        </div>
    </div>
);

// --- [NEW] Social Share Component ---
const SocialShare = ({ title }) => {
    const pageUrl = window.location.href;
    const shareText = `Check out this article from QuantumPay: ${title}`;

    const links = {
        twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(pageUrl)}&text=${encodeURIComponent(shareText)}`,
        linkedin: `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(pageUrl)}&title=${encodeURIComponent(title)}&summary=${encodeURIComponent(shareText)}`,
    };

    return (
        <div className="flex items-center space-x-4">
            <ShareIcon className="h-5 w-5 text-neutral-500 dark:text-neutral-400"/>
            <a href={links.twitter} target="_blank" rel="noopener noreferrer" className="text-neutral-500 dark:text-neutral-400 hover:text-primary">Twitter</a>
            <a href={links.linkedin} target="_blank" rel="noopener noreferrer" className="text-neutral-500 dark:text-neutral-400 hover:text-primary">LinkedIn</a>
        </div>
    );
};


const BlogPostPage = () => {
    const { postId } = useParams();
    const { data: post, loading, error } = useApi(`/content/blog-posts/${postId}`);

    const renderContent = () => {
        if (loading) {
            return <BlogPostSkeletonLoader />;
        }
        if (error) {
            return (
                <div className="text-center py-20">
                    <ExclamationTriangleIcon className="h-12 w-12 mx-auto text-yellow-500"/>
                    <h2 className="mt-4 text-2xl font-bold text-neutral-900 dark:text-white">Post Not Found</h2>
                    <p className="mt-2 text-neutral-600 dark:text-neutral-400">The article you're looking for might have been moved or doesn't exist.</p>
                    <Button to="/blog" className="mt-6" variant="secondary">Back to Blog</Button>
                </div>
            );
        }
        if (!post) {
            return null;
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
                            <span key={tag} className="px-2 py-1 text-xs font-medium text-primary bg-primary/10 dark:bg-primary/20 rounded-full capitalize">{tag}</span>
                        ))}
                    </div>
                    <h1 className="mt-4 text-4xl font-bold tracking-tight text-neutral-900 dark:text-white sm:text-5xl font-display">
                        {post.title}
                    </h1>
                    <div className="mt-6 text-sm text-neutral-600 dark:text-neutral-400">
                        <span>By {post.author}</span> &bull; <span>{format(parseISO(post.publication_date), 'MMMM d, yyyy')}</span> &bull; <span>{post.read_time_minutes} min read</span>
                    </div>
                </div>

                <div className="aspect-video w-full max-w-4xl mx-auto rounded-lg overflow-hidden border border-neutral-200 dark:border-neutral-800">
                     <img className="w-full h-full object-cover" src={post.image_url} alt={post.title} />
                </div>

                {/* [THEME-AWARE] The prose classes are updated to be theme-aware */}
                <div
                    className="prose dark:prose-invert prose-lg mx-auto mt-12 text-neutral-700 dark:text-neutral-300 prose-headings:text-neutral-900 dark:prose-headings:text-white prose-a:text-primary hover:prose-a:text-primary-light"
                    dangerouslySetInnerHTML={{ __html: post.content }}
                />

                <div className="mt-16 pt-8 border-t border-neutral-200 dark:border-neutral-800 flex justify-between items-center max-w-4xl mx-auto">
                    <Link to="/blog" className="inline-flex items-center text-primary hover:text-primary-dark transition-colors">
                        <ArrowLeftIcon className="h-4 w-4 mr-2"/>
                        Back to all articles
                    </Link>
                    {/* [NEW] Add the social share component */}
                    <SocialShare title={post.title} />
                </div>
            </motion.div>
        );
    }

    return (
        // The main container inherits its base theme from PageWrapper
        <div className="pt-24 pb-20 sm:pt-32 sm:pb-28">
            <div className="mx-auto max-w-4xl px-6 lg:px-8">
               {renderContent()}
            </div>
        </div>
    );
};

export default BlogPostPage;