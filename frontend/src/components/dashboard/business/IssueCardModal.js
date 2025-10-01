import React from 'react';
import Modal from '../../common/Modal';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import FormInput from '../../common/FormInput';
import Button from '../../common/Button';
import { useApiPost } from '../../../hooks/useApi';

const IssueCardSchema = Yup.object().shape({
  assigned_user_email: Yup.string().email('Invalid email').required('Employee email is required'),
  monthly_limit: Yup.number().min(1, 'Limit must be at least $1').required('Monthly limit is required'),
  card_type: Yup.string().oneOf(['virtual', 'physical']).required('Card type is required'),
});


  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Issue New Corporate Card">
      <Formik
        initialValues={{
          assigned_user_email: '',
          monthly_limit: '',
          card_type: 'virtual',
        }}
        validationSchema={IssueCardSchema}
        onSubmit={handleSubmit}
      >
        {({ errors, touched, values }) => (
          <Form className="space-y-6">
            <FormInput
              label="Employee Email"
              name="assigned_user_email"
              type="email"
              placeholder="employee@yourcompany.com"
            />
            <FormInput
              label="Monthly Spending Limit ($)"
              name="monthly_limit"
              type="number"
              placeholder="500"
            />
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Card Type</label>
              <div role="group" className="flex space-x-4">
                <label className="flex items-center space-x-2">
                  <Field type="radio" name="card_type" value="virtual" className="h-4 w-4 text-primary bg-neutral-100 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700 focus:ring-primary" />
                  <span className="text-sm">Virtual</span>
                </label>
                <label className="flex items-center space-x-2">
                  <Field type="radio" name="card_type" value="physical" className="h-4 w-4 text-primary bg-neutral-100 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700 focus:ring-primary" />
                  <span className="text-sm">Physical</span>
                </label>
              </div>
            </div>

            <div className="pt-4 flex justify-end space-x-3 border-t border-neutral-200 dark:border-neutral-800">
              <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
              <Button type="submit" isLoading={loading}>Issue Card</Button>
            </div>
          </Form>
        )}
      </Formik>
    </Modal>
  );
};


export default IssueCardModal;
