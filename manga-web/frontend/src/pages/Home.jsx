import { useState, useEffect } from 'react';
import clientApi from '../api/clientApi'; // Đảm bảo đã có file này
import Header from '../components/Header';
import HeroSection from '../components/HeroSection';
import BottomNav from '../components/BottomNav';
import ComicRow from '../components/ComicRow';

const Home = () => {
  const [comics, setComics] = useState([]);
  const [featuredComic, setFeaturedComic] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Gọi song song 2 API cho nhanh
        const [resComics, resFeatured] = await Promise.all([
            clientApi.getComics(),
            clientApi.getFeaturedComic()
        ]);

        setComics(resComics.data);
        setFeaturedComic(resFeatured.data);
      } catch (err) {
        console.error("Lỗi tải trang chủ:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
      return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center">
             {/* Loading Spinner đơn giản */}
             <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      );
  }

  return (
    <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-white min-h-screen pb-24 font-display">
      <Header />
      
      <main className="max-w-screen-xl mx-auto px-4 md:px-6 w-full">
        
        {/* Banner - Chỉ hiện nếu có dữ liệu */}
        {featuredComic && (
            <div className="mt-4 rounded-2xl overflow-hidden shadow-xl">
                <HeroSection comic={featuredComic} />
            </div>
        )}
        
        {/* Categories */}
        <section className="mt-8">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-bold tracking-tight">Categories</h3>
            <button className="text-primary text-sm font-semibold hover:underline">See All</button>
          </div>
          <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
            {["All", "Action", "Adventure", "Comedy", "Drama", "Fantasy", "Historical", "Horror", "Isekai", "Sci-Fi", "Sports"].map((cat, index) => (
              <div key={index} className={`flex h-10 shrink-0 items-center justify-center gap-x-2 rounded-xl px-5 border cursor-pointer transition-colors ${index === 0 ? 'bg-primary text-white shadow-lg shadow-primary/20 border-transparent' : 'bg-white dark:bg-gray-800 text-slate-600 dark:text-slate-300 border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
                <p className="text-sm font-bold">{cat}</p>
              </div>
            ))}
          </div>
        </section>
        
        {/* --- CÁC HÀNG TRUYỆN --- */}

        {/* 1. Mới cập nhật */}
        <ComicRow title="Recently Updated" comics={comics} />

        {/* 2. Action */}
        {comics.some(c => c.Category === 'Action') && (
            <ComicRow 
              title="Best Action Manga ⚔️" 
              comics={comics.filter(c => c.Category === 'Action')} 
            />
        )}

        {/* 3. Sci-Fi & Fantasy */}
        {comics.some(c => c.Category === 'Sci-Fi' || c.Category === 'Fantasy') && (
            <ComicRow 
              title="Sci-Fi & Fantasy 🐉" 
              comics={comics.filter(c => c.Category === 'Sci-Fi' || c.Category === 'Fantasy')} 
            />
        )}

      </main>

      <BottomNav />
    </div>
  );
}

export default Home;