const express = require('express');
const cors = require('cors');
const path = require('path');

const comicRoutes = require('./routes/comicRoutes'); 
const adminRoutes = require('./routes/adminRoutes');
const authRoutes = require('./routes/authRoutes');
const reportRoutes = require('./routes/reportRoutes');

const app = express();
const PORT = 3000;

// 1. Cấu hình CORS toàn cục
app.use(cors({
    origin: true, // Cho phép tất cả các nguồn (dễ debug)
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 2. CẤU HÌNH ĐƯỜNG DẪN ẢNH (QUAN TRỌNG)

// 👇 Kiểm tra xem file server.js đang nằm ở đâu để chọn đường dẫn đúng
// Nếu server.js nằm trong folder 'src', dùng '../manga'
// Nếu server.js nằm ngang hàng với folder 'manga', dùng 'manga'
const mangaPath = path.join(__dirname, '../manga'); 

console.log("📂 Đang phục vụ ảnh tại:", mangaPath);

// 3. Mở thư mục ảnh + THÊM HEADER CORS CHO ẢNH
app.use('/manga', express.static(mangaPath, {
    setHeaders: (res, path, stat) => {
        res.set('Access-Control-Allow-Origin', '*');
        res.set('Cross-Origin-Resource-Policy', 'cross-origin');
    }
}));

// --- Routes ---
app.use('/api/comics', comicRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/admin/reports', reportRoutes);

app.get('/', (req, res) => {
  res.send('Manga Server is RUNNING!');
});

app.listen(PORT, () => {
  console.log(`🚀 Server Backend đang chạy tại: http://localhost:${PORT}`);
});