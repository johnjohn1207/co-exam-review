// 互動硬體邏輯實驗室 (Interactive Logic Lab)
// 包含四大核心互動模組：
// 1. 布斯乘法演算法（Booth's Algorithm）動態步進模擬器
// 2. IEEE 754 32 位元浮點數即時拆解器
// 3. 1 位元 ALU 訊號通路模擬器
// 4. 費氏數列 F(3) 雙遞迴堆疊框架動態追蹤器

window.CO_INTERACTIVE = {

  // 頂層容器渲染入口
  initLab: function(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = this.getLabTemplate();
    this.bindLabNavigation();

    // 依序初始化四大實驗室模組
    this.booth.init();
    this.floatInspector.init();
    this.alu.init();
    this.stackAnim.init();

    if (window.CO_SOLVER && typeof window.CO_SOLVER.renderMath === "function") {
      window.CO_SOLVER.renderMath(container);
    }
  },

  // 實驗室導航切換
  bindLabNavigation: function() {
    const navBtns = document.querySelectorAll(".lab-station-pill");
    const stations = document.querySelectorAll(".lab-station-section");

    navBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        navBtns.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");

        const targetStation = btn.getAttribute("data-station");
        stations.forEach(sec => {
          if (targetStation === "all" || sec.id === targetStation) {
            sec.style.display = "block";
          } else {
            sec.style.display = "none";
          }
        });

        // 重新渲染數學公式
        if (window.CO_SOLVER && typeof window.CO_SOLVER.renderMath === "function") {
          window.CO_SOLVER.renderMath(document.getElementById("interactiveLabContainer"));
        }
      });
    });
  },

  // 實驗室整體骨架 HTML
  getLabTemplate: function() {
    return `
      <!-- 站點快速切換列 -->
      <div class="station-nav-bar">
        <div class="station-nav-title">實驗站點切換：</div>
        <div class="station-nav-pills">
          <button class="lab-station-pill active" data-station="all">展示全部模組</button>
          <button class="lab-station-pill" data-station="stationBooth">[1] 布斯乘法逐步模擬器</button>
          <button class="lab-station-pill" data-station="stationFloat">[2] IEEE 754 浮點數拆解器</button>
          <button class="lab-station-pill" data-station="stationAlu">[3] 1 位元 ALU 訊號模擬器</button>
          <button class="lab-station-pill" data-station="stationStack">[4] 費氏數列堆疊追蹤器 (HW2)</button>
        </div>
      </div>

      <!-- 站點 1：布斯乘法演算法步進模擬器 -->
      <section class="lab-station-section card" id="stationBooth" style="margin-bottom: 2rem;">
        <div class="card-header">
          <div>
            <h2 class="card-title">站點 1：布斯乘法演算法動態步進模擬器 (Booth's Algorithm Simulator)</h2>
            <div class="card-subtitle">支援 4 位元與 8 位元有號數乘法、自訂輸入、位元暫存器即時連動與逐週期狀態追蹤</div>
          </div>
          <span class="badge badge-primary">Chapter 3 算術硬體</span>
        </div>

        <div class="interactive-intro-box">
          <p>
            <strong>核心邏輯推導：</strong>布斯演算法透過偵測乘數（Multiplier）相鄰位元對 <code>Q0 Q-1</code> 的變化，將連續的多個 1 化簡為「一次加法與一次減法」，大幅節省硬體運算週期（例如：$011110_2 = 100000_2 - 000010_2$）。
          </p>
          <div class="booth-rule-chips">
            <span class="rule-chip chip-sub"><strong>10</strong>：進入連續 1（減法 $A = A - M$）</span>
            <span class="rule-chip chip-add"><strong>01</strong>：退出連續 1（加法 $A = A + M$）</span>
            <span class="rule-chip chip-shift"><strong>00 / 11</strong>：無連續 1 變化（純算術右移 ASR）</span>
          </div>
        </div>

        <!-- 參數配置與操作面板 -->
        <div class="booth-controls-panel">
          <div class="controls-row">
            <div class="ctrl-field">
              <label for="boothPresetSelect">經典例題預設：</label>
              <select id="boothPresetSelect" class="input-ctrl">
                <option value="7,-5,4">7 × (-5) [4 位元，投影片例題]</option>
                <option value="7,-5,8" selected>7 × (-5) [8 位元，全字長推導]</option>
                <option value="-3,4,4">-3 × 4 [4 位元，負正相乘]</option>
                <option value="5,6,8">5 × 6 [8 位元，正正相乘]</option>
                <option value="-7,-3,4">-7 × (-3) [4 位元，負負相乘]</option>
                <option value="12,9,8">12 × 9 [8 位元，大數運算]</option>
                <option value="-15,10,8">-15 × 10 [8 位元，有號數運算]</option>
              </select>
            </div>
            <div class="ctrl-field">
              <label for="boothInputM">被乘數 M (十進位)：</label>
              <input type="number" id="boothInputM" value="7" class="input-ctrl" style="width: 100px;" />
            </div>
            <div class="ctrl-field">
              <label for="boothInputQ">乘數 Q (十進位)：</label>
              <input type="number" id="boothInputQ" value="-5" class="input-ctrl" style="width: 100px;" />
            </div>
            <div class="ctrl-field">
              <label for="boothBitsSelect">運算位元寬度：</label>
              <select id="boothBitsSelect" class="input-ctrl" style="width: 110px;">
                <option value="4">4 位元</option>
                <option value="8" selected>8 位元</option>
              </select>
            </div>
            <div class="ctrl-field" style="align-self: flex-end;">
              <button id="boothBtnCalc" class="action-btn btn-primary">重新載入與計算</button>
            </div>
          </div>

          <div class="step-actions-bar">
            <button id="boothBtnPrev" class="action-btn btn-secondary">上一步</button>
            <button id="boothBtnStep" class="action-btn btn-primary">下一步 (單步執行)</button>
            <button id="boothBtnAuto" class="action-btn btn-secondary">自動播放</button>
            <button id="boothBtnReset" class="action-btn btn-secondary">重設至初始</button>
            <div class="step-status-indicator">
              <span id="boothCurrentStepText" class="step-badge-text">初始配置</span>
              <span id="boothProgressText" class="step-progress-text">週期：0 / 8</span>
            </div>
          </div>
        </div>

        <!-- 暫存器視覺化動態區塊 -->
        <div class="reg-visual-board">
          <div class="reg-board-title">暫存器即時狀態監控 (Register Monitor)</div>
          <div class="reg-banks-layout">
            <!-- 暫存器 A -->
            <div class="reg-card reg-card-a">
              <div class="reg-card-header">
                <span class="reg-name">暫存器 A (累加器)</span>
                <span class="reg-tag">長度：<span class="reg-bits-lbl">8</span> 位元</span>
              </div>
              <div class="reg-cells-row" id="boothBoxA"></div>
            </div>

            <!-- 暫存器 Q -->
            <div class="reg-card reg-card-q">
              <div class="reg-card-header">
                <span class="reg-name">暫存器 Q (乘數)</span>
                <span class="reg-tag">LSB = Q0</span>
              </div>
              <div class="reg-cells-row" id="boothBoxQ"></div>
            </div>

            <!-- 參考位元 Q-1 -->
            <div class="reg-card reg-card-qprev">
              <div class="reg-card-header">
                <span class="reg-name">Q-1</span>
                <span class="reg-tag">參考位元</span>
              </div>
              <div class="reg-cells-row" id="boothBoxQprev"></div>
            </div>
          </div>

          <!-- 即時動作與決策標籤 -->
          <div class="action-inspect-bar">
            <div class="inspect-item">
              <span class="inspect-lbl">目前決策位元對：</span>
              <span id="boothPairBadge" class="tag-badge">Q0 Q-1 = 00</span>
            </div>
            <div class="inspect-item">
              <span class="inspect-lbl">執行微操作：</span>
              <span id="boothOpBadge" class="tag-badge badge-primary">無運算</span>
            </div>
            <div class="inspect-desc" id="boothMeaningText">
              初始暫存器配置 (A=0, Q=乘數, Q-1=0)
            </div>
          </div>

          <!-- 運算結束結算看板 -->
          <div id="boothFinalResultArea" style="display: none;"></div>
        </div>

        <!-- 完整週期追蹤歷史表格 -->
        <div class="booth-history-section">
          <h3 class="history-title">逐週期狀態追蹤表（點擊任一行可直接跳轉至該步驟）：</h3>
          <div class="table-responsive-wrapper">
            <table class="booth-trace-table">
              <thead>
                <tr>
                  <th style="width: 15%;">週期與微步驟</th>
                  <th style="width: 10%;">Q0 Q-1</th>
                  <th style="width: 18%;">執行運算</th>
                  <th style="width: 16%;">暫存器 A</th>
                  <th style="width: 16%;">暫存器 Q</th>
                  <th style="width: 7%;">Q-1</th>
                  <th style="width: 18%;">狀態意涵說明</th>
                </tr>
              </thead>
              <tbody id="boothFullTableBody"></tbody>
            </table>
          </div>
        </div>

        <!-- 投影片 Slide 42 專題釋疑 -->
        <div class="slide-clarify-box">
          <h4 class="clarify-title">講義投影片 Slide 42「Begin of 1's」與「End of 1's」觀念徹底釐清：</h4>
          <p>
            在部分教材投影片中（如 Slide 42），老師將 <code>01</code> 標註為「Begin of 1's」，將 <code>10</code> 標註為「End of 1's」。此處差異來自<strong>視線觀察方向</strong>與<strong>硬體掃描方向</strong>：
          </p>
          <ul class="clarify-list">
            <li>
              <strong>投影片視角（自左向右觀察數值）：</strong>數值如 $01111110_2$，左側高位為開始出現 1 的端點（$+10000000_2$），右側低位為連續 1 結束的端點（$-10_2$）。
            </li>
            <li>
              <strong>硬體實作視角（自右向左 LSB 至 MSB 移位掃描）：</strong>由最低位元向高位元逐步移位檢視。當位元由 <code>0</code> 進入 <code>1</code>（即 $Q_0 Q_{-1} = 10$）時，代表剛踏入連續的 1，因此執行<strong>減法（$A = A - M$）</strong>；當位元由 <code>1</code> 離開至 <code>0</code>（即 $Q_0 Q_{-1} = 01$）時，代表剛離開連續的 1，因此執行<strong>加法（$A = A + M$）</strong>。
            </li>
            <li>
              <strong>結論：</strong>硬體實際執行的運算規則完全一致：<strong>只要看到 $10$ 一律做減法，看到 $01$ 一律做加法</strong>。
            </li>
          </ul>
        </div>
      </section>

      <!-- 站點 2：IEEE 754 32 位元浮點數即時拆解器 -->
      <section class="lab-station-section card" id="stationFloat" style="margin-bottom: 2rem;">
        <div class="card-header">
          <div>
            <h2 class="card-title">站點 2：IEEE 754 32 位元單精準度浮點數即時拆解器 (Float Inspector)</h2>
            <div class="card-subtitle">點擊任意位元立即翻轉、十進位與十六進位即時雙向轉換、隱含前導 1 與偏差指數動態推導</div>
          </div>
          <span class="badge badge-primary">Chapter 3 浮點數架構</span>
        </div>

        <!-- 快速預設與數值輸入面板 -->
        <div class="fp-ctrl-panel">
          <div class="fp-input-row">
            <div class="fp-input-group">
              <label for="fpInputDec">十進位浮點數：</label>
              <div class="input-with-btn">
                <input type="number" id="fpInputDec" step="any" value="-13.625" class="input-ctrl" style="width: 140px;" />
                <button id="fpBtnDec" class="action-btn btn-primary">解析十進位</button>
              </div>
            </div>
            <div class="fp-input-group">
              <label for="fpInputHex">32 位元十六進位碼 (Hex)：</label>
              <div class="input-with-btn">
                <input type="text" id="fpInputHex" value="0xC15A0000" class="input-ctrl" style="width: 140px; font-family: var(--font-mono);" />
                <button id="fpBtnHex" class="action-btn btn-primary">解析十六進位</button>
              </div>
            </div>
          </div>

          <div class="fp-presets-bar">
            <span class="preset-lbl">經典特例快速載入：</span>
            <button class="fp-preset-pill" data-val="-13.625">-13.625 (經典例題)</button>
            <button class="fp-preset-pill" data-val="0.15625">0.15625 (純小數)</button>
            <button class="fp-preset-pill" data-val="100.5">100.5</button>
            <button class="fp-preset-pill" data-val="+0">+0.0 (全零)</button>
            <button class="fp-preset-pill" data-val="-0">-0.0 (負零)</button>
            <button class="fp-preset-pill" data-val="+inf">+無窮大 (+Inf)</button>
            <button class="fp-preset-pill" data-val="-inf">-無窮大 (-Inf)</button>
            <button class="fp-preset-pill" data-val="nan">非數值 (NaN)</button>
            <button class="fp-preset-pill" data-val="denorm">非正規化數 (Denormalized)</button>
          </div>
        </div>

        <!-- 32 位元互動磁磚區 -->
        <div class="fp-bitboard-wrapper">
          <div class="bitboard-header">
            <span>32 位元即時開關面板（點擊任意按鈕直接切換 0 與 1）：</span>
            <span id="fpSpecialTag" class="tag-badge badge-success">一般正規化數 (Normalized)</span>
          </div>
          <div id="fpBitTilesContainer" class="fp-tiles-flex"></div>
        </div>

        <!-- 拆解診斷與公式即時展開區 -->
        <div class="fp-analysis-grid">
          <div class="fp-diag-card">
            <div class="diag-title">符號位元 Sign (S, Bit 31)</div>
            <div id="fpSignExplain" class="diag-body"></div>
          </div>
          <div class="fp-diag-card">
            <div class="diag-title">偏差指數 Exponent (E, Bits 30-23)</div>
            <div id="fpExpExplain" class="diag-body"></div>
          </div>
          <div class="fp-diag-card">
            <div class="diag-title">有效位數尾數 Fraction (F, Bits 22-0)</div>
            <div id="fpFracExplain" class="diag-body"></div>
          </div>
        </div>

        <div class="fp-formula-result-card">
          <div class="formula-result-header">
            <span>IEEE 754 標準數值展開方程式：</span>
            <div class="dual-val-badge">
              <span>十進位：<strong id="fpDecDisplay" style="color: #38bdf8;">-13.625</strong></span>
              <span style="margin-left: 1rem;">十六進位：<strong id="fpHexDisplay" style="color: var(--success); font-family: var(--font-mono);">0xC15A0000</strong></span>
            </div>
          </div>
          <div id="fpFormulaExplain" class="formula-math-box"></div>
        </div>
      </section>

      <!-- 站點 3：1 位元 ALU 訊號通路互動模擬器 -->
      <section class="lab-station-section card" id="stationAlu" style="margin-bottom: 2rem;">
        <div class="card-header">
          <div>
            <h2 class="card-title">站點 3：1 位元 ALU 電路訊號通路互動模擬器 (1-bit ALU Simulator)</h2>
            <div class="card-subtitle">即時切換 6 大運算控制信號、高亮內部資料通路與 DeMorgan 邏輯閘轉換</div>
          </div>
          <span class="badge badge-primary">Chapter 3 硬體電路</span>
        </div>

        <div class="alu-sim-container">
          <div class="alu-sim-desc">
            點擊下方運算控制按鈕，即時觀察 <strong>Ainvert</strong>、<strong>Binvert</strong>、<strong>CarryIn</strong> 與 <strong>Operation</strong> 多工器選擇線如何切換內部數據通路（Data Path）與硬體運算單元：
          </div>

          <div class="alu-btn-group">
            <button class="lab-alu-btn active" data-op="AND">AND (0 0 00)</button>
            <button class="lab-alu-btn" data-op="OR">OR (0 0 01)</button>
            <button class="lab-alu-btn" data-op="ADD">ADD (0 0 10)</button>
            <button class="lab-alu-btn" data-op="SUB">SUB (0 1 10, Cin=1)</button>
            <button class="lab-alu-btn" data-op="NOR">NOR (1 1 00)</button>
            <button class="lab-alu-btn" data-op="SLT">SLT (0 1 11, Cin=1)</button>
          </div>

          <div class="alu-status-panel">
            <div class="alu-status-chip">
              <div class="alu-status-chip-label">Ainvert (反相 A)</div>
              <div class="alu-status-chip-val" id="lab_aluStatAinv">0</div>
            </div>
            <div class="alu-status-chip">
              <div class="alu-status-chip-label">Binvert (反相 B)</div>
              <div class="alu-status-chip-val" id="lab_aluStatBinv">0</div>
            </div>
            <div class="alu-status-chip">
              <div class="alu-status-chip-label">CarryIn (進位初值)</div>
              <div class="alu-status-chip-val" id="lab_aluStatCin">0</div>
            </div>
            <div class="alu-status-chip">
              <div class="alu-status-chip-label">Operation (多工通道)</div>
              <div class="alu-status-chip-val" id="lab_aluStatOp">00 (Port 0)</div>
            </div>
            <div class="alu-status-chip">
              <div class="alu-status-chip-label">作用功能單元</div>
              <div class="alu-status-chip-val" id="lab_aluStatUnit">AND 邏輯閘</div>
            </div>
          </div>

          <div class="alu-sim-svg-wrapper">
            <svg id="labAluSvgDiagram" viewBox="0 0 760 380" width="100%" height="auto" style="max-height: 420px; font-family: var(--font-mono); font-size: 12px;">
              <defs>
                <marker id="lab_arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 1 L 10 5 L 0 9 z" fill="#64748b" />
                </marker>
                <marker id="lab_arrowActive" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 1 L 10 5 L 0 9 z" fill="#38bdf8" />
                </marker>
              </defs>

              <!-- 1. Input A & MUX_A -->
              <text x="25" y="80" fill="#94a3b8" font-weight="bold">輸入 a</text>
              <line id="lab_wire_a_direct" x1="75" y1="75" x2="135" y2="75" stroke="#38bdf8" stroke-width="2.5" />
              <line id="lab_wire_a_branch" x1="90" y1="75" x2="90" y2="105" stroke="#475569" stroke-width="1.5" />
              <line id="lab_wire_a_inv_in" x1="90" y1="105" x2="105" y2="105" stroke="#475569" stroke-width="1.5" />
              <polygon id="lab_gate_inv_a" points="105,97 120,105 105,113" fill="#1e293b" stroke="#475569" stroke-width="1.5" />
              <circle id="lab_circ_inv_a" cx="123" cy="105" r="3" fill="#1e293b" stroke="#475569" stroke-width="1.5" />
              <line id="lab_wire_a_inv_out" x1="126" y1="105" x2="135" y2="105" stroke="#475569" stroke-width="1.5" />
              <rect id="lab_mux_a" x="135" y="60" width="30" height="55" rx="4" fill="#1e293b" stroke="#38bdf8" stroke-width="1.5" />
              <text x="142" y="77" fill="#94a3b8" font-size="10">0</text>
              <text x="142" y="107" fill="#94a3b8" font-size="10">1</text>
              <line id="lab_wire_ainvert" x1="150" y1="25" x2="150" y2="60" stroke="#64748b" stroke-width="2" stroke-dasharray="3,3" />
              <text x="125" y="20" fill="#f59e0b" font-weight="bold">Ainvert</text>

              <!-- 2. Input B & MUX_B -->
              <text x="25" y="225" fill="#94a3b8" font-weight="bold">輸入 b</text>
              <line id="lab_wire_b_direct" x1="75" y1="220" x2="135" y2="220" stroke="#38bdf8" stroke-width="2.5" />
              <line id="lab_wire_b_branch" x1="90" y1="220" x2="90" y2="250" stroke="#475569" stroke-width="1.5" />
              <line id="lab_wire_b_inv_in" x1="90" y1="250" x2="105" y2="250" stroke="#475569" stroke-width="1.5" />
              <polygon id="lab_gate_inv_b" points="105,242 120,250 105,258" fill="#1e293b" stroke="#475569" stroke-width="1.5" />
              <circle id="lab_circ_inv_b" cx="123" cy="250" r="3" fill="#1e293b" stroke="#475569" stroke-width="1.5" />
              <line id="lab_wire_b_inv_out" x1="126" y1="250" x2="135" y2="250" stroke="#475569" stroke-width="1.5" />
              <rect id="lab_mux_b" x="135" y="205" width="30" height="55" rx="4" fill="#1e293b" stroke="#38bdf8" stroke-width="1.5" />
              <text x="142" y="222" fill="#94a3b8" font-size="10">0</text>
              <text x="142" y="252" fill="#94a3b8" font-size="10">1</text>
              <line id="lab_wire_binvert" x1="150" y1="170" x2="150" y2="205" stroke="#64748b" stroke-width="2" stroke-dasharray="3,3" />
              <text x="125" y="165" fill="#f59e0b" font-weight="bold">Binvert</text>

              <!-- 3. Interconnection Wires -->
              <line id="lab_wire_amux" x1="165" y1="87" x2="200" y2="87" stroke="#38bdf8" stroke-width="2" />
              <path id="lab_wire_amux_distrib" d="M 200 87 L 245 87 M 200 87 L 200 145 L 245 145 M 200 145 L 200 215 L 245 215" stroke="#38bdf8" stroke-width="1.5" fill="none" />

              <line id="lab_wire_bmux" x1="165" y1="232" x2="215" y2="232" stroke="#38bdf8" stroke-width="2" />
              <path id="lab_wire_bmux_distrib" d="M 215 232 L 245 232 M 215 232 L 215 165 L 245 165 M 215 165 L 215 105 L 245 105" stroke="#38bdf8" stroke-width="1.5" fill="none" />

              <!-- CarryIn -->
              <line id="lab_wire_cin" x1="300" y1="175" x2="300" y2="200" stroke="#64748b" stroke-width="1.5" stroke-dasharray="3,3" />
              <text x="280" y="170" fill="#f59e0b" font-weight="bold">CarryIn</text>

              <!-- Less input -->
              <text x="200" y="295" fill="#94a3b8">Less (來自 Set)</text>
              <line id="lab_wire_less" x1="290" y1="290" x2="470" y2="290" stroke="#475569" stroke-width="1.5" marker-end="url(#lab_arrow)" />

              <!-- 4. Logic Units -->
              <!-- Unit 0: AND -->
              <g id="lab_unit_and">
                <path id="lab_gate_and" d="M 245 75 L 275 75 A 20 20 0 0 1 275 115 L 245 115 Z" fill="#1e293b" stroke="#38bdf8" stroke-width="1.5" />
                <text id="lab_text_and" x="255" y="99" fill="#38bdf8" font-weight="bold">AND</text>
                <line id="lab_wire_and_out" x1="295" y1="95" x2="470" y2="95" stroke="#38bdf8" stroke-width="2.5" marker-end="url(#lab_arrowActive)" />
              </g>

              <!-- Unit 1: OR -->
              <g id="lab_unit_or">
                <path id="lab_gate_or" d="M 245 135 Q 260 155 245 175 Q 285 175 298 155 Q 285 135 245 135 Z" fill="#1e293b" stroke="#475569" stroke-width="1.5" />
                <text id="lab_text_or" x="258" y="159" fill="#94a3b8" font-weight="bold">OR</text>
                <line id="lab_wire_or_out" x1="298" y1="155" x2="470" y2="155" stroke="#475569" stroke-width="1.5" marker-end="url(#lab_arrow)" />
              </g>

              <!-- Unit 2: Adder -->
              <g id="lab_unit_adder">
                <rect id="lab_gate_adder" x="245" y="200" width="105" height="55" rx="5" fill="#1e293b" stroke="#475569" stroke-width="1.5" />
                <text id="lab_text_adder" x="265" y="232" fill="#94a3b8" font-weight="bold">全加器 (FA)</text>
                <line id="lab_wire_adder_out" x1="350" y1="225" x2="470" y2="225" stroke="#475569" stroke-width="1.5" marker-end="url(#lab_arrow)" />
                <!-- CarryOut wire -->
                <line id="lab_wire_cout" x1="300" y1="255" x2="300" y2="340" stroke="#64748b" stroke-width="1.5" marker-end="url(#lab_arrow)" />
                <text x="270" y="355" fill="#94a3b8" font-weight="bold">CarryOut</text>
                <!-- Set wire for SLT -->
                <line id="lab_wire_set" x1="350" y1="240" x2="390" y2="240" stroke="#64748b" stroke-width="1.5" stroke-dasharray="2,2" />
                <text x="395" y="245" fill="#64748b" font-size="10">Set (符號位元)</text>
              </g>

              <!-- 5. 4-to-1 Multiplexer -->
              <polygon id="lab_mux_out" points="470,60 520,80 520,310 470,330" fill="#1e293b" stroke="#38bdf8" stroke-width="2" />
              <text x="480" y="195" fill="#38bdf8" font-weight="bold" font-size="14">MUX</text>

              <!-- Ports -->
              <circle id="lab_port_0" cx="475" cy="95" r="4" fill="#38bdf8" />
              <text id="lab_text_p0" x="483" y="99" fill="#38bdf8" font-size="11">0</text>

              <circle id="lab_port_1" cx="475" cy="155" r="4" fill="#475569" />
              <text id="lab_text_p1" x="483" y="159" fill="#64748b" font-size="11">1</text>

              <circle id="lab_port_2" cx="475" cy="225" r="4" fill="#475569" />
              <text id="lab_text_p2" x="483" y="229" fill="#64748b" font-size="11">2</text>

              <circle id="lab_port_3" cx="475" cy="290" r="4" fill="#475569" />
              <text id="lab_text_p3" x="483" y="294" fill="#64748b" font-size="11">3</text>

              <!-- Operation Control Lines -->
              <line id="lab_wire_op" x1="495" y1="20" x2="495" y2="70" stroke="#f59e0b" stroke-width="2" stroke-dasharray="3,3" />
              <text x="455" y="15" fill="#f59e0b" font-weight="bold">Operation (2 bits)</text>

              <!-- Output Result -->
              <line id="lab_wire_result" x1="520" y1="195" x2="650" y2="195" stroke="#38bdf8" stroke-width="3" marker-end="url(#lab_arrowActive)" />
              <text x="660" y="200" fill="#38bdf8" font-size="14" font-weight="bold">Result (運算結果)</text>
            </svg>
          </div>

          <div class="alu-sim-explain" id="lab_aluExplain">
            <strong>當前運算解析（AND）</strong>：Ainvert=0, Binvert=0，輸入 a 與 b 直通進入 AND 邏輯閘；Operation=00 選擇多工器第 0 號通道，Result 輸出逐位元 AND 運算結果。
          </div>
        </div>
      </section>

      <!-- 站點 4：費氏數列 F(3) 雙遞迴堆疊訊框動態追蹤器 -->
      <section class="lab-station-section card" id="stationStack" style="margin-bottom: 2rem;">
        <div class="card-header">
          <div>
            <h2 class="card-title">站點 4：費氏數列 F(3) 雙遞迴呼叫堆疊框架動態追蹤器 (HW2 Visualizer)</h2>
            <div class="card-subtitle">即時觀察 MIPS 記憶體配置、堆疊指標 $sp 生長收縮、Caller-Saved 與 Callee-Saved 暫存器保護機制</div>
          </div>
          <span class="badge badge-primary">Chapter 2 函式呼叫與作業二</span>
        </div>

        <div class="stack-step-controls">
          <button id="stackBtnPrev" class="action-btn btn-secondary">上一步</button>
          <button id="stackBtnNext" class="action-btn btn-primary">下一步 (步進執行)</button>
          <button id="stackBtnReset" class="action-btn btn-secondary">重設至起點 (步驟 0)</button>
          <span id="stackStepNum" class="step-badge-text">步驟 0 / 8</span>
          <span id="stackSpBadge" class="tag-badge badge-primary">$sp = 0x7FFFF000</span>
        </div>

        <div class="stack-detail-card">
          <h4 id="stackStepTitle" class="stack-title-heading">步驟 0：主程式呼叫 fib(3)</h4>
          <p id="stackStepDesc" class="stack-desc-body">main 函式準備計算 fib(3)，此時 $sp 指向呼叫端基底位址 0x7FFFF000。尚未推入任何遞迴訊框。</p>
        </div>

        <div class="stack-visual-wrapper">
          <div class="stack-column-header">
            <span>記憶體高位址 (0x7FFFF000, 呼叫端基底)</span>
            <span>$sp 向低位址生長方向 ↓</span>
          </div>
          <div id="stackFrameList" class="stack-slots-container"></div>
          <div class="stack-column-footer">
            <span>記憶體低位址 (堆疊頂端 Top of Stack)</span>
          </div>
        </div>

        <div class="stack-rule-callout">
          <h4>作業二（HW2）滿分關鍵：暫存器保存規範（Register Preservation）</h4>
          <p>
            MIPS 約定中，<strong>$ra</strong>（返回位址）與 <strong>$s0-$s7</strong>（Callee-Saved 暫存器）在函式呼叫跨越期間<strong>必須由被呼叫端保證其值不被破壞</strong>。因為費氏數列為雙遞迴：$F(n) = F(n-1) + F(n-2)$，第一次呼叫 <code>jal fib</code> 會覆寫 $ra 與 $a0，且第一次回傳值 $v0 必須先暫存於 $s0，才能繼續執行第二次 <code>jal fib</code>。因此每個堆疊訊框必須配置 12 位元組（<code>addi $sp, $sp, -12</code>）安全儲存 $ra、$s0 與引數 $a0！
          </p>
        </div>
      </section>
    `;
  },

  // ==========================================
  // 1. 布斯乘法演算法（Booth's Algorithm）逐步步進模擬器
  // ==========================================
  booth: {
    mVal: 7,
    qVal: -5,
    bitWidth: 8,
    steps: [],
    currentStepIdx: 0,
    timer: null,

    init: function() {
      this.bindEvents();
      this.recalculate();
    },

    bindEvents: function() {
      const btnCalc = document.getElementById("boothBtnCalc");
      const btnStep = document.getElementById("boothBtnStep");
      const btnPrev = document.getElementById("boothBtnPrev");
      const btnReset = document.getElementById("boothBtnReset");
      const btnAuto = document.getElementById("boothBtnAuto");
      const selPreset = document.getElementById("boothPresetSelect");
      const inputM = document.getElementById("boothInputM");
      const inputQ = document.getElementById("boothInputQ");
      const selBits = document.getElementById("boothBitsSelect");

      if (btnCalc) {
        btnCalc.addEventListener("click", () => {
          this.mVal = parseInt(inputM.value) || 0;
          this.qVal = parseInt(inputQ.value) || 0;
          this.bitWidth = parseInt(selBits.value) || 8;
          this.recalculate();
        });
      }

      if (selPreset) {
        selPreset.addEventListener("change", (e) => {
          const val = e.target.value;
          if (!val) return;
          const [m, q, b] = val.split(",").map(Number);
          if (inputM) inputM.value = m;
          if (inputQ) inputQ.value = q;
          if (selBits) selBits.value = b;
          this.mVal = m;
          this.qVal = q;
          this.bitWidth = b;
          this.recalculate();
        });
      }

      if (btnStep) {
        btnStep.addEventListener("click", () => this.stepForward());
      }
      if (btnPrev) {
        btnPrev.addEventListener("click", () => this.stepBackward());
      }
      if (btnReset) {
        btnReset.addEventListener("click", () => {
          this.stopAuto();
          this.currentStepIdx = 0;
          this.renderCurrentState();
        });
      }
      if (btnAuto) {
        btnAuto.addEventListener("click", () => this.toggleAuto());
      }
    },

    to2s: function(val, bits) {
      let mask = (1 << bits) - 1;
      let v = val & mask;
      return (v >>> 0).toString(2).padStart(bits, '0');
    },

    from2s: function(binStr) {
      const bits = binStr.length;
      let val = parseInt(binStr, 2);
      if (binStr[0] === '1') {
        val -= (1 << bits);
      }
      return val;
    },

    addBin: function(aStr, bStr) {
      const bits = aStr.length;
      let a = parseInt(aStr, 2);
      let b = parseInt(bStr, 2);
      let sum = (a + b) & ((1 << bits) - 1);
      return sum.toString(2).padStart(bits, '0');
    },

    subBin: function(aStr, bStr) {
      const bits = aStr.length;
      let a = parseInt(aStr, 2);
      let b = parseInt(bStr, 2);
      let diff = (a - b) & ((1 << bits) - 1);
      return diff.toString(2).padStart(bits, '0');
    },

    asr: function(aStr, qStr, qPrev) {
      // 算術右移：A 最高位複製符號位元
      const combined = aStr + qStr + qPrev;
      const signBit = combined[0];
      const shifted = signBit + combined.slice(0, -1);
      const bits = aStr.length;
      return {
        a: shifted.slice(0, bits),
        q: shifted.slice(bits, bits * 2),
        qPrev: shifted[bits * 2]
      };
    },

    recalculate: function() {
      this.stopAuto();
      const bits = this.bitWidth;
      const m = this.mVal;
      const q = this.qVal;

      const mBin = this.to2s(m, bits);
      let qBin = this.to2s(q, bits);
      let aBin = "0".repeat(bits);
      let qPrev = "0";

      this.steps = [];

      // Step 0: 初始狀態
      this.steps.push({
        cycle: 0,
        subCycle: "初始",
        a: aBin,
        q: qBin,
        qPrev: qPrev,
        q0: qBin[bits - 1],
        pair: qBin[bits - 1] + qPrev,
        op: "無運算",
        meaning: "初始暫存器配置 (A=0, Q=乘數, Q-1=0)",
        isShift: false,
        highlightA: false
      });

      // 逐週期推導
      for (let c = 1; c <= bits; c++) {
        const q0 = qBin[bits - 1];
        const pair = q0 + qPrev;
        let opDesc = "無加減運算";
        let meaningDesc = "Q0 Q-1 = " + pair + " (無連續 1 變化，僅位移)";
        let afterA = aBin;
        let didOp = false;

        // 1. 判定與運算階段
        if (pair === "10") {
          opDesc = "A = A - M";
          meaningDesc = "Q0 Q-1 = 10 (連續 1 開頭/低位端，執行減法 A - M)";
          afterA = this.subBin(aBin, mBin);
          didOp = true;
          this.steps.push({
            cycle: c,
            subCycle: `第 ${c} 週期：算術運算`,
            a: afterA,
            q: qBin,
            qPrev: qPrev,
            q0: q0,
            pair: pair,
            op: opDesc,
            meaning: meaningDesc,
            isShift: false,
            highlightA: true
          });
        } else if (pair === "01") {
          opDesc = "A = A + M";
          meaningDesc = "Q0 Q-1 = 01 (連續 1 結尾/高位端，執行加法 A + M)";
          afterA = this.addBin(aBin, mBin);
          didOp = true;
          this.steps.push({
            cycle: c,
            subCycle: `第 ${c} 週期：算術運算`,
            a: afterA,
            q: qBin,
            qPrev: qPrev,
            q0: q0,
            pair: pair,
            op: opDesc,
            meaning: meaningDesc,
            isShift: false,
            highlightA: true
          });
        }

        // 2. 算術右移 (ASR) 階段
        const shifted = this.asr(afterA, qBin, qPrev);
        aBin = shifted.a;
        qBin = shifted.q;
        qPrev = shifted.qPrev;

        this.steps.push({
          cycle: c,
          subCycle: `第 ${c} 週期：算術右移`,
          a: aBin,
          q: qBin,
          qPrev: qPrev,
          q0: qBin[bits - 1],
          pair: q0 + qPrev,
          op: "算術右移 (ASR)",
          meaning: "整個 [A, Q, Q-1] 向右位移 1 位元，A[MSB] 保留符號位元 " + aBin[0],
          isShift: true,
          highlightA: false
        });
      }

      this.currentStepIdx = 0;
      this.renderCurrentState();
      this.renderFullTable();
    },

    stepForward: function() {
      if (this.currentStepIdx < this.steps.length - 1) {
        this.currentStepIdx++;
        this.renderCurrentState();
      } else {
        this.stopAuto();
      }
    },

    stepBackward: function() {
      if (this.currentStepIdx > 0) {
        this.currentStepIdx--;
        this.renderCurrentState();
      }
    },

    toggleAuto: function() {
      const btn = document.getElementById("boothBtnAuto");
      if (this.timer) {
        this.stopAuto();
      } else {
        if (this.currentStepIdx >= this.steps.length - 1) {
          this.currentStepIdx = 0;
        }
        btn.textContent = "暫停播放";
        btn.classList.add("btn-warning");
        this.timer = setInterval(() => {
          if (this.currentStepIdx < this.steps.length - 1) {
            this.stepForward();
          } else {
            this.stopAuto();
          }
        }, 1200);
      }
    },

    stopAuto: function() {
      if (this.timer) {
        clearInterval(this.timer);
        this.timer = null;
      }
      const btn = document.getElementById("boothBtnAuto");
      if (btn) {
        btn.textContent = "自動播放";
        btn.classList.remove("btn-warning");
      }
    },

    renderCurrentState: function() {
      const st = this.steps[this.currentStepIdx];
      if (!st) return;

      const elStepTitle = document.getElementById("boothCurrentStepText");
      const elBoxA = document.getElementById("boothBoxA");
      const elBoxQ = document.getElementById("boothBoxQ");
      const elBoxQprev = document.getElementById("boothBoxQprev");
      const elPair = document.getElementById("boothPairBadge");
      const elOp = document.getElementById("boothOpBadge");
      const elMeaning = document.getElementById("boothMeaningText");
      const elProgress = document.getElementById("boothProgressText");

      if (elStepTitle) elStepTitle.textContent = `${st.subCycle} (步驟 ${this.currentStepIdx} / ${this.steps.length - 1})`;
      if (elProgress) elProgress.textContent = `週期：${st.cycle} / ${this.bitWidth}`;

      // 更新位元長度標記
      document.querySelectorAll('.reg-bits-lbl').forEach(el => {
        el.textContent = this.bitWidth;
      });

      // 渲染 A 暫存器
      if (elBoxA) {
        elBoxA.innerHTML = st.a.split("").map((b, idx) => 
          `<span class="bit-cell ${idx === 0 ? 'bit-sign' : ''} ${st.highlightA ? 'bit-highlight' : ''}">${b}</span>`
        ).join("");
      }

      // 渲染 Q 暫存器（標註 LSB Q0）
      if (elBoxQ) {
        elBoxQ.innerHTML = st.q.split("").map((b, idx) => 
          `<span class="bit-cell ${idx === st.q.length - 1 ? 'bit-q0' : ''}">${b}</span>`
        ).join("");
      }

      // 渲染 Q-1
      if (elBoxQprev) {
        elBoxQprev.innerHTML = `<span class="bit-cell bit-qprev">${st.qPrev}</span>`;
      }

      if (elPair) {
        elPair.textContent = `Q0 Q-1 = ${st.pair}`;
        elPair.className = `tag-badge ${st.pair === '10' ? 'tag-hw1' : st.pair === '01' ? 'badge-primary' : 'badge-secondary'}`;
      }

      if (elOp) {
        elOp.textContent = st.op;
      }

      if (elMeaning) {
        elMeaning.innerHTML = `<strong>動作說明：</strong>${st.meaning}`;
      }

      // 高亮即時追蹤表格中的行
      const rows = document.querySelectorAll(".booth-table-row");
      rows.forEach((r, idx) => {
        if (idx === this.currentStepIdx) {
          r.classList.add("row-active");
          if (typeof r.scrollIntoView === "function") {
            r.scrollIntoView({ behavior: "smooth", block: "nearest" });
          }
        } else {
          r.classList.remove("row-active");
        }
      });

      // 檢查是否達最終結果
      const elFinal = document.getElementById("boothFinalResultArea");
      if (elFinal) {
        if (this.currentStepIdx === this.steps.length - 1) {
          const combinedBin = st.a + st.q;
          const finalDecimal = this.from2s(combinedBin);
          elFinal.style.display = "block";
          elFinal.innerHTML = `
            <div style="background: var(--bg-card); border: 1px solid var(--primary); padding: 1.25rem; border-radius: var(--radius); margin-top: 1rem; text-align: center;">
              <span style="font-size: 0.95rem; color: var(--text-muted);">運算完成！最終 ${this.bitWidth * 2} 位元乘積為：</span>
              <div style="font-size: 1.4rem; font-family: var(--font-mono); color: #38bdf8; font-weight: 700; margin: 0.5rem 0;">
                ${st.a} ${st.q} (2 補數)
              </div>
              <div style="font-size: 1.15rem; color: var(--success); font-weight: 700;">
                十進位數值 = ${finalDecimal} (${this.mVal} × ${this.qVal} = ${this.mVal * this.qVal})
              </div>
            </div>
          `;
        } else {
          elFinal.style.display = "none";
        }
      }
    },

    renderFullTable: function() {
      const container = document.getElementById("boothFullTableBody");
      if (!container) return;

      let html = "";
      this.steps.forEach((st, idx) => {
        html += `
          <tr class="booth-table-row ${idx === this.currentStepIdx ? 'row-active' : ''}" data-idx="${idx}" style="cursor: pointer;">
            <td>${st.subCycle}</td>
            <td><code>${st.pair}</code></td>
            <td><strong>${st.op}</strong></td>
            <td><code style="color: #38bdf8;">${st.a}</code></td>
            <td><code style="color: #10b981;">${st.q}</code></td>
            <td><code style="color: #f59e0b;">${st.qPrev}</code></td>
            <td style="font-size: 0.85rem; color: var(--text-muted);">${st.meaning}</td>
          </tr>
        `;
      });
      container.innerHTML = html;

      // 點擊表格行直接跳轉到該步驟
      container.querySelectorAll(".booth-table-row").forEach(r => {
        r.addEventListener("click", () => {
          this.currentStepIdx = parseInt(r.getAttribute("data-idx")) || 0;
          this.renderCurrentState();
        });
      });
    }
  },

  // ==========================================
  // 2. IEEE 754 32 位元浮點數即時位元拆解器
  // ==========================================
  floatInspector: {
    bits: new Array(32).fill(0), // bits[31] = sign, bits[30..23] = exp, bits[22..0] = frac

    init: function() {
      this.bindEvents();
      this.setFromDecimal(-13.625);
    },

    bindEvents: function() {
      const inputDec = document.getElementById("fpInputDec");
      const btnDec = document.getElementById("fpBtnDec");
      const inputHex = document.getElementById("fpInputHex");
      const btnHex = document.getElementById("fpBtnHex");
      const presets = document.querySelectorAll(".fp-preset-pill");

      if (btnDec && inputDec) {
        btnDec.addEventListener("click", () => {
          const val = parseFloat(inputDec.value);
          if (!isNaN(val)) this.setFromDecimal(val);
        });
        inputDec.addEventListener("keydown", (e) => {
          if (e.key === "Enter") btnDec.click();
        });
      }

      if (btnHex && inputHex) {
        btnHex.addEventListener("click", () => {
          this.setFromHex(inputHex.value);
        });
        inputHex.addEventListener("keydown", (e) => {
          if (e.key === "Enter") btnHex.click();
        });
      }

      presets.forEach(p => {
        p.addEventListener("click", () => {
          const v = p.getAttribute("data-val");
          if (v === "+inf") this.setRawBits(0, 255, 0);
          else if (v === "-inf") this.setRawBits(1, 255, 0);
          else if (v === "nan") this.setRawBits(0, 255, 1);
          else if (v === "+0") this.setRawBits(0, 0, 0);
          else if (v === "-0") this.setRawBits(1, 0, 0);
          else if (v === "denorm") this.setRawBits(0, 0, 5);
          else {
            const num = parseFloat(v);
            if (!isNaN(num)) this.setFromDecimal(num);
          }
        });
      });
    },

    setFromDecimal: function(decVal) {
      const buf = new ArrayBuffer(4);
      const f32 = new Float32Array(buf);
      const u32 = new Uint32Array(buf);

      f32[0] = decVal;
      const intVal = u32[0];

      for (let i = 0; i < 32; i++) {
        this.bits[31 - i] = (intVal >>> (31 - i)) & 1;
      }
      this.render();
    },

    setFromHex: function(hexStr) {
      let clean = hexStr.trim().replace(/^0x/i, "");
      if (clean.length > 8) clean = clean.slice(0, 8);
      clean = clean.padStart(8, '0');
      const intVal = parseInt(clean, 16);
      if (isNaN(intVal)) return;

      for (let i = 0; i < 32; i++) {
        this.bits[31 - i] = (intVal >>> (31 - i)) & 1;
      }
      this.render();
    },

    setRawBits: function(sign, exp, fracVal) {
      this.bits[31] = sign ? 1 : 0;
      const expBin = exp.toString(2).padStart(8, '0');
      for (let i = 0; i < 8; i++) {
        this.bits[30 - i] = parseInt(expBin[i]);
      }
      const fracBin = fracVal.toString(2).padStart(23, '0');
      for (let i = 0; i < 23; i++) {
        this.bits[22 - i] = parseInt(fracBin[i]);
      }
      this.render();
    },

    toggleBit: function(idx) {
      this.bits[idx] = this.bits[idx] === 1 ? 0 : 1;
      this.render();
    },

    render: function() {
      const containerBits = document.getElementById("fpBitTilesContainer");
      const elDecDisplay = document.getElementById("fpDecDisplay");
      const elHexDisplay = document.getElementById("fpHexDisplay");
      const elSignExplain = document.getElementById("fpSignExplain");
      const elExpExplain = document.getElementById("fpExpExplain");
      const elFracExplain = document.getElementById("fpFracExplain");
      const elFormulaExplain = document.getElementById("fpFormulaExplain");
      const elSpecialTag = document.getElementById("fpSpecialTag");

      // 1. 組裝各欄位數值
      const s = this.bits[31];
      let expBits = "";
      for (let i = 30; i >= 23; i--) expBits += this.bits[i];
      let fracBits = "";
      for (let i = 22; i >= 0; i--) fracBits += this.bits[i];

      const expVal = parseInt(expBits, 2);
      let u32Val = 0;
      for (let i = 0; i < 32; i++) {
        if (this.bits[i] === 1) u32Val |= (1 << i);
      }
      u32Val = u32Val >>> 0;
      const hexStr = "0x" + u32Val.toString(16).padStart(8, '0').toUpperCase();

      // 計算 Float32 值
      const buf = new ArrayBuffer(4);
      const u32 = new Uint32Array(buf);
      const f32 = new Float32Array(buf);
      u32[0] = u32Val;
      const floatVal = f32[0];

      // 2. 特殊值判定
      let specialType = "一般正規化數 (Normalized)";
      let badgeClass = "badge-success";

      if (expVal === 255) {
        if (fracBits === "0".repeat(23)) {
          specialType = s === 0 ? "+無窮大 (+Infinity)" : "-無窮大 (-Infinity)";
          badgeClass = "badge-error";
        } else {
          specialType = "非數值 (NaN, Not a Number)";
          badgeClass = "badge-error";
        }
      } else if (expVal === 0) {
        if (fracBits === "0".repeat(23)) {
          specialType = s === 0 ? "+0.0" : "-0.0";
          badgeClass = "badge-primary";
        } else {
          specialType = "非正規化數 (Denormalized, E=0, F≠0)";
          badgeClass = "tag-hw1";
        }
      }

      // 3. 渲染 32 個可點選位元磁磚
      if (containerBits) {
        let html = "";
        // Bit 31: Sign
        html += `
          <div class="fp-bit-col col-sign">
            <span class="fp-bit-label">S (31)</span>
            <button class="fp-bit-btn bit-sign" data-bit="31">${s}</button>
          </div>
        `;
        // Bits 30-23: Exp
        html += `<div class="fp-bit-group group-exp"><span class="fp-bit-label">偏差指數 Exponent [30:23] (十進位 = ${expVal})</span><div class="fp-bit-row">`;
        for (let i = 30; i >= 23; i--) {
          html += `<button class="fp-bit-btn bit-exp" data-bit="${i}">${this.bits[i]}</button>`;
        }
        html += `</div></div>`;
        // Bits 22-0: Fraction
        html += `<div class="fp-bit-group group-frac"><span class="fp-bit-label">有效數小數 Fraction [22:0]</span><div class="fp-bit-row">`;
        for (let i = 22; i >= 0; i--) {
          html += `<button class="fp-bit-btn bit-frac" data-bit="${i}">${this.bits[i]}</button>`;
        }
        html += `</div></div>`;

        containerBits.innerHTML = html;

        // 綁定磁磚點選翻轉
        containerBits.querySelectorAll(".fp-bit-btn").forEach(btn => {
          btn.addEventListener("click", () => {
            const bIdx = parseInt(btn.getAttribute("data-bit"));
            this.toggleBit(bIdx);
          });
        });
      }

      // 4. 更新分析區塊
      if (elDecDisplay) elDecDisplay.textContent = floatVal;
      if (elHexDisplay) elHexDisplay.textContent = hexStr;
      if (elSpecialTag) {
        elSpecialTag.textContent = specialType;
        elSpecialTag.className = `tag-badge ${badgeClass}`;
      }

      if (elSignExplain) {
        elSignExplain.innerHTML = `符號位元 <code>S = ${s}</code> $\\implies (-1)^{${s}} = $ <strong>${s === 0 ? '+ (正數)' : '- (負數)'}</strong>`;
      }

      if (elExpExplain) {
        if (expVal === 0) {
          elExpExplain.innerHTML = `偏差指數 <code>E = 0</code> $\\implies$ 非正規化模式，真實指數固定為 $1 - 127 = $ <strong>-126</strong>`;
        } else if (expVal === 255) {
          elExpExplain.innerHTML = `偏差指數 <code>E = 255</code> (全 1) $\\implies$ 特殊旗標（無窮大或 NaN）`;
        } else {
          elExpExplain.innerHTML = `偏差指數 <code>E = ${expVal}</code> $\\implies$ 真實指數 $\\text{Real Exp} = E - 127 = ${expVal} - 127 = $ <strong>${expVal - 127}</strong>`;
        }
      }

      if (elFracExplain) {
        if (expVal === 0) {
          elFracExplain.innerHTML = `非正規化前導 <code>0.F</code>：二進位小數為 <code>0.${fracBits.slice(0, 10)}...</code>`;
        } else {
          elFracExplain.innerHTML = `隱含前導 <code>1.F</code>：尾數實質數值為 <code>1.${fracBits.slice(0, 10)}...</code>`;
        }
      }

      if (elFormulaExplain) {
        if (expVal > 0 && expVal < 255) {
          elFormulaExplain.innerHTML = `$$V = (-1)^{${s}} \\times (1 + 0.${fracBits.slice(0, 8)}\\dots_2) \\times 2^{${expVal - 127}} = ${floatVal}$$`;
        } else if (expVal === 0) {
          elFormulaExplain.innerHTML = `$$V = (-1)^{${s}} \\times (0 + 0.${fracBits.slice(0, 8)}\\dots_2) \\times 2^{-126} = ${floatVal}$$`;
        } else {
          elFormulaExplain.innerHTML = `$$V = \\text{${specialType}}$$`;
        }
        if (window.CO_SOLVER && typeof window.CO_SOLVER.renderMath === "function") {
          window.CO_SOLVER.renderMath(elFormulaExplain);
        }
      }
    }
  },

  // ==========================================
  // 3. 1 位元 ALU 訊號通路模擬器
  // ==========================================
  alu: {
    ops: {
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
        unit: "全加器（2 補數減法）",
        explain: "<strong>當前運算解析（SUB 減法）</strong>：Binvert=1 將 b 反相（$\\overline{b}$），CarryIn=1 加入最低位進位；利用 2 補數性質 $a - b = a + \\overline{b} + 1$；Operation=10 選擇多工器第 2 號通道輸出差值。"
      },
      NOR: {
        ainv: 1, binv: 1, cin: 0, op: "00", opPort: 0,
        unit: "AND 閘 + DeMorgan 轉換",
        explain: "<strong>當前運算解析（NOR 邏輯）</strong>：Ainvert=1, Binvert=1，反相輸入進入 AND 邏輯閘；依據笛摩根定律（DeMorgan's Laws）：$\\overline{a} \\cdot \\overline{b} = \\overline{a + b}$，等效完成 NOR 運算；Operation=00 選擇第 0 號通道。"
      },
      SLT: {
        ainv: 0, binv: 1, cin: 1, op: "11", opPort: 3,
        unit: "加法器減法 + Less 連線",
        explain: "<strong>當前運算解析（SLT 小於則設定）</strong>：Binvert=1 與 CarryIn=1 執行 $a - b$；若 $a < b$，則差值最高符號位元為 1（Set 訊號）；全加器將此 Set 信號拉至 bit 0 的 Less 輸入端；Operation=11 選擇第 3 號通道輸出 Less。"
      }
    },

    init: function() {
      const btns = document.querySelectorAll(".lab-alu-btn");
      btns.forEach(btn => {
        btn.addEventListener("click", () => {
          btns.forEach(b => b.classList.remove("active"));
          btn.classList.add("active");
          const op = btn.getAttribute("data-op");
          this.update(op);
        });
      });
      this.update("AND");
    },

    update: function(opKey) {
      const cfg = this.ops[opKey];
      if (!cfg) return;

      const elAinv = document.getElementById("lab_aluStatAinv");
      const elBinv = document.getElementById("lab_aluStatBinv");
      const elCin = document.getElementById("lab_aluStatCin");
      const elOp = document.getElementById("lab_aluStatOp");
      const elUnit = document.getElementById("lab_aluStatUnit");
      const elExplain = document.getElementById("lab_aluExplain");

      if (elAinv) elAinv.textContent = cfg.ainv;
      if (elBinv) elBinv.textContent = cfg.binv;
      if (elCin) elCin.textContent = cfg.cin;
      if (elOp) elOp.textContent = `${cfg.op} (Port ${cfg.opPort})`;
      if (elUnit) elUnit.textContent = cfg.unit;
      if (elExplain) {
        elExplain.innerHTML = cfg.explain;
        if (window.CO_SOLVER && typeof window.CO_SOLVER.renderMath === "function") {
          window.CO_SOLVER.renderMath(elExplain);
        }
      }

      const activeColor = "#38bdf8";
      const inactiveColor = "#475569";
      const activeFill = "rgba(56, 189, 248, 0.2)";
      const inactiveFill = "#1e293b";

      // Ainvert Wire & Gate
      const wireAinv = document.getElementById("lab_wire_ainvert");
      const gateInvA = document.getElementById("lab_gate_inv_a");
      const muxA = document.getElementById("lab_mux_a");
      const wireADirect = document.getElementById("lab_wire_a_direct");
      const wireAInvOut = document.getElementById("lab_wire_a_inv_out");

      if (wireAinv) wireAinv.setAttribute("stroke", cfg.ainv === 1 ? "#f59e0b" : "#64748b");
      if (gateInvA) {
        gateInvA.setAttribute("fill", cfg.ainv === 1 ? activeFill : inactiveFill);
        gateInvA.setAttribute("stroke", cfg.ainv === 1 ? activeColor : inactiveColor);
      }
      if (wireADirect) wireADirect.setAttribute("stroke", cfg.ainv === 0 ? activeColor : inactiveColor);
      if (wireAInvOut) wireAInvOut.setAttribute("stroke", cfg.ainv === 1 ? activeColor : inactiveColor);
      if (muxA) muxA.setAttribute("stroke", activeColor);

      // Binvert Wire & Gate
      const wireBinv = document.getElementById("lab_wire_binvert");
      const gateInvB = document.getElementById("lab_gate_inv_b");
      const muxB = document.getElementById("lab_mux_b");
      const wireBDirect = document.getElementById("lab_wire_b_direct");
      const wireBInvOut = document.getElementById("lab_wire_b_inv_out");

      if (wireBinv) wireBinv.setAttribute("stroke", cfg.binv === 1 ? "#f59e0b" : "#64748b");
      if (gateInvB) {
        gateInvB.setAttribute("fill", cfg.binv === 1 ? activeFill : inactiveFill);
        gateInvB.setAttribute("stroke", cfg.binv === 1 ? activeColor : inactiveColor);
      }
      if (wireBDirect) wireBDirect.setAttribute("stroke", cfg.binv === 0 ? activeColor : inactiveColor);
      if (wireBInvOut) wireBInvOut.setAttribute("stroke", cfg.binv === 1 ? activeColor : inactiveColor);
      if (muxB) muxB.setAttribute("stroke", activeColor);

      // CarryIn Wire
      const wireCin = document.getElementById("lab_wire_cin");
      if (wireCin) {
        wireCin.setAttribute("stroke", cfg.cin === 1 ? "#f59e0b" : "#64748b");
        wireCin.setAttribute("stroke-width", cfg.cin === 1 ? "2.5" : "1.5");
      }

      // Logic Units
      const gateAnd = document.getElementById("lab_gate_and");
      const wireAndOut = document.getElementById("lab_wire_and_out");
      const textAnd = document.getElementById("lab_text_and");

      const gateOr = document.getElementById("lab_gate_or");
      const wireOrOut = document.getElementById("lab_wire_or_out");
      const textOr = document.getElementById("lab_text_or");

      const gateAdder = document.getElementById("lab_gate_adder");
      const wireAdderOut = document.getElementById("lab_wire_adder_out");
      const textAdder = document.getElementById("lab_text_adder");

      const wireLess = document.getElementById("lab_wire_less");

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
        const portCirc = document.getElementById(`lab_port_${i}`);
        const portText = document.getElementById(`lab_text_p${i}`);
        if (portCirc) portCirc.setAttribute("fill", i === cfg.opPort ? activeColor : inactiveColor);
        if (portText) portText.setAttribute("fill", i === cfg.opPort ? activeColor : "#64748b");
      }
    }
  },

  // ==========================================
  // 4. 費氏數列 F(3) 雙遞迴堆疊訊框動態追蹤器
  // ==========================================
  stackAnim: {
    currentStep: 0,
    frames: [],

    steps: [
      {
        title: "步驟 0：主程式呼叫 fib(3)",
        desc: "main 函式準備計算 fib(3)，此時 $sp 指向呼叫端基底位址 0x7FFFF000。尚未推入任何遞迴訊框。",
        activeLine: 1,
        spAddr: "0x7FFFF000",
        stack: []
      },
      {
        title: "步驟 1：fib(3) 進入並配置 12 位元組堆疊框架",
        desc: "執行 addi $sp, $sp, -12。隨後依序儲存返回 main 之位址 $ra、舊 $s0 保存值與傳入引數 $a0=3 到堆疊。",
        activeLine: 2,
        spAddr: "0x7FFFEFF4",
        stack: [
          { addr: "0x7FFFF000", label: "返回 main 之位址 ($ra)", reg: "$ra" },
          { addr: "0x7FFFEFFC", label: "舊 $s0 保存值", reg: "$s0" },
          { addr: "0x7FFFEFF8", label: "引數 n = 3", reg: "$a0=3" }
        ]
      },
      {
        title: "步驟 2：fib(3) 遞迴呼叫第一次子問題 fib(2)",
        desc: "設定 $a0 = 3 - 1 = 2，執行 jal fib。進入第 2 層遞迴。",
        activeLine: 4,
        spAddr: "0x7FFFEFF4",
        stack: [
          { addr: "0x7FFFF000", label: "返回 main 之位址 ($ra)", reg: "$ra" },
          { addr: "0x7FFFEFFC", label: "舊 $s0 保存值", reg: "$s0" },
          { addr: "0x7FFFEFF8", label: "引數 n = 3", reg: "$a0=3" }
        ]
      },
      {
        title: "步驟 3：fib(2) 配置堆疊框架並推入暫存器",
        desc: "第 2 層 fib(2) 執行 addi $sp, $sp, -12，堆疊向低位址生長至 0x7FFFEFE8。儲存 $ra、$s0 與引數 $a0=2。",
        activeLine: 2,
        spAddr: "0x7FFFEFE8",
        stack: [
          { addr: "0x7FFFF000", label: "返回 main 之位址 ($ra)", reg: "$ra" },
          { addr: "0x7FFFEFFC", label: "舊 $s0 保存值", reg: "$s0" },
          { addr: "0x7FFFEFF8", label: "引數 n = 3 (fib(3))", reg: "$a0=3" },
          { addr: "0x7FFFEFF4", label: "返回 fib(3) 之位址 ($ra)", reg: "$ra" },
          { addr: "0x7FFFEFF0", label: "fib(3) 的 $s0", reg: "$s0" },
          { addr: "0x7FFFEFEC", label: "引數 n = 2 (fib(2))", reg: "$a0=2" }
        ]
      },
      {
        title: "步驟 4：fib(2) 呼叫 fib(1) -> 命中 Base Case 回傳 1",
        desc: "計算 $a0 = 1，命中 beq $a0, 1, fib_base1，直接回傳 $v0 = 1。不需再向下遞迴。",
        activeLine: 3,
        spAddr: "0x7FFFEFE8",
        stack: [
          { addr: "0x7FFFF000", label: "返回 main 之位址 ($ra)", reg: "$ra" },
          { addr: "0x7FFFEFFC", label: "舊 $s0 保存值", reg: "$s0" },
          { addr: "0x7FFFEFF8", label: "引數 n = 3 (fib(3))", reg: "$a0=3" },
          { addr: "0x7FFFEFF4", label: "返回 fib(3) 之位址 ($ra)", reg: "$ra" },
          { addr: "0x7FFFEFF0", label: "fib(3) 的 $s0", reg: "$s0" },
          { addr: "0x7FFFEFEC", label: "引數 n = 2 (fib(2))", reg: "$a0=2" }
        ]
      },
      {
        title: "步驟 5：fib(2) 將第一次結果 1 安全存入 $s0，呼叫 fib(0)",
        desc: "執行 move $s0, $v0 ($s0 = 1)。自堆疊載回 $a0=2，計算 $a0 - 2 = 0，呼叫 fib(0)。fib(0) 命中 Base Case 回傳 0。",
        activeLine: 5,
        spAddr: "0x7FFFEFE8",
        stack: [
          { addr: "0x7FFFF000", label: "返回 main 之位址 ($ra)", reg: "$ra" },
          { addr: "0x7FFFEFFC", label: "舊 $s0 保存值", reg: "$s0" },
          { addr: "0x7FFFEFF8", label: "引數 n = 3 (fib(3))", reg: "$a0=3" },
          { addr: "0x7FFFEFF4", label: "返回 fib(3) 之位址 ($ra)", reg: "$ra" },
          { addr: "0x7FFFEFF0", label: "fib(3) 的 $s0", reg: "$s0" },
          { addr: "0x7FFFEFEC", label: "引數 n = 2 (fib(2))", reg: "$a0=2" }
        ]
      },
      {
        title: "步驟 6：fib(2) 合併結果並釋放堆疊 (Pop Frame 2)",
        desc: "加總 $s0 (1) + $v0 (0) = 1。還原暫存器並執行 addi $sp, $sp, 12。返回 fib(3)，$v0 = 1！",
        activeLine: 6,
        spAddr: "0x7FFFEFF4",
        stack: [
          { addr: "0x7FFFF000", label: "返回 main 之位址 ($ra)", reg: "$ra" },
          { addr: "0x7FFFEFFC", label: "舊 $s0 保存值", reg: "$s0" },
          { addr: "0x7FFFEFF8", label: "引數 n = 3 (fib(3))", reg: "$a0=3" }
        ]
      },
      {
        title: "步驟 7：fib(3) 儲存 fib(2) 結果至 $s0，呼叫 fib(1)",
        desc: "執行 move $s0, $v0 ($s0 = 1)。隨後載回原始 $a0=3，計算 $a0 - 2 = 1，呼叫 fib(1)。fib(1) 直接回傳 $v0 = 1。",
        activeLine: 5,
        spAddr: "0x7FFFEFF4",
        stack: [
          { addr: "0x7FFFF000", label: "返回 main 之位址 ($ra)", reg: "$ra" },
          { addr: "0x7FFFEFFC", label: "舊 $s0 保存值", reg: "$s0" },
          { addr: "0x7FFFEFF8", label: "引數 n = 3 (fib(3))", reg: "$a0=3" }
        ]
      },
      {
        title: "步驟 8：fib(3) 加總兩者結果並釋放堆疊 (Pop Frame 1)",
        desc: "計算 $s0 (1) + $v0 (1) = 2。還原 $s0 與返回位址 $ra，執行 addi $sp, $sp, 12。返回 main，最終 fib(3) = 2！",
        activeLine: 6,
        spAddr: "0x7FFFF000",
        stack: []
      }
    ],

    init: function() {
      this.bindEvents();
      this.currentStep = 0;
      this.render();
    },

    bindEvents: function() {
      const btnNext = document.getElementById("stackBtnNext");
      const btnPrev = document.getElementById("stackBtnPrev");
      const btnReset = document.getElementById("stackBtnReset");

      if (btnNext) {
        btnNext.addEventListener("click", () => {
          if (this.currentStep < this.steps.length - 1) {
            this.currentStep++;
            this.render();
          }
        });
      }

      if (btnPrev) {
        btnPrev.addEventListener("click", () => {
          if (this.currentStep > 0) {
            this.currentStep--;
            this.render();
          }
        });
      }

      if (btnReset) {
        btnReset.addEventListener("click", () => {
          this.currentStep = 0;
          this.render();
        });
      }
    },

    render: function() {
      const st = this.steps[this.currentStep];
      if (!st) return;

      const elTitle = document.getElementById("stackStepTitle");
      const elDesc = document.getElementById("stackStepDesc");
      const elSp = document.getElementById("stackSpBadge");
      const elStackList = document.getElementById("stackFrameList");
      const elStepNum = document.getElementById("stackStepNum");

      if (elTitle) elTitle.textContent = st.title;
      if (elDesc) elDesc.textContent = st.desc;
      if (elSp) elSp.textContent = `$sp = ${st.spAddr}`;
      if (elStepNum) elStepNum.textContent = `步驟 ${this.currentStep} / ${this.steps.length - 1}`;

      // 渲染堆疊直筒
      if (elStackList) {
        if (st.stack.length === 0) {
          elStackList.innerHTML = `<div style="padding: 2.5rem; color: var(--text-muted); text-align: center; border: 1px dashed var(--border-color); border-radius: var(--radius);">堆疊目前處於基底狀態 (無任何函式框架推入)</div>`;
        } else {
          let html = "";
          st.stack.forEach((item, idx) => {
            html += `
              <div class="stack-slot-item ${idx >= st.stack.length - 3 ? 'slot-current-frame' : 'slot-parent-frame'}">
                <span class="slot-addr">${item.addr}</span>
                <span class="slot-content"><strong>${item.reg}</strong> : ${item.label}</span>
              </div>
            `;
          });
          elStackList.innerHTML = html;
        }
      }
    }
  }
};
