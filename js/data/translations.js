// 12 大經典 C/C++ 與 MIPS 雙向轉譯題庫
// 涵蓋算術、陣列定址、分支、迴圈、動態指令計數、堆疊管理與遞迴函式

window.CO_DATA = window.CO_DATA || { chapters: [], translations: [] };

window.CO_DATA.translations = [
  {
    id: "trans_01",
    title: "題型 01：基本算術運算式與暫時暫存器配置",
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
    pitfalls: "運算式不能直接在單一指令內完成；必須先使用暫存暫存器 ($t0, $t1) 保留中間子運算式之值，以維持運算子優先順序。"
  },
  {
    id: "trans_02",
    title: "題型 02：陣列常數索引存取與 Word 對齊偏移量",
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
    pitfalls: "記憶體定址常犯錯誤是直接寫 `lw $t0, 8($s3)`。MIPS 採 Byte Addressing，整數一個 Word 為 4 Bytes，索引必須乘以 4。"
  },
  {
    id: "trans_03",
    title: "題型 03：If-Then-Else 條件分支與分支反轉邏輯",
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
      { line: "bne $s3, $s4, Else", explain: "測試條件 i == j。在硬體層使用反向邏輯 bne，不相等時直接跳至 Else。" },
      { line: "add $s0, $s1, $s2", explain: "條件成立（i == j）時執行的 Then 區塊。" },
      { line: "j Exit", explain: "關鍵無條件跳躍：防止程式循序執行而繼續掉入 Else 區塊。" },
      { line: "Else: sub $s0, $s1, $s2", explain: "條件不成立時執行的 Else 區塊。" }
    ],
    pitfalls: "初學者常漏寫 `j Exit`，導致執行完 Then 區塊後又接著覆寫 Else 區塊的數值。"
  },
  {
    id: "trans_04",
    title: "題型 04：不等式大小比較與 slt 指令搭配",
    direction: "C -> MIPS",
    level: "基礎至中等",
    description: "MIPS 硬體不具備 blt (Branch on Less Than) 原生指令，需由 slt 與 beq/bne 組合實現。",
    cCode: `// 變數 a, b, c 分別位於 $s0, $s1, $s2
if (a < b)
    c = a + 1;
else
    c = b - 1;`,
    mipsCode: `      slt  $t0, $s0, $s1    # 若 a < b 則 $t0 = 1；否則 $t0 = 0
      beq  $t0, $zero, Else # 若 $t0 == 0 (即 a >= b)，跳轉至 Else
      addi $s2, $s0, 1      # Then 區塊: c = a + 1
      j    Exit
Else: addi $s2, $s1, -1     # Else 區塊: c = b - 1
Exit:`,
    lineByLine: [
      { line: "slt $t0, $s0, $s1", explain: "執行有號整數比較。若 $s0 < $s1，則暫存器 $t0 設為 1，否則設為 0。" },
      { line: "beq $t0, $zero, Else", explain: "若 $t0 為 0，表示條件不成立，跳轉至 Else。" },
      { line: "addi $s2, $s0, 1", explain: "條件成立時，執行 c = a + 1。" },
      { line: "j Exit", explain: "無條件跳轉至結尾標籤。" },
      { line: "Else: addi $s2, $s1, -1", explain: "條件不成立時，執行 c = b - 1。" }
    ],
    pitfalls: "在寫組合語言時若誤用虛擬指令 `blt $s0, $s1, Target`，組譯器實際上就是自動展開為此兩行指令。"
  },
  {
    id: "trans_05",
    title: "題型 05：While 迴圈與陣列動態尋訪（MIPS 逆向轉 C）",
    direction: "MIPS -> C",
    level: "中等",
    description: "分析經典教材 While 迴圈：每次迭代中計算動態偏移量並比對陣列內容。",
    cCode: `// 暫存器映射：i 在 $s3, k 在 $s5, 陣列 save 的基底位址在 $s6
while (save[i] == k)
    i += 1;`,
    mipsCode: `Loop: sll  $t1, $s3, 2     # $t1 = i * 4 (計算位元組偏移量)
      add  $t1, $t1, $s6    # $t1 = save 的基底位址 + 位移量 (&save[i])
      lw   $t0, 0($t1)      # $t0 = save[i]
      bne  $t0, $s5, Exit   # 若 save[i] != k 則跳出迴圈
      addi $s3, $s3, 1      # i = i + 1
      j    Loop             # 跳回迴圈頂端
Exit:`,
    lineByLine: [
      { line: "sll $t1, $s3, 2", explain: "將索引 i 左移 2 位元（即乘以 4），計算對應的 Byte Offset。" },
      { line: "add $t1, $t1, $s6", explain: "將基底位址 $s6 與偏移量相加，求得 save[i] 的實體記憶體位址。" },
      { line: "lw $t0, 0($t1)", explain: "自記憶體載入 save[i] 之數值至 $t0。" },
      { line: "bne $t0, $s5, Exit", explain: "若 save[i] 不等於 k，滿足結束條件，跳出至 Exit。" },
      { line: "addi $s3, $s3, 1", explain: "迴圈體內容：變數 i 遞增 1。" },
      { line: "j Loop", explain: "跳回開頭進行下一次迴圈判定。" }
    ],
    pitfalls: "反組譯時，需從 `sll $t1, $s3, 2` 與 `add $t1, $t1, $s6` 辨識出這是在求陣列 `save[i]` 的位址。"
  },
  {
    id: "trans_06",
    title: "題型 06：For 迴圈陣列元素累加運算",
    direction: "C -> MIPS",
    level: "中等",
    description: "常見考試題型：計數器初始設定、陣列元素逐一載入累加、界限判斷。",
    cCode: `// 假設 sum 在 $s0, i 在 $t0, n 在 $s1, 陣列 A 基底位址在 $s2
sum = 0;
for (i = 0; i < n; i++) {
    sum += A[i];
}`,
    mipsCode: `      addi $s0, $zero, 0    # sum = 0
      addi $t0, $zero, 0    # i = 0
Loop: slt  $t1, $t0, $s1     # 若 i < n 則 $t1 = 1，否則 $t1 = 0
      beq  $t1, $zero, Exit # 若 $t1 == 0 (即 i >= n)，跳出迴圈
      sll  $t2, $t0, 2      # $t2 = i * 4 (位元組偏移量)
      add  $t3, $s2, $t2     # $t3 = &A[i]
      lw   $t4, 0($t3)      # $t4 = A[i]
      add  $s0, $s0, $t4     # sum += A[i]
      addi $t0, $t0, 1      # i++
      j    Loop
Exit:`,
    lineByLine: [
      { line: "addi $s0, $zero, 0", explain: "初始化 sum = 0。" },
      { line: "addi $t0, $zero, 0", explain: "初始化迴圈計數器 i = 0。" },
      { line: "slt $t1, $t0, $s1", explain: "測試條件 i < n。" },
      { line: "beq $t1, $zero, Exit", explain: "當條件為 false 時跳離迴圈。" },
      { line: "sll $t2, $t0, 2", explain: "Word 對齊偏移量轉換 (i << 2)。" },
      { line: "lw $t4, 0($t3)", explain: "載入陣列元素數值。" },
      { line: "add $s0, $s0, $t4", explain: "執行累加運算。" },
      { line: "addi $t0, $t0, 1", explain: "計數器遞增 i++。" }
    ],
    pitfalls: "迴圈初始化 `i = 0` 與 `sum = 0` 必須置於 `Loop:` 標籤之外，否則每次迭代都會重設累加值。"
  },
  {
    id: "trans_07",
    title: "題型 07：帶步進計數器之 MIPS 迴圈（對齊作業 Q7）",
    direction: "MIPS -> C",
    level: "中等",
    description: "逆向反推迴圈之初值、跳轉條件、步進量與動態執行指令次數推導。",
    cCode: `// 暫存器映射：$t1 為整數 i, $s2 為整數 B
// 初始條件：$t1 = 10, $s2 = 0
while (i > 0) {
    i = i - 1;
    B = B + 2;
}
// 執行結束後：$s2 (B) 之最終值為 20`,
    mipsCode: `LOOP: slt  $t2, $0, $t1      # 若 0 < $t1 (即 $t1 > 0) 則 $t2 = 1，否則 $t2 = 0
      beq  $t2, $0, DONE     # 若 $t2 == 0 (即 $t1 <= 0) 則跳轉至 DONE
      addi $t1, $t1, -1      # i = i - 1
      addi $s2, $s2, 2       # B = B + 2
      j    LOOP
DONE:`,
    lineByLine: [
      { line: "slt $t2, $0, $t1", explain: "比較 $0 < $t1，等價於判定 i 是否大於 0。" },
      { line: "beq $t2, $0, DONE", explain: "若 $t2 == 0（i <= 0），跳出迴圈。" },
      { line: "addi $t1, $t1, -1", explain: "計數器遞減 1。" },
      { line: "addi $s2, $s2, 2", explain: "累加變數每次加 2。" },
      { line: "j LOOP", explain: "重複迴圈。" }
    ],
    pitfalls: "若 $t1 初始值為 N ($N \\ge 0$)，完整迴圈執行 N 次（每次 5 個指令），最後一次退出判斷執行 2 個指令（slt, beq），總動態指令數為 5N + 2。"
  },
  {
    id: "trans_08",
    title: "題型 08：記憶體指標步進累加迴圈（對齊作業 Q8）",
    direction: "MIPS -> C",
    level: "中等",
    description: "還原直接操作記憶體指標（每次 +4）的高階語言陣列累加邏輯，並注意變數初始值不變性。",
    cCode: `// 暫存器映射：$t1 為 i, $s2 為 result, $s0 為 MemArray 之基底位址
// 注意：保持 result 初始值不歸零
for (i = 0; i < 100; i++) {
    result += MemArray[i];
}`,
    mipsCode: `      addi $t1, $0, 0       # i = 0
LOOP: lw   $s1, 0($s0)       # 載入當前陣列元素 *ptr
      add  $s2, $s2, $s1     # result += *ptr
      addi $s0, $s0, 4       # ptr++ (記憶體位址前進 4 bytes)
      addi $t1, $t1, 1       # i++
      slti $t2, $t1, 100     # 檢查 i < 100
      bne  $t2, $0, LOOP     # 若 i < 100 則繼續迴圈`,
    lineByLine: [
      { line: "addi $t1, $0, 0", explain: "初始化計數器 i = 0。" },
      { line: "lw $s1, 0($s0)", explain: "以 $s0 為指標載入陣列元素數值。" },
      { line: "add $s2, $s2, $s1", explain: "累加至 result 暫存器。" },
      { line: "addi $s0, $s0, 4", explain: "指標步進 4 bytes，指向下一個 int 元素。" },
      { line: "addi $t1, $t1, 1", explain: "迴圈計數器 i 自增 1。" },
      { line: "slti $t2, $t1, 100", explain: "立即值比較指令：測試 i < 100。" },
      { line: "bne $t2, $0, LOOP", explain: "若條件成立（$t2 == 1 != 0），跳回 LOOP。" }
    ],
    pitfalls: "題目特別規定「Preserve the initial value of result; the given code does not initialize it to zero.」，轉譯為 C 語言時切勿擅自寫 `result = 0;`。"
  },
  {
    id: "trans_09",
    title: "題型 09：跨步乘法陣列索引二重迴圈（對齊作業 Q9）",
    direction: "C -> MIPS",
    level: "中等至挑戰",
    description: "轉譯巢狀迴圈並計算跨步索引 D[4*j] 之位元組位移（左移 4 位元），且最小化指令數。",
    cCode: `// 暫存器映射：a, b, i, j 分別在 $s0, $s1, $t0, $t1；陣列 D 基底位址在 $s2
// 要求：保持 $s0, $s1, $s2 不變，使用最少指令數
for (i = 0; i < a; i++) {
    for (j = 0; j < b; j++) {
        D[4 * j] = i + j;
    }
}`,
    mipsCode: `      addi $t0, $zero, 0    # i = 0
LoopI:slt  $t2, $t0, $s0     # i < a ?
      beq  $t2, $zero, ExitI# 若 i >= a 跳出外層迴圈
      addi $t1, $zero, 0    # j = 0 (進入內層前重設 j)
LoopJ:slt  $t2, $t1, $s1     # j < b ?
      beq  $t2, $zero, NextI# 若 j >= b 結束內層迴圈
      add  $t3, $t0, $t1     # $t3 = i + j
      sll  $t4, $t1, 4      # $t4 = j * 16 (即 (4 * j) * 4 bytes)
      add  $t5, $s2, $t4     # $t5 = &D[4*j]
      sw   $t3, 0($t5)      # D[4*j] = i + j
      addi $t1, $t1, 1      # j++
      j    LoopJ
NextI:addi $t0, $t0, 1      # i++
      j    LoopI
ExitI:`,
    lineByLine: [
      { line: "addi $t0, $zero, 0", explain: "外層迴圈變數 i 初始化為 0。" },
      { line: "addi $t1, $zero, 0", explain: "每次重新進入內層迴圈時，必須重設 j = 0。" },
      { line: "sll $t4, $t1, 4", explain: "核心考點：D[4*j] 的位元組偏移量為 4*j * 4 = 16*j，左移 4 位元（<< 4）即等於乘 16。" },
      { line: "sw $t3, 0($t5)", explain: "將 i + j 儲存至陣列記憶體空間。" }
    ],
    pitfalls: "極易失誤點：以為索引乘 4 直接寫 `sll $t4, $t1, 2`。注意元素本身為 4-byte int，索引為 4*j，所以總位移是 (4*j) * 4 = 16*j，必須左移 4 位元！"
  },
  {
    id: "trans_10",
    title: "題型 10：葉程序（Leaf Procedure）呼叫與堆疊儲存還原",
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
    pitfalls: "葉程序若僅使用暫時暫存器 ($t0-$t9)，則完全不需要操作堆疊 ($sp)；但一旦動用 $s0-$s7，就必須嚴格備份與還原。"
  },
  {
    id: "trans_11",
    title: "題型 11：指標巡覽陣列 vs 索引定址之效能轉譯",
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
    pitfalls: "比較陣列索引寫法與指標寫法：指標寫法將位址位移運算提到迴圈外部，使迴圈體每圈減少 2 條指令，能顯著降低動態指令數。"
  },
  {
    id: "trans_12",
    title: "題型 12：非葉遞迴程序（Recursive Factorial）與 $ra 堆疊保護",
    direction: "C -> MIPS",
    level: "挑戰",
    description: "投影片第 120 頁遞迴階乘函式：非葉函式呼叫 `jal` 會覆寫 `$ra`，必須在堆疊妥善儲存傳入引數與返回位址。",
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
    pitfalls: "若忘記將 `$ra` 存入堆疊，執行 `jal fact` 後上一層的返回位址將永久遺失，造成程式陷入無限跳躍當機。"
  }
];
