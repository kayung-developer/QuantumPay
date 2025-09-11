import React from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { useApiPost } from '../../hooks/useApi';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

const ExecutePayrollModal = ({ isOpen, onClose, onSuccess, payrollRun }) => {
    const { post: executeRun, loading } = useApiPost('/business/payroll-runs/execute');

    const handleExecute = async () => {
        const result = await executeRun({ payroll_run_id: payrollRun.id });
        if (result.success) {
            onSuccess(result.data);
        }
    };

    if (!payrollRun) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Confirm Payroll Execution" size="2xl">
            <div className="space-y-6">
                <div className="p-4 flex items-start space-x-3 bg-yellow-900/50 border border-yellow-700 rounded-lg">
                    <ExclamationTriangleIcon className="h-6 w-6 text-yellow-400 flex-shrink-0 mt-0.5"/>
                    <div>
                        <h3 className="font-semibold text-yellow-300">Final Confirmation</h3>
                        <p className="text-sm text-yellow-400">This action is irreversible. The total amount will be debited from your wallet, and funds will be sent to your employees.</p>
                    </div>
                </div>

                <div className="p-4 bg-neutral-800 rounded-lg">
                    <div className="flex justify-between items-center">
                        <span className="text-neutral-300">Total Payroll Cost:</span>
                        <span className="text-2xl font-bold text-white">
                            {new Intl.NumberFormat('en-US').format(payrollRun.total_source_cost)} {payrollRun.source_currency}
                        </span>
                    </div>
                </div>

                <div>
                    <h4 className="font-medium text-white mb-2">Payout Summary ({payrollRun.payouts.length} Employees)</h4>
                    <div className="max-h-60 overflow-y-auto space-y-2 pr-2">
                        {payrollRun.payouts.map(payout => (
                            <div key={payout.employee.id} className="p-3 bg-neutral-800/50 rounded-md flex justify-between items-center">
                                <div>
                                    <p className="font-semibold text-white">{payout.employee.user.full_name}</p>
                                    <p className="text-xs text-neutral-400">{payout.employee.role}</p>
                                </div>
                                <p className="font-mono text-white">
                                    {new Intl.NumberFormat('en-US').format(payout.amount)} {payout.currency}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="pt-4 flex justify-end space-x-3 border-t border-neutral-800">
                    <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleExecute} isLoading={loading} variant="primary">
                        Confirm & Pay
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

export default ExecutePayrollModal;