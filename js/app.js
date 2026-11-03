// 主應用程式調度器與 UI 渲染模組 (Ch1 - Ch3 整合升級版)

let currentTransMode = "study"; // "study" (對照研讀) 或 "quiz" (盲測默寫)

document.addEventListener("DOMContentLoaded", function() {
  initTheme();
  initTabs();
  renderCheatSheet();
  renderCalculationArena();
  renderTranslationLab();
  renderInteractiveLab();
  renderTeacherCuratedArena();
  renderAssignmentsLab();
  initMockExam();
  initBackToTop();
});

// 1. 主題切換 (深色 / 淺色)
function initTheme() {
  const toggleBtn = document.getElementById("themeToggleBtn");
  const currentTheme = localStorage.getItem("co_theme") || "dark";
  document.documentElement.setAttribute("data-theme", currentTheme);
  updateThemeBtnText(toggleBtn, currentTheme);

  toggleBtn.addEventListener("click", function() {
    const active = document.documentElement.getAttribute("data-theme");
    const next = active === "light" ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("co_theme", next);
    updateThemeBtnText(toggleBtn, next);
  });
}

function updateThemeBtnText(btn, theme) {
  btn.textContent = theme === "light" ? "切換深色主題" : "切換淺色主題";
}

// 2. 標籤頁切換
function initTabs() {
  const tabBtns = document.querySelectorAll(".tab-btn");
  const tabContents = document.querySelectorAll(".tab-content");

  tabBtns.forEach(btn => {
    btn.addEventListener("click", function() {
      const targetId = this.getAttribute("data-tab");
      
      tabBtns.forEach(b => b.classList.remove("active"));
      tabContents.forEach(c => c.classList.remove("active"));

      this.classList.add("active");
      const targetContent = document.getElementById(targetId);
      if (targetContent) {
        targetContent.classList.add("active");
        window.CO_SOLVER.renderMath(targetContent);
      }
    });
  });
}

// 3. 渲染重點精華與公式手冊 (Cheat Sheet)
function renderCheatSheet() {
  const container = document.getElementById("cheatSheetContainer");
  if (!container || !window.CO_DATA) return;

  let html = "";

  window.CO_DATA.chapters.forEach(chap => {
    html += `
      <div class="card" style="margin-bottom: 2rem;">
        <div class="card-header">
          <h2 class="card-title">${chap.title}</h2>
          <span class="badge badge-primary">${chap.shortTitle}</span>
        </div>
        
        <h3 style="font-size: 1rem; color: var(--primary); margin: 1.25rem 0 0.75rem 0;">核心公式速查表</h3>
        <div class="formula-grid">
    `;

    chap.formulas.forEach(f => {
      html += `
        <div class="formula-card">
          <div class="formula-title">${f.name}</div>
          <div class="formula-body">$$${f.formula}$$</div>
        </div>
      `;
    });

    html += `</div><h3 style="font-size: 1rem; color: var(--primary); margin: 1.25rem 0 0.75rem 0;">重點知識樹整理</h3>`;

    chap.summary.forEach((sec, sIdx) => {
      html += `
        <div style="margin-bottom: 1.25rem; background: var(--bg-secondary); padding: 1.15rem 1.25rem; border-radius: var(--radius); border: 1px solid var(--border-color);">
          <h4 style="font-size: 0.98rem; margin-bottom: 0.5rem; color: var(--text-main); font-weight: 700;">${sec.heading}</h4>
          <div style="font-size: 0.9rem; line-height: 1.7; color: var(--text-muted);">${formatMarkdown(sec.content)}</div>
        </div>
      `;
      // 若為 Chapter 3 且為第 2 節（ALU 設計），在其下方動態掛載互動式電路模擬器
      if (chap.id === "ch3" && sIdx === 1) {
        html += getAluSimulatorHtml();
      }
    });

    html += `</div>`;
  });

  container.innerHTML = html;
  initAluSimulator();
  window.CO_SOLVER.renderMath(container);
}

// 4. 渲染動態計算題庫 (Calculation Arena)
function renderCalculationArena() {
  const container = document.getElementById("calculationArenaContainer");
  const filterContainer = document.getElementById("calcFilterContainer");
  if (!container || !window.CO_DATA) return;

  let allProblemDefs = [];
  let filterHtml = `<button class="filter-btn active" data-filter="all">全部章節 (${allProblemCount()})</button>`;

  window.CO_DATA.chapters.forEach(chap => {
    filterHtml += `<button class="filter-btn" data-filter="${chap.id}">${chap.shortTitle} (${chap.dynamicProblems.length})</button>`;
    chap.dynamicProblems.forEach(p => {
      p.chapterId = chap.id;
      allProblemDefs.push(p);
    });
  });

  filterHtml += `<button class="filter-btn" data-filter="hw1">作業一必考題型</button>`;
  filterContainer.innerHTML = filterHtml;

  // 綁定篩選器點擊
  const filterBtns = filterContainer.querySelectorAll(".filter-btn");
  filterBtns.forEach(btn => {
    btn.addEventListener("click", function() {
      filterBtns.forEach(b => b.classList.remove("active"));
      this.classList.add("active");
      const filter = this.getAttribute("data-filter");
      document.querySelectorAll(".calc-card-item").forEach(card => {
        if (filter === "all") {
          card.style.display = "block";
        } else if (filter === "hw1") {
          card.style.display = card.getAttribute("data-is-hw1") === "true" ? "block" : "none";
        } else {
          card.style.display = card.getAttribute("data-chapter") === filter ? "block" : "none";
        }
      });
    });
  });

  // 渲染所有題目卡片
  container.innerHTML = "";
  allProblemDefs.forEach(problemDef => {
    const card = createProblemCard(problemDef);
    container.appendChild(card);
  });

  window.CO_SOLVER.renderMath(container);
}

function allProblemCount() {
  return window.CO_DATA.chapters.reduce((acc, c) => acc + c.dynamicProblems.length, 0);
}

function createProblemCard(problemDef) {
  const card = document.createElement("div");
  card.className = "card calc-card-item";
  card.setAttribute("data-chapter", problemDef.chapterId);
  const isHw1 = problemDef.title.includes("作業一") || (problemDef.id && problemDef.id.includes("cagr")) || (problemDef.id && problemDef.id.includes("stride"));
  card.setAttribute("data-is-hw1", isHw1 ? "true" : "false");
  card.id = `card_${problemDef.id}`;

  refreshCardContent(card, problemDef);
  return card;
}

function refreshCardContent(card, problemDef) {
  const instance = window.CO_SOLVER.instantiateQuestion(problemDef);
  const isHw1 = card.getAttribute("data-is-hw1") === "true";

  card.innerHTML = `
    <div class="card-header">
      <div>
        <div style="display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap;">
          <h3 class="card-title">${instance.title}</h3>
          ${isHw1 ? '<span class="tag-badge tag-hw1">作業一高頻必考</span>' : ''}
        </div>
        <span style="font-size: 0.8rem; color: var(--text-muted);">類別：${instance.category}</span>
      </div>
      <button class="action-btn btn-secondary refresh-btn" style="font-size: 0.8rem; padding: 0.35rem 0.75rem;">
        換一題（隨機數值）
      </button>
    </div>

    <div class="question-prompt">
      ${formatMarkdown(instance.renderedText)}
    </div>

    <div class="interactive-area">
      <div class="input-group">
        <label style="font-size: 0.9rem; font-weight: 600;">您的計算答案：</label>
        <input type="text" class="answer-input" placeholder="請輸入數值、狀態字串或十六進位碼 (如 0x...)" />
        <span style="font-size: 0.9rem; color: var(--text-muted); font-weight: 600;">${instance.solution.unit || ""}</span>
      </div>
      <button class="action-btn btn-primary verify-btn">
        送出驗證
      </button>
    </div>

    <div class="feedback-msg"></div>

    <div class="solution-box">
      <div class="solution-toggle">
        <span>查看詳細解題步驟與推導</span>
        <span class="toggle-icon">▼</span>
      </div>
      <div class="solution-content">
        ${formatMarkdown(instance.solution.explanation)}
      </div>
    </div>
  `;

  // 綁定事件
  const verifyBtn = card.querySelector(".verify-btn");
  const refreshBtn = card.querySelector(".refresh-btn");
  const inputEl = card.querySelector(".answer-input");
  const feedbackEl = card.querySelector(".feedback-msg");
  const solutionToggle = card.querySelector(".solution-toggle");
  const solutionContent = card.querySelector(".solution-content");
  const toggleIcon = card.querySelector(".toggle-icon");

  if (verifyBtn && inputEl && feedbackEl && solutionContent) {
    verifyBtn.addEventListener("click", function() {
      const res = window.CO_SOLVER.verify(problemDef.id, inputEl.value);
      feedbackEl.className = `feedback-msg show ${res.isCorrect ? "feedback-success" : "feedback-error"}`;
      feedbackEl.innerHTML = `<strong>${res.isCorrect ? "驗證正確" : "未通過"}</strong>：${res.message}`;
      if (!res.isCorrect) {
        solutionContent.classList.add("open");
        if (toggleIcon) toggleIcon.textContent = "▲";
      }
      window.CO_SOLVER.renderMath(feedbackEl);
    });

    inputEl.addEventListener("keydown", function(e) {
      if (e.key === "Enter") {
        verifyBtn.click();
      }
    });
  }

  if (refreshBtn) {
    refreshBtn.addEventListener("click", function() {
      refreshCardContent(card, problemDef);
      window.CO_SOLVER.renderMath(card);
    });
  }

  if (solutionToggle && solutionContent) {
    solutionToggle.addEventListener("click", function() {
      solutionContent.classList.toggle("open");
      if (toggleIcon) toggleIcon.textContent = solutionContent.classList.contains("open") ? "▲" : "▼";
      window.CO_SOLVER.renderMath(solutionContent);
    });
  }
}

