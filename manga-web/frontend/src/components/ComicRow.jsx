import React from 'react';
import { Link } from 'react-router-dom'; // <--- Import quan trọng để chuyển trang

const ComicRow = ({ title, comics }) => {
  return (
    <section className="mt-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold tracking-tight">{title}</h3>
        <button className="text-primary text-xs font-bold uppercase tracking-wider hover:underline">View All</button>
      </div>

      <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4 pl-1">
        {(!comics || comics.length === 0) ? (
          <div className="w-full text-center py-6">
            <p className="text-sm text-gray-500 italic">No comics found...</p>
          </div>
        ) : (
          comics.map((comic) => (
            // Dùng Link bao quanh từng truyện thay vì thẻ div
            // Đường dẫn sẽ là /comic/ + slug của truyện (ví dụ: /comic/chainsaw-man)
            <Link to={`/comic/${comic.Slug}`} key={comic.Id} className="flex-none w-32 md:w-40 group cursor-pointer">
              
              {/* Khung ảnh bìa */}
              <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-gray-200 dark:bg-gray-800 mb-3 shadow-sm group-hover:shadow-lg transition-all duration-300">
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                  style={{ backgroundImage: `url('${comic.CoverImage}')` }}
                ></div>

                {/* Badge Chapter */}
                {comic.Chapters && comic.Chapters.length > 0 && (
                  <div className="absolute top-2 left-2 bg-slate-900/80 backdrop-blur-md text-[10px] font-bold text-white px-2 py-0.5 rounded shadow-sm border border-white/10">
                    CH. {comic.Chapters[0].ChapterNumber}
                  </div>
                )}
              </div>

              {/* Tên truyện */}
              <p className="text-sm font-bold truncate group-hover:text-primary transition-colors">{comic.Title}</p>

              {/* Tác giả */}
              <p className="text-xs text-slate-500 font-medium truncate mt-0.5">{comic.Author}</p>
            </Link>
          ))
        )}
      </div>
    </section>
  );
};

export default ComicRow;