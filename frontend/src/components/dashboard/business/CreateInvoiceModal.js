import React from 'react';
import Modal from '../../common/Modal';
import { Formik, Form, FieldArray, Field } from 'formik';
import * as Yup from 'yup';
import FormInput from '../../common/FormInput';
import Button from '../../common/Button';
import { useApiPost } from '../../../hooks/useApi';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';

const InvoiceSchema = Yup.object().shape({
  customer_email: Yup.string().email('Invalid email').required('Customer email is required'),
  currency: Yup.string().required('Currency is required'),
  due_date: Yup.date().min(new Date(), 'Due date must be in the future').required('Due date is required'),
  items: Yup.array()
    .of(
      Yup.object().shape({
        description: Yup.string().required('Description is required'),
        quantity: Yup.number().min(1, 'Must be at least 1').required('Qty is required'),
        unit_price: Yup.number().min(0.01, 'Price must be positive').required('Price is required'),
      })
    )
    .min(1, 'At least one item is required'),
});


const CreateInvoiceModal = ({ isOpen, onClose, onSuccess }) => {
  const { post: createInvoice, loading } = useApiPost('/business/invoices');

  const handleSubmit = async (values) => {
    const payload = {
      ...values,
      due_date: new Date(values.due_date).toISOString(),
    };
    const result = await createInvoice(payload);
    if (result.success) {
      onSuccess();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Invoice" size="2xl">
      <Formik
        initialValues={{
          customer_email: '',
          currency: 'NGN',
          due_date: format(new Date(), 'yyyy-MM-dd'),
          items: [{ description: '', quantity: 1, unit_price: '' }],
        }}
        validationSchema={InvoiceSchema}
        onSubmit={handleSubmit}
      >
        {({ values, errors, touched }) => (
          <Form className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                    <FormInput
                        label="Customer Email"
                        name="customer_email"
                        type="email"
                        placeholder="customer@example.com"
                    />
                </div>
                <div>
                    <label htmlFor="currency" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                        Currency
                    </label>
                    <Field
                        as="select"
                        name="currency"
                        id="currency"
                        className="block w-full px-3 py-2 bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-md text-neutral-900 dark:text-neutral-100 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                        <option value="NGN">NGN - Nigerian Naira</option>
                        <option value="KES">KES - Kenyan Shilling</option>
                        <option value="GHS">GHS - Ghanaian Cedi</option>
                        <option value="ZAR">ZAR - South African Rand</option>
                        <option value="USD">USD - US Dollar</option>
                    </Field>
                </div>
            </div>
            <FormInput
                label="Due Date"
                name="due_date"
                type="date"
            />

            <div className="border-t border-neutral-200 dark:border-neutral-800 pt-4">
              <h3 className="text-lg font-medium text-neutral-900 dark:text-white mb-2">Invoice Items</h3>
              <FieldArray name="items">
                {({ push, remove }) => (
                  <div className="space-y-4">
                    {values.items.map((item, index) => (
                      <div key={index} className="flex items-start gap-4 p-4 bg-neutral-50 dark:bg-neutral-800/50 rounded-md">
                        <div className="grid grid-cols-12 gap-4 flex-grow">
                          <div className="col-span-6">
                             <FormInput name={`items.${index}.description`} placeholder="Item description" label={`Item #${index + 1}`}/>
                          </div>
                           <div className="col-span-2">
                             <FormInput name={`items.${index}.quantity`} type="number" placeholder="Qty" label="Qty"/>
                          </div>
                           <div className="col-span-4">
                             <FormInput name={`items.${index}.unit_price`} type="number" placeholder="Unit Price" label="Price"/>
                          </div>
                        </div>
                        <Button type="button" variant="danger" size="sm" onClick={() => remove(index)} className="mt-8 p-2">
                            <TrashIcon className="h-5 w-5" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => push({ description: '', quantity: 1, unit_price: '' })}
                    >
                      <PlusIcon className="h-5 w-5 mr-2" />
                      Add Item
                    </Button>
                  </div>
                )}
              </FieldArray>
              {typeof errors.items === 'string' && <p className="text-red-500 text-xs mt-2">{errors.items}</p>}
            </div>

            <div className="pt-4 flex justify-end space-x-3 border-t border-neutral-200 dark:border-neutral-800">
                <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                <Button type="submit" isLoading={loading}>Create & Send Invoice</Button>
            </div>
          </Form>
        )}
      </Formik>
    </Modal>
  );
};

export default CreateInvoiceModal;