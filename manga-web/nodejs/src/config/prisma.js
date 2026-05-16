const { PrismaClient } = require('@prisma/client');

// Khởi tạo Client (Chìa khóa nhà)
const prisma = new PrismaClient();

// Xuất cái chìa khóa này ra để các file khác dùng chung
module.exports = prisma;