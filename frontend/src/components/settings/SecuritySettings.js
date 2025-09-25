import React, { useState } from 'react';
import SettingsCard from './SettingsCard';
import Button from '../common/Button';
import { useAuth } from '../../context/AuthContext';
import { KeyIcon, DevicePhoneMobileIcon } from '@heroicons/react/24/outline';
import { toastSuccess, toastError } from '../../components/common/Toast';
import Modal from '../common/Modal';
import { useApiPost } from '../../hooks/useApi';
import QRCode from 'react-qr-code';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import FormInput from '../common/FormInput';

// --- 2FA Setup Modal ---
const TwoFactorSetupModal = ({ isOpen, onClose }) => {
    const [setupData, setSetupData] = useState(null);
    const [error, setError] = useState('');
    const [isVerified, setIsVerified] = useState(false);

    const { post: start2FA, loading: starting } = useApiPost('/users/2fa/enable');
    const { post: verify2FA, loading: verifying } = useApiPost('/users/2fa/verify');
    const { fetchDbUser } = useAuth();

    const VerificationSchema = Yup.object().shape({
        totp_code: Yup.string().matches(/^[0-9]{6}$/, 'Must be a 6-digit code').required('Code is required'),
    });

    const handleStart = async () => {
        setError('');
        const result = await start2FA({});
        if (result.success) {
            setSetupData(result.data);
        } else {
            setError(result.error || 'Failed to start 2FA setup.');
        }
    };

    const handleVerify = async (values) => {
        const result = await verify2FA(values);
        if (result.success) {
            setSetupData(prev => ({ ...prev, recovery_codes: result.data.recovery_codes }));
            setIsVerified(true);
            fetchDbUser(); // Refresh global state to reflect 2FA is enabled
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Setup Two-Factor Authentication">
            {!setupData && (
                <div className="text-center">
                    <p className="text-neutral-700 dark:text-neutral-300 mb-4">Click below to start setting up 2FA with an authenticator app like Google Authenticator or Authy.</p>
                    <Button onClick={handleStart} isLoading={starting}>Start Setup</Button>
                    {error && <p className="text-red-400 mt-2 text-sm">{error}</p>}
                </div>
            )}

            {setupData && !isVerified && (
                <div className="space-y-4">
                    <p className="text-sm text-neutral-600 dark:text-neutral-700 dark:text-neutral-300">1. Scan the QR code with your authenticator app.</p>
                    <div className="p-4 bg-white rounded-lg inline-block mx-auto block w-fit">
                        <QRCode value={setupData.otp_uri} size={160} />
                    </div>
                    <p className="text-sm text-neutral-600 dark:text-neutral-700 dark:text-neutral-300">2. Enter the 6-digit code from your app to verify the setup.</p>
                    <Formik initialValues={{ totp_code: '' }} validationSchema={VerificationSchema} onSubmit={handleVerify}>
                        {() => (
                            <Form className="flex items-center gap-4">
                                <div className="flex-grow"><FormInput name="totp_code" label="Verification Code" /></div>
                                <Button type="submit" isLoading={verifying} className="mt-6">Verify & Enable</Button>
                            </Form>
                        )}
                    </Formik>
                </div>
            )}

            {setupData && isVerified && (
                 <div className="space-y-4 text-center">
                    <h3 className="text-lg font-semibold text-green-400">2FA Enabled Successfully!</h3>
                    <p className="text-neutral-700 dark:text-neutral-300">Please save these recovery codes in a secure place. They can be used to access your account if you lose your device.</p>
                    <div className="p-4 bg-neutral-800 rounded-lg font-mono text-white space-y-1 text-center">
                        {setupData.recovery_codes.map(code => <p key={code}>{code}</p>)}
                    </div>
                     <Button onClick={onClose}>Done</Button>
                 </div>
            )}
        </Modal>
    )
};


const SecuritySettings = () => {
    const { dbUser, resetPassword } = useAuth();
    const [is2FAModalOpen, set2FAModalOpen] = useState(false);

    const handleChangePassword = () => {
        if(dbUser?.email) {
            resetPassword(dbUser.email);
        } else {
            toast.error("Could not send reset link. User email not found.");
        }
    }

    return (
        <div className="space-y-6">
            <SettingsCard
                title="Change Password"
                description="For your security, we will send a password reset link to your email address."
            >
                <div className="flex items-center justify-between">
                    <p className="text-sm text-neutral-600 dark:text-neutral-700 dark:text-neutral-300">Update the password you use to log in.</p>
                    <Button onClick={handleChangePassword} variant="secondary">
                        <KeyIcon className="h-5 w-5 mr-2"/> Send Reset Link
                    </Button>
                </div>
            </SettingsCard>
            <SettingsCard
                title="Two-Factor Authentication (2FA)"
                description="Add an extra layer of security to your account using an authenticator app."
            >
                 <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm text-neutral-600 dark:text-neutral-700 dark:text-neutral-300">Status:
                            <span className={dbUser?.is_2fa_enabled ? 'text-green-400 font-semibold' : 'text-red-400 font-semibold'}>
                                {dbUser?.is_2fa_enabled ? ' Enabled' : ' Disabled'}
                            </span>
                        </p>
                    </div>
                    <Button variant="secondary" onClick={() => set2FAModalOpen(true)}>
                        <DevicePhoneMobileIcon className="h-5 w-5 mr-2"/> {dbUser?.is_2fa_enabled ? 'Manage' : 'Enable'}
                    </Button>
                </div>
            </SettingsCard>
            <TwoFactorSetupModal isOpen={is2FAModalOpen} onClose={() => set2FAModalOpen(false)} />
        </div>
    );
};

export default SecuritySettings;