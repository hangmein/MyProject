import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const PrivateRoute = () => {
    // Lấy token từ bộ nhớ trình duyệt
    const token = localStorage.getItem('token');

    // Nếu có token thì cho đi tiếp vào các Route con (Outlet)
    // Nếu không có token thì đá về trang Login
    return token ? <Outlet /> : <Navigate to="/login" replace />;
};

export default PrivateRoute;