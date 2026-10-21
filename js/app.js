// 主應用程式調度器與 UI 渲染模組

document.addEventListener("DOMContentLoaded", function() {
  initTheme();
  initTabs();
  renderCheatSheet();
  renderCalculationArena();
  renderTranslationLab();
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
      <div class="card">
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

    chap.summary.forEach(sec => {
      html += `
        <div style="margin-bottom: 1.25rem; background: var(--bg-secondary); padding: 1rem 1.25rem; border-radius: var(--radius); border: 1px solid var(--border-color);">
          <h4 style="font-size: 0.95rem; margin-bottom: 0.5rem; color: var(--text-main); font-weight: 700;">${sec.heading}</h4>
          <div style="font-size: 0.9rem; line-height: 1.7; color: var(--text-muted);">${formatMarkdown(sec.content)}</div>
        </div>
      `;
    });

    html += `</div>`;
  });

  container.innerHTML = html;
  window.CO_SOLVER.renderMath(container);
}

// 4. 渲染動態計算題庫 (Calculation Arena)
function renderCalculationArena() {
  const container = document.getElementById("calculationArenaContainer");
  const filterContainer = document.getElementById("calcFilterContainer");
  if (!container || !window.CO_DATA) return;

  // 收集所有章節題目定義
  let allProblemDefs = [];
  let filterHtml = `<button class="filter-btn active" data-filter="all">全部章節 (${allProblemCount()})</button>`;

  window.CO_DATA.chapters.forEach(chap => {
    filterHtml += `<button class="filter-btn" data-filter="${chap.id}">${chap.shortTitle} (${chap.dynamicProblems.length})</button>`;
    chap.dynamicProblems.forEach(p => {
      p.chapterId = chap.id;
      allProblemDefs.push(p);
    });
  });

  filterContainer.innerHTML = filterHtml;

  // 綁定篩選器點擊
  const filterBtns = filterContainer.querySelectorAll(".filter-btn");
  filterBtns.forEach(btn => {
    btn.addEventListener("click", function() {
      filterBtns.forEach(b => b.classList.remove("active"));
      this.classList.add("active");
      const filter = this.getAttribute("data-filter");
      document.querySelectorAll(".calc-card-item").forEach(card => {
        if (filter === "all" || card.getAttribute("data-chapter") === filter) {
          card.style.display = "block";
        } else {
          card.style.display = "none";
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
  card.id = `card_${problemDef.id}`;

  refreshCardContent(card, problemDef);
  return card;
}

function refreshCardContent(card, problemDef) {
  // 生成隨機題目實例
  const instance = window.CO_SOLVER.instantiateQuestion(problemDef);

  card.innerHTML = `
    <div class="card-header">
      <div>
        <h3 class="card-title">${instance.title}</h3>
        <span style="font-size: 0.8rem; color: var(--text-muted);">類別：${instance.category}</span>
      </div>
      <button class="action-btn btn-secondary refresh-btn" style="font-size: 0.8rem; padding: 0.35rem 0.75rem;">
        🎲 換一題 (隨機數字)
      </button>
    </div>

    <div class="question-prompt">
      ${formatMarkdown(instance.renderedText)}
    </div>

    <div class="interactive-area">
      <div class="input-group">
        <label style="font-size: 0.9rem; font-weight: 600;">您的計算答案：</label>
        <input type="text" class="answer-input" placeholder="請輸入數值或十六進位碼 (如 0x...)" />
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

// 5. 渲染 C/C++ 與 MIPS 雙向轉譯實驗室 (Translation Lab)
function renderTranslationLab() {
  const container = document.getElementById("translationLabContainer");
  const filterContainer = document.getElementById("transFilterContainer");
  if (!container || !window.CO_DATA) return;

  const list = window.CO_DATA.translations;

  filterContainer.innerHTML = `
    <button class="filter-btn active" data-filter="all">全部題型 (${list.length})</button>
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
        if (f === "all" || card.getAttribute("data-dir") === f) {
          card.style.display = "block";
        } else {
          card.style.display = "none";
        }
      });
    });
  });

  let html = "";
  list.forEach(item => {
    html += `
      <div class="card trans-card-item" data-dir="${item.direction}">
        <div class="card-header">
          <div>
            <h3 class="card-title">${item.title}</h3>
            <p style="font-size: 0.85rem; color: var(--text-muted); margin-top: 0.25rem;">${item.description}</p>
          </div>
          <div style="display: flex; gap: 0.5rem; align-items: center;">
            <span class="badge ${item.direction === 'C -> MIPS' ? 'badge-primary' : 'badge-warning'}">${item.direction}</span>
            <span class="badge badge-success">${item.level}</span>
          </div>
        </div>

        <div class="code-comparison-grid">
          <div class="code-panel">
            <div class="code-panel-header">
              <span>💻 C / C++ 程式原始碼</span>
            </div>
            <pre class="code-content">${escapeHtml(item.cCode)}</pre>
          </div>
          <div class="code-panel">
            <div class="code-panel-header">
              <span>⚙️ MIPS 組合語言對應實作</span>
            </div>
            <pre class="code-content" style="color: #4ade80;">${escapeHtml(item.mipsCode)}</pre>
          </div>
        </div>

        <div class="solution-box">
          <div class="solution-toggle">
            <span>🔍 逐行轉譯對應解析與暫存器追蹤 (Line-by-Line Breakdown)</span>
            <span>▼</span>
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

        <div class="pitfall-callout">
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
      content.classList.toggle("open");
    });
  });
}

// 6. 全真模擬隨機測驗模式 (Mock Exam)
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

    // 隨機抽取 5 題計算題
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
        所有錯題之推導步驟已在上方自動展開，請務必針對紅框錯題進行複習。
      </p>
    `;
    scoreBoard.scrollIntoView({ behavior: "smooth" });
  });
}

// 7. 新增講義擴充指南
function renderExpansionGuide() {
  const container = document.getElementById("expansionGuideContainer");
  if (!container) return;

  container.innerHTML = `
    <div class="card">
      <div class="card-header">
        <h2 class="card-title">🚀 系統擴充規範：如何無痛新增後續講義 (Chapter 3, Chapter 4...)</h2>
        <span class="badge badge-success">開發者指南</span>
      </div>

      <p style="color: var(--text-muted); margin-bottom: 1.5rem;">
        本平台採<strong>完全解耦與資料驅動架構</strong>。未來老師發布新講義（如 Chapter 3 算術運算、Chapter 4 管線化處理器）時，只需完成以下兩個步驟，系統將自動於導航欄、公式表、練習區與模擬考中動態掛載，無須重寫任何 UI 或控制邏輯。
      </p>

      <div class="guide-step">
        <h4>步驟一：在 <code>js/data/</code> 資料夾建立新章節檔案（如 <code>chapter3.js</code>）</h4>
        <p style="font-size: 0.88rem; color: var(--text-muted); margin-bottom: 0.5rem;">
          定義章節重點、公式速查以及計算題求解器模板：
        </p>
        <pre><code>// js/data/chapter3.js
window.CO_DATA = window.CO_DATA || { chapters: [], translations: [] };

window.CO_DATA.chapters.push({
  id: "ch3",
  title: "Chapter 3: 算術運算與 ALU 設計 (Arithmetic for Computers)",
  shortTitle: "Ch3 算術運算",
  summary: [
    { heading: "1. 乘法與除法硬體架構", content: "..." }
  ],
  formulas: [
    { name: "Booth 演算法規則", formula: "..." }
  ],
  dynamicProblems: [
    {
      id: "ch3_booth",
      title: "題型 3-1：Booth 演算法乘法過程推導",
      category: "算術運算",
      generator: function() {
        return { multiplicand: 3, multiplier: -4 };
      },
      render: function(p) {
        return \`計算 \${p.multiplicand} 乘 \${p.multiplier} 之 8 位元二進位結果：\`;
      },
      solve: function(p) {
        return {
          correctValue: p.multiplicand * p.multiplier,
          tolerance: 0,
          explanation: "步驟說明..."
        };
      }
    }
  ]
});</code></pre>
      </div>

      <div class="guide-step">
        <h4>步驟二：在 <code>index.html</code> 中引入該腳本</h4>
        <pre><code>&lt;!-- 在 index.html 的 head 區段加入新檔案即可 --&gt;
&lt;script src="js/data/chapter1.js"&gt;&lt;/script&gt;
&lt;script src="js/data/chapter2.js"&gt;&lt;/script&gt;
&lt;script src="js/data/chapter3.js"&gt;&lt;/script&gt; &lt;!-- 新增此行 --&gt;</code></pre>
      </div>

      <div class="pitfall-callout" style="background: var(--primary-light); border-left-color: var(--primary);">
        <div class="pitfall-title" style="color: var(--primary);">✨ 全自動動態適配機制</div>
        系統會自動將新章節整合至：<strong>導航篩選按鈕</strong>、<strong>重點公式總覽</strong>、<strong>動態出題引擎</strong> 與 <strong>全真模擬隨機測驗抽題庫</strong>，擴充工作在 5 分鐘內即可完成。
      </div>
    </div>
  `;
}

// 輔助函式：Markdown 粗體與條列簡易轉譯
function formatMarkdown(text) {
  if (!text) return "";
  let s = text.trim();
  // 轉義特殊字元但保留數學符號
  s = s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  // 處理反引號程式碼
  s = s.replace(/`([^`]+)`/g, '<code style="background: var(--code-bg); color: var(--primary); padding: 0.1rem 0.3rem; border-radius: 4px; font-family: var(--font-mono);">$1</code>');
  // 處理粗體
  s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  // 處理清單
  s = s.replace(/^\s*-\s+(.+)$/gm, '<li style="margin-left: 1.25rem;">$1</li>');
  // 處理換行
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
