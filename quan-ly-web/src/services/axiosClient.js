import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api/admin';

export const mangaService = {
    getAll: () => axios.get(`${API_BASE_URL}/comics/list`),
    getById: (id) => axios.get(`${API_BASE_URL}/comics/${id}`),
    deleteChapter: (id) => axios.delete(`${API_BASE_URL}/chapters/${id}`),
    // ... thêm các hàm crawl, update khác
};