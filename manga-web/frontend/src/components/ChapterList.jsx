import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom'; // <--- Đảm bảo đã import useParams

const ChapterList = ({ chapters }) => {
  const { slug } = useParams(); // <--- 1. LẤY SLUG TỪ URL ĐỂ TẠO LINK
  const [sortOrder, setSortOrder] = useState('desc');
  
  // Bạn chỉnh lại số 5 (hoặc số 2 để test) tùy ý nhé
  const [visibleCount, setVisibleCount] = useState(5); 

  if (!chapters || chapters.length === 0) {
    return <div className="text-gray-500 text-sm italic p-4">Chưa có chương nào.</div>;
  }

  // Hàm tính thời gian
  const formatTimeAgo = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);

    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes ago";
    return "Just now";
  };

  // Logic Sắp xếp
  const toggleSort = () => {
    setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc');
  };

  const sortedChapters = [...chapters].sort((a, b) => {
    return sortOrder === 'desc' 
      ? b.ChapterNumber - a.ChapterNumber 
      : a.ChapterNumber - b.ChapterNumber;
  });

  const currentChapters = sortedChapters.slice(0, visibleCount);
  const hasMore = visibleCount < chapters.length;

  const loadMore = () => {
    setVisibleCount(prev => prev + 5);
  };

  return (
    <div className="flex flex-col bg-[#1e2337] rounded-3xl overflow-hidden p-4 shadow-xl border border-white/5">
      
      {/* HEADER */}
      <div className="flex items-center justify-between mb-4 px-1">
        <div className="flex items-center gap-3">
          <h3 className="text-xl font-bold text-white">Chapters</h3>
          <span className="bg-white/10 text-xs font-semibold px-2 py-1 rounded-md text-[#9da4b9]">
            {chapters.length} Total
          </span>
        </div>
        
        <div className="flex gap-1">
           {/* Nút Filter (Trang trí) */}
           <button className="size-8 flex items-center justify-center rounded-full hover:bg-white/10 text-[#9da4b9] transition">
              <span className="material-symbols-outlined text-[20px]">filter_list</span>
           </button>
           
           {/* Nút Sort */}
           <button onClick={toggleSort} className="size-8 flex items-center justify-center rounded-full hover:bg-white/10 text-[#9da4b9] transition active:scale-90">
              <span className="material-symbols-outlined text-[20px] transform transition-transform duration-300" style={{ transform: sortOrder === 'asc' ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                swap_vert
              </span>
           </button>
        </div>
      </div>

      {/* DANH SÁCH CHƯƠNG */}
      <div className="flex flex-col gap-2">
        {currentChapters.map((chap, index) => {
          // Logic giả: Coi như 2 chương đầu trong list là đã đọc
          //const isRead = index === 2 || index === 3; 
          const isRead = false;
          return (
            <Link 
              to={`/comic/${slug}/chapter/${chap.ChapterNumber}`} // <--- 2. QUAN TRỌNG: ĐƯỜNG DẪN ĐẾN TRANG ĐỌC
              key={chap.Id} 
              className="group flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-all cursor-pointer active:scale-[0.99]"
            >
              <div className="flex flex-col gap-1">
                <span className={`text-[15px] font-bold transition-colors ${isRead ? 'text-[#9da4b9]' : 'text-white group-hover:text-primary'}`}>
                  Chapter {chap.ChapterNumber}: {chap.Title}
                </span>
                <span className="text-xs text-[#5e657e] font-medium">
                  Added {formatTimeAgo(chap.UpdatedAt)}
                </span>
              </div>

              {/* ICON TRẠNG THÁI */}
              <div>
                {isRead ? (
                   // Đã đọc: Hiện dấu tích Xanh
                   <div className="size-8 flex items-center justify-center rounded-full bg-primary/20 text-primary">
                      <span className="material-symbols-outlined text-[18px] material-symbols-filled">check</span>
                   </div>
                ) : (
                   // Chưa đọc: Hiện mũi tên hướng tới
                   <div className="size-8 flex items-center justify-center rounded-full text-[#5e657e] hover:text-white hover:bg-white/10 transition">
                      <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                   </div>
                )}
              </div>
            </Link>
          );
        })}
      </div>

      {/* LOAD MORE */}
      {hasMore && (
        <button 
          onClick={loadMore}
          className="mt-4 w-full py-3.5 text-sm font-bold text-[#9da4b9] bg-[#171c2c] hover:bg-[#1a2033] hover:text-white rounded-xl transition-all active:scale-95"
        >
          Load Older Chapters
        </button>
      )}
      
      {!hasMore && chapters.length > visibleCount && (
         <div className="mt-4 text-center text-xs text-[#5e657e] italic pb-2">
            End of list.
         </div>
      )}

    </div>
  );
};

export default ChapterList;