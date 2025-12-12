/* main.js */
document.addEventListener('DOMContentLoaded', initPPT);

let config = {};
let settings = {};
let currentPageIndex = 0;
let totalPages = 0;
const container = document.getElementById('ppt-container');
const contentDiv = document.getElementById('slide-content');
const progressBar = document.getElementById('progress-bar');
const pageIndicator = document.getElementById('page-indicator');

async function initPPT() {
    try {
        if (window.location.protocol === 'file:') {
            alert('警告：直接双击打开可能导致无法加载外部文件。请使用 VS Code "Live Server" 或本地服务器运行。');
        }

        const [confRes, setRes] = await Promise.all([
            fetch('./config.json'),
            fetch('./setting.json')
        ]);

        if (!confRes.ok || !setRes.ok) throw new Error("配置文件加载失败");

        config = await confRes.json();
        settings = await setRes.json();

        applySettings();

        totalPages = settings.pages.length;
        if (totalPages > 0) {
            loadPage(0);
        } else {
            contentDiv.innerHTML = '<div style="padding:20px; text-align:center;">setting.json 中未配置页面</div>';
        }

        setupEventListeners();

    } catch (error) {
        console.error('PPT 初始化错误:', error);
        contentDiv.innerHTML = `<div style="color:red; text-align:center;">加载失败: ${error.message}<br>请按 F12 查看控制台</div>`;
    }
}

function applySettings() {
    document.title = settings.projectTitle || "Web PPT";
    if (settings.aspectRatio) {
        container.style.aspectRatio = settings.aspectRatio.replace(':', '/');
    }
}

async function loadPage(index) {
    if (index < 0 || index >= totalPages) return;

    currentPageIndex = index;
    updateControls();

    try {
        const pageFile = settings.pages[index];
        const res = await fetch(`./PAGES/${pageFile}`);
        if (!res.ok) throw new Error(`页面 ${pageFile} 加载失败`);
        
        const htmlContent = await res.text();
        
        contentDiv.classList.remove('fade-in');
        void contentDiv.offsetWidth; 
        
        contentDiv.innerHTML = htmlContent;
        contentDiv.classList.add('fade-in');

    } catch (error) {
        contentDiv.innerHTML = `<h1>页面加载错误</h1><p>${error.message}</p>`;
    }
}

function updateControls() {
    pageIndicator.innerText = `${currentPageIndex + 1} / ${totalPages}`;
    
    const progress = ((currentPageIndex + 1) / totalPages) * 100;
    progressBar.style.width = `${progress}%`;

    document.getElementById('btn-prev').disabled = currentPageIndex === 0;
    document.getElementById('btn-next').disabled = currentPageIndex === totalPages - 1;
}

function changePage(offset) {
    const newIndex = currentPageIndex + offset;
    
    if (offset === 1 && currentPageIndex === totalPages - 1) {
        if (document.fullscreenElement) {
            document.exitFullscreen().catch(err => {
                console.warn("退出全屏失败:", err);
            });
            loadPage(0);
            return; 
        }
    }
    
    if (newIndex >= 0 && newIndex < totalPages) {
        loadPage(newIndex);
    }
}

function toggleFullscreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(err => {
            console.error(`全屏启用失败: ${err.message}`);
        });
    } else {
        document.exitFullscreen();
    }
}

function setupEventListeners() {
    // 1. 按钮点击事件
    document.getElementById('btn-prev').addEventListener('click', (e) => {
        e.stopPropagation();
        changePage(-1);
    });
    
    document.getElementById('btn-next').addEventListener('click', (e) => {
        e.stopPropagation();
        changePage(1);
    });

    document.getElementById('btn-fullscreen').addEventListener('click', (e) => {
        e.stopPropagation();
        toggleFullscreen();
    });

    // 2. 键盘控制事件
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'Enter') changePage(1);
        if (e.key === 'ArrowLeft') changePage(-1);
        if (e.key === 'f') toggleFullscreen();
    });

    // 3. 点击屏幕翻页 (如果设置开启)
    if (settings.clickToFlip) {
        container.addEventListener('click', () => {
            changePage(1);
        });
    }

    // 4. 全屏变化监听
    document.addEventListener('fullscreenchange', () => {
        if (document.fullscreenElement) {
            document.body.classList.add('fullscreen');
        } else {
            document.body.classList.remove('fullscreen');
        }
    });

    // === 新增：鼠标滚轮翻页逻辑 ===
    let lastWheelTime = 0; // 上次滚动的时间戳
    const wheelCooldown = 800; // 冷却时间 800ms (配合动画时间，防止连翻)

    document.addEventListener('wheel', (e) => {
        const now = Date.now();
        // 检查冷却时间
        if (now - lastWheelTime < wheelCooldown) return;

        // 检查滚动阈值（防止笔记本触摸板微小抖动触发）
        if (Math.abs(e.deltaY) < 30) return;

        if (e.deltaY > 0) {
            // 向下滚动 -> 下一页
            changePage(1);
            lastWheelTime = now;
        } else {
            // 向上滚动 -> 上一页
            changePage(-1);
            lastWheelTime = now;
        }
    }, { passive: true }); // passive: true 提升滚动性能
}