// 5. 渲染 C/C++ 與 MIPS 雙向轉譯特訓中心 (Translation Lab)
function renderTranslationLab() {
  const container = document.getElementById("translationLabContainer");
  const filterContainer = document.getElementById("transFilterContainer");
  const btnStudy = document.getElementById("btnModeStudy");
  const btnQuiz = document.getElementById("btnModeQuiz");
  if (!container || !window.CO_DATA) return;

  const list = window.CO_DATA.translations;

  // 模式切換按鈕
  if (btnStudy && btnQuiz) {
    btnStudy.onclick = () => {
      currentTransMode = "study";
      btnStudy.classList.add("active");
      btnQuiz.classList.remove("active");
      applyTransMode();
    };
    btnQuiz.onclick = () => {
      currentTransMode = "quiz";
      btnQuiz.classList.add("active");
      btnStudy.classList.remove("active");
      applyTransMode();
    };
  }

  filterContainer.innerHTML = `
    <button class="filter-btn active" data-filter="all">全部 (${list.length})</button>
    <button class="filter-btn" data-filter="hw1">作業一必考 (${list.filter(x => x.title.includes('作業一')).length})</button>
    <button class="filter-btn" data-filter="hw2">作業二核心 (${list.filter(x => x.title.includes('作業二')).length})</button>
    <button class="filter-btn" data-filter="C -> MIPS">C 轉 MIPS (${list.filter(x => x.direction === "C -> MIPS").length})</button>
    <button class="filter-btn" data-filter="MIPS -> C">MIPS 轉 C (${list.filter(x => x.direction === "MIPS -> C").length})</button>
  `;

  const filterBtns = filterContainer.querySelectorAll(".filter-btn");
  filterBtns.forEach(btn => {
    btn.addEventListener("click", function() {
      filterBtns.forEach(b => b.classList.remove("active"));
      this.classList.add("active");
      const f = this.getAttribute("data-filter");
      document.querySelectorAll(".trans-card-item").forEach(card => {
        if (f === "all") {
          card.style.display = "block";
        } else if (f === "hw1") {
          card.style.display = card.getAttribute("data-is-hw1") === "true" ? "block" : "none";
        } else if (f === "hw2") {
          card.style.display = card.getAttribute("data-is-hw2") === "true" ? "block" : "none";
        } else {
          card.style.display = card.getAttribute("data-dir") === f ? "block" : "none";
        }
      });
    });
  });

  let html = "";
  list.forEach(item => {
    const isHw1 = item.title.includes("作業一");
    const isHw2 = item.title.includes("作業二");

    html += `
      <div class="card trans-card-item" data-dir="${item.direction}" data-is-hw1="${isHw1}" data-is-hw2="${isHw2}">
        <div class="card-header">
          <div>
            <div style="display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap;">
              <h3 class="card-title">${item.title}</h3>
              ${isHw1 ? '<span class="tag-badge tag-hw1">作業一必考</span>' : ''}
              ${isHw2 ? '<span class="tag-badge tag-hw2">作業二核心</span>' : ''}
            </div>
            <p style="font-size: 0.85rem; color: var(--text-muted); margin-top: 0.25rem;">${item.description}</p>
          </div>
          <div style="display: flex; gap: 0.5rem; align-items: center;">
            <span class="badge ${item.direction === 'C -> MIPS' ? 'badge-primary' : 'badge-warning'}">${item.direction}</span>
            <span class="badge badge-success">${item.level}</span>
          </div>
        </div>

        <!-- 盲測默寫自評作答區 (僅在 quiz 模式顯示) -->
        <div class="quiz-container-area" style="display: none;">
          <div class="quiz-attempt-box">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="font-size: 0.9rem; font-weight: 700; color: var(--primary);">盲測默寫特訓區：請嘗試寫出對應的 ${item.direction === 'C -> MIPS' ? 'MIPS 組合語言' : 'C 語言'} 程式碼</span>
              <span style="font-size: 0.8rem; color: var(--text-muted);">（輸入後點擊核對解答）</span>
            </div>
            <textarea class="quiz-textarea" placeholder="在此處鍵入您的作答代碼...例如：&#10;addi $sp, $sp, -4&#10;sw   $s0, 0($sp)..."></textarea>
            <div class="quiz-controls">
              <button class="action-btn btn-secondary btn-show-hint">查看解題提示</button>
              <button class="action-btn btn-primary btn-reveal-ans">核對解答與逐行剖析</button>
            </div>
            <div class="hint-box">
              <strong>解題關鍵提示：</strong>${item.hint || "請注意暫存器配置約定、Word 邊界對齊與分支反轉。"}
            </div>
          </div>
        </div>

        <!-- 對照檢視區塊 -->
        <div class="code-comparison-grid">
          <div class="code-panel panel-c">
            <div class="code-panel-header">
              <span>C / C++ 程式原始碼</span>
              <button class="copy-code-btn" onclick="copyToClipboard(this)">複製代碼</button>
            </div>
            <pre class="code-content">${escapeHtml(item.cCode)}</pre>
          </div>
          <div class="code-panel panel-mips">
            <div class="code-panel-header">
              <span>MIPS 組合語言對應實作</span>
              <button class="copy-code-btn" onclick="copyToClipboard(this)">複製代碼</button>
            </div>
            <pre class="code-content" style="color: #4ade80;">${escapeHtml(item.mipsCode)}</pre>
          </div>
        </div>

        <div class="solution-box details-box">
          <div class="solution-toggle">
            <span>逐行轉譯對應解析與暫存器追蹤 (Line-by-Line Breakdown)</span>
            <span class="toggle-arrow">▼</span>
          </div>
          <div class="solution-content">
            <table class="line-breakdown-table">
              <thead>
                <tr>
                  <th style="width: 35%;">MIPS 組合語言語句</th>
                  <th>硬體行為與轉譯語意剖析</th>
                </tr>
              </thead>
              <tbody>
                ${item.lineByLine.map(lb => `
                  <tr>
                    <td><code>${escapeHtml(lb.line)}</code></td>
                    <td>${lb.explain}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>

        <div class="pitfall-callout details-pitfall">
          <div class="pitfall-title">常見考試易失分陷阱剖析</div>
          <div>${item.pitfalls}</div>
        </div>
      </div>
    `;
  });

  container.innerHTML = html;

  // 綁定摺疊展開
  container.querySelectorAll(".solution-toggle").forEach(toggle => {
    toggle.addEventListener("click", function() {
      const content = this.nextElementSibling;
      const arrow = this.querySelector(".toggle-arrow");
      content.classList.toggle("open");
      if (arrow) arrow.textContent = content.classList.contains("open") ? "▲" : "▼";
    });
  });

  // 綁定 Quiz 事件
  container.querySelectorAll(".trans-card-item").forEach(card => {
    const hintBtn = card.querySelector(".btn-show-hint");
    const hintBox = card.querySelector(".hint-box");
    const revealBtn = card.querySelector(".btn-reveal-ans");
    const targetPanel = card.getAttribute("data-dir") === "C -> MIPS" ? card.querySelector(".panel-mips") : card.querySelector(".panel-c");
    const detailsBox = card.querySelector(".details-box");
    const detailsPitfall = card.querySelector(".details-pitfall");

    if (hintBtn && hintBox) {
      hintBtn.addEventListener("click", () => {
        hintBox.classList.toggle("show");
      });
    }

    if (revealBtn) {
      revealBtn.addEventListener("click", () => {
        if (targetPanel) targetPanel.style.display = "block";
        if (detailsBox) detailsBox.style.display = "block";
        if (detailsPitfall) detailsPitfall.style.display = "block";
        revealBtn.textContent = "已展開權威解答";
        revealBtn.classList.remove("btn-primary");
        revealBtn.classList.add("btn-secondary");
      });
    }
  });

  applyTransMode();
}

function applyTransMode() {
  document.querySelectorAll(".trans-card-item").forEach(card => {
    const quizArea = card.querySelector(".quiz-container-area");
    const isCtoMips = card.getAttribute("data-dir") === "C -> MIPS";
    const mipsPanel = card.querySelector(".panel-mips");
    const cPanel = card.querySelector(".panel-c");
    const detailsBox = card.querySelector(".details-box");
    const detailsPitfall = card.querySelector(".details-pitfall");
    const revealBtn = card.querySelector(".btn-reveal-ans");

    if (currentTransMode === "study") {
      if (quizArea) quizArea.style.display = "none";
      if (mipsPanel) mipsPanel.style.display = "block";
      if (cPanel) cPanel.style.display = "block";
      if (detailsBox) detailsBox.style.display = "block";
      if (detailsPitfall) detailsPitfall.style.display = "block";
    } else {
      // quiz 模式
      if (quizArea) quizArea.style.display = "block";
      if (isCtoMips) {
        if (cPanel) cPanel.style.display = "block";
        if (mipsPanel) mipsPanel.style.display = "none";
      } else {
        if (mipsPanel) mipsPanel.style.display = "block";
        if (cPanel) cPanel.style.display = "none";
      }
      if (detailsBox) detailsBox.style.display = "none";
      if (detailsPitfall) detailsPitfall.style.display = "none";
      if (revealBtn) {
        revealBtn.textContent = "核對解答與逐行剖析";
        revealBtn.classList.add("btn-primary");
        revealBtn.classList.remove("btn-secondary");
      }
    }
  });
}

// 6. 渲染作業一與作業二全真變種與默寫實戰特訓中心
function renderAssignmentsLab() {
  const container = document.getElementById("assignmentsLabContainer");
  if (!container) return;

  container.innerHTML = `
    <!-- 頂部導引卡片與子分頁切換 -->
    <div class="card" style="margin-bottom: 1.5rem; border-left: 4px solid var(--primary);">
      <div class="card-header" style="flex-wrap: wrap; gap: 0.75rem;">
        <div>
          <h2 class="card-title" style="color: var(--primary);">作業一與作業二全真變種與默寫實戰特訓中心</h2>
          <div style="font-size: 0.88rem; color: var(--text-muted); margin-top: 0.25rem;">
            專門針對期中考高頻命題：<strong>MIPS 雙遞迴（Fibonacci）、階乘（Factorial）指令逐行解構、手寫挖空填空、全程式白板默寫</strong> 與 <strong>HW1 動態變種計算題</strong>。
          </div>
        </div>
        <span class="tag-badge tag-hw2">期中考必抓分專區</span>
      </div>

      <!-- 子標籤切換導航按鈕 -->
      <div class="mode-switch-bar" style="margin-top: 1.25rem; display: flex; flex-wrap: wrap; gap: 0.5rem;">
        <button class="mode-btn active" id="btnHwSub1">1. 指令功能逐行解構抽測（哪個指令是幹嘛的）</button>
        <button class="mode-btn" id="btnHwSub2">2. 手寫默寫特訓（挖空填空與全程式白板）</button>
        <button class="mode-btn" id="btnHwSub3">3. 作業一 7 大動態變種刷題</button>
        <button class="mode-btn" id="btnHwSub4">4. 期中筆試 5 大致命陷阱與 MARS 實戰</button>
      </div>
    </div>

    <!-- 子容器 1：指令功能解構與即時抽測 -->
    <div id="hwSubView1" class="hw-sub-view"></div>

    <!-- 子容器 2：手寫默寫特訓（挖空與白板） -->
    <div id="hwSubView2" class="hw-sub-view" style="display: none;"></div>

    <!-- 子容器 3：作業一動態變種 -->
    <div id="hwSubView3" class="hw-sub-view" style="display: none;"></div>

    <!-- 子容器 4：致命陷阱與 MARS 實戰 -->
    <div id="hwSubView4" class="hw-sub-view" style="display: none;"></div>
  `;

  // 子分頁切換邏輯
  const tabs = [
    { btn: "btnHwSub1", view: "hwSubView1" },
    { btn: "btnHwSub2", view: "hwSubView2" },
    { btn: "btnHwSub3", view: "hwSubView3" },
    { btn: "btnHwSub4", view: "hwSubView4" }
  ];

  tabs.forEach(t => {
    const b = document.getElementById(t.btn);
    if (!b) return;
    b.addEventListener("click", () => {
      tabs.forEach(x => {
        const btnEl = document.getElementById(x.btn);
        const viewEl = document.getElementById(x.view);
        if (btnEl) btnEl.classList.remove("active");
        if (viewEl) viewEl.style.display = "none";
      });
      b.classList.add("active");
      const targetView = document.getElementById(t.view);
      if (targetView) targetView.style.display = "block";
    });
  });

  // 掛載各子視圖
  renderHwSubView1();
  renderHwSubView2();
  renderHwSubView3();
  renderHwSubView4();
}

// ---------------------------------------------------------------------------
// 子視圖 1：指令功能逐行解構與即時抽測（哪個指令是幹嘛的）
// ---------------------------------------------------------------------------
function renderHwSubView1() {
  const container = document.getElementById("hwSubView1");
  if (!container || !window.CO_ASSIGNMENT_DATA) return;

  let currentSub = "fib"; // "fib" or "fact"
  let currentQuizIdx = 0;

  const getSubCode = (sub) => {
    if (sub === "fib") {
      return [
        { line: "fib: addi $sp, $sp, -12", tag: "Prologue 堆疊配置", desc: "在堆疊頂部配置 12 位元組（3 個 Word）空間，為 Non-leaf procedure 準備訊框。" },
        { line: "      sw   $ra, 8($sp)", tag: "返回位址保存", desc: "【致命必考】將呼叫端的返回位址存入堆疊。因內部會執行 jal fib 覆蓋 $ra，未備份將陷入死迴圈！" },
        { line: "      sw   $s0, 4($sp)", tag: "Callee-saved 保存", desc: "【約定責任】$s0 由被呼叫端負責保護。進入時備份舊值，离开時還原，防止外層呼叫端的變數被竄改。" },
        { line: "      sw   $a0, 0($sp)", tag: "Caller-saved 引數保護", desc: "【參數保護】將當前層的引數 n 保存於堆疊，供後續計算 fib(n-2) 時還原使用。" },
        { line: "      beq  $a0, $zero, fib_base0", tag: "Base Case 判斷 (n=0)", desc: "檢查是否命中 n == 0。若成立跳轉至回傳 0。" },
        { line: "      li   $t0, 1", tag: "常數設定", desc: "載入常數 1 用以比對。" },
        { line: "      beq  $a0, $t0, fib_base1", tag: "Base Case 判斷 (n=1)", desc: "檢查是否命中 n == 1。若成立跳轉至回傳 1。" },
        { line: "      addi $a0, $a0, -1", tag: "遞迴引數遞減", desc: "準備第一次遞迴引數：$a0 = n - 1。" },
        { line: "      jal  fib", tag: "第一次遞迴呼叫", desc: "執行 fib(n - 1)，結果放置於回傳值暫存器 $v0。" },
        { line: "      move $s0, $v0", tag: "中間結果移轉暫存", desc: "【致命必考】第二次呼叫 jal fib 會覆寫 $v0，必須將第一次結果移入已在開頭受保護的 $s0 安全保存！" },
        { line: "      lw   $a0, 0($sp)", tag: "原始引數重載", desc: "【致命必考】剛從子呼叫返回時 $a0 已被子層污染，必須自堆疊重新載回原始 n，方能計算 n - 2！" },
        { line: "      addi $a0, $a0, -2", tag: "第二次引數計算", desc: "設定第二次遞迴引數：$a0 = n - 2。" },
        { line: "      jal  fib", tag: "第二次遞迴呼叫", desc: "執行 fib(n - 2)，回傳值於 $v0。" },
        { line: "      add  $v0, $s0, $v0", tag: "結果合併加總", desc: "執行 F(n) = F(n-1) + F(n-2)，即 $v0 = $s0 + $v0。" },
        { line: "      j    fib_return", tag: "跳轉至結尾還原", desc: "跳轉至函式結尾統一執行暫存器還原與釋放堆疊。" },
        { line: "fib_base0: li $v0, 0", tag: "Base Case 0 回傳", desc: "n == 0 時回傳 0。" },
        { line: "fib_base1: li $v0, 1", tag: "Base Case 1 回傳", desc: "n == 1 時回傳 1。" },
        { line: "fib_return: lw $a0, 0($sp)", tag: "Epilogue 還原引數", desc: "自堆疊還原暫存器舊值。" },
        { line: "            lw $s0, 4($sp)", tag: "Epilogue 還原 $s0", desc: "還原 Callee-saved 暫存器 $s0 舊值。" },
        { line: "            lw $ra, 8($sp)", tag: "Epilogue 還原 $ra", desc: "還原呼叫端的返回位址。" },
        { line: "            addi $sp, $sp, 12", tag: "Epilogue 釋放堆疊", desc: "【平衡必考】釋放開頭配置的 12 位元組堆疊框架，維持堆疊指標平衡。" },
        { line: "            jr   $ra", tag: "返回呼叫端", desc: "跳回呼叫端（如 main 函式或上一層遞迴）。" }
      ];
    } else {
      return [
        { line: "fact: addi $sp, $sp, -8", tag: "Prologue 堆疊配置", desc: "單一遞迴僅需保存 $ra 與 $a0，配置 8 位元組堆疊框架。" },
        { line: "      sw   $ra, 4($sp)", tag: "返回位址保存", desc: "保存返回位址，避免內部 jal fact 覆寫。" },
        { line: "      sw   $a0, 0($sp)", tag: "傳入引數保存", desc: "保存原始引數 n，供遞迴返回後執行 n * fact(n-1) 使用。" },
        { line: "      slti $t0, $a0, 1", tag: "Base Case 測試 (n < 1)", desc: "測試 n 是否小於 1。" },
        { line: "      beq  $t0, $zero, L1", tag: "條件跳躍", desc: "若 n >= 1 則跳往遞迴標籤 L1。" },
        { line: "      li   $v0, 1", tag: "Base Case 回傳 1", desc: "當 n < 1 時，0! = 1，回傳 1。" },
        { line: "      addi $sp, $sp, 8", tag: "Base Case 釋放堆疊", desc: "【平衡必考】在返回前必須釋放堆疊，防止 Stack Leak。" },
        { line: "      jr   $ra", tag: "Base Case 返回", desc: "返回呼叫端。" },
        { line: "L1:   addi $a0, $a0, -1", tag: "引數遞減", desc: "引數調整為 n - 1。" },
        { line: "      jal  fact", tag: "遞迴呼叫", desc: "呼叫 fact(n - 1)，傳回值於 $v0。" },
        { line: "      lw   $a0, 0($sp)", tag: "原始引數重載", desc: "自堆疊還原本層進入時的原始引數 n。" },
        { line: "      lw   $ra, 4($sp)", tag: "返回位址還原", desc: "還原返回位址。" },
        { line: "      addi $sp, $sp, 8", tag: "Epilogue 釋放堆疊", desc: "釋放 8 位元組堆疊框架。" },
        { line: "      mul  $v0, $a0, $v0", tag: "階乘相乘", desc: "計算 n * fact(n - 1)，存入 $v0 作為回傳值。" },
        { line: "      jr   $ra", tag: "返回呼叫端", desc: "跳回呼叫端。" }
      ];
    }
  };

  const renderContent = () => {
    const lines = getSubCode(currentSub);
    const quizList = window.CO_ASSIGNMENT_DATA.quizBank;
    const qItem = quizList[currentQuizIdx % quizList.length];

    container.innerHTML = `
      <div style="display: grid; grid-template-columns: 1fr; gap: 1.5rem;">
        
        <!-- 上方：程式碼導覽與逐行功能檢視器 -->
        <div class="card">
          <div class="card-header" style="flex-wrap: wrap; gap: 0.75rem;">
            <div>
              <h3 class="card-title" style="color: var(--primary);">MIPS 遞迴程序指令逐行解構檢視器</h3>
              <p style="font-size: 0.85rem; color: var(--text-muted); margin-top: 0.25rem;">
                點擊下方任一行組合語言指令，右側（或下方）將即時展開該指令在微架構與呼叫約定上的核心功能與考卷失分陷阱！
              </p>
            </div>
            <div class="mode-switch-bar">
              <button class="mode-btn ${currentSub === 'fib' ? 'active' : ''}" id="btnSelectFib">費氏數列 fib(n)</button>
              <button class="mode-btn ${currentSub === 'fact' ? 'active' : ''}" id="btnSelectFact">階乘 fact(n)</button>
            </div>
          </div>

          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 1.25rem; margin-top: 1.25rem;">
            <!-- 代碼清單 -->
            <div style="background: #090d16; border: 1px solid var(--border-color); border-radius: var(--radius); padding: 0.75rem; max-height: 480px; overflow-y: auto; font-family: var(--font-mono); font-size: 0.88rem;">
              ${lines.map((item, idx) => `
                <div class="code-line-item ${idx === 1 ? 'selected' : ''}" data-idx="${idx}" style="padding: 0.45rem 0.65rem; margin-bottom: 0.25rem; border-radius: 4px; cursor: pointer; display: flex; justify-content: space-between; align-items: center; transition: all 0.2s ease;">
                  <span style="color: #4ade80;">${escapeHtml(item.line)}</span>
                  <span class="tag-badge tag-hw1" style="font-size: 0.7rem; font-family: sans-serif;">${item.tag}</span>
                </div>
              `).join("")}
            </div>

            <!-- 解構說明卡片 -->
            <div id="lineDetailBox" style="background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: var(--radius); padding: 1.25rem; display: flex; flex-direction: column; justify-content: center;">
              <div style="font-size: 0.8rem; color: var(--text-muted); text-transform: uppercase;">指令責任剖析</div>
              <h4 id="detailLineTitle" style="color: var(--primary); font-family: var(--font-mono); margin: 0.5rem 0; font-size: 1.1rem;">
                ${escapeHtml(lines[1].line)}
              </h4>
              <div id="detailLineTag" style="margin-bottom: 0.75rem;">
                <span class="tag-badge tag-hw2">${lines[1].tag}</span>
              </div>
              <p id="detailLineDesc" style="color: var(--text-main); line-height: 1.8; font-size: 0.92rem;">
                ${lines[1].desc}
              </p>
            </div>
          </div>
        </div>

        <!-- 下方：指令功能即時隨機抽測器 (Quiz Widget) -->
        <div class="card" style="border-top: 3px solid #38bdf8;">
          <div class="card-header" style="flex-wrap: wrap; gap: 0.75rem;">
            <div>
              <div style="display: flex; align-items: center; gap: 0.5rem;">
                <span class="tag-badge tag-hw1">指令功能即時抽測</span>
                <h3 class="card-title" style="color: #38bdf8;">「組合語言這個指令是幹嘛的？」高頻考點測驗</h3>
              </div>
              <p style="font-size: 0.85rem; color: var(--text-muted); margin-top: 0.25rem;">
                系統隨機抽取關鍵指令，考驗您對呼叫約定、暫存器責任與微架構邊界的掌握度。
              </p>
            </div>
            <button class="action-btn btn-secondary" id="btnNextQuiz" style="font-size: 0.85rem; padding: 0.4rem 0.85rem;">
              換一題抽測
            </button>
          </div>

          <div style="margin-top: 1.25rem; background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: var(--radius); padding: 1.25rem;">
            <div style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 0.5rem;">
              目標程序：<code>${qItem.subroutine === 'fib' ? 'fib(n) 雙遞迴' : 'fact(n) 階乘'}</code> | 目標指令：<strong style="color: #4ade80; font-family: var(--font-mono); font-size: 1rem;">${qItem.instruction}</strong>
            </div>
            <h4 style="font-size: 1rem; color: var(--text-main); line-height: 1.6; margin-bottom: 1rem;">
              ${qItem.question}
            </h4>

            <div id="quizOptionsList" style="display: flex; flex-direction: column; gap: 0.6rem;">
              ${qItem.options.map((opt, optIdx) => `
                <button class="action-btn btn-secondary quiz-opt-btn" data-idx="${optIdx}" style="text-align: left; padding: 0.75rem 1rem; font-size: 0.9rem; line-height: 1.5; border-radius: 6px; white-space: normal;">
                  ${escapeHtml(opt)}
                </button>
              `).join("")}
            </div>

            <div id="quizFeedbackBox" style="display: none; margin-top: 1.25rem; padding: 1rem 1.25rem; border-radius: var(--radius); font-size: 0.9rem; line-height: 1.7;"></div>
          </div>
        </div>

      </div>
    `;

    // 綁定切換程式按鈕
    const btnFib = container.querySelector("#btnSelectFib");
    const btnFact = container.querySelector("#btnSelectFact");
    if (btnFib) btnFib.onclick = () => { currentSub = "fib"; renderContent(); };
    if (btnFact) btnFact.onclick = () => { currentSub = "fact"; renderContent(); };

    // 綁定代碼點擊
    const lineItems = container.querySelectorAll(".code-line-item");
    const titleEl = container.querySelector("#detailLineTitle");
    const tagEl = container.querySelector("#detailLineTag");
    const descEl = container.querySelector("#detailLineDesc");

    lineItems.forEach(el => {
      el.onclick = () => {
        lineItems.forEach(x => {
          x.style.background = "transparent";
          x.classList.remove("selected");
        });
        el.style.background = "rgba(56, 189, 248, 0.15)";
        el.classList.add("selected");
        const idx = parseInt(el.getAttribute("data-idx"), 10);
        const data = lines[idx];
        if (titleEl) titleEl.textContent = data.line;
        if (tagEl) tagEl.innerHTML = `<span class="tag-badge tag-hw2">${data.tag}</span>`;
        if (descEl) descEl.textContent = data.desc;
      };
    });

    // 綁定 Quiz
    const btnNext = container.querySelector("#btnNextQuiz");
    if (btnNext) {
      btnNext.onclick = () => {
        currentQuizIdx = Math.floor(Math.random() * quizList.length);
        renderContent();
      };
    }

    const optBtns = container.querySelectorAll(".quiz-opt-btn");
    const fbBox = container.querySelector("#quizFeedbackBox");

    optBtns.forEach(btn => {
      btn.onclick = () => {
        const chosen = parseInt(btn.getAttribute("data-idx"), 10);
        optBtns.forEach(b => b.disabled = true);
        fbBox.style.display = "block";
        if (chosen === qItem.correctIndex) {
          btn.style.background = "rgba(74, 222, 128, 0.25)";
          btn.style.borderColor = "var(--success)";
          fbBox.style.background = "rgba(74, 222, 128, 0.1)";
          fbBox.style.border = "1px solid var(--success)";
          fbBox.innerHTML = `
            <div style="font-weight: 700; color: var(--success); margin-bottom: 0.35rem;">作答正確！完全掌握微架構約定。</div>
            <div style="color: var(--text-main);">${qItem.explanation}</div>
          `;
        } else {
          btn.style.background = "rgba(244, 63, 94, 0.25)";
          btn.style.borderColor = "var(--error)";
          optBtns[qItem.correctIndex].style.background = "rgba(74, 222, 128, 0.25)";
          optBtns[qItem.correctIndex].style.borderColor = "var(--success)";
          fbBox.style.background = "rgba(244, 63, 94, 0.1)";
          fbBox.style.border = "1px solid var(--error)";
          fbBox.innerHTML = `
            <div style="font-weight: 700; color: var(--error); margin-bottom: 0.35rem;">作答未通過！期中考扣分陷阱警告。</div>
            <div style="color: var(--text-main);">${qItem.explanation}</div>
          `;
        }
      };
    });
  };

  renderContent();
}

// ---------------------------------------------------------------------------
// 子視圖 2：手寫默寫特訓（挖空填空與全程式白板）
// ---------------------------------------------------------------------------
function renderHwSubView2() {
  const container = document.getElementById("hwSubView2");
  if (!container || !window.CO_ASSIGNMENT_DATA) return;

  let currentSub = "fib"; // "fib" or "fact"

  const renderContent = () => {
    const blankData = window.CO_ASSIGNMENT_DATA.fillBlanks[currentSub];

    container.innerHTML = `
      <div style="display: grid; grid-template-columns: 1fr; gap: 1.5rem;">
        
        <!-- Part A: 關鍵指令挖空填空題 -->
        <div class="card">
          <div class="card-header" style="flex-wrap: wrap; gap: 0.75rem;">
            <div>
              <div style="display: flex; align-items: center; gap: 0.5rem;">
                <span class="tag-badge tag-hw1">手寫實戰填空</span>
                <h3 class="card-title" style="color: var(--primary);">${blankData.title}</h3>
              </div>
              <p style="font-size: 0.85rem; color: var(--text-muted); margin-top: 0.25rem;">
                ${blankData.description}
              </p>
            </div>
            <div class="mode-switch-bar">
              <button class="mode-btn ${currentSub === 'fib' ? 'active' : ''}" id="btnBlankFib">費氏數列 (6 空格)</button>
              <button class="mode-btn ${currentSub === 'fact' ? 'active' : ''}" id="btnBlankFact">階乘 (4 空格)</button>
            </div>
          </div>

          <!-- 代碼填空區塊 -->
          <div style="margin-top: 1.25rem; background: #090d16; border: 1px solid var(--border-color); border-radius: var(--radius); padding: 1rem 1.25rem; font-family: var(--font-mono); font-size: 0.9rem; line-height: 1.9; max-height: 520px; overflow-y: auto;">
            ${blankData.codeLines.map(line => {
              if (!line.isBlank) {
                return `<div style="color: #94a3b8;"><span style="color: #475569; display: inline-block; width: 30px; user-select: none;">${line.num}</span>${escapeHtml(line.text)}</div>`;
              } else {
                const parts = line.text.split(/\[BLANK_\d+\]/);
                return `
                  <div style="color: #e2e8f0; margin: 0.25rem 0;">
                    <span style="color: #475569; display: inline-block; width: 30px; user-select: none;">${line.num}</span>
                    ${escapeHtml(parts[0])}
                    <input type="text" class="hw-blank-input" data-blank-id="${line.blankId}" placeholder="鍵入指令..." style="background: #1e293b; color: #38bdf8; border: 1px solid #64748b; border-radius: 4px; padding: 0.25rem 0.5rem; font-family: var(--font-mono); font-size: 0.88rem; width: 220px;" />
                    <span class="blank-status" id="status_${line.blankId}" style="margin-left: 0.5rem; font-weight: 700; font-size: 0.85rem;"></span>
                    <span style="color: #64748b;">${escapeHtml(parts[1] || "")}</span>
                  </div>
                `;
              }
            }).join("")}
          </div>

          <div style="display: flex; gap: 0.75rem; align-items: center; margin-top: 1.25rem; flex-wrap: wrap;">
            <button class="action-btn btn-primary" id="btnVerifyBlanks">檢查填空答案</button>
            <button class="action-btn btn-secondary" id="btnRevealBlanks">顯示正確解答</button>
            <span id="blankScoreSummary" style="font-weight: 700; font-size: 0.95rem;"></span>
          </div>
        </div>

        <!-- Part B: 期中考手寫白板模式 (Scratchpad Code Auditor) -->
        <div class="card" style="border-top: 3px solid #c084fc;">
          <div class="card-header" style="flex-wrap: wrap; gap: 0.75rem;">
            <div>
              <div style="display: flex; align-items: center; gap: 0.5rem;">
                <span class="tag-badge tag-hw2">白板默寫挑戰</span>
                <h3 class="card-title" style="color: #c084fc;">期中考全真白板手寫程式碼檢核器（「直接叫我們寫出來」）</h3>
              </div>
              <p style="font-size: 0.85rem; color: var(--text-muted); margin-top: 0.25rem;">
                在下方編輯框中從零手寫出完整的副程式（包括 Prologue、Base Case、遞迴步驟、Epilogue 與 jr $ra）。點擊送出後，系統將自動進行堆疊平衡、暫存器保護與呼叫約定 6 重靜態檢核！
              </p>
            </div>
            <div style="display: flex; gap: 0.5rem;">
              <button class="action-btn btn-secondary" id="btnLoadTemplateFib" style="font-size: 0.8rem; padding: 0.35rem 0.65rem;">載入 fib 骨架</button>
              <button class="action-btn btn-secondary" id="btnLoadTemplateFact" style="font-size: 0.8rem; padding: 0.35rem 0.65rem;">載入 fact 骨架</button>
            </div>
          </div>

          <div style="margin-top: 1.25rem;">
            <textarea id="hwScratchpadCode" style="width: 100%; height: 260px; background: #090d16; color: #a5f3fc; border: 1px solid var(--border-color); border-radius: var(--radius); padding: 1rem; font-family: var(--font-mono); font-size: 0.9rem; line-height: 1.6; resize: vertical;" placeholder="# 請在此處手寫完整的 MIPS 組合語言副程式...&#10;fib:&#10;    addi $sp, $sp, -12&#10;    sw   $ra, 8($sp)..."></textarea>
          </div>

          <div style="margin-top: 1rem; display: flex; gap: 1rem; align-items: center; flex-wrap: wrap;">
            <button class="action-btn btn-primary" id="btnAuditCode" style="background: #a855f7; border-color: #a855f7;">執行靜態呼叫約定檢核</button>
            <span style="font-size: 0.85rem; color: var(--text-muted);">測試對象：</span>
            <label style="font-size: 0.9rem; cursor: pointer;"><input type="radio" name="auditTarget" value="fib" checked /> 費氏數列 fib</label>
            <label style="font-size: 0.9rem; cursor: pointer;"><input type="radio" name="auditTarget" value="fact" /> 階乘 fact</label>
          </div>

          <div id="hwAuditResultBox" style="display: none; margin-top: 1.25rem; background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: var(--radius); padding: 1.25rem;"></div>
        </div>

      </div>
    `;

    // 綁定填空切換
    const btnBFib = container.querySelector("#btnBlankFib");
    const btnBFact = container.querySelector("#btnBlankFact");
    if (btnBFib) btnBFib.onclick = () => { currentSub = "fib"; renderContent(); };
    if (btnBFact) btnBFact.onclick = () => { currentSub = "fact"; renderContent(); };

    // 填空驗證
    const btnVBlanks = container.querySelector("#btnVerifyBlanks");
    const btnRBlanks = container.querySelector("#btnRevealBlanks");
    const scoreSum = container.querySelector("#blankScoreSummary");

    if (btnVBlanks) {
      btnVBlanks.onclick = () => {
        let correctCount = 0;
        let totalBlanks = 0;

        blankData.codeLines.forEach(line => {
          if (!line.isBlank) return;
          totalBlanks++;
          const input = container.querySelector(`input[data-blank-id="${line.blankId}"]`);
          const status = container.querySelector(`#status_${line.blankId}`);
          if (!input || !status) return;

          const userVal = input.value.trim().toLowerCase().replace(/\s+/g, " ");
          const stdVal = line.answer.trim().toLowerCase().replace(/\s+/g, " ");
          const alts = (line.altAnswers || []).map(a => a.trim().toLowerCase().replace(/\s+/g, " "));

          const isMatch = (userVal === stdVal) || alts.includes(userVal);
          if (isMatch) {
            correctCount++;
            input.style.borderColor = "var(--success)";
            input.style.background = "rgba(74, 222, 128, 0.15)";
            status.style.color = "var(--success)";
            status.textContent = "正確";
          } else {
            input.style.borderColor = "var(--error)";
            input.style.background = "rgba(244, 63, 94, 0.15)";
            status.style.color = "var(--error)";
            status.textContent = `錯誤（應填: ${line.answer}）`;
          }
        });

        scoreSum.innerHTML = `<span style="color: ${correctCount === totalBlanks ? 'var(--success)' : 'var(--error)'};">得分：${correctCount} / ${totalBlanks} (${Math.round(correctCount / totalBlanks * 100)} 分)</span>`;
      };
    }

    if (btnRBlanks) {
      btnRBlanks.onclick = () => {
        blankData.codeLines.forEach(line => {
          if (!line.isBlank) return;
          const input = container.querySelector(`input[data-blank-id="${line.blankId}"]`);
          const status = container.querySelector(`#status_${line.blankId}`);
          if (input) input.value = line.answer;
          if (status) {
            status.style.color = "var(--primary)";
            status.textContent = "標準答案";
          }
        });
      };
    }

    // 骨架載入
    const pad = container.querySelector("#hwScratchpadCode");
    const btnLoadFib = container.querySelector("#btnLoadTemplateFib");
    const btnLoadFact = container.querySelector("#btnLoadTemplateFact");

    if (btnLoadFib && pad) {
      btnLoadFib.onclick = () => {
        pad.value = `fib:
    addi $sp, $sp, -12
    sw   $ra, 8($sp)
    sw   $s0, 4($sp)
    sw   $a0, 0($sp)
    
    beq  $a0, $zero, fib_base0
    li   $t0, 1
    beq  $a0, $t0, fib_base1
    
    # 第一次遞迴
    addi $a0, $a0, -1
    jal  fib
    move $s0, $v0
    
    # 第二次遞迴
    lw   $a0, 0($sp)
    addi $a0, $a0, -2
    jal  fib
    
    add  $v0, $s0, $v0
    j    fib_return

fib_base0:
    li   $v0, 0
    j    fib_return

fib_base1:
    li   $v0, 1

fib_return:
    lw   $a0, 0($sp)
    lw   $s0, 4($sp)
    lw   $ra, 8($sp)
    addi $sp, $sp, 12
    jr   $ra`;
      };
    }

    if (btnLoadFact && pad) {
      btnLoadFact.onclick = () => {
        pad.value = `fact:
    addi $sp, $sp, -8
    sw   $ra, 4($sp)
    sw   $a0, 0($sp)
    
    slti $t0, $a0, 1
    beq  $t0, $zero, L1
    
    li   $v0, 1
    addi $sp, $sp, 8
    jr   $ra

L1:
    addi $a0, $a0, -1
    jal  fact
    lw   $a0, 0($sp)
    lw   $ra, 4($sp)
    addi $sp, $sp, 8
    mul  $v0, $a0, $v0
    jr   $ra`;
      };
    }

    // 審查按鈕
    const btnAudit = container.querySelector("#btnAuditCode");
    const auditResBox = container.querySelector("#hwAuditResultBox");

    if (btnAudit && pad && auditResBox) {
      btnAudit.onclick = () => {
        const code = pad.value;
        const target = container.querySelector('input[name="auditTarget"]:checked').value;
        const report = window.CO_ASSIGNMENT_DATA.auditCode(code, target);

        auditResBox.style.display = "block";
        auditResBox.innerHTML = `
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; border-bottom: 1px solid var(--border-color); padding-bottom: 0.75rem;">
            <div>
              <span style="font-weight: 700; font-size: 1.1rem; color: var(--primary);">靜態審查綜合判定：${report.verdict}</span>
            </div>
            <span class="badge ${report.score >= 90 ? 'badge-success' : (report.score >= 60 ? 'badge-warning' : 'badge-danger')}" style="font-size: 1rem; padding: 0.4rem 0.8rem;">
              評分：${report.score} / 100
            </span>
          </div>

          <div style="display: flex; flex-direction: column; gap: 0.75rem;">
            ${report.checks.map(c => `
              <div style="background: ${c.pass ? 'rgba(74, 222, 128, 0.08)' : 'rgba(244, 63, 94, 0.08)'}; border-left: 4px solid ${c.pass ? 'var(--success)' : 'var(--error)'}; padding: 0.75rem 1rem; border-radius: 4px;">
                <div style="font-weight: 700; color: ${c.pass ? 'var(--success)' : 'var(--error)'}; font-size: 0.95rem;">
                  ${c.pass ? 'PASS' : 'FAIL'}：${c.name}
                </div>
                <div style="color: var(--text-muted); font-size: 0.88rem; margin-top: 0.25rem;">
                  ${c.detail}
                </div>
              </div>
            `).join("")}
          </div>
        `;
      };
    }
  };

  renderContent();
}

