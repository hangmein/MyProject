import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import clientApi from '../api/clientApi'; // <--- 1. Import API Client
import ChapterModal from '../components/ChapterModal';
import ClientReportModal from '../components/ClientReportModal'; // <--- 2. Import Modal Báo Lỗi
import '../css/ChapterReader.css'; 

const ChapterReader = () => {
    const { slug, chapterNumber } = useParams();
    const navigate = useNavigate();

    const [data, setData] = useState(null);
    const [showMenu, setShowMenu] = useState(true); 
    const [lastScrollY, setLastScrollY] = useState(0); 
    
    // State cho Modals
    const [isChapterModalOpen, setIsChapterModalOpen] = useState(false);
    const [isReportModalOpen, setIsReportModalOpen] = useState(false); // <--- State cho Modal Báo lỗi

    // 1. Fetch dữ liệu dùng clientApi
    useEffect(() => {
        window.scrollTo(0, 0);
        setShowMenu(true); 

        const fetchData = async () => {
            try {
                // Gọi API qua clientApi (đã định nghĩa ở bước trước)
                // Giả sử clientApi.getChapterContent gọi: /api/comics/${slug}/chapter/${chapterNumber}
                const res = await clientApi.getChapterContent(slug, chapterNumber);
                
                // Axios trả về trong res.data
                if (res.data && !res.data.error) {
                    setData(res.data);
                } else {
                    console.error("Lỗi API:", res.data?.error);
                }
            } catch (err) {
                console.error("Lỗi kết nối:", err);
            }
        };

        fetchData();
    }, [slug, chapterNumber]);

    // 2. Logic Scroll
    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            // Nếu đang mở bất kỳ Modal nào thì không ẩn menu
            if (isChapterModalOpen || isReportModalOpen) return;

            if (currentScrollY > lastScrollY && currentScrollY > 100) {
                setShowMenu(false); 
            } else if (currentScrollY < lastScrollY) {
                setShowMenu(true);  
            }
            setLastScrollY(currentScrollY);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [lastScrollY, isChapterModalOpen, isReportModalOpen]);

    // 3. Hàm xử lý gửi báo lỗi
    const handleSendReport = async (content) => {
        try {
            if (!data || !data.chapter) return;

            await clientApi.sendReport({
                content: content,
                chapterId: data.chapter.Id, // Lấy ID chapter từ API trả về
                // comicId nếu cần thiết
            });
            alert("✅ Đã gửi báo lỗi thành công!");
            setIsReportModalOpen(false);
        } catch (error) {
            alert("❌ Lỗi gửi báo cáo: " + error.message);
        }
    };

    // Loading State
    if (!data || !data.chapter) {
        return (
            <div className="min-h-screen bg-[#101522] flex items-center justify-center text-white font-bold">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="animate-pulse">Đang tải chương truyện...</p>
                </div>
            </div>
        );
    }

    const { comicName, chapter, images, navigation, allChapterNumbers = [] } = data;

    const handleSelectChapter = (num) => {
        setIsChapterModalOpen(false);
        navigate(`/comic/${slug}/chapter/${num}`);
    };

    return (
        <div className="bg-[#101522] min-h-screen relative overflow-x-hidden">
            
            {/* --- TOP BAR --- */}
            <div className={`fixed top-0 left-0 right-0 z-50 bg-[#101522]/95 backdrop-blur-md border-b border-white/5 transition-transform duration-300 ${showMenu ? 'translate-y-0' : '-translate-y-full'}`}>
                <div className="flex items-center justify-between px-4 py-3 max-w-5xl mx-auto">
                    <button onClick={() => navigate(`/comic/${slug}`)} className="p-2 rounded-full hover:bg-white/10 text-white transition-colors">
                        <span className="material-symbols-outlined">arrow_back</span>
                    </button>
                    
                    <div className="flex flex-col items-center">
                        <span className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] line-clamp-1 max-w-[200px]">{comicName}</span>
                        <span className="text-sm text-white font-bold tracking-tight">Chapter {chapter.ChapterNumber}</span>
                    </div>

                    {/* 👇 NÚT BÁO LỖI (MỚI) */}
                    <button 
                        onClick={() => setIsReportModalOpen(true)}
                        className="p-2 rounded-full hover:bg-red-500/20 text-red-500 transition-colors"
                        title="Báo lỗi chương này"
                    >
                        <span className="material-symbols-outlined">flag</span>
                    </button>
                </div>
            </div>

            {/* --- BOTTOM BAR --- */}
            <div className={`fixed bottom-0 left-0 right-0 z-50 bg-[#101522]/95 backdrop-blur-md border-t border-white/5 transition-transform duration-300 ${showMenu ? 'translate-y-0' : 'translate-y-full'}`}>
                <div className="flex items-center justify-between px-6 py-3 max-w-2xl mx-auto">
                    <button 
                        disabled={!navigation.prev}
                        onClick={() => navigate(`/comic/${slug}/chapter/${navigation.prev}`)}
                        className={`p-2 text-white transition-opacity ${!navigation.prev ? 'opacity-10' : 'opacity-100 active:scale-90'}`}
                    >
                        <span className="material-symbols-outlined text-3xl">chevron_left</span>
                    </button>

                    <div 
                        className="flex flex-col items-center cursor-pointer group px-8"
                        onClick={() => setIsChapterModalOpen(true)}
                    >
                        <span className="text-white font-black text-sm group-active:text-blue-400 transition-colors">
                            CHƯƠNG {chapter.ChapterNumber}
                        </span>
                        <div className="flex items-center gap-1 text-[9px] text-gray-500 font-black tracking-widest uppercase">
                            DANH SÁCH <span className="material-symbols-outlined text-[12px]">expand_less</span>
                        </div>
                    </div>

                    <button 
                        disabled={!navigation.next}
                        onClick={() => navigate(`/comic/${slug}/chapter/${navigation.next}`)}
                        className={`p-2 text-white transition-opacity ${!navigation.next ? 'opacity-10' : 'opacity-100 active:scale-90'}`}
                    >
                        <span className="material-symbols-outlined text-3xl">chevron_right</span>
                    </button>
                </div>
            </div>

            {/* --- NỘI DUNG TRUYỆN --- */}
            <div className="w-full max-w-3xl mx-auto pt-14 pb-24">
                <div className="flex flex-col w-full bg-black shadow-2xl min-h-screen">
                    {/* 👇 SỬA LOGIC MAP ẢNH Ở ĐÂY */}
                    {images && images.length > 0 ? (
                        images.map((imgObj, index) => (
                            <img 
                                key={imgObj.id || index} 
                                src={imgObj.url}  // <--- Quan trọng: Phải lấy .url
                                alt={`Trang ${index + 1}`} 
                                className="w-full h-auto block"
                                loading="lazy"
                                onContextMenu={(e) => e.preventDefault()}
                            />
                        ))
                    ) : (
                        <div className="py-20 text-center text-gray-500">
                            <span className="material-symbols-outlined text-6xl">broken_image</span>
                            <p>Không có ảnh hoặc đang tải...</p>
                        </div>
                    )}
                </div>

                <div className="py-20 text-center">
                    <p className="text-gray-600 text-sm font-medium italic">Bạn đã đọc hết chương {chapter.ChapterNumber}</p>
                </div>
            </div>

            {/* --- MODALS --- */}
            <ChapterModal 
                isOpen={isChapterModalOpen} 
                onClose={() => setIsChapterModalOpen(false)} 
                comicName={comicName}
                currentChapter={chapter.ChapterNumber}
                allChapters={allChapterNumbers}
                onSelect={handleSelectChapter}
            />

            {/* 👇 RENDER MODAL BÁO LỖI */}
            <ClientReportModal 
                isOpen={isReportModalOpen}
                onClose={() => setIsReportModalOpen(false)}
                onSubmit={handleSendReport}
                comicTitle={comicName}
                chapterNum={chapter.ChapterNumber}
            />
        </div>
    );
};

export default ChapterReader;