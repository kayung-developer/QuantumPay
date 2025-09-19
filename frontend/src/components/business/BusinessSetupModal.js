import React from 'react';
import Modal from '../common/Modal';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import Button from '../common/Button';
import FormInput from '../common/FormInput';
import { useApiPost } from '../../hooks/useApi';
import toast from 'react-hot-toast';

const BusinessSetupSchema = Yup.object().shape({
    business_name: Yup.string().min(3, 'Business name is too short').required('Business name is required'),
    business_description: Yup.string(),
});

const BusinessSetupModal = ({ isOpen, onClose, onSuccess }) => {
    const { post: setupBusiness, loading } = useApiPost('/business/setup');

    const handleSubmit = async (values) => {
        const result = await setupBusiness(values);
        if (result.success) {
            toast.success("Congrats!, Your business profile has been created!");
            onSuccess();
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Setup Your Business Profile">
            <p className="text-sm text-neutral-600 dark:text-neutral-600 dark:text-neutral-400 mb-6">
                Create a business profile to unlock powerful tools like invoicing, payroll, and a mobile POS.
            </p>
            <Formik
                initialValues={{ business_name: '', business_description: '' }}
                validationSchema={BusinessSetupSchema}
                onSubmit={handleSubmit}
            >
                {() => (
                    <Form className="space-y-4">
                        <FormInput label="Business Name" name="business_name" />
                        <FormInput label="Business Description (Optional)" name="business_description" as="textarea" rows={3} />
                        <div className="pt-4 flex justify-end">
                            <Button type="submit" isLoading={loading}>Create Business</Button>
                        </div>
                    </Form>
                )}
            </Formik>
        </Modal>
    );
};

export default BusinessSetupModal;