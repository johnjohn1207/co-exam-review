// Chapter 2: Instructions: Language of the Computer
// 資料定義與計算題模組

window.CO_DATA = window.CO_DATA || { chapters: [], translations: [] };

window.CO_DATA.chapters.push({
  id: "ch2",
  title: "Chapter 2: 指令集架構：計算機的語言 (Instructions: Language of the Computer)",
  shortTitle: "Ch2 MIPS 指令集",
  summary: [
    {
      heading: "1. MIPS 暫存器配置約定 (Register Conventions)",
      content: `
MIPS 擁有 32 個 32 位元通用暫存器（$0 至 $31）：
- **$zero ($0)**：常數 0，不可修改（硬體接地）。
- **$v0 - $v1 ($2-$3)**：函式回傳值（Function Results）。
- **$a0 - $a3 ($4-$7)**：函式傳入引數（Function Arguments）。
- **$t0 - $t7 ($8-$15), $t8 - $t9 ($24-$25)**：暫時暫存器（Caller-saved，呼叫者自行保管，被呼叫者可任意覆寫）。
- **$s0 - $s7 ($16-$23)**：保存暫存器（Callee-saved，被呼叫者若使用必須在堆疊備份並在返回前還原）。
- **$gp ($28)**：全域指標（Global Pointer）。
- **$sp ($29)**：堆疊指標（Stack Pointer，由高位址往低位址長）。
- **$fp ($30)**：框架指標（Frame Pointer）。
- **$ra ($31)**：返回位址（Return Address，由 \`jal\` 自動寫入）。
      `
    },
    {
      heading: "2. MIPS 三大指令格式 (Instruction Formats)",
      content: `
所有 MIPS 指令皆為 32 位元長度：
- **R-type (暫存器型態，如 add, sub, and, or, slt, sll)**：
  - \`op\` (6 bits) : \`rs\` (5 bits) : \`rt\` (5 bits) : \`rd\` (5 bits) : \`shamt\` (5 bits) : \`funct\` (6 bits)
  - 運算元順序：組合語言中為 \`op rd, rs, rt\`，但機器碼欄位中為 \`rs\` 在前、\`rt\` 在中、\`rd\` 在後。
- **I-type (立即值／記憶體型態，如 addi, lw, sw, beq, bne, slti)**：
  - \`op\` (6 bits) : \`rs\` (5 bits) : \`rt\` (5 bits) : \`immediate\` (16 bits)
  - \`lw $rt, offset($rs)\` / \`sw $rt, offset($rs)\`
  - \`addi $rt, $rs, imm\`
- **J-type (跳躍型態，如 j, jal)**：
  - \`op\` (6 bits) : \`target address\` (26 bits)
      `
    },
    {
      heading: "3. 定址模式與位址計算 (Addressing Modes)",
      content: `
- **分支指令 (Branch / PC-Relative Addressing)**：
  $$\\text{Target PC} = (\\text{PC} + 4) + (\\text{immediate} \\times 4)$$
  注意：以當前分支指令位址的下一個指令位址（$\\text{PC} + 4$）為基準，immediate 為帶符號（Signed）的 Word 偏移量。
- **跳躍指令 (Jump / Pseudo-Direct Addressing)**：
  $$\\text{Target PC} = (\\text{PC} + 4)[31:28] \\mathbin{\\Vert} (\\text{target address} \\times 4)$$
  26 位元的 address 欄位左移 2 位元（乘 4）後，高 4 位元取自 $(\\text{PC} + 4)$ 的最高 4 位元。
- **記憶體基底定址 (Base Addressing)**：
  $$\\text{Memory Address} = \\text{Register Value} + \\text{Sign-Extended Offset}$$
  注意：MIPS 採 Word-aligned，一個 Word 為 4 Bytes，陣列索引 $i$ 的位元組偏移量為 $i \\times 4$。
      `
    },
    {
      heading: "4. 程序呼叫與堆疊管理 (Procedure Call & Stack Frame)",
      content: `
- **呼叫與返回**：
  - \`jal ProcedureLabel\`：將下一行指令位址（$\\text{PC} + 4$）存入 \`$ra\`，並跳轉至目標。
  - \`jr $ra\`：返回呼叫端。
- **堆疊指標操作**：
  - 配置空間（Push）：\`addi $sp, $sp, -k\`（$k$ 為 4 的倍數）。
  - 釋放空間（Pop）：\`addi $sp, $sp, k\`。
- **遞迴程序（Non-Leaf Procedure）規則**：
  若函式內部還會呼叫其他函式，必須在進入時將自身 \`$ra\` 以及有使用到的 \`$a\`, \`$s\` 暫存器壓入堆疊保護，否則 \`$ra\` 會被內層 \`jal\` 覆蓋。
      `
    }
  ],
  formulas: [
    { name: "分支目標位址 (PC-Relative)", formula: "\\text{Target PC} = (\\text{PC} + 4) + (\\text{Imm} \\times 4)" },
    { name: "分支偏移量反推 (Branch Offset)", formula: "\\text{Imm} = \\frac{\\text{Target PC} - (\\text{PC} + 4)}{4}" },
    { name: "跳躍目標位址 (Pseudo-Direct)", formula: "\\text{Target PC} = (\\text{PC}+4)[31:28] \\mathbin{\\Vert} (\\text{Target} \\ll 2)" },
    { name: "Word 陣列位址 (Array Offset)", formula: "\\text{Byte Offset} = \\text{Index} \\times 4" },
    { name: "跨步陣列位元組位移 (Stride D[k*j])", formula: "\\text{Offset} = (k \\times j) \\times 4 = (4k) \\times j" },
    { name: "堆疊空間配置 (Stack Push)", formula: "\\text{addi } \\$sp, \\$sp, -4 \\times n" }
  ],
  dynamicProblems: [
    {
      id: "ch2_r_encoding",
      title: "題型 2-1：R-type 指令欄位二進位轉十六進位編碼",
      category: "MIPS 編碼",
      generator: function() {
        const pool = [
          { name: "add", funct: 32, rs: 17, rt: 18, rd: 8, rsName: "$s1", rtName: "$s2", rdName: "$t0" },
          { name: "sub", funct: 34, rs: 3, rt: 2, rd: 3, rsName: "$v1", rtName: "$v0", rdName: "$v1" },
          { name: "slt", funct: 42, rs: 8, rt: 9, rd: 10, rsName: "$t0", rtName: "$t1", rdName: "$t2" },
          { name: "or",  funct: 37, rs: 16, rt: 17, rd: 18, rsName: "$s0", rtName: "$s1", rdName: "$s2" }
        ];
        const item = pool[Math.floor(Math.random() * pool.length)];
        return item;
      },
      render: function(p) {
        return `給定下列 MIPS R-type 指令之欄位數值（十進位）：
- **op** = 0
- **rs** = ${p.rs} (${p.rsName})
- **rt** = ${p.rt} (${p.rtName})
- **rd** = ${p.rd} (${p.rdName})
- **shamt** = 0
- **funct** = ${p.funct} (${p.name})

**請計算：此指令對應的 32 位元十六進位機器碼（Hexadecimal representation）為何？**（格式如 \`0x02324020\` 或 \`02324020\`）`;
      },
      solve: function(p) {
        // op: 6 bits (0)
        // rs: 5 bits
        // rt: 5 bits
        // rd: 5 bits
        // shamt: 5 bits (0)
        // funct: 6 bits
        const num = (0 << 26) | (p.rs << 21) | (p.rt << 16) | (p.rd << 11) | (0 << 6) | p.funct;
        const hex = (num >>> 0).toString(16).padStart(8, '0').toUpperCase();

        const opBin = "000000";
        const rsBin = p.rs.toString(2).padStart(5, '0');
        const rtBin = p.rt.toString(2).padStart(5, '0');
        const rdBin = p.rd.toString(2).padStart(5, '0');
        const shamtBin = "00000";
        const functBin = p.funct.toString(2).padStart(6, '0');
        const fullBin = `${opBin} ${rsBin} ${rtBin} ${rdBin} ${shamtBin} ${functBin}`;

        return {
          correctValue: `0x${hex}`,
          altValue: hex,
          unit: "",
          tolerance: 0,
          explanation: `
1. **各欄位二進位展開**：
   - \`op\` (6 bits) = \`${opBin}\`
   - \`rs\` (5 bits) = \`${rsBin}\` ($${p.rs})
   - \`rt\` (5 bits) = \`${rtBin}\` ($${p.rt})
   - \`rd\` (5 bits) = \`${rdBin}\` ($${p.rd})
   - \`shamt\` (5 bits) = \`${shamtBin}\`
   - \`funct\` (6 bits) = \`${functBin}\` (${p.funct})
2. **組裝 32 位元二進位字串**：
   \`${fullBin}\`
3. **每 4 位元轉換為十六進位**：
   二進位：\`${opBin}${rsBin}${rtBin}${rdBin}${shamtBin}${functBin}\`
   $\\implies$ **0x${hex}**
4. **組合語言對應**：\`${p.name} ${p.rdName}, ${p.rsName}, ${p.rtName}\`
          `
        };
      }
    },
    {
      id: "ch2_branch_offset",
      title: "題型 2-2：PC-Relative 條件分支立即值 (Immediate Offset) 計算",
      category: "分支位址計算",
      generator: function() {
        const pc = Math.floor(Math.random() * 5 + 10) * 4000; // e.g., 40000, 44000, 80000
        const offsetInstructions = Math.floor(Math.random() * 9 + 3); // 3 to 11 instructions forward
        const target = pc + 4 + (offsetInstructions * 4);
        return { pc, target, offsetInstructions };
      },
      render: function(p) {
        return `一條 MIPS 分支指令 \`bne $s0, $s1, Label\` 存放於記憶體位址 **0x${p.pc.toString(16).toUpperCase()}**。
目標標籤 \`Label\` 所在的記憶體位址為 **0x${p.target.toString(16).toUpperCase()}**。

**請計算：此 \`bne\` 指令機器碼中 16-bit 立即值欄位（Immediate Field）之十進位整數值應為多少？**`;
      },
      solve: function(p) {
        // Target = (PC + 4) + (Imm * 4) => Imm = (Target - (PC + 4)) / 4
        const nextPC = p.pc + 4;
        const diff = p.target - nextPC;
        const imm = diff / 4;

        return {
          correctValue: imm,
          unit: "words",
          tolerance: 0,
          explanation: `
1. **MIPS PC-Relative 分支公式**：
   $$\\text{Target PC} = (\\text{PC} + 4) + (\\text{Immediate} \\times 4)$$
2. **代入數值計算**：
   - 當前分支指令位址 $\\text{PC} = \\text{0x}${p.pc.toString(16).toUpperCase()}$
   - 基準位址 $\\text{PC} + 4 = \\text{0x}${nextPC.toString(16).toUpperCase()}$
   - 目標位址 $\\text{Target} = \\text{0x}${p.target.toString(16).toUpperCase()}$
3. **求解 Immediate 欄位值**：
   $$\\text{Immediate} = \\frac{\\text{Target} - (\\text{PC} + 4)}{4} = \\frac{${p.target} - ${nextPC}}{4} = \\frac{${diff}}{4} = ${imm}$$
   因此 16-bit 立即值欄位填入十進位 **${imm}**。
          `
        };
      }
    },
    {
      id: "ch2_jump_target",
      title: "題型 2-3：J-type 偽直接跳躍目標位址（Jump Target Address）解析",
      category: "跳躍位址計算",
      generator: function() {
        const pc = 0x00400010;
        const rawTargetWord = 0x00100050; // target instruction address / 4
        const targetPC = (pc & 0xF0000000) | (rawTargetWord << 2);
        return { pc, rawTargetWord, targetPC };
      },
      render: function(p) {
        return `一條無條件跳躍指令 \`j Target\` 位於記憶體位址 **0x00400010**。
其機器碼中 26 位元的 address 欄位值為十六進位 **0x00100050**。

**請計算：跳躍完成後程式計數器（Target PC）將跳至哪一個 32 位元十六進位記憶體位址？**（格式如 \`0x00400140\`）`;
      },
      solve: function(p) {
        const nextPC = p.pc + 4;
        const upper4 = (nextPC >>> 28) << 28;
        const shiftedTarget = (p.rawTargetWord << 2) >>> 0;
        const finalTarget = (upper4 | shiftedTarget) >>> 0;
        const hexStr = "0x" + finalTarget.toString(16).padStart(8, '0').toUpperCase();

        return {
          correctValue: hexStr,
          altValue: finalTarget.toString(16).padStart(8, '0').toUpperCase(),
          unit: "",
          tolerance: 0,
          explanation: `
1. **J-type Pseudo-Direct 定址公式**：
   $$\\text{Target PC} = (\\text{PC} + 4)[31:28] \\mathbin{\\Vert} (\\text{26-bit Address} \\times 4)$$
2. **步驟推導**：
   - $\\text{PC} + 4 = \\text{0x00400014}$，其最高 4 bits (bits 31-28) 為 \`0000\` (即十六進位最左端的 \`0\`)。
   - 26 位元 Address 欄位為 \`0x00100050\`，左移 2 位元（乘 4）得：
     $$\\text{0x00100050} \\times 4 = \\text{0x00400140}$$
   - 將高 4 位元與 28 位元位址進行拼接：
     $$\\text{Target PC} = \\text{0x00400140}$$
          `
        };
      }
    },
    {
      id: "ch2_dynamic_ic",
      title: "題型 2-4：迴圈動態指令執行總數推算（含邊界與退出檢查）",
      category: "動態指令計數",
      generator: function() {
        const N = Math.floor(Math.random() * 8) + 5; // N = 5 to 12
        return { N };
      },
      render: function(p) {
        return `對齊作業 Assignment 1 第 7 題之經典迴圈結構：
\`\`\`mips
LOOP: slt  $t2, $0, $t1       # 步驟 1: 比較
      beq  $t2, $0, DONE      # 步驟 2: 條件判斷
      addi $t1, $t1, -1       # 步驟 3: 計數器減 1
      addi $s2, $s2, 2        # 步驟 4: 累加
      j    LOOP               # 步驟 5: 跳回迴圈開頭
DONE:
\`\`\`
假設暫存器 \`$t1\` 初始值為 **${p.N}**（即 $N = ${p.N}$），且已停用延遲分支（Delayed Branching）。

**請計算：直到迴圈完全結束並退出至 DONE，CPU 總共動態執行了多少個基本的 MIPS 指令？**（需包含最後一次終止條件的檢查指令）`;
      },
      solve: function(p) {
        // Each full iteration executes: slt, beq, addi, addi, j -> 5 instructions
        // It runs N full iterations for $t1 = N, N-1, ..., 1.
        // At $t1 = 0: executes slt, beq (taken to DONE) -> 2 instructions
        // Total = 5 * N + 2
        const total = 5 * p.N + 2;

        return {
          correctValue: total,
          unit: "個指令",
          tolerance: 0,
          explanation: `
1. **單次迴圈內部指令分析**：
   當條件滿足（$t1 > 0$）時，每次迭代完整執行 5 個指令：
   1. \`slt\`
   2. \`beq\` (未跳轉)
   3. \`addi $t1, -1\`
   4. \`addi $s2, 2\`
   5. \`j LOOP\`
2. **完整迭代次數**：
   從 $t1 = ${p.N}$ 遞減至 $t1 = 1$，總共完整執行 **${p.N} 次**，共執行 $5 \\times ${p.N} = ${5 * p.N}$ 個指令。
3. **最後一次終止條件檢查（關鍵陷阱）**：
   當 $t1 = 0$ 時，迴圈仍需進行判斷：
   - 執行 \`slt $t2, $0, $t1\`（比較 $0 < 0$，結果 $t2 = 0$）
   - 執行 \`beq $t2, $0, DONE\`（判斷成立，跳轉至 DONE）
   此退出檢查共動態執行 **2 個指令**。
4. **動態指令總數通式**：
   $$\\text{Total Instructions} = 5 \\times N + 2 = 5 \\times ${p.N} + 2 = ${total}\\text{ 個指令}$$
          `
        };
      }
    },
    {
      id: "ch2_stride_offset",
      title: "題型 2-5：二重迴圈跨步陣列 D[4*j] 之位元組偏移量推導",
      category: "陣列記憶體定址",
      generator: function() {
        const jVal = Math.floor(Math.random() * 4) + 2; // j = 2, 3, 4, 5
        return { jVal };
      },
      render: function(p) {
        return `對齊作業 Assignment 1 第 9 題：
在 C 語言中有一二重巢狀迴圈涉及陣列存取：
\`\`\`c
for(i=0; i<a; i++)
    for(j=0; j<b; j++)
        D[4*j] = i + j;
\`\`\`
已知陣列 \`D\` 由 32 位元（4-byte）有號整數組成，基底位址存放於暫存器 \`$s2\`。
當內層變數 $j = ${p.jVal}$ 時。

**請計算：\`D[4*j]\` 元素相對於基底位址 \`$s2\` 的實際位元組偏移量（Byte Offset）為多少 Bytes？**`;
      },
      solve: function(p) {
        // Element index = 4 * j
        // Byte offset = (4 * j) * 4 bytes = 16 * j
        const offset = 16 * p.jVal;

        return {
          correctValue: offset,
          unit: "Bytes",
          tolerance: 0,
          explanation: `
1. **元素索引（Element Index）**：
   $$\\text{Index} = 4 \\times j = 4 \\times ${p.jVal} = ${4 * p.jVal}$$
2. **MIPS Word 定址位元組偏移量（Byte Offset）**：
   因為每個 \`int\` 佔用 4 個位元組（4 Bytes per word）：
   $$\\text{Byte Offset} = \\text{Index} \\times 4 = (4 \\times j) \\times 4 = 16 \\times j$$
3. **代入數值**：
   $$\\text{Byte Offset} = 16 \\times ${p.jVal} = ${offset}\\text{ Bytes}$$
4. **硬體位移指令實作技巧**：
   計算 $16j$ 相當於在 MIPS 中將暫存器中的 $j$ 值左移 4 位元：
   \`sll $t2, $t1, 4   # $t2 = j * 16 (即 4 * j * 4)\`
          `
        };
      }
    },
    {
      id: "ch2_i_encoding",
      title: "題型 2-6：I-type 指令欄位二進位轉十六進位機器碼【🔥 作業一 Q6b 必考真題】",
      category: "MIPS 編碼",
      generator: function() {
        const pool = [
          { op: 0x23, opBin: "100011", name: "lw", rs: 1, rt: 2, rsName: "$at", rtName: "$v0", imm: 4 },
          { op: 0x2B, opBin: "101011", name: "sw", rs: 29, rt: 31, rsName: "$sp", rtName: "$ra", imm: 8 },
          { op: 0x08, opBin: "001000", name: "addi", rs: 8, rt: 9, rsName: "$t0", rtName: "$t1", imm: 12 },
          { op: 0x04, opBin: "000100", name: "beq", rs: 16, rt: 17, rsName: "$s0", rtName: "$s1", imm: 16 }
        ];
        return pool[Math.floor(Math.random() * pool.length)];
      },
      render: function(p) {
        return `對齊作業 Assignment 1 第 6 題 (b) 小題：
給定下列 MIPS I-type 指令之欄位定義：
- **op** = 0x${p.op.toString(16).toUpperCase()} (${p.name})
- **rs** = ${p.rs} (${p.rsName})
- **rt** = ${p.rt} (${p.rtName})
- **immediate / const** = 0x${p.imm.toString(16).toUpperCase()} (十進位 ${p.imm})

**請計算：此 I-type 指令對應的 32 位元十六進位機器碼為何？**（格式如 \`0x8C220004\` 或 \`8C220004\`）`;
      },
      solve: function(p) {
        // op: 6 bits
        // rs: 5 bits
        // rt: 5 bits
        // imm: 16 bits
        const num = ((p.op << 26) | (p.rs << 21) | (p.rt << 16) | (p.imm & 0xFFFF)) >>> 0;
        const hex = num.toString(16).padStart(8, '0').toUpperCase();

        const rsBin = p.rs.toString(2).padStart(5, '0');
        const rtBin = p.rt.toString(2).padStart(5, '0');
        const immBin = (p.imm & 0xFFFF).toString(2).padStart(16, '0');
        const fullBin = `${p.opBin} ${rsBin} ${rtBin} ${immBin.slice(0, 4)} ${immBin.slice(4, 8)} ${immBin.slice(8, 12)} ${immBin.slice(12, 16)}`;

        let asmStr = "";
        if (p.name === "lw" || p.name === "sw") {
          asmStr = `${p.name} ${p.rtName}, ${p.imm}(${p.rsName})`;
        } else if (p.name === "addi") {
          asmStr = `${p.name} ${p.rtName}, ${p.rsName}, ${p.imm}`;
        } else if (p.name === "beq") {
          asmStr = `${p.name} ${p.rsName}, ${p.rtName}, ${p.imm}`;
        }

        return {
          correctValue: `0x${hex}`,
          altValue: hex,
          unit: "",
          tolerance: 0,
          explanation: `
1. **各欄位二進位解析**：
   - \`op\` (6 bits) = \`${p.opBin}\` (十六進位 0x${p.op.toString(16).toUpperCase()})
   - \`rs\` (5 bits) = \`${rsBin}\` (暫存器 $${p.rs})
   - \`rt\` (5 bits) = \`${rtBin}\` (暫存器 $${p.rt})
   - \`immediate\` (16 bits) = \`${immBin}\` (常數 ${p.imm})
2. **組裝 32 位元二進位指令**：
   \`${fullBin}\`
3. **四位一組轉換為十六進位 (Hex)**：
   \`${p.opBin}${rsBin}${rtBin}${immBin}\`
   $\\implies$ **0x${hex}**
4. **組合語言對應**：\`${asmStr}\`
          `
        };
      }
    }
  ]
});
