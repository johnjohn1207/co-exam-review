# CO3020 計算機組織：互動式動態題庫與轉譯實驗室 (Computer Organization Review)

> 專為國立中央大學 / 國立東華大學通訊與資工領域「計算機組織 (CO3020)」設計的互動式學習平台。整合 Chapter 1 & Chapter 2 投影片核心觀念、作業實戰題型、動態參數計算題求解器與 12 大 C/MIPS 雙向轉譯矩陣。

📱 **手機／線上即時體驗網址**：[https://johnjohn1207.github.io/co-exam-review/](https://johnjohn1207.github.io/co-exam-review/)

---

## 🌟 核心功能特色

1. **動態計算題庫與即時驗證引擎 (Dynamic Calculation Arena)**：
   - 針對 CPU 效能方程式、加權 CPI、阿姆達爾定律、功耗牆、MIPS 格式編碼與 PC-relative 分支位移等重點題型，支援**無限制隨機變更數值**（點擊「🎲 換一題」）。
   - 內建精確數值求解器，支援浮點數、十六進位機器碼（如 `0x02324020`）、科學記號輸入，自動容錯並即時回饋正誤。
   - 答錯時**自動展開步驟式推導詳解**，完整呈現每一步代入過程。

2. **C / MIPS 雙向轉譯實驗室 (12 大經典題型矩陣)**：
   - 收錄 12 道經典且難度適中的 C/C++ $\leftrightarrow$ MIPS 轉譯題型（包含運算式、陣列常數偏移、分支反轉、不等式比較、While/For 迴圈、巢狀跨步陣列 $D[4j]$、葉程序堆疊管理、遞迴階乘等）。
   - 包含**逐行程式碼對應剖析表 (Line-by-Line Breakdown)** 與**易失分陷阱預警**。

3. **重點精華與公式速查手冊 (Formula Cheat Sheet)**：
   - 完整收錄 Chapter 1 與 Chapter 2 知識樹與所有關鍵公式，支援 KaTeX 數學公式優美排版。

4. **全真模擬隨機測驗模式 (Mock Exam Arena)**：
   - 隨機自題庫抽取 5 道計算題並動態產生新數字，支援計時、即時自動批改、百分制結算與錯題檢討。

5. **高度可擴充架構 (Modular Data-Driven Architecture)**：
   - 純前端零依賴架構，新增 Chapter 3、Chapter 4 講義時只需在 `js/data/` 填入資料檔，系統自動動態掛載。

---

## 🛠️ 本地執行方式

本專案為零依賴純前端應用：
- **Windows 本機**：直接雙擊執行 `開啟練習網站.bat` 或在瀏覽器中開啟 `index.html`。
- **手機或平板**：點擊上方 GitHub Pages 連結即可直接在手機瀏覽器流暢操作。