// ---------------------------------------------------------------------------
// 子視圖 3：作業一 7 大動態變種題庫刷題
// ---------------------------------------------------------------------------
function renderHwSubView3() {
  const container = document.getElementById("hwSubView3");
  if (!container || !window.CO_ASSIGNMENT_DATA) return;

  const list = window.CO_ASSIGNMENT_DATA.hw1DynamicVariants;

  container.innerHTML = `
    <div class="card" style="margin-bottom: 1.5rem; border-left: 4px solid #f59e0b;">
      <h3 class="card-title" style="color: #f59e0b;">作業一高頻必考動態變種練習題庫</h3>
      <p style="font-size: 0.88rem; color: var(--text-muted); margin-top: 0.25rem;">
        授課教授特別指出：<strong>作業一的計算題型在期中考佔比極高！</strong>以下題目皆已參數化，每次點擊「換一題（隨機數值）」即刻動態生成全新考題與公式對帳。
      </p>
    </div>
    <div id="hw1CardsContainer"></div>
  `;

  const cardsContainer = container.querySelector("#hw1CardsContainer");
  if (!cardsContainer) return;

  list.forEach(itemDef => {
    const card = document.createElement("div");
    card.className = "card calc-card-item";
    card.style.marginBottom = "1.5rem";

    let instance = window.CO_SOLVER.instantiateQuestion(itemDef);

    const renderCard = () => {
      card.innerHTML = `
        <div class="card-header" style="flex-wrap: wrap; gap: 0.5rem;">
          <div style="display: flex; align-items: center; gap: 0.6rem; flex-wrap: wrap;">
            <span class="tag-badge tag-hw1">HW1 必考</span>
            <span class="badge badge-primary">${itemDef.category}</span>
            <h3 class="card-title" style="font-size: 1.05rem;">${itemDef.title}</h3>
          </div>
          <button class="action-btn btn-secondary btn-reroll" style="font-size: 0.82rem; padding: 0.35rem 0.75rem;">
            換一題（隨機數值）
          </button>
        </div>

        <div class="problem-description" style="margin: 1.25rem 0; font-size: 0.95rem; line-height: 1.7;">
          ${formatMarkdown(instance.renderedText)}
        </div>

        <div class="answer-action-bar">
          <input type="text" class="input-ctrl user-ans-input" placeholder="輸入計算答案..." style="width: 220px; font-family: var(--font-mono); font-size: 0.95rem;" />
          <span style="font-size: 0.9rem; color: var(--text-muted); font-weight: 600;">${instance.solution.unit || ""}</span>
          <button class="action-btn btn-primary btn-submit-ans">送出驗證</button>
          <span class="ans-feedback" style="font-size: 0.9rem; font-weight: 600; display: none;"></span>
        </div>

        <div class="solution-box details-box" style="margin-top: 1.25rem;">
          <div class="solution-toggle" style="cursor: pointer; display: flex; justify-content: space-between; align-items: center; padding: 0.6rem 0.9rem; background: var(--bg-secondary); border-radius: var(--radius);">
            <span style="font-weight: 700; color: var(--primary);">查看詳細步驟與公式推導</span>
            <span class="toggle-arrow">▼</span>
          </div>
          <div class="solution-content" style="display: none; padding: 1rem 1.25rem; background: #090d16; border: 1px solid var(--border-color); border-top: none; border-radius: 0 0 var(--radius) var(--radius); line-height: 1.7; font-size: 0.9rem;">
            ${formatMarkdown(instance.solution.explanation)}
          </div>
        </div>
      `;

      const btnReroll = card.querySelector(".btn-reroll");
      const btnSubmit = card.querySelector(".btn-submit-ans");
      const inputAns = card.querySelector(".user-ans-input");
      const feedbackEl = card.querySelector(".ans-feedback");
      const solToggle = card.querySelector(".solution-toggle");
      const solContent = card.querySelector(".solution-content");
      const toggleArrow = card.querySelector(".toggle-arrow");

      btnReroll.addEventListener("click", () => {
        instance = window.CO_SOLVER.instantiateQuestion(itemDef);
        renderCard();
        window.CO_SOLVER.renderMath(card);
      });

      const doVerify = () => {
        const val = inputAns.value.trim();
        const res = window.CO_SOLVER.verify(itemDef.id, val);
        feedbackEl.style.display = "inline-block";
        feedbackEl.style.marginLeft = "0.75rem";
        if (res.isCorrect) {
          feedbackEl.innerHTML = `<span style="color: var(--success);">驗證正確！答案為 ${instance.solution.correctValue} ${instance.solution.unit || ""}。</span>`;
        } else {
          feedbackEl.innerHTML = `<span style="color: var(--error);">${res.message || "未通過！請檢查計算或展開下方步驟核對。"}</span>`;
        }
      };

      btnSubmit.addEventListener("click", doVerify);
      inputAns.addEventListener("keydown", (e) => {
        if (e.key === "Enter") doVerify();
      });

      solToggle.addEventListener("click", () => {
        const isOpen = solContent.style.display === "block";
        solContent.style.display = isOpen ? "none" : "block";
        toggleArrow.textContent = isOpen ? "▼" : "▲";
        if (!isOpen) {
          window.CO_SOLVER.renderMath(solContent);
        }
      });
    };

    renderCard();
    cardsContainer.appendChild(card);
    window.CO_SOLVER.renderMath(card);
  });
}

