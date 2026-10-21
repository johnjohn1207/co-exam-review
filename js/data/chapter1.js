// Chapter 1: Computer Abstractions and Technology
// 資料定義與計算題模組

window.CO_DATA = window.CO_DATA || { chapters: [], translations: [] };

window.CO_DATA.chapters.push({
  id: "ch1",
  title: "Chapter 1: 計算機抽象化與技術 (Computer Abstractions and Technology)",
  shortTitle: "Ch1 效能與技術",
  summary: [
    {
      heading: "1. 效能評估定義 (Defining Performance)",
      content: `
- **響應時間／執行時間 (Response Time / Execution Time)**：完成單一任務所需的總時間（包含 CPU 運算、I/O 等待、作業系統調度等）。個人電腦使用者最關注此指標。
- **吞吐量 (Throughput)**：單位時間內完成的任務總量（如伺服器每小時處理的請求數）。
- **相對效能 (Relative Performance)**：
  若「機器 X 比機器 Y 快 $n$ 倍」，定義為：
  $$n = \\frac{\\text{Performance}_X}{\\text{Performance}_Y} = \\frac{\\text{Execution Time}_Y}{\\text{Execution Time}_X}$$
- **時脈關係 (Clock Relationships)**：
  - $\\text{Clock Period (週期長度)} = \\frac{1}{\\text{Clock Rate (時脈頻率)}}$
  - 例：$2.5\\text{ GHz} = 2.5 \\times 10^9\\text{ cycles/s} \\implies \\text{Period} = \\frac{1}{2.5 \\times 10^9} = 0.4\\text{ ns} = 400\\text{ ps}$。
      `
    },
    {
      heading: "2. CPU 效能方程式 (CPU Performance Equation)",
      content: `
$$\\text{CPU Time} = \\text{Instruction Count (IC)} \\times \\text{CPI} \\times \\text{Clock Period} = \\frac{\\text{IC} \\times \\text{CPI}}{\\text{Clock Rate}}$$

- **IC (指令數)**：由程式演算法、編譯器與 ISA 決定。
- **CPI (Cycles Per Instruction，每指令週期數)**：由 CPU 微架構與指令組合決定。
- **多指令類別之加權全域 CPI (Global Weighted CPI)**：
  $$\\text{Total Clock Cycles} = \\sum_{i=1}^k (\\text{IC}_i \\times \\text{CPI}_i)$$
  $$\\text{Global CPI} = \\sum_{i=1}^k \\left( \\text{CPI}_i \\times \\frac{\\text{IC}_i}{\\text{IC}_{\\text{total}}} \\right) = \\frac{\\text{Total Cycles}}{\\text{IC}_{\\text{total}}}$$
      `
    },
    {
      heading: "3. 功耗趨勢與功耗牆 (Power Trends & Power Wall)",
      content: `
- **CMOS 動態切換功耗 (Dynamic Power)**：
  $$P_{\\text{dynamic}} = \\text{Capacitive Load} \\times \\text{Voltage}^2 \\times \\text{Frequency}$$
- **功耗牆成因**：電壓從 5V 降至約 1V 後無法再降低（受限於臨界電壓與靜態漏電流功耗）；散熱能力達物理上限，迫使產業由追求單核高頻率轉向多核心平行架構。
      `
    },
    {
      heading: "4. 阿姆達爾定律 (Amdahl's Law)",
      content: `
改善電腦的某一部分，其對整體系統效能的提升受限於該部分所佔的時間比例：
$$T_{\\text{new}} = \\frac{T_{\\text{affected}}}{\\text{Improvement Factor}} + T_{\\text{unaffected}}$$
$$\\text{Speedup} = \\frac{T_{\\text{old}}}{T_{\\text{new}}} = \\frac{1}{(1 - f) + \\frac{f}{s}}$$
其中 $f$ 為受改善部分的時間佔比，$s$ 為該部分的加速倍率。
**極限分析**：當 $s \\to \\infty$ 時，整體最大加速比上限為 $\\frac{1}{1 - f}$。若要求之加速比超過此上限，則在物理上無法達成 (Unattainable)。
      `
    },
    {
      heading: "5. 評估指標盲點與晶圓成本 (Fallacies & IC Cost)",
      content: `
- **MIPS 指標陷阱**：
  $$\\text{MIPS} = \\frac{\\text{IC}}{\\text{Execution Time} \\times 10^6} = \\frac{\\text{Clock Rate}}{\\text{CPI} \\times 10^6}$$
  盲點：不能跨不同 ISA 比較；同一機器上不同程式的 CPI 不同，MIPS 與實際執行時間經常不一致。
- **晶圓製造良率與晶粒成本 (Die Cost)**：
  $$\\text{Dies per Wafer} \\approx \\frac{\\pi \\times (\\text{Wafer Diameter} / 2)^2}{\\text{Die Area}}$$
  $$\\text{Yield} = \\frac{1}{\\left( 1 + \\frac{\\text{Defects per Area} \\times \\text{Die Area}}{2} \\right)^2}$$
  $$\\text{Cost per Die} = \\frac{\\text{Cost per Wafer}}{\\text{Dies per Wafer} \\times \\text{Yield}}$$
      `
    }
  ],
  formulas: [
    { name: "CPU 執行時間", formula: "\\text{CPU Time} = \\frac{\\text{IC} \\times \\text{CPI}}{\\text{Clock Rate}}" },
    { name: "加權平均 CPI", formula: "\\text{CPI} = \\sum_{i} (\\text{CPI}_i \\times \\text{Freq}_i)" },
    { name: "相對效能 (Speedup)", formula: "\\text{Speedup} = \\frac{\\text{Time}_{\\text{old}}}{\\text{Time}_{\\text{new}}} = \\frac{\\text{Performance}_{\\text{new}}}{\\text{Performance}_{\\text{old}}}" },
    { name: "阿姆達爾定律", formula: "T_{\\text{new}} = \\frac{T_{\\text{affected}}}{S} + T_{\\text{unaffected}}" },
    { name: "動態功耗", formula: "P = C \\times V^2 \\times f" },
    { name: "晶片良率", formula: "\\text{Yield} = (1 + (\\text{Defect Rate} \\times \\text{Area})/2)^{-2}" }
  ],
  dynamicProblems: [
    {
      id: "ch1_cpu_time",
      title: "題型 1-1：CPU 效能方程式與跨架構時脈比推算",
      category: "CPU 效能基礎",
      generator: function() {
        const timeA = Math.floor(Math.random() * 6) + 8; // 8 - 13 s
        const clockA = (Math.random() * 1.5 + 2.0).toFixed(1); // 2.0 - 3.5 GHz
        const cycleRatio = (Math.random() * 0.4 + 1.1).toFixed(2); // 1.10 - 1.50
        const timeB = Math.floor(Math.random() * 4) + 5; // 5 - 8 s

        return {
          timeA: timeA,
          clockA: parseFloat(clockA),
          cycleRatio: parseFloat(cycleRatio),
          timeB: timeB
        };
      },
      render: function(p) {
        return `考慮兩個電腦設計 Computer A 與 Computer B 執行同一個基準程式：
- **Computer A** 的時脈頻率為 **${p.clockA} GHz**，執行時間為 **${p.timeA} 秒**。
- 設計團隊正在開發 **Computer B**，因微架構變更，執行該程式所需的時脈週期數為 Computer A 的 **${p.cycleRatio} 倍**。
- 若設計目標要求 Computer B 的執行時間縮短至 **${p.timeB} 秒**。

**請計算：Computer B 所需的最低時脈頻率（Clock Rate）應為多少 GHz？**（四捨五入取至小數點後兩位）`;
      },
      solve: function(p) {
        // ClockCycles_A = Time_A * ClockRate_A = timeA * clockA * 10^9
        // ClockCycles_B = cycleRatio * ClockCycles_A
        // ClockRate_B = ClockCycles_B / Time_B
        const cyclesA = p.timeA * p.clockA; // in 10^9 cycles
        const cyclesB = cyclesA * p.cycleRatio;
        const clockB = cyclesB / p.timeB;
        const rounded = parseFloat(clockB.toFixed(2));

        return {
          correctValue: rounded,
          unit: "GHz",
          tolerance: 0.05,
          explanation: `
1. **計算 Computer A 總時脈週期數**：
   $$\\text{Clock Cycles}_A = \\text{CPU Time}_A \\times \\text{Clock Rate}_A = ${p.timeA}\\text{ s} \\times ${p.clockA}\\text{ GHz} = ${cyclesA.toFixed(2)} \\times 10^9\\text{ cycles}$$
2. **計算 Computer B 所需總時脈週期數**：
   $$\\text{Clock Cycles}_B = \\text{Clock Cycles}_A \\times ${p.cycleRatio} = ${cyclesA.toFixed(2)} \\times 10^9 \\times ${p.cycleRatio} = ${cyclesB.toFixed(2)} \\times 10^9\\text{ cycles}$$
3. **推導 Computer B 目標時脈頻率**：
   $$\\text{Clock Rate}_B = \\frac{\\text{Clock Cycles}_B}{\\text{Target CPU Time}_B} = \\frac{${cyclesB.toFixed(2)} \\times 10^9\\text{ cycles}}{${p.timeB}\\text{ s}} = ${rounded}\\text{ GHz}$$
          `
        };
      }
    },
    {
      id: "ch1_global_cpi",
      title: "題型 1-2：多指令類別之加權全域 CPI 與總執行時間",
      category: "CPI 加權運算",
      generator: function() {
        const icTotal = Math.floor(Math.random() * 5 + 5); // 5 to 9 (x 10^8)
        const pctA = 30;
        const pctB = 20;
        const pctC = 30;
        const pctD = 20;
        const cpiA = 1;
        const cpiB = 2;
        const cpiC = Math.floor(Math.random() * 2) + 3; // 3 or 4
        const cpiD = Math.floor(Math.random() * 2) + 2; // 2 or 3
        const clockRate = (Math.random() * 1.5 + 2.0).toFixed(1); // 2.0 - 3.5 GHz

        return {
          icTotal: icTotal,
          pctA, pctB, pctC, pctD,
          cpiA, cpiB, cpiC, cpiD,
          clockRate: parseFloat(clockRate)
        };
      },
      render: function(p) {
        return `某程式執行時之動態總指令數為 **${p.icTotal} $\\times 10^8$**，其指令分佈及各類指令之 CPI 如下表所示：
| 指令類別 | 佔比 (%) | CPI |
| :--- | :--- | :--- |
| 類別 A (ALU) | ${p.pctA}% | ${p.cpiA} |
| 類別 B (Branch) | ${p.pctB}% | ${p.cpiB} |
| 類別 C (Load) | ${p.pctC}% | ${p.cpiC} |
| 類別 D (Store) | ${p.pctD}% | ${p.cpiD} |

處理器時脈頻率為 **${p.clockRate} GHz**。
**請計算該程式在該處理器上的全域加權平均 CPI（Global CPI）為多少？**（四捨五入取至小數點後兩位）`;
      },
      solve: function(p) {
        const globalCPI = (p.pctA / 100 * p.cpiA) + (p.pctB / 100 * p.cpiB) + (p.pctC / 100 * p.cpiC) + (p.pctD / 100 * p.cpiD);
        const roundedCPI = parseFloat(globalCPI.toFixed(2));
        const totalCycles = (p.icTotal * 1e8) * globalCPI;
        const execTime = totalCycles / (p.clockRate * 1e9);

        return {
          correctValue: roundedCPI,
          unit: "",
          tolerance: 0.03,
          explanation: `
1. **加權平均 CPI 公式**：
   $$\\text{Global CPI} = \\sum (\\text{Freq}_i \\times \\text{CPI}_i)$$
   $$\\text{Global CPI} = (${p.pctA}\\% \\times ${p.cpiA}) + (${p.pctB}\\% \\times ${p.cpiB}) + (${p.pctC}\\% \\times ${p.cpiC}) + (${p.pctD}\\% \\times ${p.cpiD})$$
   $$\\text{Global CPI} = ${(p.pctA/100*p.cpiA).toFixed(2)} + ${(p.pctB/100*p.cpiB).toFixed(2)} + ${(p.pctC/100*p.cpiC).toFixed(2)} + ${(p.pctD/100*p.cpiD).toFixed(2)} = ${roundedCPI}$$
2. **延伸計算（總執行時間）**：
   $$\\text{CPU Time} = \\frac{\\text{IC} \\times \\text{CPI}}{\\text{Clock Rate}} = \\frac{${p.icTotal} \\times 10^8 \\times ${roundedCPI}}{${p.clockRate} \\times 10^9} = ${execTime.toFixed(3)}\\text{ 秒}$$
          `
        };
      }
    },
    {
      id: "ch1_amdahl_reduction",
      title: "題型 1-3：阿姆達爾定律之單一部件時間縮減計算",
      category: "Amdahl's Law",
      generator: function() {
        const totalTime = 200;
        const timeFP = 60;
        const timeLS = 70;
        const timeBranch = 30;
        const timeINT = totalTime - (timeFP + timeLS + timeBranch); // 40
        const fpImprovePct = Math.floor(Math.random() * 3 + 2) * 10; // 20%, 30%, 40%

        return {
          totalTime,
          timeFP,
          timeLS,
          timeBranch,
          timeINT,
          fpImprovePct
        };
      },
      render: function(p) {
        return `某電腦執行一基準程式耗時 **${p.totalTime} 秒**，時間在各類指令上的劃分如下：
- 浮點運算 (FP)：**${p.timeFP} 秒**
- 記憶體載入／儲存 (L/S)：**${p.timeLS} 秒**
- 分支指令 (Branch)：**${p.timeBranch} 秒**
- 整數指令 (INT)：**${p.timeINT} 秒**

若硬體架構師對浮點運算單元進行最佳化，使其執行時間縮減 **${p.fpImprovePct}%**（其餘部件耗時維持不變）。
**請計算：最佳化後的新總執行時間為多少秒？**`;
      },
      solve: function(p) {
        const fpReducedAmount = p.timeFP * (p.fpImprovePct / 100);
        const newTime = p.totalTime - fpReducedAmount;

        return {
          correctValue: parseFloat(newTime.toFixed(2)),
          unit: "秒",
          tolerance: 0.1,
          explanation: `
1. **計算浮點運算所縮減的具體時間**：
   $$\\Delta T_{\\text{FP}} = T_{\\text{FP}} \\times ${p.fpImprovePct}\\% = ${p.timeFP}\\text{ s} \\times ${(p.fpImprovePct/100)} = ${fpReducedAmount.toFixed(1)}\\text{ 秒}$$
2. **計算全新總執行時間**：
   $$T_{\\text{new}} = T_{\\text{total}} - \\Delta T_{\\text{FP}} = ${p.totalTime}\\text{ s} - ${fpReducedAmount.toFixed(1)}\\text{ s} = ${newTime.toFixed(1)}\\text{ 秒}$$
3. **整體加速比 (Speedup)**：
   $$\\text{Speedup} = \\frac{${p.totalTime}}{${newTime.toFixed(1)}} = ${(p.totalTime / newTime).toFixed(3)}$$
          `
        };
      }
    },
    {
      id: "ch1_amdahl_limit",
      title: "題型 1-4：阿姆達爾定律目標可行性與物理極限判定",
      category: "Amdahl's Law",
      generator: function() {
        const total = 250;
        const branchTime = 40;
        const targetPercent = Math.floor(Math.random() * 2) === 0 ? 20 : 25; // 20% or 25% target reduction
        return {
          total,
          branchTime,
          targetPercent
        };
      },
      render: function(p) {
        const targetReductionSec = p.total * (p.targetPercent / 100);
        return `一系統目前總執行時間為 **${p.total} 秒**，其中分支指令（Branch）耗時為 **${p.branchTime} 秒**。
管理階層提出目標：**「希望僅透過最佳化分支預測單元，讓整體程式的總執行時間縮減 ${p.targetPercent}%」**。

**請回答數值判定問題：**
若將分支執行時間縮減至極限（即分支時間降為 0 秒），最多能縮減總時間多少秒？（請直接填入分支最高可縮減的秒數數值，並於詳解中檢視可行性結論）`;
      },
      solve: function(p) {
        const targetSec = p.total * (p.targetPercent / 100);
        const isFeasible = p.branchTime >= targetSec;

        return {
          correctValue: p.branchTime,
          unit: "秒",
          tolerance: 0.01,
          explanation: `
1. **計算目標要求縮減的秒數**：
   $$\\Delta T_{\\text{target}} = T_{\\text{total}} \\times ${p.targetPercent}\\% = ${p.total}\\text{ s} \\times ${(p.targetPercent/100)} = ${targetSec.toFixed(1)}\\text{ 秒}$$
2. **分支部件的理論最高可縮減秒數**：
   即使將分支處理時間徹底降為 0 秒，最多也僅能減少 **${p.branchTime} 秒**。
3. **可行性嚴格判定**：
   因為最大可能縮減量 (${p.branchTime}\\text{ 秒}) < 目標要求縮減量 (${targetSec.toFixed(1)}\\text{ 秒})，
   因此**此目標在物理上完全無法達成（Unattainable）**。若硬要代入算式計算所需 CPI，將得出負數，屬於邏輯謬誤。
          `
        };
      }
    },
    {
      id: "ch1_power_scaling",
      title: "題型 1-5：CMOS 功耗牆與動態功耗縮減比例",
      category: "功耗與技術",
      generator: function() {
        const cReduction = Math.floor(Math.random() * 6) + 10; // 10% - 15% reduction -> C_new = 85% - 90%
        const vReduction = Math.floor(Math.random() * 6) + 10; // 10% - 15% reduction
        const fReduction = Math.floor(Math.random() * 6) + 10; // 10% - 15% reduction
        return { cReduction, vReduction, fReduction };
      },
      render: function(p) {
        return `在處理器設計革新中，工程團隊對 CMOS 晶片進行架構最佳化：
- 電容負載（Capacitive Load）降低了 **${p.cReduction}%**
- 工作電壓（Voltage）調降了 **${p.vReduction}%**
- 運作時脈（Frequency）降低了 **${p.fReduction}%**

已知動態功耗公式為 $P = C \\times V^2 \\times f$。
**請計算：新處理器的動態功耗約為舊處理器的多少百分比（%）？**（四捨五入取至小數點後兩位，例如 52.35% 請填寫 52.35）`;
      },
      solve: function(p) {
        const cFactor = (100 - p.cReduction) / 100;
        const vFactor = (100 - p.vReduction) / 100;
        const fFactor = (100 - p.fReduction) / 100;
        const pRatio = cFactor * Math.pow(vFactor, 2) * fFactor;
        const pct = parseFloat((pRatio * 100).toFixed(2));

        return {
          correctValue: pct,
          unit: "%",
          tolerance: 0.2,
          explanation: `
1. **各項變數倍率關係**：
   - $C_{\\text{new}} = (1 - ${p.cReduction}\\%) \\times C_{\\text{old}} = ${cFactor.toFixed(2)} \\times C_{\\text{old}}$
   - $V_{\\text{new}} = (1 - ${p.vReduction}\\%) \\times V_{\\text{old}} = ${vFactor.toFixed(2)} \\times V_{\\text{old}}$
   - $f_{\\text{new}} = (1 - ${p.fReduction}\\%) \\times f_{\\text{old}} = ${fFactor.toFixed(2)} \\times f_{\\text{old}}$
2. **代入功耗比例公式**：
   $$\\frac{P_{\\text{new}}}{P_{\\text{old}}} = \\frac{C_{\\text{new}} \\times V_{\\text{new}}^2 \\times f_{\\text{new}}}{C_{\\text{old}} \\times V_{\\text{old}}^2 \\times f_{\\text{old}}} = ${cFactor.toFixed(2)} \\times (${vFactor.toFixed(2)})^2 \\times ${fFactor.toFixed(2)}$$
   $$\\frac{P_{\\text{new}}}{P_{\\text{old}}} = ${cFactor.toFixed(2)} \\times ${(vFactor*vFactor).toFixed(4)} \\times ${fFactor.toFixed(2)} = ${(pRatio).toFixed(4)} = ${pct}\\%$$
          `
        };
      }
    },
    {
      id: "ch1_cagr_doubling",
      title: "題型 1-6：半導體製程微縮與電晶體倍增週期計算",
      category: "半導體指標分析",
      generator: function() {
        const t2010 = 32; // nm
        const t2019 = 14; // nm
        return { t2010, t2019 };
      },
      render: function(p) {
        return `對齊作業 Assignment 1 第 1 題：
在晶粒面積（Die Size）維持恆定假設下，電晶體數量與最小特徵尺寸 $t$ 的關係為 $\\text{Transistor Count} \\propto \\left(\\frac{1}{t}\\right)^2$。
已知 Intel 處理器於 2010 年之製程特徵尺寸為 **${p.t2010} nm**，於 2019 年微縮至 **${p.t2019} nm**。

**請計算：電晶體數量在 2010 至 2019 年（歷經 9 年）的年複合增長率（CAGR）為多少百分比（%）？**（四捨五入取至小數點後兩位，例如 20.15% 請填寫 20.15）`;
      },
      solve: function(p) {
        // Transistor ratio = (t2010 / t2019)^2 = (32 / 14)^2
        const ratio = Math.pow(p.t2010 / p.t2019, 2);
        const cagr = Math.pow(ratio, 1 / 9) - 1;
        const pct = parseFloat((cagr * 100).toFixed(2));
        const doublingTime = Math.log(2) / Math.log(1 + cagr);

        return {
          correctValue: pct,
          unit: "%",
          tolerance: 0.2,
          explanation: `
1. **電晶體增長倍率**：
   $$\\frac{\\text{Transistors}_{2019}}{\\text{Transistors}_{2010}} = \\left( \\frac{t_{2010}}{t_{2019}} \\right)^2 = \\left( \\frac{${p.t2010}}{${p.t2019}} \\right)^2 = (${(p.t2010/p.t2019).toFixed(3)})^2 = ${ratio.toFixed(3)}$$
2. **計算 9 年間年複合增長率 (CAGR)**：
   $$\\text{CAGR} = (${ratio.toFixed(3)})^{\\frac{1}{9}} - 1 = ${(1+cagr).toFixed(4)} - 1 = ${pct}\\%$$
3. **倍增時間 (Doubling Time)**：
   $$T_{\\text{double}} = \\frac{\\ln(2)}{\\ln(1 + \\text{CAGR})} = \\frac{0.6931}{${cagr.toFixed(4)}} \\approx ${doublingTime.toFixed(2)}\\text{ 年}$$
          `
        };
      }
    }
  ]
});
