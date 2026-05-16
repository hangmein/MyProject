import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        try {
            // Gọi API Login
            // Lưu ý: Đổi URL nếu server bạn khác port
            const res = await axios.post('http://localhost:3000/api/auth/login', {
                username,
                password
            });

            // Lưu Token vào LocalStorage (Bộ nhớ trình duyệt)
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('user', JSON.stringify(res.data.user));

            // Chuyển hướng vào Dashboard
            alert("Đăng nhập thành công!");
            navigate('/dashboard');

        } catch (err) {
            setError(err.response?.data?.error || "Lỗi đăng nhập");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-900">
            <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-xl w-full max-w-md border border-slate-200 dark:border-slate-700">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-blue-600 mb-2">MangaAdmin</h1>
                    <p className="text-slate-500">Đăng nhập hệ thống quản trị</p>
                </div>

                {error && <div className="bg-red-100 text-red-600 p-3 rounded-lg mb-4 text-sm font-medium text-center">{error}</div>}

                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Tài khoản</label>
                        <input 
                            type="text" 
                            className="w-full p-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-transparent dark:text-white focus:outline-none focus:border-blue-500"
                            placeholder="Nhập username..."
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Mật khẩu</label>
                        <input 
                            type="password" 
                            className="w-full p-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-transparent dark:text-white focus:outline-none focus:border-blue-500"
                            placeholder="Nhập mật khẩu..."
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-all shadow-lg shadow-blue-500/30">
                        Đăng Nhập
                    </button>
                </form>
            </div>
        </div>
    );
};

export default LoginPage;