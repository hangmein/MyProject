// src/components/ClientReportModal.jsx
import React, { useState } from 'react';

const ClientReportModal = ({ isOpen, onClose, onSubmit, comicTitle, chapterNum }) => {
    const [content, setContent] = useState('');
    const [isSending, setIsSending] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async () => {
        if (!content.trim()) return alert("Bạn chưa nhập nội dung lỗi!");
        
        setIsSending(true);
        // Gọi hàm gửi từ cha truyền xuống
        await onSubmit(content);
        
        setIsSending(false);
        setContent(''); // Reset form sau khi gửi
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn">
            <div className="bg-white dark:bg-slate-800 w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-700">
                {/* Header */}
                <div className="bg-red-600 p-4 text-white flex justify-between items-center">
                    <h3 className="font-bold flex items-center gap-2">
                        <span className="material-symbols-outlined">report_problem</span>
                        Báo Lỗi Truyện
                    </h3>
                    <button onClick={onClose} className="hover:bg-red-700 p-1 rounded-full transition-colors">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                {/* Body */}
                <div className="p-5">
                    <div className="mb-3 text-sm text-slate-600 dark:text-slate-300">
                        Bạn đang báo lỗi cho: <br/>
                        <span className="font-bold text-slate-800 dark:text-white text-lg">{comicTitle}</span> 
                        {chapterNum && <span className="ml-1 text-blue-600 font-bold"> - Chap {chapterNum}</span>}
                    </div>

                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Nội dung lỗi:</label>
                    <textarea 
                        rows="4"
                        className="w-full p-3 bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-red-500 outline-none text-sm dark:text-white transition-all"
                        placeholder="Ví dụ: Ảnh bị lỗi không xem được, Thứ tự trang lộn xộn, Dịch sai..."
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                    ></textarea>

                    <div className="mt-4 flex gap-3">
                        <button onClick={onClose} className="flex-1 py-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-sm font-bold transition-colors">Hủy</button>
                        <button 
                            onClick={handleSubmit}
                            disabled={isSending}
                            className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-bold shadow-lg shadow-red-600/30 flex justify-center items-center gap-2 transition-all active:scale-95 disabled:opacity-70"
                        >
                            {isSending ? 'Đang gửi...' : 'Gửi Báo Cáo'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ClientReportModal;