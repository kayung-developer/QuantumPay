import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import useApi from '../../../hooks/useApi';
import Button from '../../../components/common/Button';
import { PlusIcon } from '@heroicons/react/24/outline';
import InvoiceTable from '../../../components/dashboard/business/InvoiceTable';
import CreateInvoiceModal from '../../../components/dashboard/business/CreateInvoiceModal';

const InvoicingPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data: invoices, loading, error, request: refetchInvoices } = useApi('/business/invoices');

  const handleInvoiceCreated = () => {
    setIsModalOpen(false);
    refetchInvoices(); // Refresh the list after a new invoice is made
  };

  return (
    <DashboardLayout pageTitle="Invoicing">
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold font-display text-white">Invoices</h1>
            <p className="mt-1 text-neutral-400">Create, send, and track invoices to your customers.</p>
          </div>
          <div className="mt-4 md:mt-0">
            <Button onClick={() => setIsModalOpen(true)}>
              <PlusIcon className="h-5 w-5 mr-2" />
              Create Invoice
            </Button>
          </div>
        </div>

        <InvoiceTable invoices={invoices} isLoading={loading} error={error} />
      </div>

      <CreateInvoiceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleInvoiceCreated}
      />
    </DashboardLayout>
  );
};

export default InvoicingPage;