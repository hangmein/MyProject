// src/controllers/authController.js
const prisma = require('../config/prisma');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Khóa bí mật (Sau này nên để trong file .env)
const JWT_SECRET = 'mat-khau-bi-mat-cua-admin-cms-123'; 

// 1. Đăng ký (Để tạo tài khoản Admin đầu tiên)
const register = async (req, res) => {
    try {
        const { username, password, fullName } = req.body;

        // Kiểm tra trùng tên
        const existingUser = await prisma.users.findUnique({ where: { Username: username } });
        if (existingUser) return res.status(400).json({ error: "Tài khoản đã tồn tại" });

        // Mã hóa mật khẩu
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Tạo user
        const newUser = await prisma.users.create({
            data: {
                Username: username,
                Password: hashedPassword,
                FullName: fullName
            }
        });

        res.status(201).json({ message: "Tạo tài khoản thành công!", user: newUser.Username });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 2. Đăng nhập
const login = async (req, res) => {
    try {
        const { username, password } = req.body;

        // Tìm user
        const user = await prisma.users.findUnique({ where: { Username: username } });
        if (!user) return res.status(400).json({ error: "Sai tài khoản hoặc mật khẩu" });

        // So sánh mật khẩu (Mật khẩu nhập vs Mật khẩu mã hóa trong DB)
        const isMatch = await bcrypt.compare(password, user.Password);
        if (!isMatch) return res.status(400).json({ error: "Sai tài khoản hoặc mật khẩu" });

        // Tạo Token
        const token = jwt.sign(
            { id: user.Id, username: user.Username }, 
            JWT_SECRET, 
            { expiresIn: '1d' } // Token hết hạn sau 1 ngày
        );

        res.status(200).json({
            message: "Đăng nhập thành công",
            token: token,
            user: { username: user.Username, fullName: user.FullName }
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { register, login };