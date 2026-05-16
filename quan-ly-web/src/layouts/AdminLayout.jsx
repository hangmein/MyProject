// src/layouts/AdminLayout.jsx
import React, { useEffect, useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';

const AdminLayout = () => {
  const navigate = useNavigate();
  // State để lưu thông tin người dùng đang đăng nhập
  const [currentUser, setCurrentUser] = useState({ 
      username: 'Admin', 
      fullName: 'Quản trị viên' 
  });

  // 1. Lấy thông tin User từ LocalStorage khi trang vừa tải
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
        try {
            setCurrentUser(JSON.parse(storedUser));
        } catch (error) {
            console.error("Lỗi đọc thông tin user:", error);
        }
    }
  }, []);

  // 2. Hàm xử lý Đăng Xuất
  const handleLogout = () => {
      const confirm = window.confirm("Bạn có chắc chắn muốn đăng xuất?");
      if (confirm) {
          // Xóa token và user info
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          // Chuyển hướng về trang Login
          navigate('/login');
      }
  };

  return (
    <div className="flex min-h-screen overflow-hidden bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-sans">
      
      {/* --- SIDEBAR --- */}
      <aside className="w-64 border-r border-slate-200 dark:border-slate-700 flex flex-col bg-white dark:bg-slate-800 shrink-0 transition-all z-20">
        
        {/* Logo Area */}
        <div className="h-16 flex items-center px-6 border-b border-slate-100 dark:border-slate-700/50">
          <div className="flex items-center gap-3 text-blue-600 dark:text-blue-400">
            <span className="material-symbols-outlined text-3xl">auto_stories</span>
            <h1 className="text-xl font-bold tracking-tight text-slate-800 dark:text-white">MangaCMS</h1>
          </div>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto custom-scrollbar">
            <NavItem to="/dashboard" icon="dashboard" label="Tổng quan" /> 
            
            <NavItem to="/manga" icon="library_books" label="Quản lý Truyện" />
            
            {/* 👇 MỚI: Thêm mục Báo lỗi vào đây */}
            <NavItem to="/reports" icon="flag" label="Báo lỗi & Vi phạm" />
            
            <NavItem to="/crawler" icon="download" label="Crawler Tool" />
        </nav>

        {/* User Profile & Logout Area */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-100 dark:border-slate-700">
            
            {/* Avatar (Lấy chữ cái đầu của tên) */}
            <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-lg shadow-blue-500/30">
                {currentUser.username.charAt(0).toUpperCase()}
            </div>
            
            {/* User Info */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold truncate leading-tight text-slate-700 dark:text-slate-200">
                  {currentUser.fullName || currentUser.username}
              </p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate font-mono">
                  @{currentUser.username}
              </p>
            </div>

            {/* Nút Đăng Xuất */}
            <button 
                onClick={handleLogout}
                title="Đăng xuất"
                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
            >
                <span className="material-symbols-outlined text-[20px]">logout</span>
            </button>

          </div>
        </div>

      </aside>

      {/* --- MAIN CONTENT AREA --- */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden bg-slate-50 dark:bg-slate-900 relative">
        <div className="flex-1 overflow-y-auto custom-scrollbar">
             {/* Đây là nơi nội dung các trang con (Dashboard, MangaList...) sẽ hiển thị */}
            <Outlet />
        </div>
      </main>
      
    </div>
  );
};

// --- SUB-COMPONENT: NAV ITEM ---
const NavItem = ({ icon, label, to }) => (
  <NavLink 
    to={to} 
    className={({ isActive }) => 
        `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all font-medium mb-1
        ${isActive 
            ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'  // Style khi Active
            : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white' // Style thường
        }`
    }
  >
    <span className="material-symbols-outlined text-[20px]">{icon}</span>
    <span className="text-sm">{label}</span>
  </NavLink>
);

export default AdminLayout;