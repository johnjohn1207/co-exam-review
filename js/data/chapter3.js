// Chapter 3: Arithmetic for Computers
// 講義核心重點整理、公式手冊與動態計算題庫模組

window.CO_DATA = window.CO_DATA || { chapters: [], translations: [] };

window.CO_DATA.chapters.push({
  id: "ch3",
  title: "Chapter 3: 計算機算術 (Arithmetic for Computers)",
  shortTitle: "Ch3 算術與浮點數",
  summary: [
    {
      heading: "1. 2 補數加減法與溢位判定機制 (Signed Overflow Detection)",
      content: `
- **2 補數範圍**：
  $n$ 位元 2 補數表示範圍為 $[-2^{n-1}, 2^{n-1} - 1]$。32 位元範圍為 $[-2,147,483,648, +2,147,483,647]$。
- **有號數溢位（Signed Overflow）發生時機**：
  同號相加卻產生異號結果，即代表運算結果超出表示範圍：
  - 正數 $+$ 正數 $=$ 負數 $\\implies$ 正溢位（Positive Overflow）
  - 負數 $+$ 負數 $=$ 正數 $\\implies$ 負溢位（Negative Overflow）
  - 正數 $+$ 負數 $\\implies$ **永遠不會溢位**
  - 減法 $A - B$ 等價於 $A + (-B)$：正數 $-$ 負數 $=$ 負數、或負數 $-$ 正數 $=$ 正數時溢位。
- **硬體邏輯判定**：
  溢位發生於**最高有效位元（MSB）之進位輸入（CarryIn）與進位輸出（CarryOut）不相等時**：
  $$\\text{Overflow} = \\text{CarryIn}[\\text{MSB}] \\oplus \\text{CarryOut}[\\text{MSB}]$$
- **MIPS 無號數加法溢位檢驗程式碼（投影片第 12 頁）**：
  \`\`\`mips
  addu $t0, $t1, $t2   # $t0 = $t1 + $t2
  nor  $t3, $t1, $zero # $t3 = ~$t1 = (2^32 - 1) - $t1 (計算剩餘空間)
  sltu $t3, $t3, $t2   # 若剩餘空間 < $t2，代表溢位！
  bne  $t3, $zero, Overflow
  \`\`\`
- **例外處理機制（Exception Handling）**：
  - \`add\`, \`addi\`, \`sub\` 在溢位時會觸發硬體例外（Trap/Exception）。
  - \`addu\`, \`addiu\`, \`subu\` 則忽略溢位，不觸發例外。
  - 當例外發生時，硬體自動將當前指令位址存入 **EPC (Exception Program Counter)** 暫存器，並跳轉至預設的例外處理程序常式。
      `
    },
    {
      heading: "2. 32 位元 ALU 硬體設計與控制訊號 (ALU Design & Control)",
      content: `
- **1 位元 ALU 基礎結構**：
  由 AND 閘、OR 閘、全加器（Full Adder）以及一個 4 對 1 多工器（Multiplexer）組成。
  ![投影片第 16 頁：1 位元邏輯運算單元 (1-bit Logical Unit for AND, OR)](images/alu_1bit_logic.png)
  ![投影片第 20 頁：1 位元全加器內部電路架構 (1-bit Full Adder)](images/alu_1bit_adder.png)
  ![投影片第 21 頁：1 位元基礎 ALU 電路 (包含 AND, OR, 全加器與 4 對 1 多工器)](images/alu_1bit_full.png)

- **32 位元連波進位 ALU (Ripple-Carry ALU)**：
  由 32 個 1 位元 ALU 串聯而成，每一級的 CarryOut 接到下一級的 CarryIn：
  ![投影片第 22 頁：32 位元連波進位 ALU 串接架構 (32-bit Ripple-Carry ALU)](images/alu_32bit_ripple.png)

- **控制訊號表與功能對照**：
  | 訊號組合 (Ainvert, Binvert, Operation) | 執行運算 | 說明 |
  | :--- | :--- | :--- |
  | 0 0 00 | AND | 邏輯 AND 運算 |
  | 0 0 01 | OR | 邏輯 OR 運算 |
  | 0 0 10 | ADD | 算術加法 ($A + B$) |
  | 0 1 10 | SUB | 算術減法 ($A + \\overline{B} + 1$，CarryIn 設為 1) |
  | 1 1 00 | NOR | 笛摩根定理：$\\overline{A} \\cdot \\overline{B} = \\overline{A + B}$ |
  | 0 1 11 | SLT | 小於則置 1 (Set on Less Than) |

- **減法運算硬體實現**：
  透過將 Binvert 設為 1，並將最末端第 0 位元的 CarryIn 設為 1，實現 $A + \\overline{B} + 1 = A - B$：
  ![投影片第 24 頁：減法運算硬體實現 (Binvert=1 且 CarryIn=1)](images/alu_subtract.png)

- **NOR 邏輯運算硬體實現**：
  利用笛摩根定理（DeMorgan's Laws）$\\overline{A + B} = \\overline{A} \\cdot \\overline{B}$，將 Ainvert 設為 1、Binvert 設為 1，並選擇 AND 閘（Operation = 00）：
  ![投影片第 25 頁：NOR 運算硬體實現 (笛摩根定理 Ainvert=1 且 Binvert=1)](images/alu_nor.png)

- **SLT (Set-on-less-than) 實作關鍵與跨位元迴路**：
  - 運算實質為執行減法 $A - B$。若 $A < B$，則 $A - B < 0$，其 MSB（符號位元）為 1。
  - **第 31 位元 ALU (MSB) 的 \`Set\` 輸出線直接連接回第 0 位元 ALU (LSB) 的 \`Less\` 輸入**；其餘第 1 至 31 位元 ALU 的 \`Less\` 皆接地（接 0）。
  - **符號溢位補償**：若發生溢位，減法結果的符號位元會顛倒，故真正正確的判斷邏輯為：
    $$\\text{Set} = \\text{Sign} \\oplus \\text{Overflow}$$
  ![投影片第 28 頁：Set-on-less-than (SLT) 跨位元迴路與第 31 位元溢位校正](images/alu_slt.png)

- **Zero 檢測邏輯（支援 beq / bne 分支指令）**：
  由一個將 32 個輸出位元全部輸入的**巨大 32 輸入 NOR 閘**構成。當所有 32 位元輸出全為 0 時，Zero 訊號輸出 1。
  ![投影片第 29 頁：Zero 零值檢測邏輯 (32 輸入大型 NOR 閘)](images/alu_zero_detect.png)

- **最終完整的 32 位元 MIPS ALU 總硬體架構圖**：
  結合 Ainvert、Binvert、CarryIn、Operation、Overflow 檢測與 Zero 旗標的完整微架構：
  ![投影片第 30 頁：最終完整的 32 位元 MIPS ALU 總硬體架構圖 (A Final 32-bit ALU)](images/alu_32bit_final.png)
      `
    },
    {
      heading: "3. 整數乘法器架構與布斯演算法 (Multiplication & Booth's Algorithm)",
      content: `
- **乘法硬體架構演進**：
  - **傳統乘法器**：被乘數（Multiplicand）使用 64 位元暫存器左移，乘數（Multiplier）使用 32 位元暫存器右移，需 64 位元加法器。
  - **最佳化乘法器（Optimized Multiplier）**：
    - 被乘數固定於 32 位元暫存器中不位移。
    - 乘積暫存器（Product Register）為 64 位元，初始時左半部為 0，**右半部放入乘數**。
    - 每次迭代：若乘數當前最低位元為 1，將被乘數加至乘積暫存器的左半部；隨後將**整個 64 位元乘積暫存器向右位移 1 位元**。歷經 32 週期完成。
  ![投影片第 37 頁：最佳化 32 位元乘法器硬體架構 (Optimized Multiplier)](images/multiplier_optimized.png)
- **布斯演算法（Booth's Algorithm）核心概念**：
  - 針對有號數 2 補數乘法設計，能將連續的 1 字串（如 $01111110_2$）簡化為一次減法與一次加法：
    $$\\text{Multiplicand} \\times 01111110_2 = \\text{Multiplicand} \\times (10000000_2 - 00000010_2)$$
  - **檢查位元對 $(Q_0, Q_{-1})$**（$Q_0$ 為乘數當前 LSB，$Q_{-1}$ 為上一週期移出的參考位元，初值為 0）：
    - **0 0**：無連續 1 變化，不做運算，直接**算術右移（Arithmetic Shift Right）**。
    - **0 1**：連續 1 的結束（由 1 轉 0），累加器 $A = A + M$，隨後算術右移。
    - **1 0**：連續 1 的開頭（由 0 轉 1），累加器 $A = A - M$，隨後算術右移。
    - **1 1**：連續 1 的中間，不做運算，直接**算術右移**。
  - **注意**：算術右移時，最高有效位元必須複製原本的符號位元（Sign Extension）。
- **MIPS 乘法指令**：
  - \`mult $s1, $s2\` (有號數) / \`multu $s1, $s2\` (無號數)
  - 64 位元乘積存於兩個特殊暫存器：高 32 位元置於 \`hi\`，低 32 位元置於 \`lo\`。
  - 使用 \`mfhi $rd\` (Move from Hi) 與 \`mflo $rd\` (Move from Lo) 取出結果。
      `
    },
    {
      heading: "4. 整數除法器架構與規則 (Division Hardware & Rules)",
      content: `
- **回復除法演算法（Restoring Division Algorithm）**：
  - 64 位元暫存器左半部為餘數（Remainder），右半部為商數（Quotient，初始放入被除數）。
  - 步驟 1：整個 64 位元暫存器向左位移 1 位元。
  - 步驟 2：餘數左半部減去除數（Divisor）。
  - 步驟 3：判定結果正負：
    - 若餘數 $\\ge 0$：代表夠減，將商數最低位元設為 1。
    - 若餘數 $< 0$：代表不夠減，**加回除數進行回復（Restore）**，將商數最低位元設為 0。
  - 重複執行 32 次。
  ![投影片第 51 頁：最佳化 32 位元除法器硬體架構 (Optimized Divider)](images/divider_optimized.png)
- **帶符號除法正負號規則（嚴格遵循）**：
  $$\\text{Dividend} = \\text{Quotient} \\times \\text{Divisor} + \\text{Remainder}$$
  - **商數符號**：被除數與除數異號時為負，同號時為正。
  - **餘數符號（關鍵考點）**：**餘數的符號必須與被除數（Dividend）的符號完全相同！**
    - 例 1：$7 \\div (-2) \\implies \\text{Quotient} = -3, \\text{Remainder} = +1$
    - 例 2：$(-7) \\div 2 \\implies \\text{Quotient} = -3, \\text{Remainder} = -1$
    - 例 3：$(-7) \\div (-2) \\implies \\text{Quotient} = +3, \\text{Remainder} = -1$
- **MIPS 除法指令**：
  - \`div $s1, $s2\` / \`divu $s1, $s2\`
  - 商數存入 \`lo\`，餘數存入 \`hi\`。
      `
    },
    {
      heading: "5. IEEE 754 浮點數標準與 MIPS 浮點指令 (IEEE 754 & MIPS FP)",
      content: `
- **二進位正規化科學記號**：$(-1)^{\\text{Sign}} \\times (1 + \\text{Fraction}) \\times 2^{\\text{Exponent} - \\text{Bias}}$
- **單倍精確度（Single Precision，32-bit）**：
  - 符號位元 $S$：1 bit（0 為正，1 為負）
  - 指數位元 $E$：8 bits，偏差值 $\\text{Bias} = 127$（真實指數 $\\text{Real Exponent} = E - 127$）
  - 尾數位元 $F$：23 bits（隱含小數點前有一位隱藏的 1，即 $1.F$）
- **倍精確度（Double Precision，64-bit）**：
  - 符號位元 $S$：1 bit
  - 指數位元 $E$：11 bits，偏差值 $\\text{Bias} = 1023$（$\\text{Real Exponent} = E - 1023$）
  - 尾數位元 $F$：52 bits
- **IEEE 754 特殊數值編碼表（必考）**：
  | 指數位元 $E$ | 尾數位元 $F$ | 代表物件／數值意義 |
  | :--- | :--- | :--- |
  | 0 (全 0) | 0 (全 0) | 正負零 ($\\pm 0$) |
  | 0 (全 0) | 非 0 | **非正規化數 (Denormalized)**，值為 $(-1)^S \\times 0.F \\times 2^{-126}$ |
  | 1 至 254 | 任意 | **一般正規化浮點數 (Normalized)** |
  | 255 (全 1) | 0 (全 0) | 正負無窮大 ($\\pm \\infty$)，如除以 0 產生 |
  | 255 (全 1) | 非 0 | **非數值 (NaN, Not a Number)**，如 $0/0$ 或 $\\sqrt{-1}$ |
- **浮點數加法四步驟硬體流程**：
  1. **對齊小數點（Align Exponents）**：比較兩數指數，將較小指數數值的尾數向右位移 $(E_1 - E_2)$ 位元，使其指數與較大者相同。
  2. **尾數相加／相減（Add Significands）**：將兩正規化尾數依符號進行加減。
  3. **結果正規化（Normalize）**：將和或差調整回 $1.xxxx_2 \\times 2^E$ 格式，並同步調整指數；檢測是否發生溢位或下溢（Underflow）。
  4. **捨入（Rounding）**：將尾數依捨入模式（如 Round to nearest even）裁剪回 23 位元。
  ![投影片第 60 頁：IEEE 754 浮點數加法器硬體架構流程圖 (FP Adder Hardware)](images/fp_adder_hardware.png)
  3. **結果正規化（Normalize）**：將和或差調整回 $1.xxxx_2 \\times 2^E$ 格式，並同步調整指數；檢測是否發生溢位或下溢（Underflow）。
  4. **捨入（Rounding）**：將尾數依捨入模式（如 Round to nearest even）裁剪回 23 位元。
- **MIPS 浮點硬體架構（Coprocessor 1）**：
  - 獨立的 32 個 32 位元浮點暫存器：\`$f0\` 至 \`$f31\`。
  - 單倍運算直接使用單一暫存器；倍精確度運算成對使用偶數號暫存器（如 \`$f0\`-\`$f1\`, \`$f2\`-\`$f3\`）。
  - 指令：\`add.s\`, \`sub.s\`, \`mul.s\`, \`div.s\`（單倍）；\`add.d\`, \`sub.d\`, \`mul.d\`, \`div.d\`（雙倍）。
  - 記憶體載入：\`lwc1 $f0, 4($sp)\`, \`swc1 $f0, 4($sp)\`。
  - 條件分支：\`c.lt.s $f0, $f1\`（比較），\`bc1t Label\`（條件成立跳轉），\`bc1f Label\`（條件不成立跳轉）。
      `
    }
  ],
  formulas: [
    { name: "有號數加減法溢位條件", formula: "\\text{Overflow} = \\text{CarryIn}[\\text{MSB}] \\oplus \\text{CarryOut}[\\text{MSB}]" },
    { name: "ALU 減法控制訊號", formula: "\\text{Ainvert}=0,\\; \\text{Binvert}=1,\\; \\text{CarryIn}=1,\\; \\text{Op}=10" },
    { name: "ALU NOR 邏輯控制訊號", formula: "\\text{Ainvert}=1,\\; \\text{Binvert}=1,\\; \\text{CarryIn}=0,\\; \\text{Op}=00 \\implies \\overline{A} \\cdot \\overline{B} = \\overline{A+B}" },
    { name: "ALU SLT 溢位修正輸出", formula: "\\text{Set} = \\text{Sign} \\oplus \\text{Overflow}" },
    { name: "布斯演算法操作規則", formula: "01 \\to A=A+M;\\; 10 \\to A=A-M;\\; 00, 11 \\to \\text{No op}" },
    { name: "帶符號除法餘數規則", formula: "\\text{Sign}(\\text{Remainder}) = \\text{Sign}(\\text{Dividend})" },
    { name: "IEEE 754 單倍精確度數值", formula: "V = (-1)^S \\times (1 + \\text{Fraction}) \\times 2^{\\text{Exponent} - 127}" },
    { name: "IEEE 754 非正規化小數", formula: "V = (-1)^S \\times (0 + \\text{Fraction}) \\times 2^{-126}" }
  ],
  dynamicProblems: [
    {
      id: "ch3_overflow_detect",
      title: "題型 3-1：32 位元有號數加法溢位判定與二補數運算",
      category: "有號數溢位判定",
      generator: function() {
        const pool = [
          { a: 0x70000000, b: 0x20000000, isAdd: true, overflow: true, reason: "正數 + 正數 產生負數結果（符號位由 0 變為 1），發生正溢位。" },
          { a: 0x80000000, b: 0x80000000, isAdd: true, overflow: true, reason: "負數 + 負數 產生 0x00000000（符號位變為 0），發生負溢位。" },
          { a: 0x70000000, b: 0x80000000, isAdd: true, overflow: false, reason: "正數與負數相加，結果絕對值必小於運算元，絕對不可能發生溢位。" },
          { a: 0x40000000, b: 0x30000000, isAdd: true, overflow: false, reason: "正數 + 正數 = 0x70000000，符號位仍為 0，未超出範圍，無溢位。" },
          { a: 0x80000000, b: 0x00000001, isAdd: false, overflow: true, reason: "最負數 0x80000000 減去正數，結果小於最小負數極限，發生負溢位。" },
          { a: 0x70000000, b: 0x90000000, isAdd: false, overflow: true, reason: "正數減負數等價於正數加正數，結果超出正數最大範圍，發生正溢位。" }
        ];
        return pool[Math.floor(Math.random() * pool.length)];
      },
      render: function(p) {
        const opStr = p.isAdd ? "+" : "-";
        return `在 32 位元 MIPS 處理器中，兩有號整數（Signed 2's Complement）暫存器數值如下：
- **暫存器 A** = **0x${(p.a >>> 0).toString(16).padStart(8, '0').toUpperCase()}**
- **暫存器 B** = **0x${(p.b >>> 0).toString(16).padStart(8, '0').toUpperCase()}**

若 ALU 執行運算 **$A ${opStr} B$**。
**請判定此運算是否會觸發有號數溢位（Signed Overflow）？**
（若會溢位請填寫 **\`overflow\`** 或 **\`是\`**；若不溢位請填寫 **\`no overflow\`** 或 **\`否\`**）`;
      },
      solve: function(p) {
        return {
          correctValue: p.overflow ? ["overflow", "是", "1"] : ["no overflow", "否", "0"],
          unit: "",
          tolerance: 0,
          explanation: `
1. **數值符號與十六進位分析**：
   - $A = \\text{0x}${(p.a >>> 0).toString(16).padStart(8, '0').toUpperCase()}，最高位元 MSB 為 **${(p.a >>> 31)}**（${(p.a >>> 31) === 0 ? "正數" : "負數"}）。
   - $B = \\text{0x}${(p.b >>> 0).toString(16).padStart(8, '0').toUpperCase()}，最高位元 MSB 為 **${(p.b >>> 31)}**（${(p.b >>> 31) === 0 ? "正數" : "負數"}）。
2. **硬體溢位準則**：
   - 只有在「正數 + 正數 得 負數」或「負數 + 負數 得 正數」時會發生溢位。
   - 正數與負數相加絕不可能溢位。
3. **結論判定**：
   - 本題執行運算結果判定為：**${p.overflow ? "會溢位 (Overflow)" : "無溢位 (No Overflow)"}**。
   - 原因：${p.reason}
          `
        };
      }
    },
    {
      id: "ch3_alu_control",
      title: "題型 3-2：32 位元 ALU 控制訊號與運算功能解碼",
      category: "ALU 硬體設計",
      generator: function() {
        const pool = [
          { ainv: 0, binv: 0, cin: 0, op: "00", name: "AND", explain: "Ainvert=0, Binvert=0, Operation=00 代表直接對 A 與 B 執行逐位元 AND 邏輯運算。" },
          { ainv: 0, binv: 0, cin: 0, op: "01", name: "OR", explain: "Ainvert=0, Binvert=0, Operation=01 代表直接對 A 與 B 執行逐位元 OR 邏輯運算。" },
          { ainv: 0, binv: 0, cin: 0, op: "10", name: "ADD", explain: "Ainvert=0, Binvert=0, CarryIn=0, Operation=10 代表全加器執行算術加法 A + B。" },
          { ainv: 0, binv: 1, cin: 1, op: "10", name: "SUB", explain: "Binvert=1 將 B 逐位元反相，配合 CarryIn=1 形成 2 補數 ~B + 1，全加器執行 A + (~B + 1) = A - B。" },
          { ainv: 1, binv: 1, cin: 0, op: "00", name: "NOR", explain: "Ainvert=1, Binvert=1 配合 AND 閘：~A · ~B = ~(A + B)，利用笛摩根定理硬體實現 NOR 運算。" },
          { ainv: 0, binv: 1, cin: 1, op: "11", name: "SLT", explain: "執行減法 A - B，將 MSB 之 Set 輸出連接至 LSB 之 Less 輸入端，實現 Set on Less Than。" }
        ];
        return pool[Math.floor(Math.random() * pool.length)];
      },
      render: function(p) {
        return `在教科書與投影片第 30 頁所設計之 32 位元 MIPS ALU 中，輸入端收到下列一組控制訊號：
- **Ainvert** = **${p.ainv}**
- **Binvert (Bnegate)** = **${p.binv}**
- **CarryIn** = **${p.cin}**
- **Operation** = **${p.op}** (2 位元多工器選擇線)

![32 位元 MIPS ALU 總硬體架構圖 (投影片第 30 頁)](images/alu_32bit_final.png)

**請解碼：此組訊號控制 ALU 執行何種操作？**
（請輸入英文縮寫，例如 \`AND\`、\`OR\`、\`ADD\`、\`SUB\`、\`NOR\` 或 \`SLT\`）`;
      },
      solve: function(p) {
        return {
          correctValue: [p.name, p.name.toLowerCase()],
          unit: "",
          tolerance: 0,
          explanation: `
1. **控制訊號對應解析**：
   - **Ainvert = ${p.ainv}**：${p.ainv === 1 ? "輸入 A 被反相 (~A)" : "輸入 A 保持原樣"}
   - **Binvert = ${p.binv}**：${p.binv === 1 ? "輸入 B 被反相 (~B)" : "輸入 B 保持原樣"}
   - **CarryIn = ${p.cin}**：加法器初值進位為 ${p.cin}
   - **Operation = ${p.op}**：多工器選擇第 ${parseInt(p.op, 2)} 號輸入端（00: AND, 01: OR, 10: 加法器, 11: Less）
2. **硬體行為與結果**：
   - 正確操作名稱：**${p.name}**
   - 詳細說明：${p.explain}
          `
        };
      }
    },
    {
      id: "ch3_booth_step",
      title: "題型 3-3：布斯乘法演算法（Booth's Algorithm）週期狀態追蹤與結果推導",
      category: "布斯演算法",
      generator: function() {
        const pool = [
          { m: 2, q: -3, mBits: "0010", qBits: "1101", ans: -6 },
          { m: -3, q: 4, mBits: "1101", qBits: "0100", ans: -12 },
          { m: 3, q: 5, mBits: "0011", qBits: "0101", ans: 15 },
          { m: -4, q: -2, mBits: "1100", qBits: "1110", ans: 8 }
        ];
        return pool[Math.floor(Math.random() * pool.length)];
      },
      render: function(p) {
        return `考慮使用布斯乘法演算法（Booth's Algorithm）執行 4 位元有號數乘法：
- **被乘數 Multiplicand ($M$)** = **${p.m}**（4 位元二補數表示為 \`${p.mBits}\`）
- **乘數 Multiplier ($Q$)** = **${p.q}**（4 位元二補數表示為 \`${p.qBits}\`）
- 初始累加器 $A = 0000_2$，參考位元 $Q_{-1} = 0$。

**請計算：經過 4 個運算週期後，最終 8 位元乘積所代表的十進位整數值為多少？**`;
      },
      solve: function(p) {
        return {
          correctValue: p.ans,
          unit: "",
          tolerance: 0,
          explanation: `
1. **布斯演算法操作規則回顧**：
   - 觀察乘數當前最低位元 $Q_0$ 與歷史位元 $Q_{-1}$：
     - **00** 或 **11**：無狀態變化，直接進行**算術右移（ASR）**。
     - **01**（遇連續 1 結束）：$A = A + M$，隨後算術右移。
     - **10**（遇連續 1 起始）：$A = A - M$，隨後算術右移。
2. **算術驗證**：
   $$\\text{Product} = M \\times Q = (${p.m}) \\times (${p.q}) = ${p.ans}$$
3. **布斯演算法優勢**：
   透過連續 1 字串的合併，將原本需要多次加法的運算精簡為一次加法與一次減法，大幅降低加法器工作頻次並天然支援有號數乘法。
          `
        };
      }
    },
    {
      id: "ch3_signed_div",
      title: "題型 3-4：最佳化除法器與帶符號商數/餘數計算",
      category: "除法硬體與規則",
      generator: function() {
        const pool = [
          { dividend: 7, divisor: -2, q: -3, r: 1 },
          { dividend: -7, divisor: 2, q: -3, r: -1 },
          { dividend: -7, divisor: -2, q: 3, r: -1 },
          { dividend: -27, divisor: 4, q: -6, r: -3 },
          { dividend: 19, divisor: -5, q: -3, r: 4 },
          { dividend: -19, divisor: -5, q: 3, r: -4 }
        ];
        return pool[Math.floor(Math.random() * pool.length)];
      },
      render: function(p) {
        return `在 MIPS 處理器中執行有號數除法指令 \`div $s0, $s1\`：
- **被除數 Dividend ($s0)** = **${p.dividend}**
- **除數 Divisor ($s1)** = **${p.divisor}**

運算完成後，結果將分別存放於暫存器 \`lo\`（存放商數 Quotient）與 \`hi\`（存放餘數 Remainder）。
**請計算：暫存器 \`hi\` 中所存放的餘數（Remainder）十進位數值為多少？**`;
      },
      solve: function(p) {
        return {
          correctValue: p.r,
          unit: "",
          tolerance: 0,
          explanation: `
1. **帶符號除法基本恆等式**：
   $$\\text{Dividend} = \\text{Quotient} \\times \\text{Divisor} + \\text{Remainder}$$
   代入：$${p.dividend} = (${p.q}) \\times (${p.divisor}) + (${p.r})$
2. **正負號判定鐵律（考試必考關鍵）**：
   - **商數（Quotient）符號**：被除數與除數異號時為負，同號時為正。
     $\\implies \\text{Quotient} = ${p.q}$ (存放於 \`lo\`)。
   - **餘數（Remainder）符號**：**餘數的符號必須永遠與被除數（Dividend）的符號完全相同！**
     因為 Dividend = ${p.dividend}（${p.dividend > 0 ? "正數" : "負數"}），所以 Remainder 必須為 **${p.r}**（存放於 \`hi\`）。
          `
        };
      }
    },
    {
      id: "ch3_float_to_hex",
      title: "題型 3-5：IEEE 754 單倍精確度十進位轉 32-bit 十六進位機器碼",
      category: "浮點數編碼轉換",
      generator: function() {
        const pool = [
          { dec: -13.625, sign: 1, exp: 130, expHex: "82", fracBin: "10110100000000000000000", hex: "C15A0000", binary: "-1101.101" },
          { dec: 26.5, sign: 0, exp: 131, expHex: "83", fracBin: "10101000000000000000000", hex: "41D40000", binary: "+11010.1" },
          { dec: -0.75, sign: 1, exp: 126, expHex: "7E", fracBin: "10000000000000000000000", hex: "BF400000", binary: "-0.11" },
          { dec: 10.25, sign: 0, exp: 130, expHex: "82", fracBin: "01001000000000000000000", hex: "41240000", binary: "+1010.01" },
          { dec: -6.375, sign: 1, exp: 129, expHex: "81", fracBin: "10011000000000000000000", hex: "C0CC0000", binary: "-110.011" },
          { dec: 0.5, sign: 0, exp: 126, expHex: "7E", fracBin: "00000000000000000000000", hex: "3F000000", binary: "+0.1" }
        ];
        return pool[Math.floor(Math.random() * pool.length)];
      },
      render: function(p) {
        return `請將十進位實數 **${p.dec}** 轉換為符合 **IEEE 754 單倍精確度（Single Precision 32-bit）** 浮點數標準之機器表示法。

**請計算：此浮點數對應的 32 位元十六進位表示碼（Hexadecimal representation）為何？**（格式如 \`0x${p.hex}\` 或 \`${p.hex}\`）`;
      },
      solve: function(p) {
        const sBin = p.sign.toString();
        const eBin = p.exp.toString(2).padStart(8, '0');
        const fBin = p.fracBin;

        return {
          correctValue: `0x${p.hex}`,
          altValue: p.hex,
          unit: "",
          tolerance: 0,
          explanation: `
1. **十進位轉二進位**：
   $$${p.dec}_{10} = ${p.binary}_2$$
2. **二進位正規化科學記號**：
   移位後得：$${p.sign === 1 ? "-" : "+"}1.${p.fracBin.replace(/0+$/, "")}_2 \\times 2^{${p.exp - 127}}$
3. **分解 IEEE 754 單倍精確度三大欄位**：
   - **符號位元 $S$ (1 bit)**：數值為${p.sign === 1 ? "負數" : "正數"} $\\implies S = ${p.sign}$。
   - **偏差指數 $E$ (8 bits)**：
     $$E = \\text{真實指數} + \\text{Bias} = (${p.exp - 127}) + 127 = ${p.exp} = ${eBin}_2$$
   - **尾數欄位 $F$ (23 bits)**：
     去掉隱藏的前導 1 後取小數部分，補齊 23 位元：\`${fBin}\`。
4. **組裝 32 位元二進位並轉換為十六進位**：
   \`${sBin} ${eBin} ${fBin.slice(0, 7)} ${fBin.slice(7, 15)} ${fBin.slice(15, 23)}\`
   $\\implies$ **0x${p.hex}**
          `
        };
      }
    },
    {
      id: "ch3_hex_to_float",
      title: "題型 3-6：IEEE 754 十六進位機器碼還原十進位實數",
      category: "浮點數解碼還原",
      generator: function() {
        const pool = [
          { hex: "41C80000", dec: 25.0, sign: 0, exp: 131, realExp: 4, fracStr: "1.1001" },
          { hex: "C0B00000", dec: -5.5, sign: 1, exp: 129, realExp: 2, fracStr: "1.011" },
          { hex: "3F400000", dec: 0.75, sign: 0, exp: 126, realExp: -1, fracStr: "1.1" },
          { hex: "C1A00000", dec: -20.0, sign: 1, exp: 131, realExp: 4, fracStr: "1.01" },
          { hex: "40D00000", dec: 6.5, sign: 0, exp: 129, realExp: 2, fracStr: "1.101" }
        ];
        return pool[Math.floor(Math.random() * pool.length)];
      },
      render: function(p) {
        return `一條 32 位元 IEEE 754 單倍精確度浮點數機器碼為 **0x${p.hex}**。

**請計算：此機器碼所代表的十進位實數（Decimal Float）數值為多少？**（可帶正負號與小數點）`;
      },
      solve: function(p) {
        return {
          correctValue: p.dec,
          unit: "",
          tolerance: 0.01,
          explanation: `
1. **將十六進位展開為 32 位元二進位**：
   \`0x${p.hex}\`
   $\\implies$ 符號位元 $S$、指數 $E$ (8 bits)、尾數 $F$ (23 bits)。
2. **各欄位數值拆解**：
   - 符號位元 $S = ${p.sign}$（代表${p.sign === 1 ? "負數" : "正數"}）
   - 偏差指數 $E = ${p.exp}$
   - 真實指數 $\\text{Real Exponent} = E - 127 = ${p.exp} - 127 = ${p.realExp}$
   - 尾數實質數值：隱含前導 1，即 $(${p.fracStr})_2$
3. **計算十進位真值**：
   $$\\text{Value} = (-1)^{${p.sign}} \\times (${p.fracStr})_2 \\times 2^{${p.realExp}} = ${p.dec}$$
          `
        };
      }
    },
    {
      id: "ch3_float_addition",
      title: "題型 3-7：IEEE 754 浮點數加法四步驟正規化與指數對齊",
      category: "浮點運算演算法",
      generator: function() {
        const pool = [
          {
            aDec: 0.5, aBin: "1.0000 * 2^-1",
            bDec: -0.4375, bBin: "-1.1100 * 2^-2",
            diffExp: 1,
            shiftedB: "-0.1110 * 2^-1",
            sumBin: "0.0010 * 2^-1",
            normBin: "1.0000 * 2^-4",
            finalDec: 0.0625
          },
          {
            aDec: 1.5, aBin: "1.1000 * 2^0",
            bDec: 2.5, bBin: "1.0100 * 2^1",
            diffExp: 1,
            shiftedB: "0.1100 * 2^1",
            sumBin: "10.0000 * 2^1",
            normBin: "1.0000 * 2^2",
            finalDec: 4.0
          }
        ];
        return pool[Math.floor(Math.random() * pool.length)];
      },
      render: function(p) {
        return `對齊投影片第 59 頁浮點數加法演算法範例：
計算兩浮點數相加：**$A = ${p.aDec}$** 與 **$B = ${p.bDec}$**。
- $A = (${p.aBin})_2$
- $B = (${p.bBin})_2$

**請計算：依據 IEEE 754 浮點加法四步驟流程，運算完成後最終結果的十進位數值為多少？**`;
      },
      solve: function(p) {
        return {
          correctValue: p.finalDec,
          unit: "",
          tolerance: 0.001,
          explanation: `
1. **Step 1: 比較並對齊指數（Align Exponents）**：
   兩數指數差距為 ${p.diffExp} 位元。將指數較小者向右移位：
   $B$ 轉為 $(${p.shiftedB})_2$。
2. **Step 2: 尾數相加（Add Significands）**：
   相加得：$(${p.sumBin})_2$。
3. **Step 3: 結果正規化（Normalize）**：
   將結果向左/右位移調整為前導為 1 的科學記號：
   $\\implies (${p.normBin})_2$。
4. **Step 4: 捨入並輸出（Round & Output）**：
   最終結果換算為十進位為 **${p.finalDec}**。
          `
        };
      }
    }
  ]
});
