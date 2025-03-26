import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import CommonPay from "./CommonPay";
import './css/GpayCharge.css';
import axios from "axios";


function GpayCharge() {

    const navigate = useNavigate();

    const [buyUser, setBuyUser] = useState(null);
    const [gpayInfo, setGpayInfo] = useState(null);
    const buyData = {
        postPrice: 0
    }

    // 상태 관리
    const [loading, setLoading] = useState(true); // 로딩 상태
    const [error, setError] = useState(null); // 에러 상태

    // 서버에 보낼 데이터들
    const [isApplied, setIsApplied] = useState(false); // 소득공제 신청 여부
    const [receiptType, setReceiptType] = useState(null); // 개인소득공제용 or 사업자증빙용
    const [receiptPhoneNum, setReceiptPhoneNum] = useState(null); // 개인소득공제용 폰번호
    const [receiptBusinessRegiNum, setReceiptBusinessRegiNum] = useState(null); // 사업자증빙용 사업자등록번호
    const [payServiceAllAgree, setPayServiceAllAgree] = useState(false); // 개인정보 약관 전체동의
    const [payServiceAgree1, setPayServiceAgree1] = useState(false); // 서비스 이용약관 동의
    const [payServiceAgree2, setPayServiceAgree2] = useState(false); // 결제대행 서비스 이용약관 동의
    const [payServiceAgree3, setPayServiceAgree3] = useState(false); // 개인정보 수집 및 이용 동의
    const [payServiceAgree4, setPayServiceAgree4] = useState(false); // 개인정보 제3자 제공 동의


    useEffect(() => {
        // 세션에서 사용자 정보 가져오기 (localStorage나 sessionStorage에서)
        const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser')); // 세션에 저장된 사용자 정보 가져오기
        if (loggedInUser) {
            setBuyUser(loggedInUser);
        }
    }, []);


    // 서비스 이용약관 전체동의 시 모두 체크
    const handlePayServiceAllAgreeChange = (e) => {
        const isChecked = e.target.checked;
        setPayServiceAllAgree(isChecked);

        setPayServiceAgree1(isChecked);
        setPayServiceAgree2(isChecked);
        setPayServiceAgree3(isChecked);
        setPayServiceAgree4(isChecked);
    };


    const [clickedBox, setClickedBox] = useState(null);
    const [selectedPrice, setSelectedPrice] = useState(null);
    const prices = [5000,10000,30000,50000,100000,500000];
    const handlePriceClick = (price) => {
        setClickedBox(price); // 선택된 가격 업데이트
        setSelectedPrice(price);
    };


    useEffect(() => {
        // 서버에서 데이터 가져오기
        if (!buyUser || !buyUser.userId) return;

        const fetchGpayInfo = async () => {

            try {
                const userId = { userId: buyUser.userId } //현재접속한 유저아이디로 조회

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
    }, [buyUser]); // buyUser가 변경되면 다시 실행


    const gpayHandleSubmit = async (e) => {
        e.preventDefault();

        if (!buyUser) {
            if (window.confirm('로그인 후 구매 가능합니다. 로그인 하시겠습니까?')) {
                navigate("/login"); // 로그인 페이지로 이동

                // if (window.opener) {
                //     // 부모 창이 있으면 부모 창에서 로그인 페이지로 이동
                //     window.opener.location.href = "/login";
                //     window.close(); // 팝업 창 닫기
                // } else {
                //     // 부모 창이 없으면 현재 창에서 로그인 페이지로 이동
                //     navigate("/login");
                // }

            }
            return;
        }

        if(!selectedPrice){
            alert("충전 할 금액을 선택 해 주세요");
            return;
        }

        if (isApplied) {
            if (!receiptType) {
                alert("현금 영수증 신청 분류를 선택 해 주세요.");
                return;
            } else if (receiptType == "personal") {
                if (!receiptPhoneNum) {
                    alert("소득공제용 휴대폰 번호를 입력 해 주세요.");
                    return;
                }
            } else {
                if (!receiptBusinessRegiNum) {
                    alert("소득공제용 사업자등록번호를 입력 해 주세요.")
                    return;
                }
            }
        }

        if (!payServiceAgree1 || !payServiceAgree2 || !payServiceAgree3 || !payServiceAgree4) {
            alert("이용약관을 모두 동의 후 결제가 가능합니다.");
            return;
        }

        // 구매 확인 창
        if (!window.confirm("결제하시겠습니까?")) {
            return;
        }

        try{

            const chargeData = {
                userId: buyUser.userId,
                chargeMoney: selectedPrice,
                chargeWay: 'commonPay',
                receiptApplied: isApplied, // 소득공제 신청 여부
                receiptType: receiptType, // 개인소득공제용 or 사업자증빙용
                receiptPhoneNum: receiptPhoneNum, // 개인소득공제용 폰번호
                receiptBusinessRegiNum: receiptBusinessRegiNum, // 사업자증빙용 사업자번호
                serviceTermsAgreement: payServiceAgree1, // 서비스이용약관 동의
                paymentAgencyTermsAgreement: payServiceAgree2, // 결제대행 서비스 이용약관 동의
                personalInfoCollectionAgreement: payServiceAgree3, // 개인정보 수집 및 이용 동의
                personalInfoThirdPartyAgreement: payServiceAgree4// 개인정보 제3자 제공 동의
            }

            console.log(chargeData);

            const response = await axios.post("/api/gpayCharge",
                chargeData,
                {
                    headers: {'Content-Type': 'application/json'}
                }
            );
            
            if (response.data === "성공") {
                console.log('성공:', response.data);
                if (window.confirm("충전내역을 확인하시겠습니까?")) {
                    navigate("/mypage"); // 마이페이지 충전내역 이동 으로 수정해야함@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
                }
                window.close(); // 아니요 => 팝업창닫기로 수정@@@@@@@@@@@@@@@@@@@@@@@@
            } else if (response.data === "실패") {
                alert("결제 요청이 실패했습니다.");
            } else {
                // 예기치 않은 응답 처리
                alert('알 수 없는 오류가 발생했습니다.');
            }

        }catch (error) {
            console.error('에러:', error); // 에러 처리
            alert('결제 요청에 실패했습니다. 다시 시도해주세요.');
        }

    }



    if (loading) return <div style={{width:'100%', marginTop:'30%', textAlign:'center'}}>g-pay충전페이지 : 잘못 된 접근입니다.</div>;

    return (

        <div className="gpayChargeMainContainer">
            <div className="gpayChargeContainer">

                <h1>G-PAY 충전</h1>
                <div className="gpayPriceBox">
                    {prices.map((price) => (
                        <div
                            key={price}
                            className={`gpayPriceText ${clickedBox === price ? "gpayPriceTextClick" : ""}`}
                            onClick={() => handlePriceClick(price)}
                        >
                            {price.toLocaleString()}원
                        </div>
                    ))}
                </div>
                <div className="gpayChargePreviewBox">
                    <div className="beforeGpay">현재 잔액: {gpayInfo ? gpayInfo.nowProperty.toLocaleString() + '원' : '0원'}</div>
                    <div className="gpayChargingPrice">충전 금액: {selectedPrice ? selectedPrice.toLocaleString() + '원' : '0원'}</div>
                    <div className="afterGpay">충전 후 잔액: {gpayInfo ? (gpayInfo.nowProperty + selectedPrice).toLocaleString() + '원' : selectedPrice ? selectedPrice.toLocaleString() + '원' : '0원'}</div>
                </div>
                <div className='gpayChargeCommonPayBox'>
                    <div className='gpayChargeTossPayments'>
                        <CommonPay buyUser={buyUser} buyInfo={buyData} />
                    </div>
                </div>

                <div className="gpayCashReceiptContainer">
                    <div className='gpayCashReceiptBox'>
                        <div className='gpayCashReceiptTitle'>현금 영수증</div>

                        {/* 신청 / 미신청 선택 */}
                        <div className='gpayCashReceiptRadioBox'>
                            <div
                                className={`radioBox ${isApplied ? 'selected' : ''}`}
                                onClick={() => setIsApplied(true)}
                            >신청</div>
                            <div
                                className={`radioBox ${!isApplied ? 'selected' : ''}`}
                                onClick={() => {
                                    setIsApplied(false);
                                    setReceiptType(null); // 신청 해제 시 타입 초기화
                                    setReceiptPhoneNum(null); // 신청 해제 시 입력값 초기화
                                    setReceiptBusinessRegiNum(null); // 신청 해제 시 입력값 초기화
                                }}
                            >미신청</div>
                        </div>

                        {/* 신청 시만 표시 */}
                        {isApplied && (
                            <div>
                                {/* 개인소득공제용 / 사업자증빙용 선택 */}
                                <div className='receiptTypeBox'>
                                    <div
                                        className={`radioBox ${receiptType === 'personal' ? 'selected' : ''}`}
                                        onClick={() => {setReceiptType('personal'); setReceiptBusinessRegiNum(null); }}
                                    >개인소득공제용</div>
                                    <div
                                        className={`radioBox ${receiptType === 'business' ? 'selected' : ''}`}
                                        onClick={() => {setReceiptType('business'); setReceiptPhoneNum(null);}}
                                    >사업자증빙용</div>
                                </div>

                                {/* 선택에 따라 정보 입력 박스 출력 */}
                                {receiptType === 'personal' && (
                                    <div><input type='text' name='receiptPhoneNum' value={receiptPhoneNum} onChange={(e) => setReceiptPhoneNum(e.target.value)} placeholder='휴대폰 번호를 입력해주세요. - 포함 / 예) 000-0000-0000' /></div>
                                )}

                                {receiptType === 'business' && (
                                    <div><input type='text' name='receiptBusinessRegiNum' value={receiptBusinessRegiNum} onChange={(e) => setReceiptBusinessRegiNum(e.target.value)} placeholder='사업자등록번호를 입력해주세요. -포함 / 예) 123-45-67890' /></div>
                                )}
                            </div>
                        )}
                    </div>

                    <div className='gpayAgreeBox'>

                        <div className='gpayAgreeUnit'>
                            <div className='gpayAllAgree'>
                                <label>
                                    <input
                                        type="checkbox"
                                        checked={payServiceAllAgree}
                                        onChange={handlePayServiceAllAgreeChange}
                                    />
                                    아래 내용에 전체 동의해요. (전체선택)
                                </label>
                            </div>
                            <div className='gpayAgreeUnitDetail'>
                                <div><label>
                                    <input
                                        type="checkbox"
                                        name="payServiceAgree1"
                                        checked={payServiceAgree1}
                                        onChange={(e) => setPayServiceAgree1(e.target.checked)}
                                    />
                                    그린커넥트 서비스 이용약관 동의 (필수)
                                </label></div>
                                <div>자세히</div>
                            </div>
                            <div className='gpayAgreeUnitDetail'>
                                <div><label>
                                    <input
                                        type="checkbox"
                                        name="payServiceAgree2"
                                        checked={payServiceAgree2}
                                        onChange={(e) => setPayServiceAgree2(e.target.checked)}
                                    />
                                    결제대행 서비스 이용약관 동의 (필수)
                                </label></div>
                                <div>자세히</div>
                            </div>
                            <div className='gpayAgreeUnitDetail'>
                                <div><label>
                                    <input
                                        type="checkbox"
                                        name="payServiceAgree3"
                                        checked={payServiceAgree3}
                                        onChange={(e) => setPayServiceAgree3(e.target.checked)}
                                    />
                                    개인정보 수집 및 이용 동의 (필수)
                                </label></div>
                                <div>자세히</div>
                            </div>
                            <div className='gpayAgreeUnitDetail'>
                                <div><label>
                                    <input
                                        type="checkbox"
                                        name="payServiceAgree4"
                                        checked={payServiceAgree4}
                                        onChange={(e) => setPayServiceAgree4(e.target.checked)}
                                    />
                                    개인정보 제3자 제공 동의 (필수)
                                </label></div>
                                <div>자세히</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="gpayChargeSubmitBtn" onClick={gpayHandleSubmit}>결제하기</div>


            </div>
        </div>

    )
}


export default GpayCharge;