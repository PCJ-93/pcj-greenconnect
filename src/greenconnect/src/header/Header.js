import React from "react";
import { useNavigate } from "react-router-dom";
import './css/Header.css';

function Header() {
    const navigate = useNavigate();
    const userId = localStorage.getItem("userId");

    const handleLogout = () => {
        localStorage.removeItem("userId");
        navigate("/");
    };

    return (
        <div className="headerMainContainer">
            {/* 왼쪽: 로고 (클릭 시 홈으로 이동) */}
            <div className="header-left" onClick={() => navigate("/")}>
                <img src="/images/gcLogo.png" alt="Logo" className="header-logo" />
            </div>

            {/* 오른쪽: 로그인/회원가입 또는 마이페이지 버튼 */}
            <div className="header-right">
                {!userId ? (
                    <>
                        <button className="header-button" onClick={() => navigate("/login")}>
                            Login
                        </button>
                        <button className="header-button" onClick={() => navigate("/signup")}>
                            Sign Up
                        </button>
                    </>
                ) : (
                    <>
                        <button className="header-button" onClick={() => navigate("/mypage")}>
                            My Page
                        </button>
                        <button className="header-button" onClick={handleLogout}>
                            Logout
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}

export default Header;