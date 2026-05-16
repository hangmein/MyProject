const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

// Hàm tạo độ trễ (Sleep)
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

(async () => {
    console.log("🚀 Đang khởi động trình duyệt...");

    const browser = await puppeteer.launch({ 
        headless: false,
        defaultViewport: null, 
        args: ['--start-maximized'] 
    });
    
    const page = await browser.newPage();
    
    // User-Agent xịn để giả danh
    const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
    await page.setUserAgent(userAgent);

    const url = 'https://bato.si/title/54473/930166-ch_327'; 
    console.log(`🌐 Đang truy cập: ${url}`);

    try {
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });

        console.log("⬇️ Đang cuộn trang...");
        await autoScroll(page);

        // Lấy link ảnh
        const imageUrls = await page.evaluate(() => {
            const images = document.querySelectorAll('img');
            return Array.from(images)
                .map(img => img.src)
                .filter(src => src && src.startsWith('http') && !src.includes('avatar') && !src.includes('logo'));
        });

        console.log(`✅ TÌM THẤY ${imageUrls.length} ẢNH.`);
        
        // Tạo thư mục
        const downloadFolder = path.join(__dirname, 'downloads', 'chapter_327');
        if (!fs.existsSync(downloadFolder)) fs.mkdirSync(downloadFolder, { recursive: true });

        // --- VÒNG LẶP TẢI ẢNH (ĐÃ NÂNG CẤP) ---
        for (let i = 0; i < imageUrls.length; i++) {
            const imageUrl = imageUrls[i];
            const ext = path.extname(imageUrl.split('?')[0]) || '.jpg';
            const fileName = `pic${i + 1}${ext}`;
            const filePath = path.join(downloadFolder, fileName);

            console.log(`⬇️ [${i + 1}/${imageUrls.length}] Đang tải ảnh...`);
            
            try {
                // Tải ảnh
                await downloadImage(imageUrl, filePath, userAgent, url); // Truyền thêm url gốc làm Referer
                
                // QUAN TRỌNG: Nghỉ 3 giây sau mỗi lần tải để Server không chặn
                console.log("   ...Nghỉ 3 giây...");
                await delay(3000); 

            } catch (err) {
                console.error(`❌ Lỗi tải ảnh ${i + 1}: ${err.message}`);
                // Nếu lỗi thì nghỉ lâu hơn chút (5 giây) rồi đi tiếp, không dừng tool
                await delay(5000); 
            }
        }

        console.log("-------------------------------------------------");
        console.log(`🎉 HOÀN TẤT!`);

    } catch (error) {
        console.error("❌ LỖI CHÍNH:", error.message);
    } finally {
        setTimeout(async () => { await browser.close(); }, 5000);
    }
})();

// --- HÀM TẢI ẢNH ---
async function downloadImage(url, filepath, userAgent, refererUrl) {
    const writer = fs.createWriteStream(filepath);

    const response = await axios({
        url,
        method: 'GET',
        responseType: 'stream',
        headers: {
            'User-Agent': userAgent,
            'Referer': refererUrl, // Báo cho server biết mình đến từ trang bato.si
            'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
        }
    });

    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
        writer.on('finish', resolve);
        writer.on('error', reject);
    });
}

// --- HÀM CUỘN TRANG ---
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
            }, 100);
        });
    });
}