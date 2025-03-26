import './css/MyPage.css';
import { Link, useNavigate } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from './components/Sidebar';
function MyPage() {
    const [userInfo, setUserInfo] = useState({
        nickname: '',
        balance: 0,  // 기본값을 0으로 설정
        profileImage: '/images/userImage.jpg'
    });
    const navigate = useNavigate(); // 페이지 이동을 위한 훅

    const [gpayInfo, setGpayInfo] = useState(null);

    // 상태 관리
    const [loading, setLoading] = useState(true); // 로딩 상태
    const [error, setError] = useState(null); // 에러 상태

    const fetchUserInfo = async () => {
        const userData = {
            userId: localStorage.getItem('userId')
        }
        try {
            const response = await axios.post('/user/info', userData, {
                headers: {
                    headers: { "Content-Type": "application/json" }
                }
            });
            // 응답에 balance가 없을 경우 기본값 사용
            setUserInfo(response.data);
            console.log(response.data);
        } catch (error) {
            console.error("사용자 정보 가져오기 실패:", error);
        }
    };


    useEffect(() => {
        // 서버에서 G-PAY 데이터 가져오기
        if (!userInfo || !userInfo.userId) return;

        const fetchGpayInfo = async () => {

            try {
                const userId = { userId: userInfo.userId } //현재접속한 유저아이디로 조회

                const response = await axios.post("/api/getGpayInfo",
                    userId,
                    {
                        headers: { 'Content-Type': 'application/json' }
                    }
                );
                if (typeof response.data === "object") {
                    console.log(response.data);
                    setGpayInfo(response.data);
                    setLoading(false); // 로딩 끝
                } else {
                    setError(response.data);
                }
            } catch (err) {
                if (err.response && err.response.status === 404) {
                    setError("해당 유저의 G-pay 정보가 없습니다.");
                    console.log("유저 정보 없음(충전 한 적이 없음.)");
                } else {
                    setError(err.message);
                }
            } finally {
                setLoading(false);
            }
        };
        fetchGpayInfo();
    }, [userInfo]); // buyUser가 변경되면 다시 실행


    useEffect(() => {
        fetchUserInfo();
    }, []);
    // 회원탈퇴 처리 함수
    const handleWithdraw = async () => {
        if (window.confirm("정말 회원탈퇴 하시겠습니까? 이 작업은 되돌릴 수 없습니다.")) {
            try {
                await axios.delete('/user/withdraw', {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                });
                alert("회원탈퇴가 완료되었습니다.");
                localStorage.removeItem('token'); // 토큰 삭제
                navigate('/'); // 홈페이지로 리다이렉트
            } catch (error) {
                console.error("회원탈퇴 실패:", error);
                alert("회원탈퇴에 실패했습니다.");
            }
        }
    };
    // 금액 충전 팝업창 열기 함수
    const openChargePopup = () => {
        window.open(
            '/gpayCharge', // 새 창에서 열 URL (React Router로 이동)
            'gpayCharge', // 팝업창 이름
            'width=500,height=600,left=500,top=200,resizable=no,scrollbars=no'
        );
    };
    return (
        <div className="mypageContainer">
            <div className="mypageSide">
                <Sidebar />
                <div className="dashboard">
                    <div className="card">
                        <div className="profile-image">
                            {/* {userInfo.profileImage && ( */}
                            <img
                                src="/images/userImage.jpg"
                                alt="프로필 이미지"
                                style={{ width: "100%", height: "100%", borderRadius: "50%" }}
                            />
                            {/* )} */}
                        </div>
                        <div className="profile-info">
                            <p>{userInfo.nickname}</p>
                            {/* 옵셔널 체이닝 연산자(?.)를 사용하여 undefined일 가능성 처리 */}
                            <p className="balance">g-pay 잔액: {gpayInfo?.nowProperty?.toLocaleString() || '0'}원</p>
                        </div>
                        <button onClick={openChargePopup}>금액 충전</button>
                        <Link to="/Profile">
                            <button id="profile-change">프로필 수정</button>
                        </Link>
                    </div>
                    <div className="card">
                        개인정보
                        <Link to="/userinfo">
                            <button>수정</button>
                        </Link>
                        <button className="withdraw-btn" onClick={handleWithdraw}>회원탈퇴</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default MyPage;