const comicService = require('../services/comicService');

// [GET] /api/comics
const getComics = async (req, res) => {
  try {
    const comics = await comicService.getAllComics();
    res.status(200).json(comics);
  } catch (error) {
    console.error("Lỗi Controller:", error);
    res.status(500).json({ error: 'Lỗi khi lấy danh sách truyện: ' + error.message });
  }
};

// [GET] /api/comics/featured
const getFeatured = async (req, res) => {
  try {
    const comic = await comicService.getFeaturedComic();
    res.status(200).json(comic);
  } catch (error) {
    res.status(500).json({ error: 'Lỗi lấy banner: ' + error.message });
  }
};

// [GET] /api/comics/:slug
const getDetail = async (req, res) => {
  try {
    const { slug } = req.params;
    const comic = await comicService.getComicBySlug(slug);
    
    if (!comic) return res.status(404).json({ error: 'Truyện không tồn tại' });
    
    res.status(200).json(comic);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// [GET] /api/comics/:slug/chapter/:chapterNumber
// 👇 HÀM QUAN TRỌNG: Trả về Object đầy đủ cho Frontend đỡ xoay
const readChapter = async (req, res) => {
  try {
    const { slug, chapterNumber } = req.params;
    const currentChapNum = parseFloat(chapterNumber);

    // 1. Lấy thông tin truyện
    const comic = await comicService.getComicBySlug(slug);
    if (!comic) {
      return res.status(404).json({ error: 'Không tìm thấy truyện' });
    }

    // 2. Lấy danh sách ảnh
    const images = await comicService.getChapterImages(slug, chapterNumber);

    // 3. Tính toán Next/Prev
    const chapters = comic.Chapters || [];
    const currentIndex = chapters.findIndex(c => c.ChapterNumber === currentChapNum);

    let nextChap = null;
    let prevChap = null;

    if (currentIndex !== -1) {
      if (currentIndex > 0) nextChap = chapters[currentIndex - 1].ChapterNumber;
      if (currentIndex < chapters.length - 1) prevChap = chapters[currentIndex + 1].ChapterNumber;
    }

    // 4. Trả về cấu trúc Frontend cần
    const responseData = {
      comicName: comic.Title,
      chapter: { ChapterNumber: currentChapNum },
      images: images,
      navigation: { prev: prevChap, next: nextChap },
      allChapterNumbers: chapters.map(c => c.ChapterNumber)
    };

    res.status(200).json(responseData);

  } catch (error) {
    console.error("Lỗi đọc chương:", error);
    res.status(500).json({ error: 'Lỗi khi tải chương: ' + error.message });
  }
};

module.exports = {
  getComics,
  getFeatured,
  getDetail,
  readChapter
};