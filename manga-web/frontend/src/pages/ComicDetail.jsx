import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ChapterList from '../components/ChapterList';
import RelatedComics from '../components/RelatedComics';
import BottomNav from '../components/BottomNav'; // <--- 1. IMPORT BOTTOM NAV

const ComicDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [comic, setComic] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    fetch(`http://localhost:3000/api/comics/${slug}`)
      .then(res => res.json())
      .then(data => setComic(data))
      .catch(err => console.error(err));
  }, [slug]);

  if (!comic) return <div className="min-h-screen bg-[#101522] text-white flex items-center justify-center">Loading...</div>;

  return (
    // 2. TĂNG PADDING BOTTOM (pb-24) ĐỂ TRÁNH BỊ THANH MENU CHE
    <div className="bg-background-light dark:bg-background-dark font-display text-white antialiased min-h-screen pb-24">
      
      {/* Background mờ (Desktop) */}
      <div className="hidden md:block fixed inset-0 z-0">
          <div className="absolute inset-0 bg-cover bg-center blur-2xl opacity-20 transform scale-110" style={{ backgroundImage: `url("${comic.CoverImage}")` }}></div>
          <div className="absolute inset-0 bg-background-dark/80"></div>
      </div>

      {/* Top Bar */}
      <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-3 md:px-10 md:py-4 bg-background-dark/80 backdrop-blur-md md:bg-transparent">
        <button onClick={() => navigate(-1)} className="flex items-center justify-center size-10 rounded-full bg-background-dark/50 hover:bg-white/10 active:scale-95 transition-all">
          <span className="material-symbols-outlined text-white">arrow_back_ios_new</span>
        </button>
        <div className="flex gap-2">
          <button className="flex items-center justify-center size-10 rounded-full bg-background-dark/50 hover:bg-white/10 active:scale-95 transition-all">
            <span className="material-symbols-outlined text-white">share</span>
          </button>
        </div>
      </div>

      {/* --- CONTAINER CHÍNH --- */}
      <div className="relative z-10 w-full md:max-w-6xl md:mx-auto md:pt-24 md:px-6">
        
        {/* PHẦN TRÊN: CHIA 2 CỘT */}
        <div className="md:flex md:gap-10">
            
            {/* CỘT TRÁI: POSTER */}
            <div className="relative w-full h-[460px] md:w-[300px] md:h-[450px] md:shrink-0 md:rounded-xl md:overflow-hidden md:shadow-2xl md:ring-1 md:ring-white/10">
              <div className="absolute inset-0 bg-center bg-no-repeat bg-cover md:hidden" style={{ backgroundImage: `url("${comic.CoverImage}")` }}></div>
              <img src={comic.CoverImage} alt={comic.Title} className="hidden md:block w-full h-full object-cover" />
              <div className="absolute inset-0 hero-gradient md:hidden"></div>
              {/* Info Mobile Overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-6 flex flex-col gap-2 md:hidden">
                <h1 className="text-4xl font-bold leading-tight tracking-tight shadow-black drop-shadow-lg">{comic.Title}</h1>
                <div className="flex items-center gap-2 text-[#9da4b9]">
                  <span className="font-medium text-white drop-shadow-md">{comic.Author}</span>
                  <span className="size-1 bg-[#9da4b9] rounded-full"></span>
                  <div className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-yellow-400 text-lg material-symbols-filled">star</span>
                    <span className="text-white font-semibold">4.9</span>
                  </div>
                </div>
              </div>
            </div>

            {/* CỘT PHẢI: INFO & CHAPTERS */}
            <div className="px-6 -mt-2 md:mt-0 md:px-0 relative z-10 flex flex-col gap-6 flex-1">
              
              {/* Info Desktop */}
              <div className="hidden md:flex flex-col gap-2">
                 <h1 className="text-5xl font-bold leading-tight tracking-tight text-white">{comic.Title}</h1>
                 <p className="text-xl text-slate-300 font-medium">{comic.Author}</p>
                 <div className="flex items-center gap-4 mt-2">
                    <div className="flex items-center gap-1 bg-yellow-400/10 px-3 py-1 rounded-lg border border-yellow-400/20">
                        <span className="material-symbols-outlined text-yellow-400 text-lg material-symbols-filled">star</span>
                        <span className="text-yellow-400 font-bold">4.9</span>
                    </div>
                    <span className="text-slate-400">(12.4k reviews)</span>
                 </div>
              </div>

              {/* Buttons & Tags */}
              <div className="flex gap-3 md:max-w-md">
                <button className="flex-1 flex items-center justify-center gap-2 bg-primary hover:bg-blue-600 text-white h-14 rounded-xl font-bold text-lg transition-all active:scale-95 shadow-lg shadow-primary/25">
                  <span className="material-symbols-outlined">menu_book</span> Read Now
                </button>
                <button className="flex items-center justify-center w-14 h-14 bg-white/5 border border-white/10 rounded-xl text-white transition-all active:scale-95 hover:bg-white/10">
                  <span className="material-symbols-outlined">bookmark_add</span>
                </button>
              </div>

              <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                <span className="px-4 py-1.5 bg-white/5 border border-white/5 rounded-full text-xs font-semibold whitespace-nowrap text-slate-200">{comic.Category || "Manga"}</span>
                <span className="px-4 py-1.5 bg-white/5 border border-white/5 rounded-full text-xs font-semibold whitespace-nowrap text-slate-200">Action</span>
                <span className="px-4 py-1.5 bg-white/5 border border-white/5 rounded-full text-xs font-semibold whitespace-nowrap text-slate-200">Adventure</span>
              </div>

              {/* Synopsis */}
              <div className="flex flex-col gap-2">
                <h3 className="text-xl font-bold tracking-tight md:text-2xl">Synopsis</h3>
                <p className={`text-[#9da4b9] text-[15px] md:text-lg leading-relaxed transition-all ${isExpanded ? '' : 'line-clamp-3'}`}>{comic.Description}</p>
                <button onClick={() => setIsExpanded(!isExpanded)} className="text-primary text-sm font-bold flex items-center gap-1 w-fit hover:underline">
                  {isExpanded ? 'Show Less' : 'Read More'} <span className={`material-symbols-outlined text-sm transition-transform ${isExpanded ? 'rotate-180' : ''}`}>keyboard_arrow_down</span>
                </button>
              </div>

              {/* Chapter List */}
              <div className="flex flex-col gap-4 mt-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold tracking-tight md:text-2xl">Chapters</h3>
                  <span className="text-sm text-[#9da4b9] font-medium bg-white/5 px-3 py-1 rounded-full border border-white/5">{comic.Chapters?.length || 0} Total</span>
                </div>
                <ChapterList chapters={comic.Chapters} />
              </div>

            </div>
        </div>


        {/* --- RELATED WORKS (Ở dưới cùng) --- */}
        <div className="mt-12 md:mt-16 px-6 md:px-0 border-t border-white/5 pt-8">
           <RelatedComics currentSlug={slug} currentCategory={comic.Category} />
        </div>

      </div>
      
      {/* 3. ĐẶT BOTTOM NAV Ở CUỐI CÙNG */}
      <BottomNav />

    </div>
  );
};

export default ComicDetail;