import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import './css/MainPage.css';

function MainPage() {

    const navigate = useNavigate();
    const [isScrolled, setIsScrolled] = useState(true);
    const userId = localStorage.getItem("userId");

    useEffect(() => {
        const handleScroll = () => {
            // 스크롤이 100px 이상 내려가면 버튼을 표시
            if (window.scrollY >= 0) {
                setIsScrolled(true);
            } else {
                setIsScrolled(false);
            }
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <div className="main-container">

            <video autoPlay loop muted className="background-video">
                <source src="/videos/217958_small.mp4" type="video/mp4" />
                Your browser does not support the video tag.
            </video>

            <h1>Green Connect</h1>
            <p>Welcome to Green Connect!</p>

            <div className="button-container">
                {!userId ? (
                    <button onClick={() => navigate("/login")}>Login</button>
                ) : (
                    <button onClick={() => navigate("/mypage")}>My Page</button>
                )}
            </div>

            {isScrolled && (
                <div className="scroll-button">
                    <button onClick={() => navigate("/postList")}>View Sale Posts</button>
                </div>
            )}
        </div>
    )
}

export default MainPage;