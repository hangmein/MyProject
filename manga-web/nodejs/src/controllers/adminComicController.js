// src/controllers/adminComicController.js

const prisma = require('../config/prisma');
const fs = require('fs');
const path = require('path');
const { crawlChapterImages } = require('../crawler/crawlChapter');

// Đường dẫn gốc tới thư mục uploads
const UPLOADS_ROOT = path.join(__dirname, '../../manga');
const BASE_URL = 'http://localhost:3000'; 

// --- HÀM HELPER (Đưa lên đầu cho gọn) ---

// 1. Hàm lấy giá trị an toàn
const getVal = (obj, keys) => {
  if (!obj) return null;
  for (const key of keys) {
    if (obj[key] !== undefined && obj[key] !== null) return obj[key];
  }
  return null;
};

// 2. Hàm Ghi Log (Viết trực tiếp tại đây)
const logActivity = async (action, targetType, targetId, description, level = 'INFO') => {
    try {
        await prisma.systemLogs.create({
            data: {
                Action: action,
                TargetType: targetType,
                TargetId: targetId ? parseInt(targetId) : null,
                Description: description,
                Level: level
            }
        });
    } catch (error) {
        console.error("⚠️ Không thể ghi log:", error);
    }
};

// ==========================================
// [GET] /api/admin/comics/list
// ==========================================
const getComicsList = async (req, res) => {
  try {
    const comics = await prisma.comics.findMany({
      orderBy: { UpdatedAt: 'desc' },
      include: { Chapters: { select: { Id: true } } }
    });

    const formattedData = comics.map(c => ({
      slug: getVal(c, ['Slug', 'slug']),
      id: getVal(c, ['Id', 'id', 'ComicId']),
      title: getVal(c, ['Title', 'title']),
      coverUrl: getVal(c, ['CoverImage', 'coverImage']),
      translatedChapters: c.Chapters ? c.Chapters.length : 0,
      totalChapters: '??', 
      status: 'ONGOING',
      isFeatured: getVal(c, ['IsFeatured', 'isFeatured']) || false
    }));

    res.status(200).json(formattedData);
  } catch (error) {
    console.error("❌ Lỗi getComicsList:", error);
    res.status(500).json({ error: error.message });
  }
};

// ==========================================
// [GET] /api/admin/comics/:id
// ==========================================
const getComicDetail = async (req, res) => {
  try {
    const comicId = parseInt(req.params.id);
    if (isNaN(comicId)) return res.status(400).json({ error: 'ID không hợp lệ' });

    const comic = await prisma.comics.findUnique({
      where: { Id: comicId }, 
      include: {
        Chapters: { orderBy: { ChapterNumber: 'desc' } }
      }
    });

    if (!comic) return res.status(404).json({ error: 'Không tìm thấy truyện' });

    const responseData = {
      slug: getVal(comic, ['Slug', 'slug']),
      id: getVal(comic, ['Id', 'id', 'ComicId']),
      title: getVal(comic, ['Title', 'title']),
      category: getVal(comic, ['Category', 'category']) || 'Manga',
      coverUrl: getVal(comic, ['CoverImage', 'coverImage']),
      description: getVal(comic, ['Description', 'description']),
      bannerImage: getVal(comic, ['BannerImage', 'bannerImage']), 
      isFeatured: getVal(comic, ['IsFeatured', 'isFeatured']) || false,
      chapters: comic.Chapters.map(chap => {
        const chapNum = getVal(chap, ['ChapterNumber', 'chapterNumber', 'number']);
        return {
          id: getVal(chap, ['Id', 'id', 'ChapterId']),
          number: chapNum,
          title: getVal(chap, ['Title', 'title']) || `Chapter ${chapNum}`,
          status: getVal(chap, ['Status', 'status']) || 'PUBLISHED',
          sourceUrl: getVal(chap, ['SourceUrl', 'sourceUrl'])
        };
      })
    };

    res.status(200).json(responseData);
  } catch (error) {
    console.error("❌ Lỗi getComicDetail:", error);
    res.status(500).json({ error: error.message });
  }
};