// ---------------------------------------------------------------------------
// 子視圖 4：期中筆試 5 大致命陷阱與 MARS 實戰指南
// ---------------------------------------------------------------------------
function renderHwSubView4() {
  const container = document.getElementById("hwSubView4");
  if (!container) return;

  container.innerHTML = `
    <!-- Assignment 1 原真表格摘要 -->
    <div class="card assignment-section">
      <div class="card-header">
        <div>
          <h2 class="card-title" style="color: var(--primary);">Assignment #1 全真題型核心解構與速查表</h2>
          <span style="font-size: 0.85rem; color: var(--text-muted);">涵蓋 Chapter 1 & 2：作業一全題型解題關鍵與易錯陷阱對照</span>
        </div>
        <span class="tag-badge tag-hw1">HW1 必考手冊</span>
      </div>

      <div style="margin-top: 1.25rem;">
        <table class="line-breakdown-table">
          <thead>
            <tr>
              <th style="width: 15%;">題號</th>
              <th style="width: 25%;">考核主題</th>
              <th>解題關鍵公式與易錯陷阱</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>第 1 題</strong></td>
              <td>電晶體微縮與倍增週期</td>
              <td>
                假設電晶體數 $\\propto (1/t)^2$。2010 年 32nm 到 2019 年 14nm（9 年）：<br>
                增長倍率 $= (32/14)^2 = 5.224$ 倍。$\\text{CAGR} = (5.224)^{1/9} - 1 = 20.15\\%$。<br>
                倍增時間 $= \\ln(2) / \\ln(1 + 0.2015) = 3.77$ 年。
              </td>
            </tr>
            <tr>
              <td><strong>第 2 題</strong></td>
              <td>多指令類別加權 CPI 與執行時間</td>
              <td>
                P1 (2.5 GHz, CPI: 1, 2, 3, 3) vs P2 (3 GHz, CPI: 2, 2, 2, 2)。動態指令數 1.0E6 (10%, 20%, 50%, 20%)。<br>
                $\\text{CPI}_{P1} = 0.1(1) + 0.2(2) + 0.5(3) + 0.2(3) = 2.6$。時間 $= 1.04$ ms。<br>
                $\\text{CPI}_{P2} = 2.0$。時間 $= 0.67$ ms。<strong>P2 較快</strong>。
              </td>
            </tr>
            <tr>
              <td><strong>第 3 題</strong></td>
              <td>編譯器效能衝擊與加速比</td>
              <td>
                Compiler A (1.0E9 指令, 1.1s) vs Compiler B (1.2E9 指令, 1.5s)，週期 1ns。<br>
                $\\text{CPI}_A = 1.1$；$\\text{CPI}_B = 1.25$。<br>
                新編譯器 (6.0E8 指令, CPI 1.1) 耗時 $= 0.66$s。相對 A 加速比 $= 1.1 / 0.66 = 1.67$ 倍。
              </td>
            </tr>
            <tr>
              <td><strong>第 4 題</strong></td>
              <td>阿姆達爾定律單一部件極限</td>
              <td>
                總時間 250s (FP: 70s, L/S: 85s, Branch: 40s, INT: 55s)。<br>
                若要求透過分支單元將總時間縮短 20% (需減少 50s)：因分支總時間只有 40s，即使降為 0s 最多只能省 40s，因此<strong>物理上不可能達成 (Unattainable)</strong>！
              </td>
            </tr>
            <tr>
              <td><strong>第 6 題</strong></td>
              <td>MIPS 欄位組裝十六進位機器碼</td>
              <td>
                (a) R-type: \`op=0, rs=3, rt=2, rd=3, shamt=0, funct=34\` $\\implies$ \`sub $v1, $v1, $v0\` $\\implies$ \`0x00621822\`。<br>
                (b) I-type: \`op=0x23, rs=1, rt=2, const=0x4\` $\\implies$ \`lw $v0, 4($at)\` $\\implies$ \`0x8C220004\`。
              </td>
            </tr>
            <tr>
              <td><strong>第 7 題</strong></td>
              <td>條件迴圈逆向還原與指令計數</td>
              <td>
                \`slt $t2, $0, $t1\` 搭配 \`beq $t2, $0, DONE\` $\\implies$ \`while(i > 0) { i--; B += 2; }\`。<br>
                當 $t1 = 10, s2 = 0$ 初始時，結束 $s2 = 20$。動態執行指令數為 $5N + 2$（最後退出檢查 2 條）。
              </td>
            </tr>
            <tr>
              <td><strong>第 9 題</strong></td>
              <td>二重跨步迴圈 D[4*j]</td>
              <td>
                巢狀迴圈：$D[4*j]$ 元素索引為 $4j$，每個整數 4 bytes，位元組位移為 $16j$，必須使用 \`sll $t2, $t1, 4\`！
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 期中考筆試手寫 5 大致命陷阱與命題形式深度解剖 -->
    <div class="card assignment-section">
      <div class="card-header">
        <div>
          <h2 class="card-title" style="color: #fb7185;">期中考筆試手寫 5 大致命陷阱與命題形式深度解剖</h2>
          <span style="font-size: 0.85rem; color: var(--text-muted);">雙遞迴與呼叫約定逐行改卷扣分標準</span>
        </div>
        <span class="tag-badge tag-hw2">手寫必考陷阱</span>
      </div>

      <div style="margin-top: 1.25rem; line-height: 1.8;">
        <!-- 考點 1 -->
        <div style="margin-bottom: 1.25rem; background: var(--bg-secondary); padding: 1.25rem; border-radius: var(--radius); border-left: 4px solid #f43f5e;">
          <div style="font-weight: 700; color: #fb7185; font-size: 1rem; margin-bottom: 0.5rem;">
            致命考點 1：Non-leaf Procedure 的 $ra 覆寫與返回位址遺失（死迴圈陷阱）
          </div>
          <div style="font-size: 0.9rem; color: var(--text-muted);">
            若副程式內部有 <code>jal</code>（Non-leaf），<code>jal fib</code> 會把硬體 PC+4 強制寫入 <code>$ra</code>。若沒有在進入時把呼叫端的 <code>$ra</code> 存入堆疊保護，當執行 <code>jr $ra</code> 時將跳回自身內部，產生永久無窮迴圈！
          </div>
        </div>

        <!-- 考點 2 -->
        <div style="margin-bottom: 1.25rem; background: var(--bg-secondary); padding: 1.25rem; border-radius: var(--radius); border-left: 4px solid #f59e0b;">
          <div style="font-weight: 700; color: #f59e0b; font-size: 1rem; margin-bottom: 0.5rem;">
            致命考點 2：引數 $a0 被子呼叫污染，第二次呼叫前漏寫 lw $a0（邏輯全毀陷阱）
          </div>
          <div style="font-size: 0.9rem; color: var(--text-muted);">
            第一次子呼叫返回後，<code>$a0</code> 已被子層改為 Base case 的殘留值。呼叫 <code>fib(n - 2)</code> 前，<strong>必須先自堆疊 <code>lw $a0, 0($sp)</code> 還原原始 $n$</strong>，否則參數全毀！
          </div>
        </div>

        <!-- 考點 3 -->
        <div style="margin-bottom: 1.25rem; background: var(--bg-secondary); padding: 1.25rem; border-radius: var(--radius); border-left: 4px solid #38bdf8;">
          <div style="font-weight: 700; color: #38bdf8; font-size: 1rem; margin-bottom: 0.5rem;">
            致命考點 3：雙遞迴回傳值覆寫與 Callee-Saved 暫存器約定（$s0 vs. $v0）
          </div>
          <div style="font-size: 0.9rem; color: var(--text-muted);">
            第一次 <code>jal fib</code> 的回傳值在 <code>$v0</code>，第二次呼叫會覆寫 <code>$v0</code>，故必須暫存至 <code>$s0</code>。而 <code>$s0</code> 屬於 Callee-Saved，進入函式時必須 <code>sw $s0</code>，離開前必須 <code>lw $s0</code> 還原，以防破壞呼叫端的變數！
          </div>
        </div>

        <!-- 考點 4 -->
        <div style="margin-bottom: 1.25rem; background: var(--bg-secondary); padding: 1.25rem; border-radius: var(--radius); border-left: 4px solid #c084fc;">
          <div style="font-weight: 700; color: #c084fc; font-size: 1rem; margin-bottom: 0.5rem;">
            致命考點 4：Base Case（n < 2）堆疊指標失衡（Stack Leak 記憶體洩漏）
          </div>
          <div style="font-size: 0.9rem; color: var(--text-muted);">
            若開頭執行了 <code>addi $sp, $sp, -12</code>，命中 Base Case 時<strong>絕對不能直接 <code>jr $ra</code></strong>！必須釋放堆疊 <code>addi $sp, $sp, 12</code> 後方能 return，否則堆疊指標錯位！
          </div>
        </div>

        <!-- 考點 5 -->
        <div style="background: var(--bg-secondary); padding: 1.25rem; border-radius: var(--radius); border-left: 4px solid #10b981;">
          <div style="font-weight: 700; color: #10b981; font-size: 1rem; margin-bottom: 0.5rem;">
            致命考點 5：手寫 Trace 題型：特定 n（以 F(3) 為例）的堆疊深度與呼叫次數推算
          </div>
          <div style="font-size: 0.9rem; color: var(--text-muted);">
            計算 $F(n)$ 的總呼叫次數為 $2 \times F(n + 1) - 1$。最大堆疊深度為 $n$ 個訊框，空間消耗為 $12n$ 位元組（空間複雜度 $O(n)$，而非時間複雜度 $O(2^n)$）。
          </div>
        </div>
      </div>
    </div>
  `;

  window.CO_SOLVER.renderMath(container);
}

