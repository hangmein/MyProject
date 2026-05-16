import { BrowserRouter, Routes, Route } from 'react-router-dom'; // Navigate ko dùng ở đây nên có thể bỏ
import AdminLayout from './layouts/AdminLayout';
import MangaListPage from './pages/MangaListPage';
import MangaDetailPage from './pages/MangaDetailPage';
import CrawlerTool from './pages/CrawlerTool'; 
import DashboardPage from './pages/DashboardPage';
import LoginPage from './pages/LoginPage';
import ReportPage from './pages/ReportPage'; // <--- 1. IMPORT TRANG REPORT
import PrivateRoute from './components/PrivateRoute'; 

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Route Login (Ai cũng vào được) */}
        <Route path="/login" element={<LoginPage />} />

        {/* --- KHU VỰC CẦN ĐĂNG NHẬP --- */}
        <Route element={<PrivateRoute />}>
            
            <Route element={<AdminLayout />}>
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/" element={<DashboardPage />} />
                
                <Route path="manga" element={<MangaListPage />} />
                <Route path="manga/:id" element={<MangaDetailPage />} />
                
                <Route path="crawler" element={<CrawlerTool />} />

                {/* 👇 2. THÊM ROUTE CHO TRANG BÁO LỖI VÀO ĐÂY */}
                <Route path="reports" element={<ReportPage />} />
            </Route>

        </Route>
        {/* ----------------------------- */}

      </Routes>
    </BrowserRouter>
  );
}

export default App;