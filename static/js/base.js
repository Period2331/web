document.addEventListener('DOMContentLoaded', function () {
  // 核心功能：根據 URL 錨點設定導覽列和區塊的 active 狀態
  function setActiveSection() {
    const currentHash = window.location.hash || '#home';
    document.querySelectorAll('.nav-link').forEach(link => {
      link.classList.remove('active');
    });
    document.querySelectorAll('section').forEach(section => {
      section.classList.remove('active');
    });
    const activeLink = document.querySelector(`.nav-link[href="${currentHash}"]`);
    const activeSection = document.querySelector(currentHash);
    if (activeLink) {
      activeLink.classList.add('active');
    }
    if (activeSection) {
      activeSection.classList.add('active');
    }
  }

  // 新增：點擊導覽列連結時，精確捲動到區塊頂部
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', function(event) {
      event.preventDefault();
      const targetId = this.getAttribute('href');
      const targetElement = document.querySelector(targetId);

      if (targetElement) {
        // 先將所有 section 設為非活躍，確保頁面佈局清空
        document.querySelectorAll('section').forEach(section => {
          section.classList.remove('active');
        });

        // 再將目標 section 設為活躍，讓頁面高度調整
        targetElement.classList.add('active');

        // 最後，再執行滾動指令
        targetElement.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });

        // 更新 URL 錨點
        window.location.hash = targetId;
      }
    });
  });

  // 監聽 URL 錨點變化事件
  window.addEventListener('hashchange', setActiveSection);
  setActiveSection();

  // IntersectionObserver 動畫效果
  const cards = document.querySelectorAll('.experience-card');
  const observer = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate__animated', 'animate__fadeInUp');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 },
  );
  cards.forEach((card) => observer.observe(card));
});