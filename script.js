document.addEventListener('DOMContentLoaded', () => {
    // --- KHAI BÁO BIẾN ---
    const marker = document.getElementById('marker');
    const labelInfo = document.getElementById('province-info');
    const labelText = document.getElementById('province-label');
    const countDisplay = document.getElementById('participation-count');
    const provinceItems = document.querySelectorAll('.province-item');
    
    const bgMusic = document.getElementById('bg-music');
    const musicBtn = document.getElementById('music-control');
    const clickSound = document.getElementById('click-sound');

    const modal = document.getElementById('question-modal');
    const questionText = document.getElementById('random-question-text');
    const modalAnswer = document.getElementById('modal-answer');
    const submitModalBtn = document.getElementById('submit-modal-answer');
    
    // Media Upload Elements
    const mediaUploadInput = document.getElementById('media-upload');
    const fileNamePreview = document.getElementById('file-name-preview');

    const step1View = document.getElementById('step-1-province');
    const step2View = document.getElementById('step-2-creator');
    const backBtn = document.getElementById('back-btn');

    const userNameInput = document.getElementById('user-name'); 
    const starterSelect = document.getElementById('sentence-starter');
    const userContent = document.getElementById('user-content');
    const stickerOpts = document.querySelectorAll('.sticker-opt');
    const updateMapBtn = document.getElementById('update-map-btn');
    const downloadBtn = document.getElementById('download-btn');

    const bgDecorLayer = document.getElementById('user-bg-decor-layer');
    const heartLayer = document.getElementById('heart-layer');
    const resultOverlay = document.getElementById('result-overlay');
    const resultNameDisplay = document.getElementById('result-name-display'); 
    const resultMessage = document.getElementById('result-message');
    const resultMediaContainer = document.getElementById('result-media-container');

    let currentProvince = "";
    let selectedStickers = [];
    let uploadedFile = null; // Lưu file user chọn
    let heartInterval = null; // Quản lý vòng lặp tim bay

    const randomQuestions = [
        "Trong những ngày cận Tết ở quê, khoảnh khắc nào khiến bạn luôn mong được quay lại nhất?",
        "Món ăn Tết nào của gia đình mà đến bây giờ bạn vẫn chưa thể tìm được hương vị giống như thế?",
        "Ai là người bạn nhớ nhất mỗi khi nghĩ đến không khí Tết sum vầy ngày xưa? Vì sao?",
        "Ký ức Tết nào từng khiến bạn cười nhiều nhất khi nhớ lại?",
        "Tết bắt đầu trở nên “khác” với bạn từ năm nào, khi bạn không còn đón Tết trọn vẹn ở nhà nữa?",
        "Điều gì khiến bạn nhận ra rằng: “Mình đã thực sự lớn rồi” trong những cái Tết xa nhà?",
        "Khi ở một thành phố khác vào dịp Tết, điều gì làm bạn cảm thấy trống trải nhất?",
        "Có khoảnh khắc nào trong những ngày Tết khiến bạn bất chợt muốn khóc không?",
        "Nếu được dùng một từ để mô tả cảm xúc của bạn mỗi khi nghe đến bốn chữ “về quê ăn Tết”, đó là gì?",
        "Bạn nhớ nhất điều gì ở gia đình mình vào những ngày Tết mà bình thường trong năm không cảm nhận rõ?",
        "Khi gọi điện về nhà ngày cận Tết, điều gì ở đầu dây bên kia khiến bạn vừa ấm lòng vừa chạnh lòng?",
        "Có khi nào bạn cố tỏ ra “ổn” để gia đình yên tâm, dù trong lòng rất nhớ nhà không?",
        "Tết xa nhà đã dạy bạn điều gì về gia đình và về chính bản thân mình?",
        "Nếu Tết này được về nhà, điều đầu tiên bạn muốn làm cùng gia đình là gì?",
        "Nếu chưa thể về quê, bạn muốn gửi lời nhắn gì đến bố mẹ hoặc người thân trong dịp Tết này?",
        "Bạn mong điều gì nhất cho gia đình mình trong năm mới sắp tới?",
        "Có lời hứa nào với gia đình mà bạn vẫn luôn mang theo mỗi dịp Tết đến?",
        "Nếu được viết một câu ngắn gửi cho chính mình của những cái Tết năm sau, bạn sẽ viết gì?"
    ];

    // --- MUSIC ---
    musicBtn.addEventListener('click', () => {
        if (bgMusic.paused) {
            bgMusic.play().catch(() => alert("Vui lòng tương tác trang web!"));
            musicBtn.innerHTML = "⏸ Tạm Dừng Nhạc";
        } else {
            bgMusic.pause();
            musicBtn.innerHTML = "🎵 Bật Nhạc Xuân";
        }
    });

    // --- XỬ LÝ MEDIA UPLOAD ---
    mediaUploadInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            uploadedFile = file;
            fileNamePreview.innerText = `Đã chọn: ${file.name}`;
        } else {
            uploadedFile = null;
            fileNamePreview.innerText = "";
        }
    });

    // --- HIỆU ỨNG TIM BAY LIÊN TỤC ---
    function startHeartAnimation(xPercent, yPercent) {
        // Xóa interval cũ nếu có
        if (heartInterval) clearInterval(heartInterval);

        // Tạo interval mới bắn tim mỗi 400ms
        heartInterval = setInterval(() => {
            const heart = document.createElement('div');
            heart.innerHTML = "❤"; 
            heart.className = "flying-heart";
            
            // Random độ lệch ngang nhẹ để trông tự nhiên
            const randomX = (Math.random() - 0.5) * 40; 
            heart.style.setProperty('--mx', `${randomX}px`);

            // Đặt vị trí theo phần trăm marker
            heart.style.left = xPercent + '%';
            heart.style.top = yPercent + '%';

            heartLayer.appendChild(heart);

            // Xóa DOM sau khi animation kết thúc (2.5s)
            setTimeout(() => {
                heart.remove();
            }, 2500);
        }, 400); 
    }

    function stopHeartAnimation() {
        if (heartInterval) clearInterval(heartInterval);
        heartLayer.innerHTML = ""; // Xóa hết tim đang bay
    }

    // --- DATA ---
    function getParticipationCount(province) {
        let counts = JSON.parse(localStorage.getItem('tet_counts_2026') || '{}');
        if (!counts[province]) {
            counts[province] = Math.floor(Math.random() * 900) + 100;
            localStorage.setItem('tet_counts_2026', JSON.stringify(counts));
        }
        return counts[province];
    }
    function incrementParticipation(province) {
        let counts = JSON.parse(localStorage.getItem('tet_counts_2026') || '{}');
        counts[province] = (counts[province] || 100) + 1;
        localStorage.setItem('tet_counts_2026', JSON.stringify(counts));
        return counts[province];
    }

    // --- CHỌN TỈNH ---
    provinceItems.forEach(item => {
        item.addEventListener('click', function() {
            clickSound.currentTime = 0;
            clickSound.play().catch(()=>{});

            const xVal = parseFloat(this.getAttribute('data-x'));
            const yVal = parseFloat(this.getAttribute('data-y'));
            currentProvince = this.innerText;

            marker.style.display = 'block';
            marker.style.left = xVal + '%';
            marker.style.top = yVal + '%';
            labelText.innerText = currentProvince;

            labelInfo.classList.remove('pos-right', 'pos-top');
            if (xVal < 15) labelInfo.classList.add('pos-right');
            else if (yVal > 80) labelInfo.classList.add('pos-top');

            // BẮT ĐẦU HIỆU ỨNG TIM BAY TẠI VỊ TRÍ NÀY
            startHeartAnimation(xVal, yVal);

            countDisplay.innerText = `${getParticipationCount(currentProvince)} người tham gia`;
            provinceItems.forEach(el => el.classList.remove('selected'));
            this.classList.add('selected');

            setTimeout(() => {
                const r = Math.floor(Math.random() * randomQuestions.length);
                questionText.innerText = randomQuestions[r];
                modalAnswer.value = "";
                
                // Reset file upload
                mediaUploadInput.value = "";
                uploadedFile = null;
                fileNamePreview.innerText = "";
                
                modal.style.display = 'flex';
            }, 400);
        });
    });

    submitModalBtn.addEventListener('click', () => {
        // Cho phép không nhập text nếu đã có ảnh, hoặc ngược lại, nhưng nên nhập ít nhất 1 thứ
        if(modalAnswer.value.trim() === "" && !uploadedFile) {
            alert("Hãy chia sẻ đôi chút cảm xúc hoặc một bức ảnh kỷ niệm nhé!");
            return;
        }
        
        countDisplay.innerText = `${incrementParticipation(currentProvince)} người đã tham gia`;
        modal.style.display = 'none';
        step1View.style.display = 'none';
        step2View.style.display = 'block';
        downloadBtn.style.display = 'none';
        
        userNameInput.value = ""; 
        userContent.value = "";
        
        // Reset Stickers
        selectedStickers = [];
        stickerOpts.forEach(opt => opt.classList.remove('selected'));
        bgDecorLayer.innerHTML = "";
    });

    // --- CHỌN STICKER (MULTI SELECT - TỐI ĐA 3) ---
    window.selectSticker = function(imgEl) {
        const src = imgEl.getAttribute('src');

        if (selectedStickers.includes(src)) {
            selectedStickers = selectedStickers.filter(s => s !== src);
            imgEl.classList.remove('selected');
        } else {
            if (selectedStickers.length >= 3) {
                alert("Bạn chỉ được chọn tối đa 3 Sticker thôi nhé!");
                return;
            }
            selectedStickers.push(src);
            imgEl.classList.add('selected');
        }
    };

    // --- GHIM LÊN BẢN ĐỒ ---
    updateMapBtn.addEventListener('click', (e) => {
        if (userNameInput.value.trim() === "") {
            alert("Bạn ơi, hãy nhập tên nhé!"); return;
        }
        // Cho phép không chọn sticker cũng được nếu không muốn ép buộc
        if (selectedStickers.length === 0) {
             // Optional: alert("Chọn sticker cho đẹp nhé!"); 
        }

        const name = userNameInput.value.trim();
        const starter = starterSelect.value;
        const content = userContent.value.trim();
        let fullText = content ? `${starter} ${content}` : starter;

        // 1. RẢI STICKER
        bgDecorLayer.innerHTML = ""; 
        if (selectedStickers.length > 0) {
            const totalDecor = 20;
            for (let i = 0; i < totalDecor; i++) {
                const img = document.createElement('img');
                const randomSrc = selectedStickers[Math.floor(Math.random() * selectedStickers.length)];
                img.src = randomSrc;
                img.className = "scatter-sticker";
                img.style.left = Math.random() * 95 + '%';
                img.style.top = Math.random() * 95 + '%';
                const size = Math.random() * 25 + 20; 
                img.style.width = size + 'px';
                const rot = Math.random() * 360;
                img.style.transform = `rotate(${rot}deg)`;
                img.style.setProperty('--r', rot + 'deg'); 
                bgDecorLayer.appendChild(img);
            }
        }

        // 2. HIỂN THỊ TÊN & MESSAGE
        resultNameDisplay.innerText = name; 
        
        const MAX_DISPLAY_CHARS = 100;
        let displayText = fullText;
        if (fullText.length > MAX_DISPLAY_CHARS) {
            displayText = fullText.substring(0, MAX_DISPLAY_CHARS) + "...";
        }
        resultMessage.innerText = displayText;
        
        // 3. XỬ LÝ HIỂN THỊ MEDIA (ẢNH/VIDEO)
        resultMediaContainer.innerHTML = ""; // Clear cũ
        resultMediaContainer.style.display = "none";
        
        if (uploadedFile) {
            const fileURL = URL.createObjectURL(uploadedFile);
            const type = uploadedFile.type;
            
            if (type.startsWith('image/')) {
                const img = document.createElement('img');
                img.src = fileURL;
                resultMediaContainer.appendChild(img);
            } else if (type.startsWith('video/')) {
                const vid = document.createElement('video');
                vid.src = fileURL;
                vid.autoplay = true;
                vid.loop = true;
                vid.muted = true; // Video tự chạy thường cần mute
                vid.playsInline = true;
                resultMediaContainer.appendChild(vid);
            }
            resultMediaContainer.style.display = "flex";
        }

        resultOverlay.style.display = 'block';
        downloadBtn.style.display = 'block';
        createFirework(e.clientX, e.clientY);
    });

    backBtn.addEventListener('click', () => {
        step2View.style.display = 'none';
        step1View.style.display = 'block';
        resultOverlay.style.display = 'none'; 
        marker.style.display = 'none'; 
        bgDecorLayer.innerHTML = "";
        stopHeartAnimation(); // Dừng tim bay khi quay lại
    });

    // --- DOWNLOAD ---
    downloadBtn.addEventListener('click', () => {
        const captureArea = document.getElementById('capture-area');
        const originalText = downloadBtn.innerText;
        downloadBtn.innerText = "⏳ Đang xử lý...";

        html2canvas(captureArea, {
            backgroundColor: "#2a0000",
            useCORS: true,
            scale: 2 
        }).then(canvas => {
            const link = document.createElement('a');
            link.download = `Tet2026_${currentProvince}.png`;
            link.href = canvas.toDataURL("image/png");
            link.click();
            downloadBtn.innerText = originalText;
        });
    });

    // --- PHÁO HOA ---
    function createFirework(x, y) {
        const colors = ['#FFD700', '#FF0000', '#FFA500', '#FFFFFF', '#FF69B4'];
        for (let i = 0; i < 30; i++) {
            const p = document.createElement('div');
            Object.assign(p.style, {
                position: 'fixed', left: x + 'px', top: y + 'px',
                width: '6px', height: '6px', backgroundColor: colors[Math.floor(Math.random() * colors.length)],
                borderRadius: '50%', pointerEvents: 'none', zIndex: '3000'
            });
            document.body.appendChild(p);
            const angle = Math.random() * Math.PI * 2;
            const dist = Math.random() * 150 + 50;
            p.animate([
                { transform: 'translate(0, 0) scale(1)', opacity: 1 },
                { transform: `translate(${Math.cos(angle)*dist}px, ${Math.sin(angle)*dist}px) scale(0)`, opacity: 0 }
            ], { duration: 1000, easing: 'ease-out' }).onfinish = () => p.remove();
        }
    }
    
    window.onclick = (event) => {
        if (event.target == modal) modal.style.display = 'none';
    };
});