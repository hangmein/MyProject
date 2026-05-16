const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminComicController');

// --- 1. CÁC ROUTE LẤY DỮ LIỆU (GET) ---

// Lấy danh sách truyện cho trang Admin Dashboard
router.get('/comics/list', adminController.getComicsList); 

// Lấy chi tiết một bộ truyện
router.get('/comics/:id', adminController.getComicDetail);

// Lấy danh sách ảnh của một chapter
router.get('/chapters/:id/images', adminController.getChapterImages);


// --- 2. CÁC ROUTE THAO TÁC (PUT, DELETE, POST) ---

// Cập nhật thông tin Chapter (Sửa link nguồn)
router.put('/chapters/:id', adminController.updateChapter);
// Xóa Chapter
router.delete('/chapters/:id', adminController.deleteChapter);
// Re-crawl (Cào lại) dữ liệu Chapter
router.post('/chapters/:id/crawl', adminController.reCrawlChapter);
// crawl nhiều chapter
router.post('/chapters/crawl-bulk', adminController.crawlBulk)

// --- 3. ROUTE TẠO TRUYỆN MỚI (MỚI THÊM) ---
router.post('/comics', adminController.createComic);

router.put('/comics/:id', adminController.updateComic);

router.post('/chapters/bulk-create', adminController.createBulkChapters);

router.delete('/comics/:id', adminController.deleteComic);


router.get('/dashboard', adminController.getDashboardStats);
module.exports = router;