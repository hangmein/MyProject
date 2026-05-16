import React, { useState, useEffect, useRef } from 'react';
import adminApi from '../api/adminApi'; // Import API

const ChapterRow = ({ chapter, onDeleteSuccess }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const [pages, setPages] = useState([]);
    const [loadingImages, setLoadingImages] = useState(false);
    const [isCrawling, setIsCrawling] = useState(false);
    const [viewImage, setViewImage] = useState(null);
    
    // State cho Modal
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [newLink, setNewLink] = useState(chapter.sourceUrl || '');

    const dropdownRef = useRef(null);

    // Click outside để đóng menu
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) setShowDropdown(false);
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // 1. Tải danh sách ảnh (Lazy load)
    const fetchChapterImages = async () => {
        if (pages.length > 0) return; // Nếu có ảnh rồi thì thôi
        setLoadingImages(true);
        try {
            const res = await adminApi.getChapterImages(chapter.id);
            setPages(res.data);
        } catch (error) { console.error("Lỗi tải ảnh:", error); } 
        finally { setLoadingImages(false); }
    };

    const handleToggleExpand = () => {
        const newState = !isExpanded;
        setIsExpanded(newState);
        if (newState) fetchChapterImages();
    };

    // Xử lý Menu Action
    const handleMenuClick = (action) => {
        setShowDropdown(false);
        if (action === 'edit') setShowEditModal(true);
        else if (action === 'crawl') handleReCrawl();
        else if (action === 'delete') setShowDeleteModal(true);
    };

    // 2. Lưu Link mới
    const handleSaveLink = async () => {
        try {
            await adminApi.updateChapterSource(chapter.id, newLink);
            alert("Đã cập nhật link thành công!");
            setShowEditModal(false);
        } catch (err) { alert("Lỗi: " + err.message); }
    };

    // 3. Re-crawl
    const handleReCrawl = async () => {
        if (isCrawling) return;
        setIsCrawling(true);
        try {
            await adminApi.crawlChapter(chapter.id);
            alert("Re-crawl thành công!");
            setPages([]); // Xóa cache ảnh cũ
            fetchChapterImages(); // Tải lại ảnh mới
        } catch (err) { alert("Lỗi Re-crawl: " + err.message); } 
        finally { setIsCrawling(false); }
    };

    // 4. Xóa Chapter
    const handleDelete = async () => {
        try {
            await adminApi.deleteChapter(chapter.id);
            setShowDeleteModal(false);
            if (onDeleteSuccess) onDeleteSuccess(chapter.id); // Gọi callback báo cho cha biết
        } catch (err) { alert("Lỗi xóa: " + err.message); }
    };

    return (
        <>
            <tr onClick={handleToggleExpand} className={`cursor-pointer transition-colors hover:bg-slate-50 dark:hover:bg-slate-700/40 ${isExpanded ? 'bg-slate-50 dark:bg-slate-700/30' : ''}`}>
                <td className="p-4 text-slate-400">
                    <span className={`material-symbols-outlined transition-transform duration-200 ${isExpanded ? 'rotate-90 text-blue-500' : ''}`}>chevron_right</span>
                </td>
                <td className="p-4"><input type="checkbox" onClick={(e)=>e.stopPropagation()} className="rounded dark:bg-slate-800"/></td>
                <td className="p-4 font-mono text-sm font-bold text-blue-500">#{chapter.number}</td>
                <td className="p-4 text-sm text-slate-700 dark:text-slate-200 font-medium">{chapter.title}</td>
                <td className="p-4 text-center">
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${chapter.status === 'PUBLISHED' ? 'bg-green-50 text-green-600 border-green-200' : 'bg-orange-50 text-orange-600 border-orange-200'}`}>{chapter.status}</span>
                </td>
                {/* MENU BUTTON */}
                <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}> 
                    <div className="flex items-center justify-end gap-2" ref={dropdownRef}>
                        {isCrawling && <span className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></span>}
                        <div className="relative">
                            <button onClick={() => setShowDropdown(!showDropdown)} className="p-1.5 rounded text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700">
                                <span className="material-symbols-outlined text-[20px]">more_vert</span>
                            </button>
                            {showDropdown && (
                                <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl z-50 overflow-hidden">
                                    <div className="py-1">
                                        <button onClick={() => handleMenuClick('edit')} className="w-full text-left px-4 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700">Chỉnh sửa Link</button>
                                        <button onClick={() => handleMenuClick('crawl')} className="w-full text-left px-4 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700">Re-crawl Data</button>
                                        <button onClick={() => handleMenuClick('delete')} className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-slate-700">Xóa Chapter</button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </td>
            </tr>

            {/* EXPANDED AREA - IMAGE GALLERY */}
            {isExpanded && (
                <tr className="bg-slate-50/50 dark:bg-slate-900/50">
                    <td colSpan="6" className="p-0">
                        <div className="p-6 border-y border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-900/40">
                            <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase mb-4">Image Gallery ({pages.length})</h4>
                            
                            <div className="max-h-[500px] overflow-y-auto custom-scrollbar p-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-200/30 dark:bg-slate-900/50">
                                {loadingImages ? (
                                    <div className="py-10 text-center text-slate-500 animate-pulse">Đang tải ảnh từ server...</div>
                                ) : pages.length === 0 ? (
                                    <div className="py-10 text-center text-slate-400 italic">Chưa có ảnh nào.</div>
                                ) : (
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
                                        {pages.map((page, idx) => (
                                            <div key={idx} onClick={(e) => { e.stopPropagation(); setViewImage(page.url); }} className="group relative bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden hover:shadow-md transition-all cursor-zoom-in">
                                                <div className="aspect-[2/3] bg-slate-200 dark:bg-slate-700 relative">
                                                    <img src={page.url} loading="lazy" alt={`Page`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"/>
                                                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                        <span className="material-symbols-outlined text-white">zoom_in</span>
                                                    </div>
                                                </div>
                                                <div className="p-1.5 text-center text-[10px] font-bold text-slate-500 border-t border-slate-100 dark:border-slate-700 uppercase">Page {page.pageNumber}</div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </td>
                </tr>
            )}

            {/* LIGHTBOX ZOOM MODAL */}
            {viewImage && (
                <div className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setViewImage(null)}>
                    <button className="absolute top-5 right-5 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white" onClick={() => setViewImage(null)}><span className="material-symbols-outlined text-3xl">close</span></button>
                    <img src={viewImage} className="max-w-full max-h-screen object-contain rounded-lg shadow-2xl animate-in zoom-in duration-200" onClick={(e) => e.stopPropagation()} alt="Zoomed" />
                </div>
            )}

            {/* EDIT MODAL */}
            {showEditModal && (
                <div className="fixed inset-0 z-[60] bg-black/50 flex items-center justify-center p-4 animate-in fade-in" onClick={() => setShowEditModal(false)}>
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
                        <h3 className="text-lg font-bold mb-4 dark:text-white">Cập nhật Link Nguồn</h3>
                        <input value={newLink} onChange={(e) => setNewLink(e.target.value)} placeholder="Nhập link gốc..." className="w-full px-4 py-2 border rounded-lg mb-4 bg-slate-50 dark:bg-slate-900 dark:border-slate-700 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none" />
                        <div className="flex justify-end gap-3">
                            <button onClick={() => setShowEditModal(false)} className="px-4 py-2 text-slate-500 hover:bg-slate-100 rounded-lg">Hủy</button>
                            <button onClick={handleSaveLink} className="px-4 py-2 bg-blue-600 text-white rounded-lg">Lưu</button>
                        </div>
                    </div>
                </div>
            )}

            {/* DELETE MODAL */}
            {showDeleteModal && (
                <div className="fixed inset-0 z-[60] bg-black/50 flex items-center justify-center p-4 animate-in fade-in" onClick={() => setShowDeleteModal(false)}>
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl w-full max-w-sm shadow-2xl border border-red-100 dark:border-red-900/30 text-center" onClick={e => e.stopPropagation()}>
                        <div className="w-12 h-12 bg-red-100 text-red-500 rounded-full flex items-center justify-center mb-4 mx-auto"><span className="material-symbols-outlined text-2xl">warning</span></div>
                        <h3 className="text-lg font-bold mb-2 dark:text-white">Xóa Chapter này?</h3>
                        <p className="text-slate-500 text-sm mb-6">Hành động này sẽ xóa vĩnh viễn dữ liệu trong Database và tất cả ảnh trong thư mục.</p>
                        <div className="flex justify-center gap-3">
                            <button onClick={() => setShowDeleteModal(false)} className="px-4 py-2 text-slate-500 hover:bg-slate-100 rounded-lg">Không</button>
                            <button onClick={handleDelete} className="px-4 py-2 bg-red-500 text-white rounded-lg">Xóa Vĩnh Viễn</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default ChapterRow;