import React, { Fragment } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';
import {
  HomeIcon,
  WalletIcon,
  ArrowsRightLeftIcon,
  Cog6ToothIcon,
  CodeBracketIcon,
  ShieldCheckIcon,
  UserGroupIcon,
  CreditCardIcon,
  GlobeAmericasIcon,
  ChartBarSquareIcon,
  UsersIcon,
  DocumentCheckIcon,
  ChatBubbleLeftRightIcon,
  SignalIcon,
  ScaleIcon,
  ArrowUpTrayIcon,
  ReceiptPercentIcon,
  ArrowLeftOnRectangleIcon,
  DocumentTextIcon,
  BuildingOffice2Icon,
  BriefcaseIcon,
  BookOpenIcon,
  //BanknotesIcon, // Added BanknotesIcon for Deposit
} from '@heroicons/react/24/outline';
import { ArrowsRightLeftIcon as SwitchIcon } from '@heroicons/react/24/solid';
import { motion } from 'framer-motion';
import IconLogo24 from '../icons/IconLogo24';

const Logo = () => (
  <Link to="/dashboard" className="flex items-center space-x-2 px-4">
    {/* Assuming you have a favicon.svg in your public folder */}
    <IconLogo24 />
    <span className="font-display text-2xl font-bold text-neutral-600 dark:text-white">
        QuantumPay
    </span>
  </Link>
);

// --- [THE UPDATE] The SidebarNavLink component is updated to accept and pass an `id` prop ---
const SidebarNavLink = ({ id, to, icon: Icon, children, onClick }) => (
  <NavLink
    id={id} // The passed id is applied here
    to={to}
    end={to === '/dashboard'} // A more robust way to handle the 'end' prop
    onClick={onClick}
    className={({ isActive }) =>
      `flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition-colors duration-200 ${
        isActive
          ? 'bg-primary text-white shadow-lg'
          : 'text-neutral-600 dark:text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-800 hover:text-white'
      }`
    }
  >
    <Icon className="h-5 w-5 mr-3 flex-shrink-0" />
    <span className="flex-1">{children}</span>
  </NavLink>
);


