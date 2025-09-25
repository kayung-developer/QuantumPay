import React, { useMemo } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { Formik, Form, FieldArray, Field, useFormikContext } from 'formik'; // Import useFormikContext
import * as Yup from 'yup';
import FormInput from '../../components/common/FormInput';
import Button from '../../components/common/Button';
import { useApiPost } from '../../hooks/useApi';
import { PlusIcon, TrashIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import { useNavigate, Link } from 'react-router-dom';
import { toastSuccess, toastError } from '../../components/common/Toast';
import { useTranslation } from 'react-i18next';

const InvoiceSchema = Yup.object().shape({
  customer_email: Yup.string().email('Invalid email address').required('Customer email is required'),
  currency: Yup.string().required('Currency is required'),
  due_date: Yup.date().min(new Date(), 'Due date must be in the future').required('Due date is required'),
  items: Yup.array()
    .of(
      Yup.object().shape({
        description: Yup.string().min(3, 'Too short').required('Description is required'),
        quantity: Yup.number().min(1, 'Must be at least 1').integer('Must be a whole number').required('Qty is required'),
        unit_price: Yup.number().min(0.01, 'Price must be positive').required('Price is required'),
      })
    )
    .min(1, 'At least one line item is required'),
});

// --- [THE FIX - PART 1] ---
// Create a dedicated component to calculate and display the total.
// This component is rendered INSIDE Formik, so it can safely use useFormikContext.
const InvoiceTotalCalculator = () => {
    const { values } = useFormikContext(); // Get the current form values

    // useMemo is now at the top level of a valid React component.
    const subTotal = useMemo(() =>
        values.items.reduce((acc, item) => acc + (parseFloat(item.quantity) || 0) * (parseFloat(item.unit_price) || 0), 0),
        [values.items]
    );

    return (
        <div className="pt-6 flex justify-end items-center border-t border-neutral-200 dark:border-neutral-800">
            <div className="text-right">
                <p className="text-neutral-600 dark:text-neutral-400">Subtotal</p>
                <p className="text-2xl font-bold text-neutral-900 dark:text-white">
                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: values.currency }).format(subTotal)}
                </p>
            </div>
        </div>
    );
};


const CreateInvoicePage = () => {
    const { t } = useTranslation();
    const { post: createInvoice, loading } = useApiPost('/business/invoices');
    const navigate = useNavigate();

    const handleSubmit = async (values) => {
        const payload = {
            ...values,
            due_date: new Date(values.due_date).toISOString(),
            items: values.items.map(item => ({
                ...item,
                quantity: parseInt(item.quantity, 10),
                unit_price: parseFloat(item.unit_price)
            }))
        };
        const result = await createInvoice(payload);
        if (result.success) {
            toastSuccess(t('invoice_create_success'));
            navigate('/business/invoicing');
        }
    };

    return (
        <DashboardLayout pageTitleKey="create_invoice_title">
             <div className="max-w-4xl mx-auto">
                <div className="mb-6">
                    <Link to="/business/invoicing" className="flex items-center text-sm text-neutral-600 dark:text-neutral-400 hover:text-primary transition-colors">
                        <ArrowLeftIcon className="h-4 w-4 mr-2" />
                        Back to All Invoices
                    </Link>
                    <h1 className="text-3xl font-bold font-display text-neutral-900 dark:text-white mt-2">{t('create_invoice_title')}</h1>
                </div>

                <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg p-8">
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
                        {({ values, errors }) => ( // We only need values and errors here now
                            <Form className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="md:col-span-2"><FormInput label="Customer Email" name="customer_email" type="email" placeholder="customer@example.com"/>
                                    </div>
                                    <div>
                                    <label htmlFor="currency" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">{t('currency_label')}</label>
                                        <Field
                                            as="select"
                                            name="currency"
                                            id="currency"
                                            className="w-full bg-neutral-100 dark:bg-neutral-800 p-2 rounded-md border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white"
                                        >
                                            <option value="NGN">NGN</option>
                                            <option value="KES">KES</option>
                                            <option value="GHS">GHS</option>
                                            <option value="USD">USD</option>
                                        </Field>
                                    </div>
                                </div>
                                <FormInput label="Due Date" name="due_date" type="date"/>

                                <div className="border-t border-neutral-200 dark:border-neutral-800 pt-6">
                                    <h3 className="text-lg font-medium text-neutral-900 dark:text-white mb-2">Line Items</h3>
                                    <FieldArray name="items">
                                        {({ push, remove }) => (
                                            <div className="space-y-4">
                                                {values.items.map((item, index) => (
                                                    <div key={index} className="flex items-start gap-3 p-4 bg-neutral-50 dark:bg-neutral-800/50 rounded-md">
                                                        <div className="grid grid-cols-12 gap-3 flex-grow">
                                                            <div className="col-span-6"><FormInput name={`items.${index}.description`} placeholder="Item Description" label={`Item #${index + 1}`} /></div>
                                                            <div className="col-span-2"><FormInput name={`items.${index}.quantity`} type="number" placeholder="Qty" label="Qty" /></div>
                                                            <div className="col-span-4"><FormInput name={`items.${index}.unit_price`} type="number" placeholder="Unit Price" label="Price" /></div>
                                                        </div>
                                                        <Button type="button" variant="danger" size="sm" onClick={() => remove(index)} className="mt-7 p-2">
                                                            <TrashIcon className="h-5 w-5" />
                                                        </Button>
                                                    </div>
                                                ))}
                                                <Button type="button" variant="secondary" onClick={() => push({ description: '', quantity: 1, unit_price: '' })}>
                                                    <PlusIcon className="h-5 w-5 mr-2" />Add Line Item
                                                </Button>
                                            </div>
                                        )}
                                    </FieldArray>
                                </div>

                                {/* --- [THE FIX - PART 2] --- */}
                                {/* Render the new component here. It will calculate and display the total. */}
                                <InvoiceTotalCalculator />

                                <div className="pt-6 flex justify-end">
                                    <Button type="submit" isLoading={loading}>Create & Send Invoice</Button>
                                </div>
                            </Form>
                        )}
                    </Formik>
                </div>
             </div>
        </DashboardLayout>
    );
};

export default CreateInvoicePage;