// ==========================================
// [GET] /api/admin/chapters/:id/images
// ==========================================
const getChapterImages = async (req, res) => {
  try {
    const chapId = parseInt(req.params.id);
    if (isNaN(chapId)) return res.status(400).json({ error: 'ID chapter lỗi' });

    const chapter = await prisma.chapters.findUnique({ where: { Id: chapId } });
    if (!chapter) return res.status(404).json({ error: 'Không tìm thấy chapter' });

    const comicId = getVal(chapter, ['ComicId', 'comicId']);
    if (!comicId) return res.status(500).json({ error: 'Dữ liệu lỗi: Chapter không có ComicId' });

    const comic = await prisma.comics.findUnique({ where: { Id: comicId } });
    if (!comic) return res.status(404).json({ error: 'Không tìm thấy truyện gốc' });

    let comicSlug = getVal(comic, ['Slug', 'slug']);
    const chapNum = getVal(chapter, ['ChapterNumber', 'chapterNumber']);

    if (!comicSlug) {
        if (comic.Title) {
             comicSlug = comic.Title.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, '-');
        } else {
             return res.status(500).json({ error: 'Truyện không có Slug và Title' });
        }
    }

    const folderName = `chapter-${chapNum}`; 
    const chapterPath = path.join(UPLOADS_ROOT, comicSlug, 'chapters', folderName);

    if (!fs.existsSync(chapterPath)) {
      return res.status(200).json([]); 
    }

    const files = fs.readdirSync(chapterPath);
    const imageFiles = files.filter(file => /\.(jpg|jpeg|png|webp)$/i.test(file));

    imageFiles.sort((a, b) => {
      const numA = parseInt(a.match(/\d+/)) || 0;
      const numB = parseInt(b.match(/\d+/)) || 0;
      return numA - numB;
    });

    const images = imageFiles.map((file, index) => ({
      id: index,
      pageNumber: index + 1,
      url: `${BASE_URL}/manga/${comicSlug}/chapters/${folderName}/${file}`
    }));

    res.status(200).json(images);

  } catch (error) {
    console.error("❌ CRITICAL ERROR getChapterImages:", error);
    res.status(500).json({ error: 'Lỗi server: ' + error.message });
  }
};

// ==========================================
// CÁC HÀM KHÁC (UPDATE, DELETE...)
// ==========================================
const updateChapter = async (req, res) => {
  try {
    const updated = await prisma.chapters.update({
      where: { Id: parseInt(req.params.id) },
      data: { SourceUrl: req.body.sourceUrl }
    });
    res.status(200).json({ message: 'Success', chapter: updated });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

// ==========================================
// [DELETE] /api/admin/chapters/:id
// ==========================================
const deleteChapter = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    // 1. Tìm chapter để lấy thông tin (để xóa file và ghi log)
    const chapter = await prisma.chapters.findUnique({ where: { Id: id } });
    if (!chapter) return res.status(404).json({ error: 'Not found' });

    const comicId = getVal(chapter, ['ComicId', 'comicId']);
    const chapNum = getVal(chapter, ['ChapterNumber', 'chapterNumber']);

    // 2. [QUAN TRỌNG] Xóa các Report liên quan đến Chapter này trước
    // Nếu không xóa dòng này, SQL Server sẽ chặn không cho xóa Chapter
    await prisma.reports.deleteMany({
        where: { ChapterId: id }
    });

    // 3. Xóa Chapter trong Database
    await prisma.chapters.delete({ where: { Id: id } });

    // 4. Xóa folder ảnh trên ổ cứng (Logic cũ của bạn giữ nguyên)
    if (comicId) {
        const comic = await prisma.comics.findUnique({ where: { Id: comicId } });
        if (comic) {
            let comicSlug = getVal(comic, ['Slug', 'slug']);
            // Fallback tạo slug nếu thiếu
            if (!comicSlug && comic.Title) {
                comicSlug = comic.Title.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, '-');
            }
            
            if (comicSlug) {
                // Lưu ý: format tên folder phải khớp với lúc crawl (chapter-1 hay chapter1)
                const folderName = `chapter-${chapNum}`; 
                const chapterPath = path.join(UPLOADS_ROOT, comicSlug, 'chapters', folderName);
                
                if (fs.existsSync(chapterPath)) {
                    fs.rmSync(chapterPath, { recursive: true, force: true });
                    console.log("🗑️ Đã xóa folder:", chapterPath);
                }
            }
        }
    }

    // 5. Ghi Log
    await logActivity('DELETE', 'Chapter', id, `Đã xóa Chapter ${chapNum} (Truyện ID: ${comicId})`, 'WARNING');
    
    res.status(200).json({ message: 'Deleted' });
  } catch (err) { 
    console.error("Lỗi xóa chapter:", err);
    res.status(500).json({ error: err.message }); 
  }
};

