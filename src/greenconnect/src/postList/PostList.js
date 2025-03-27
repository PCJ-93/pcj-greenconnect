import './css/PostList.css';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import PostThumbnail from './PostThumbnail';
import PostSlide from './PostSlide';


function PostList() {

    // 포스트 정보
    const [postList, setPostList] = useState([]);
    const [visibleCount, setVisibleCount] = useState(9); // 처음에는 9개만 표시


    // 상태 관리
    const [loading, setLoading] = useState(true); // 로딩 상태
    const [error, setError] = useState(null); // 에러 상태


    useEffect(() => {
        // 서버에서 데이터 가져오기
        const fetchPostList = async () => {
            try {
                const response = await axios.get("/api/postList");
                setPostList(response.data); // 데이터 상태 업데이트
                console.log(response.data);
                setLoading(false); // 로딩 끝
            } catch (err) {
                setError(err.message); // 에러 상태 업데이트
                setLoading(false); // 로딩 끝
            }
        };

        fetchPostList();
    }, []);


    const loadMore = () => {
        setVisibleCount(prev => prev + 9); // 9개씩 추가
    };


    return (
        <div className='postListMainContainer'>
            <h1 style={{fontSize:'40px'}}>판매글 리스트 페이지</h1>

            <div className='PostListContainerTitle'>
                <h2>프리미엄 고객의 판매상품 리스트</h2>
                <PostSlide />
            </div>

            <div className='PostListContainerTitle'>
                <h2>일반 고객의 판매상품 리스트</h2>
                <div className='postListContainer'>
                    {
                        postList.slice(0, visibleCount).map((post) => (
                            <PostThumbnail post={post} />
                        ))
                    }
                </div>
            </div>

            {/* 더보기 버튼 (모든 게시글을 다 보여주면 버튼 숨김) */}
            {
                visibleCount < postList.length && (
                    <button onClick={loadMore} className="loadMoreButton">
                        더보기
                    </button>
                )
            }

            <div className='PostListContainerTitle'>
                <h2>추천 랜덤상품 리스트</h2>
                <PostSlide />
            </div>

        </div>
    )

}


export default PostList;