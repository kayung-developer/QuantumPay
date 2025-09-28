// FILE: src/pages/dashboard/settings/SecuritySettingsPage.js

import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { format, parseISO, formatDistanceToNow } from 'date-fns';
import UAParser from 'ua-parser-js'; // You need to install this: npm install ua-parser-js

// --- Component Imports ---
import useApi, { useApiPost } from '../../../hooks/useApi';
import SettingsCard from '../../../components/settings/SettingsCard';
import Spinner from '../../../components/common/Spinner';
import Button from '../../../components/common/Button';
import { ShieldCheckIcon, KeyIcon, LockClosedIcon, FingerPrintIcon, ComputerDesktopIcon, DevicePhoneMobileIcon } from '@heroicons/react/24/outline';


const DeviceManager = () => {
    const { t } = useTranslation();
    const { data: devices, loading, error, request: refetchDevices } = useApi('/security/devices');
    const { post: revokeDevice, loading: revoking } = useApiPost('', { method: 'POST' });

    // A memoized parser to avoid creating a new instance on every render
    const parser = useMemo(() => new UAParser(), []);

    const handleRevoke = async (deviceId) => {
        if (window.confirm("Are you sure you want to log out this device?")) {
            const result = await revokeDevice({}, { url: `/security/devices/${deviceId}/revoke` });
            if (result.success) {
                refetchDevices(); // Refresh the list
            }
        }
    };

    const renderDeviceIcon = (uaString) => {
        const device = parser.setUA(uaString).getDevice();
        if (device.type === 'mobile' || device.type === 'tablet') {
            return <DevicePhoneMobileIcon className="h-8 w-8 text-neutral-500 dark:text-neutral-400" />;
        }
        return <ComputerDesktopIcon className="h-8 w-8 text-neutral-500 dark:text-neutral-400" />;
    };
    
    const renderDeviceName = (uaString) => {
        const result = parser.setUA(uaString).getResult();
        const browser = `${result.browser.name} ${result.browser.version}`;
        const os = `${result.os.name} ${result.os.version}`;
        return `${browser} on ${os}`;
    };

    return (
        <SettingsCard
            title={t('devices_title')}
            description={t('devices_subtitle')}
        >
            <div className="space-y-4">
                {loading && <div className="py-8 flex justify-center"><Spinner /></div>}
                {error && <p className="text-red-500">Could not load device information.</p>}
                {devices && devices.map((device, index) => (
                    <div key={device.id} className="flex items-center justify-between p-4 bg-neutral-50 dark:bg-neutral-800/50 rounded-lg">
                        <div className="flex items-center gap-4">
                            {renderDeviceIcon(device.user_agent)}
                            <div>
                                <p className="font-semibold text-neutral-900 dark:text-white">{renderDeviceName(device.user_agent)}</p>
                                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                                    {device.ip_address} &bull; {t('device_last_active')} {formatDistanceToNow(parseISO(device.last_login), { addSuffix: true })}
                                </p>
                            </div>
                        </div>
                        <div>
                            {index === 0 ? (
                                <span className="text-sm font-medium text-green-600 dark:text-green-400">{t('device_current')}</span>
                            ) : (
                                <Button size="sm" variant="danger" onClick={() => handleRevoke(device.id)} isLoading={revoking}>
                                    {t('device_revoke_button')}
                                </Button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </SettingsCard>
    );
};




const SecuritySettingsPage = () => {
    const { t } = useTranslation();
    const { data: auditLogs, loading, error } = useApi('/security/audit-log');

    const eventDisplayMap = useMemo(() => ({
        "LOGIN_SUCCESS": { text: t('event_login_success'), icon: FingerPrintIcon, color: 'text-green-500' },
        "API_KEY_CREATED": { text: t('event_api_key_created'), icon: KeyIcon, color: 'text-sky-500' },
        "API_KEY_DELETED": { text: t('event_api_key_deleted'), icon: KeyIcon, color: 'text-red-500' },
        "PASSWORD_RESET_REQUEST": { text: t('event_password_reset'), icon: LockClosedIcon, color: 'text-amber-500' },
        // Add more events as you implement them
    }), [t]);

    const renderEvent = (log) => {
        const eventConfig = eventDisplayMap[log.action] || { text: log.action, icon: ShieldCheckIcon, color: 'text-neutral-400' };
        const Icon = eventConfig.icon;
        
        return (
            <tr key={log.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50">
                <td className="p-4 whitespace-nowrap">
                    <div className="flex items-center">
                        <Icon className={`h-5 w-5 mr-3 flex-shrink-0 ${eventConfig.color}`} />
                        <span className="font-medium text-sm text-neutral-900 dark:text-white">{eventConfig.text}</span>
                    </div>
                </td>
                <td className="p-4 text-sm text-neutral-500 dark:text-neutral-400 whitespace-nowrap">{log.details?.key_label || '---'}</td>
                <td className="p-4 text-sm text-neutral-500 dark:text-neutral-400 whitespace-nowrap font-mono">{log.ip_address || 'N/A'}</td>
                <td className="p-4 text-sm text-neutral-500 dark:text-neutral-400 whitespace-nowrap text-right">{format(parseISO(log.timestamp), 'MMM d, yyyy, p')}</td>
            </tr>
        );
    };

    const renderContent = () => {
        if (loading) return <div className="p-12 flex justify-center"><Spinner /></div>;
        if (error) return <p className="p-6 text-center text-red-500">Could not load security events.</p>;
        
        return (
            <div className="overflow-x-auto">
                <table className="min-w-full">
                    <thead className="bg-neutral-50 dark:bg-neutral-800/50">
                        <tr>
                            <th className="p-4 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase">{t('event_col')}</th>
                            <th className="p-4 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase">{t('details_col')}</th>
                            <th className="p-4 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase">{t('ip_col')}</th>
                            <th className="p-4 text-right text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase">{t('time_col')}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                        {auditLogs && auditLogs.length > 0 ? auditLogs.map(renderEvent) : (
                            <tr><td colSpan="4" className="text-center p-12 text-neutral-500">No security events recorded yet.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        );
    };

    return (
    <div className="divide-y divide-neutral-200 dark:divide-neutral-800">
            {/* --- The New Device Manager Component --- */}
        <DeviceManager />
        <SettingsCard
            title={t('security_dashboard_title')}
            description={t('security_dashboard_subtitle')}
        >
            {renderContent()}
        </SettingsCard>
    </div>
    );
};


export default SecuritySettingsPage;
