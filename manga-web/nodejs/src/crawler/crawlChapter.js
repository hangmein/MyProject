// D:\MyProject\manga-web\nodejs\src\crawler\crawlChapter.js

const puppeteer = require('puppeteer');
const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// --- HÀM TẢI ẢNH THÔNG MINH (SMART DOWNLOAD) ---
async function downloadImageSmart(url, finalPath, referer) {
    const tempPath = `${finalPath}.tmp`; // Tải vào file .tmp trước
    const writer = fs.createWriteStream(tempPath);

    try {
        const response = await axios({
            url,
            method: 'GET',
            responseType: 'stream',
            timeout: 10000, // Timeout 10s để tránh treo
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Referer': referer
            }
        });

        response.data.pipe(writer);

        await new Promise((resolve, reject) => {
            writer.on('finish', resolve);
            writer.on('error', reject);
        });

        // --- KIỂM TRA CHẤT LƯỢNG ẢNH MỚI ---
        const stats = await fs.stat(tempPath);
        
        // 1. Nếu file quá nhẹ (< 3KB) -> Khả năng cao là ảnh lỗi hoặc icon "Not Found"
        if (stats.size < 3000) {
            console.warn(`⚠️ Ảnh tải về quá nhỏ (${stats.size} bytes). Bỏ qua, giữ ảnh cũ.`);
            await fs.unlink(tempPath); // Xóa file tạm
            return false; // Báo thất bại để không ghi đè
        }

        // 2. Nếu file tốt -> Ghi đè lên file thật
        await fs.move(tempPath, finalPath, { overwrite: true });
        return true; // Thành công

    } catch (error) {
        // Nếu lỗi mạng hoặc 404...
        // console.error(`⚠️ Lỗi tải: ${error.message}`);
        writer.close();
        if (await fs.pathExists(tempPath)) {
            await fs.unlink(tempPath); // Dọn dẹp file tạm
        }
        return false; // Giữ nguyên ảnh cũ
    }
}

// --- HÀM AUTO SCROLL ---
async function autoScroll(page) {
    await page.evaluate(async () => {
        await new Promise((resolve) => {
            let totalHeight = 0;
            const distance = 100;
            const timer = setInterval(() => {
                const scrollHeight = document.body.scrollHeight;
                window.scrollBy(0, distance);
                totalHeight += distance;
                if (totalHeight >= scrollHeight - window.innerHeight) {
                    clearInterval(timer);
                    resolve();
                }
            }, 50);
        });
    });
}

// --- HÀM CHÍNH: CRAWL CHAPTER (CHẾ ĐỘ MERGE + CHECK LỖI) ---
const crawlChapterImages = async (chapterId, newUrl = null) => {
    console.log(`🤖 [Crawler] Bắt đầu xử lý Chapter ID: ${chapterId}`);

    // 1. Lấy thông tin
    const chapter = await prisma.chapters.findUnique({
        where: { Id: parseInt(chapterId) },
        include: { Comics: true }
    });

    if (!chapter || !chapter.Comics) throw new Error("Không tìm thấy dữ liệu Chapter/Comic!");

    let targetUrl = newUrl || chapter.SourceUrl;
    if (!targetUrl) throw new Error("Link nguồn trống!");

    if (newUrl && newUrl !== chapter.SourceUrl) {
        await prisma.chapters.update({ where: { Id: chapter.Id }, data: { SourceUrl: newUrl } });
    }

    const referer = new URL(targetUrl).origin + "/"; 

    // 2. Chuẩn bị đường dẫn
    let comicSlug = chapter.Comics.Slug;
    if (!comicSlug && chapter.Comics.Title) {
        comicSlug = chapter.Comics.Title.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, '-');
    }
    const chapterNum = chapter.ChapterNumber;
    const folderName = `chapter-${chapterNum}`;
    const uploadPath = path.join(__dirname, '../../manga', comicSlug, 'chapters', folderName);
    
    await fs.ensureDir(uploadPath); // Chỉ tạo folder, KHÔNG xóa cũ

    // 3. Khởi động Puppeteer
    const browser = await puppeteer.launch({ 
        headless: "new",
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    try {
        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
        
        console.log(`🌐 Đang truy cập: ${targetUrl}`);
        await page.goto(targetUrl, { waitUntil: 'networkidle2', timeout: 120000 });
        
        console.log("📜 Đang cuộn trang...");
        await autoScroll(page);
        await new Promise(r => setTimeout(r, 2000));

        // 4. Lấy link ảnh
        const imageUrls = await page.evaluate(() => {
            const imgs = document.querySelectorAll('img');
            return Array.from(imgs)
                .map(img => img.src)
                .filter(src => src && src.startsWith('http') && !src.includes('logo') && !src.includes('icon'));
        });
        const uniqueImages = [...new Set(imageUrls)];
        console.log(`✅ Tìm thấy ${uniqueImages.length} ảnh mới từ nguồn.`);

        // 5. TẢI ẢNH (CHẾ ĐỘ AN TOÀN)
        let downloadCount = 0;
        for (let i = 0; i < uniqueImages.length; i++) {
            const url = uniqueImages[i];
            const ext = path.extname(new URL(url).pathname) || '.jpg';
            const fileName = `pic${i + 1}${ext}`;
            const finalPath = path.join(uploadPath, fileName);

            // Gọi hàm tải thông minh
            const isSuccess = await downloadImageSmart(url, finalPath, referer);
            if (isSuccess) downloadCount++;
            
            // In dấu chấm để biết tiến độ
            process.stdout.write(isSuccess ? '+' : '.');
        }
        console.log(`\n⬇️ Đã tải thành công/cập nhật ${downloadCount} ảnh.`);

        // 6. ĐỒNG BỘ DATABASE
        console.log("🔄 Đang đồng bộ lại Database...");
        
        const allFiles = await fs.readdir(uploadPath);
        const sortedImages = allFiles
            .filter(file => /\.(jpg|jpeg|png|webp)$/i.test(file))
            .sort((a, b) => {
                const numA = parseInt(a.match(/\d+/)) || 0;
                const numB = parseInt(b.match(/\d+/)) || 0;
                return numA - numB;
            });

        // Xóa data cũ trong DB
        await prisma.chapterImages.deleteMany({ where: { ChapterId: chapter.Id } });

        // Insert lại danh sách thực tế
        let dbCount = 0;
        for (let i = 0; i < sortedImages.length; i++) {
            const fileName = sortedImages[i];
            const dbPath = `/manga/${comicSlug}/chapters/${folderName}/${fileName}`;
            
            await prisma.chapterImages.create({
                data: {
                    ChapterId: chapter.Id,
                    ImageUrl: dbPath,
                    PageNumber: i + 1
                }
            });
            dbCount++;
        }

        console.log(`🎉 HOÀN TẤT! Tổng số trang hiện có: ${dbCount}`);
        return { success: true, total: dbCount };

    } catch (error) {
        console.error("❌ Lỗi Crawl:", error);
        throw error;
    } finally {
        await browser.close();
    }
};

module.exports = { crawlChapterImages };