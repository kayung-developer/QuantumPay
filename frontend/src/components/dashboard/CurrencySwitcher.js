import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApiPost } from '../../hooks/useApi';
import { ChevronDownIcon } from '@heroicons/react/24/solid';
import { Listbox, Transition } from '@headlessui/react';
import { toastSuccess, toastError } from '../../components/common/Toast';

// Define the currencies we support for display
const SUPPORTED_CURRENCIES = ["USD", "NGN", "KES", "GHS", "ZAR", "EUR", "GBP"];

const CurrencySwitcher = () => {
    const { dbUser, fetchDbUser } = useAuth();
    const { post: updateCurrency, loading } = useApiPost('/users/me/display-currency', { method: 'PUT' });

    const handleChange = async (newCurrency) => {
        if (newCurrency === dbUser?.preferred_display_currency) return;

        const result = await updateCurrency({ currency: newCurrency });
        if (result.success) {
            toastSuccess(`Display currency set to ${newCurrency}`);
            fetchDbUser(); // Refresh the global user state
        } else {
            // The useApiPost hook will show the error toast
        }
    };

    if (!dbUser) return null;

    return (
        <Listbox value={dbUser.preferred_display_currency} onChange={handleChange}>
            <div className="relative">
                <Listbox.Button className="relative w-full cursor-pointer rounded-md bg-neutral-800 py-2 pl-3 pr-10 text-left text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-primary sm:text-sm">
                    <span className="block truncate">{dbUser.preferred_display_currency}</span>
                    <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                        <ChevronDownIcon className="h-5 w-5 text-neutral-600 dark:text-neutral-400" aria-hidden="true" />
                    </span>
                </Listbox.Button>
                <Transition
                    as={React.Fragment}
                    leave="transition ease-in duration-100"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-neutral-100 dark:bg-neutral-800 py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                        {SUPPORTED_CURRENCIES.map((currency) => (
                            <Listbox.Option
                                key={currency}
                                className={({ active }) =>
                                    `relative cursor-pointer select-none py-2 pl-4 pr-4 ${
                                        active ? 'bg-primary text-white' : 'text-neutral-200'
                                    }`
                                }
                                value={currency}
                            >
                                {({ selected }) => (
                                    <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
                                        {currency}
                                    </span>
                                )}
                            </Listbox.Option>
                        ))}
                    </Listbox.Options>
                </Transition>
            </div>
        </Listbox>
    );
};

export default CurrencySwitcher;