const Sidebar = ({ onLinkClick }) => {
  const { dbUser, isAdmin, logout, activeProfile, switchToBusiness, switchToPersonal } = useAuth();
  const { t } = useTranslation();

  // --- [THE UPDATE] We will map over these arrays and add the IDs directly in the JSX ---
  const mainNavLinks = [
    { name: t('sidebar_dashboard'), href: '/dashboard', icon: HomeIcon}, // Added tourId
    { name: t('sidebar_wallets'), href: '/dashboard/wallets', icon: WalletIcon},
    //{ name: 'Deposit Funds', href: '/dashboard/deposit', icon: BanknotesIcon, tourId: 'tour-deposit-link' },
    { name: t('sidebar_withdraw'), href: '/dashboard/withdraw', icon: ArrowUpTrayIcon },
    { name: t('sidebar_send_global'), href: '/dashboard/global-transfer', icon: GlobeAmericasIcon},
    { name: t('sidebar_exchange'), href: '/dashboard/exchange', icon: ScaleIcon },
    { name: t('sidebar_transactions'), href: '/dashboard/transactions', icon: ArrowsRightLeftIcon },
    { name: t('sidebar_pay_bills'), href: '/dashboard/pay-bills', icon: ReceiptPercentIcon },
    { name: t('sidebar_shared_vaults'), href: '/dashboard/vaults', icon: UsersIcon },
    { name: t('sidebar_smart_ussd'), href: '/dashboard/smart-ussd', icon: SignalIcon },
    { name: t('sidebar_my_expenses'), href: '/dashboard/my-expenses', icon: DocumentTextIcon },
    { name: t('sidebar_developer'), href: '/dashboard/developer', icon: CodeBracketIcon },
  ];

  const adminNavLinks = [
    { name: 'Admin Overview', href: '/admin', icon: ShieldCheckIcon },
    { name: 'Manage Users', href: '/admin/users', icon: UserGroupIcon },
    { name: 'KYC Approvals', href: '/admin/kyc-approvals', icon: DocumentCheckIcon },
    { name: 'Live Support', href: '/admin/support', icon: ChatBubbleLeftRightIcon },
    { name: 'Job Listings', href: '/admin/jobs', icon: BriefcaseIcon }, // <-- NEW
    { name: 'Blog Posts', href: '/admin/blog', icon: BookOpenIcon }, // <-- NEW
  ];

  const businessNavLinks = [
        { name: 'Business Dashboard', href: '/business/dashboard', icon: HomeIcon },
        { name: 'Team Management', href: '/business/team', icon: UserGroupIcon },
        { name: 'Invoicing', href: '/business/invoicing', icon: DocumentTextIcon },
        { name: 'Payroll', href: '/business/payroll', icon: BuildingOffice2Icon },
        { name: 'Corporate Cards', href: '/business/cards', icon: CreditCardIcon },
        { name: 'Expense Approvals', href: '/business/expenses', icon: ChartBarSquareIcon },
        { name: 'Business Settings', href: '/business/settings', icon: Cog6ToothIcon },
    ];
    const navLinksToDisplay = activeProfile === 'business' ? businessNavLinks : mainNavLinks;

  return (
    <div className="flex flex-col h-full bg-white dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-200 dark:border-neutral-800">
      <div className="flex items-center h-20 flex-shrink-0">
        <Logo />
      </div>
      {dbUser?.business_profile && (
                <div className="px-4 mb-4">
                    <div className="p-2 bg-neutral-100 dark:bg-neutral-800 rounded-lg">
                        <button
                            onClick={activeProfile === 'personal' ? switchToBusiness : switchToPersonal}
                            className="w-full flex items-center justify-center p-2 rounded-md bg-primary text-white"
                        >
                            <SwitchIcon className="h-5 w-5 mr-2" />
                            <span className="font-semibold text-sm">
                                Switch to {activeProfile === 'personal' ? 'Business' : 'Personal'}
                            </span>
                        </button>
                    </div>
                </div>
            )}

      <div className="flex-grow overflow-y-auto px-4">
        <nav className="flex flex-col space-y-2">
          {mainNavLinks.map((item) => (
            // --- [THE UPDATE] We pass the tourId as the id prop ---
            <SidebarNavLink
                key={item.name}
                id={item.tourId} // Pass the id here
                to={item.href}
                icon={item.icon}
                onClick={onLinkClick}
            >
              {item.name}
            </SidebarNavLink>
          ))}

          {/* Conditional Business Panel */}
          {dbUser?.business_profile && ( // Changed from merchant_profile for consistency
            <div className="pt-6">
              <h3 className="px-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider" id="business-headline">
                Business Tools
              </h3>
              <div className="mt-2 space-y-2" role="group" aria-labelledby="business-headline">
                {businessNavLinks.map((item) => (
                    <SidebarNavLink key={item.name} to={item.href} icon={item.icon} onClick={onLinkClick}>
                    {item.name}
                    </SidebarNavLink>
                ))}
              </div>
            </div>
          )}

          {/* Conditional Admin Panel */}
          {isAdmin && (
            <div className="pt-6">
              <h3 className="px-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider" id="admin-headline">
                Admin Panel
              </h3>
              <div className="mt-2 space-y-2" role="group" aria-labelledby="admin-headline">
                {adminNavLinks.map((item) => (
                    <SidebarNavLink key={item.name} to={item.href} icon={item.icon} onClick={onLinkClick}>
                    {item.name}
                    </SidebarNavLink>
                ))}
              </div>
            </div>
          )}
        </nav>
      </div>

      {/* Footer / User Profile Area */}
      <div className="flex-shrink-0 p-4 border-t border-neutral-200 dark:border-neutral-200 dark:border-neutral-800">
        <div className="flex flex-col space-y-2">
            <Link
                to="/dashboard/settings"
                onClick={onLinkClick}
                className="flex items-center group w-full p-2 rounded-lg transition-colors hover:bg-neutral-200 dark:hover:bg-neutral-800"
            >
                <div className="flex-shrink-0">
                    <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center font-bold text-white">
                        {dbUser?.full_name ? dbUser.full_name.charAt(0) : 'U'}
                    </div>
                </div>
                <div className="ml-3 flex-1 min-w-0">
                    <p className="text-sm font-medium text-neutral-900 dark:text-white truncate">{dbUser?.full_name || 'User'}</p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-600 dark:text-neutral-400 truncate group-hover:text-neutral-600 dark:group-hover:text-neutral-700 dark:text-neutral-300">{dbUser?.email}</p>
                </div>
            </Link>
            <SidebarNavLink to="/dashboard/kyc" icon={DocumentCheckIcon} onClick={onLinkClick}>
            {t('sidebar_verification')}
            </SidebarNavLink>
          

            <button
                onClick={logout}
                className="flex items-center w-full px-4 py-2.5 text-sm font-medium rounded-lg text-neutral-700 dark:text-neutral-300 hover:bg-red-600/20 hover:text-red-400 transition-colors mt-2"
            >
                <ArrowLeftOnRectangleIcon className="h-5 w-5 mr-3"/>
                {t('sidebar_logout')}
            </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;

