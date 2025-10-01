// FILE: frontend/src/components/business/CreateTreasuryRuleModal.js

import React from 'react';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { useTranslation } from 'react-i18next';

// --- Component Imports ---
import Modal from '../common/Modal';
import Button from '../common/Button';
import FormInput from '../common/FormInput';
import Spinner from '../common/Spinner';

// --- Hook Imports ---
import { useApi, useApiPost } from '../../hooks/useApi';

const TreasuryRuleSchema = Yup.object().shape({
    name: Yup.string().min(3, 'Name is too short').required('A name for this rule is required'),
    source_wallet_id: Yup.string().required('You must select a source wallet'),
    destination_wallet_id: Yup.string().required('You must select a destination wallet'),
    trigger_amount: Yup.number().min(1, 'Threshold must be at least 1').required('A trigger threshold is required'),
});

const CreateTreasuryRuleModal = ({ isOpen, onClose, onSuccess }) => {
    const { t } = useTranslation();
    const { data: wallets, loading: walletsLoading } = useApi(isOpen ? '/wallets/me' : null);
    const { post: createRule, loading: creating } = useApiPost('/business/treasury/rules');

    const handleSubmit = async (values, { resetForm }) => {
        const payload = {
            ...values,
            trigger_amount: parseFloat(values.trigger_amount)
        };
        const result = await createRule(payload);
        if (result.success) {
            onSuccess(result.data); // Pass the newly created rule back
            resetForm();
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Create New Treasury Rule" size="lg">
            {walletsLoading ? (
                <div className="flex justify-center py-12"><Spinner /></div>
            ) : (
                <Formik
                    initialValues={{
                        name: '',
                        source_wallet_id: '',
                        destination_wallet_id: '',
                        trigger_amount: '',
                    }}
                    validationSchema={TreasuryRuleSchema}
                    onSubmit={handleSubmit}
                >
                    {({ values }) => (
                        <Form className="space-y-6">
                            <p className="text-sm text-neutral-600 dark:text-neutral-400">
                                Automatically move funds when a balance exceeds a certain amount. For example, sweep excess NGN to your main USD wallet.
                            </p>
                            <FormInput name="name" label="Rule Name" placeholder="e.g., Daily NGN Sweep" />

                            <div>
                                <label htmlFor="source_wallet_id" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Source Wallet</label>
                                <Field as="select" name="source_wallet_id" id="source_wallet_id" className="w-full bg-neutral-100 dark:bg-neutral-800 p-2 rounded-md border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white">
                                    <option value="">-- Select a wallet --</option>
                                    {wallets?.map(w => <option key={w.id} value={w.id}>{w.currency_code} Wallet</option>)}
                                </Field>
                            </div>

                            <FormInput
                                label="Trigger Threshold"
                                name="trigger_amount"
                                type="number"
                                helpText="When the source wallet balance goes above this amount, the rule will run."
                            />

                            <div>
                                <label htmlFor="destination_wallet_id" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Destination Wallet</label>
                                <Field as="select" name="destination_wallet_id" id="destination_wallet_id" className="w-full bg-neutral-100 dark:bg-neutral-800 p-2 rounded-md border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white">
                                     <option value="">-- Select a wallet --</option>
                                     {wallets?.filter(w => w.id !== values.source_wallet_id).map(w => <option key={w.id} value={w.id}>{w.currency_code} Wallet</option>)}
                                </Field>
                            </div>

                            <div className="pt-4 flex justify-end space-x-3 border-t border-neutral-200 dark:border-neutral-800">
                                <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                                <Button type="submit" isLoading={creating}>Create Rule</Button>
                            </div>
                        </Form>
                    )}
                </Formik>
            )}
        </Modal>
    );
};

export default CreateTreasuryRuleModal;