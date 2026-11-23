import React, { useEffect, useRef, useState } from 'react';
import { X, Volume2, VolumeX, Download, Upload, CheckCircle, AlertCircle, MessageSquare } from 'lucide-react';
import { useGameStore } from '../store/useGameStore';
import { useUserStore } from '../store/useUserStore';
import { db, User, PracticeRecord } from '../db';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

// Export data structure
interface ExportData {
    version: number;
    exportDate: string;
    users: User[];
    records: PracticeRecord[];
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
    const { language, soundEnabled, setSoundEnabled, ttsEnabled, setTtsEnabled } = useGameStore();
    const { refreshUsers, initialize } = useUserStore();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [exportStatus, setExportStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [statusMessage, setStatusMessage] = useState('');

    // 支持按 Esc 键快捷关闭弹窗
    useEffect(() => {
        if (!isOpen) return;
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                e.preventDefault();
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const content = language === 'cn' ? {
        title: '设置',
        sound: '游戏音效',
        soundOn: '开启',
        soundOff: '关闭',
        tts: '语音朗读',
        dataManagement: '数据管理',
        exportData: '导出数据',
        exportDesc: '将用户和练习记录导出为 JSON 文件',
        importData: '导入数据',
        importDesc: '从 JSON 文件导入用户和练习记录',
        exportSuccess: '数据导出成功！',
        importSuccess: '数据导入成功！已导入 {users} 个用户和 {records} 条记录',
        importError: '导入失败：文件格式不正确',
        selectFile: '选择文件',
    } : {
        title: 'Settings',
        sound: 'Sound Effects',
        soundOn: 'On',
        soundOff: 'Off',
        tts: 'Voice Narrator',
        dataManagement: 'Data Management',
        exportData: 'Export Data',
        exportDesc: 'Export users and records as JSON file',
        importData: 'Import Data',
        importDesc: 'Import users and records from JSON file',
        exportSuccess: 'Data exported successfully!',
        importSuccess: 'Data imported! {users} users and {records} records added',
        importError: 'Import failed: Invalid file format',
        selectFile: 'Select File',
    };

    // Export all data to JSON file
    const handleExport = async () => {
        try {
            const users = await db.users.toArray();
            const records = await db.records.toArray();

            const exportData: ExportData = {
                version: 1,
                exportDate: new Date().toISOString(),
                users,
                records
            };

            const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);

            const a = document.createElement('a');
            a.href = url;
            a.download = `tappy_backup_${new Date().toISOString().slice(0, 10)}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            setExportStatus('success');
            setStatusMessage(content.exportSuccess);
            setTimeout(() => setExportStatus('idle'), 3000);
        } catch (error) {
            console.error('Export failed:', error);
            setExportStatus('error');
            setTimeout(() => setExportStatus('idle'), 3000);
        }
    };

    // Import data from JSON file
    const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        try {
            const text = await file.text();
            const data: ExportData = JSON.parse(text);

            // Validate structure
            if (!data.version || !Array.isArray(data.users) || !Array.isArray(data.records)) {
                throw new Error('Invalid file format');
            }

            let usersImported = 0;
            let recordsImported = 0;

            // Import users (skip if name already exists)
            for (const user of data.users) {
                const existingUser = await db.users.where('name').equals(user.name).first();
                if (!existingUser) {
                    // Remove id to let Dexie auto-generate
                    const { id, ...userData } = user;
                    await db.users.add(userData as User);
                    usersImported++;
                }
            }

            // Import records (need to remap user IDs)
            // Create a mapping of old user IDs to new user IDs
            const userIdMap: Record<number, number> = {};
            for (const oldUser of data.users) {
                if (oldUser.id) {
                    const newUser = await db.users.where('name').equals(oldUser.name).first();
                    if (newUser?.id) {
                        userIdMap[oldUser.id] = newUser.id;
                    }
                }
            }

            // Import records with remapped user IDs
            for (const record of data.records) {
                const newUserId = userIdMap[record.userId];
                if (newUserId) {
                    const { id, ...recordData } = record;
                    await db.records.add({
                        ...recordData,
                        userId: newUserId
                    } as PracticeRecord);
                    recordsImported++;
                }
            }

            // Refresh the store
            await refreshUsers();
            await initialize();

            setImportStatus('success');
            setStatusMessage(
                content.importSuccess
                    .replace('{users}', String(usersImported))
                    .replace('{records}', String(recordsImported))
            );
            setTimeout(() => setImportStatus('idle'), 5000);
        } catch (error) {
            console.error('Import failed:', error);
            setImportStatus('error');
            setStatusMessage(content.importError);
            setTimeout(() => setImportStatus('idle'), 3000);
        }

        // Reset file input
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-3xl shadow-2xl max-w-md w-full relative max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-700 transition-colors z-10"
                >
                    <X size={18} />
                </button>

                {/* Header */}
                <div className="bg-gradient-to-r from-pink-100 via-blue-100 to-purple-100 p-6 rounded-t-3xl text-center">
                    <div className="w-12 h-12 mx-auto mb-2 bg-white rounded-full flex items-center justify-center shadow-md">
                        <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-cartoon text-kid-blue">{content.title}</h2>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Sound Setting */}
                    <div className="flex items-center justify-between bg-gray-50 rounded-xl p-4">
                        <div className="flex items-center gap-3">
                            {soundEnabled ? (
                                <Volume2 className="w-5 h-5 text-kid-blue" />
                            ) : (
                                <VolumeX className="w-5 h-5 text-gray-400" />
                            )}
                            <span className="font-medium text-gray-700">{content.sound}</span>
                        </div>

                        {/* Toggle Switch */}
                        <button
                            type="button"
                            onClick={() => setSoundEnabled(!soundEnabled)}
                            className={`
                                relative w-14 h-8 rounded-full transition-colors duration-300 cursor-pointer
                                ${soundEnabled ? 'bg-kid-blue' : 'bg-gray-300'}
                            `}
                        >
                            <span
                                className={`
                                    absolute top-1 left-0 w-6 h-6 bg-white rounded-full shadow-md transition-transform duration-300
                                    ${soundEnabled ? 'translate-x-7' : 'translate-x-1'}
                                `}
                            />
                        </button>
                    </div>

                    {/* TTS Setting */}
                    <div className="flex items-center justify-between bg-gray-50 rounded-xl p-4 mt-3">
                        <div className="flex items-center gap-3">
                            <MessageSquare className={`w-5 h-5 ${ttsEnabled ? 'text-kid-purple' : 'text-gray-400'}`} />
                            <span className="font-medium text-gray-700">{content.tts}</span>
                        </div>

                        {/* Toggle Switch */}
                        <button
                            type="button"
                            onClick={() => setTtsEnabled(!ttsEnabled)}
                            className={`
                                relative w-14 h-8 rounded-full transition-colors duration-300 cursor-pointer
                                ${ttsEnabled ? 'bg-kid-purple' : 'bg-gray-300'}
                            `}
                        >
                            <span
                                className={`
                                    absolute top-1 left-0 w-6 h-6 bg-white rounded-full shadow-md transition-transform duration-300
                                    ${ttsEnabled ? 'translate-x-7' : 'translate-x-1'}
                                `}
                            />
                        </button>
                    </div>

                    {/* Divider */}
                    <div className="border-t border-gray-100" />

                    {/* Data Management Section */}
                    <div>
                        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">
                            {content.dataManagement}
                        </h3>

                        {/* Export Data */}
                        <div className="bg-blue-50 rounded-xl p-4 mb-3">
                            <div className="flex items-start justify-between">
                                <div className="flex items-start gap-3">
                                    <Download className="w-5 h-5 text-kid-blue mt-0.5" />
                                    <div>
                                        <span className="font-medium text-gray-700 block">{content.exportData}</span>
                                        <span className="text-xs text-gray-500">{content.exportDesc}</span>
                                    </div>
                                </div>
                                <button
                                    onClick={handleExport}
                                    className="px-4 py-2 bg-kid-blue text-white rounded-lg font-medium text-sm hover:bg-blue-600 transition-colors"
                                >
                                    {content.exportData}
                                </button>
                            </div>
                            {exportStatus === 'success' && (
                                <div className="mt-2 flex items-center gap-2 text-green-600 text-sm">
                                    <CheckCircle size={16} />
                                    <span>{statusMessage}</span>
                                </div>
                            )}
                        </div>

                        {/* Import Data */}
                        <div className="bg-purple-50 rounded-xl p-4">
                            <div className="flex items-start justify-between">
                                <div className="flex items-start gap-3">
                                    <Upload className="w-5 h-5 text-kid-purple mt-0.5" />
                                    <div>
                                        <span className="font-medium text-gray-700 block">{content.importData}</span>
                                        <span className="text-xs text-gray-500">{content.importDesc}</span>
                                    </div>
                                </div>
                                <label className="px-4 py-2 bg-kid-purple text-white rounded-lg font-medium text-sm hover:bg-purple-600 transition-colors cursor-pointer">
                                    {content.selectFile}
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept=".json"
                                        onChange={handleImport}
                                        className="hidden"
                                    />
                                </label>
                            </div>
                            {importStatus === 'success' && (
                                <div className="mt-2 flex items-center gap-2 text-green-600 text-sm">
                                    <CheckCircle size={16} />
                                    <span>{statusMessage}</span>
                                </div>
                            )}
                            {importStatus === 'error' && (
                                <div className="mt-2 flex items-center gap-2 text-red-500 text-sm">
                                    <AlertCircle size={16} />
                                    <span>{statusMessage}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
