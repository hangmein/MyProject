import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import adminApi from '../api/adminApi';
import CreateComicModal from '../components/CreateComicModal';

const MangaListPage = () => {
  const [mangas, setMangas] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  // Tải danh sách truyện
  useEffect(() => {
    const fetchMangas = async () => {
      try {
        const response = await adminApi.getAllComics();
        setMangas(response.data);
      } catch (error) { console.error("Lỗi tải truyện:", error); }
    };
    fetchMangas();
  }, []);

  const handleCreateComic = async (formData) => {
    try {
        await adminApi.createComic(formData); 
        alert("Đã thêm truyện mới!");
        setIsModalOpen(false);
        const response = await adminApi.getAllComics();
        setMangas(response.data);
    } catch (error) {
        alert("Lỗi: " + error.message);
    }
  };

  // --- 👇 HÀM GHÉP LINK (BẮT BUỘC PHẢI CÓ) ---
  const getCoverUrl = (manga) => {
    const url = manga.coverUrl;
    if (!url) return 'https://placehold.co/300x450?text=No+Image';
    
    // 1. Nếu là link mạng (http...) -> Giữ nguyên
    if (url.startsWith('http')) return url;

    // 2. Nếu là file ảnh trong máy -> Phải ghép thêm localhost:3000
    if (manga.slug) {
        return `http://localhost:3000/manga/${manga.slug}/images/cover/${url}`;
    }

    return 'https://placehold.co/300x450?text=Error';
  };

  const filteredMangas = useMemo(() => {
     return mangas.filter((manga) => 
       manga.title?.toLowerCase().includes(searchTerm.toLowerCase())
     );
  }, [mangas, searchTerm]);

  return (
    <div className="h-full flex flex-col bg-slate-50 dark:bg-slate-900 relative"> 
      
      {/* HEADER */}
      <header className="px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 shadow-sm z-10">
         <div>
             <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                 <span className="material-symbols-outlined text-blue-600">grid_view</span>
                 Kho Truyện
                 <span className="ml-2 px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-sm font-normal text-slate-500">
                    {filteredMangas.length}
                 </span>
             </h2>
         </div>
         <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative group w-full md:w-64">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 material-symbols-outlined text-[20px]">search</span>
                <input 
                    type="text" 
                    placeholder="Tìm kiếm truyện..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-100 dark:bg-slate-700/50 border-none rounded-xl text-sm font-medium text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white dark:focus:bg-slate-800 transition-all placeholder:text-slate-400"
                />
                {searchTerm && (
                    <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                        <span className="material-symbols-outlined text-[16px]">close</span>
                    </button>
                )}
            </div>
            <button 
               onClick={() => setIsModalOpen(true)}
               className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-600/30 transition-all active:scale-95 whitespace-nowrap">
                <span className="material-symbols-outlined text-[20px]">add</span> 
                <span className="hidden sm:inline">Thêm Mới</span>
            </button>
         </div>
      </header>
      
      {/* DANH SÁCH */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-10 2xl:grid-cols-12 gap-6">
          
          {filteredMangas.length > 0 ? (
              filteredMangas.map((manga) => (
                <div 
                    key={manga.id} 
                    onClick={() => navigate(`/manga/${manga.id}`)}
                    className="group relative bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 cursor-pointer border border-slate-200 dark:border-slate-700"
                >
                    <div className="aspect-[2/3] overflow-hidden relative bg-slate-100 dark:bg-slate-900">
                        
                        {/* 👇 DÙNG HÀM getCoverUrl ĐỂ GHÉP LINK ĐẦY ĐỦ 👇 */}
                        <div 
                            className="w-full h-full bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                            style={{backgroundImage: `url('${getCoverUrl(manga)}')`}} 
                        ></div>
                        
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300" />
                    </div>

                    <div className="p-4 bg-white dark:bg-slate-800 relative z-10 border-t border-slate-100 dark:border-slate-700">
                        <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base line-clamp-1 mb-1 group-hover:text-blue-600 transition-colors" title={manga.title}>
                            {manga.title}
                        </h3>
                        <div className="flex justify-between items-center text-xs text-slate-500 dark:text-slate-400 font-mono">
                            <span className="flex items-center gap-1 bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded">
                                <span className="material-symbols-outlined text-[14px]">format_list_numbered</span> 
                                {manga.translatedChapters || 0} chương
                            </span>
                        </div>
                    </div>
                </div>
              ))
          ) : (
              <div className="col-span-full py-20 text-center text-slate-400">
                  <span className="material-symbols-outlined text-6xl mb-2 opacity-50">search_off</span>
                  <p>Không tìm thấy truyện nào khớp với từ khóa "{searchTerm}"</p>
              </div>
          )}

          {/* Ô Thêm nhanh */}
          <div 
              onClick={() => setIsModalOpen(true)}
              className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-slate-800/50 transition-all min-h-[250px] group text-slate-400 hover:text-blue-600">
              <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-2 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                  <span className="material-symbols-outlined text-2xl">add</span>
              </div>
              <span className="text-sm font-bold">Thêm truyện mới</span>
          </div>

        </div>
      </div>

      <CreateComicModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateComic}
      />
      
    </div>
  );
};

export default MangaListPage;