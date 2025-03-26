import './css/Footer.css';

function Footer() {
    return (
        <footer className="footer-container">
            <div className="footer-content">
                {/* 로고 */}
                <div className="footer-logo">
                    <img src="/images/gcLogo.png" alt="GreenConnect Logo" />
                </div>

                {/* 네비게이션 */}
                <div className="footer-links">
                    <a href="/about">회사 소개</a>
                    <a href="/terms">이용 약관</a>
                    <a href="/privacy">개인정보 처리방침</a>
                    <a href="/contact">문의하기</a>
                </div>

                {/* SNS 아이콘 */}
                <div className="footer-social">
                    <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
                        <img src="/images/facebook.png" alt="Facebook" />
                    </a>
                    <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
                        <img src="/images/twitticon.png" alt="Twitter" />
                    </a>
                    <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
                        <img src="/images/insticon.jpg" alt="Instagram" />
                    </a>
                </div>
            </div>

            {/* 저작권 정보 */}
            <div className="footer-bottom">
                <p>© 2025 GreenConnect. All rights reserved.</p>
            </div>
        </footer>
    );
}

export default Footer;