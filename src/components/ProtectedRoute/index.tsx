import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const ProtectedRoute = ({ children }: React.PropsWithChildren) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // 인증 상태 로딩 중에는 로딩 상태 표시
  if (isLoading) {
    return <div>인증 정보를 확인하는 중입니다...</div>;
  }

  // 인증되지 않은 경우 로그인 페이지로 리다이렉트
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 인증된 경우 자식 라우트 렌더링
  return <>{children ?? <Outlet />}</>;
};

export default ProtectedRoute;
