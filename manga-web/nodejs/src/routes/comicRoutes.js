const express = require('express');
const router = express.Router();

// Chỉ cần import một mình comicController
const comicController = require('../controllers/comicController');

// ==========================================
// THỨ TỰ ƯU TIÊN ROUTE
// ==========================================

// 1. [GET] /api/comics
// Lấy danh sách tất cả truyện
router.get('/', comicController.getComics);

// 2. [GET] /api/comics/featured
// Lấy truyện nổi bật (Phải đặt TRƯỚC :slug)
router.get('/featured', comicController.getFeatured);

// 3. [GET] /api/comics/:slug/chapter/:chapterNumber
// Đọc nội dung chương
// (Đã đổi sang dùng comicController.readChapter)
router.get('/:slug/chapter/:chapterNumber', comicController.readChapter);

// 4. [GET] /api/comics/:slug
// Lấy chi tiết truyện (Đặt CUỐI CÙNG để hứng slug)
router.get('/:slug', comicController.getDetail);

module.exports = router;