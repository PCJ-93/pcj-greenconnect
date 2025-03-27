import { useEffect, useState, React } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import './css/PayPage.css';
import CommonPay from './CommonPay';



function PayPage() {

    const { postId } = useParams();
    const navigate = useNavigate();

    // 데이터 불러온 것 상태 관리
    const [buyInfo, setBuyInfo] = useState(null);
    const [buyUser, setBuyUser] = useState(null);
    const [gpayInfo, setGpayInfo] = useState(null);

    // 상태 관리
    const [loading, setLoading] = useState(true); // 로딩 상태
    const [error, setError] = useState(null); // 에러 상태

    const truncateText = (text, maxLength) => { // 제목이 너무 길면 잘라냄
        return text.length > maxLength ? text.substring(0, maxLength) + ".." : text;
    };


    // 결제 input 입력한 정보들 담는 것들
    const [tradingType, setTradingType] = useState('commonTrading'); // 거래방식 택배, 만나서거래
    const [requestContent, setRequestContent] = useState(null); // 구매자 배송요청사항
    const [buyerTotalAddress, setBuyerTotalAddress] = useState(null); // 구매자 주소정보
    const [postalCode, setPostalCode] = useState(null);
    const [address1, setAdress1] = useState(null);
    const [address2, setAdress2] = useState(null);
    const [receiver, setReceiver] = useState(null);
    const [receiptPhoneNum, setReceiptPhoneNum] = useState(null);
    const [receiptBusinessRegiNum, setReceiptBusinessRegiNum] = useState(null);

    // 사용자 선택 상태관리
    const [paymentType, setPaymentType] = useState(''); // 결제수단 g-pay or 일반결제
    const [isApplied, setIsApplied] = useState(false); // 소득공제 신청 여부
    const [receiptType, setReceiptType] = useState(null); // 개인소득공제용 or 사업자증빙용
    const [payServiceAllAgree, setPayServiceAllAgree] = useState(false); // 개인정보 약관 전체동의
    const [payServiceAgree1, setPayServiceAgree1] = useState(false); // 서비스 이용약관 동의
    const [payServiceAgree2, setPayServiceAgree2] = useState(false); // 결제대행 서비스 이용약관 동의
    const [payServiceAgree3, setPayServiceAgree3] = useState(false); // 개인정보 수집 및 이용 동의
    const [payServiceAgree4, setPayServiceAgree4] = useState(false); // 개인정보 제3자 제공 동의


    // 우편 주소 검색
    const [adressError, setAdressError] = useState({});
    const [isLoadingAdress, setIsLoadingAdress] = useState(false);
    const [address, setAddress] = useState(null);
    const [formData, setFormData] = useState({});


    useEffect(() => {
        // 세션에서 사용자 정보 가져오기 (localStorage나 sessionStorage에서)
        const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser')); // 세션에 저장된 사용자 정보 가져오기
        if (loggedInUser) {
            setBuyUser(loggedInUser);
        }
    }, []);

    // 컴포넌트가 마운트될 때 데이터 요청
    useEffect(() => {
        // 서버에서 데이터 가져오기
        if (!buyUser || !buyUser.userId || !postId) return;

        const fetchBuyInfo = async () => {

            try {
                const buyData = {
                    userId: buyUser.userId,
                    postId: postId
                }


                const response = await axios.post("/api/getBuyInfo",
                    buyData,
                    {
                        headers: { 'Content-Type': 'application/json' }
                    }
                );
                console.log(response.data);
                setBuyInfo(response.data);
                setLoading(false); // 로딩 끝
            } catch (err) {
                if (err.response && err.response.status === 404) {
                    setError("해당 유저의 구매 정보가 없습니다.");
                } else {
                    setError(err.message);
                }
            } finally {
                setLoading(false);
            }
        };

        fetchBuyInfo();
    }, [buyUser, postId]); // postId가 변경되면 다시 실행

    // 우편 주소
    const searchPostalCode = () => {
        if (!window.daum || !window.daum.Postcode) {
            const script = document.createElement('script');
            script.src = '//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js';
            script.onload = () => openPostcode();
            document.head.appendChild(script);
        } else {
            openPostcode();
        }
    };

    const openPostcode = () => {
        new window.daum.Postcode({
            oncomplete: function (data) {
                setPostalCode(data.zonecode)
                setAdress1(data.roadAddress || data.jibunAddress)
            }
        }).open();
    };


    useEffect(() => {
        // 서버에서 G-PAY 데이터 가져오기
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


    // 서비스 이용약관 전체동의 시 모두 체크
    const handlePayServiceAllAgreeChange = (e) => {
        const isChecked = e.target.checked;
        setPayServiceAllAgree(isChecked);

        setPayServiceAgree1(isChecked);
        setPayServiceAgree2(isChecked);
        setPayServiceAgree3(isChecked);
        setPayServiceAgree4(isChecked);
    };


    const paymentHandleSubmit = async (e) => {
        e.preventDefault();

        if (!buyUser) {
            if (window.confirm('로그인 후 구매 가능합니다. 로그인 하시겠습니까?')) {
                navigate("/login"); // 로그인 페이지로 이동
            }
            return;
        }

        if (tradingType == "commonTrading") {
            if (!postalCode || !address1 || !address2 || !receiver) {
                alert("배송지 정보를 입력 해 주세요.");
                return;
            }
        }

        if (!paymentType) {
            alert("결제수단을 선택 해 주세요");
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

        if(paymentType == 'gPay') {
            if ((
                gpayInfo.nowProperty -
                (Number(buyInfo.postPrice * buyInfo.buyCount) + (tradingType === 'meetTrading' ? 0 : Number(buyInfo?.postCost || 0)))
            ) < 0) {
                if (window.confirm("G-PAY잔액이 부족합니다. 충전 하시겠습니까?")) {
                    navigate("/"); //마이페이지 g-pay충전 페이지로 이동 해야함 @@@@@@@@@@@@@@@@@@@@@@@@@@
                    return;
                } else {
                    return;
                }
            }
        }

        // 구매 확인 창
        if (!window.confirm("결제하시겠습니까?")) {
            return;
        }

        try {
            // Data 생성
            const payData = {
                userId: buyUser.userId, // 구매자 아이디
                nickName: buyUser.nickname, // 구매자 닉네임
                boardId: 1, // 게시글 종류 1:판매글 2:후기글
                postId: buyInfo.postId, // 주문하는판매글
                postUserId: buyInfo.postUserId, // 판매글 작성자 아이디
                buyCount: buyInfo.buyCount, // 주문수량
                totalPrice: Number(buyInfo.postPrice * buyInfo.buyCount) + (tradingType === 'meetTrading' ? 0 : Number(buyInfo?.postCost || 0)), // 총결제금액
                totalGram: buyInfo.totalGram, // 총 주문 무게

                tradingType: tradingType, // 거래방식 택배,만나서
                requestContent: requestContent, // 배송요청사항
                buyerTotalAddress: `${postalCode} ${address1} ${address2}`.trim(), //우편번호포함 배송받을주소
                receiver: receiver, //수령인

                paymentType: paymentType, // 결제수단 g-pay or 일반결제
                receiptApplied: isApplied, // 소득공제 신청 여부
                receiptType: receiptType, // 개인소득공제용 or 사업자증빙용
                receiptPhoneNum: receiptPhoneNum, // 개인소득공제용 폰번호
                receiptBusinessRegiNum: receiptBusinessRegiNum, // 사업자증빙용 사업자번호
                serviceTermsAgreement: payServiceAgree1, // 서비스이용약관 동의
                paymentAgencyTermsAgreement: payServiceAgree2, // 결제대행 서비스 이용약관 동의
                personalInfoCollectionAgreement: payServiceAgree3, // 개인정보 수집 및 이용 동의
                personalInfoThirdPartyAgreement: payServiceAgree4,// 개인정보 제3자 제공 동의
            };

            console.log(payData);

            // 백엔드 API로 데이터 전송
            const response = await axios.post('/api/payProduct', payData, {
                headers: {
                    'Content-Type': 'application/json', // JSON 형식으로 보내기
                }
            });

            if (response.data === "성공") {
                console.log('성공:', response.data);
                if (window.confirm("구매내역을 확인하시겠습니까? ( 취소 시 메인페이지로 이동. )")) {
                    navigate("/Mypage"); // 마이페이지 구매내역 이동 으로 수정해야함@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
                }
                navigate("/");
            } else if (response.data === "실패") {
                alert("결제 요청이 실패했습니다.");
            } else {
                // 예기치 않은 응답 처리
                alert('알 수 없는 오류가 발생했습니다.');
            }
        } catch (error) {
            console.error('에러:', error); // 에러 처리
            alert('결제 요청에 실패했습니다. 다시 시도해주세요.');
        }
    }

    if (loading) return <div style={{ width: '100%', marginTop: '30%', textAlign: 'center' }}>결제 페이지 : 잘못 된 접근입니다.</div>;

    return (
        <div className="payPageMainContainer" style={{marginTop:'80px'}}>
            <h1>결제페이지</h1>
            <div className='payPageContainer'>

                {loading ? <p>로딩 중...</p> : error ? <p>{error}</p> : //데이터 불러오기 전 출력 방지
                    <div className='payProductInfoBox'>
                        <div className='payProductInfoTitle'>구매 상품 정보</div>
                        <div><img src={buyInfo.urlFilePath} style={{ width: '100px', borderRadius: '12px' }}></img></div>
                        <div>판매글 제목: {truncateText(buyInfo.postTitle, 10)}</div>
                        <div>총 구매 금액: {Number(buyInfo.postPrice * buyInfo.buyCount + Number(tradingType === 'meetTrading' ? 0 : Number(buyInfo?.postCost || 0))).toLocaleString()}원</div>
                    </div>
                }

                <div className='payTradingTypeBox'>
                    <div className='payTradingTypeTitle'>거래 방식 *</div>
                    <div><label><input type='radio' name='tradingType' value='commonTrading' checked={tradingType === 'commonTrading'} onChange={(e) => setTradingType(e.target.value)} /> 일반택배(선불)</label></div>
                    <div><label><input type='radio' name='tradingType' value='meetTrading' checked={tradingType === 'meetTrading'} onChange={(e) => setTradingType(e.target.value)} /> 만나서 거래(택배비 차감)</label></div> {/* 체크시 -postCost */}
                </div>

                {tradingType === 'commonTrading' && (
                    <div className='payBuyerAdressBox'>
                        <div className='payBuyerAdressTitle'>배송지 *</div>
                        <div className="payBuyerAdressBoxApi">
                            <label>우편번호 *</label>
                            <div className="pay-postal-code-container">
                                <input
                                    type="text"
                                    name="postal_code"
                                    placeholder="우편번호 검색"
                                    value={postalCode}
                                    onChange={(e) => setPostalCode(e.target.value)}
                                    className={adressError.postal_code ? 'error' : ''}
                                    readOnly
                                    required
                                />
                                <button style={{ padding: '5px', margin: '5px 0 5px 0', backgroundColor: 'white', fontWeight: 'bold', borderRadius: '5px' }}
                                    type="button"
                                    className="search-button"
                                    onClick={searchPostalCode}
                                >
                                    우편번호 검색
                                </button>
                            </div>
                            {adressError.postal_code && <span className="error-text">{adressError.postal_code}</span>}
                        </div>

                        <div className="pay-postal-code-container">
                            <label>기본 주소 *</label>
                            <input
                                type="text"
                                name="address1"
                                placeholder="우편번호를 검색 해 주세요."
                                value={address1}
                                onChange={(e) => setAdress1(e.target.value)}
                                className={adressError.address1 ? 'error' : ''}
                                readOnly
                                required
                            />
                            {adressError.address1 && <span className="error-text">{adressError.address1}</span>}
                        </div>

                        <div className="pay-postal-code-container">
                            <label>상세 주소</label>
                            <input
                                type="text"
                                name="address2"
                                value={address2}
                                placeholder="상세 주소를 입력 해 주세요."
                                onChange={(e) => setAdress2(e.target.value)}
                                required
                            />
                        </div>

                        <div className="pay-postal-code-container">
                            <label>수령인 *</label>
                            <input
                                type="text"
                                name="receiver"
                                placeholder="받으시는분 성함을 입력 해 주세요."
                                value={receiver}
                                onChange={(e) => setReceiver(e.target.value)}
                                required
                            />
                        </div>

                    </div>
                )}
                <div className='payRequestBox'>
                    <div className='payRequestTitle'>거래 요청사항</div>
                    <div style={{ fontSize: '12px', fontWeight: 'bold', color: 'gray', padding: '0 0 5px 0' }}>판매자 및 배송기사에게 전달되는 요청사항이에요.</div>
                    <div><input type='text' name='requestContent' value={requestContent} placeholder='예) 포장 꼼꼼하게 부탁드려요.' onChange={(e) => setRequestContent(e.target.value)} /></div>
                </div>

                <div className='paymentType'>
                    <div className='paymentTypeTitle'>결제수단 *</div>
                    <div><label><input type='radio' name='paymentType' value='gPay' checked={paymentType === 'gPay'} onChange={(e) => setPaymentType(e.target.value)} /> G-PAY 결제</label></div>
                    <div><label><input type='radio' name='paymentType' value='commonPay' checked={paymentType === 'commonPay'} onChange={(e) => setPaymentType(e.target.value)} /> 일반결제</label></div>
                </div>
                {paymentType === 'gPay' && gpayInfo && (
                    <div className='selectGpayBox'>
                        <div>현재 G-PAY 잔액: {gpayInfo.nowProperty.toLocaleString()}원</div>  {/* gpay정보 불러와서입력 */}
                        <div>
                            <span>결제 후 예상 G-PAY 잔액: </span>
                            {(
                                gpayInfo.nowProperty -
                                (Number(buyInfo.postPrice * buyInfo.buyCount) + (tradingType === 'meetTrading' ? 0 : Number(buyInfo?.postCost || 0)))
                            ).toLocaleString()}원
                            {(
                                gpayInfo.nowProperty -
                                (Number(buyInfo.postPrice * buyInfo.buyCount) + (tradingType === 'meetTrading' ? 0 : Number(buyInfo?.postCost || 0)))
                            ) < 0 && (
                                    <span style={{ color: 'rgb(255, 50, 50)', fontWeight: 'bold', fontSize: '12px', marginLeft: '10px' }}>
                                        G-PAY 잔액이 부족합니다.
                                    </span>
                                )}
                        </div>
                    </div>
                )}
                {paymentType === 'commonPay' && (
                    <div className='selectCommonPayBox'>
                        <div className='selectCardPay'>
                            <CommonPay buyUser={buyUser} buyInfo={buyInfo} />
                        </div>
                    </div>
                )}

                <div className='payTotalPriceBox'>
                    <div className='payTotalPriceTitle'>결제금액</div>
                    <div className='payTotalPriceCRBox'>
                        <div className='payTotalPriceContent'>
                            <div>상품금액</div>
                            <div>배송비</div>
                            <div>총 결제금액</div>
                        </div>
                        {loading ? <p>로딩 중...</p> : error ? <p>{error}</p> : //데이터 불러오기 전 출력 방지
                            <div className='payTotalPriceResult'>
                                <div>{Number(buyInfo.postPrice * buyInfo.buyCount).toLocaleString()} 원</div>
                                <div>{tradingType == 'meetTrading' ? 0 : Number(buyInfo.postCost).toLocaleString()} 원</div>
                                <div>{(Number(buyInfo.postPrice * buyInfo.buyCount) + (tradingType === 'meetTrading' ? 0 : Number(buyInfo?.postCost || 0))).toLocaleString()} 원</div>
                            </div>
                        }
                    </div>
                </div>

                <div className='payCashReceiptBox'>
                    <div className='payCashReceiptTitle'>현금 영수증</div>

                    {/* 신청 / 미신청 선택 */}
                    <div className='payCashReceiptRadioBox'>
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
                                    onClick={() => { setReceiptType('personal'); setReceiptBusinessRegiNum(null); }}
                                >개인소득공제용</div>
                                <div
                                    className={`radioBox ${receiptType === 'business' ? 'selected' : ''}`}
                                    onClick={() => { setReceiptType('business'); setReceiptPhoneNum(null); }}
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

                <div className='payAgreeBox'>

                    <div className='payAgreeUnit'>
                        <div className='payAllAgree'>
                            <label>
                                <input
                                    type="checkbox"
                                    checked={payServiceAllAgree}
                                    onChange={handlePayServiceAllAgreeChange}
                                />
                                아래 내용에 전체 동의해요. (전체선택)
                            </label>
                        </div>
                        <div className='payAgreeUnitDetail'>
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
                        <div className='payAgreeUnitDetail'>
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
                        <div className='payAgreeUnitDetail'>
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
                        <div className='payAgreeUnitDetail'>
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

                <div className='paySubmitBtnBox'>
                    <div onClick={paymentHandleSubmit}>결제하기</div>
                </div>

                <div className='payBottomTextBox'>
                    <div>그린커넥트는 통신판매중개자이며...그린커넥트에게귀속합니다.</div>
                </div>

            </div>

        </div>
    )

}

export default PayPage;