// 7. 全真模擬隨機測驗模式 (Mock Exam)
function initMockExam() {
  const startBtn = document.getElementById("startExamBtn");
  const examArea = document.getElementById("examActiveArea");
  const submitBtn = document.getElementById("submitExamBtn");
  const scoreBoard = document.getElementById("examScoreboard");
  if (!startBtn || !examArea) return;

  startBtn.addEventListener("click", function() {
    examArea.innerHTML = "";
    scoreBoard.style.display = "none";
    examArea.style.display = "block";
    submitBtn.style.display = "inline-flex";

    // 隨機自 Chapter 1、2、3 抽取 5 題計算題
    let pool = [];
    window.CO_DATA.chapters.forEach(c => pool.push(...c.dynamicProblems));
    shuffleArray(pool);
    const selectedCalc = pool.slice(0, 5);

    selectedCalc.forEach((p, idx) => {
      const card = createProblemCard(p);
      card.querySelector(".card-title").textContent = `第 ${idx + 1} 題：${p.title}`;
      examArea.appendChild(card);
    });

    window.CO_SOLVER.renderMath(examArea);
    startBtn.textContent = "重新抽取測驗試卷";
    examArea.scrollIntoView({ behavior: "smooth" });
  });

  submitBtn.addEventListener("click", function() {
    let total = 0;
    let correct = 0;

    examArea.querySelectorAll(".calc-card-item").forEach(card => {
      total++;
      const verifyBtn = card.querySelector(".verify-btn");
      if (verifyBtn) verifyBtn.click();
      const feedback = card.querySelector(".feedback-msg");
      if (feedback && feedback.classList.contains("feedback-success")) {
        correct++;
      }
    });

    const score = Math.round((correct / total) * 100);
    scoreBoard.style.display = "block";
    scoreBoard.innerHTML = `
      <div class="score-number">${score} 分</div>
      <p style="font-size: 1.1rem; color: var(--text-main); margin-top: 0.5rem;">
        總計作答 ${total} 題，正確 ${correct} 題，答錯 ${total - correct} 題。
      </p>
      <p style="font-size: 0.9rem; color: var(--text-muted); margin-top: 0.25rem;">
        所有錯題之推導步驟已在下方自動展開，請針對標記題型深入複習。
      </p>
    `;
    scoreBoard.scrollIntoView({ behavior: "smooth" });
  });
}


