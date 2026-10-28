// 主應用程式調度器與 UI 渲染模組 (Ch1 - Ch3 整合升級版)

let currentTransMode = "study"; // "study" (對照研讀) 或 "quiz" (盲測默寫)

document.addEventListener("DOMContentLoaded", function() {
  initTheme();
  initTabs();
  renderCheatSheet();
  renderCalculationArena();
  renderTranslationLab();
  renderAssignmentsLab();
  initMockExam();
  renderExpansionGuide();
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
  btn.textContent = theme === "light" ? "🌙 切換深色模式" : "☀️ 切換淺色模式";
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
        
        <h3 style="font-size: 1rem; color: var(--primary); margin: 1.25rem 0 0.75rem 0;">📐 核心公式速查表</h3>
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

    html += `</div><h3 style="font-size: 1rem; color: var(--primary); margin: 1.25rem 0 0.75rem 0;">📖 重點知識樹整理</h3>`;

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

  filterHtml += `<button class="filter-btn" data-filter="hw1">🔥 作業一必考題型</button>`;
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
          ${isHw1 ? '<span class="tag-badge tag-hw1">🔥 作業一高頻必考</span>' : ''}
        </div>
        <span style="font-size: 0.8rem; color: var(--text-muted);">類別：${instance.category}</span>
      </div>
      <button class="action-btn btn-secondary refresh-btn" style="font-size: 0.8rem; padding: 0.35rem 0.75rem;">
        🎲 換一題 (隨機數值)
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
        ✅ 送出驗證
      </button>
    </div>

    <div class="feedback-msg"></div>

    <div class="solution-box">
      <div class="solution-toggle">
        <span>📖 查看詳細解題步驟與推導</span>
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

  verifyBtn.addEventListener("click", function() {
    const res = window.CO_SOLVER.verify(problemDef.id, inputEl.value);
    feedbackEl.className = `feedback-msg show ${res.isCorrect ? "feedback-success" : "feedback-error"}`;
    feedbackEl.innerHTML = `<strong>${res.isCorrect ? "✅ 正確" : "❌ 未通過"}</strong>：${res.message}`;
    if (!res.isCorrect) {
      solutionContent.classList.add("open");
      toggleIcon.textContent = "▲";
    }
    window.CO_SOLVER.renderMath(feedbackEl);
  });

  inputEl.addEventListener("keydown", function(e) {
    if (e.key === "Enter") {
      verifyBtn.click();
    }
  });

  refreshBtn.addEventListener("click", function() {
    refreshCardContent(card, problemDef);
    window.CO_SOLVER.renderMath(card);
  });

  solutionToggle.addEventListener("click", function() {
    solutionContent.classList.toggle("open");
    toggleIcon.textContent = solutionContent.classList.contains("open") ? "▲" : "▼";
    window.CO_SOLVER.renderMath(solutionContent);
  });
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
    <button class="filter-btn" data-filter="hw1">🔥 作業一必考 (${list.filter(x => x.title.includes('作業一')).length})</button>
    <button class="filter-btn" data-filter="hw2">🌟 作業二核心 (${list.filter(x => x.title.includes('作業二')).length})</button>
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
              ${isHw1 ? '<span class="tag-badge tag-hw1">🔥 作業一必考</span>' : ''}
              ${isHw2 ? '<span class="tag-badge tag-hw2">🌟 作業二核心</span>' : ''}
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
              <span style="font-size: 0.9rem; font-weight: 700; color: var(--primary);">✍️ 盲測默寫特訓區：請嘗試寫出對應的 ${item.direction === 'C -> MIPS' ? 'MIPS 組合語言' : 'C 語言'} 程式碼</span>
              <span style="font-size: 0.8rem; color: var(--text-muted);">（輸入後點擊核對解答）</span>
            </div>
            <textarea class="quiz-textarea" placeholder="在此處鍵入您的作答代碼...例如：&#10;addi $sp, $sp, -4&#10;sw   $s0, 0($sp)..."></textarea>
            <div class="quiz-controls">
              <button class="action-btn btn-secondary btn-show-hint">💡 查看解題提示</button>
              <button class="action-btn btn-primary btn-reveal-ans">🔓 核對解答與逐行剖析</button>
            </div>
            <div class="hint-box">
              <strong>💡 解題關鍵提示：</strong>${item.hint || "請注意暫存器配置約定、Word 邊界對齊與分支反轉。"}
            </div>
          </div>
        </div>

        <!-- 對照檢視區塊 -->
        <div class="code-comparison-grid">
          <div class="code-panel panel-c">
            <div class="code-panel-header">
              <span>💻 C / C++ 程式原始碼</span>
            </div>
            <pre class="code-content">${escapeHtml(item.cCode)}</pre>
          </div>
          <div class="code-panel panel-mips">
            <div class="code-panel-header">
              <span>⚙️ MIPS 組合語言對應實作</span>
            </div>
            <pre class="code-content" style="color: #4ade80;">${escapeHtml(item.mipsCode)}</pre>
          </div>
        </div>

        <div class="solution-box details-box">
          <div class="solution-toggle">
            <span>🔍 逐行轉譯對應解析與暫存器追蹤 (Line-by-Line Breakdown)</span>
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
          <div class="pitfall-title">⚠️ 常見考試易失分陷阱剖析</div>
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
        revealBtn.textContent = "✅ 已展開權威解答";
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
        revealBtn.textContent = "🔓 核對解答與逐行剖析";
        revealBtn.classList.add("btn-primary");
        revealBtn.classList.remove("btn-secondary");
      }
    }
  });
}

