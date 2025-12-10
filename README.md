# HTML Web PPT 演示系统

这是一个轻量级、高度可定制的 Web PPT 演示框架。它允许你使用标准 HTML、CSS 和 JavaScript 编写演示文稿，并通过 JSON 文件进行配置。本项目结构清晰，只需关注页面内容的编写，即可生成支持动画、全屏和进度管理的演示系统。

## 🌟 功能特性

*   **配置驱动**：通过 `setting.json` 管理页面顺序、比例和交互方式。
*   **动态加载**：自动读取 HTML 片段，无需重复编写网页骨架。
*   **内置动画**：提供基础的进场动画类（淡入、上浮、左滑），支持延时。
*   **全屏模式**：支持一键切换浏览器全屏，沉浸式演示。
*   **进度管理**：底部自动显示当前页码及进度条。
*   **键盘控制**：支持方向键、空格键和回车键翻页。

---

## 📁 目录结构说明

```text
PPT/
├── index.html # [核心] PPT 入口文件（无需修改）
├── setting.json # [核心] 全局配置文件（页面列表、比例、标题）
├── config.json # [扩展] API 及后端配置（预留）
├── readme.md # 说明文档
├── PAGES/ # [内容] 存放每一页的 HTML 内容文件
│ ├── page1.html
│ └── ...
├── CSS/ # [样式]
│ └── style.css # 核心样式表
├── JavaScript/ # [脚本]
│ └── main.js # 核心逻辑脚本
├── static/ # [资源] 存放静态文件
│ ├── image/ # 图片
│ ├── video/ # 视频
│ └── icon/ # 图标
└── ... # 其他文件夹（plugins, api 等暂时预留）
```

---

## 🚀 快速开始 (必读)

⚠️ **注意**：由于浏览器安全策略（CORS 跨域限制），**不能直接双击 `index.html` 打开**，否则会导致无法读取 JSON 配置和 HTML 页面文件。你必须在本地服务器环境下运行。

请选择以下任一方式启动：

### 方式 1：使用 VS Code (推荐，最简单)
1.  安装 VS Code 编辑器。
2.  在 VS Code 扩展商店中搜索并安装 **"Live Server"** 插件。
3.  用 VS Code 打开 `PPT` 文件夹。
4.  右键点击 `index.html` 文件，选择 **"Open with Live Server"**。
5.  浏览器将自动弹出并显示 PPT。

### 方式 2：使用 Python
如果你安装了 Python 环境，可以在 `PPT` 文件夹根目录下打开命令行/终端，输入：
```bash
# Python 3.x
python -m http.server
```
然后打开浏览器访问 `http://localhost:8000`。

### 方式 3：使用 Node.js
如果你安装了 Node.js，可以使用 `http-server`：
```bash
npx http-server
```
然后访问终端提示的地址（通常是 `http://127.0.0.1:8080`）。

---

## 📝 制作指南

### 1. 全局配置 (`setting.json`)
在开始制作前，可以在此文件中调整基础设置：

```json
{
"projectTitle": "演示文稿标题", // 浏览器标签页标题
"aspectRatio": "16:9", // PPT 比例，支持 "16:9", "4:3" 等
"clickToFlip": true, // 是否启用点击屏幕空白处翻页
"pages": [ // 【重要】页面播放顺序列表
 "page1.html",
 "page2.html"
]
}
```

### 2. 编写页面内容
1.  在 `PAGES` 文件夹中新建 HTML 文件（例如 `new-page.html`）。
2.  **不需要**写 `<html>`、`<head>` 或 `<body>` 标签，直接编写内容代码。
3.  **引用静态资源**：路径需相对于 `index.html`。
    *   ❌ 错误：`../static/image/a.jpg`
    *   ✅ 正确：`./static/image/a.jpg`

**示例代码：**
```html
<div class="my-slide">
 <h1>标题内容</h1>
 <img src="./static/image/demo.jpg" alt="演示图片" style="width: 50%;">
</div>
```

### 3. 使用内置动画
系统在 `CSS/style.css` 中预置了一些简单的动画类，直接添加到 HTML 标签上即可生效：

*   **动画类型**：
    *   `anim-up`: 元素从下方浮现。
    *   `anim-left`: 元素从左侧滑入。
    *   `fade-in`: 简单的淡入（默认页面切换效果）。
*   **动画延时**（用于让元素依次出现）：
    *   `delay-1`: 延迟 0.2秒
    *   `delay-2`: 延迟 0.5秒
    *   `delay-3`: 延迟 0.8秒

**动画示例：**
```html
<!-- 标题先出来，列表项依次出来 -->
<h2 class="anim-up">目录</h2>
<ul>
 <li class="anim-up delay-1">第一章</li>
 <li class="anim-up delay-2">第二章</li>
 <li class="anim-up delay-3">第三章</li>
</ul>
```

### 4. 注册页面
编写完新的 HTML 文件后，务必在 `setting.json` 的 `"pages"` 数组中添加该文件名，否则 PPT 无法显示该页。

---

## 🎮 操作快捷键

| 按键 / 操作 | 功能 |
| :--- | :--- |
| **鼠标点击** | 下一页 (需在配置中开启 `clickToFlip`) |
| **→** (右箭头) | 下一页 |
| **Space** (空格) | 下一页 |
| **Enter** (回车) | 下一页 |
| **←** (左箭头) | 上一页 |
| **F** 键 | 开启/退出全屏模式 |
| **屏幕右下角按钮** | 翻页及全屏控制 |

---

## ❓ 常见问题 (FAQ)

**Q: 打开显示 "Loading..." 或一片空白？**
A: 请检查是否直接双击打开了 `index.html`。请参考“快速开始”章节，使用本地服务器运行。同时按 `F12` 查看控制台是否有红色报错。

**Q: 图片显示不出来？**
A: 请检查图片路径。因为所有页面最终都是注入到 `index.html` 中显示的，所以图片路径应该是相对于根目录的，例如 `./static/image/photo.png`。

**Q: 如何修改配色？**
A: 打开 `CSS/style.css`，修改 `:root` 下的变量（如 `--bg-color`, `--text-color`）即可全局换色。
```