// 9. 互動式 1 位元 ALU 訊號模擬器產生器
function getAluSimulatorHtml() {
  return `
    <div class="alu-sim-container" id="aluSimulatorBox">
      <div class="alu-sim-title">1 位元 ALU 電路訊號模擬器 (Interactive 1-bit ALU Simulator)</div>
      <div class="alu-sim-desc">
        點擊下方運算控制按鈕，即時觀察 <strong>Ainvert</strong>、<strong>Binvert</strong>、<strong>CarryIn</strong> 與 <strong>Operation</strong> 多工器選擇線如何切換內部數據通路（Data Path）與硬體運算單元：
      </div>
      
      <div class="alu-btn-group">
        <button class="alu-sim-btn active" data-op="AND">AND (0 0 00)</button>
        <button class="alu-sim-btn" data-op="OR">OR (0 0 01)</button>
        <button class="alu-sim-btn" data-op="ADD">ADD (0 0 10)</button>
        <button class="alu-sim-btn" data-op="SUB">SUB (0 1 10, Cin=1)</button>
        <button class="alu-sim-btn" data-op="NOR">NOR (1 1 00)</button>
        <button class="alu-sim-btn" data-op="SLT">SLT (0 1 11, Cin=1)</button>
      </div>

      <div class="alu-status-panel">
        <div class="alu-status-chip">
          <div class="alu-status-chip-label">Ainvert (反相 A)</div>
          <div class="alu-status-chip-val" id="aluStatAinv">0</div>
        </div>
        <div class="alu-status-chip">
          <div class="alu-status-chip-label">Binvert (反相 B)</div>
          <div class="alu-status-chip-val" id="aluStatBinv">0</div>
        </div>
        <div class="alu-status-chip">
          <div class="alu-status-chip-label">CarryIn (進位初值)</div>
          <div class="alu-status-chip-val" id="aluStatCin">0</div>
        </div>
        <div class="alu-status-chip">
          <div class="alu-status-chip-label">Operation (多工通道)</div>
          <div class="alu-status-chip-val" id="aluStatOp">00 (Port 0)</div>
        </div>
        <div class="alu-status-chip">
          <div class="alu-status-chip-label">作用功能單元</div>
          <div class="alu-status-chip-val" id="aluStatUnit">AND 邏輯閘</div>
        </div>
      </div>

      <div class="alu-sim-svg-wrapper">
        <svg id="aluSvgDiagram" viewBox="0 0 760 380" width="100%" height="auto" style="max-height: 420px; font-family: var(--font-mono); font-size: 12px;">
          <defs>
            <marker id="arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#64748b" />
            </marker>
            <marker id="arrowActive" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#38bdf8" />
            </marker>
          </defs>

          <!-- 1. Input A & MUX_A -->
          <text x="25" y="80" fill="#94a3b8" font-weight="bold">輸入 a</text>
          <line id="wire_a_direct" x1="75" y1="75" x2="135" y2="75" stroke="#38bdf8" stroke-width="2.5" />
          <line id="wire_a_branch" x1="90" y1="75" x2="90" y2="105" stroke="#475569" stroke-width="1.5" />
          <line id="wire_a_inv_in" x1="90" y1="105" x2="105" y2="105" stroke="#475569" stroke-width="1.5" />
          <polygon id="gate_inv_a" points="105,97 120,105 105,113" fill="#1e293b" stroke="#475569" stroke-width="1.5" />
          <circle id="circ_inv_a" cx="123" cy="105" r="3" fill="#1e293b" stroke="#475569" stroke-width="1.5" />
          <line id="wire_a_inv_out" x1="126" y1="105" x2="135" y2="105" stroke="#475569" stroke-width="1.5" />
          <rect id="mux_a" x="135" y="60" width="30" height="55" rx="4" fill="#1e293b" stroke="#38bdf8" stroke-width="1.5" />
          <text x="142" y="77" fill="#94a3b8" font-size="10">0</text>
          <text x="142" y="107" fill="#94a3b8" font-size="10">1</text>
          <line id="wire_ainvert" x1="150" y1="25" x2="150" y2="60" stroke="#64748b" stroke-width="2" stroke-dasharray="3,3" />
          <text x="125" y="20" fill="#f59e0b" font-weight="bold">Ainvert</text>

          <!-- 2. Input B & MUX_B -->
          <text x="25" y="225" fill="#94a3b8" font-weight="bold">輸入 b</text>
          <line id="wire_b_direct" x1="75" y1="220" x2="135" y2="220" stroke="#38bdf8" stroke-width="2.5" />
          <line id="wire_b_branch" x1="90" y1="220" x2="90" y2="250" stroke="#475569" stroke-width="1.5" />
          <line id="wire_b_inv_in" x1="90" y1="250" x2="105" y2="250" stroke="#475569" stroke-width="1.5" />
          <polygon id="gate_inv_b" points="105,242 120,250 105,258" fill="#1e293b" stroke="#475569" stroke-width="1.5" />
          <circle id="circ_inv_b" cx="123" cy="250" r="3" fill="#1e293b" stroke="#475569" stroke-width="1.5" />
          <line id="wire_b_inv_out" x1="126" y1="250" x2="135" y2="250" stroke="#475569" stroke-width="1.5" />
          <rect id="mux_b" x="135" y="205" width="30" height="55" rx="4" fill="#1e293b" stroke="#38bdf8" stroke-width="1.5" />
          <text x="142" y="222" fill="#94a3b8" font-size="10">0</text>
          <text x="142" y="252" fill="#94a3b8" font-size="10">1</text>
          <line id="wire_binvert" x1="150" y1="170" x2="150" y2="205" stroke="#64748b" stroke-width="2" stroke-dasharray="3,3" />
          <text x="125" y="165" fill="#f59e0b" font-weight="bold">Binvert</text>

          <!-- 3. Interconnection Wires -->
          <line id="wire_amux" x1="165" y1="87" x2="200" y2="87" stroke="#38bdf8" stroke-width="2" />
          <path id="wire_amux_distrib" d="M 200 87 L 245 87 M 200 87 L 200 145 L 245 145 M 200 145 L 200 215 L 245 215" stroke="#38bdf8" stroke-width="1.5" fill="none" />

          <line id="wire_bmux" x1="165" y1="232" x2="215" y2="232" stroke="#38bdf8" stroke-width="2" />
          <path id="wire_bmux_distrib" d="M 215 232 L 245 232 M 215 232 L 215 160 L 245 160 M 215 160 L 215 97 L 245 97" stroke="#38bdf8" stroke-width="1.5" fill="none" />

          <!-- 4. Functional Units -->
          <!-- AND Gate -->
          <path id="gate_and" d="M 245 75 L 265 75 A 17 17 0 0 1 265 109 L 245 109 Z" fill="rgba(56, 189, 248, 0.2)" stroke="#38bdf8" stroke-width="2" />
          <text id="text_and" x="252" y="96" fill="#38bdf8" font-size="11" font-weight="bold">AND</text>
          <line id="wire_and_out" x1="282" y1="92" x2="480" y2="92" stroke="#38bdf8" stroke-width="2" />

          <!-- OR Gate -->
          <path id="gate_or" d="M 245 137 Q 255 152 245 167 Q 275 167 285 152 Q 275 137 245 137 Z" fill="#1e293b" stroke="#475569" stroke-width="1.5" />
          <text id="text_or" x="256" y="156" fill="#94a3b8" font-size="11" font-weight="bold">OR</text>
          <line id="wire_or_out" x1="285" y1="152" x2="480" y2="152" stroke="#475569" stroke-width="1.5" />

          <!-- Full Adder -->
          <rect id="gate_adder" x="245" y="200" width="85" height="65" rx="6" fill="#1e293b" stroke="#475569" stroke-width="1.5" />
          <text id="text_adder" x="260" y="235" fill="#94a3b8" font-size="11" font-weight="bold">全加器</text>
          <text x="257" y="250" fill="#64748b" font-size="9">(Adder)</text>
          <line id="wire_cin" x1="287" y1="165" x2="287" y2="200" stroke="#64748b" stroke-width="2" />
          <text x="265" y="160" fill="#f59e0b" font-weight="bold">CarryIn</text>
          <line id="wire_cout" x1="287" y1="265" x2="287" y2="305" stroke="#64748b" stroke-width="2" marker-end="url(#arrow)" />
          <text x="255" y="325" fill="#f59e0b" font-weight="bold">CarryOut</text>
          <line id="wire_adder_out" x1="330" y1="232" x2="480" y2="232" stroke="#475569" stroke-width="1.5" />

          <!-- Less Input -->
          <line id="wire_less" x1="165" y1="310" x2="480" y2="310" stroke="#475569" stroke-width="1.5" />
          <text x="50" y="315" fill="#94a3b8" font-weight="bold">Less (來自第 31 位元 Set)</text>

          <!-- 5. 4-to-1 Multiplexer -->
          <polygon id="mux_4to1" points="480,50 535,70 535,330 480,350" fill="#1e293b" stroke="#38bdf8" stroke-width="2" />
          <circle id="port_0" cx="488" cy="92" r="5" fill="#38bdf8" />
          <text id="text_p0" x="498" y="96" fill="#38bdf8" font-size="10" font-weight="bold">0 (AND)</text>

          <circle id="port_1" cx="488" cy="152" r="5" fill="#475569" />
          <text id="text_p1" x="498" y="156" fill="#64748b" font-size="10">1 (OR)</text>

          <circle id="port_2" cx="488" cy="232" r="5" fill="#475569" />
          <text id="text_p2" x="498" y="236" fill="#64748b" font-size="10">2 (ADD)</text>

          <circle id="port_3" cx="488" cy="310" r="5" fill="#475569" />
          <text id="text_p3" x="498" y="314" fill="#64748b" font-size="10">3 (LESS)</text>

          <line id="wire_op" x1="507" y1="20" x2="507" y2="60" stroke="#f59e0b" stroke-width="2.5" stroke-dasharray="3,3" />
          <text x="460" y="18" fill="#f59e0b" font-weight="bold">Operation (2 bits)</text>

          <!-- Result output -->
          <line id="wire_result" x1="535" y1="200" x2="670" y2="200" stroke="#38bdf8" stroke-width="3" marker-end="url(#arrowActive)" />
          <text x="685" y="205" fill="#38bdf8" font-size="14" font-weight="bold">Result</text>
        </svg>
      </div>

      <div class="alu-sim-explain" id="aluSimExplain">
        <strong>當前運算解析（AND）</strong>：Ainvert=0, Binvert=0，輸入 A 與 B 直通進入 AND 邏輯閘；Operation=00 選擇多工器第 0 號通道，Result 輸出逐位元 AND 運算結果。
      </div>
    </div>
  `;
}

