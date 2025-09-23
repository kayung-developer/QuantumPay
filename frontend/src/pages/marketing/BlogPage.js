import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import useApi from '../../hooks/useApi';
import Spinner from '../../components/common/Spinner';
import { Link } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import { ArrowRightIcon } from '@heroicons/react/24/outline';

// --- Reusable, Theme-Aware BlogPostCard Component ---
const BlogPostCard = ({ post, featured = false }) => (
    <Link to={`/blog/${post.id}`} className="block h-full">
        <motion.div
            whileHover={{ y: -5 }}
            className={`bg-white dark:bg-neutral-900 rounded-lg overflow-hidden border border-neutral-200 dark:border-neutral-800 transition-all duration-300 h-full flex flex-col group ${featured ? 'lg:flex-row' : ''}`}
        >
            <div className={`flex-shrink-0 overflow-hidden ${featured ? 'lg:w-1/2' : ''}`}>
                <img className="h-48 w-full object-cover group-hover:scale-105 transition-transform duration-300" src={post.image_url} alt={post.title} />
            </div>
            <div className="p-6 flex flex-col justify-between flex-grow">
                <div>
                    <div className="flex items-center space-x-2">
                        {post.tags.map(tag => (
                            <span key={tag} className="px-2 py-1 text-xs font-medium text-primary bg-primary/10 dark:bg-primary/20 rounded-full capitalize">{tag}</span>
                        ))}
                    </div>
                    <h3 className="mt-4 text-xl font-semibold text-neutral-900 dark:text-white font-display group-hover:text-primary transition-colors">{post.title}</h3>
                    <p className="mt-2 text-neutral-600 dark:text-neutral-400 text-sm line-clamp-3">{post.summary}</p>
                </div>
                <div className="mt-4 flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-500">
                    <span>{post.author} &bull; {format(parseISO(post.publication_date), 'MMM d, yyyy')}</span>
                    <span className="flex items-center font-semibold text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                        Read More <ArrowRightIcon className="h-4 w-4 ml-1"/>
                    </span>
                </div>
            </div>
        </motion.div>
    </Link>
);

// --- [NEW] Skeleton Loader Component ---
const BlogSkeletonLoader = () => (
    <div className="space-y-12 animate-pulse">
        {/* Featured Post Skeleton */}
        <div className="bg-white dark:bg-neutral-900 rounded-lg overflow-hidden border border-neutral-200 dark:border-neutral-800 lg:flex-row flex-col flex">
            <div className="flex-shrink-0 lg:w-1/2 h-48 bg-neutral-200 dark:bg-neutral-800"></div>
            <div className="p-6 flex flex-col flex-grow w-full">
                <div className="h-5 w-24 bg-neutral-200 dark:bg-neutral-700 rounded-full"></div>
                <div className="mt-4 h-8 w-5/6 bg-neutral-200 dark:bg-neutral-700 rounded"></div>
                <div className="mt-2 h-6 w-full bg-neutral-200 dark:bg-neutral-700 rounded"></div>
                <div className="mt-4 h-4 w-4/6 bg-neutral-200 dark:bg-neutral-700 rounded"></div>
            </div>
        </div>
        {/* Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="bg-white dark:bg-neutral-900 rounded-lg overflow-hidden border border-neutral-200 dark:border-neutral-800 h-80"></div>
            ))}
        </div>
    </div>
);

// --- Main Blog Page Component ---
const BlogPage = () => {
    const { data: posts, loading, error } = useApi('/content/blog-posts');
    const [activeFilter, setActiveFilter] = useState('All');

    const tags = useMemo(() => {
        if (!posts) return [];
        const allTags = posts.flatMap(post => post.tags);
        return ['All', ...new Set(allTags)];
    }, [posts]);

    const filteredPosts = useMemo(() => {
        if (activeFilter === 'All') return posts;
        return posts.filter(post => post.tags.includes(activeFilter));
    }, [posts, activeFilter]);


    const renderContent = () => {
        if (loading) {
            return <BlogSkeletonLoader />;
        }
        if (error) {
            return <p className="text-center text-red-400">Failed to load blog posts. Please try again later.</p>;
        }
        if (!filteredPosts || filteredPosts.length === 0) {
            return <p className="text-center text-neutral-500 dark:text-neutral-400">No blog posts found for this category.</p>;
        }

        const [firstPost, ...otherPosts] = filteredPosts;

        return (
            <div className="space-y-12">
                {firstPost && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                        <BlogPostCard post={firstPost} featured={true} />
                    </motion.div>
                )}
                {otherPosts.length > 0 && (
                     <motion.div
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                        initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
                    >
                        {otherPosts.map(post => (
                             <motion.div key={post.id} variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
                                <BlogPostCard post={post} />
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </div>
        );
    };

    return (
        // The main container inherits its base theme from PageWrapper
        <div className="py-24 sm:py-32">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="mx-auto max-w-2xl text-center">
                    <h1 className="text-4xl font-bold tracking-tight text-neutral-900 dark:text-white sm:text-6xl font-display">
                        QuantumPay Insights
                    </h1>
                    <p className="mt-6 text-lg leading-8 text-neutral-600 dark:text-neutral-300">
                        The latest news, product updates, and financial industry analysis from the QuantumPay team.
                    </p>
                </motion.div>

                {/* --- [NEW] Filter Bar --- */}
                <div className="mt-16 flex justify-center flex-wrap gap-2">
                    {tags.map(tag => (
                        <button
                            key={tag}
                            onClick={() => setActiveFilter(tag)}
                            className={`px-4 py-2 text-sm font-medium rounded-full transition-colors ${
                                activeFilter === tag
                                ? 'bg-primary text-white'
                                : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                            }`}
                        >
                            {tag}
                        </button>
                    ))}
                </div>

                <div className="mt-16">
                    {renderContent()}
                </div>
            </div>
        </div>
    );
};

export default BlogPage;