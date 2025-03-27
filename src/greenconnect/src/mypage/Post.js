import React, { useState, useEffect } from "react";
import axios from "axios";
import Sidebar from './components/Sidebar';
import './css/MyPage.css';
import { Navigate, useNavigate } from "react-router-dom";

function Post() {

    const navigate = useNavigate();

    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const userId = 1;

    useEffect(() => {
        const fetchPosts = async () => {
            setLoading(true);
            setError(null);

            const userId = localStorage.getItem("userId");
            if (!userId) {
                setError("로그인이 필요합니다.");
                setLoading(false);
                return;
            }

            try {
                const response = await axios.get(`/mypage/post/user/${userId}`);
                setPosts(response.data);
                console.log("내가 작성한 글:", response.data);
            } catch (err) {
                if (err.response?.status === 404) {
                    console.log("작성한 게시글없음");
                } else {
                    setError("게시글을 불러오는 중 에러가 발생했습니다.");
                }
                console.error("Error fetching posts:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchPosts();
    }, []);

    if (loading) return <div className="loading">로딩 중...</div>;
    if (error) return <div className="error-message">{error}</div>;

    return (
        <div className="mypageSide" style={{marginTop:'80px'}}>
            <Sidebar />
            <div className="main_content">
                <h1>내가 작성한 글</h1>
                {posts.length === 0 ? (
                    <div>
                    <p className="no-posts">작성한 글이 없습니다.</p>
                    <div style={{ padding:'5px',borderRadius:'5px', textAlign:'center', width:'200px', border:'1px solid gray', cursor:'pointer', margin:'10px 10px'}} onClick={()=>{navigate("/writePost")}}>판매글 작성 하러 가기</div>
                    </div>
                ) : (
                    <div className="posts-grid" style={{width:'1000px'}}>
                        <div style={{ padding:'5px',borderRadius:'5px', textAlign:'center', width:'200px', border:'1px solid gray', cursor:'pointer', margin:'10px 10px'}} onClick={()=>{navigate("/writePost")}}>판매글 작성 하러 가기</div>
                        {posts.map((post) => (
                            <div className="post-card" key={post.postId} onClick={()=>(navigate("/postDetail/"+post.postId))}>
                                <div className="post-title">{post.postTitle}</div>
                                <p className="post-content">
                                    {post.postContent.substring(0, 30)}
                                    {post.postContent.length > 30 && "..."}
                                </p>
                                <div className="post-meta">
                                    <span className="post-date">
                                        작성일: {new Date(post.postCreateAt).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default Post;