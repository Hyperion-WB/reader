# 🧊 LiquidReader (液态玻璃风摸鱼小说阅读器)

> **Windows 专属轻量化摸鱼小说阅读器** —— 主打极致隐蔽办公阅读、零干扰沉浸式阅读双模式。
> 采用**液态拟态玻璃（Liquid Glassmorphism）**视觉风格与**苹果级物理弹簧动效**，深度集成**全网聚合书源（兼容开源阅读 3.0 / Legado 规则）**与**多级办公反侦察伪装矩阵**。

---

## ✨ 核心特性一览

### 1. 🪟 次世代液态玻璃视觉 (Liquid Glass Design System)
* **四档磨砂通透度**：从 100% 纯通透穿透桌面（摸鱼专用），到半透明毛玻璃、深层磨砂质感。
* **1px 菲涅尔动态高光**：边缘柔和折射与内发光，摆脱廉价纯色与生硬黑边。
* **多款护眼调色盘**：`昼间通透`、`暗夜深邃 (OLED)`、`羊皮纸纸质`、`黑客矩阵`、`极致隐形灰`。

### 2. ⚡ 苹果级灵动 Tab 栏 (Apple-Grade Fluid Motion)
* **弹性胶囊 Tab 栏**：基于物理弹簧模型（Spring Physics），左右切换书籍时指示器产生弹性形变拉伸。
* **无缝增删动效**：书籍 Tab 新增滑入、关闭回弹补位，支持多书籍常驻切换阅读。

### 3. 🌐 自定义书源与全网聚合搜书 (Book Source Engine)
* **Legado 3.0 / 开源阅读规则兼容**：支持导入网络或本地书源 JSON / URL 链接，支持 CSS 选择器、XPath 与正则解析。
* **全网多源异步并发搜索**：输入小说名或作者，同时跨多个书源检索，实时流式呈现最新章节与状态。
* **本地多格式解析**：
  * **TXT 智能分章**：自动识别汉字/阿拉伯数字章节正则，自适应 GBK/UTF-8 编码避免乱码。
  * **EPUB 深度解析**：自动解析 Spine 目录与章节富文本，去除冗余样式。

### 4. 🎭 多级办公多维伪装矩阵 (Stealth & Chameleon Suite)
* **0ms 极速老板键**：按下 `Alt + \``（或 `Ctrl + Q`）瞬间抹除窗口与渲染，后台零开销静默，再次按下无缝原位复原。
* **Excel 电子表格模式 (`Alt + E`)**：窗口瞬间化身为 Microsoft Excel 表格，小说内容融入单元格或公式栏。
* **VS Code 命令行模式 (`Alt + C`)**：窗口化身为暗黑代码编辑器，小说内容渲染为代码注释 `// ...`。
* **Win11 便签备忘录模式**：伪装成系统黄色便签备忘录。
* **24px 极窄单行状态条 (`Alt + 1`)**：收缩为系统监测条，单行跑马灯微速滚动。
* **鼠标移出呼吸渐隐**：鼠标离开阅读窗口后平滑降至 5% 隐形透明度，移入瞬间柔和恢复。
* **鼠标穿透模式 (`Alt + P`)**：背景全透明置顶，点击直接作用于下层 Word/IDE。

### 5. 🎧 静默 TTS 听书与数据备份
* 集成自然语音合成引擎，支持后台闭眼听书与语速调节。
* 支持一键导出/导入全量书架、阅读进度、自定义书源 JSON 备份。

---

## ⌨️ 快捷键速查表 (Shortcut Keymap)

| 快捷键 | 功能描述 | 作用范围 |
| :--- | :--- | :--- |
| **`Alt + \``** / **`Ctrl + Q`** | **一键老板键 (极速隐藏 / 唤出)** | 全局 (Global) |
| **`Alt + E`** | **切换 Excel 电子表格伪装模式** | 全局 (Global) |
| **`Alt + C`** | **切换 VS Code 代码注释伪装模式** | 全局 (Global) |
| **`Alt + 1`** | **切换 24px 极简单行状态条模式** | 全局 (Global) |
| **`Alt + P`** | **切换 鼠标穿透模式 (Click-Through)** | 全局 (Global) |
| **`Alt + M`** / **`Tab`** | **打开 / 关闭 侧边抽屉控制中心** | 窗口激活 |
| **`[`** / **`]`** | **上一章 / 下一章** | 窗口激活 |
| **`Space`** / **`PageDown`** | **向下翻页 / 滚动** | 窗口激活 |
| **`PageUp`** | **向上翻页 / 滚动** | 窗口激活 |
| **`Esc`** | **退出伪装模式 / 关闭弹窗** | 窗口激活 |

---

## 🚀 GitHub Actions 自动云端打包流程

本项目已配置完整的 GitHub Actions 自动化编译工作流（`.github/workflows/release.yml`）。无需在本地安装 Visual Studio C++ 编译环境，推送到 GitHub 即可自动打包生成 Windows 安装包：

1. 在 GitHub 上创建一个新的公开或私有仓库。
2. 将本地代码推送到该仓库：
   ```bash
   git init
   git add .
   git commit -m "feat: initial LiquidReader release"
   git branch -M main
   git remote add origin <您的 GitHub 仓库地址>
   git push -u origin main
   ```
3. 发布版本并自动打包：
   * 推送版本标签：
     ```bash
     git tag v1.0.0
     git push origin v1.0.0
     ```
   * 或者进入 GitHub 仓库页面点击 **Actions** -> **Release Build** -> **Run workflow** 手动触发。
4. GitHub Actions 将在 Windows 虚拟机上自动编译生成 `.msi` 与 `.exe` 安装包，并在 Releases 页面生成下载链接。
