import './css/PostThumbnail.css';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';


function RelatedPostThumbnail({ post }) {

    const navigate = useNavigate();

    console.log(post);


    const handleThumbnailClick = async () => {
        try {
            // post_views 1 증가 요청
            const response = await axios.post('/api/addPostViews/' + post.postId);
            if(response.data){
                navigate("/postDetail/" + post.postId);
                window.scrollTo(0, 0);
            } else {
                alert('게시글을 읽어오는데 실패했습니다. 다시 시도 해 주세요');
            }
        } catch (error) {
            console.error('Error updating post views:', error);
            alert('게시글 조회수를 업데이트하는 데 오류가 발생했습니다.');
        }
    };


    const truncateText = (text, maxLength) => { // 제목이 너무 길면 잘라냄
        return text.length > maxLength ? text.substring(0, maxLength) + ".." : text;
    };

    console.log(post.postProductType);
    console.log(post.postTitle);


    return (
        <div className='postThumbnailMainContainer'>
            <div className='postThumbnailContainer'>
                <div className='thumbnailBox' onClick={handleThumbnailClick}>
                    <div className='thumbnailImgBox'>
                        {
                            post.urlFilePath ?
                                <img src={post.urlFilePath} alt='상품 이미지' /> :
                                <img src='/images/gcLogo.png' alt='썸네일 없음 기본이미지' />
                        }
                    </div>
                    <div className='thumbnailTextBox'>
                        <div className='productTitle'>{truncateText(post.postTitle, 15)}</div>
                        <div className='productInfo'>
                            <div>상품 품목: {truncateText(post.postProductType, 10)}</div>
                            <div>상품 가격: {Number(post.postPrice).toLocaleString()}원</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )

}


export default RelatedPostThumbnail;