document.addEventListener("DOMContentLoaded", function() {
    fetch('resume.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('網路回應不成功');
            }
            return response.json();
        })
        .then(data => {
            const resumeList = document.getElementById('resume-list');
            if (!resumeList) return;

            // 解析中文日期的函式 (自動抓出裡面的數字)
            function parseCustomDate(dateStr) {
                if (!dateStr) return 0;
                // 使用正則表達式提取所有數字，例如 ["2026", "9", "21"]
                const numbers = dateStr.match(/\d+/g); 
                if (!numbers) return 0;
                
                const year = parseInt(numbers[0], 10) || 0;
                const month = parseInt(numbers[1], 10) || 1; // 沒寫月份預設 1 月
                const day = parseInt(numbers[2], 10) || 1;   // 沒寫日期（如：2026 年 9 月）預設 1 日

                return new Date(year, month - 1, day).getTime();
            }

            // 1. 自動排序功能 (時間由舊到新，小到大)
            data.sort((a, b) => parseCustomDate(a.date) - parseCustomDate(b.date));

            // 2. 生成時間軸 HTML
            let htmlContent = '<div class="resume-timeline">';
            
            data.forEach(item => {
                let titleHtml = (item.link && item.link.trim() !== "")
                    ? `<a href="${item.link}" target="_blank" class="timeline-link">${item.title}</a>`
                    : item.title;

                htmlContent += `
                    <div class="timeline-item">
                        <div class="timeline-date">${item.date}</div>
                        <h4 class="timeline-title">${titleHtml}</h4>
                    </div>
                `;
            });

            htmlContent += '</div>';
            resumeList.innerHTML = htmlContent;
        })
        .catch(error => {
            console.error('載入經歷資料時發生錯誤:', error);
            document.getElementById('resume-list').innerHTML = '<p>目前沒有經歷資料。</p>';
        });
});