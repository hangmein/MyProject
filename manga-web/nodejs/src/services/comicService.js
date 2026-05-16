// src/services/comicService.js
const prisma = require('../config/prisma');
const fs = require('fs');
const path = require('path');

// Đường dẫn gốc: D:\MyProject\manga-web\nodejs\manga
const UPLOADS_ROOT = path.join(__dirname, '../../manga');
const BASE_URL = 'http://localhost:3000'; 

// --- HÀM HELPER: Tìm ảnh trong folder con (cover/hero-banner) ---
const getComicImage = (slug, type) => {
    try {
        // type = 'cover' hoặc 'hero-banner'
        // Đường dẫn: manga/{slug}/images/{type}
        const dirPath = path.join(UPLOADS_ROOT, slug, 'images', type);

        if (!fs.existsSync(dirPath)) return null;

        // Lấy file đầu tiên tìm thấy trong folder đó
        const files = fs.readdirSync(dirPath);
        const imageFile = files.find(file => /\.(jpg|jpeg|png|webp|gif)$/i.test(file));

        if (imageFile) {
            // Trả về URL: http://localhost:3000/manga/{slug}/images/{type}/{file}
            return `${BASE_URL}/manga/${slug}/images/${type}/${imageFile}`;
        }
        return null;
    } catch (e) {
        return null;
    }
};

// --- 1. LẤY DANH SÁCH TRUYỆN (SỬA LẠI) ---
const getAllComics = async () => {
    const comics = await prisma.comics.findMany({
        include: { Chapters: { orderBy: { ChapterNumber: 'desc' }, take: 1 } }, 
        orderBy: { UpdatedAt: 'desc' }
    });

    // Map qua từng truyện để gắn link ảnh thật từ folder
    return comics.map(comic => {
        const localCover = getComicImage(comic.Slug, 'cover');
        
        return {
            ...comic,
            // Nếu tìm thấy ảnh trong folder thì dùng, ko thì dùng link cũ trong DB
            CoverImage: localCover || comic.CoverImage 
        };
    });
};

// --- 2. LẤY BANNER (SỬA LẠI) ---
const getFeaturedComic = async () => {
    const comic = await prisma.comics.findFirst({ where: { IsFeatured: true } });
    if (!comic) return null;

    const localBanner = getComicImage(comic.Slug, 'hero-banner');
    const localCover = getComicImage(comic.Slug, 'cover');

    return {
        ...comic,
        BannerImage: localBanner || comic.BannerImage,
        CoverImage: localCover || comic.CoverImage
    };
};

// --- CÁC HÀM KHÁC GIỮ NGUYÊN ---
const getComicBySlug = async (slug) => {
    // ... (Code cũ của bạn)
    // Lưu ý: Cũng nên áp dụng logic getComicImage cho hàm này nếu trang chi tiết cần ảnh bìa
    const comic = await prisma.comics.findUnique({
        where: { Slug: slug },
        include: { Chapters: { orderBy: { ChapterNumber: 'desc' } } }
    });
    
    if(comic) {
        const localCover = getComicImage(comic.Slug, 'cover');
        const localBanner = getComicImage(comic.Slug, 'hero-banner');
        comic.CoverImage = localCover || comic.CoverImage;
        comic.BannerImage = localBanner || comic.BannerImage;
    }
    return comic;
};

// --- HÀM LẤY ẢNH THÔNG MINH (Tự động nhận diện chapter-1 hoặc chapter1) ---
const getChapterImages = async (slug, chapterNumber) => {
  try {
    // 1. Định nghĩa đường dẫn gốc tới folder chapters của truyện
    // Ví dụ: D:/.../manga/chainsaw-man/chapters
    const baseChapterPath = path.join(UPLOADS_ROOT, slug, 'chapters');

    // 2. Kiểm tra xem folder nào tồn tại (có gạch ngang hay không)
    const folderNameWithDash = `chapter-${chapterNumber}`; // chapter-1
    const folderNameNoDash = `chapter${chapterNumber}`;    // chapter1
    
    let finalFolderName = null;
    let finalPath = null;

    if (fs.existsSync(path.join(baseChapterPath, folderNameWithDash))) {
        finalFolderName = folderNameWithDash;
        finalPath = path.join(baseChapterPath, folderNameWithDash);
    } else if (fs.existsSync(path.join(baseChapterPath, folderNameNoDash))) {
        finalFolderName = folderNameNoDash;
        finalPath = path.join(baseChapterPath, folderNameNoDash);
    } else {
        // Không tìm thấy cả 2 kiểu -> Trả về rỗng
        console.log(`❌ Không tìm thấy folder chapter ${chapterNumber} (slug: ${slug})`);
        return [];
    }

    // 3. Quét file trong folder đã tìm thấy
    const files = fs.readdirSync(finalPath);
    const imageFiles = files.filter(file => /\.(jpg|jpeg|png|webp)$/i.test(file));

    // 4. Sắp xếp ảnh (1, 2, 10...)
    imageFiles.sort((a, b) => {
      const numA = parseInt(a.match(/\d+/)) || 0;
      const numB = parseInt(b.match(/\d+/)) || 0;
      return numA - numB;
    });

    // 5. Tạo URL trả về
    // URL: http://localhost:3000/manga/chainsaw-man/chapters/chapter-1/01.jpg
    return imageFiles.map((file, index) => ({
        id: index,
        url: `${BASE_URL}/manga/${slug}/chapters/${finalFolderName}/${file}`
    }));
    
  } catch (error) {
    console.error("Lỗi service getChapterImages:", error);
    return [];
  }
};

module.exports = {
  getAllComics,
  getFeaturedComic,
  getComicBySlug,
  getChapterImages
};