function initAluSimulator() {
  const box = document.getElementById("aluSimulatorBox");
  if (!box) return;

  const aluOps = {
    AND: {
      ainv: 0, binv: 0, cin: 0, op: "00", opPort: 0,
      unit: "AND 邏輯閘",
      explain: "<strong>當前運算解析（AND）</strong>：Ainvert=0, Binvert=0，輸入 a 與 b 直通進入 AND 邏輯閘；Operation=00 選擇多工器第 0 號通道，Result 輸出逐位元 AND 運算結果。"
    },
    OR: {
      ainv: 0, binv: 0, cin: 0, op: "01", opPort: 1,
      unit: "OR 邏輯閘",
      explain: "<strong>當前運算解析（OR）</strong>：Ainvert=0, Binvert=0，輸入 a 與 b 直通進入 OR 邏輯閘；Operation=01 選擇多工器第 1 號通道，Result 輸出逐位元 OR 運算結果。"
    },
    ADD: {
      ainv: 0, binv: 0, cin: 0, op: "10", opPort: 2,
      unit: "全加器 (Full Adder)",
      explain: "<strong>當前運算解析（ADD）</strong>：Ainvert=0, Binvert=0, CarryIn=0；輸入 a 與 b 由全加器執行加法 $a + b$，產生和（Sum）與進位（CarryOut）；Operation=10 選擇多工器第 2 號通道。"
    },
    SUB: {
      ainv: 0, binv: 1, cin: 1, op: "10", opPort: 2,
      unit: "全加器 (二補數減法)",
      explain: "<strong>當前運算解析（SUB）</strong>：Binvert=1 將 b 逐位元反相 (~b)，最末端第 0 位元 CarryIn 設為 1，全加器執行 $a + (\\sim b) + 1 = a - b$；Operation=10 選擇多工器第 2 號通道輸出差值。"
    },
    NOR: {
      ainv: 1, binv: 1, cin: 0, op: "00", opPort: 0,
      unit: "AND 邏輯閘 (笛摩根定理)",
      explain: "<strong>當前運算解析（NOR）</strong>：Ainvert=1, Binvert=1 將輸入分別反相為 $\\sim a$ 與 $\\sim b$，送入 AND 閘得 $\\sim a \\cdot \\sim b = \\overline{a + b}$（笛摩根定理）；Operation=00 選擇第 0 號通道，實現硬體 NOR 運算。"
    },
    SLT: {
      ainv: 0, binv: 1, cin: 1, op: "11", opPort: 3,
      unit: "Less 通道 (來自第 31 位元 Set)",
      explain: "<strong>當前運算解析（SLT）</strong>：執行減法 $a - b$（Binvert=1, CarryIn=1）；若 $a < b$，第 31 位元全加器的符號輸出為 1（經溢位修正 $\\text{Set} = \\text{Sign} \\oplus \\text{Overflow}$）回傳至第 0 位元的 Less 端；Operation=11 選擇第 3 號通道輸出置位值。"
    }
  };

  const buttons = box.querySelectorAll(".alu-sim-btn");
  const elAinv = document.getElementById("aluStatAinv");
  const elBinv = document.getElementById("aluStatBinv");
  const elCin = document.getElementById("aluStatCin");
  const elOp = document.getElementById("aluStatOp");
  const elUnit = document.getElementById("aluStatUnit");
  const elExplain = document.getElementById("aluSimExplain");

  buttons.forEach(btn => {
    btn.addEventListener("click", function() {
      buttons.forEach(b => b.classList.remove("active"));
      this.classList.add("active");

      const opKey = this.getAttribute("data-op");
      const cfg = aluOps[opKey];
      if (!cfg) return;

      if (elAinv) elAinv.textContent = cfg.ainv;
      if (elBinv) elBinv.textContent = cfg.binv;
      if (elCin) elCin.textContent = cfg.cin;
      if (elOp) elOp.textContent = `${cfg.op} (Port ${cfg.opPort})`;
      if (elUnit) elUnit.textContent = cfg.unit;
      if (elExplain) {
        elExplain.innerHTML = cfg.explain;
        window.CO_SOLVER.renderMath(elExplain);
      }

      updateAluSvg(opKey, cfg);
    });
  });
}

function updateAluSvg(opKey, cfg) {
  const activeColor = "#38bdf8";
  const inactiveColor = "#475569";
  const activeFill = "rgba(56, 189, 248, 0.2)";
  const inactiveFill = "#1e293b";

  // A Invert Path
  const wireADirect = document.getElementById("wire_a_direct");
  const wireAInvOut = document.getElementById("wire_a_inv_out");
  const gateInvA = document.getElementById("gate_inv_a");
  if (wireADirect && wireAInvOut) {
    if (cfg.ainv === 1) {
      wireADirect.setAttribute("stroke", inactiveColor);
      wireAInvOut.setAttribute("stroke", activeColor);
      wireAInvOut.setAttribute("stroke-width", "2.5");
      if (gateInvA) gateInvA.setAttribute("stroke", activeColor);
    } else {
      wireADirect.setAttribute("stroke", activeColor);
      wireAInvOut.setAttribute("stroke", inactiveColor);
      wireAInvOut.setAttribute("stroke-width", "1.5");
      if (gateInvA) gateInvA.setAttribute("stroke", inactiveColor);
    }
  }

  // B Invert Path
  const wireBDirect = document.getElementById("wire_b_direct");
  const wireBInvOut = document.getElementById("wire_b_inv_out");
  const gateInvB = document.getElementById("gate_inv_b");
  if (wireBDirect && wireBInvOut) {
    if (cfg.binv === 1) {
      wireBDirect.setAttribute("stroke", inactiveColor);
      wireBInvOut.setAttribute("stroke", activeColor);
      wireBInvOut.setAttribute("stroke-width", "2.5");
      if (gateInvB) gateInvB.setAttribute("stroke", activeColor);
    } else {
      wireBDirect.setAttribute("stroke", activeColor);
      wireBInvOut.setAttribute("stroke", inactiveColor);
      wireBInvOut.setAttribute("stroke-width", "1.5");
      if (gateInvB) gateInvB.setAttribute("stroke", inactiveColor);
    }
  }

  // CarryIn Wire
  const wireCin = document.getElementById("wire_cin");
  if (wireCin) {
    wireCin.setAttribute("stroke", cfg.cin === 1 ? "#f59e0b" : "#64748b");
    wireCin.setAttribute("stroke-width", cfg.cin === 1 ? "2.5" : "1.5");
  }

  // Units
  const gateAnd = document.getElementById("gate_and");
  const wireAndOut = document.getElementById("wire_and_out");
  const textAnd = document.getElementById("text_and");

  const gateOr = document.getElementById("gate_or");
  const wireOrOut = document.getElementById("wire_or_out");
  const textOr = document.getElementById("text_or");

  const gateAdder = document.getElementById("gate_adder");
  const wireAdderOut = document.getElementById("wire_adder_out");
  const textAdder = document.getElementById("text_adder");

  const wireLess = document.getElementById("wire_less");

  // Reset all units
  [gateAnd, gateOr, gateAdder].forEach(g => {
    if (g) {
      g.setAttribute("fill", inactiveFill);
      g.setAttribute("stroke", inactiveColor);
    }
  });
  [wireAndOut, wireOrOut, wireAdderOut, wireLess].forEach(w => {
    if (w) {
      w.setAttribute("stroke", inactiveColor);
      w.setAttribute("stroke-width", "1.5");
    }
  });
  [textAnd, textOr, textAdder].forEach(t => {
    if (t) t.setAttribute("fill", "#94a3b8");
  });

  // Highlight active unit
  if (opKey === "AND" || opKey === "NOR") {
    if (gateAnd) { gateAnd.setAttribute("fill", activeFill); gateAnd.setAttribute("stroke", activeColor); }
    if (wireAndOut) { wireAndOut.setAttribute("stroke", activeColor); wireAndOut.setAttribute("stroke-width", "2.5"); }
    if (textAnd) textAnd.setAttribute("fill", activeColor);
  } else if (opKey === "OR") {
    if (gateOr) { gateOr.setAttribute("fill", activeFill); gateOr.setAttribute("stroke", activeColor); }
    if (wireOrOut) { wireOrOut.setAttribute("stroke", activeColor); wireOrOut.setAttribute("stroke-width", "2.5"); }
    if (textOr) textOr.setAttribute("fill", activeColor);
  } else if (opKey === "ADD" || opKey === "SUB") {
    if (gateAdder) { gateAdder.setAttribute("fill", activeFill); gateAdder.setAttribute("stroke", activeColor); }
    if (wireAdderOut) { wireAdderOut.setAttribute("stroke", activeColor); wireAdderOut.setAttribute("stroke-width", "2.5"); }
    if (textAdder) textAdder.setAttribute("fill", activeColor);
  } else if (opKey === "SLT") {
    if (gateAdder) { gateAdder.setAttribute("stroke", activeColor); }
    if (wireLess) { wireLess.setAttribute("stroke", activeColor); wireLess.setAttribute("stroke-width", "2.5"); }
  }

  // MUX Ports
  for (let i = 0; i <= 3; i++) {
    const portCirc = document.getElementById(`port_${i}`);
    const portText = document.getElementById(`text_p${i}`);
    if (portCirc) portCirc.setAttribute("fill", i === cfg.opPort ? activeColor : inactiveColor);
    if (portText) portText.setAttribute("fill", i === cfg.opPort ? activeColor : "#64748b");
  }
}

