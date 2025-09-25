import React from 'react';
import Modal from '../../common/Modal';
import { Formik, Form, FieldArray, Field, ErrorMessage } from 'formik'; // <-- Import ErrorMessage
import * as Yup from 'yup';
import FormInput from '../../common/FormInput';
import Button from '../../common/Button';
import { useApiPost } from '../../../hooks/useApi';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import { toastSuccess, toastError } from '../components/common/Toast';

const CreateVaultSchema = Yup.object().shape({
  name: Yup.string().min(3, 'Name is too short').required('Vault name is required'),
  description: Yup.string(),
  // Add validation for each email in the array
  member_emails: Yup.array().of(
      Yup.string().email('Must be a valid email address')
  ),
  approval_threshold: Yup.number()
    .min(1, 'Threshold must be at least 1')
    .required('Approval threshold is required')
    // Custom validation to check against member count
    .test(
        'is-less-than-members',
        'Threshold cannot be greater than the number of members',
        function (value) {
            const { member_emails } = this.parent;
            const totalMembers = 1 + (member_emails?.length || 0);
            return value <= totalMembers;
        }
    ),
});

const CreateVaultModal = ({ isOpen, onClose, onSuccess }) => {
  const { post: createVault, loading } = useApiPost('/vaults');

  const handleSubmit = async (values, { resetForm }) => {
    // Remove any empty email fields before submitting
    const finalMemberEmails = values.member_emails.filter(email => email && email.trim() !== '');

    const payload = {
      ...values,
      member_emails: finalMemberEmails,
      approval_threshold: parseInt(values.approval_threshold, 10),
    };

    const result = await createVault(payload);
    if (result.success) {
      onSuccess(result.data);
      resetForm();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Shared Vault">
      <Formik
        initialValues={{
          name: '',
          description: '',
          member_emails: [''], // Start with one empty field for a good UX
          approval_threshold: 1,
        }}
        validationSchema={CreateVaultSchema}
        onSubmit={handleSubmit}
      >
        {({ values, errors, touched }) => ( // We need errors and touched for validation display
          <Form className="space-y-6">
            <FormInput label="Vault Name" name="name" placeholder="e.g., Family Vacation Fund" />
            <FormInput label="Description (Optional)" name="description" as="textarea" rows={2} />

            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Invite Members (by Email)</label>
              <FieldArray name="member_emails">
                {({ push, remove }) => (
                  <div className="space-y-3">
                    {values.member_emails.map((email, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <div className="flex-grow">
                          {/* Use a standard Field for the array input */}
                          <Field
                            name={`member_emails.${index}`}
                            placeholder="member@example.com"
                            className="block w-full px-3 py-2 bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-md text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary"
                          />
                          {/* [THE FIX] Use the ErrorMessage component to correctly render the error string */}
                          <ErrorMessage
                            name={`member_emails.${index}`}
                            component="p"
                            className="text-red-500 text-xs mt-1"
                          />
                        </div>
                        <Button type="button" variant="danger" size="sm" onClick={() => remove(index)} className="p-2">
                          <TrashIcon className="h-5 w-5" />
                        </Button>
                      </div>
                    ))}
                     <Button type="button" variant="secondary" size="sm" onClick={() => push('')}>
                        <PlusIcon className="h-5 w-5 mr-1" /> Add Member
                     </Button>
                  </div>
                )}
              </FieldArray>
            </div>

            <FormInput
                label="Withdrawal Approval Threshold"
                name="approval_threshold"
                type="number"
                min="1"
            />

            <div className="pt-4 flex justify-end space-x-3 border-t border-neutral-200 dark:border-neutral-800">
              <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
              <Button type="submit" isLoading={loading}>Create Vault</Button>
            </div>
          </Form>
        )}
      </Formik>
    </Modal>
  );
};

export default CreateVaultModal;