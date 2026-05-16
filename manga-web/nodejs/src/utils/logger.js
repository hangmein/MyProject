// src/utils/logger.js
const prisma = require('../config/prisma');

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
        // Không throw error để tránh làm chết luồng chính
    }
};

module.exports = logActivity;