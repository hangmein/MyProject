import axios from 'axios';

// Đường dẫn dành riêng cho Admin
const BASE_URL = 'http://localhost:3000/api/admin';

const adminApi = {
    // --- CÁC HÀM CŨ (Đã chạy ổn) ---
    getAllComics: () => axios.get(`${BASE_URL}/comics/list`),
    getComicDetail: (id) => axios.get(`${BASE_URL}/comics/${id}`),
    getChapterImages: (chapId) => axios.get(`${BASE_URL}/chapters/${chapId}/images`),
    crawlChapter: (chapId) => axios.post(`${BASE_URL}/chapters/${chapId}/crawl`),
    updateChapterSource: (chapId, url) => axios.put(`${BASE_URL}/chapters/${chapId}`, { sourceUrl: url }),
    deleteChapter: (chapId) => axios.delete(`${BASE_URL}/chapters/${chapId}`),

    // --- SỬA LẠI 2 HÀM NÀY (Dùng axios trực tiếp để tránh lỗi) ---
    
    // 1. Hàm Crawl nhiều chapter
    crawlBulk: (chapterIds) => axios.post(`${BASE_URL}/chapters/crawl-bulk`, { chapterIds }),

    // 2. Hàm Update Link (Quan trọng cho Auto Link)
    updateChapter: (id, data) => axios.put(`${BASE_URL}/chapters/${id}`, data),

    createComic: (data) => axios.post(`${BASE_URL}/comics`, data),
    updateComicInfo: (id, data) => axios.put(`${BASE_URL}/comics/${id}`, data),
    
    createBulkChapters: (data) => axios.post(`${BASE_URL}/chapters/bulk-create`, data),

    deleteComic: (id) => axios.delete(`${BASE_URL}/comics/${id}`),

    getDashboardStats: () => axios.get(`${BASE_URL}/dashboard`),

    // --- HÀM report (Nếu cần) ---
    getAllReports: () => axios.get(`${BASE_URL}/reports`),
    handleReport: (id, action) => axios.put(`${BASE_URL}/reports/${id}`, { action }),
    sendTestReport: (data) => axios.post(`${BASE_URL}/reports`, data), // Hàm này để test
};

export default adminApi;