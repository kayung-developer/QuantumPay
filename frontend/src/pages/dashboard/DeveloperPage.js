import React, { useState, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

// --- Component Imports ---
import { useAuth } from '../../context/AuthContext';
import { useApi, useApiPost } from '../../hooks/useApi';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Button from '../../components/common/Button';
import Spinner from '../../components/common/Spinner';
import Modal from '../../components/common/Modal';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import FormInput from '../../components/common/FormInput';
import { KeyIcon, GlobeAltIcon, PlusIcon, ClipboardDocumentIcon, TrashIcon, CheckIcon, SparklesIcon } from '@heroicons/react/24/outline';

// =================================================================================
// SUB-COMPONENTS FOR CLEANER CODE
// =================================================================================

// --- [THEME-AWARE] API Usage & Limits Card ---
const ApiUsageCard = ({ limits, userRole }) => {
    const { t } = useTranslation();

    // Determine if the user has top-tier access, either by role or by plan.
    const hasUltimateAccess = userRole === 'superuser' || userRole === 'admin' || limits.name === 'Ultimate';

    return (
        <div className="bg-white dark:bg-neutral-900 shadow border border-neutral-200 dark:border-neutral-800 rounded-lg">
            <div className="p-6">
                <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">{t('dev_usage_title')}</h2>
                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">{t('dev_current_plan')}</p>
                        {/* If superuser, show a special badge */}
                        <p className="text-xl font-semibold text-neutral-900 dark:text-white mt-1">
                            {userRole === 'superuser' || userRole === 'admin' ? (
                                <span className="capitalize">{userRole} Access</span>
                            ) : (
                                limits.name
                            )}
                        </p>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">{t('dev_rate_limit')}</p>
                        <p className="text-xl font-semibold text-neutral-900 dark:text-white mt-1">
                            {limits.rate_limit} <span className="text-base font-normal text-neutral-500">{t('dev_requests_minute')}</span>
                        </p>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">{t('dev_webhooks')}</p>
                        <p className="text-xl font-semibold text-neutral-900 dark:text-white mt-1">
                            {`0 / ${limits.max_webhooks} used`}
                        </p>
                    </div>
                </div>
                {/* [THE FIX] Only show the upgrade prompt if the user does NOT have ultimate access. */}
                {!hasUltimateAccess && (
                     <div className="mt-6 p-4 bg-primary/10 dark:bg-primary/20 rounded-lg flex items-center justify-between">
                         <div className="flex items-center">
                             <SparklesIcon className="h-6 w-6 text-primary mr-3 flex-shrink-0"/>
                             <p className="text-sm text-neutral-800 dark:text-neutral-200">{t('dev_upgrade_prompt')}</p>
                         </div>
                         <Link to="/pricing">
                            <Button size="sm">Upgrade Plan</Button>
                         </Link>
                     </div>
                )}
            </div>
        </div>
    );
};


// --- [THEME-AWARE] API Keys Manager ---
const ApiKeysManager = ({ keys, loading, onRevoke, onGenerate }) => {
    const { t } = useTranslation();
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    <KeyIcon className="h-6 w-6 text-primary"/>
                    <h2 className="text-2xl font-semibold font-display text-neutral-900 dark:text-white">API Keys</h2>
                </div>
                <Button onClick={onGenerate}><PlusIcon className="h-5 w-5 mr-2"/>Generate Key</Button>
            </div>
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg shadow overflow-hidden">
                {loading ? <div className="p-8 text-center"><Spinner/></div> : (
                    <table className="min-w-full divide-y divide-neutral-200 dark:divide-neutral-800">
                        <thead className="bg-neutral-50 dark:bg-neutral-800/50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase">Label</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase">Key Prefix</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase">Created</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                            {keys?.map(key => (
                                <tr key={key.id}>
                                    <td className="px-6 py-4 font-medium text-neutral-900 dark:text-white">{key.label}</td>
                                    <td className="px-6 py-4 font-mono text-neutral-500 dark:text-neutral-400">{key.key_prefix}...</td>
                                    <td className="px-6 py-4 text-neutral-500 dark:text-neutral-400">{format(new Date(key.created_at), 'MMM d, yyyy')}</td>
                                    <td className="px-6 py-4 text-right">
                                        <Button variant="ghost" size="sm" onClick={() => onRevoke(key)}>
                                            <TrashIcon className="h-5 w-5 text-red-500"/>
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
                {keys?.length === 0 && !loading && <p className="p-8 text-center text-neutral-500">No API keys generated yet.</p>}
            </div>
        </div>
    );
};




// --- Create Key Modal ---
const CreateKeyModal = ({ isOpen, onClose, onSuccess }) => {
     const { post: createKey, loading } = useApiPost('/developer/api-keys');
    const KeySchema = Yup.object().shape({ label: Yup.string().required('A label for the key is required') });

    const handleSubmit = async (values) => {
        const result = await createKey(values);
        if (result.success) {
            onSuccess(result.data);
        }
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Generate New API Key">
            <Formik initialValues={{ label: '', is_live_mode: true }} validationSchema={KeySchema} onSubmit={handleSubmit}>
                {() => (
                    <Form className="space-y-4">
                        <FormInput label="Key Label" name="label" placeholder="e.g., Production Server" />
                        <div className="pt-4 flex justify-end space-x-3 border-t border-neutral-800">
                            <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                            <Button type="submit" isLoading={loading}>Generate Key</Button>
                        </div>
                    </Form>
                )}
            </Formik>
        </Modal>
    );
}

// --- Webhook Creation Modal (Copied from previous implementation for completeness) ---
const CreateWebhookModal = ({ isOpen, onClose, onSuccess }) => {
    const { post: createWebhook, loading } = useApiPost('/developer/webhooks');
    const WebhookSchema = Yup.object().shape({
        url: Yup.string().url('Must be a valid URL').required('Webhook URL is required'),
        enabled_events: Yup.array().min(1, 'Select at least one event'),
    });
    const availableEvents = ["payment.succeeded", "transaction.succeeded", "invoice.paid", "dispute.created"];

    const handleSubmit = async (values) => {
        const result = await createWebhook(values);
        if(result.success) {
            onSuccess(result.data);
        }
    }
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Create New Webhook Endpoint">
             <Formik
                initialValues={{ url: '', enabled_events: [] }}
                validationSchema={WebhookSchema}
                onSubmit={handleSubmit}
            >
                {({ values, errors, touched }) => (
                    <Form className="space-y-6">
                        <FormInput label="Endpoint URL" name="url" placeholder="https://your-server.com/webhook" />
                        <div>
                            <label className="block text-sm font-medium text-neutral-300 mb-2">Events to subscribe to</label>
                            <div role="group" aria-labelledby="checkbox-group" className="grid grid-cols-2 gap-2">
                               {availableEvents.map(event => (
                                   <label key={event} className="flex items-center space-x-2">
                                       <Field type="checkbox" name="enabled_events" value={event} className="h-4 w-4 text-primary bg-neutral-800 border-neutral-700 rounded focus:ring-primary"/>
                                       <span className="text-sm text-neutral-200">{event}</span>
                                   </label>
                               ))}
                            </div>
                            {errors.enabled_events && touched.enabled_events && <p className="text-red-500 text-xs mt-2">{errors.enabled_events}</p>}
                        </div>
                         <div className="pt-4 flex justify-end space-x-3 border-t border-neutral-800">
                            <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                            <Button type="submit" isLoading={loading}>Create Webhook</Button>
                        </div>
                    </Form>
                )}
            </Formik>
        </Modal>
    );
}


const DeveloperPage = () => {
    const { t } = useTranslation();
    const { dbUser } = useAuth();
    
    // --- API Data Fetching ---
    const { data: apiKeys, loading: keysLoading, request: refetchKeys } = useApi('/developer/api-keys');
    const { data: webhooks, loading: webhooksLoading, request: refetchWebhooks } = useApi('/developer/webhooks');
    const { post: revokeKeyPost, loading: revoking } = useApiPost('', { method: 'DELETE' });

    // --- State Management ---
    const [modal, setModal] = useState({ type: null, data: null });
    const [newlyCreated, setNewlyCreated] = useState({ key: null, webhook: null });
    const [copied, setCopied] = useState(false);

    // --- [FEATURE GATING LOGIC] ---
    const apiLimits = useMemo(() => {
        // 1. Check for role-based overrides first.
        if (dbUser?.role === 'superuser') {
            return { name: 'Ultimate', rate_limit: 240, max_webhooks: 10 };
        }
        if (dbUser?.role === 'admin') {
            return { name: 'Premium', rate_limit: 120, max_webhooks: 3 };
        }

        // 2. If not an admin, check for an active subscription.
        const planId = dbUser?.subscription?.plan?.id;
        if (planId === 'ultimate') {
            return { name: 'Ultimate', rate_limit: 240, max_webhooks: 10 };
        }
        if (planId === 'premium') {
            return { name: 'Premium', rate_limit: 120, max_webhooks: 3 };
        }

        // 3. If no role override and no active subscription, default to Free.
        return { name: 'Free', rate_limit: 60, max_webhooks: 1 };
    }, [dbUser]);

    // --- Event Handlers ---
    const handleKeyCreated = (newKey) => {
        setModal({ type: null, data: null });
        setNewlyCreated({ ...newlyCreated, key: newKey });
        refetchKeys();
    };

    const handleWebhookCreated = (newWebhook) => {
        setModal({ type: null, data: null });
        setNewlyCreated({ ...newlyCreated, webhook: newWebhook });
        refetchWebhooks();
    };

    const handleRevoke = async () => {
        if (!modal.data) return;
        const result = await revokeKeyPost({}, { url: `/developer/api-keys/${modal.data.id}` });
        if (result.success) {
            setModal({ type: null, data: null });
            refetchKeys();
        }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
       <DashboardLayout pageTitleKey="developer_title">
            {/* --- Modals --- */}
            <Modal isOpen={!!newlyCreated.key} onClose={() => setNewlyCreated({ ...newlyCreated, key: null })} title="API Key Generated Successfully">
                <div className="space-y-4">
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">Please copy your secret key and store it securely. <span className="font-bold text-amber-500 dark:text-amber-400">You will not be able to see it again.</span></p>
                    <div className="p-4 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg flex items-center justify-between">
                        <pre className="text-neutral-900 dark:text-white font-mono truncate">{newlyCreated.key?.full_key}</pre>
                        <Button variant="ghost" size="sm" onClick={() => copyToClipboard(newlyCreated.key?.full_key)}>
                            {copied ? <CheckIcon className="h-5 w-5 text-green-500"/> : <ClipboardDocumentIcon className="h-5 w-5"/>}
                        </Button>
                    </div>
                    <div className="flex justify-end pt-2"><Button onClick={() => setNewlyCreated({ ...newlyCreated, key: null })}>I have saved my key</Button></div>
                </div>
            </Modal>
            
            <Modal isOpen={!!modal.data && modal.type === 'revokeKey'} onClose={() => setModal({ type: null, data: null })} title="Confirm Revoke API Key">
                 <div className="space-y-4">
                    <p className="text-neutral-800 dark:text-neutral-200">Are you sure you want to permanently revoke the key named <span className="font-bold text-neutral-900 dark:text-white">"{modal.data?.label}"</span>?</p>
                    <p className="text-sm text-amber-600 dark:text-amber-400">This action cannot be undone and any applications using this key will immediately fail.</p>
                     <div className="flex justify-end pt-4 space-x-3 border-t border-neutral-200 dark:border-neutral-800">
                        <Button variant="secondary" onClick={() => setModal({ type: null, data: null })}>Cancel</Button>
                        <Button variant="danger" onClick={handleRevoke} isLoading={revoking}>Yes, Revoke Key</Button>
                     </div>
                 </div>
            </Modal>
            
            <div className="space-y-12">
                <div>
                    <h1 className="text-3xl font-bold font-display text-neutral-900 dark:text-white">{t('developer_title')}</h1>
                    <p className="mt-1 text-neutral-600 dark:text-neutral-400">{t('dev_subtitle')}</p>
                </div>

                <ApiUsageCard limits={apiLimits} />
                <ApiKeysManager keys={apiKeys} loading={keysLoading} onRevoke={(key) => setModal({type: 'revokeKey', data: key})} onGenerate={() => setModal({type: 'createKey', data: true})} />
                {/* Webhooks Manager would be its own component similar to ApiKeysManager */}
                {/* <WebhooksManager webhooks={webhooks} loading={webhooksLoading} maxWebhooks={apiLimits.max_webhooks} /> */}
            </div>
            
            {/* We can keep modals here or move them into their respective manager components */}
             <CreateKeyModal 
    isOpen={modal.type === 'createKey'} 
    onClose={() => setModal({ type: null, data: null })} 
    onSuccess={handleKeyCreated} 
/>
        </DashboardLayout>
    );
};


export default DeveloperPage;

