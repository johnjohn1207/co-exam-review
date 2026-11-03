// 老師精選練習題動態變種題庫 (Professor's Curated Practice Variants)
// 對齊 Chapter 3 老師指定勾選之 7 大核心習題：3.12, 3.13, 3.18, 3.29, 3.35, 3.36, 3.37
// 具備完整動態參數生成、純前端硬體狀態機模擬與步驟式 Markdown 追蹤表格渲染

window.CO_TEACHER_EXERCISES = [

  // ==========================================
  // 1. 習題 3.12 動態變種：第一版乘法器硬體追蹤
  // ==========================================
  {
    id: "ex_3_12_mult_trace",
    originalNo: "課後習題 3.12",
    title: "習題 3.12 變種：第一版乘法器硬體（Figure 3.3）逐週期追蹤與結果計算",
    category: "乘法器硬體架構",
    generator: function() {
      // 隨機產生無號整數，限制在 6 位元範圍 (1~63) 以便於手算與追蹤
      const pool = [
        { mDec: 50, qDec: 10, bits: 6, mOct: "62", qOct: "12" }, // 課本原題
        { mDec: 37, qDec: 11, bits: 6, mOct: "45", qOct: "13" },
        { mDec: 27, qDec: 14, bits: 6, mOct: "33", qOct: "16" },
        { mDec: 42, qDec: 9,  bits: 6, mOct: "52", qOct: "11" },
        { mDec: 31, qDec: 13, bits: 6, mOct: "37", qOct: "15" },
        { mDec: 45, qDec: 7,  bits: 6, mOct: "55", qOct: "07" }
      ];
      return pool[Math.floor(Math.random() * pool.length)];
    },
    render: function(p) {
      return `對照教材 **圖 3.3（第一版乘法硬體）** 與 **圖 3.6（乘法演算法追蹤格式）**：
被乘數暫存器寬度為 ${p.bits * 2} 位元，乘數暫存器為 ${p.bits} 位元，乘積暫存器為 ${p.bits * 2} 位元。
計算無號整數八進位乘法：**$M = ${p.mOct}_8$**（十進位 $${p.mDec}$）與 **$Q = ${p.qOct}_8$**（十進位 $${p.qDec}$）。

**請計算：此硬體運算執行 ${p.bits} 輪（Iterations）後，最終乘積暫存器的十進位整數數值為多少？**（亦可填入八進位如 \`${(p.mDec * p.qDec).toString(8)}_8\`）`;
    },
    solve: function(p) {
      const bits = p.bits;
      const m = p.mDec;
      const q = p.qDec;

      // 模擬 Figure 3.3 逐輪追蹤
      let mcand = m;
      let mplier = q;
      let prod = 0;
      let tableRows = [];

      const toBin = (num, len) => (num >>> 0).toString(2).padStart(len, "0");

      tableRows.push(`| **0** | Initial values | \`${toBin(mplier, bits)}\` | \`${toBin(mcand, bits * 2)}\` | \`${toBin(prod, bits * 2)}\` |`);

      for (let i = 1; i <= bits; i++) {
        const lsb = mplier & 1;
        if (lsb === 1) {
          prod = prod + mcand;
          tableRows.push(`| **${i}** | 1a: 1 => Prod = Prod + Mcand | \`${toBin(mplier, bits)}\` | \`${toBin(mcand, bits * 2)}\` | \`${toBin(prod, bits * 2)}\` |`);
        } else {
          tableRows.push(`| **${i}** | 1: 0 => No operation | \`${toBin(mplier, bits)}\` | \`${toBin(mcand, bits * 2)}\` | \`${toBin(prod, bits * 2)}\` |`);
        }
        mcand = mcand << 1;
        tableRows.push(`| | 2: Shift left Multiplicand | \`${toBin(mplier, bits)}\` | \`${toBin(mcand, bits * 2)}\` | \`${toBin(prod, bits * 2)}\` |`);
        mplier = mplier >> 1;
        tableRows.push(`| | 3: Shift right Multiplier | \`${toBin(mplier, bits)}\` | \`${toBin(mcand, bits * 2)}\` | \`${toBin(prod, bits * 2)}\` |`);
      }

      const finalProd = m * q;
      const finalOct = finalProd.toString(8);
      const finalBin = toBin(finalProd, bits * 2);

      return {
        correctValue: finalProd,
        altValue: [finalOct, `${finalOct}_8`, `0o${finalOct}`, finalBin],
        unit: "",
        tolerance: 0,
        explanation: `
1. **數值基底轉換**：
   - 被乘數 $M = ${p.mOct}_8 = ${m}_{10} = ${toBin(m, bits)}_2$（載入 ${bits * 2} 位元暫存器右半部：\`${toBin(m, bits * 2)}\`）
   - 乘數 $Q = ${p.qOct}_8 = ${q}_{10} = ${toBin(q, bits)}_2$（載入 ${bits} 位元暫存器）
   - 乘積暫存器初值為 ${bits * 2} 位元全零：\`${toBin(0, bits * 2)}\`。
2. **硬體行為特性（Figure 3.3）**：
   - 每輪檢查乘數最低位元 $Q_0$：若為 1 則 Product = Product + Multiplicand。
   - 被乘數向左位移 1 位元（Shift left Multiplicand）。
   - 乘數向右位移 1 位元（Shift right Multiplier）。
3. **完整 ${bits} 輪狀態追蹤表（Figure 3.6 格式）**：

| Iteration | Step | Multiplier | Multiplicand | Product |
| :---: | :--- | :---: | :---: | :---: |
${tableRows.join("\n")}

4. **最終結果**：
   - 二進位：\`${finalBin}\`
   - 八進位：$${finalOct}_8$
   - 十進位數值：**${finalProd}**（驗算：$${m} \\times ${q} = ${finalProd}$）。
        `
      };
    }
  },

  // ==========================================
  // 2. 習題 3.13 動態變種：最佳化乘法器硬體追蹤
  // ==========================================
  {
    id: "ex_3_13_opt_mult_trace",
    originalNo: "課後習題 3.13",
    title: "習題 3.13 變種：最佳化乘法器硬體（Figure 3.5）整組位移 8 輪追蹤與乘積計算",
    category: "乘法器硬體架構",
    generator: function() {
      const pool = [
        { mDec: 50, qDec: 10, mOct: "62", qOct: "12" }, // 課本原題
        { mDec: 35, qDec: 14, mOct: "43", qOct: "16" },
        { mDec: 41, qDec: 13, mOct: "51", qOct: "15" },
        { mDec: 29, qDec: 18, mOct: "35", qOct: "22" },
        { mDec: 63, qDec: 9,  mOct: "77", qOct: "11" }
      ];
      return pool[Math.floor(Math.random() * pool.length)];
    },
    render: function(p) {
      return `對照教材 **圖 3.5（最佳化乘法硬體）** 與 **圖 3.6 追蹤格式**：
被乘數暫存器固定為 8 位元（不進行位移），乘積暫存器為 16 位元（高 8 位元存放累加和，低 8 位元初值置入乘數）。
計算無號 8 位元整數乘法：**$M = ${p.mOct}_8$**（十進位 $${p.mDec}$）與 **$Q = ${p.qOct}_8$**（十進位 $${p.qDec}$）。

**請計算：此最佳化硬體運算執行 8 輪後，最終 16 位元乘積暫存器的十進位整數值為多少？**`;
    },
    solve: function(p) {
      const bits = 8;
      const m = p.mDec;
      const q = p.qDec;

      const toBin = (num, len) => (num >>> 0).toString(2).padStart(len, "0");

      let mcand = m;
      let prod = q & 0xFF; // high 8 bits = 0, low 8 bits = q
      let tableRows = [];

      tableRows.push(`| **0** | Initial values | \`${toBin(mcand, bits)}\` | \`${toBin(prod, 16).slice(0, 8)} ${toBin(prod, 16).slice(8)}\` |`);

      for (let i = 1; i <= bits; i++) {
        const lsb = prod & 1;
        if (lsb === 1) {
          let high = ((prod >>> 8) + mcand) & 0xFF;
          prod = (high << 8) | (prod & 0xFF);
          tableRows.push(`| **${i}** | 1a: 1 => Prod = Prod + Mcand | \`${toBin(mcand, bits)}\` | \`${toBin(prod, 16).slice(0, 8)} ${toBin(prod, 16).slice(8)}\` |`);
        } else {
          tableRows.push(`| **${i}** | 1: 0 => No operation | \`${toBin(mcand, bits)}\` | \`${toBin(prod, 16).slice(0, 8)} ${toBin(prod, 16).slice(8)}\` |`);
        }
        prod = prod >>> 1;
        tableRows.push(`| | 2: Shift right Product | \`${toBin(mcand, bits)}\` | \`${toBin(prod, 16).slice(0, 8)} ${toBin(prod, 16).slice(8)}\` |`);
      }

      const finalProd = m * q;
      const finalOct = finalProd.toString(8);

      return {
        correctValue: finalProd,
        altValue: [finalOct, `${finalOct}_8`, toBin(finalProd, 16)],
        unit: "",
        tolerance: 0,
        explanation: `
1. **數值與暫存器配置**：
   - 被乘數 $M = ${p.mOct}_8 = ${m}_{10} = \`${toBin(m, 8)}\`_2$（8 位元暫存器，全程固定不位移）。
   - 乘數 $Q = ${p.qOct}_8 = ${q}_{10} = \`${toBin(q, 8)}\`_2$。
   - 乘積暫存器（Product）：16 位元，初始配置為 \`0000 0000 ${toBin(q, 8)}\`。
2. **最佳化硬體特徵（Figure 3.5）**：
   - 乘數共用乘積暫存器的右半部空間。
   - 每輪若 $P_0 = 1$，僅對 Product 左半部 8 位元加上 Multiplicand。
   - 整組 16 位元 Product 暫存器向右位移 1 位元（Shift right Product）。
3. **完整 8 輪步驟追蹤表**：

| Iteration | Step | Multiplicand | Product (High 8 / Low 8) |
| :---: | :--- | :---: | :---: |
${tableRows.join("\n")}

4. **最終結果**：
   - 16 位元二進位：\`${toBin(finalProd, 16)}\`
   - 八進位：$${finalOct}_8$
   - 十進位整數值：**${finalProd}**。
        `
      };
    }
  },

  // ==========================================
  // 3. 習題 3.18 動態變種：第一版除法器復原法追蹤
  // ==========================================
  {
    id: "ex_3_18_div_restoring",
    originalNo: "課後習題 3.18",
    title: "習題 3.18 變種：第一版除法器復原法（Restoring Division）週期推導與商數餘數計算",
    category: "除法器硬體架構",
    generator: function() {
      const pool = [
        { dividend: 60, divisor: 17, n: 6, divOctA: "74", divOctB: "21", mode: "八進位脈絡 (74_8 ÷ 21_8 = 60 ÷ 17)" },
        { dividend: 74, divisor: 21, n: 7, divOctA: "74", divOctB: "21", mode: "純十進位脈絡 (74 ÷ 21)" },
        { dividend: 55, divisor: 13, n: 6, divOctA: "67", divOctB: "15", mode: "十進位 (55 ÷ 13)" },
        { dividend: 47, divisor: 15, n: 6, divOctA: "57", divOctB: "17", mode: "十進位 (47 ÷ 15)" },
        { dividend: 58, divisor: 14, n: 6, divOctA: "72", divOctB: "16", mode: "十進位 (58 ÷ 14)" }
      ];
      return pool[Math.floor(Math.random() * pool.length)];
    },
    render: function(p) {
      return `對照教材 **圖 3.8（第一版除法硬體）** 與 **圖 3.10（復原除法演算法流程）**：
除數暫存器為 ${2 * p.n} 位元（初值置於左半部），餘數暫存器為 ${2 * p.n} 位元（初值為被除數置於右半部），商數暫存器為 ${p.n} 位元。
計算整數除法：被除數為 **${p.dividend}**，除數為 **${p.divisor}**（${p.mode}）。

**請計算：此硬體運算執行 ${p.n + 1} 輪（Iterations）結束後，最終獲得的商數（Quotient）十進位整數值為多少？**（同時請推導餘數 Remainder）`;
    },
    solve: function(p) {
      const n = p.n;
      const dividend = p.dividend;
      const divisor = p.divisor;

      const toBin = (num, len) => (num >>> 0).toString(2).padStart(len, "0");

      let div = divisor << n;
      let rem = dividend;
      let quot = 0;
      let tableRows = [];

      tableRows.push(`| **0** | Initial values | \`${toBin(div, 2 * n)}\` | \`${toBin(rem, 2 * n)}\` | \`${toBin(quot, n)}\` |`);

      for (let i = 1; i <= n + 1; i++) {
        let testRem = rem - div;
        let stepDesc = "";
        if (testRem >= 0) {
          rem = testRem;
          quot = (quot << 1) | 1;
          stepDesc = "1: Rem = Rem - Div<br>2a: Rem >= 0 => sll Q, Q0=1<br>3: Shift Div right";
        } else {
          // Restore
          quot = (quot << 1) | 0;
          stepDesc = "1: Rem = Rem - Div<br>2b: Rem < 0 => Restore, sll Q, Q0=0<br>3: Shift Div right";
        }
        div = div >>> 1;
        tableRows.push(`| **${i}** | ${stepDesc} | \`${toBin(div, 2 * n)}\` | \`${toBin(rem, 2 * n)}\` | \`${toBin(quot, n)}\` |`);
      }

      const qVal = Math.floor(dividend / divisor);
      const rVal = dividend % divisor;

      return {
        correctValue: qVal,
        altValue: [String(qVal), `商數=${qVal},餘數=${rVal}`],
        unit: "",
        tolerance: 0,
        explanation: `
1. **第一版除法器執行架構（Figure 3.8 / 3.10）**：
   - 總迭代輪數為 $n + 1 = ${n} + 1 = ${n + 1}$ 輪。
   - 步驟 1：$\\text{Remainder} = \\text{Remainder} - \\text{Divisor}$。
   - 步驟 2：
     - 若 $\\text{Remainder} \\ge 0$：商數暫存器向左位移（sll），最低位補 1。
     - 若 $\\text{Remainder} < 0$：將餘數加回除數**復原**（Restore），商數向左位移，最低位補 0。
   - 步驟 3：除數暫存器向右位移 1 位元（Shift Div right）。
2. **完整 ${n + 1} 輪步驟追蹤表**：

| Iteration | Step | Divisor | Remainder | Quotient |
| :---: | :--- | :---: | :---: | :---: |
${tableRows.join("\n")}

3. **運算結算**：
   - **商數（Quotient）**：\`${toBin(qVal, n)}\`$_2 = $ **${qVal}**
   - **餘數（Remainder）**：\`${toBin(rVal, 2 * n)}\`$_2 = $ **${rVal}**
   - 驗算關係式：$${divisor} \\times ${qVal} + ${rVal} = ${divisor * qVal + rVal} = ${dividend}$。
        `
      };
    }
  },

  // ==========================================
  // 4. 習題 3.27 動態變種：16 位元半精度格式轉換與自訂偏壓 Excess-16 / Excess-15
  // ==========================================
  {
    id: "ex_3_27_half_prec_rep",
    originalNo: "課後習題 3.27",
    title: "習題 3.27 變種：16 位元半精度（Half Precision）位元模式編碼與單精度對比",
    category: "浮點數格式與編碼",
    generator: function() {
      const pool = [
        {
          decVal: -0.15625,
          formula: "-1.5625 \\times 10^{-1}",
          sign: 1,
          realExp: -3,
          biasMode: "Excess-16",
          bias: 16,
          normBin: "-1.01_2 \\times 2^{-3}",
          frac10: "0100000000",
          expBin: "01101",
          fullBin: "1011 0101 0000 0000",
          hex: "B500",
          altHex15: "B100"
        },
        {
          decVal: 0.375,
          formula: "+3.75 \\times 10^{-1}",
          sign: 0,
          realExp: -2,
          biasMode: "Excess-16",
          bias: 16,
          normBin: "+1.1_2 \\times 2^{-2}",
          frac10: "1000000000",
          expBin: "01110",
          fullBin: "0011 1010 0000 0000",
          hex: "3A00",
          altHex15: "3600"
        },
        {
          decVal: -0.0625,
          formula: "-6.25 \\times 10^{-2}",
          sign: 1,
          realExp: -4,
          biasMode: "Excess-16",
          bias: 16,
          normBin: "-1.0_2 \\times 2^{-4}",
          frac10: "0000000000",
          expBin: "01100",
          fullBin: "1011 0000 0000 0000",
          hex: "B000",
          altHex15: "AC00"
        },
        {
          decVal: 1.625,
          formula: "+1.625 \\times 10^{0}",
          sign: 0,
          realExp: 0,
          biasMode: "Excess-16",
          bias: 16,
          normBin: "+1.101_2 \\times 2^{0}",
          frac10: "1010000000",
          expBin: "10000",
          fullBin: "0100 0010 1000 0000",
          hex: "4280",
          altHex15: "3E80"
        },
        {
          decVal: -0.4375,
          formula: "-4.375 \\times 10^{-1}",
          sign: 1,
          realExp: -2,
          biasMode: "Excess-16",
          bias: 16,
          normBin: "-1.11_2 \\times 2^{-2}",
          frac10: "1100000000",
          expBin: "01110",
          fullBin: "1011 1011 0000 0000",
          hex: "BB00",
          altHex15: "B700"
        }
      ];
      return pool[Math.floor(Math.random() * pool.length)];
    },
    render: function(p) {
      return `依據 **課後習題 3.27**（IEEE 754-2008 Half Precision 16 位元浮點數規格）：
- 總長度：16 bits
- 最左側符號位元：1 bit
- 指數欄位：5 bits，題目特別指定使用 **${p.biasMode}（Bias = ${p.bias}）** 儲存
- 假數（有效數）欄位：10 bits（假設隱含前導 1）

請將實數 **$${p.formula}$**（十進位 $${p.decVal}$）轉換為此 16 位元半精度格式。

**請計算：此數值在此規格下的 16 位元十六進位機器碼為何？**（格式如 \`0x${p.hex}\` 或 \`${p.hex}\`，同時請思考其數值範圍 Range 與精確度 Accuracy 相較於 32 位元單精度之差異）`;
    },
    solve: function(p) {
      const storedExp = p.realExp + p.bias;
      return {
        correctValue: `0x${p.hex}`,
        altValue: [p.hex, `0x${p.hex.toLowerCase()}`, p.hex.toLowerCase(), p.fullBin.replace(/\s+/g, "")],
        unit: "",
        tolerance: 0,
        explanation: `
1. **十進位轉二進位規格化科學記號**：
   - 數值 $${p.decVal}$ 為${p.sign === 1 ? "負數" : "正數"} $\\implies$ 符號位元 **$S = ${p.sign}$**。
   - 絕對值 $|${p.decVal}| = ${Math.abs(p.decVal)}$。
   - 二進位表示：$${p.normBin}$。
   - 真實指數（Unbiased Exponent）：**$${p.realExp}$**。
   - 假數部分（去除前導 1 後補足 10 位元）：**\`${p.frac10}\`**。
2. **指數欄位編碼（題目指定 ${p.biasMode}，Bias = ${p.bias}）**：
   - 偏差指數 $E = \\text{真實指數} + \\text{Bias} = ${p.realExp} + ${p.bias} = ${storedExp} = \\mathbf{${p.expBin}_2}$。
3. **16 位元位元模式組裝**：
   - 符號位元（1 bit）：\`${p.sign}\`
   - 指數欄位（5 bits）：\`${p.expBin}\`
   - 假數欄位（10 bits）：\`${p.frac10}\`
   - 組合結果：\`${p.sign} ${p.expBin} ${p.frac10}\` $\\implies$ 二進位 \`${p.fullBin}\` $\\implies$ **0x${p.hex}**。
   *(註：若依據標準 IEEE 754-2008 Excess-15 規範，指數為 $${p.realExp}+15=${p.realExp+15}$，十六進位為 0x${p.altHex15})*。
4. **與 32 位元單精度（Single Precision）之範圍與精準度深度對比**：
   - **數值範圍（Range）**：
     - 16 位元半精度：指數 5 bits（$E = 1 \\sim 30$），真實指數範圍 $-14 \\sim +15$（Excess-15）或 $-15 \\sim +14$（Excess-16），十進位動態範圍約為 $10^{\\pm 4.5}$。
     - 32 位元單精度：指數 8 bits（$E = 1 \\sim 254$），真實指數範圍 $-126 \\sim +127$，十進位動態範圍約為 $10^{\\pm 38}$。
     - **結論**：32 位元單精度的動態範圍遠大於 16 位元半精度。
   - **精準度（Accuracy / Precision）**：
     - 16 位元半精度：假數 10 bits（含隱含 1 共 11 bits 有效數），十進位精準度 $\\approx \\log_{10}(2^{11}) \\approx 3.31$ 位十進位有效數字（約 3 到 4 位有效數字）。
     - 32 位元單精度：假數 23 bits（含隱含 1 共 24 bits 有效數），十進位精準度 $\\approx \\log_{10}(2^{24}) \\approx 7.22$ 位十進位有效數字（約 7 到 8 位有效數字）。
        `
      };
    }
  },

  // ==========================================
  // 5. 習題 3.29 動態變種：16 位元半精度浮點加法與 GRS 判定
  // ==========================================
  {
    id: "ex_3_29_half_prec_add",
    originalNo: "課後習題 3.29",
    title: "習題 3.29 變種：16 位元半精度浮點數加法手算與 GRS 捨入判定",
    category: "浮點數運算與捨入",
    generator: function() {
      const pool = [
        {
          aDec: 26.125,
          aBin: "+1.1010001000_2 \\times 2^4",
          aExp: 19,
          bDec: 0.4150390625,
          bBin: "+1.1010100100_2 \\times 2^{-2}",
          bExp: 13,
          diffExp: 6,
          shiftedB: "0.0000011010",
          grs: "1 0 1",
          roundAction: "進位 (Round Up)",
          finalFrac: "1010100011",
          finalHex: "4EA3",
          finalDec: 26.546875
        },
        {
          aDec: 12.5,
          aBin: "+1.1001000000_2 \\times 2^3",
          aExp: 18,
          bDec: 0.1875,
          bBin: "+1.1000000000_2 \\times 2^{-3}",
          bExp: 12,
          diffExp: 6,
          shiftedB: "0.0000011000",
          grs: "0 0 0",
          roundAction: "捨去 (Round Down)",
          finalFrac: "1001000110",
          finalHex: "4A46",
          finalDec: 12.6875
        },
        {
          aDec: 18.25,
          aBin: "+1.0010010000_2 \\times 2^4",
          aExp: 19,
          bDec: 0.09375,
          bBin: "+1.1000000000_2 \\times 2^{-4}",
          bExp: 11,
          diffExp: 8,
          shiftedB: "0.0000000110",
          grs: "0 0 0",
          roundAction: "捨去 (Round Down)",
          finalFrac: "0010010110",
          finalHex: "4C96",
          finalDec: 18.34375
        },
        {
          aDec: 8.75,
          aBin: "+1.0001100000_2 \\times 2^3",
          aExp: 18,
          bDec: 0.28125,
          bBin: "+1.0010000000_2 \\times 2^{-2}",
          bExp: 13,
          diffExp: 5,
          shiftedB: "0.0000100100",
          grs: "0 0 0",
          roundAction: "捨去 (Round Down)",
          finalFrac: "0010000100",
          finalHex: "4884",
          finalDec: 9.03125
        },
        {
          aDec: 15.5,
          aBin: "+1.1111000000_2 \\times 2^3",
          aExp: 18,
          bDec: 0.34375,
          bBin: "+1.0110000000_2 \\times 2^{-2}",
          bExp: 13,
          diffExp: 5,
          shiftedB: "0.0000101100",
          grs: "0 0 0",
          roundAction: "捨去 (Round Down)",
          finalFrac: "1111101100",
          finalHex: "4BEE",
          finalDec: 15.84375
        }
      ];
      return pool[Math.floor(Math.random() * pool.length)];
    },
    render: function(p) {
      return `依據 **課後習題 3.29** 與 16 位元半精度格式規格（1 bit Sign, 5 bits Exponent with Bias = 15, 10 bits Fraction）：
請手算兩浮點數相加：**$A = ${p.aDec}$** 與 **$B = ${p.bDec}$**。
- $A$ 之二進位表示：$${p.aBin}$（偏差指數 $E = ${p.aExp}$）
- $B$ 之二進位表示：$${p.bBin}$（偏差指數 $E = ${p.bExp}$）

**請計算：將兩數對齊指數相加並依據「向最近偶數捨入」（Round to nearest even）規則處理 Guard、Round 與 Sticky 位元後，最終結果的 16 位元十六進位機器碼為何？**（格式如 \`0x${p.finalHex}\` 或 \`${p.finalHex}\`）`;
    },
    solve: function(p) {
      return {
        correctValue: `0x${p.finalHex}`,
        altValue: [p.finalHex, String(p.finalDec)],
        unit: "",
        tolerance: 0,
        explanation: `
1. **Step 1: 比較並對齊指數（Align Exponents）**：
   指數差距為 $E_A - E_B = ${p.aExp} - ${p.bExp} = ${p.diffExp}$。將數值 $B$ 向右位移 ${p.diffExp}$ 位元：
   - 移位後假數為：\`${p.shiftedB}\`
   - 移出之 GRS 位元：Guard (G)、Round (R) 與 Sticky (S) 判定為 \`${p.grs}\`。
2. **Step 2: 假數相加（Add Significands）**：
   將 $A$ 假數與對齊後 $B$ 假數相加，保留 GRS 位元。
3. **Step 3: 規格化與向最近偶數捨入（Round to Nearest Even）**：
   - 依據 GRS 位元 \`${p.grs}\` 判定，執行 **${p.roundAction}**。
   - 捨入後 10 位元假數欄位為：\`${p.finalFrac}\`。
4. **Step 4: 組裝 16 位元機器碼**：
   - 符號位元 $S = 0$
   - 指數欄位 $E = ${p.aExp} = ${(p.aExp).toString(2).padStart(5, '0')}_2$
   - 假數欄位 $F = ${p.finalFrac}$
   - 合併機器碼：\`0 ${(p.aExp).toString(2).padStart(5, '0')} ${p.finalFrac}\` $\\implies$ **0x${p.finalHex}**（十進位值為 **${p.finalDec}**）。
        `
      };
    }
  },

  // ==========================================
  // 6. 習題 3.35 動態變種：浮點數乘法指數下溢判定
  // ==========================================
  {
    id: "ex_3_35_float_underflow",
    originalNo: "課後習題 3.35",
    title: "習題 3.35 變種：浮點數乘法 (A × B) × C 之指數下溢（Underflow）動態判定",
    category: "浮點數運算特性",
    generator: function() {
      const pool = [
        {
          aDec: "3.41796875 × 10^-3", aBin: "1.75 × 2^-9", ea: -9,
          bDec: "6.34765625 × 10^-3", bBin: "1.625 × 2^-8", eb: -8,
          cDec: "1.05625 × 10^2", cBin: "1.650390625 × 2^6", ec: 6,
          minExp: -14,
          firstExpSum: -17,
          isUnderflow: true,
          finalResult: 0
        },
        {
          aDec: "1.5 × 2^-10", aBin: "1.5 × 2^-10", ea: -10,
          bDec: "1.25 × 2^-7", bBin: "1.25 × 2^-7", eb: -7,
          cDec: "1.75 × 2^5", cBin: "1.75 × 2^5", ec: 5,
          minExp: -14,
          firstExpSum: -17,
          isUnderflow: true,
          finalResult: 0
        },
        {
          aDec: "1.125 × 2^-8", aBin: "1.125 × 2^-8", ea: -8,
          bDec: "1.5 × 2^-8", bBin: "1.5 × 2^-8", eb: -8,
          cDec: "1.25 × 2^7", cBin: "1.25 × 2^7", ec: 7,
          minExp: -14,
          firstExpSum: -16,
          isUnderflow: true,
          finalResult: 0
        },
        {
          aDec: "1.875 × 2^-9", aBin: "1.875 × 2^-9", ea: -9,
          bDec: "1.375 × 2^-7", bBin: "1.375 × 2^-7", eb: -7,
          cDec: "1.125 × 2^6", cBin: "1.125 × 2^6", ec: 6,
          minExp: -14,
          firstExpSum: -16,
          isUnderflow: true,
          finalResult: 0
        }
      ];
      return pool[Math.floor(Math.random() * pool.length)];
    },
    render: function(p) {
      return `依據 **課後習題 3.35**：
在 16 位元半精度硬體架構（Bias = 15，最小正規化真實指數為 $1 - 15 = -14$）下，計算 $(A \\times B) \\times C$：
- $A = ${p.aBin}$（真實指數 $E_A = ${p.ea}$）
- $B = ${p.bBin}$（真實指數 $E_B = ${p.eb}$）
- $C = ${p.cBin}$（真實指數 $E_C = ${p.ec}$）

**請判定：在第一階段計算 $(A \\times B)$ 時是否會引發指數下溢（Underflow）？此運算式的最終結果數值為何？**（請輸入最終數值，如 \`0\`）`;
    },
    solve: function(p) {
      return {
        correctValue: 0,
        altValue: ["0", "0.0", "underflow", "下溢"],
        unit: "",
        tolerance: 0,
        explanation: `
1. **第一階段：計算 $(A \\times B)$**：
   - 真實指數相加：$E_A + E_B = (${p.ea}) + (${p.eb}) = ${p.firstExpSum}$。
   - 16 位元半精度規格化數的最小可表示真實指數為 $1 - 15 = ${p.minExp}$。
   - 由於相加指數 $${p.firstExpSum} < ${p.minExp}$，數值低於硬體表示極限，引發**指數下溢（Exponent Underflow）**！
   - 在標準硬體截斷（Flush to Zero）機制下，$(A \\times B)$ 結果直接歸零為 **0**。
2. **第二階段：乘以 $C$**：
   - $(A \\times B) \\times C = 0 \\times C = $ **0**。
3. **結論**：最終運算結果為 **0**。
        `
      };
    }
  },

  // ==========================================
  // 7. 習題 3.36 動態變種：浮點數乘法精度保留推導
  // ==========================================
  {
    id: "ex_3_36_float_precision",
    originalNo: "課後習題 3.36",
    title: "習題 3.36 變種：浮點數乘法 A × (B × C) 正規化與有效數值推算",
    category: "浮點數運算特性",
    generator: function() {
      const pool = [
        {
          aDec: "1.75 × 2^-9", ea: -9,
          bDec: "1.625 × 2^-8", eb: -8,
          cDec: "1.650390625 × 2^6", ec: 6,
          step1Exp: -2,
          step1NormExp: -1,
          finalExp: -9,
          finalHex: "18B1",
          finalDecApprox: "0.0022907"
        },
        {
          aDec: "1.5 × 2^-10", ea: -10,
          bDec: "1.25 × 2^-7", eb: -7,
          cDec: "1.75 × 2^5", ec: 5,
          step1Exp: -2,
          step1NormExp: -1,
          finalExp: -10,
          finalHex: "1530",
          finalDecApprox: "0.00320"
        },
        {
          aDec: "1.125 × 2^-8", ea: -8,
          bDec: "1.5 × 2^-8", eb: -8,
          cDec: "1.25 × 2^7", ec: 7,
          step1Exp: -1,
          step1NormExp: 0,
          finalExp: -8,
          finalHex: "1E10",
          finalDecApprox: "0.0082"
        }
      ];
      return pool[Math.floor(Math.random() * pool.length)];
    },
    render: function(p) {
      return `依據 **課後習題 3.36**：
調整運算結合順序，計算 $A \\times (B \\times C)$：
- $A = ${p.aDec}$
- $B = ${p.bDec}$
- $C = ${p.cDec}$

**請推算：在此運算順序下，運算全程是否發生指數下溢？最終 16 位元半精度結果的十六進位表示碼為何？**（格式如 \`0x${p.finalHex}\` 或 \`${p.finalHex}\`）`;
    },
    solve: function(p) {
      return {
        correctValue: `0x${p.finalHex}`,
        altValue: [p.finalHex, p.finalDecApprox],
        unit: "",
        tolerance: 0,
        explanation: `
1. **第一階段：計算 $(B \\times C)$**：
   - 指數相加：$(${p.eb}) + ${p.ec} = ${p.step1Exp}$。
   - 規格化後指數調整為 $${p.step1NormExp}$（偏置指數 $E = ${p.step1NormExp} + 15 = ${p.step1NormExp + 15}$）。
   - 向最近偶數捨入，指數在合法範圍內，**未發生下溢**！
2. **第二階段：計算 $A \\times (B \\times C)$**：
   - 指數相加：$(${p.ea}) + (${p.step1NormExp}) = ${p.finalExp}$。
   - 偏置指數 $E = ${p.finalExp} + 15 = ${p.finalExp + 15}$。
3. **最終機器碼組裝**：
   $\\implies$ **0x${p.finalHex}**（十進位約為 **${p.finalDecApprox}**）。
        `
      };
    }
  },

  // ==========================================
  // 8. 習題 3.37 動態變種：浮點數結合律失效分析
  // ==========================================
  {
    id: "ex_3_37_associative_law",
    originalNo: "課後習題 3.37",
    title: "習題 3.37 變種：電腦系統中浮點數結合律失效綜合判定與硬體根因剖析",
    category: "浮點數運算特性",
    generator: function() {
      const pool = [
        {
          expr: "(A × B) × C = A × (B × C)",
          context: "課後習題 3.35 與 3.36 數值情境（乘法下溢對比）",
          aliases: ["否", "不成立", "false", "no", "0", "不相等"]
        },
        {
          expr: "(A + B) + C = A + (B + C)",
          context: "大數與極小數相加引發有效位數移出（Catastrophic Cancellation / Align Precision Loss）情境",
          aliases: ["否", "不成立", "false", "no", "0", "不相等"]
        },
        {
          expr: "(X × Y) × Z = X × (Y × Z)",
          context: "微處理器編譯器指令重新排序（Instruction Reordering）安全性判定",
          aliases: ["否", "不成立", "false", "no", "0", "不相等"]
        }
      ];
      return pool[Math.floor(Math.random() * pool.length)];
    },
    render: function(p) {
      return `綜合課後習題 3.35、3.36 與 3.37 之深入探討（${p.context}）：
在有限精確度的計算機浮點數運算硬體中，結合律等式 **$${p.expr}$** 是否恆成立？（請回答：\`是\` 或 \`否\`）`;
    },
    solve: function(p) {
      return {
        correctValue: "否",
        altValue: p.aliases,
        unit: "",
        tolerance: 0,
        explanation: `
1. **核心定論**：電腦中的浮點數運算**不滿足結合律（Floating-point arithmetic is NOT associative）**！無論是浮點加法或浮點乘法皆然！
2. **根因剖析**：
   - **乘法情況**：先將兩個極小數相乘，導致中間指數跌破最小規格化指數門檻（Underflow），數值被硬體歸零，導致最終結果為 0；但先乘大數則能維持在合法指數範圍內，保留有效數字。
   - **加法情況**：極大數與極小數相加時，小數指數向大數靠攏，導致小數的低位元被右移出假數暫存器而遺失（Precision loss）。
3. **對軟體編譯器之重要意涵**：
   編譯器在最佳化程式碼時，**絕對不能任意重排浮點數運算的結合順序**，否則可能導致程式產生嚴重誤差或非預期之數值歸零！
        `
      };
    }
  }

];
