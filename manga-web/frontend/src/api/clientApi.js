// src/api/clientApi.js
import axios from 'axios';

// Địa chỉ backend của bạn
const BASE_URL = 'http://localhost:3000/api';

const clientApi = {
    // --- TRANG CHỦ (HOME) ---
    // Lấy danh sách tất cả truyện
    getComics: () => {
        return axios.get(`${BASE_URL}/comics`);
    },

    // Lấy truyện nổi bật (Banner)
    getFeaturedComic: () => {
        return axios.get(`${BASE_URL}/comics/featured`);
    },

    // --- TRANG CHI TIẾT & ĐỌC TRUYỆN ---
    // Lấy thông tin chi tiết một truyện (theo slug)
    getComicDetail: (slug) => {
        return axios.get(`${BASE_URL}/comics/${slug}`);
    },

    // Lấy nội dung chương truyện (Ảnh, Next/Prev, ID chapter...)
    getChapterContent: (slug, chapterNumber) => {
        return axios.get(`${BASE_URL}/comics/${slug}/chapter/${chapterNumber}`);
    },

    // --- TIỆN ÍCH KHÁC ---
    // Gửi báo lỗi (Report)
    // Lưu ý: Backend bạn đang để route là /api/admin/reports
    sendReport: (data) => {
        return axios.post(`${BASE_URL}/admin/reports`, data);
    },
};

export default clientApi;