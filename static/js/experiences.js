document.addEventListener('DOMContentLoaded', function () {
    const experienceListContainer = document.querySelector('.experience-list');
    const filterContainer = document.getElementById('filter-container');

    // 全域變數儲存所有資料，以便重複篩選使用
    let allExperienceData = [];

    // 防呆機制
    if (!experienceListContainer) return;

    fetch('experiences.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            // 🌟 新增：日期自動排序魔法
            data.sort((a, b) => {
                // 將 "2026 年 8 月" 轉換為數字 202608 來比大小
                function parseDate(dateStr) {
                    if (!dateStr) return 0;
                    // 使用正則表達式抓出年份與月份的數字
                    const match = dateStr.match(/(\d{4})\s*年\s*(\d{1,2})\s*月/);
                    if (match) {
                        const year = parseInt(match[1], 10);
                        const month = parseInt(match[2], 10);
                        return year * 100 + month; // 算出如 202608
                    }
                    return 0; // 如果遇到沒有寫日期的，就排到最後面
                }

                const dateA = parseDate(a.date);
                const dateB = parseDate(b.date);

                // 降冪排序：數字大的（最新的）排前面
                return dateB - dateA;
            });

            // 1. 儲存排序過後的資料
            allExperienceData = data;

            // 2. 初始化篩選器 (產生按鈕)
            initFilters(data);

            // 3. 初始渲染所有內容
            renderItems(data);
        })
        // .then(data => {
        //     // 1. 儲存資料
        //     allExperienceData = data;

        //     // 2. 初始化篩選器 (產生按鈕)
        //     initFilters(data);

        //     // 3. 初始渲染所有內容
        //     renderItems(data);
        // })
        .catch(error => {
            console.error('There was a problem fetching the data:', error);
        });

    /**
     * 初始化篩選按鈕
     * @param {Array} data - 完整的資料陣列
     */
    function initFilters(data) {
        if (!filterContainer) return;

        // 收集所有唯一的 Tag
        const tagsSet = new Set();
        data.forEach(item => {
            if (item.tags && Array.isArray(item.tags)) {
                item.tags.forEach(tag => tagsSet.add(tag));
            }
        });

        // 轉換為陣列並加入 "全部" 選項
        const tags = ['全部', ...Array.from(tagsSet)];

        // 產生按鈕 HTML
        filterContainer.innerHTML = ''; // 清空
        tags.forEach((tag, index) => {
            const btn = document.createElement('button');
            btn.className = 'filter-btn';
            btn.textContent = tag;
            // 預設選中第一個 "全部"
            if (index === 0) btn.classList.add('active');

            // 綁定點擊事件
            btn.addEventListener('click', () => {
                // 1. 移除其他按鈕的 active 樣式
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                // 2. 加上當前按鈕 active
                btn.classList.add('active');
                // 3. 執行篩選
                filterData(tag);
            });

            filterContainer.appendChild(btn);
        });
    }

    /**
     * 執行篩選邏輯
     * @param {string} tag - 被點擊的 Tag 名稱
     */
    function filterData(tag) {
        if (tag === '全部') {
            renderItems(allExperienceData);
        } else {
            const filteredData = allExperienceData.filter(item =>
                item.tags && item.tags.includes(tag)
            );
            renderItems(filteredData);
        }
    }

    /**
     * 渲染卡片 (原本的邏輯封裝在此)
     * @param {Array} items - 要顯示的資料陣列
     */
    function renderItems(items) {
        // 先清空目前的列表
        experienceListContainer.innerHTML = '';

        // 如果沒有資料顯示提示 (可選)
        if (items.length === 0) {
            experienceListContainer.innerHTML = '<p class="text-center w-100">沒有找到相關內容。</p>';
            return;
        }

        items.forEach(item => {
            // 1. 建立外層的 a 標籤
            const cardLink = document.createElement('a');
            cardLink.className = 'experience-card-link';

            // === 連結判斷邏輯 ===
            let targetUrl = "";

            if (item.useInternal) {
                targetUrl = `detail.html?source=${item.source}&id=${item.id}`;
            } else {
                targetUrl = item.href || "";
            }

            if (targetUrl.trim() !== "") {
                cardLink.href = targetUrl;
                if (item.useInternal) {
                    cardLink.target = "_self";
                } else {
                    cardLink.target = "_blank";
                    cardLink.rel = "noopener noreferrer";
                }
            } else {
                cardLink.style.cursor = "default";
                // 確保移除 href
                cardLink.removeAttribute('href');
            }

            cardLink.setAttribute('aria-label', item.ariaLabel);

            // 2. 建立 experience-card div
            const cardDiv = document.createElement('div');
            cardDiv.className = 'experience-card';

            // 3. 建立圖片區塊
            const imageDiv = document.createElement('div');
            imageDiv.className = 'experience-image';

            const img = document.createElement('img');
            img.src = item.imageSrc || 'static/img/placeholder.png';
            img.alt = item.imageAlt || '';
            img.loading = 'lazy';

            // 簡單樣式設定
            img.style.width = "100%";
            img.style.height = "100%";
            img.style.objectFit = "cover";

            imageDiv.appendChild(img);

            // 4. 建立內容區塊
            const contentDiv = document.createElement('div');
            contentDiv.className = 'experience-content';

            const titleH4 = document.createElement('h4');
            titleH4.innerHTML = item.title;

            const dateP = document.createElement('p');
            dateP.className = 'muted';
            dateP.textContent = item.date;

            // --- 新增：顯示 tags 在卡片上 (選填) ---
            // 如果你想在卡片裡面也看到這些 tag，可以打開下面的註解
            /*
            if (item.tags && item.tags.length > 0) {
                const tagsDiv = document.createElement('div');
                tagsDiv.style.marginTop = '8px';
                item.tags.forEach(t => {
                    const span = document.createElement('span');
                    span.textContent = `#${t} `;
                    span.style.fontSize = '0.85rem';
                    span.style.color = '#666';
                    span.style.marginRight = '5px';
                    tagsDiv.appendChild(span);
                });
                contentDiv.appendChild(tagsDiv);
            }
            */
            // ------------------------------------

            contentDiv.appendChild(titleH4);
            contentDiv.appendChild(dateP);

            // 5. 組合所有元素
            cardDiv.appendChild(imageDiv);
            cardDiv.appendChild(contentDiv);
            cardLink.appendChild(cardDiv);

            // 加入容器
            experienceListContainer.appendChild(cardLink);
        });
    }
});