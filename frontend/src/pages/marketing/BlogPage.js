import React from 'react';
import { motion } from 'framer-motion';
import useApi from '../../hooks/useApi';
import Spinner from '../../components/common/Spinner';
import { Link } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import { ArrowRightIcon } from '@heroicons/react/24/outline';

const BlogPostCard = ({ post, featured = false }) => (
    <Link to={`/blog/${post.id}`}>
        <motion.div
            whileHover={{ y: -5 }}
            className={`bg-neutral-900 rounded-lg overflow-hidden border border-neutral-800 transition-all duration-300 h-full flex flex-col ${featured ? 'lg:flex-row' : ''}`}
        >
            <div className={`flex-shrink-0 ${featured ? 'lg:w-1/2' : ''}`}>
                <img className="h-48 w-full object-cover" src={post.image_url} alt={post.title} />
            </div>
            <div className="p-6 flex flex-col justify-between flex-grow">
                <div>
                    <div className="flex items-center space-x-2">
                        {post.tags.map(tag => (
                            <span key={tag} className="px-2 py-1 text-xs font-medium text-primary-light bg-primary/20 rounded-full capitalize">{tag}</span>
                        ))}
                    </div>
                    <h3 className="mt-4 text-xl font-semibold text-white font-display">{post.title}</h3>
                    <p className="mt-2 text-neutral-400 text-sm line-clamp-3">{post.summary}</p>
                </div>
                <div className="mt-4 flex items-center justify-between text-xs text-neutral-500">
                    <span>{post.author} &bull; {format(parseISO(post.publication_date), 'MMM d, yyyy')}</span>
                    <span className="flex items-center">
                        Read More <ArrowRightIcon className="h-3 w-3 ml-1"/>
                    </span>
                </div>
            </div>
        </motion.div>
    </Link>
);

const BlogPage = () => {
    const { data: posts, loading, error } = useApi('/content/blog-posts');

    const renderContent = () => {
        if (loading) {
            return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;
        }
        if (error) {
            return <p className="text-center text-red-400">Failed to load blog posts. Please try again later.</p>;
        }
        if (!posts || posts.length === 0) {
            return <p className="text-center text-neutral-500">No blog posts have been published yet.</p>;
        }

        const [firstPost, ...otherPosts] = posts;

        return (
            <div className="space-y-12">
                {/* Featured Post */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <BlogPostCard post={firstPost} featured={true} />
                </motion.div>

                {/* Grid of other posts */}
                <motion.div
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                    initial="hidden"
                    animate="visible"
                    variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
                >
                    {otherPosts.map(post => (
                         <motion.div key={post.id} variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
                            <BlogPostCard post={post} />
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        );
    };

    return (
        <div className="bg-neutral-950">
            <div className="pt-24 pb-20 sm:pt-32 sm:pb-28">
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="mx-auto max-w-2xl text-center"
                    >
                        <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl font-display">
                            QuantumPay Insights
                        </h1>
                        <p className="mt-6 text-lg leading-8 text-neutral-300">
                            The latest news, product updates, and financial industry analysis from the QuantumPay team.
                        </p>
                    </motion.div>

                    <div className="mt-16">
                        {renderContent()}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BlogPage;