// ==========================================
// [POST] /api/admin/chapters/:id/crawl
// ==========================================
const reCrawlChapter = async (req, res) => {
  try {
    const { id } = req.params;
    const { url } = req.body || {}; 

    console.log(`🤖 Admin yêu cầu Re-crawl Chapter ID: ${id}`);
    
    const chapter = await prisma.chapters.findUnique({
        where: { Id: parseInt(id) },
        include: { Comics: true }
    });

    if (!chapter) return res.status(404).json({ error: "Không tìm thấy chapter" });

    const result = await crawlChapterImages(id, url || chapter.SourceUrl);
    
    const comicName = chapter.Comics ? chapter.Comics.Title : "Unknown";
    const logDesc = `Re-crawl: ${comicName} - Chap ${chapter.ChapterNumber} (${result.total || 0} ảnh)`;
    await logActivity('CRAWL', 'Chapter', id, logDesc);

    res.status(200).json({ 
        message: 'Re-crawl thành công!', 
        data: result 
    });

  } catch (error) {
    console.error("❌ Lỗi Re-crawl:", error);
    await logActivity('CRAWL', 'Chapter', req.params.id, `Lỗi Crawl: ${error.message}`, 'ERROR');
    res.status(500).json({ error: 'Lỗi Crawl: ' + error.message });
  }
};

// ==========================================
// [POST] Bulk Crawl
// ==========================================
const crawlBulk = async (req, res) => {
    const { chapterIds } = req.body;
    
    if (!chapterIds || chapterIds.length === 0) {
        return res.status(400).json({ message: "Chưa chọn chapter nào!" });
    }

    res.json({ message: `Đã tiếp nhận! Hệ thống đang crawl ${chapterIds.length} chapter trong nền...` });

    for (const id of chapterIds) {
        try {
            const chap = await prisma.chapters.findUnique({ 
                where: { Id: id },
                include: { Comics: true } 
            });
            
            if (chap && chap.SourceUrl) {
                const result = await crawlChapterImages(id, chap.SourceUrl);
                const comicName = chap.Comics ? chap.Comics.Title : "Unknown";
                const logDesc = `Auto Crawl: ${comicName} - Chap ${chap.ChapterNumber} (${result.total} ảnh)`;
                await logActivity('CRAWL', 'Chapter', id, logDesc);
            }
        } catch (err) {
            console.error(`❌ Lỗi crawl chap ${id}:`, err.message);
            await logActivity('CRAWL', 'Chapter', id, `Lỗi Bulk: ${err.message}`, 'ERROR');
        }
    }
};

// ==========================================
// [POST] Create Comic
// ==========================================
const createComic = async (req, res) => {
  try {
    const data = req.body;
    console.log("📥 Đang nhận yêu cầu tạo truyện:", data.title);

    if (!data.title || !data.slug) {
      return res.status(400).json({ error: "Thiếu tên truyện hoặc Slug" });
    }

    const newComic = await prisma.comics.create({
      data: {
        Title: data.title,
        Slug: data.slug,
        Author: data.author,
        Description: data.description,
        Category: data.category,
        CoverImage: data.coverImage,
        BannerImage: data.bannerImage,
        IsFeatured: data.isFeatured ? true : false,
      }
    });

    await logActivity('CREATE', 'Comic', newComic.Id, `Đã thêm truyện mới: ${newComic.Title}`);
    console.log("✅ Đã lưu vào DB với ID:", newComic.Id); 
    
    return res.status(201).json({ 
      message: "Tạo truyện thành công!", 
      data: newComic 
    });

  } catch (error) {
    console.error("❌ Lỗi createComic:", error);
    if (error.code === 'P2002') {
      return res.status(409).json({ error: "Truyện hoặc Slug này đã tồn tại!" });
    }
    return res.status(500).json({ error: "Lỗi Server: " + error.message });
  }
};

// ==========================================
// [PUT] Update Comic
// ==========================================
const updateComic = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;

    if (isNaN(parseInt(id))) return res.status(400).json({ error: "ID không hợp lệ" });

    console.log(`📝 Đang cập nhật truyện ID ${id}...`);

    const updatedComic = await prisma.comics.update({
      where: { Id: parseInt(id) },
      data: {
        Title: data.title,
        Author: data.author,
        Description: data.description,
        Category: data.category,
        CoverImage: data.coverUrl,
        BannerImage: data.bannerImage, 
        IsFeatured: Boolean(data.isFeatured),
        UpdatedAt: new Date()
      }
    });
    
    await logActivity('UPDATE', 'Comic', id, `Cập nhật thông tin truyện: ${updatedComic.Title}`);

    return res.status(200).json({ 
      message: "Cập nhật thành công!", 
      data: updatedComic 
    });

  } catch (error) {
    console.error("❌ Lỗi updateComic:", error);
    return res.status(500).json({ error: "Lỗi Server: " + error.message });
  }
};

