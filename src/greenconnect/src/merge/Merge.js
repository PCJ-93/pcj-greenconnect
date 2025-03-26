import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import MyPage from "../mypage/MyPage";
import Cart from "../mypage/Cart";
import Address from "../mypage/Address";
import Post from "../mypage/Post";
import Likes from "../mypage/Likes";
import Profile from '../mypage/Profile';
import UserInfo from '../mypage/UserInfo';
import Admin from "../admin/Admin";
import Customer from '../admin/Customer';
import Trade from '../admin/Trade';
import Quality from '../admin/Quality';
import System from '../admin/System';
import CuSupport from '../admin/CuSupport';
import Charge from '../mypage/Charge';
import PostDetail from "../postDetail/PostDetail";
import PostDetailIntro from "../postDetail/PostDetailIntro";
import MainPage from "../mainpageTemp1111/MainPage";
import WritePost from "../postDetail/WritePost";
import PostList from "../postList/PostList.js";
import PostThumbnail from "../postList/PostThumbnail.js";
import ModifyPostDetail from "../postDetail/ModifyPostDetail.js";
import PostDetailReview from "../postDetail/PostDetailReview.js";
import PayPage from "../pay/PayPage.js";
import CommonPay from "../pay/CommonPay.js";
import GpayCharge from "../pay/GpayCharge.js";
import Signup from "../Page/Signup/Signup.js";
import Login from "../Page/Signup/Login.js";
import FindId from "../Page/Signup/FindId.js";
import FindPassword from "../Page/Signup/FindPassword.js";
import ResetPassword from "../Page/Signup/ResetPassword.js";
import PostDetailReviewModal from '../postDetail/PostDetailReviewModal.js';
import PostReviewSlider from '../postDetail/PostReviewSlider.js';
import { useSelector } from "react-redux";
import GoogleAuthHandler from '../Page/Signup/GoogleAuthHandler.js';
import KakaoAuthHandler from '../Page/Signup/KakaoAuthHandler.js';
import NaverAuthHandler from '../Page/Signup/NaverAuthHandler.js';

import Header from '../header/Header.js';
function Merge() {


    return (

        <div className="merge-container">
            {useLocation().pathname !== "/gpayCharge" && (
                <div style={{ marginBottom: "50px" }}>
                    <Header />
                </div>
            )}
            <Routes>
                <Route path="/Mypage" element={<MyPage />} />
                <Route path="/Cart" element={<Cart />} />
                <Route path="/Address" element={<Address />} />
                <Route path="/Post" element={<Post />} />
                <Route path="/likes" element={<Likes />} />
                <Route path="/Profile" element={<Profile />} />
                <Route path="/userinfo" element={<UserInfo />} />
                <Route path="/Admin" element={<Admin />} />
                <Route path="/Customer" element={<Customer />} />
                <Route path="/Trade" element={<Trade />} />
                <Route path="/System" element={<System />} />
                <Route path="/Quality" element={<Quality />} />
                <Route path="/CuSupport" element={<CuSupport />} />
                <Route path='/Charge' element={<Charge />} />


                <Route path="/" element={<MainPage />} />
                <Route path="/main" element={<MainPage />} />

                <Route path="/writePost" element={<WritePost />} />
                <Route path="/postDetail/:postId" element={<PostDetail />} />
                <Route path="/postDetailReview/:postId" element={<PostDetailReview />} />
                <Route path="/postDetailReviewModal/:postId" element={<PostDetailReviewModal />} />
                <Route path="/postReviewSlider" element={<PostReviewSlider />} />
                <Route path="/modifyPostDetail/:postId" element={<ModifyPostDetail />} />
                <Route path="/postDetailIntro" element={<PostDetailIntro />} />
                <Route path="/postList" element={<PostList />} />
                <Route path="/postThumbnail" element={<PostThumbnail />} />

                <Route path="/payPage/:postId" element={<PayPage />} />
                <Route path="/commonPay" element={<CommonPay />} />
                <Route path="/gpayCharge" element={<GpayCharge />} />

                <Route path="/signup" element={<Signup />} />
                <Route path="/login" element={<Login />} />
                <Route path="/findId" element={<FindId />} />
                <Route path="/findPassword" element={<FindPassword />} />
                <Route path="/resetPassword" element={<ResetPassword />} />
                <Route path="/find-id" element={<FindId />} />
                <Route path="/find-password" element={<FindPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/auth/google/callback" element={<GoogleAuthHandler />} /> {/* 추가 */}
                <Route path="/auth/kakao/callback" element={<KakaoAuthHandler />} />
                <Route path="/auth/naver/callback" element={<NaverAuthHandler />} />

            </Routes>
        </div>

    );
}

export default Merge;