document.addEventListener('DOMContentLoaded', function () {

    /**
     * 載入經歷資料的共用函式
     * @param {string} jsonFile - JSON 檔案路徑
     * @param {string} containerSelector - 容器選擇器
     * @param {string|null} internalSource - (選填) 如果是內部詳情頁，傳入來源名稱(如 'teaching')；如果是外部連結則不傳或是 null
     */
    function loadExperience(jsonFile, containerSelector, internalSource = null) {
        const listContainer = document.querySelector(containerSelector);

        if (!listContainer) {
            console.error(`Container for ${containerSelector} not found.`);
            return;
        }

        fetch(jsonFile)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Network response was not ok for ${jsonFile}`);
                }
                return response.json();
            })
            .then(data => {
                data.forEach(item => {
                    const cardLink = document.createElement('a');
                    cardLink.className = 'experience-card-link';

                    // === 關鍵修改邏輯開始 ===
                    let targetUrl = "";

                    if (internalSource) {
                        // 【Teaching 模式】：產生內部連結
                        // 這邊一定會有值，所以不用擔心是空字串
                        targetUrl = `detail.html?source=${internalSource}&id=${item.id}`;
                    } else {
                        // 【Develop 模式】：使用 JSON 內的 href
                        // 確保 undefined 或 null 也被視為空字串
                        targetUrl = item.href || "";
                    }

                    // 判斷網址是否有效（移除空白後不為空）
                    if (targetUrl.trim() !== "") {
                        cardLink.setAttribute('href', targetUrl);

                        // 只有外部連結才需要開新分頁
                        if (!internalSource) {
                            cardLink.setAttribute('target', '_blank');
                            cardLink.setAttribute('rel', 'noopener noreferrer');
                        }
                    } else {
                        // 如果網址是空的：
                        // 1. 不設定 href 屬性 (這樣 <a> 標籤就不具備連結功能，點擊無反應)
                        // 2. 將游標改為預設箭頭，讓使用者知道不可點擊
                        cardLink.style.cursor = "default";
                        // 3. 移除 href 屬性以防萬一 (雖然新建立的本來就沒有)
                        cardLink.removeAttribute('href');
                    }
                    // === 關鍵修改邏輯結束 ===

                    cardLink.setAttribute('aria-label', item.ariaLabel);

                    // 這裡的 HTML 結構不變
                    cardLink.innerHTML = `
                        <div class="experience-card">
                            <div class="experience-image">
                                <img src="placeholder.png" data-src="${item.imageSrc}" alt="${item.imageAlt}" loading="lazy">
                            </div>
                            <div class="experience-content">
                                <h4>${item.title}</h4>
                                <p class="muted">${item.date}</p>
                                <p class="description">${item.description}</p>
                            </div>
                        </div>
                    `;
                    listContainer.appendChild(cardLink);
                });

                // 呼叫懶加載處理函式
                initLazyLoading(listContainer);
            })
            .catch(error => {
                console.error(`There was a problem fetching the data from ${jsonFile}:`, error);
            });
    }

    // 懶加載邏輯 (維持不變)
    function initLazyLoading(scopeElement) {
        const lazyImages = scopeElement.querySelectorAll('img[loading="lazy"]');

        if (lazyImages.length === 0) return;

        const observer = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    const src = img.getAttribute('data-src');
                    if (src) {
                        img.src = src;
                        img.removeAttribute('data-src');
                    }
                    observer.unobserve(img);
                }
            });
        });

        lazyImages.forEach(img => observer.observe(img));
    }

    // --- 執行程式 ---

    // 1. 載入開發經歷 (Develop)
    loadExperience('develop.json', '.develop-list-grid');

    // 2. 載入教學經歷 (Teaching)
    loadExperience('teaching.json', '.teaching-list-grid', 'teaching');
});