// FILE: src/components/common/Modal.js

import React, { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        {/* ... (The backdrop Transition.Child is correct) ... */}

        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            {/* [THE DEFINITIVE FIX FOR SCROLLING] */}
            <Dialog.Panel
              as={motion.div}
              className={`w-full ${sizeClasses[size]} transform rounded-lg
             bg-white dark:bg-neutral-900
             border border-neutral-200 dark:border-neutral-800
             text-left align-middle shadow-xl transition-all
             flex flex-col max-h-[90vh]`} // <-- 1. Set flex-col and a max-height
            >
              {/* Header (remains fixed at the top) */}
              <div className="flex-shrink-0 p-6 pb-4 flex items-start justify-between">
                <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-neutral-900 dark:text-neutral-50">
                  {title}
                </Dialog.Title>
                <button
                  type="button"
                  className="p-1 rounded-full text-neutral-500 dark:text-neutral-400
                             hover:bg-neutral-100 dark:hover:bg-neutral-800
                             focus:outline-none focus:ring-2 focus:ring-primary"
                  onClick={onClose}
                >
                  <span className="sr-only">Close</span>
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              {/* Content (this part will now scroll) */}
              <div className="flex-grow overflow-y-auto px-6 pb-6"> {/* <-- 2. Make this div scrollable */}
                {children}
              </div>

            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
};

export default Modal;