// 6. 渲染作業全真解析專區 (Assignment 1 & 2 Lab)
function renderAssignmentsLab() {
  const container = document.getElementById("assignmentsLabContainer");
  if (!container) return;

  container.innerHTML = `
    <!-- Assignment 1 必考解析 -->
    <div class="card assignment-section">
      <div class="card-header">
        <div>
          <h2 class="card-title" style="color: var(--primary);">🔥 Assignment #1 全真題型核心解構與期中考點</h2>
          <span style="font-size: 0.85rem; color: var(--text-muted);">涵蓋 Chapter 1 & 2：老師特別交代作業一題型為期中考試最高頻命中題型！</span>
        </div>
        <span class="tag-badge tag-hw1">HW1 必考專區</span>
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
                $\\text{CPI}_{P1} = 0.1(1) + 0.2(2) + 0.5(3) + 0.2(3) = 2.6$。時脈週期數 $= 2.6 \\times 10^6$。時間 $= 1.04$ ms。<br>
                $\\text{CPI}_{P2} = 2.0$。時脈週期數 $= 2.0 \\times 10^6$。時間 $= 0.67$ ms。<strong>P2 較快</strong>。
              </td>
            </tr>
            <tr>
              <td><strong>第 3 題</strong></td>
              <td>編譯器效能衝擊與加速比</td>
              <td>
                Compiler A (1.0E9 指令, 1.1s) vs Compiler B (1.2E9 指令, 1.5s)，週期 1ns。<br>
                $\\text{CPI}_A = 1.1 / (10^9 \\times 10^{-9}) = 1.1$；$\\text{CPI}_B = 1.5 / (1.2 \\times 10^9 \\times 10^{-9}) = 1.25$。<br>
                新編譯器 (6.0E8 指令, CPI 1.1) 耗時 $= 0.66$s。相對 A 加速比 $= 1.1 / 0.66 = 1.67$ 倍。
              </td>
            </tr>
            <tr>
              <td><strong>第 4 題</strong></td>
              <td>阿姆達爾定律單一部件極限</td>
              <td>
                總時間 250s (FP: 70s, L/S: 85s, Branch: 40s, INT: 55s)。<br>
                若要求僅透過分支單元將總時間縮短 20% (需減少 50s)：因為分支總時間只有 40s，即使降為 0s 最多只能省 40s，因此<strong>物理上不可能達成 (Unattainable)</strong>！
              </td>
            </tr>
            <tr>
              <td><strong>第 5 題</strong></td>
              <td>指令 CPI 改進極限與倒推</td>
              <td>
                能否僅改善 FP CPI 讓程式加速 2 倍？計算非 FP 部分時間是否已經超過總時間的一半；若超過則無法達成。
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
                \`slt $t2, $0, $t1\` 搭配 \`beq $t2, $0, DONE\` $\\implies$ C 語言 \`while(i > 0) { i--; B += 2; }\`。<br>
                當 $t1 = 10, s2 = 0$ 初始時，結束 $s2 = 20$。動態執行指令數為 $5N + 2$（退出檢查 2 條指令）。
              </td>
            </tr>
            <tr>
              <td><strong>第 8 題</strong></td>
              <td>記憶體指標步進累加迴圈</td>
              <td>
                \`lw $s1, 0($s0)\` 搭配 \`addi $s0, $s0, 4\` $\\implies$ \`for (i=0; i<100; i++) { result += MemArray[i]; }\`。<br>
                陷阱：題目要求 preserve initial value of result，不可寫 \`result = 0;\`！
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

    <!-- Assignment 2 核心攻略 -->
    <div class="card assignment-section">
      <div class="card-header">
        <div>
          <h2 class="card-title" style="color: #c084fc;">🌟 Assignment #2 遞迴費氏數列（Recursive Fibonacci in MIPS MARS）實戰指南</h2>
          <span style="font-size: 0.85rem; color: var(--text-muted);">深入拆解：函式呼叫約定 (Calling Convention)、雙遞迴堆疊保護與 MARS 模擬器操作</span>
        </div>
        <span class="tag-badge tag-hw2">HW2 專題解析</span>
      </div>

      <div style="margin-top: 1.25rem;">
        <h3 style="color: var(--primary); font-size: 1.1rem; margin-bottom: 0.5rem;">一、作業規範核心精要 (Program Requirements)</h3>
        <ul style="margin-left: 1.5rem; line-height: 1.8; color: var(--text-muted); font-size: 0.92rem;">
          <li><strong>定義</strong>：$F(0) = 0$，$F(1) = 1$，$F(n) = F(n - 1) + F(n - 2)$ (for $n \\ge 2$)。</li>
          <li><strong>輸入驗證</strong>：自終端讀取整數 $n$，限制 $0 \\le n \\le 20$。超出範圍必須顯示錯誤訊息並重新提示輸入，直到輸入合法。</li>
          <li><strong>嚴格遞迴實作</strong>：必須實作名為 \`fib\` 的遞迴程序。當 $n \\ge 2$ 時分別呼叫 \`fib(n-1)\` 與 \`fib(n-2)\` 並相加。<strong>嚴禁使用迴圈或建表查值替代</strong>！</li>
          <li><strong>暫存器約定</strong>：引數 $n$ 由 \`$a0\` 傳入，傳回值放於 \`$v0\`。呼叫使用 \`jal\`，返回使用 \`jr $ra\`。</li>
          <li><strong>輸出格式</strong>：印出完整的 $F(0), F(1), \\dots, F(n)$（共 $n+1$ 項），以逗號或空格分隔。</li>
        </ul>

        <h3 style="color: var(--primary); font-size: 1.1rem; margin: 1.5rem 0 0.5rem 0;">二、雙遞迴堆疊訊框（Stack Frame Layout）圖解</h3>
        <p style="font-size: 0.9rem; color: var(--text-muted); margin-bottom: 0.75rem;">
          在執行雙遞迴函式時，每次呼叫 \`fib\` 需在堆疊配置 12 位元組（3 個 Word）空間。為什麼需要這三個暫存器？
        </p>
        
        <div class="stack-frame-visual">
+------------------------------------------+  <-- 進入前的高位址 (Higher Address)
|   舊返回位址 ($ra)       [Offset: 8($sp)] |  (防止內層 jal fib 覆寫上一層返回位址)
+------------------------------------------+
|   被保護暫存器 ($s0)     [Offset: 4($sp)] |  (儲存第一次遞迴 fib(n-1) 的結果，防止被 fib(n-2) 覆蓋)
+------------------------------------------+
|   傳入引數 ($a0 = n)     [Offset: 0($sp)] |  (保存本層的 n，供遞迴返回後計算 n - 2 使用)
+------------------------------------------+  <-- 當前堆疊頂端 ($sp，每次配置 addi $sp, $sp, -12)
        </div>

        <h3 style="color: var(--primary); font-size: 1.1rem; margin: 1.5rem 0 0.5rem 0;">三、以 F(3) 為例之遞迴呼叫展開樹與暫存器安全性分析</h3>
        <div style="background: var(--bg-secondary); padding: 1rem 1.25rem; border-radius: var(--radius); border: 1px solid var(--border-color); font-size: 0.9rem; line-height: 1.8;">
          <p><strong>呼叫順序與堆疊深度變化</strong>：</p>
          <ol style="margin-left: 1.25rem; color: var(--text-muted);">
            <li><code>main</code> 呼叫 <code>fib(3)</code>：堆疊深度 1，保存 $a0=3$。</li>
            <li><code>fib(3)</code> 呼叫 <code>fib(2)</code>：堆疊深度 2，保存 $a0=2$。</li>
            <li><code>fib(2)</code> 呼叫 <code>fib(1)</code>：命中 Base case，直接在 <code>$v0</code> 回傳 1。</li>
            <li><code>fib(2)</code> 取回 <code>$v0=1</code>，將其暫存至 <code>$s0</code>。隨後從堆疊載回 $a0=2$，計算 $a0-2=0$，呼叫 <code>fib(0)</code>。</li>
            <li><code>fib(0)</code> 命中 Base case，回傳 0。</li>
            <li><code>fib(2)</code> 將 <code>$s0 + $v0</code> (即 1 + 0 = 1) 存入 <code>$v0</code>，釋放堆疊返回。</li>
            <li><code>fib(3)</code> 取得 <code>fib(2) = 1</code>，存入 <code>$s0</code>。隨後載回 $a0=3$，呼叫 <code>fib(1)</code> 得 1。相加 $1 + 1 = 2$ 回傳！</li>
          </ol>
        </div>

        <h3 style="color: var(--primary); font-size: 1.1rem; margin: 1.5rem 0 0.5rem 0;">四、完整 MARS 可組譯執行原始碼架構 (Reference Code Structure)</h3>
        <div class="code-panel">
          <div class="code-panel-header">
            <span>StudentID_Assignment2_fib.asm (MARS 完全相容範本)</span>
          </div>
          <pre class="code-content" style="color: #a5f3fc; max-height: 400px; overflow-y: auto;">
.data
prompt:     .asciiz "Enter n (0-20): "
err_msg:    .asciiz "Invalid input. Please enter a value from 0 to 20.\\n"
seq_msg:    .asciiz "Fibonacci sequence: "
comma:      .asciiz ", "
newline:    .asciiz "\\n"

.text
.globl main

main:
    # 1. 輸入驗證迴圈 (Input Validation Loop)
read_loop:
    li   $v0, 4
    la   $a0, prompt
    syscall
    
    li   $v0, 5          # 讀取整數
    syscall
    move $s1, $v0        # $s1 儲存使用者輸入的 n
    
    # 邊界判定: 0 &lt;= n &lt;= 20
    bltz $s1, invalid_input
    li   $t0, 20
    bgt  $s1, $t0, invalid_input
    j    input_valid

invalid_input:
    li   $v0, 4
    la   $a0, err_msg
    syscall
    j    read_loop

input_valid:
    li   $v0, 4
    la   $a0, seq_msg
    syscall
    
    # 2. 依序計算並印出 F(0) 至 F(n) (共 n + 1 項)
    li   $s2, 0          # $s2 為迴圈變數 i = 0
print_loop:
    bgt  $s2, $s1, exit_main
    
    # 呼叫遞迴函式 fib(i)
    move $a0, $s2
    jal  fib
    move $s3, $v0        # $s3 = F(i)
    
    # 印出整數 F(i)
    li   $v0, 1
    move $a0, $s3
    syscall
    
    # 若非最後一項，印出逗號分隔
    beq  $s2, $s1, skip_comma
    li   $v0, 4
    la   $a0, comma
    syscall
skip_comma:
    addi $s2, $s2, 1
    j    print_loop

exit_main:
    li   $v0, 4
    la   $a0, newline
    syscall
    li   $v0, 10         # 系統呼叫: 正常結束程式
    syscall

# -----------------------------------------------------------
# 遞迴程序 fib: 計算 F(n)
# 引數: $a0 = n
# 回傳: $v0 = F(n)
# -----------------------------------------------------------
fib:
    addi $sp, $sp, -12   # 配置 12 bytes 堆疊框架
    sw   $ra, 8($sp)     # 保存返回位址
    sw   $s0, 4($sp)     # 保存 Callee-saved 暫存器 $s0
    sw   $a0, 0($sp)     # 保存當前引數 n
    
    # Base Case: n == 0 -&gt; 回傳 0
    beq  $a0, $zero, fib_base0
    
    # Base Case: n == 1 -&gt; 回傳 1
    li   $t0, 1
    beq  $a0, $t0, fib_base1
    
    # Recursive Step 1: fib(n - 1)
    addi $a0, $a0, -1
    jal  fib
    move $s0, $v0        # 安全保存 fib(n-1) 之結果至 $s0
    
    # Recursive Step 2: fib(n - 2)
    lw   $a0, 0($sp)     # 還原原始 n
    addi $a0, $a0, -2
    jal  fib             # $v0 = fib(n-2)
    
    # 合併兩者結果: $v0 = fib(n-1) + fib(n-2)
    add  $v0, $s0, $v0
    j    fib_return

fib_base0:
    li   $v0, 0
    j    fib_return

fib_base1:
    li   $v0, 1

fib_return:
    lw   $a0, 0($sp)     # 還原暫存器
    lw   $s0, 4($sp)
    lw   $ra, 8($sp)
    addi $sp, $sp, 12    # 釋放堆疊框架
    jr   $ra             # 返回呼叫端
          </pre>
        </div>

        <h3 style="color: var(--primary); font-size: 1.1rem; margin: 1.5rem 0 0.5rem 0;">五、錄影展示（3–10 分鐘英文口說解說）高分關鍵指引</h3>
        <div style="background: var(--bg-secondary); padding: 1.25rem; border-radius: var(--radius); border-left: 4px solid #c084fc; font-size: 0.9rem; line-height: 1.8;">
          <p><strong>影片評分佔比高達 40%，教授與助教評估的核心重點</strong>：</p>
          <ul style="margin-left: 1.25rem; color: var(--text-muted);">
            <li><strong>展示四組測試數值</strong>：影片一開始必須依序在 MARS 執行展示 $n = 0, 1, 5, 10$ 之輸出，並示範輸入 $50$ 或 $-5$ 觸發驗證重試。</li>
            <li><strong>使用 F(3) 單步除錯 (Single-Stepping)</strong>：在 \`fib\` 入口處下中斷點，展示 MARS 右下角 Registers 視窗中 <code>$sp</code> 位址數值的遞減（每次減 12）以及 Data Segment 堆疊空間中寫入的數值。</li>
            <li><strong>重點解釋「為何第一次結果放在 $s0」</strong>：向鏡頭明確指出若不移至 <code>$s0</code>，第二次呼叫 <code>jal fib</code> 會把 <code>$v0</code> 覆寫，造成計算錯誤。</li>
            <li><strong>發音與文法不計分</strong>：專注於邏輯說明與程式對齊，保持冷靜分析的口吻即可。</li>
          </ul>
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
    startBtn.textContent = "🔄 重新抽取測驗試卷";
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

// 8. 新增講義擴充指南
function renderExpansionGuide() {
  const container = document.getElementById("expansionGuideContainer");
  if (!container) return;

  container.innerHTML = `
    <div class="card">
      <div class="card-header">
        <h2 class="card-title">🚀 系統擴充規範：如何無痛新增後續講義 (Chapter 4, Chapter 5...)</h2>
        <span class="badge badge-success">開發者指南</span>
      </div>

      <p style="color: var(--text-muted); margin-bottom: 1.5rem;">
        本平台採<strong>完全解耦與資料驅動架構</strong>。已完整整合 Chapter 1、2、3 及 Assignment 1、2。未來老師發布新講義（如 Chapter 4 處理器微架構與管線化流水線 Pipeline）時，只需完成以下兩個步驟，系統將自動於導航欄、公式表、練習區與模擬考中動態掛載，無須重寫任何 UI 或控制邏輯。
      </p>

      <div class="guide-step">
        <h4>步驟一：在 <code>js/data/</code> 資料夾建立新章節檔案（如 <code>chapter4.js</code>）</h4>
        <p style="font-size: 0.88rem; color: var(--text-muted); margin-bottom: 0.5rem;">
          定義章節重點、公式速查以及計算題求解器模板：
        </p>
        <pre><code>// js/data/chapter4.js
window.CO_DATA = window.CO_DATA || { chapters: [], translations: [] };

window.CO_DATA.chapters.push({
  id: "ch4",
  title: "Chapter 4: 處理器架構與管線化 (The Processor)",
  shortTitle: "Ch4 管線化處理器",
  summary: [
    { heading: "1. 5 階管線化架構 (IF, ID, EX, MEM, WB)", content: "..." }
  ],
  formulas: [
    { name: "管線化加速比上限", formula: "\\\\text{Speedup} \\\\le \\\\text{Pipeline Depth}" }
  ],
  dynamicProblems: [
    {
      id: "ch4_pipeline_stall",
      title: "題型 4-1：資料相依 (Data Hazard) 與轉發 (Forwarding) 週期分析",
      category: "管線化相依分析",
      generator: function() { return { stalls: 2 }; },
      render: function(p) { return "計算包含氣泡之總週期數..."; },
      solve: function(p) { return { correctValue: 12, unit: "cycles", explanation: "推導過程..." }; }
    }
  ]
});</code></pre>
      </div>

      <div class="guide-step">
        <h4>步驟二：在 <code>index.html</code> 中引入該腳本</h4>
        <pre><code>&lt;!-- 在 index.html 的 script 區段加入新檔案即可 --&gt;
&lt;script src="js/data/chapter1.js"&gt;&lt;/script&gt;
&lt;script src="js/data/chapter2.js"&gt;&lt;/script&gt;
&lt;script src="js/data/chapter3.js"&gt;&lt;/script&gt;
&lt;script src="js/data/chapter4.js"&gt;&lt;/script&gt; &lt;!-- 新增此行 --&gt;</code></pre>
      </div>

      <div class="pitfall-callout" style="background: var(--primary-light); border-left-color: var(--primary);">
        <div class="pitfall-title" style="color: var(--primary);">✨ 全自動動態適配機制</div>
        系統會自動將新章節整合至：<strong>導航篩選按鈕</strong>、<strong>重點公式總覽</strong>、<strong>動態出題引擎</strong> 與 <strong>全真模擬隨機測驗抽題庫</strong>，擴充工作在數分鐘內即可完成。
      </div>
    </div>
  `;
}

// 9. 互動式 1 位元 ALU 訊號模擬器產生器
function getAluSimulatorHtml() {
  return `
    <div class="alu-sim-container" id="aluSimulatorBox">
      <div class="alu-sim-title">⚡ 互動式 1 位元 ALU 電路訊號模擬器 (Interactive 1-bit ALU Simulator)</div>
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
        <div class="circuit-diagram-caption">📐 電路架構圖：${img.alt}（點擊圖片可於新分頁開啟高解析度原圖）</div>
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
