import React, { useEffect, useState } from 'react';
import adminApi from '../api/adminApi';

const ReportPage = () => {
    const [reports, setReports] = useState([]);
    const [filter, setFilter] = useState('ALL');

    const fetchReports = async () => {
        try {
            const res = await adminApi.getAllReports();
            setReports(res.data);
        } catch (error) { console.error(error); }
    };

    useEffect(() => { fetchReports(); }, []);

    const handleAction = async (id, action) => {
        if (action === 'delete' && !window.confirm("Xóa báo cáo này?")) return;
        await adminApi.handleReport(id, action);
        fetchReports();
    };

    // Hàm giả lập người dùng báo lỗi (để bạn test)
    const createTest = async () => {
        const msg = prompt("Nhập nội dung lỗi:");
        if(msg) {
            await adminApi.sendTestReport({ content: msg }); // Gửi lỗi không kèm ID truyện (lỗi chung)
            fetchReports();
        }
    }

    const filtered = reports.filter(r => filter === 'ALL' ? true : r.Status === filter);

    return (
        <div className="p-6 bg-slate-50 dark:bg-slate-900 min-h-full">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Quản Lý Báo Lỗi</h1>
                <button onClick={createTest} className="px-3 py-1 bg-gray-200 rounded text-xs">+ Test Report</button>
            </div>

            <div className="flex gap-2 mb-4">
                {['ALL', 'PENDING', 'RESOLVED'].map(st => (
                    <button key={st} onClick={() => setFilter(st)} 
                        className={`px-4 py-2 rounded-lg text-sm font-bold ${filter === st ? 'bg-blue-600 text-white' : 'bg-white text-slate-500'}`}>
                        {st === 'ALL' ? 'Tất cả' : st === 'PENDING' ? 'Chưa xử lý' : 'Đã xong'}
                    </button>
                ))}
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl shadow overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700 text-xs uppercase text-slate-500">
                        <tr>
                            <th className="p-4">Trạng thái</th>
                            <th className="p-4">Nội dung</th>
                            <th className="p-4">Truyện / Chapter</th>
                            <th className="p-4 text-right">Thời gian</th>
                            <th className="p-4 text-center">Xử lý</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                        {filtered.map(item => (
                            <tr key={item.Id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded text-[10px] font-bold ${item.Status === 'PENDING' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                                        {item.Status}
                                    </span>
                                </td>
                                <td className="p-4 font-medium text-slate-700 dark:text-slate-200">{item.Content}</td>
                                <td className="p-4 text-sm text-slate-500">
                                    {item.Comics ? (
                                        <div>
                                            <div className="font-bold text-blue-600">{item.Comics.Title}</div>
                                            {item.Chapters && <div className="text-xs">Chap {item.Chapters.ChapterNumber}</div>}
                                        </div>
                                    ) : <span className="italic text-xs">Lỗi hệ thống</span>}
                                </td>
                                <td className="p-4 text-right text-xs text-slate-400">{new Date(item.CreatedAt).toLocaleString('vi-VN')}</td>
                                <td className="p-4 flex justify-center gap-2">
                                    {item.Status === 'PENDING' && (
                                        <button onClick={() => handleAction(item.Id, 'resolve')} className="p-2 bg-green-100 text-green-600 rounded hover:bg-green-200"><span className="material-symbols-outlined text-sm">check</span></button>
                                    )}
                                    <button onClick={() => handleAction(item.Id, 'delete')} className="p-2 bg-red-100 text-red-600 rounded hover:bg-red-200"><span className="material-symbols-outlined text-sm">delete</span></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ReportPage;