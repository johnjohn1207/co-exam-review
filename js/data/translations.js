// 18 大經典 C/C++ 與 MIPS 雙向轉譯題庫
// 涵蓋：算術運算、陣列定址、分支反轉、複合條件、迴圈控制、作業一全真題型、Switch 跳躍表、葉/非葉程序、作業二遞迴費氏數列與排序

window.CO_DATA = window.CO_DATA || { chapters: [], translations: [] };

window.CO_DATA.translations = [
  {
    id: "trans_01",
    title: "題型 01：基本算術運算式與暫時暫存器配置",
    category: "基礎算術與運算式",
    direction: "C -> MIPS",
    level: "基礎",
    description: "將包含多個加減法運算元之高階運算式，透過中介暫存器拆解轉譯為 MIPS 指令。",
    cCode: `// 假設變數 f, g, h, i, j 分別配置於暫存器 $s0, $s1, $s2, $s3, $s4
f = (g + h) - (i + j);`,
    mipsCode: `add $t0, $s1, $s2    # $t0 = g + h
add $t1, $s3, $s4    # $t1 = i + j
sub $s0, $t0, $t1    # f = $t0 - $t1 = (g + h) - (i + j)`,
    lineByLine: [
      { line: "add $t0, $s1, $s2", explain: "計算 (g + h)，結果暫存於 Caller-saved 暫存器 $t0。" },
      { line: "add $t1, $s3, $s4", explain: "計算 (i + j)，結果暫存於 Caller-saved 暫存器 $t1。" },
      { line: "sub $s0, $t0, $t1", explain: "執行兩者相減，並將最終結果存入 $s0 (變數 f)。" }
    ],
    pitfalls: "運算式不能在單一指令內完成；必須先使用暫存暫存器 ($t0, $t1) 保留中間子運算式之值，以維持運算子優先順序。",
    hint: "將括號內的表達式分別用 add 指令存入 $t0 與 $t1，最後用 sub 計算並存入 $s0。"
  },
  {
    id: "trans_02",
    title: "題型 02：陣列常數索引存取與 Word 對齊偏移量",
    category: "記憶體定址與陣列",
    direction: "C -> MIPS",
    level: "基礎",
    description: "存取 32 位元整數陣列元素，必須將元素索引換算為 4 位元組（Bytes）的記憶體偏移量。",
    cCode: `// 假設 g 在 $s1, h 在 $s2, 整數陣列 A 的基底位址存放於 $s3
// 每個 int 佔用 4 bytes (Word-aligned)
g = h + A[8];
A[12] = g;`,
    mipsCode: `lw  $t0, 32($s3)      # $t0 = A[8]  (位元組偏移量 8 * 4 = 32)
add $s1, $s2, $t0     # g = h + A[8]
sw  $s1, 48($s3)      # A[12] = g   (位元組偏移量 12 * 4 = 48)`,
    lineByLine: [
      { line: "lw $t0, 32($s3)", explain: "陣列 A[8] 之位元組位移量為 8 * 4 = 32。將記憶體內容載入至暫存器 $t0。" },
      { line: "add $s1, $s2, $t0", explain: "計算 h + A[8]，存入暫存器 $s1 (變數 g)。" },
      { line: "sw $s1, 48($s3)", explain: "陣列 A[12] 之位元組位移量為 12 * 4 = 48。將暫存器 $s1 的值寫回記憶體。" }
    ],
    pitfalls: "記憶體定址常犯錯誤是直接寫 `lw $t0, 8($s3)`。MIPS 採 Byte Addressing，整數一個 Word 為 4 Bytes，索引必須乘以 4。",
    hint: "計算 byte offset: 8 * 4 = 32 與 12 * 4 = 48，分別使用 lw 載入與 sw 存回。"
  },
  {
    id: "trans_03",
    title: "題型 03：If-Then-Else 條件分支與分支反轉邏輯",
    category: "條件分支與跳躍",
    direction: "C -> MIPS",
    level: "基礎",
    description: "利用分支反轉技巧（Branch Inversion），當條件不滿足時提早跳轉至 Else 區塊。",
    cCode: `// 變數 f, g, h, i, j 分別位於 $s0, $s1, $s2, $s3, $s4
if (i == j)
    f = g + h;
else
    f = g - h;`,
    mipsCode: `      bne $s3, $s4, Else    # 若 i != j 則跳轉至 Else
      add $s0, $s1, $s2     # Then 區塊: f = g + h
      j   Exit              # 完成後跳過 Else 區塊
Else: sub $s0, $s1, $s2     # Else 區塊: f = g - h
Exit:`,
    lineByLine: [
      { line: "bne $s3, $s4, Else", explain: "分支反轉：C 語言為 i == j，組合語言使用 bne (不相等則跳轉) 直接跳至 Else。" },
      { line: "add $s0, $s1, $s2", explain: "條件成立時執行的 Then 區塊。" },
      { line: "j Exit", explain: "至關重要！Then 區塊結尾必須無條件跳躍，否則會循序掉入 (Fall-through) Else 區塊。" },
      { line: "Else: sub $s0, $s1, $s2", explain: "Else 標籤所在指令。" }
    ],
    pitfalls: "90% 學生會忘記在 Then 區塊末尾加上 `j Exit`，導致 Then 執行完後緊接著又執行了 Else！",
    hint: "條件 i == j 的反向是 bne；Then 區塊執行完畢一定要加 j Exit 跳出。"
  },
  {
    id: "trans_04",
    title: "題型 04：不等式大小比較與 slt 指令搭配",
    category: "條件分支與跳躍",
    direction: "C -> MIPS",
    level: "基礎",
    description: "MIPS 硬體沒有 blt 指令；必須使用 slt (Set on Less Than) 配合 beq / bne 實現小於比較。",
    cCode: `// 變數 a 位於 $s0, b 位於 $s1
if (a < b)
    a = a + 1;
else
    b = b - 1;`,
    mipsCode: `      slt $t0, $s0, $s1     # 若 a < b 則 $t0 = 1；否則 $t0 = 0
      beq $t0, $zero, Else  # 若 $t0 == 0 (即 a >= b)，跳轉至 Else
      addi $s0, $s0, 1      # Then 區塊: a = a + 1
      j    Exit
Else: addi $s1, $s1, -1     # Else 區塊: b = b - 1
Exit:`,
    lineByLine: [
      { line: "slt $t0, $s0, $s1", explain: "硬體先執行 signed 比較，若 $s0 < $s1 則將暫存器 $t0 設為 1。" },
      { line: "beq $t0, $zero, Else", explain: "檢驗 $t0 是否為 0。若為 0 表示條件不成立，跳往 Else。" },
      { line: "addi $s0, $s0, 1", explain: "條件成立時，a 遞增 1。" },
      { line: "j Exit", explain: "跳過 Else 區塊。" },
      { line: "addi $s1, $s1, -1", explain: "條件不成立時，b 遞減 1。" }
    ],
    pitfalls: "`slt` 的暫存器順序不可顛倒；`slt $t0, $s0, $s1` 是判斷 $s0 < $s1。若使用無號數比較應改用 `sltu`。",
    hint: "先用 slt $t0, $s0, $s1 判定大小，再用 beq $t0, $zero, Else 進行反向跳轉。"
  },
  {
    id: "trans_05",
    title: "題型 05：複合邏輯條件轉譯（AND && 與 OR || 捷徑求值）【🔥 期中高頻考點】",
    category: "條件分支與跳躍",
    direction: "C -> MIPS",
    level: "中等",
    description: "C 語言的 short-circuit evaluation（捷徑求值）在組合語言中透過多次條件分支跳轉實現。",
    cCode: `// 變數 i, j, h, k, f 分別在 $s0, $s1, $s2, $s3, $s4
if (i == j && h > k)
    f = 1;
else
    f = 0;`,
    mipsCode: `      bne  $s0, $s1, Else   # 第 1 條件：若 i != j 直接短路跳至 Else
      slt  $t0, $s3, $s2    # 第 2 條件：h > k 等價於 k < h，檢驗 $s3 < $s2
      beq  $t0, $zero, Else # 若非 k < h，跳至 Else
      addi $s4, $zero, 1    # 兩條件皆成立: f = 1
      j    Exit
Else: add  $s4, $zero, $zero # 條件不成立: f = 0
Exit:`,
    lineByLine: [
      { line: "bne $s0, $s1, Else", explain: "短路求值：AND 只要第一個條件為偽，後續條件完全不需計算，直接跳出。" },
      { line: "slt $t0, $s3, $s2", explain: "h > k 轉為 k < h ($s3 < $s2)，若為真 $t0 置 1。" },
      { line: "beq $t0, $zero, Else", explain: "第二條件不成立則跳至 Else。" },
      { line: "addi $s4, $zero, 1", explain: "設定 f = 1。" },
      { line: "j Exit", explain: "跳過 Else。" },
      { line: "add $s4, $zero, $zero", explain: "Else 區塊設定 f = 0。" }
    ],
    pitfalls: "切勿嘗試在 MIPS 中用 and 指令將兩條件結果做 bitwise AND 再判斷；那樣會失去 C 語言的短路求值特性，違反規範。",
    hint: "&& 運算式應採用連續反向分支；任何一個條件失敗皆直接跳到 Else。"
  },
  {
    id: "trans_06",
    title: "題型 06：While 迴圈與陣列動態尋訪（MIPS 逆向轉 C）",
    category: "迴圈控制結構",
    direction: "MIPS -> C",
    level: "中等",
    description: "經典教科書題目：透過動態索引計算位址，巡覽陣列直到條件不滿足。",
    cCode: `// 變數 i 存於 $s3, k 存於 $s5, 陣列 save 基底位址在 $s6
while (save[i] == k)
    i += 1;`,
    mipsCode: `Loop: sll  $t1, $s3, 2      # $t1 = i * 4 (計算位元組偏移量)
      add  $t1, $t1, $s6    # $t1 = save + (i * 4) (元素記憶體絕對位址)
      lw   $t0, 0($t1)      # $t0 = save[i]
      bne  $t0, $s5, Exit   # 若 save[i] != k 則跳出迴圈
      addi $s3, $s3, 1      # i = i + 1
      j    Loop             # 跳回迴圈開頭繼續判斷
Exit:`,
    lineByLine: [
      { line: "sll $t1, $s3, 2", explain: "陣列索引 i 左移 2 位元（乘 4），得到位元組位移。" },
      { line: "add $t1, $t1, $s6", explain: "基底位址加上位移量，算出 &save[i]。" },
      { line: "lw $t0, 0($t1)", explain: "載入 save[i] 之數值至暫時暫存器 $t0。" },
      { line: "bne $t0, $s5, Exit", explain: "若當前元素不等於 k，則滿足終止條件跳至 Exit。" },
      { line: "addi $s3, $s3, 1", explain: "索引計數器遞增 1。" },
      { line: "j Loop", explain: "無條件跳回 Loop 開頭。" }
    ],
    pitfalls: "逆向轉 C 時，注意 `sll` 乘 4 代表存取的是整數（int）陣列；`bne` 代表原 C 程式的迴圈維持條件是 `==`（相等）。",
    hint: "看見 sll $t1, $s3, 2 配 add 就是陣列索引定址 save[i]；bne 意味著 while (save[i] == k)。"
  },
  {
    id: "trans_07",
    title: "題型 07：帶步進計數器之 MIPS 迴圈（對齊作業 Q7）【🔥 作業一 Q7 必考真題】",
    category: "迴圈控制結構",
    direction: "MIPS -> C",
    level: "中等",
    description: "作業 1 第 7 題全真考題：分析包含 slt、beq 與計數器的 MIPS 組合語言並逆向還原為 C 語言。",
    cCode: `// 暫存器配置：$s2 對應變數 B, $t1 對應變數 i, $t2 對應暫存 temp
// 假設已停用延遲分支 (Delayed Branching Disabled)
while (i > 0) {
    i--;
    B += 2;
}`,
    mipsCode: `LOOP: slt  $t2, $0, $t1     # 若 0 < i ($t1 > 0)，則 $t2 = 1；否則 $t2 = 0
      beq  $t2, $0, DONE    # 若 $t2 == 0 (即 i <= 0)，跳出迴圈至 DONE
      addi $t1, $t1, -1     # i = i - 1
      addi $s2, $s2, 2      # B = B + 2
      j    LOOP             # 跳回開頭
DONE:`,
    lineByLine: [
      { line: "slt $t2, $0, $t1", explain: "判斷 0 < $t1，等價於檢查 $t1 > 0。若成立 $t2=1，否則 0。" },
      { line: "beq $t2, $0, DONE", explain: "若 $t2 為 0 代表條件不滿足，退出迴圈。" },
      { line: "addi $t1, $t1, -1", explain: "計數器 $t1 減 1。" },
      { line: "addi $s2, $s2, 2", explain: "累加器 $s2 每次迭代加 2。" },
      { line: "j LOOP", explain: "跳回 LOOP 開頭重新檢查。" }
    ],
    pitfalls: "考題常見提問：若 $t1 初始為 10，結束時 $s2 之值為 20；動態指令總數為 5*N + 2（包含最後一次退出檢查的 2 道指令）。",
    hint: "slt $t2, $0, $t1 表示 0 < i；beq $t2, $0 代表 i <= 0 時結束；迴圈主體為 i-- 與 B += 2。"
  },
  {
    id: "trans_08",
    title: "題型 08：記憶體指標步進累加迴圈（對齊作業 Q8）【🔥 作業一 Q8 必考真題】",
    category: "記憶體定址與陣列",
    direction: "MIPS -> C",
    level: "中等",
    description: "作業 1 第 8 題全真考題：利用指標不斷加 4 遍歷 100 個元素陣列之累加迴圈。",
    cCode: `// 暫存器配置：$t1 對應整數 i, $s2 對應 result, $s0 對應整數陣列 MemArray 之指標
// 注意題目規定保留 result 的初始值，不初始化為 0
for (i = 0; i < 100; i++) {
    result += MemArray[i]; // 或寫為 result += *MemArray; MemArray++;
}`,
    mipsCode: `      addi $t1, $0, 0       # i = 0
LOOP: lw   $s1, 0($s0)      # $s1 = *MemArray
      add  $s2, $s2, $s1    # result = result + $s1
      addi $s0, $s0, 4      # MemArray++ (指標向前移動 4 bytes)
      addi $t1, $t1, 1      # i = i + 1
      slti $t2, $t1, 100    # 檢查 i < 100 ? (成立則 $t2 = 1)
      bne  $t2, $0, LOOP    # 若 $t2 != 0 則繼續迴圈`,
    lineByLine: [
      { line: "addi $t1, $0, 0", explain: "計數器初始化 i = 0。" },
      { line: "lw $s1, 0($s0)", explain: "載入當前指標指向的陣列元素值。" },
      { line: "add $s2, $s2, $s1", explain: "累加至 result ($s2)。" },
      { line: "addi $s0, $s0, 4", explain: "關鍵：基底暫存器 $s0 每次加 4，代表指標依序巡覽下一個整數。" },
      { line: "slti $t2, $t1, 100", explain: "檢查迴圈上限 100。" },
      { line: "bne $t2, $0, LOOP", explain: "條件成立跳回 LOOP。" }
    ],
    pitfalls: "切記題目要求「Preserve initial value of result」，C 語言不可寫 `result = 0;`；且陣列巡覽長度為 100。",
    hint: "addi $s0, $s0, 4 意味著指標前移；slti ..., 100 與 bne 代表 for (i=0; i<100; i++)。"
  },
  {
    id: "trans_09",
    title: "題型 09：跨步乘法陣列索引二重迴圈（對齊作業 Q9）【🔥 作業一 Q9 必考真題】",
    category: "記憶體定址與陣列",
    direction: "C -> MIPS",
    level: "挑戰",
    description: "作業 1 第 9 題全真考題：包含 D[4*j] 跨步索引之二重巢狀迴圈轉譯為最精簡 MIPS 組合語言。",
    cCode: `// 暫存器配置：a 在 $s0, b 在 $s1, D 基底位址在 $s2, i 在 $t0, j 在 $t1
// 保持 $s0, $s1, $s2 數值不變
for (i = 0; i < a; i++) {
    for (j = 0; j < b; j++) {
        D[4 * j] = i + j;
    }
}`,
    mipsCode: `      add  $t0, $zero, $zero # i = 0
LoopI:slt  $t2, $t0, $s0     # 檢查 i < a ?
      beq  $t2, $zero, ExitI # 若 i >= a 退出外層迴圈
      add  $t1, $zero, $zero # j = 0 (內層計數器重置)
LoopJ:slt  $t2, $t1, $s1     # 檢查 j < b ?
      beq  $t2, $zero, ExitJ # 若 j >= b 退出內層迴圈
      
      # 計算 D[4*j] 位址：位元組偏移量 = (4 * j) * 4 bytes = 16 * j
      sll  $t2, $t1, 4       # $t2 = j << 4 = 16 * j
      add  $t2, $s2, $t2     # $t2 = &D[4*j]
      
      add  $t3, $t0, $t1     # $t3 = i + j
      sw   $t3, 0($t2)       # D[4*j] = i + j
      
      addi $t1, $t1, 1       # j++
      j    LoopJ
ExitJ:addi $t0, $t0, 1       # i++
      j    LoopI
ExitI:`,
    lineByLine: [
      { line: "add $t0, $zero, $zero", explain: "外層迴圈變數 i 初始化為 0。" },
      { line: "slt $t2, $t0, $s0", explain: "外層條件測試 i < a。" },
      { line: "add $t1, $zero, $zero", explain: "至關重要：每次進入內層迴圈必須重置 j = 0！" },
      { line: "sll $t2, $t1, 4", explain: "核心考點：D[4*j] 的元素索引為 4*j，每個整數 4 bytes，位元組位移為 16*j，故左移 4 位元！" },
      { line: "sw $t3, 0($t2)", explain: "將 i + j 儲存至 D[4*j] 記憶體位置。" },
      { line: "addi $t1, $t1, 1 / j LoopJ", explain: "內層步進並跳回。" },
      { line: "addi $t0, $t0, 1 / j LoopI", explain: "外層步進並跳回。" }
    ],
    pitfalls: "超級大陷阱：D[4*j] 的位元組偏移量是 16*j (sll 4)，絕非 4*j (sll 2)！且外層迴圈每次開始都必須重新將 j 初始化為 0。",
    hint: "注意 D[4*j] 的記憶體偏移量是 4 * 4 * j = 16 * j，使用 sll $t2, $t1, 4 運算。"
  },
  {
    id: "trans_10",
    title: "題型 10：Switch-Case 分支跳躍表（Jump Table 與 jr 定址）【🔥 講義經典大題】",
    category: "條件分支與跳躍",
    direction: "C -> MIPS",
    level: "中等",
    description: "投影片第 73 頁：編譯器將連續的 switch-case 語法轉化為位址跳躍表（Jump Table），利用 jr $t2 實現 O(1) 分支跳躍。",
    cCode: `// 假設變數 k 在 $s0, f 在 $s1, jumpTable 基底位址在 $t4
switch (k) {
    case 0: f = f + 1; break;
    case 1: f = f + 2; break;
    case 2: f = f + 3; break;
    default: break;
}`,
    mipsCode: `      sltiu $t0, $s0, 3     # 檢查 0 <= k < 3 (無號數邊界檢查)
      beq   $t0, $zero, Exit# 若超出範圍則跳至 default (Exit)
      sll   $t1, $s0, 2     # $t1 = k * 4 (位址偏移量)
      add   $t2, $t4, $t1   # $t2 = &jumpTable[k]
      lw    $t3, 0($t2)     # $t3 = jumpTable[k] (目標標籤位址)
      jr    $t3             # 間接跳轉至對應 Case 標籤
L0:   addi  $s1, $s1, 1     # Case 0: f = f + 1
      j     Exit
L1:   addi  $s1, $s1, 2     # Case 1: f = f + 2
      j     Exit
L2:   addi  $s1, $s1, 3     # Case 2: f = f + 3
      j     Exit
Exit:`,
    lineByLine: [
      { line: "sltiu $t0, $s0, 3", explain: "技巧：使用 sltiu 能同時檢查 k < 0 與 k >= 3（負數在無號數下會變成極大值）。" },
      { line: "sll $t1, $s0, 2", explain: "跳躍表存放的是 32 位元指標位址，每項佔 4 bytes，故乘 4。" },
      { line: "lw $t3, 0($t2)", explain: "自記憶體載入該分支對應的程式碼位址。" },
      { line: "jr $t3", explain: "暫存器跳躍（Jump Register），直接跳轉到 L0, L1 或 L2。" }
    ],
    pitfalls: "忘記在跳躍前檢查 k 的合法範圍；或忘記跳躍表中的每一項位址佔 4 個位元組。",
    hint: "先用 sltiu 進行範圍檢測，載入跳躍表中的標籤位址後使用 jr 進行間接跳轉。"
  },
  {
    id: "trans_11",
    title: "題型 11：陣列走訪與極值搜尋條件更新（MIPS 逆向轉 C）【🔥 經典逆向分析題】",
    category: "記憶體定址與陣列",
    direction: "MIPS -> C",
    level: "中等",
    description: "分析巡覽整數陣列尋找最大值（Find Maximum）並儲存的典型組合語言結構。",
    cCode: `// 暫存器配置：$s0 對應陣列 A 基底位址, $s1 對應變數 n, $s2 對應 max, $t0 對應 i
max = A[0];
for (i = 1; i < n; i++) {
    if (A[i] > max) {
        max = A[i];
    }
}`,
    mipsCode: `      lw   $s2, 0($s0)      # max = A[0]
      addi $t0, $zero, 1    # i = 1
Loop: slt  $t1, $t0, $s1    # 檢查 i < n ?
      beq  $t1, $zero, Done # 若 i >= n 則完成
      sll  $t2, $t0, 2      # $t2 = i * 4
      add  $t3, $s0, $t2    # $t3 = &A[i]
      lw   $t4, 0($t3)      # $t4 = A[i]
      slt  $t5, $s2, $t4    # 檢查 max < A[i] (即 A[i] > max)
      beq  $t5, $zero, Skip # 若非 A[i] > max 則跳過更新
      move $s2, $t4         # max = A[i]
Skip: addi $t0, $t0, 1      # i++
      j    Loop
Done:`,
    lineByLine: [
      { line: "lw $s2, 0($s0)", explain: "先將 A[0] 作為 max 的初始基準值。" },
      { line: "addi $t0, $zero, 1", explain: "計數器從 i = 1 開始迴圈。" },
      { line: "slt $t5, $s2, $t4", explain: "比較 max 與 A[i]。若 max < A[i] 則 $t5 = 1。" },
      { line: "beq $t5, $zero, Skip", explain: "條件不成立則跳過更新步驟。" },
      { line: "move $s2, $t4", explain: "更新最大值暫存器 $s2。" }
    ],
    pitfalls: "逆向轉 C 時，需留意迴圈起始值為 1 而非 0，以及 slt 的兩運算元先後關係。",
    hint: "關注 slt $t5, $s2, $t4 與 move $s2, $t4 的語意，判定此為搜尋極大值的邏輯。"
  },
  {
    id: "trans_12",
    title: "題型 12：葉程序（Leaf Procedure）呼叫與暫存器保護",
    category: "程序呼叫與堆疊",
    direction: "C -> MIPS",
    level: "中等",
    description: "葉程序（不呼叫其他函式）中，若使用到 Callee-saved 暫存器（$s0），必須在堆疊備份與還原。",
    cCode: `// 函式引數 g, h, i, j 位於 $a0, $a1, $a2, $a3；回傳值放於 $v0
// 區域變數 f 分配於 $s0
int leaf_example(int g, int h, int i, int j) {
    int f;
    f = (g + h) - (i + j);
    return f;
}`,
    mipsCode: `leaf_example:
      addi $sp, $sp, -4     # 在堆疊配置 1 個 Word (4 bytes) 空間
      sw   $s0, 0($sp)      # 備份舊的 $s0 數值至堆疊
      
      add  $t0, $a0, $a1     # $t0 = g + h
      add  $t1, $a2, $a3     # $t1 = i + j
      sub  $s0, $t0, $t1     # f = $t0 - $t1
      
      add  $v0, $s0, $zero  # 將回傳值存入約定暫存器 $v0 (或 move $v0, $s0)
      
      lw   $s0, 0($sp)      # 從堆疊還原 $s0 原始數值
      addi $sp, $sp, 4      # 釋放堆疊空間
      jr   $ra              # 返回呼叫端`,
    lineByLine: [
      { line: "addi $sp, $sp, -4", explain: "堆疊指標向低位址生長，減 4 代表推入 1 個 Word。" },
      { line: "sw $s0, 0($sp)", explain: "遵從 Callee-saved 約定，儲存被呼叫者保護暫存器。" },
      { line: "add $v0, $s0, $zero", explain: "將計算出的區域變數 f 賦值給回傳值專用暫存器 $v0。" },
      { line: "lw $s0, 0($sp)", explain: "還原呼叫端的 $s0 原值。" },
      { line: "addi $sp, $sp, 4", explain: "堆疊指標彈回，恢復呼叫前狀態。" },
      { line: "jr $ra", explain: "利用暫存器 $ra 跳回呼叫端指令。" }
    ],
    pitfalls: "葉程序若僅使用暫時暫存器 ($t0-$t9)，完全不需要操作堆疊 ($sp)；但一旦動用 $s0-$s7，就必須嚴格備份與還原。",
    hint: "使用 Callee-saved 暫存器 $s0 前後必須以 addi $sp, $sp, -4 / sw 及 lw / addi $sp, $sp, 4 包覆。"
  },
  {
    id: "trans_13",
    title: "題型 13：指標巡覽陣列 vs 索引定址之效能最佳化",
    category: "記憶體定址與陣列",
    direction: "C -> MIPS",
    level: "中等",
    description: "投影片第 142–145 頁：利用指標直接遞增，消除迴圈中重複計算陣列位移的指令開銷。",
    cCode: `// 陣列清零函式：以指標方式改寫
// array 位址在 $a0, size 在 $a1
void clear(int *array, int size) {
    int *p;
    for (p = &array[0]; p < &array[size]; p = p + 1)
        *p = 0;
}`,
    mipsCode: `clear:
      move $t0, $a0         # p = &array[0] (指標初始指向陣列頭)
      sll  $t1, $a1, 2      # $t1 = size * 4 (位元組長度)
      add  $t2, $a0, $t1     # $t2 = &array[size] (終止邊界位址)
Loop: sltu $t3, $t0, $t2     # p < &array[size] ? (使用無號比較位址)
      beq  $t3, $zero, Exit # 若已達邊界則跳出
      sw   $zero, 0($t0)    # *p = 0
      addi $t0, $t0, 4      # p = p + 1 (指標前進 4 bytes)
      j    Loop
Exit: jr   $ra`,
    lineByLine: [
      { line: "sll $t1, $a1, 2", explain: "在迴圈外預先計算總位元組大小 (size * 4)。" },
      { line: "add $t2, $a0, $t1", explain: "求出終止位址 &array[size]，避免在迴圈內反覆運算。" },
      { line: "sltu $t3, $t0, $t2", explain: "記憶體位址為正數，應當使用無號比較 sltu。" },
      { line: "sw $zero, 0($t0)", explain: "直接對指標解參考寫入 0。" },
      { line: "addi $t0, $t0, 4", explain: "指標步進 4 bytes，每次迭代省去 sll 與 add 兩道定址指令。" }
    ],
    pitfalls: "比較陣列索引寫法與指標寫法：指標寫法將位址位移運算提到迴圈外部，使迴圈體每圈減少 2 條指令，能顯著降低動態指令數。",
    hint: "在進入迴圈前先將終止邊界位址算好，迴圈內部只保留 sw 與 addi $t0, $t0, 4。"
  },
  {
    id: "trans_14",
    title: "題型 14：字串複製函式（strcpy）與位元組指標步進【🔥 講義經典題】",
    category: "程序呼叫與堆疊",
    direction: "C -> MIPS",
    level: "中等",
    description: "投影片第 87 頁：處理 1-byte 循序字串之複製函式，展示 lb 與 sb 指令之應用。",
    cCode: `// 引數 x 位址在 $a0, 引數 y 位址在 $a1
void strcpy(char x[], char y[]) {
    int i;
    i = 0;
    while ((x[i] = y[i]) != '\\0')
        i += 1;
}`,
    mipsCode: `strcpy:
      addi $sp, $sp, -4     # 配置堆疊空間保護 $s0
      sw   $s0, 0($sp)      # 儲存舊 $s0 (變數 i)
      add  $s0, $zero, $zero# i = 0
L1:   add  $t1, $s0, $a1    # $t1 = &y[i] (字元每項 1 byte，不需 sll)
      lb   $t2, 0($t1)      # $t2 = y[i]
      add  $t3, $s0, $a0    # $t3 = &x[i]
      sb   $t2, 0($t3)      # x[i] = y[i]
      beq  $t2, $zero, L2   # 若複製的字元為 '\\0' (值為 0)，跳出迴圈
      addi $s0, $s0, 1      # i = i + 1
      j    L1
L2:   lw   $s0, 0($sp)      # 還原 $s0
      addi $sp, $sp, 4      # 釋放堆疊
      jr   $ra              # 返回呼叫端`,
    lineByLine: [
      { line: "lb $t2, 0($t1)", explain: "字元為 8 位元（1 Byte），故使用載入位元組指令 lb。" },
      { line: "sb $t2, 0($t3)", explain: "儲存單一位元組指令 sb。" },
      { line: "add $t1, $s0, $a1", explain: "位元組大小為 1，因此索引位移即為 i，不需要左移 2 位元！" },
      { line: "beq $t2, $zero, L2", explain: "字串終止符號 '\\0' 的 ASCII 數值為 0。" }
    ],
    pitfalls: "重大陷阱：`char` 陣列每個元素是 1 byte，偏移量就是 $i$，千萬不要乘以 4！且必須使用 `lb`/`sb` 而非 `lw`/`sw`。",
    hint: "char 型態大小為 1 byte，使用 lb / sb 存取，位址偏移量直接為 i。"
  },
  {
    id: "trans_15",
    title: "題型 15：單遞迴程序：階乘函式（Factorial）與 $ra 堆疊保護",
    category: "程序呼叫與堆疊",
    direction: "C -> MIPS",
    level: "挑戰",
    description: "投影片第 120 頁遞迴階乘函式：非葉函式呼叫 jal 會覆寫 $ra，必須在堆疊妥善儲存傳入引數與返回位址。",
    cCode: `// 引數 n 位於 $a0，回傳結果放於 $v0
int fact(int n) {
    if (n < 1)
        return 1;
    else
        return n * fact(n - 1);
}`,
    mipsCode: `fact:
      addi $sp, $sp, -8     # 在堆疊配置 2 個 Word (8 bytes)
      sw   $ra, 4($sp)      # 儲存當前函式的返回位址 $ra
      sw   $a0, 0($sp)      # 儲存當前引數 n
      
      slti $t0, $a0, 1      # 測試 n < 1
      beq  $t0, $zero, L1   # 若 n >= 1 則跳轉至 L1 (遞迴分支)
      
      addi $v0, $zero, 1    # Base case: 回傳 1
      addi $sp, $sp, 8      # 釋放堆疊
      jr   $ra              # 返回
      
L1:   addi $a0, $a0, -1     # 引數設為 n - 1
      jal  fact             # 遞迴呼叫 fact(n - 1)，結果回傳在 $v0
      
      lw   $a0, 0($sp)      # 還原先前儲存的引數 n
      lw   $ra, 4($sp)      # 還原先前儲存的返回位址 $ra
      addi $sp, $sp, 8      # 釋放堆疊空間
      
      mul  $v0, $a0, $v0     # $v0 = n * fact(n - 1)
      jr   $ra              # 返回呼叫端`,
    lineByLine: [
      { line: "addi $sp, $sp, -8", explain: "堆疊推入 8 bytes，準備保存 $ra 與 $a0。" },
      { line: "sw $ra, 4($sp)", explain: "至關重要：因為後續會執行 jal fact 覆蓋 $ra，故必須儲存。" },
      { line: "sw $a0, 0($sp)", explain: "保存當前層級的引數 n，待遞迴回溯時相乘。" },
      { line: "jal fact", explain: "跳轉並連結至遞迴子函式。" },
      { line: "lw $a0, 0($sp)", explain: "遞迴返回後，將本層級之原始 n 值從堆疊取回。" },
      { line: "mul $v0, $a0, $v0", explain: "執行相乘：$v0 = n * fact(n - 1)。" }
    ],
    pitfalls: "若忘記將 $ra 存入堆疊，執行 jal fact 後上一層的返回位址將永久遺失，造成程式陷入無限跳躍當機。",
    hint: "非葉函式必須保存 $ra；遞迴呼叫前後分別進行堆疊推入 (push) 與彈出 (pop)。"
  },
  {
    id: "trans_16",
    title: "題型 16：雙遞迴程序：費氏數列（Recursive Fibonacci）與堆疊管理【🌟 作業二核心題型】",
    category: "程序呼叫與堆疊",
    direction: "C -> MIPS",
    level: "挑戰",
    description: "對齊作業 Assignment 2 核心題目：二重遞迴呼叫 fib(n-1) 與 fib(n-2)，必須在堆疊中妥善保護 $ra、$s0 及引數值。",
    cCode: `// Assignment 2 規格：F(0)=0, F(1)=1, F(n)=F(n-1)+F(n-2)
// 引數 n 存於 $a0，回傳結果放於 $v0
int fib(int n) {
    if (n == 0) return 0;
    if (n == 1) return 1;
    return fib(n - 1) + fib(n - 2);
}`,
    mipsCode: `fib:
      addi $sp, $sp, -12    # 配置 12 bytes 堆疊空間 (3 個 Word)
      sw   $ra, 8($sp)      # 儲存返回位址 $ra
      sw   $s0, 4($sp)      # 儲存被保護暫存器 $s0
      sw   $a0, 0($sp)      # 儲存當前引數 n
      
      # Base case 1: if (n == 0) return 0;
      beq  $a0, $zero, Base0
      
      # Base case 2: if (n == 1) return 1;
      addi $t0, $zero, 1
      beq  $a0, $t0, Base1
      
      # Recursive Case: fib(n - 1)
      addi $a0, $a0, -1     # 引數設為 n - 1
      jal  fib              # 呼叫 fib(n - 1)
      move $s0, $v0         # 關鍵：將第 1 次遞迴結果暫存於 $s0
      
      # Recursive Case: fib(n - 2)
      lw   $a0, 0($sp)      # 自堆疊還原本層級之原始引數 n
      addi $a0, $a0, -2     # 引數設為 n - 2
      jal  fib              # 呼叫 fib(n - 2)，回傳值於 $v0
      
      # 合併結果: fib(n - 1) + fib(n - 2)
      add  $v0, $s0, $v0     # $v0 = fib(n - 1) + fib(n - 2)
      j    Return
      
Base0:move $v0, $zero       # 回傳 0
      j    Return
Base1:addi $v0, $zero, 1    # 回傳 1

Return:
      lw   $a0, 0($sp)      # 還原 $a0
      lw   $s0, 4($sp)      # 還原呼叫端之 $s0
      lw   $ra, 8($sp)      # 還原返回位址 $ra
      addi $sp, $sp, 12     # 釋放堆疊
      jr   $ra              # 返回呼叫端`,
    lineByLine: [
      { line: "addi $sp, $sp, -12", explain: "配置 3 個欄位：分別儲存 $ra, $s0 與 $a0。" },
      { line: "jal fib (第一次呼叫)", explain: "執行 fib(n - 1)，結果放置於 $v0。" },
      { line: "move $s0, $v0", explain: "核心關鍵：第二次呼叫 fib(n - 2) 會覆蓋 $v0，故必須將第一次結果安全移至 $s0 保存！" },
      { line: "lw $a0, 0($sp)", explain: "還原原始 n，再減 2 作為第二次遞迴的引數。" },
      { line: "jal fib (第二次呼叫)", explain: "執行 fib(n - 2)，結果直接放置於 $v0。" },
      { line: "add $v0, $s0, $v0", explain: "加總兩次遞迴結果：$s0 (fib(n-1)) + $v0 (fib(n-2))。" },
      { line: "lw $s0, 4($sp) / lw $ra, 8($sp)", explain: "還原暫存器與返回位址，嚴格遵守 Callee-saved Calling Convention。" }
    ],
    pitfalls: "作業二最常失分處：在第二次呼叫 `jal fib` 時，未妥善保護第一次呼叫的傳回值，導致第一次結果被第二次的子呼叫覆寫；或是未遵守 Callee-saved 原則未儲存 `$s0`。",
    hint: "雙遞迴最容易踩坑的是 $v0 會被覆寫；務必使用 $s0 保存第一次結果，並在堆疊中備份 $s0 與 $ra。"
  },
  {
    id: "trans_17",
    title: "題型 17：非葉呼叫程序：陣列元素交換（Swap Procedure）",
    category: "程序呼叫與堆疊",
    direction: "C -> MIPS",
    level: "中等",
    description: "投影片第 132 頁經典葉程序範例：交換整數陣列 v[k] 與 v[k+1] 元素之內容。",
    cCode: `// 陣列基底位址 v 位於 $a0, 索引 k 位於 $a1
void swap(int v[], int k) {
    int temp;
    temp = v[k];
    v[k] = v[k + 1];
    v[k + 1] = temp;
}`,
    mipsCode: `swap:
      sll $t1, $a1, 2       # $t1 = k * 4
      add $t1, $a0, $t1     # $t1 = &v[k]
      
      lw  $t0, 0($t1)       # temp ($t0) = v[k]
      lw  $t2, 4($t1)       # $t2 = v[k + 1]
      
      sw  $t2, 0($t1)       # v[k] = v[k + 1]
      sw  $t0, 4($t1)       # v[k + 1] = temp
      
      jr  $ra               # 返回呼叫端`,
    lineByLine: [
      { line: "sll $t1, $a1, 2", explain: "計算元素索引 k 之位元組偏移量。" },
      { line: "add $t1, $a0, $t1", explain: "求得 v[k] 之記憶體絕對位址。" },
      { line: "lw $t0, 0($t1)", explain: "載入 v[k] 至暫存暫存器 $t0。" },
      { line: "lw $t2, 4($t1)", explain: "載入 v[k+1]（利用基底位址 + 4 位移量，省去一次加法指令）。" },
      { line: "sw $t2, 0($t1)", explain: "將 v[k+1] 寫入 v[k] 所在位置。" },
      { line: "sw $t0, 4($t1)", explain: "將 temp 寫入 v[k+1] 所在位置。" }
    ],
    pitfalls: "存取 v[k+1] 時不需要重新計算位址，直接在 lw/sw 指令中使用 offset 為 4 即可，此為效能最佳化關鍵技巧。",
    hint: "善用 4($t1) 直接存取相鄰的下一個 Word 元素，不需重新計算基底位址。"
  },
  {
    id: "trans_18",
    title: "題型 18：非葉程序與巢狀呼叫：氣泡排序（Bubble Sort Procedure）【🔥 期中壓軸大題】",
    category: "程序呼叫與堆疊",
    direction: "C -> MIPS",
    level: "挑戰",
    description: "投影片第 134–137 頁期中考壓軸大題：非葉函式內部呼叫 swap，需配置 20 位元組堆疊保存 $ra 與 4 個 $s 暫存器。",
    cCode: `// 陣列位址在 $a0, 大小 n 在 $a1
void sort(int v[], int n) {
    int i, j;
    for (i = 0; i < n; i += 1) {
        for (j = i - 1; j >= 0 && v[j] > v[j + 1]; j -= 1) {
            swap(v, j);
        }
    }
}`,
    mipsCode: `sort:
      addi $sp, $sp, -20    # 配置 20 bytes 堆疊空間 (5 個 Word)
      sw   $ra, 16($sp)     # 保存返回位址
      sw   $s3, 12($sp)     # 保存 $s3 (變數 j)
      sw   $s2, 8($sp)      # 保存 $s2 (變數 i)
      sw   $s1, 4($sp)      # 保存 $s1 (變數 n)
      sw   $s0, 0($sp)      # 保存 $s0 (陣列位址 v)
      
      move $s0, $a0         # 將引數保存至 $s0, $s1
      move $s1, $a1
      move $s2, $zero       # i = 0
for1: slt  $t0, $s2, $s1     # i < n ?
      beq  $t0, $zero, exit1
      addi $s3, $s2, -1     # j = i - 1
for2: slti $t0, $s3, 0      # j < 0 ?
      bne  $t0, $zero, exit2
      sll  $t1, $s3, 2      # $t1 = j * 4
      add  $t2, $s0, $t1    # $t2 = &v[j]
      lw   $t3, 0($t2)      # $t3 = v[j]
      lw   $t4, 4($t2)      # $t4 = v[j + 1]
      slt  $t0, $t4, $t3    # v[j + 1] < v[j] (即 v[j] > v[j+1])
      beq  $t0, $zero, exit2
      
      move $a0, $s0         # 傳入引數 v
      move $a1, $s3         # 傳入引數 j
      jal  swap             # 呼叫 swap(v, j)
      
      addi $s3, $s3, -1     # j -= 1
      j    for2
exit2:addi $s2, $s2, 1      # i += 1
      j    for1
exit1:lw   $s0, 0($sp)      # 還原暫存器
      lw   $s1, 4($sp)
      lw   $s2, 8($sp)
      lw   $s3, 12($sp)
      lw   $ra, 16($sp)
      addi $sp, $sp, 20     # 釋放堆疊空間
      jr   $ra`,
    lineByLine: [
      { line: "addi $sp, $sp, -20", explain: "非葉函式呼叫需配置 5 個暫存器空間：$ra, $s0, $s1, $s2, $s3。" },
      { line: "move $s0, $a0 / move $s1, $a1", explain: "呼叫 swap 會覆蓋 $a0, $a1，因此必須先複製到 Callee-saved 暫存器。" },
      { line: "jal swap", explain: "跳轉呼叫 swap 子程序。" },
      { line: "lw $ra, 16($sp)", explain: "還原原始呼叫端返回位址。" }
    ],
    pitfalls: "呼叫 swap 前若未將原始的陣列基底與大小保存至 $s 暫存器，在呼叫 swap 時 $a0 與 $a1 將被覆寫而使外層迴圈失控崩潰。",
    hint: "非葉函式呼叫 swap 會改寫 $a0, $a1 與 $ra，因此堆疊必須同時保存這三者以及迴圈計數器 $s2, $s3。"
  }
];
