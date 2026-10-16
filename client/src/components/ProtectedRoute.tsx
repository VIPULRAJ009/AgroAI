import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = () => {
    const isAuthenticated = localStorage.getItem("token") !== null;

    return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