// 輔助函式：Markdown 粗體、清單、表格與電路圖轉譯
function formatMarkdown(text) {
  if (!text) return "";
  let s = text.trim();

  // 1. 提取 Markdown 圖片語法 ![alt](src)
  const images = [];
  s = s.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, function(match, alt, src) {
    const placeholder = `___IMG_TOKEN_${images.length}___`;
    images.push({ alt, src });
    return placeholder;
  });

  // 2. 轉義 HTML 特殊字元
  s = s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  // 3. 還原圖片並生成可點擊放大的電路展示區塊
  images.forEach((img, idx) => {
    const imgHtml = `
      <div class="circuit-diagram-container">
        <img src="${img.src}" alt="${img.alt}" class="circuit-diagram-img" onclick="window.open('${img.src}')" title="點擊於新分頁開啟高解析度原圖" />
        <div class="circuit-diagram-caption">電路架構圖：${img.alt}（點擊圖片可於新分頁開啟高解析度原圖）</div>
      </div>
    `;
    s = s.replace(`___IMG_TOKEN_${idx}___`, imgHtml);
  });

  // 4. 處理 Markdown 表格
  s = s.replace(/((?:\|[^\n]+\|\r?\n?)+)/g, function(tableText) {
    const lines = tableText.trim().split(/\r?\n/);
    if (lines.length < 2) return tableText;
    let tableHtml = '<table class="line-breakdown-table" style="margin: 0.75rem 0;">';
    let hasThead = false;
    lines.forEach((line) => {
      if (line.includes('---')) {
        hasThead = true;
        return;
      }
      const cells = line.split('|').slice(1, -1).map(c => c.trim());
      if (!hasThead) {
        tableHtml += '<thead><tr>' + cells.map(c => `<th>${c}</th>`).join('') + '</tr></thead><tbody>';
        hasThead = true;
      } else {
        tableHtml += '<tr>' + cells.map(c => `<td>${c}</td>`).join('') + '</tr>';
      }
    });
    tableHtml += '</tbody></table>';
    return tableHtml;
  });

  // 5. 處理反引號程式碼
  s = s.replace(/`([^`]+)`/g, '<code style="background: var(--code-bg); color: var(--primary); padding: 0.1rem 0.3rem; border-radius: 4px; font-family: var(--font-mono);">$1</code>');
  // 6. 處理粗體
  s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  // 7. 處理清單
  s = s.replace(/^\s*-\s+(.+)$/gm, '<li style="margin-left: 1.25rem;">$1</li>');
  // 8. 處理換行
  s = s.replace(/\n\n/g, '<div style="margin-bottom: 0.6rem;"></div>');
  return s;
}

function escapeHtml(str) {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}


// 渲染互動邏輯實驗室 (Interactive Logic Lab)
function renderInteractiveLab() {
  const container = document.getElementById("interactiveLabContainer");
  if (!container || !window.CO_INTERACTIVE) return;
  window.CO_INTERACTIVE.initLab("interactiveLabContainer");
}

// 浮動回到頂部按鈕監聽
function initBackToTop() {
  const btn = document.getElementById("backToTopBtn");
  if (!btn) return;
  window.addEventListener("scroll", function() {
    if (window.scrollY > 300) {
      btn.classList.add("visible");
    } else {
      btn.classList.remove("visible");
    }
  });
  btn.addEventListener("click", function() {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

// 程式碼區塊快速複製函式
function copyToClipboard(btn) {
  const panel = btn.closest(".code-panel");
  if (!panel) return;
  const pre = panel.querySelector(".code-content");
  if (!pre) return;
  const text = pre.innerText || pre.textContent;
  navigator.clipboard.writeText(text).then(() => {
    const orig = btn.textContent;
    btn.textContent = "已複製！";
    btn.style.color = "#4ade80";
    setTimeout(() => {
      btn.textContent = orig;
      btn.style.color = "";
    }, 1500);
  }).catch(err => {
    console.error("Clipboard copy error:", err);
  });
}


// 渲染老師指定習題動態變種專區 (Teacher Curated Exercise Arena)
function renderTeacherCuratedArena() {
  const container = document.getElementById("teacherCuratedContainer");
  if (!container || !window.CO_TEACHER_EXERCISES) return;

  let html = `
    <div class="card" style="margin-bottom: 2rem; border-left: 4px solid var(--primary);">
      <div class="card-header" style="flex-wrap: wrap; gap: 0.75rem;">
        <div>
          <h2 class="card-title" style="color: var(--primary);">老師指定勾選習題動態變種專區 (Curated Exercise Variants)</h2>
          <div style="font-size: 0.88rem; color: var(--text-muted); margin-top: 0.25rem;">
            精確對齊 Chapter 3 老師指定勾選之 8 大核心習題（3.12、3.13、3.18、3.27、3.29、3.35、3.36、3.37）。每題皆支援<strong>隨機動態數值生成</strong>與<strong>完整週期追蹤詳解</strong>。
          </div>
        </div>
        <span class="tag-badge badge-primary">老師指定 8 大真題</span>
      </div>
      <div style="margin-top: 1rem; font-size: 0.9rem; line-height: 1.7; color: var(--text-muted); background: var(--bg-secondary); padding: 1rem 1.25rem; border-radius: var(--radius);">
        <strong>動態變種練習指南：</strong>
        點擊每道題目右上角的「換一題（隨機數值）」按鈕，系統將自動隨機抽取全新數值參數，並由底層硬體狀態機動態推導產生完整的週期狀態追蹤表（包含暫存器二進位排列、位移方向、GRS 位元判定與計算結果），供您進行高強度反覆刷題！
      </div>
    </div>
    <div id="teacherCardsList"></div>
  `;

  container.innerHTML = html;
  const listContainer = document.getElementById("teacherCardsList");
  if (!listContainer) return;

  window.CO_TEACHER_EXERCISES.forEach((exDef) => {
    const card = document.createElement("div");
    card.className = "card calc-card-item";
    card.style.marginBottom = "1.5rem";
    card.id = `teacher_card_${exDef.id}`;

    let instance = window.CO_SOLVER.instantiateQuestion(exDef);

    const renderCardContent = () => {
      card.innerHTML = `
        <div class="card-header" style="flex-wrap: wrap; gap: 0.5rem;">
          <div style="display: flex; align-items: center; gap: 0.6rem; flex-wrap: wrap;">
            <span class="tag-badge tag-hw1" style="font-weight: 700;">${exDef.originalNo}</span>
            <span class="badge badge-primary">${exDef.category}</span>
            <h3 class="card-title" style="font-size: 1.05rem;">${exDef.title}</h3>
          </div>
          <button class="action-btn btn-secondary btn-reroll" style="font-size: 0.82rem; padding: 0.35rem 0.75rem;">
            換一題（隨機數值）
          </button>
        </div>

        <div class="problem-description" style="margin: 1.25rem 0; font-size: 0.95rem; line-height: 1.7;">
          ${formatMarkdown(instance.renderedText)}
        </div>

        <div class="answer-action-bar">
          <input type="text" class="input-ctrl user-ans-input" placeholder="鍵入您的計算答案..." style="width: 240px; font-family: var(--font-mono); font-size: 0.95rem;" />
          <button class="action-btn btn-primary btn-submit-ans">送出驗證</button>
          <span class="ans-feedback" style="font-size: 0.9rem; font-weight: 600; display: none;"></span>
        </div>

        <div class="solution-box details-box" style="margin-top: 1.25rem;">
          <div class="solution-toggle" style="cursor: pointer; display: flex; justify-content: space-between; align-items: center; padding: 0.6rem 0.9rem; background: var(--bg-secondary); border-radius: var(--radius);">
            <span style="font-weight: 700; color: var(--primary);">查看詳細步驟、硬體推導與完整週期追蹤表</span>
            <span class="toggle-arrow">▼</span>
          </div>
          <div class="solution-content" style="display: none; padding: 1rem 1.25rem; background: #090d16; border: 1px solid var(--border-color); border-top: none; border-radius: 0 0 var(--radius) var(--radius); line-height: 1.7; font-size: 0.9rem;">
            ${formatMarkdown(instance.solution.explanation)}
          </div>
        </div>
      `;

      const btnReroll = card.querySelector(".btn-reroll");
      const btnSubmit = card.querySelector(".btn-submit-ans");
      const inputAns = card.querySelector(".user-ans-input");
      const feedbackEl = card.querySelector(".ans-feedback");
      const solToggle = card.querySelector(".solution-toggle");
      const solContent = card.querySelector(".solution-content");
      const toggleArrow = card.querySelector(".toggle-arrow");

      if (btnReroll) {
        btnReroll.addEventListener("click", () => {
          instance = window.CO_SOLVER.instantiateQuestion(exDef);
          renderCardContent();
          window.CO_SOLVER.renderMath(card);
        });
      }

      const doVerify = () => {
        if (!inputAns || !feedbackEl) return;
        const val = inputAns.value.trim();
        const res = window.CO_SOLVER.verify(exDef.id, val);
        feedbackEl.style.display = "inline-block";
        feedbackEl.style.marginLeft = "0.75rem";
        if (res.isCorrect) {
          feedbackEl.innerHTML = `<span style="color: var(--success);">驗證正確！答案確實為 ${instance.solution.correctValue}。</span>`;
        } else {
          feedbackEl.innerHTML = `<span style="color: var(--error);">${res.message || "未通過！請檢查計算或展開下方步驟核對。"}</span>`;
        }
      };

      if (btnSubmit) btnSubmit.addEventListener("click", doVerify);
      if (inputAns) {
        inputAns.addEventListener("keydown", (e) => {
          if (e.key === "Enter") doVerify();
        });
      }

      if (solToggle && solContent) {
        solToggle.addEventListener("click", () => {
          const isOpen = solContent.style.display === "block";
          solContent.style.display = isOpen ? "none" : "block";
          if (toggleArrow) toggleArrow.textContent = isOpen ? "▼" : "▲";
          if (!isOpen) {
            window.CO_SOLVER.renderMath(solContent);
          }
        });
      }
    };

    renderCardContent();
    listContainer.appendChild(card);
  });

  window.CO_SOLVER.renderMath(container);
}