// ==========================================
// [POST] Create Bulk Chapters
// ==========================================
const createBulkChapters = async (req, res) => {
  try {
    const { comicId, start, end } = req.body;
    const startNum = parseFloat(start);
    const endNum = parseFloat(end);
    const cId = parseInt(comicId);

    if (isNaN(startNum) || isNaN(endNum) || isNaN(cId)) return res.status(400).json({ error: "Dữ liệu không hợp lệ" });
    if (startNum < 0 || endNum < 0) return res.status(400).json({ error: "Số chương không được là số âm!" });
    if (startNum > endNum) return res.status(400).json({ error: "Chương bắt đầu phải nhỏ hơn hoặc bằng chương kết thúc" });

    const existingChapters = await prisma.chapters.findMany({
        where: {
            ComicId: cId,
            ChapterNumber: { gte: startNum, lte: endNum }
        },
        select: { ChapterNumber: true }
    });

    const existingSet = new Set(existingChapters.map(c => c.ChapterNumber));
    const chaptersToCreate = [];
    
    for (let i = startNum; i <= endNum; i++) {
        if (!existingSet.has(i)) {
            chaptersToCreate.push({
                ComicId: cId,
                ChapterNumber: i,
                Title: `Chapter ${i}`,
                Status: 'PENDING'
            });
        }
    }

    if (chaptersToCreate.length > 0) {
        await prisma.chapters.createMany({ data: chaptersToCreate });
        
        // Lấy tên truyện để ghi log cho đẹp
        const comic = await prisma.comics.findUnique({ where: { Id: cId } });
        await logActivity('CREATE', 'Chapter', cId, `Bulk Create: ${comic?.Title || 'Truyện'} (Chap ${startNum}-${endNum})`);
    }

    return res.status(200).json({ 
        message: "Hoàn tất xử lý!", 
        totalRequest: endNum - startNum + 1,
        created: chaptersToCreate.length,
        skipped: existingSet.size 
    });

  } catch (error) {
    console.error("❌ Lỗi createBulkChapters:", error);
    return res.status(500).json({ error: "Lỗi Server: " + error.message });
  }
};

// ==========================================
// [DELETE] /api/admin/comics/:id
// ==========================================
const deleteComic = async (req, res) => {
  try {
    const { id } = req.params;
    
    // 👇 BƯỚC QUAN TRỌNG: Lấy thông tin truyện TRƯỚC khi xóa để có cái mà ghi Log
    const comic = await prisma.comics.findUnique({ 
        where: { Id: parseInt(id) } 
    });

    if (!comic) return res.status(404).json({ error: "Không tìm thấy truyện" });

    // Xóa trong Database
    await prisma.comics.delete({
      where: { Id: parseInt(id) }
    });
    
    // Giờ biến 'comic' đã có dữ liệu, ghi log sẽ không bị lỗi
    await logActivity('DELETE', 'Comic', id, `Đã xóa truyện: ${comic.Title}`, 'WARNING');

    return res.status(200).json({ message: "Đã xóa truyện thành công!" });
  } catch (error) {
    console.error("❌ Lỗi deleteComic:", error);
    return res.status(500).json({ error: "Lỗi Server: " + error.message });
  }
};

// ==========================================
// DASHBOARD
// ==========================================
const getDashboardStats = async (req, res) => {
  try {
    const [
        totalComics, 
        totalChapters, 
        totalImages, 
        recentLogs, 
        featuredComics
    ] = await Promise.all([
        prisma.comics.count(), 
        prisma.chapters.count(), 
        prisma.chapterImages.count(), 
        prisma.systemLogs.findMany({
            take: 10,
            orderBy: { CreatedAt: 'desc' }
        }),
        prisma.comics.count({ where: { IsFeatured: true } })
    ]);

    const estimatedSizeGB = (totalImages * 0.3 / 1024).toFixed(2); 

    res.status(200).json({
        counts: {
            comics: totalComics,
            chapters: totalChapters,
            images: totalImages,
            featured: featuredComics,
            diskUsage: estimatedSizeGB
        },
        recents: recentLogs.map(log => ({
            id: log.Id,
            action: log.Action,
            targetType: log.TargetType,
            description: log.Description,
            level: log.Level,
            createdAt: log.CreatedAt
        }))
    });

  } catch (error) {
    console.error("❌ Lỗi Dashboard Stats:", error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getComicsList, getComicDetail, getChapterImages, updateChapter, deleteChapter, reCrawlChapter, crawlBulk, createComic, updateComic, createBulkChapters, deleteComic, getDashboardStats, logActivity,
};