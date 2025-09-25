import React, { useState } from 'react';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import FormInput from '../../common/FormInput';
import Button from '../../common/Button';
import { useApiPost } from '../../../hooks/useApi';
import { DevicePhoneMobileIcon } from '@heroicons/react/24/outline';
import { toastSuccess, toastError } from '../../components/common/Toast';

const MomoSchema = Yup.object().shape({
  phone_number: Yup.string().matches(/^0[25]\d{8}$/, 'Enter a valid Ghanaian number (e.g., 024..., 055...)').required('Phone number is required'),
  network: Yup.string().oneOf(['mtn', 'vod', 'tgo']).required('Please select your network'),
  amount: Yup.number().min(5, 'Minimum deposit is GHS 5').required('Amount is required'),
});

const MomoDeposit = ({ onDepositInitiated }) => {
    const { post: initiateMomo, loading } = useApiPost('/local-payments/gh/momo/deposit');
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleSubmit = async (values) => {
        const result = await initiateMomo(values);
        if (result.success) {
            toastSuccess(result.data.message || "Request sent to your phone!");
            setIsSubmitted(true);
            if (onDepositInitiated) onDepositInitiated();
        }
    };

    if (isSubmitted) {
        return (
            <div className="p-8 text-center space-y-4">
                <DevicePhoneMobileIcon className="h-16 w-16 mx-auto text-primary animate-pulse" />
                <h2 className="text-xl font-semibold text-white">Check Your Phone</h2>
                <p className="text-neutral-700 dark:text-neutral-300">Please approve the payment request sent to your mobile money phone to complete the deposit.</p>
            </div>
        )
    }

    return (
        <div className="p-6">
            <Formik
                initialValues={{ phone_number: '', network: 'mtn', amount: '' }}
                validationSchema={MomoSchema}
                onSubmit={handleSubmit}
            >
                {({ errors, touched }) => (
                    <Form className="space-y-4">
                        <FormInput label="Mobile Money Number" name="phone_number" type="tel" placeholder="0241234567" />
                        <div>
                            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Network</label>
                            <Field as="select" name="network" className="block w-full px-3 py-2 bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-md text-white">
                                <option value="mtn">MTN Mobile Money</option>
                                <option value="vod">Vodafone Cash</option>
                                <option value="tgo">AirtelTigo Money</option>
                            </Field>
                        </div>
                        <FormInput label="Amount (GHS)" name="amount" type="number" />
                        <div className="pt-2">
                            <Button type="submit" isLoading={loading} fullWidth>Deposit</Button>
                        </div>
                    </Form>
                )}
            </Formik>
        </div>
    );
};

export default MomoDeposit;