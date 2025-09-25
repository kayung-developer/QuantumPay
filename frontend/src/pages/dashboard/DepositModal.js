import React, { useState } from 'react';
import Modal from '../common/Modal';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import FormInput from '../common/FormInput';
import Button from '../common/Button';
import { useApiPost } from '../../hooks/useApi';
import { toastSuccess, toastError } from 'components/common/Toast';

const DepositSchema = Yup.object().shape({
  amount: Yup.number()
    .typeError('Amount must be a number')
    .positive('Amount must be positive')
    .min(1, 'Minimum deposit is $1.00')
    .required('Amount is required'),
});

const DepositModal = ({ isOpen, onClose, wallet, onSuccess }) => {
  const { post: initializeDeposit, loading, error, data } = useApiPost('/wallets/deposit/initialize');
  const [paymentUrl, setPaymentUrl] = useState(null);

  const handleSubmit = async (values, { setSubmitting }) => {
    const payload = {
      amount: values.amount,
      currency_code: wallet.currency_code,
      gateway: 'paystack', // This could be selectable in a more advanced version
    };

    const result = await initializeDeposit(payload);

    if (result.success && result.data?.data?.authorization_url) {
      setPaymentUrl(result.data.data.authorization_url);
      // In a real app, you might auto-redirect or just show the link. We'll show the link.
      toastSuccess('Deposit initialized! Please complete the payment.');
    } else {
        // Error toast is handled by useApiPost
    }
    setSubmitting(false);
  };

  // Custom close handler to reset state
  const handleClose = () => {
    setPaymentUrl(null);
    onClose();
  }

  const renderContent = () => {
    if (paymentUrl) {
      return (
        <div className="text-center">
            <h3 className="text-lg font-medium text-green-400">Payment Link Generated!</h3>
            <p className="mt-2 text-sm text-neutral-400">
                Please follow the link below to complete your deposit of
                <span className="font-bold text-white"> {new Intl.NumberFormat('en-US', { style: 'currency', currency: wallet.currency_code }).format(data.data.amount / 100)}</span>.
            </p>
            <div className="mt-4 p-3 bg-neutral-800 border border-neutral-700 rounded-md text-primary break-all">
                <a href={paymentUrl} target="_blank" rel="noopener noreferrer">{paymentUrl}</a>
            </div>
            <p className="mt-4 text-xs text-neutral-500">
                This window can be closed. Your balance will be updated automatically upon successful payment.
            </p>
            <Button onClick={handleClose} className="mt-6" variant="secondary">Close</Button>
        </div>
      );
    }

    return (
      <Formik
        initialValues={{ amount: '' }}
        validationSchema={DepositSchema}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting }) => (
          <Form className="space-y-6">
            <p className="text-sm text-neutral-400">
              You are depositing into your{' '}
              <span className="font-bold text-white">{wallet.currency_code}</span> wallet.
            </p>
            <FormInput
              label="Amount to Deposit"
              name="amount"
              type="number"
              placeholder="e.g., 100.00"
              step="0.01"
            />
            <div className="pt-2">
              <Button type="submit" isLoading={isSubmitting} fullWidth size="lg">
                Proceed to Payment
              </Button>
            </div>
            <p className="text-xs text-center text-neutral-500">
                You will be redirected to our secure payment partner to complete the transaction.
            </p>
          </Form>
        )}
      </Formik>
    );
  };


  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={`Deposit to ${wallet.currency_code} Wallet`}
    >
      {renderContent()}
    </Modal>
  );
};

export default DepositModal;