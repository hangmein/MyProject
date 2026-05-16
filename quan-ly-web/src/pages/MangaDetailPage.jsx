import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import adminApi from '../api/adminApi';
import ChapterRow from '../components/ChapterRow'; 

const MangaDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    
    const [detail, setDetail] = useState(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState(''); 

    const [formData, setFormData] = useState({
        title: '', author: '', category: '', coverUrl: '', bannerImage: '', description: '', isFeatured: false
    });

    const [bulkData, setBulkData] = useState({ start: '', end: '' });

    // --- HÀM 1: Cắt bỏ domain, chỉ lấy tên file (Dùng khi load dữ liệu) ---
    const extractFileName = (url) => {
        if (!url) return '';
        // Nếu là link localhost của server mình -> Cắt lấy đuôi
        if (url.includes('localhost:3000')) {
            return url.split('/').pop(); 
        }
        return url; // Nếu là link ngoài (imgur, ...) thì giữ nguyên
    };

    // --- HÀM 2: Tái tạo link đầy đủ để hiển thị ảnh ---
const getPreviewUrl = (inputValue, type) => {
    // 1. Nếu không có tên file -> Trả về ảnh rỗng
    if (!inputValue) return 'https://placehold.co/300x450?text=No+Image';
    
    // 2. Nếu đã là link đầy đủ (http...) -> Dùng luôn (ví dụ link ảnh mạng)
    if (inputValue.startsWith('http')) return inputValue; 
    
    // 3. Nếu có Slug (thông tin truyện đã tải xong) -> Ghép link chuẩn Server
    if (detail && detail.slug) {
        // Kết quả: http://localhost:3000/manga/one-piece/images/cover/anh.jpg
        return `http://localhost:3000/manga/${detail.slug}/images/${type}/${inputValue}`;
    }

    // 4. Trường hợp đang tải hoặc lỗi -> Trả về ảnh loading tạm
    return 'https://placehold.co/300x450?text=Loading...';
};

    // 1. Tải dữ liệu
    useEffect(() => {
        const fetchDetail = async () => {
            try {
                const res = await adminApi.getComicDetail(id);
                setDetail(res.data);
                
                // 👇 CẬP NHẬT: Dùng hàm extractFileName để làm gọn link
                setFormData({
                    title: res.data.title || '',
                    author: res.data.author || '',
                    category: res.data.category || '',
                    coverUrl: extractFileName(res.data.coverUrl),     // <--- Làm gọn
                    bannerImage: extractFileName(res.data.bannerImage), // <--- Làm gọn
                    description: res.data.description || '',
                    isFeatured: res.data.isFeatured ? true : false
                });
            } catch (error) { console.error("Lỗi tải trang:", error); }
        };
        if(id) fetchDetail();
    }, [id]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleBulkChange = (e) => setBulkData({ ...bulkData, [e.target.name]: e.target.value });

    // --- CÁC HÀM XỬ LÝ (Bulk Add, Delete, Save) GIỮ NGUYÊN ---
    const handleBulkAddSubmit = async () => {
        const start = parseFloat(bulkData.start);
        const end = parseFloat(bulkData.end);
        if (isNaN(start) || isNaN(end)) return alert("Vui lòng nhập số!"); 
        if (start < 0 || end < 0) return alert("❌ Không được nhập số chương âm!");
        if (start > end) return alert("❌ 'Từ chương' phải nhỏ hơn hoặc bằng 'Đến chương'");
        try {
            const res = await adminApi.createBulkChapters({
                comicId: parseInt(id), start: start, end: end
            });
            const { created, skipped } = res.data;
            alert(`✅ Hoàn tất!\n- Tạo mới: ${created}\n- Bỏ qua: ${skipped}`);
            setIsAddModalOpen(false);
            window.location.reload(); 
        } catch (error) {
            console.error("Lỗi tạo bulk:", error);
            alert("❌ Lỗi: " + (error.response?.data?.error || "Lỗi Server"));
        }
    };

    const handleDeleteComic = async () => {
        if (!window.confirm(`⚠️ Xóa truyện "${formData.title}" vĩnh viễn?`)) return;
        try {
            await adminApi.deleteComic(id);
            alert("🗑️ Đã xóa thành công!");
            navigate('/manga'); 
        } catch (error) {
            alert("❌ Lỗi xóa: " + (error.response?.data?.error || "Lỗi Server"));
        }
    };

    const handleSaveReal = async () => {
        try {
            await adminApi.updateComicInfo(id, formData);
            alert("✅ Đã cập nhật thành công!");
        } catch (error) {
            alert("❌ Lỗi lưu: " + (error.response?.data?.error || "Error"));
        }
    };

    const handleDeleteSuccess = (deletedChapterId) => {
        setDetail(prev => ({ ...prev, chapters: prev.chapters.filter(c => c.id !== deletedChapterId) }));
    };

    if (!detail) return <div className="p-10 text-center">Loading...</div>;

    const filteredChapters = detail.chapters.filter(chap => 
        chap.number.toString().includes(searchTerm) || 
        chap.title?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900 relative">
            
            {/* Header */}
            <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 p-4 flex items-center justify-between shrink-0 rounded-t-xl shadow-sm z-10">
                 <div className="flex items-center gap-4 w-3/4">
                    <button onClick={() => navigate('/manga')} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors text-slate-500">
                        <span className="material-symbols-outlined">arrow_back</span>
                    </button>
                    <div className="flex-1 space-y-2">
                        <input type="text" name="title" value={formData.title} onChange={handleChange} className="w-full text-xl font-bold text-slate-800 dark:text-white bg-transparent border-b-2 border-transparent hover:border-blue-300 focus:border-blue-600 focus:outline-none transition-all placeholder:text-slate-300" placeholder="Nhập tên truyện..." />
                        <div className="flex items-center gap-4 text-xs text-slate-500">
                            <span className="bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded">ID: {detail.id}</span>
                            <input type="text" name="category" value={formData.category} onChange={handleChange} className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 outline-none w-32" placeholder="Thể loại..." />
                            <label className="flex items-center gap-2 cursor-pointer select-none bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700/50 px-3 py-1 rounded-lg hover:bg-yellow-100 transition-colors">
                                <input type="checkbox" name="isFeatured" checked={formData.isFeatured} onChange={handleChange} className="w-4 h-4 text-yellow-500 rounded focus:ring-yellow-500 cursor-pointer accent-yellow-500" />
                                <span className={`font-bold ${formData.isFeatured ? 'text-yellow-600 dark:text-yellow-400' : 'text-slate-400'}`}>Truyện Nổi Bật</span>
                            </label>
                        </div>
                    </div>
                 </div>
                 <div className="flex gap-2">
                    <button onClick={handleDeleteComic} className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-lg shadow-lg active:scale-95 transition-all"><span className="material-symbols-outlined text-[18px]">delete</span> Xóa</button>
                    <button onClick={handleSaveReal} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-lg shadow-lg active:scale-95 transition-all"><span className="material-symbols-outlined text-[18px]">save</span> Lưu</button>
                 </div>
            </div>

            {/* Body */}
            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar */}
                <div className="w-80 p-6 border-r border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 overflow-y-auto custom-scrollbar hidden lg:flex flex-col gap-6">
                    
                    {/* 👇 ẢNH BÌA */}
                    <div className="group relative">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Ảnh Bìa (Vertical)</label>
                        <div className="aspect-[2/3] rounded-xl overflow-hidden shadow-md border border-slate-200 dark:border-slate-600 bg-slate-100 mb-2">
                            {/* Dùng hàm getPreviewUrl để hiển thị ảnh */}
                            <img 
                                src={getPreviewUrl(formData.coverUrl, 'cover')} 
                                className="w-full h-full object-cover" 
                                alt="Cover" 
                                onError={(e) => e.target.src='https://placehold.co/300x450?text=No+Image'} 
                            />
                        </div>
                        {/* Input hiển thị tên file ngắn gọn */}
                        <input type="text" name="coverUrl" value={formData.coverUrl} onChange={handleChange} className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:border-blue-500 dark:text-slate-300" placeholder="VD: anh-bia.jpg" />
                    </div>

                    {/* 👇 ẢNH BANNER */}
                    <div className="group relative">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Ảnh Banner (Horizontal)</label>
                        <div className="aspect-[3/1] rounded-xl overflow-hidden shadow-sm border border-slate-200 dark:border-slate-600 bg-slate-100 mb-2 flex items-center justify-center">
                             {/* Dùng hàm getPreviewUrl để hiển thị ảnh */}
                            {formData.bannerImage ? ( 
                                <img 
                                    src={getPreviewUrl(formData.bannerImage, 'hero-banner')} 
                                    className="w-full h-full object-cover" 
                                    alt="Banner" 
                                    onError={(e) => e.target.style.display='none'} 
                                /> 
                            ) : ( <span className="text-xs text-slate-400">Chưa có banner</span> )}
                        </div>
                        {/* Input hiển thị tên file ngắn gọn */}
                        <input type="text" name="bannerImage" value={formData.bannerImage} onChange={handleChange} className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:border-blue-500 dark:text-slate-300" placeholder="VD: banner.jpg" />
                    </div>

                    <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Tác giả</label>
                        <input type="text" name="author" value={formData.author} onChange={handleChange} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium outline-none focus:border-blue-500 dark:text-slate-200" />
                    </div>
                    <div className="flex-1 flex flex-col">
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Mô tả nội dung</label>
                        <textarea name="description" value={formData.description} onChange={handleChange} className="w-full flex-1 p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-600 dark:text-slate-300 leading-relaxed outline-none focus:border-blue-500 resize-none custom-scrollbar" placeholder="Viết tóm tắt..."></textarea>
                    </div>
                </div>

                {/* Danh sách Chapter (Giữ nguyên) */}
                <div className="flex-1 p-6 overflow-y-auto custom-scrollbar bg-slate-50 dark:bg-slate-900">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-slate-700 dark:text-slate-200 text-lg flex items-center gap-2">
                            <span className="material-symbols-outlined">format_list_numbered</span>
                            Danh sách Chapter ({filteredChapters.length}/{detail.chapters.length})
                        </h3>
                        <div className="flex gap-2">
                            <button onClick={() => setIsAddModalOpen(true)} className="flex items-center gap-1 px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded-lg shadow transition-colors">
                                <span className="material-symbols-outlined text-[16px]">add_box</span> Thêm Nhanh
                            </button>
                            <div className="relative group">
                                <span className="material-symbols-outlined absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 text-sm group-focus-within:text-blue-500">search</span>
                                <input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Tìm số chap..." className="pl-8 pr-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm outline-none focus:border-blue-500 dark:text-white w-40 focus:w-52 transition-all" />
                                {searchTerm && (
                                    <button onClick={() => setSearchTerm('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-red-500"><span className="material-symbols-outlined text-[14px]">close</span></button>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700">
                                <tr>
                                    <th className="p-4 w-10"></th>
                                    <th className="p-4 w-10"><input type="checkbox" className="rounded dark:bg-slate-800"/></th>
                                    <th className="p-4 text-xs font-bold text-slate-500 uppercase">Chapter</th>
                                    <th className="p-4 text-xs font-bold text-slate-500 uppercase">Tiêu đề</th>
                                    <th className="p-4 text-xs font-bold text-slate-500 uppercase text-center">Trạng thái</th>
                                    <th className="p-4 text-xs font-bold text-slate-500 uppercase text-right">Hành động</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                {filteredChapters.length > 0 ? (
                                    filteredChapters.map(chap => (
                                        <ChapterRow key={chap.id} chapter={chap} onDeleteSuccess={handleDeleteSuccess} />
                                    ))
                                ) : (
                                    <tr><td colSpan="6" className="p-8 text-center text-slate-400">Không tìm thấy chapter nào</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Modal Thêm Chương */}
            {isAddModalOpen && (
                 <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
                    <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 flex justify-between items-center">
                            <h3 className="font-bold text-lg text-slate-800 dark:text-white flex items-center gap-2">
                                <span className="material-symbols-outlined text-green-600">playlist_add</span> Thêm Chapter
                            </h3>
                            <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-red-500"><span className="material-symbols-outlined">close</span></button>
                        </div>
                        <div className="p-6 space-y-4">
                            <p className="text-sm text-slate-500">Nhập khoảng chapter bạn muốn tạo.</p>
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="block text-xs font-bold mb-1">Từ Chương</label><input type="number" name="start" value={bulkData.start} onChange={handleBulkChange} className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-700 rounded-lg outline-none text-center" placeholder="1" /></div>
                                <div><label className="block text-xs font-bold mb-1">Đến Chương</label><input type="number" name="end" value={bulkData.end} onChange={handleBulkChange} className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-700 rounded-lg outline-none text-center" placeholder="10" /></div>
                            </div>
                            <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 flex justify-end gap-3">
                                <button onClick={() => setIsAddModalOpen(false)} className="px-4 py-2 text-sm font-medium hover:bg-slate-200 rounded-lg">Hủy</button>
                                <button onClick={handleBulkAddSubmit} className="px-4 py-2 text-sm font-bold text-white bg-green-600 hover:bg-green-700 rounded-lg">Xác nhận</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MangaDetailPage;