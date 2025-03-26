import './css/Profile.css';
import { useState } from 'react';
import axios from "axios";
import Sidebar from './components/Sidebar';

function Profile() {
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState(null);
    const [nickname, setNickname] = useState("");

    const imageChange = (e) => {
        const imageFile = e.target.files[0];
        if (!imageFile) return;
        setImage(imageFile);
        const reader = new FileReader();
        reader.onloadend = () => {
            setPreview(reader.result);
        };
        reader.readAsDataURL(imageFile);
    };

    const profileUpload = async () => {
        if (!image) {
            alert("이미지를 선택하여주십시오");
            return;
        }
        const userId = localStorage.getItem('userId','testUser');
        if (!userId) {
            alert("로그인이 필요합니다.");
            return;
        }
        const formData = new FormData();
        formData.append("ProfileImage", image);
        console.log("Uploading with userId:", userId, "file:", image.name);
    
        try {
            const response = await axios.post(`http://localhost:8080/profile/upload/${userId}`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            console.log("Upload success:", response.data);
            alert("업로드를 성공하였습니다");
            setPreview(`/uploads/profile/${response.data}`);
            setImage(null);
        } catch (error) {
            console.error("Upload failed:", error.response?.data || error.message);
            alert("업로드에 실패하였습니다: " + (error.response?.data || error.message));
        }
    };

    const profileDelete = async () => {
        try {
            const userId = localStorage.getItem('userId','testUser');
            await axios.post(`http://localhost:8080/profile/delete/${userId}`); // DELETE → POST
            setPreview(null);
            setImage(null);
            alert("삭제 성공!");
        } catch (error) {
            console.error("삭제 실패:", error);
            alert("삭제 실패");
        }
    };

    const handleNicknameChange = (e) => {
        setNickname(e.target.value);
    };

    const updateNickname = async () => {
        try {
            const userId = localStorage.getItem('userId','testUser');
            await axios.post(`http://localhost:8080/profile/updateNickname/${userId}`, { nickname });
            alert("닉네임이 변경되었습니다.");
        } catch (error) {
            console.error("닉네임 변경 실패:", error);
            alert("닉네임 변경에 실패하였습니다.");
        }
    };

    return (
        <div className="mypageSide" style={{marginTop:'80px'}}>
            <Sidebar />
            <div className="main_content">
                <div className="profile-card">
                    <div className="profile-preview-container">
                        {preview && <img src={preview} alt="미리보기" className="profile-preview" />}
                    </div>
                    <div className="file-input-container">
                        <input type="file" id="profile-image-input" onChange={imageChange} />
                        <label htmlFor="profile-image-input" className="file-input-label">사진 선택</label>
                    </div>
                    <div className="button-group">
                        <button onClick={profileUpload}>프로필 사진 변경</button>
                        <button onClick={profileDelete}>삭제</button>
                    </div>
                </div>
                <div className="card">
                    닉네임<input type="text" value={nickname} onChange={handleNicknameChange} />
                    <button onClick={updateNickname}>적용</button>
                </div>
            </div>
        </div>
    );
}

export default Profile;