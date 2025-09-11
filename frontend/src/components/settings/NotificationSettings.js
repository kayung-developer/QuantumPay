import React from 'react';
import SettingsCard from './SettingsCard'; // <-- CORRECTED IMPORT (default)
import Button from '../common/Button';
import { useAuth } from '../../context/AuthContext';
import { useApiPost } from '../../hooks/useApi';
import { Switch } from '@headlessui/react';
import { Formik, Form, Field } from 'formik';

const NotificationSettings = () => {
    const { dbUser, fetchDbUser } = useAuth();
    const { post: updatePrefs, loading } = useApiPost('/users/me/notifications', { method: 'PUT' });

    const handleSubmit = async (values) => {
        const result = await updatePrefs(values);
        if (result.success) {
            fetchDbUser();
        }
    };

    return (
        <SettingsCard
            title="Notification Preferences"
            description="Choose which communications you want to receive and how you get them."
        >
             <Formik
                initialValues={{
                    email_transactions: dbUser?.notification_preferences?.email_transactions ?? true,
                    email_security: dbUser?.notification_preferences?.email_security ?? true,
                }}
                onSubmit={handleSubmit}
                enableReinitialize
            >
                {({ values, setFieldValue, dirty }) => (
                    <Form>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center p-4 bg-neutral-800/50 rounded-lg">
                                <div>
                                    <p className="font-medium text-white">Transactional Emails</p>
                                    <p className="text-xs text-neutral-400">Receive receipts and transfer notifications.</p>
                                </div>
                                <Switch
                                    checked={values.email_transactions}
                                    onChange={() => setFieldValue('email_transactions', !values.email_transactions)}
                                    className={`${values.email_transactions ? 'bg-primary' : 'bg-neutral-700'} relative inline-flex h-6 w-11 items-center rounded-full`}
                                >
                                    <span className={`${values.email_transactions ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition`}/>
                                </Switch>
                            </div>
                             <div className="flex justify-between items-center p-4 bg-neutral-800/50 rounded-lg">
                                <div>
                                    <p className="font-medium text-white">Security Emails</p>
                                    <p className="text-xs text-neutral-400">Receive alerts for new device logins and password changes.</p>
                                </div>
                                <Switch
                                    checked={values.email_security}
                                    onChange={() => setFieldValue('email_security', !values.email_security)}
                                    className={`${values.email_security ? 'bg-primary' : 'bg-neutral-700'} relative inline-flex h-6 w-11 items-center rounded-full`}
                                >
                                    <span className={`${values.email_security ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition`}/>
                                </Switch>
                            </div>
                        </div>
                        {dirty && (
                            <div className="pt-4 flex justify-end border-t border-neutral-800 mt-4">
                                <Button type="submit" isLoading={loading}>Save Preferences</Button>
                            </div>
                        )}
                    </Form>
                )}
            </Formik>
        </SettingsCard>
    );
};

export default NotificationSettings;