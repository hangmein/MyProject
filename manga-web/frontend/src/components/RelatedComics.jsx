import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const RelatedComics = ({ currentSlug, currentCategory }) => {
  const [comics, setComics] = useState([]);

  useEffect(() => {
    // Gọi API lấy tất cả truyện
    // (Sau này nếu backend xịn hơn thì gọi API: /api/comics/related?category=...)
    fetch('http://localhost:3000/api/comics')
      .then(res => res.json())
      .then(data => {
        // Lọc bỏ truyện đang đọc hiện tại
        const filtered = data.filter(c => c.Slug !== currentSlug);
        
        // Sắp xếp ngẫu nhiên hoặc theo tiêu chí nào đó (Ở đây mình lấy 4 truyện đầu)
        setComics(filtered.slice(0, 4));
      })
      .catch(err => console.error(err));
  }, [currentSlug]);

  if (comics.length === 0) return null;

  return (
    <div className="flex flex-col gap-4 mt-8">
      {/* Header */}
      <div className="flex items-center justify-between px-1">
        <h3 className="text-xl font-bold text-white">Related Works</h3>
        <button className="text-primary text-xs font-bold uppercase tracking-wider hover:underline">
          View All
        </button>
      </div>

      {/* Grid Layout: Mobile 2 cột, Desktop 4 cột */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {comics.map((comic) => (
          <Link 
            to={`/comic/${comic.Slug}`} 
            key={comic.Id} 
            className="group flex flex-col gap-2 cursor-pointer"
            onClick={() => window.scrollTo(0, 0)} // Bấm vào thì cuộn lên đầu trang
          >
            {/* Image Card */}
            <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-gray-800 shadow-lg group-hover:shadow-primary/20 transition-all duration-300">
              <div 
                className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110" 
                style={{ backgroundImage: `url('${comic.CoverImage}')` }}
              ></div>
              
              {/* Overlay tối khi hover */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all"></div>

              {/* Rating Badge (Giả lập điểm số) */}
              <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md px-1.5 py-0.5 rounded-md flex items-center gap-1 border border-white/10">
                 <span className="material-symbols-outlined text-yellow-400 text-[12px] material-symbols-filled">star</span>
                 <span className="text-white text-[10px] font-bold">4.9</span>
              </div>
            </div>

            {/* Title & Genre */}
            <div className="flex flex-col px-1">
                <span className="text-white font-bold text-[15px] truncate group-hover:text-primary transition-colors">
                    {comic.Title}
                </span>
                <span className="text-[#5e657e] text-xs truncate">
                    {/* Hiển thị Category + Thể loại phụ giả lập cho đẹp */}
                    {comic.Category || 'Manga'}, Adventure
                </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default RelatedComics;