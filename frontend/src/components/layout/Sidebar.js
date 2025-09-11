import React, { Fragment } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
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
  BanknotesIcon, // Added BanknotesIcon for Deposit
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

const Logo = () => (
  <Link to="/dashboard" className="flex items-center space-x-2 px-4">
    {/* Assuming you have a favicon.svg in your public folder */}
    <img
        src={process.env.PUBLIC_URL + '/favicon.svg'}
        alt="QuantumPay Logo"
        className="h-8 w-8"
      />
    <span className="font-display text-2xl font-bold text-white">QuantumPay</span>
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
          : 'text-neutral-300 hover:bg-neutral-800 hover:text-white'
      }`
    }
  >
    <Icon className="h-5 w-5 mr-3 flex-shrink-0" />
    <span className="flex-1">{children}</span>
  </NavLink>
);


const Sidebar = ({ onLinkClick }) => {
  const { dbUser, isAdmin, logout } = useAuth();

  // --- [THE UPDATE] We will map over these arrays and add the IDs directly in the JSX ---
  const mainNavLinks = [
    { name: 'Dashboard', href: '/dashboard', icon: HomeIcon, tourId: 'tour-dashboard-link' }, // Added tourId
    { name: 'Wallets', href: '/dashboard/wallets', icon: WalletIcon, tourId: 'tour-wallets-link' },
    { name: 'Deposit Funds', href: '/dashboard/deposit', icon: BanknotesIcon, tourId: 'tour-deposit-link' },
    { name: 'Withdraw Funds', href: '/dashboard/withdraw', icon: ArrowUpTrayIcon },
    { name: 'Send Global', href: '/dashboard/global-transfer', icon: GlobeAmericasIcon, tourId: 'tour-global-transfer-link' },
    { name: 'Exchange', href: '/dashboard/exchange', icon: ScaleIcon },
    { name: 'Transactions', href: '/dashboard/transactions', icon: ArrowsRightLeftIcon },
    { name: 'Shared Vaults', href: '/dashboard/vaults', icon: UsersIcon },
    { name: 'Smart USSD', href: '/dashboard/smart-ussd', icon: SignalIcon },
    { name: 'Developer', href: '/dashboard/developer', icon: CodeBracketIcon },
  ];

  const adminNavLinks = [
    { name: 'Admin Overview', href: '/admin', icon: ShieldCheckIcon },
    { name: 'Manage Users', href: '/admin/users', icon: UserGroupIcon },
    { name: 'KYC Approvals', href: '/admin/kyc-approvals', icon: DocumentCheckIcon },
    { name: 'Live Support', href: '/admin/support', icon: ChatBubbleLeftRightIcon },
  ];

  const businessNavLinks = [
      { name: 'Invoicing', href: '/dashboard/business/invoicing', icon: DocumentTextIcon },
      { name: 'Payroll', href: '/dashboard/business/payroll', icon: BuildingOffice2Icon },
      { name: 'Corporate Cards', href: '/dashboard/business/cards', icon: CreditCardIcon },
      { name: 'Cash Flow', href: '/dashboard/business/cashflow', icon: ChartBarSquareIcon },
  ];

  return (
    <div className="flex flex-col h-full bg-neutral-900 border-r border-neutral-800">
      <div className="flex items-center h-20 flex-shrink-0">
        <Logo />
      </div>

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
      <div className="flex-shrink-0 p-4 border-t border-neutral-800">
        <div className="flex flex-col space-y-2">
            <Link
                to="/dashboard/settings"
                onClick={onLinkClick}
                className="flex items-center group w-full p-2 rounded-lg transition-colors hover:bg-neutral-800"
            >
                <div className="flex-shrink-0">
                    <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center font-bold text-white">
                        {dbUser?.full_name ? dbUser.full_name.charAt(0) : 'U'}
                    </div>
                </div>
                <div className="ml-3 flex-1">
                    <p className="text-sm font-medium text-white truncate">{dbUser?.full_name || 'User'}</p>
                    <p className="text-xs text-neutral-400 truncate group-hover:text-neutral-300">{dbUser?.email}</p>
                </div>
            </Link>
            <SidebarNavLink to="/dashboard/kyc" icon={DocumentCheckIcon} onClick={onLinkClick}>
            Verification
            </SidebarNavLink>

            <button
                onClick={logout}
                className="flex items-center w-full px-4 py-2.5 text-sm font-medium rounded-lg text-neutral-300 hover:bg-red-600/20 hover:text-red-400 transition-colors mt-2"
            >
                <ArrowLeftOnRectangleIcon className="h-5 w-5 mr-3"/>
                Logout
            </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;