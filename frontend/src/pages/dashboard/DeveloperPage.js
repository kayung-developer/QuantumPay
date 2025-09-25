import React, { useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import useApi from '../../hooks/useApi';
import { useApiPost } from '../../hooks/useApi'; // Import the correct hook
import Button from '../../components/common/Button';
import { KeyIcon, GlobeAltIcon, PlusIcon, ClipboardDocumentIcon, TrashIcon, CheckIcon } from '@heroicons/react/24/outline';
import Modal from '../../components/common/Modal';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import FormInput from '../../components/common/FormInput';
import { toastSuccess, toastError } from '../../components/common/Toast';
import Spinner from '../../components/common/Spinner';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';


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
    const { data: apiKeys, loading: keysLoading, request: refetchKeys } = useApi('/developer/api-keys');
    const { data: webhooks, loading: webhooksLoading, request: refetchWebhooks } = useApi('/developer/webhooks');
    const { post: revokeKeyPost, loading: revoking } = useApiPost('/developer/api-keys/', { method: 'DELETE' });

    const [isCreateKeyModalOpen, setCreateKeyModalOpen] = useState(false);
    const [isCreateWebhookModalOpen, setCreateWebhookModalOpen] = useState(false);
    const [newlyCreatedKey, setNewlyCreatedKey] = useState(null);
    const [newlyCreatedWebhook, setNewlyCreatedWebhook] = useState(null);
    const [keyToRevoke, setKeyToRevoke] = useState(null);
    const [copied, setCopied] = useState(false);

    const handleKeyCreated = (newKey) => {
        setCreateKeyModalOpen(false);
        setNewlyCreatedKey(newKey);
        refetchKeys();
    };

    const handleWebhookCreated = (newWebhook) => {
        setCreateWebhookModalOpen(false);
        setNewlyCreatedWebhook(newWebhook);
        refetchWebhooks();
    };

    const handleRevoke = async () => {
        if (!keyToRevoke) return;
        const result = await revokeKeyPost({}, { url: `/developer/api-keys/${keyToRevoke.id}` });
        if (result.success) {
            toastSuccess(`API Key "${keyToRevoke.label}" has been revoked.`);
            setKeyToRevoke(null);
            refetchKeys();
        } else {
             toastError(result.error || "Failed to revoke key.");
        }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        toastSuccess("Copied to clipboard!");
        setTimeout(() => setCopied(false), 2000);
    }

    return (
       <DashboardLayout pageTitleKey="developer_title">
            {/* Modal to show the newly created API key ONCE */}
            <Modal isOpen={!!newlyCreatedKey} onClose={() => setNewlyCreatedKey(null)} title="API Key Generated Successfully">
                <div className="space-y-4">
                    <p className="text-sm text-neutral-400">Please copy your secret key and store it securely. <span className="font-bold text-yellow-400">You will not be able to see it again.</span></p>
                    <div className="p-4 bg-neutral-800 border border-neutral-700 rounded-lg flex items-center justify-between">
                        <pre className="text-white font-mono truncate">{newlyCreatedKey?.full_key}</pre>
                        <Button variant="ghost" size="sm" onClick={() => copyToClipboard(newlyCreatedKey?.full_key)}>
                            {copied ? <CheckIcon className="h-5 w-5 text-green-400"/> : <ClipboardDocumentIcon className="h-5 w-5"/>}
                        </Button>
                    </div>
                    <div className="flex justify-end pt-2"><Button onClick={() => setNewlyCreatedKey(null)}>I have saved my key</Button></div>
                </div>
            </Modal>

            {/* Modal to show newly created Webhook Secret */}
            <Modal isOpen={!!newlyCreatedWebhook} onClose={() => setNewlyCreatedWebhook(null)} title="Webhook Created Successfully">
                <div className="space-y-4">
                    <p className="text-sm text-neutral-400">Your new webhook endpoint has been created. Please store your signing secret securely. <span className="font-bold text-yellow-400">You will not be able to see it again.</span></p>
                    <div className="p-4 bg-neutral-800 border border-neutral-700 rounded-lg flex items-center justify-between">
                        <pre className="text-white font-mono truncate">{newlyCreatedWebhook?.secret}</pre>
                         <Button variant="ghost" size="sm" onClick={() => copyToClipboard(newlyCreatedWebhook?.secret)}>
                            {copied ? <CheckIcon className="h-5 w-5 text-green-400"/> : <ClipboardDocumentIcon className="h-5 w-5"/>}
                        </Button>
                    </div>
                    <div className="flex justify-end pt-2"><Button onClick={() => setNewlyCreatedWebhook(null)}>I have saved my secret</Button></div>
                </div>
            </Modal>

            {/* Modal to confirm revoking an API key */}
            <Modal isOpen={!!keyToRevoke} onClose={() => setKeyToRevoke(null)} title="Confirm Revoke API Key">
                 <div className="space-y-4">
                    <p>Are you sure you want to permanently revoke the key named <span className="font-bold text-white">"{keyToRevoke?.label}"</span>?</p>
                    <p className="text-sm text-yellow-400">This action cannot be undone and any applications using this key will immediately fail.</p>
                     <div className="flex justify-end pt-2 space-x-3">
                        <Button variant="secondary" onClick={() => setKeyToRevoke(null)}>Cancel</Button>
                        <Button variant="danger" onClick={handleRevoke} isLoading={revoking}>Yes, Revoke Key</Button>
                     </div>
                 </div>
            </Modal>

            <div className="space-y-12">
                <div>
                    <h1 className="text-3xl font-bold font-display text-neutral-600 dark:text-white">Developer Tools</h1>
                    <p className="mt-1 text-neutral-400">Access API keys, webhooks, and documentation to build with QuantumPay.</p>
                </div>

                <div className="space-y-4">
                    <div className="flex items-center justify-between"><div className="flex items-center space-x-3"><KeyIcon className="h-6 w-6 text-primary"/><h2 className="text-2xl font-semibold font-display text-neutral-600 dark:text-white">API Keys</h2></div><Button onClick={() => setCreateKeyModalOpen(true)}><PlusIcon className="h-5 w-5 mr-2"/>Generate Key</Button></div>
                    <div className="bg-neutral-900 border border-neutral-800 rounded-lg shadow-lg overflow-hidden">{keysLoading ? <div className="p-8 text-center"><Spinner/></div> : (<table className="min-w-full divide-y divide-neutral-800"><thead className="bg-neutral-800/50"><tr><th className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase">Label</th><th className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase">Key Prefix</th><th className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase">Created</th><th className="px-6 py-3 text-right text-xs font-medium text-neutral-400 uppercase">Actions</th></tr></thead><tbody className="divide-y divide-neutral-800">{apiKeys?.map(key => (<tr key={key.id}><td className="px-6 py-4 font-medium text-white">{key.label}</td><td className="px-6 py-4 font-mono text-neutral-400">{key.key_prefix}...</td><td className="px-6 py-4 text-neutral-400">{format(new Date(key.created_at), 'MMM d, yyyy')}</td><td className="px-6 py-4 text-right"><Button variant="ghost" size="sm" onClick={() => setKeyToRevoke(key)}><TrashIcon className="h-5 w-5 text-red-500"/></Button></td></tr>))}</tbody></table>)}{apiKeys?.length === 0 && !keysLoading && <p className="p-8 text-center text-neutral-500">No API keys generated yet.</p>}</div>
                </div>

                <div className="space-y-4">
                    <div className="flex items-center justify-between"><div className="flex items-center space-x-3"><GlobeAltIcon className="h-6 w-6 text-primary"/><h2 className="text-2xl font-semibold font-display text-neutral-600 dark:text-white">Webhook Endpoints</h2></div><Button onClick={() => setCreateWebhookModalOpen(true)}><PlusIcon className="h-5 w-5 mr-2"/>Add Endpoint</Button></div>
                    <div className="bg-neutral-900 border border-neutral-800 rounded-lg shadow-lg overflow-hidden">{webhooksLoading ? <div className="p-8 text-center"><Spinner/></div> : (<table className="min-w-full divide-y divide-neutral-800"><thead className="bg-neutral-800/50"><tr><th className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase">Endpoint URL</th><th className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase">Status</th><th className="px-6 py-3 text-right text-xs font-medium text-neutral-400 uppercase">Actions</th></tr></thead><tbody className="divide-y divide-neutral-800">{webhooks?.map(hook => (<tr key={hook.id}><td className="px-6 py-4 font-mono text-white truncate max-w-sm">{hook.url}</td><td className="px-6 py-4"><span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${hook.is_active ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'}`}>{hook.is_active ? 'Active' : 'Inactive'}</span></td><td className="px-6 py-4 text-right"><Button variant="ghost" size="sm" disabled><TrashIcon className="h-5 w-5 text-red-500"/></Button></td></tr>))}</tbody></table>)}{webhooks?.length === 0 && !webhooksLoading && <p className="p-8 text-center text-neutral-500">No webhooks created yet.</p>}</div>
                </div>
            </div>

            <CreateKeyModal isOpen={isCreateKeyModalOpen} onClose={() => setCreateKeyModalOpen(false)} onSuccess={handleKeyCreated}/>
            <CreateWebhookModal isOpen={isCreateWebhookModalOpen} onClose={() => setCreateWebhookModalOpen(false)} onSuccess={handleWebhookCreated} />
        </DashboardLayout>
    );
};

export default DeveloperPage;