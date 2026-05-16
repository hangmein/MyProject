import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import ComicDetail from './pages/ComicDetail';
import ChapterReader from './pages/ChapterReader'; // <--- Đừng quên dòng này

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/comic/:slug" element={<ComicDetail />} />
        
        {/* 👇 DÒNG QUAN TRỌNG: Nếu thiếu dòng này, bấm vào sẽ trắng trang */}
        <Route path="/comic/:slug/chapter/:chapterNumber" element={<ChapterReader />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;