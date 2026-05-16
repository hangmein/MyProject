import React from 'react';

// Nhận prop 'comic' từ App.jsx truyền vào
const HeroSection = ({ comic }) => {
  // Nếu chưa có dữ liệu (lúc đang tải trang) thì không hiện gì hoặc hiện khung xương
  if (!comic) return <div className="w-full h-[300px] bg-gray-200 animate-pulse"></div>;

  return (
    <div className="relative w-full h-[300px] md:h-[400px] overflow-hidden group">
      {/* ẢNH NỀN TỪ DATABASE */}
      <div 
        className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
        style={{ backgroundImage: `url('${comic.BannerImage}')` }}
      >
         {/* Lớp phủ đen để chữ dễ đọc */}
         <div className="absolute inset-0 bg-slate-900/40 bg-gradient-to-t from-slate-900 via-transparent"></div>
      </div>

      {/* NỘI DUNG TỪ DATABASE */}
      <div className="relative z-10 h-full flex flex-col justify-end p-6 md:p-10">
        <span className="text-xs font-bold text-blue-400 bg-blue-500/10 border border-blue-500/20 px-3 py-1 rounded-full w-fit mb-3 backdrop-blur-sm">
          FEATURED
        </span>
        
        {/* Tiêu đề truyện */}
        <h2 className="text-3xl md:text-5xl font-black text-white mb-3 tracking-tight drop-shadow-lg">
          {comic.Title}
        </h2>
        
        {/* Mô tả truyện */}
        <p className="text-sm md:text-lg text-slate-200 line-clamp-2 max-w-2xl mb-6 drop-shadow-md font-medium">
          {comic.Description}
        </p>
        
        <div className="flex gap-3">
          <button className="bg-primary hover:bg-blue-700 text-white text-sm font-bold px-8 py-3 rounded-xl transition-all shadow-lg shadow-blue-600/20 translate-y-0 hover:-translate-y-1">
            Read Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;