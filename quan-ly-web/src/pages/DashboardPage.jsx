import React, { useEffect, useState } from 'react';
import adminApi from '../api/adminApi';

const DashboardPage = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await adminApi.getDashboardStats();
                setStats(res.data);
            } catch (error) {
                console.error("Lỗi tải dashboard:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    // Hàm helper để chọn màu cho badge hành động
    const getActionColor = (action, level) => {
        if (level === 'WARNING' || level === 'ERROR') return 'bg-red-100 text-red-700';
        switch (action) {
            case 'CREATE': return 'bg-green-100 text-green-700';
            case 'DELETE': return 'bg-red-100 text-red-700';
            case 'UPDATE': return 'bg-blue-100 text-blue-700';
            case 'CRAWL': return 'bg-purple-100 text-purple-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    if (loading) return <div className="p-10 text-center text-slate-500">Đang tải dữ liệu hệ thống...</div>;
    if (!stats) return <div className="p-10 text-center text-red-500">Lỗi kết nối Server</div>;

    return (
        <div className="p-6 bg-slate-50 dark:bg-slate-900 min-h-full">
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-6">Tổng Quan Hệ Thống</h1>

            {/* --- 1. STATS CARDS (GRID 4 CỘT) --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                
                {/* Card 1: Tổng Truyện */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                        <span className="material-symbols-outlined text-2xl">menu_book</span>
                    </div>
                    <div>
                        <p className="text-xs text-slate-500 uppercase font-bold">Tổng Truyện</p>
                        <h3 className="text-2xl font-bold text-slate-800 dark:text-white">{stats.counts.comics}</h3>
                    </div>
                </div>

                {/* Card 2: Tổng Chapter */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                        <span className="material-symbols-outlined text-2xl">library_books</span>
                    </div>
                    <div>
                        <p className="text-xs text-slate-500 uppercase font-bold">Tổng Chapter</p>
                        <h3 className="text-2xl font-bold text-slate-800 dark:text-white">{stats.counts.chapters}</h3>
                    </div>
                </div>

                {/* Card 3: Ảnh & Dung lượng */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center">
                        <span className="material-symbols-outlined text-2xl">hard_drive</span>
                    </div>
                    <div>
                        <p className="text-xs text-slate-500 uppercase font-bold">Dung Lượng (Ước tính)</p>
                        <div className="flex items-baseline gap-2">
                            <h3 className="text-2xl font-bold text-slate-800 dark:text-white">{stats.counts.diskUsage} GB</h3>
                            <span className="text-xs text-slate-400">({stats.counts.images} ảnh)</span>
                        </div>
                    </div>
                </div>

                {/* Card 4: Truyện Nổi Bật */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-yellow-100 text-yellow-600 flex items-center justify-center">
                        <span className="material-symbols-outlined text-2xl">star</span>
                    </div>
                    <div>
                        <p className="text-xs text-slate-500 uppercase font-bold">Nổi Bật</p>
                        <h3 className="text-2xl font-bold text-slate-800 dark:text-white">{stats.counts.featured}</h3>
                    </div>
                </div>
            </div>

            {/* --- 2. BẢNG NHẬT KÝ HOẠT ĐỘNG (UPDATED) --- */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                    <h3 className="font-bold text-lg text-slate-800 dark:text-white flex items-center gap-2">
                        <span className="material-symbols-outlined text-slate-400">history</span>
                        Nhật Ký Hệ Thống
                    </h3>
                </div>

                <table className="w-full text-left">
                    <thead className="bg-slate-50 dark:bg-slate-700/50 text-xs uppercase text-slate-500 font-semibold">
                        <tr>
                            <th className="p-4 w-[150px]">Hành động</th>
                            <th className="p-4">Nội dung chi tiết</th>
                            <th className="p-4 w-[200px] text-right">Thời gian</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                        {stats.recents.map((log) => (
                            <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                
                                {/* Cột 1: Hành động (Badge màu) */}
                                <td className="p-4">
                                    <span className={`px-3 py-1 rounded-md text-xs font-bold border border-transparent shadow-sm ${getActionColor(log.action, log.level)}`}>
                                        {log.action}
                                    </span>
                                </td>
                                
                                {/* Cột 2: Nội dung */}
                                <td className="p-4 text-slate-700 dark:text-slate-200 font-medium">
                                    {log.description}
                                </td>

                                {/* Cột 3: Thời gian */}
                                <td className="p-4 text-right text-sm text-slate-500 dark:text-slate-400 font-mono">
                                    {new Date(log.createdAt).toLocaleString('vi-VN')}
                                </td>
                            </tr>
                        ))}
                        
                        {stats.recents.length === 0 && (
                            <tr>
                                <td colSpan="3" className="p-10 text-center text-slate-400 flex flex-col items-center">
                                    <span className="material-symbols-outlined text-4xl mb-2">inbox</span>
                                    Chưa có nhật ký hoạt động nào
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default DashboardPage;