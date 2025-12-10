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
        // 检测是否在 file:// 协议下运行，如果是则警告
        if (window.location.protocol === 'file:') {
            alert('警告：直接双击打开可能导致无法加载外部文件。请使用 VS Code "Live Server" 或本地服务器运行。');
        }

        // 1. 并行加载配置文件
        const [confRes, setRes] = await Promise.all([
            fetch('./config.json'),
            fetch('./setting.json')
        ]);

        if (!confRes.ok || !setRes.ok) throw new Error("配置文件加载失败");

        config = await confRes.json();
        settings = await setRes.json();

        // 2. 应用基础设置
        applySettings();

        // 3. 初始化加载第一页
        totalPages = settings.pages.length;
        if (totalPages > 0) {
            loadPage(0);
        } else {
            contentDiv.innerHTML = '<div style="padding:20px; text-align:center;">setting.json 中未配置页面</div>';
        }

        // 4. 绑定事件
        setupEventListeners();

    } catch (error) {
        console.error('PPT 初始化错误:', error);
        contentDiv.innerHTML = `<div style="color:red; text-align:center;">加载失败: ${error.message}<br>请按 F12 查看控制台</div>`;
    }
}

function applySettings() {
    document.title = settings.projectTitle || "Web PPT";
    
    // 设置比例，如果是全屏模式由 CSS 控制，非全屏由这里控制
    if (settings.aspectRatio) {
        container.style.aspectRatio = settings.aspectRatio.replace(':', '/');
    }
}

async function loadPage(index) {
    if (index < 0 || index >= totalPages) return;

    // 更新索引
    currentPageIndex = index;
    
    // 更新UI状态
    updateControls();

    try {
        const pageFile = settings.pages[index];
        const res = await fetch(`./PAGES/${pageFile}`);
        if (!res.ok) throw new Error(`页面 ${pageFile} 加载失败`);
        
        const htmlContent = await res.text();
        
        // 简单的淡入效果重置
        contentDiv.classList.remove('fade-in');
        void contentDiv.offsetWidth; // 触发重绘
        
        contentDiv.innerHTML = htmlContent;
        contentDiv.classList.add('fade-in');

    } catch (error) {
        contentDiv.innerHTML = `<h1>页面加载错误</h1><p>${error.message}</p>`;
    }
}

function updateControls() {
    // 更新页码指示器
    pageIndicator.innerText = `${currentPageIndex + 1} / ${totalPages}`;
    
    // 更新进度条
    const progress = ((currentPageIndex + 1) / totalPages) * 100;
    progressBar.style.width = `${progress}%`;

    // 按钮状态禁用
    document.getElementById('btn-prev').disabled = currentPageIndex === 0;
    document.getElementById('btn-next').disabled = currentPageIndex === totalPages - 1;
}

function changePage(offset) {
    const newIndex = currentPageIndex + offset;
    // === 新增逻辑开始 ===
    // 如果是“下一页”操作，且当前已经是最后一页
    if (offset === 1 && currentPageIndex === totalPages - 1) {
        // 如果当前处于全屏模式
        if (document.fullscreenElement) {
            // 1. 退出全屏
            document.exitFullscreen().catch(err => {
                console.warn("退出全屏失败:", err);
            });
            // 2. 回到第一页
            loadPage(0);
            return; // 结束函数，不再执行后面的翻页逻辑
        }
    }
    // === 新增逻辑结束 ===
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
    // 按钮点击
    document.getElementById('btn-prev').addEventListener('click', (e) => {
        e.stopPropagation(); // 防止冒泡触发容器点击
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

    // 键盘控制
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'Enter') changePage(1);
        if (e.key === 'ArrowLeft') changePage(-1);
        if (e.key === 'f') toggleFullscreen();
    });

    // 点击屏幕翻页 (如果设置开启)
    if (settings.clickToFlip) {
        container.addEventListener('click', () => {
            changePage(1);
        });
    }

    // 监听全屏变化事件，调整CSS样式
    document.addEventListener('fullscreenchange', () => {
        if (document.fullscreenElement) {
            document.body.classList.add('fullscreen');
        } else {
            document.body.classList.remove('fullscreen');
        }
    });
}
