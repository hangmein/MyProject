const prisma = require('../config/prisma');

// 1. Lấy danh sách Report (Cho Admin xem)
const getReports = async (req, res) => {
    try {
        const reports = await prisma.reports.findMany({
            orderBy: [
                { Status: 'asc' }, // PENDING lên đầu
                { CreatedAt: 'desc' }
            ],
            include: {
                Comics: { select: { Title: true } },
                Chapters: { select: { ChapterNumber: true } }
            }
        });
        res.status(200).json(reports);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 2. Gửi Report (API này sẽ được gọi từ trang Đọc truyện của User)
const createReport = async (req, res) => {
    try {
        const { content, comicId, chapterId } = req.body;
        
        await prisma.reports.create({
            data: {
                Content: content,
                ComicId: comicId ? parseInt(comicId) : null,
                ChapterId: chapterId ? parseInt(chapterId) : null
            }
        });

        res.status(201).json({ message: "Cảm ơn bạn đã báo lỗi!" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 3. Xử lý Report (Admin bấm Xong hoặc Xóa)
const handleReport = async (req, res) => {
    try {
        const { id } = req.params;
        const { action } = req.body; // 'resolve' hoặc 'delete'

        if (action === 'delete') {
            await prisma.reports.delete({ where: { Id: parseInt(id) } });
            return res.status(200).json({ message: "Đã xóa báo cáo" });
        }

        if (action === 'resolve') {
            await prisma.reports.update({
                where: { Id: parseInt(id) },
                data: { Status: 'RESOLVED', ResolvedAt: new Date() }
            });
            return res.status(200).json({ message: "Đã xử lý xong" });
        }

        res.status(400).json({ error: "Hành động không hợp lệ" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { getReports, createReport, handleReport };