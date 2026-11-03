// 作業一與作業二全真變種題庫、指令逐行解構抽測與手寫默寫特訓引擎
// 專為期中考 MIPS 組合語言手寫題、雙遞迴（Fibonacci）、階乘（Factorial）與 HW1 計算題設計

window.CO_ASSIGNMENT_DATA = {

  // =========================================================================
  // 1. MIPS 遞迴核心：指令功能逐行解構題庫（「組合語言哪個指令是幹嘛的」）
  // =========================================================================
  quizBank: [
    {
      id: "q_fib_sp_alloc",
      subroutine: "fib",
      instruction: "addi $sp, $sp, -12",
      question: "在進入 fib 雙遞迴副程式開頭時，執行「addi $sp, $sp, -12」的微架構責任與目的為何？",
      options: [
        "(A) 在堆疊頂端配置 12 位元組（3 個 Word）空間，用以安全保存 $ra、$s0 與引數 $a0",
        "(B) 將程式計數器 PC 向下位移 12 位元組以跳過 Base Case 邊界檢查",
        "(C) 清空暫存器以準備接收遞迴子程序的計算結果",
        "(D) 宣告動態陣列空間以儲存費氏數列前 3 項數值"
      ],
      correctIndex: 0,
      explanation: "MIPS 堆疊由高記憶體位址向低記憶體位址增長，減去 12 即配置 3 個 4-byte 欄位。因 fib 內部會進行雙重遞迴呼叫，必須保護 $ra（防止返回點遺失）、$s0（保存第一次遞迴結果）與 $a0（保留原始引數 n 以便計算 n-2）。"
    },
    {
      id: "q_fib_ra_save",
      subroutine: "fib",
      instruction: "sw $ra, 8($sp)",
      question: "副程式開頭執行「sw $ra, 8($sp)」的核心原因為何？若期中考漏寫會造成何種災難性後果？",
      options: [
        "(A) 避免內部 jal fib 覆寫返回位址；若漏寫，程式執行 jr $ra 時將無法返回呼叫端而陷入死迴圈",
        "(B) 將上一層的計算結果傳遞至堆疊底端；若漏寫將導致數值溢位",
        "(C) 通知作業系統當前行程已進入特權模式；若漏寫將引發硬體中斷",
        "(D) 為了對齊 8 位元組記憶體邊界以加速匯流排傳輸"
      ],
      correctIndex: 0,
      explanation: "Non-leaf 函式必定包含 jal 指令，而 jal 會強制將硬體 PC+4 寫入 $ra。若進入時未將呼叫端的 $ra 存入堆疊，當前 $ra 將被子呼叫覆寫，造成函式結尾執行 jr $ra 時跳回自身內部，產生無窮迴圈（Infinite Loop）。"
    },
    {
      id: "q_fib_s0_save",
      subroutine: "fib",
      instruction: "sw $s0, 4($sp)",
      question: "為何副程式必須備份 $s0（執行「sw $s0, 4($sp)」）？這是遵循 MIPS 哪一項呼叫約定（Calling Convention）？",
      options: [
        "(A) $s0 屬於 Callee-saved 約定，被呼叫端若動用必須負責保存舊值，離開前還原，以防破壞外層呼叫端的變數",
        "(B) $s0 屬於 Caller-saved 約定，呼叫端若要使用必須自行至堆疊讀取",
        "(C) $s0 是硬體旗標暫存器，必須定時備份至記憶體防止掉電遺失",
        "(D) $s0 只能儲存整數型態，推入堆疊是為了將其強制轉型為浮點數"
      ],
      correctIndex: 0,
      explanation: "MIPS ABI 規範 $s0~$s7 為 Callee-saved（被呼叫者保護）。若 fib 函式欲使用 $s0 來暫存第一次遞迴 fib(n-1) 的回傳值，就有義務在開頭將呼叫端原本存於 $s0 的數值備份進堆疊，並在結尾還原。"
    },
    {
      id: "q_fib_a0_save",
      subroutine: "fib",
      instruction: "sw $a0, 0($sp)",
      question: "將傳入參數 n 存入堆疊「sw $a0, 0($sp)」的原因為何？",
      options: [
        "(A) 為了在第一次呼叫 fib(n-1) 返回後，能從堆疊取回原始引數 n，以便正確計算 n-2 傳入第二次子呼叫",
        "(B) 為了讓子呼叫能夠透過堆疊直接讀取全域變數 n",
        "(C) 為了讓作業系統在行程切換時能記錄當前執行的執行緒識別碼",
        "(D) 為了清空 $a0 暫存器，以便接收子遞迴的計算結果"
      ],
      correctIndex: 0,
      explanation: "計算 fib(n-1) 時必須將 $a0 減 1，且子呼叫內部會將 $a0 層層覆寫改動。當第一次子呼叫返回時，$a0 已經不再是當初的 n。若未事先將 n 保存於堆疊，將無法倒回計算 n-2！"
    },
    {
      id: "q_fib_move_s0",
      subroutine: "fib",
      instruction: "move $s0, $v0",
      question: "第一次呼叫「jal fib」返回後，隨即執行「move $s0, $v0」的微架構必要性為何？",
      options: [
        "(A) $v0 是通用回傳值暫存器，若不將 fib(n-1) 結果移至 $s0 保存，後續呼叫 fib(n-2) 會將 $v0 強制覆寫",
        "(B) $v0 無法直接進行 add 加法運算，必須轉入 $s0 方可交由 ALU 處理",
        "(C) 這是為了觸發 MIPS 管線轉發（Forwarding）機制以消除結構相依",
        "(D) 為了將回傳值寫入靜態資料區段（Data Segment）"
      ],
      correctIndex: 0,
      explanation: "雙重遞迴的致命盲點：第一次子呼叫的傳回值在 $v0，但緊接著執行的第二次子呼叫（jal fib）同樣會把傳回值寫入 $v0。若未在第二次呼叫前將第一次的結果安全移至 $s0，第一次的計算結果將永久被第二個子呼叫覆蓋！"
    },
    {
      id: "q_fib_a0_reload",
      subroutine: "fib",
      instruction: "lw $a0, 0($sp)",
      question: "在準備計算 fib(n-2) 之前，執行「lw $a0, 0($sp)」的作用是什麼？期中考漏寫會如何？",
      options: [
        "(A) 自堆疊載回函式剛進入時保存的原始引數 n，以便接續執行 addi $a0, $a0, -2；漏寫將導致參數全毀",
        "(B) 將目前計算的累加和載入 $a0 以便印出至終端螢幕；漏寫會導致輸出為空字串",
        "(C) 檢查堆疊是否發生溢位；漏寫會導致硬體例外捕捉中斷",
        "(D) 將記憶體堆疊釋放 4 位元組以提升快取命中率；漏寫會造成效能下降"
      ],
      correctIndex: 0,
      explanation: "這是期中考批改時抓漏的必查行！剛從 fib(n-1) 返回時，$a0 的值已經是底層 base case 的殘留值（通常為 0 或 1），若不重新載入本層原始的 n，直接執行減 2 會導致參數陷入負數甚至無窮遞迴導致堆疊爆炸！"
    },
    {
      id: "q_fib_add_res",
      subroutine: "fib",
      instruction: "add $v0, $s0, $v0",
      question: "執行「add $v0, $s0, $v0」的邏輯功能為何？",
      options: [
        "(A) 將保存在 $s0 的 fib(n-1) 與當前剛由 $v0 回傳的 fib(n-2) 相加，組合成當前層的 F(n) 回傳值",
        "(B) 將輸入引數 n 與返回位址相加，以計算下一條指令的絕對跳躍位址",
        "(C) 計算兩次子遞迴的耗時週期總和",
        "(D) 判斷兩次遞迴回傳值是否相同"
      ],
      correctIndex: 0,
      explanation: "此指令精準實作了費氏數列數學定義 F(n) = F(n-1) + F(n-2)，其中 $s0 存放已完成的第一項，$v0 存放剛完成的第二項，加總後寫回 $v0 作為本層對外回傳值。"
    },
    {
      id: "q_fib_sp_free",
      subroutine: "fib",
      instruction: "addi $sp, $sp, 12",
      question: "函式結尾返回前執行「addi $sp, $sp, 12」的意義為何？若在 Base Case 漏寫會發生何事？",
      options: [
        "(A) 釋放函式進入時所配置的 12 位元組堆疊框架，維持堆疊指標平衡；若漏寫將造成堆疊洩漏（Stack Leak）",
        "(B) 將暫存器數值清除為 0 防止機密資料外洩",
        "(C) 擴展堆疊深度以便提供下一層副程式使用",
        "(D) 調整程式碼段位址以對齊 64 位元架構"
      ],
      correctIndex: 0,
      explanation: "Stack Pointer 必須保持對稱平衡。進入時 addi $sp, $sp, -12，離開前就必須 addi $sp, $sp, 12。若未還原就執行 jr $ra，上一層呼叫端的 $sp 將產生 12 bytes 偏移，後續所有堆疊讀取全部錯位。"
    },
    {
      id: "q_fact_sp_alloc",
      subroutine: "fact",
      instruction: "addi $sp, $sp, -8",
      question: "在階乘程序 fact(n) 中，為何堆疊框架只需配置 8 位元組（addi $sp, $sp, -8），比 fib(n) 的 12 位元組少 4 位元組？",
      options: [
        "(A) 因為階乘是單一遞迴呼叫（Single Recursion），無需使用額外的 $s0 暫存器跨呼叫保存中間結果，僅需保存 $ra 與 $a0",
        "(B) 因為階乘運算只支援 16 位元整數，記憶體需求減半",
        "(C) 因為階乘不需要判斷 Base Case",
        "(D) 因為階乘可以直接在 ALU 乘法器完成，不需要堆疊"
      ],
      correctIndex: 0,
      explanation: "階乘只呼叫一次 fact(n-1)，其計算結果直接留在 $v0 中與還原後的 $a0 相乘即可，因此不需要使用 Callee-saved 暫存器（$s0）跨呼叫保護中間結果，僅需 8 位元組儲存 $ra 與 $a0。"
    },
    {
      id: "q_fact_mul",
      subroutine: "fact",
      instruction: "mul $v0, $a0, $v0",
      question: "在階乘程序 fact(n) 中，遞迴返回後執行「mul $v0, $a0, $v0」的功能為何？",
      options: [
        "(A) 計算 n * fact(n - 1)，將自堆疊還原的原始引數 n ($a0) 與子呼叫回傳值 fact(n-1) ($v0) 相乘，產生當前層結果",
        "(B) 計算 n 的平方值以加速收斂",
        "(C) 計算記憶體陣列位移量",
        "(D) 檢查乘法運算是否產生溢位例外"
      ],
      correctIndex: 0,
      explanation: "階乘數學定義 fact(n) = n * fact(n-1)。子呼叫返回時 $v0 包含 fact(n-1)，自堆疊執行 lw $a0 還原本層引數 n 後，兩者相乘即得當前階乘數值。"
    }
  ],

  // =========================================================================
  // 2. 期中考手寫挖空填空題庫（「直接叫我們寫出來 - 挖空特訓」）
  // =========================================================================
  fillBlanks: {
    fib: {
      title: "期中考手寫必考題型：MIPS 雙遞迴費氏數列（fib）關鍵指令挖空填空",
      description: "請在下列組合語言程式碼的空格中，手寫填入正確的 MIPS 指令（包含暫存器與偏移量）。",
      codeLines: [
        { num: 1, text: "fib:", isBlank: false },
        { num: 2, text: "    [BLANK_1]            # 1. 配置 12 bytes 堆疊框架", isBlank: true, blankId: "b1", answer: "addi $sp, $sp, -12", altAnswers: ["addi $sp,$sp,-12"] },
        { num: 3, text: "    [BLANK_2]            # 2. 保存返回位址 $ra (Offset: 8)", isBlank: true, blankId: "b2", answer: "sw $ra, 8($sp)", altAnswers: ["sw $ra,8($sp)"] },
        { num: 4, text: "    sw   $s0, 4($sp)     # 3. 保存 Callee-saved 暫存器 $s0", isBlank: false },
        { num: 5, text: "    sw   $a0, 0($sp)     # 4. 保存當前引數 n", isBlank: false },
        { num: 6, text: "    # Base Case 檢查 (n < 2)", isBlank: false },
        { num: 7, text: "    beq  $a0, $zero, fib_base0", isBlank: false },
        { num: 8, text: "    li   $t0, 1", isBlank: false },
        { num: 9, text: "    beq  $a0, $t0, fib_base1", isBlank: false },
        { num: 10, text: "    # Recursive Step 1: 計算 fib(n - 1)", isBlank: false },
        { num: 11, text: "    addi $a0, $a0, -1", isBlank: false },
        { num: 12, text: "    jal  fib", isBlank: false },
        { num: 13, text: "    [BLANK_3]            # 5. 安全保存 fib(n-1) 的回傳值", isBlank: true, blankId: "b3", answer: "move $s0, $v0", altAnswers: ["add $s0, $v0, $zero", "addu $s0, $v0, $zero", "move $s0,$v0"] },
        { num: 14, text: "    # Recursive Step 2: 計算 fib(n - 2)", isBlank: false },
        { num: 15, text: "    [BLANK_4]            # 6. 自堆疊還原原始引數 n", isBlank: true, blankId: "b4", answer: "lw $a0, 0($sp)", altAnswers: ["lw $a0,0($sp)"] },
        { num: 16, text: "    addi $a0, $a0, -2", isBlank: false },
        { num: 17, text: "    jal  fib             # 執行第二次遞迴，結果於 $v0", isBlank: false },
        { num: 18, text: "    # 合併兩者結果", isBlank: false },
        { num: 19, text: "    add  $v0, $s0, $v0   # $v0 = fib(n-1) + fib(n-2)", isBlank: false },
        { num: 20, text: "    j    fib_return", isBlank: false },
        { num: 21, text: "fib_base0:", isBlank: false },
        { num: 22, text: "    li   $v0, 0", isBlank: false },
        { num: 23, text: "    j    fib_return", isBlank: false },
        { num: 24, text: "fib_base1:", isBlank: false },
        { num: 25, text: "    li   $v0, 1", isBlank: false },
        { num: 26, text: "fib_return:", isBlank: false },
        { num: 27, text: "    lw   $a0, 0($sp)     # 還原暫存器", isBlank: false },
        { num: 28, text: "    lw   $s0, 4($sp)", isBlank: false },
        { num: 29, text: "    lw   $ra, 8($sp)", isBlank: false },
        { num: 30, text: "    [BLANK_5]            # 7. 釋放 12 bytes 堆疊框架", isBlank: true, blankId: "b5", answer: "addi $sp, $sp, 12", altAnswers: ["addi $sp,$sp,12"] },
        { num: 31, text: "    [BLANK_6]            # 8. 返回呼叫端", isBlank: true, blankId: "b6", answer: "jr $ra", altAnswers: ["jr  $ra", "jr $31"] }
      ]
    },
    fact: {
      title: "期中考手寫必考題型：MIPS 階乘遞迴（fact）關鍵指令挖空填空",
      description: "請在下列階乘程式碼的空格中，手寫填入正確的 MIPS 指令。",
      codeLines: [
        { num: 1, text: "fact:", isBlank: false },
        { num: 2, text: "    [BLANK_1]            # 1. 配置 8 bytes 堆疊 ($ra 與 $a0)", isBlank: true, blankId: "b1", answer: "addi $sp, $sp, -8", altAnswers: ["addi $sp,$sp,-8"] },
        { num: 3, text: "    [BLANK_2]            # 2. 保存返回位址 $ra", isBlank: true, blankId: "b2", answer: "sw $ra, 4($sp)", altAnswers: ["sw $ra,4($sp)"] },
        { num: 4, text: "    sw   $a0, 0($sp)     # 3. 保存引數 n", isBlank: false },
        { num: 5, text: "    slti $t0, $a0, 1     # 測試 n < 1", isBlank: false },
        { num: 6, text: "    beq  $t0, $zero, L1  # 若 n >= 1 則跳往遞迴標籤 L1", isBlank: false },
        { num: 7, text: "    # Base Case (n < 1 -> 1)", isBlank: false },
        { num: 8, text: "    li   $v0, 1", isBlank: false },
        { num: 9, text: "    addi $sp, $sp, 8", isBlank: false },
        { num: 10, text: "    jr   $ra", isBlank: false },
        { num: 11, text: "L1:", isBlank: false },
        { num: 12, text: "    addi $a0, $a0, -1   # 引數 n - 1", isBlank: false },
        { num: 13, text: "    jal  fact            # 遞迴呼叫 fact(n - 1)", isBlank: false },
        { num: 14, text: "    [BLANK_3]            # 4. 自堆疊還原進入時的原始 n", isBlank: true, blankId: "b3", answer: "lw $a0, 0($sp)", altAnswers: ["lw $a0,0($sp)"] },
        { num: 15, text: "    lw   $ra, 4($sp)     # 還原返回位址", isBlank: false },
        { num: 16, text: "    addi $sp, $sp, 8     # 釋放堆疊", isBlank: false },
        { num: 17, text: "    [BLANK_4]            # 5. 計算 n * fact(n - 1)", isBlank: true, blankId: "b4", answer: "mul $v0, $a0, $v0", altAnswers: ["mul $v0,$a0,$v0", "mult $a0, $v0\nmflo $v0"] },
        { num: 18, text: "    jr   $ra             # 返回呼叫端", isBlank: false }
      ]
    }
  },

  // =========================================================================
  // 3. 期中考手寫白板語法與呼叫約定檢查器（「直接叫我們寫出來 - 全程式默寫」）
  // =========================================================================
  auditCode: function(userCode, targetType) {
    const lines = userCode.split("\n").map(l => l.trim().toLowerCase());
    const report = {
      score: 100,
      checks: [],
      verdict: "PASS"
    };

    const hasInstr = (pattern) => lines.some(l => pattern.test(l));

    // 檢核 1：堆疊配置與釋放對稱性 (Stack Balance)
    const allocMatch = userCode.match(/addi\s+\$sp\s*,\s*\$sp\s*,\s*-\s*(\d+)/i);
    const freeMatch = userCode.match(/addi\s+\$sp\s*,\s*\$sp\s*,\s*(\d+)/i);
    if (allocMatch && freeMatch && allocMatch[1] === freeMatch[1]) {
      report.checks.push({ name: "堆疊配置與釋放對稱平衡 (Stack Pointer Balance)", pass: true, detail: `正確檢測到配置 -${allocMatch[1]} bytes 與釋放 +${freeMatch[1]} bytes。` });
    } else {
      report.score -= 25;
      report.checks.push({ name: "堆疊配置與釋放對稱平衡 (Stack Pointer Balance)", pass: false, detail: "堆疊配置與釋放大小不匹配或遺漏！進入與離開必須對稱加減相同的位元組數（如 -12 與 12）。" });
    }

    // 檢核 2：$ra 返回位址保護 (Non-leaf Protection)
    const hasSwRa = hasInstr(/^sw\s+\$ra/);
    const hasLwRa = hasInstr(/^lw\s+\$ra/);
    if (hasSwRa && hasLwRa) {
      report.checks.push({ name: "返回位址暫存器保護 ($ra Save/Restore)", pass: true, detail: "正確在進入時保存 $ra，離開前還原 $ra，有效防止死迴圈。" });
    } else {
      report.score -= 30;
      report.checks.push({ name: "返回位址暫存器保護 ($ra Save/Restore)", pass: false, detail: "遺漏 sw $ra 或 lw $ra！副程式包含 jal 指令，未保存 $ra 將導致程式無法返回呼叫端！" });
    }

    // 檢核 3：引數 $a0 備份與還原
    const hasSwA0 = hasInstr(/^sw\s+\$a0/);
    const hasLwA0 = hasInstr(/^lw\s+\$a0/);
    if (hasSwA0 && hasLwA0) {
      report.checks.push({ name: "傳入引數暫存器保護 ($a0 Save/Restore)", pass: true, detail: "正確在堆疊保存 $a0 並在呼叫後還原，確保計算不受子遞迴污染。" });
    } else {
      report.score -= 20;
      report.checks.push({ name: "傳入引數暫存器保護 ($a0 Save/Restore)", pass: false, detail: "遺漏 sw $a0 或 lw $a0！呼叫遞迴前必須保護傳入引數 n，否則後續無法正確計算。" });
    }

    // 檢核 4：雙遞迴情況下 $s0 保護 (僅限 fib)
    if (targetType === "fib") {
      const usesS0 = hasInstr(/\$s0/);
      const hasSwS0 = hasInstr(/^sw\s+\$s0/);
      const hasLwS0 = hasInstr(/^lw\s+\$s0/);
      if (usesS0) {
        if (hasSwS0 && hasLwS0) {
          report.checks.push({ name: "被呼叫者保護約定 ($s0 Callee-saved Convention)", pass: true, detail: "動用了 $s0 並嚴格遵守約定在進入時保存、離開時還原。" });
        } else {
          report.score -= 20;
          report.checks.push({ name: "被呼叫者保護約定 ($s0 Callee-saved Convention)", pass: false, detail: "使用了 $s0 暫存第一次結果，但未在堆疊進行 sw/lw 保護！違反 Callee-saved 約定。" });
        }
      } else {
        report.checks.push({ name: "被呼叫者保護約定 ($s0 Callee-saved Convention)", pass: true, detail: "未動用 $s0 或改用其他方式保存中間值。" });
      }
    }

    // 檢核 5：返回指令
    const hasJrRa = hasInstr(/^jr\s+\$ra/);
    if (hasJrRa) {
      report.checks.push({ name: "函式返回指令 (jr $ra)", pass: true, detail: "結尾正確使用 jr $ra 跳回呼叫端。" });
    } else {
      report.score -= 25;
      report.checks.push({ name: "函式返回指令 (jr $ra)", pass: false, detail: "副程式缺少 jr $ra 指令！" });
    }

    report.score = Math.max(0, report.score);
    if (report.score < 60) {
      report.verdict = "FAIL (嚴重缺陷，期中筆試將被扣重分)";
    } else if (report.score < 90) {
      report.verdict = "WARNING (基本邏輯成立，但存在呼叫約定扣分瑕疵)";
    } else {
      report.verdict = "PERFECT (完全符合期中考滿分答題標準)";
    }

    return report;
  },

  // =========================================================================
  // 4. 作業一（HW1）7 大必考題型動態變種題庫
  // =========================================================================
  hw1DynamicVariants: [
    {
      id: "hw1_q1_transistor",
      title: "HW1 第 1 題變種：電晶體密度微縮、複合年均成長率（CAGR）與倍增週期推導",
      category: "硬體微縮與莫爾定律",
      generator: function() {
        const pool = [
          { yStart: 2010, yEnd: 2019, nodeStart: 32, nodeEnd: 14 },
          { yStart: 2012, yEnd: 2020, nodeStart: 28, nodeEnd: 10 },
          { yStart: 2014, yEnd: 2022, nodeStart: 20, nodeEnd: 7 },
          { yStart: 2016, yEnd: 2024, nodeStart: 16, nodeEnd: 5 }
        ];
        return pool[Math.floor(Math.random() * pool.length)];
      },
      render: function(p) {
        const years = p.yEnd - p.yStart;
        return `根據作業一第 1 題題型：
假設微處理器晶片上的電晶體總密度與製程節點尺寸 $t$ 的平方成反比，即密度 $\\propto (1/t)^2$。
自 **${p.yStart} 年**（製程節點 **${p.nodeStart} nm**）演進至 **${p.yEnd} 年**（製程節點 **${p.nodeEnd} nm**），歷時 **${years} 年**。

**請計算：**
1. 電晶體密度在這 ${years} 年間成長為原本的幾倍？
2. 複合年均成長率（CAGR）為多少百分比？
3. 電晶體數量平均每隔幾年成長為 2 倍（倍增週期 Doubling Period）？
*(請填入「倍增週期年數」，例如 \`3.77\`，容許誤差 $\\pm 0.1$ 年)*`;
      },
      solve: function(p) {
        const years = p.yEnd - p.yStart;
        const growth = Math.pow(p.nodeStart / p.nodeEnd, 2);
        const cagr = Math.pow(growth, 1 / years) - 1;
        const doublingYears = Math.log(2) / Math.log(1 + cagr);

        return {
          correctValue: doublingYears,
          altValue: [doublingYears.toFixed(2), doublingYears.toFixed(1)],
          unit: "年",
          tolerance: 0.1,
          explanation: `
1. **電晶體增長倍率計算**：
   $$\\text{Growth Ratio} = \\left( \\frac{${p.nodeStart}}{${p.nodeEnd}} \\right)^2 = ${growth.toFixed(4)} \\text{ 倍}$$
2. **複合年均成長率（CAGR）**：
   $$\\text{CAGR} = (${growth.toFixed(4)})^{1/${years}} - 1 = ${(cagr * 100).toFixed(2)}\\%$$
3. **倍增時間（Doubling Period）**：
   $$\\text{Doubling Years} = \\frac{\\ln(2)}{\\ln(1 + ${cagr.toFixed(4)})} = \\mathbf{${doublingYears.toFixed(2)}} \\text{ 年}$$
          `
        };
      }
    },
    {
      id: "hw1_q2_weighted_cpi",
      title: "HW1 第 2 題變種：多指令類別加權平均 CPI 與兩處理器執行時間對決",
      category: "效能方程式與 CPI",
      generator: function() {
        const pool = [
          { p1Ghz: 2.5, p1Cpis: [1, 2, 3, 3], p2Ghz: 3.0, p2Cpis: [2, 2, 2, 2], mix: [0.10, 0.20, 0.50, 0.20], ic: 1.0e6 },
          { p1Ghz: 2.0, p1Cpis: [1, 2, 4, 3], p2Ghz: 2.8, p2Cpis: [2, 2, 2, 3], mix: [0.15, 0.25, 0.40, 0.20], ic: 2.0e6 },
          { p1Ghz: 3.2, p1Cpis: [1, 1, 3, 4], p2Ghz: 3.6, p2Cpis: [2, 2, 3, 2], mix: [0.20, 0.30, 0.30, 0.20], ic: 1.5e6 }
        ];
        return pool[Math.floor(Math.random() * pool.length)];
      },
      render: function(p) {
        return `根據作業一第 2 題題型：
現有兩款處理器執行同一套測試程式（動態指令數 $IC = ${p.ic.toExponential()}$）：
- **處理器 P1**：時脈頻率 **${p.p1Ghz} GHz**，四類指令 CPI 分別為 $[${p.p1Cpis.join(", ")}]$
- **處理器 P2**：時脈頻率 **${p.p2Ghz} GHz**，四類指令 CPI 分別為 $[${p.p2Cpis.join(", ")}]$
- 程式之指令類別分佈比例（Mix）為：A 類 ${p.mix[0]*100}%、B 類 ${p.mix[1]*100}%、C 類 ${p.mix[2]*100}%、D 類 ${p.mix[3]*100}%。

**請計算：處理器 P1 的加權平均 CPI 為多少？**（兩者何者執行時間較短？）`;
      },
      solve: function(p) {
        let cpi1 = 0;
        let cpi2 = 0;
        for (let i = 0; i < 4; i++) {
          cpi1 += p.p1Cpis[i] * p.mix[i];
          cpi2 += p.p2Cpis[i] * p.mix[i];
        }
        const time1 = (p.ic * cpi1) / (p.p1Ghz * 1e9);
        const time2 = (p.ic * cpi2) / (p.p2Ghz * 1e9);
        const faster = time1 < time2 ? "P1" : "P2";

        return {
          correctValue: cpi1,
          altValue: [cpi1.toFixed(2), cpi1.toFixed(1)],
          unit: "",
          tolerance: 0.05,
          explanation: `
1. **處理器 P1 加權平均 CPI**：
   $$\\text{CPI}_{P1} = (${p.p1Cpis[0]} \\times ${p.mix[0]}) + (${p.p1Cpis[1]} \\times ${p.mix[1]}) + (${p.p1Cpis[2]} \\times ${p.mix[2]}) + (${p.p1Cpis[3]} \\times ${p.mix[3]}) = \\mathbf{${cpi1.toFixed(2)}}$$
2. **處理器 P2 加權平均 CPI**：
   $$\\text{CPI}_{P2} = (${p.p2Cpis[0]} \\times ${p.mix[0]}) + (${p.p2Cpis[1]} \\times ${p.mix[1]}) + (${p.p2Cpis[2]} \\times ${p.mix[2]}) + (${p.p2Cpis[3]} \\times ${p.mix[3]}) = \\mathbf{${cpi2.toFixed(2)}}$$
3. **執行時間對比**：
   - $T_{P1} = \\frac{IC \\times \\text{CPI}_{P1}}{f_1} = \\frac{${p.ic} \\times ${cpi1.toFixed(2)}}{${p.p1Ghz} \\times 10^9} = ${(time1 * 1000).toFixed(3)} \\text{ ms}$
   - $T_{P2} = \\frac{IC \\times \\text{CPI}_{P2}}{f_2} = \\frac{${p.ic} \\times ${cpi2.toFixed(2)}}{${p.p2Ghz} \\times 10^9} = ${(time2 * 1000).toFixed(3)} \\text{ ms}$
   - 結論：**處理器 ${faster} 執行較快**。
          `
        };
      }
    },
    {
      id: "hw1_q4_amdahl_limit",
      title: "HW1 第 4 題變種：阿姆達爾定律（Amdahl's Law）單一部件極限判定",
      category: "Amdahl 定律與系統極限",
      generator: function() {
        const pool = [
          { total: 250, fp: 70, ls: 85, br: 40, int: 55, targetReducePct: 20, unitName: "分支預測單元 (Branch)" },
          { total: 300, fp: 120, ls: 90, br: 30, int: 60, targetReducePct: 15, unitName: "分支單元 (Branch)" },
          { total: 200, fp: 80, ls: 70, br: 20, int: 30, targetReducePct: 12, unitName: "分支單元 (Branch)" }
        ];
        return pool[Math.floor(Math.random() * pool.length)];
      },
      render: function(p) {
        const reqCut = p.total * (p.targetReducePct / 100);
        return `根據作業一第 4 題題型：
某程式在伺服器上總執行時間為 **${p.total} 秒**，各指令類別耗時拆解如下：
- 浮點運算（FP）：${p.fp} 秒
- 記憶體存取（L/S）：${p.ls} 秒
- 分支指令（Branch）：**${p.br} 秒**
- 整數運算（INT）：${p.int} 秒

若硬體架構團隊提出專案：**「只針對 ${p.unitName} 進行硬體重構，目標讓程式總執行時間縮短 ${p.targetReducePct}%」**。
**請判定：此項工程目標在物理上是否可行？（回答：\`可行\` 或 \`不可行\`）**`;
      },
      solve: function(p) {
        const reqCut = p.total * (p.targetReducePct / 100);
        const feasible = p.br >= reqCut;
        return {
          correctValue: feasible ? "可行" : "不可行",
          altValue: feasible ? ["yes", "true", "1"] : ["yes", "no", "false", "0", "物理上不可能", "unattainable"],
          unit: "",
          tolerance: 0,
          explanation: `
1. **目標縮短時間計算**：
   $$\\Delta T_{\\text{target}} = ${p.total} \\times ${p.targetReducePct}\\% = \\mathbf{${reqCut.toFixed(1)} \\text{ 秒}}$$
2. **阿姆達爾定律單一部件極限檢驗**：
   - 該程式在 ${p.unitName} 上所花費的總時間僅有 **${p.br} 秒**。
   - 即使將該單元加速至無限大（執行時間縮減為 0 秒），最多也只能為整體程式節省 **${p.br} 秒**。
   - 由於 ${p.br} 秒 ${p.br >= reqCut ? "\\ge" : "<"} ${reqCut.toFixed(1)} 秒，因此**${feasible ? "可行" : "物理上完全不可能達成（Unattainable）"}**！
          `
        };
      }
    },
    {
      id: "hw1_q7_loop_inst_count",
      title: "HW1 第 7 題變種：條件迴圈逆向還原、終止條件與動態指令計數",
      category: "MIPS 迴圈控制與指令統計",
      generator: function() {
        const pool = [
          { n: 10, stepB: 2, cCode: "while(i > 0) { i--; B += 2; }" },
          { n: 8,  stepB: 3, cCode: "while(i > 0) { i--; B += 3; }" },
          { n: 15, stepB: 2, cCode: "while(i > 0) { i--; B += 2; }" }
        ];
        return pool[Math.floor(Math.random() * pool.length)];
      },
      render: function(p) {
        return `根據作業一第 7 題題型：
分析以下 MIPS 條件迴圈程式片段（假設變數 $i$ 位於 \`$t1\`，初值為 **${p.n}**；變數 $B$ 位於 \`$s2\`，初值為 **0**）：
\`\`\`assembly
LOOP:
    slt  $t2, $0, $t1       # 檢查 0 < i
    beq  $t2, $0, DONE      # 若 !(0 < i) 則跳往 DONE
    subi $t1, $t1, 1        # i = i - 1
    addi $s2, $s2, ${p.stepB}        # B = B + ${p.stepB}
    j    LOOP
DONE:
\`\`\`
**請計算：此段程式執行結束時，動態執行的總指令數（Total Executed Instructions）為多少條？**`;
      },
      solve: function(p) {
        const total = 5 * p.n + 2;
        const finalB = p.n * p.stepB;
        return {
          correctValue: total,
          altValue: [String(total)],
          unit: "條",
          tolerance: 0,
          explanation: `
1. **C 語言對應語意**：
   \`while(i > 0) { i--; B += ${p.stepB}; }\`
   迴圈共迭代 **$N = ${p.n}$ 次**，結束時 $B = ${finalB}$。
2. **動態指令計數拆解**：
   - 每次有效迭代內部執行 5 條指令：\`slt\`、\`beq\`（未跳躍）、\`subi\`、\`addi\`、\`j\`。
   - 結束前最後一次退出檢查執行 2 條指令：\`slt\`、\`beq\`（命中跳躍至 DONE）。
   - 總動態指令數公式：
     $$\\text{Total Instructions} = 5N + 2 = 5 \\times ${p.n} + 2 = \\mathbf{${total}} \\text{ 條}$$
          `
        };
      }
    },
    {
      id: "hw1_q9_stride_shift",
      title: "HW1 第 9 題變種：二重跨步陣列存取 D[k*j] 位元組偏移量與 sll 位移換算",
      category: "MIPS 陣列定址與位移指令",
      generator: function() {
        const pool = [
          { k: 4, shiftAmount: 4, mulBytes: 16 },
          { k: 8, shiftAmount: 5, mulBytes: 32 },
          { k: 2, shiftAmount: 3, mulBytes: 8 }
        ];
        return pool[Math.floor(Math.random() * pool.length)];
      },
      render: function(p) {
        return `根據作業一第 9 題題型：
假設在巢狀迴圈中需存取 32 位元整數陣列元素 **\`D[${p.k} * j]\`**，其中變數 $j$ 存放在暫存器 \`$t1\`，整數陣列 $D$ 的基底記憶體位址存放在 \`$s0\`。
每個整數元素佔用 4 位元組（Bytes）。

**請推算：若要利用邏輯左移指令 \`sll\` 將索引換算為記憶體位元組偏移量，該 \`sll\` 指令的位移量（Shift Amount, shamt）應設定為多少？**（即 \`sll $t2, $t1, ?\`）`;
      },
      solve: function(p) {
        return {
          correctValue: p.shiftAmount,
          altValue: [String(p.shiftAmount)],
          unit: "bits",
          tolerance: 0,
          explanation: `
1. **位元組偏移量數學推導**：
   - 陣列元素索引為 $k \\times j = ${p.k}j$。
   - 每個整數佔用 4 位元組，因此記憶體位元組偏移量為：
     $$\\text{Byte Offset} = (${p.k}j) \\times 4 = ${p.mulBytes}j = 2^{${p.shiftAmount}} \\times j$$
2. **邏輯左移換算**：
   - 乘以 ${p.mulBytes} 等同於二進位向左位移 **${p.shiftAmount}** 位元。
   - 對應組合語言指令為：\`sll $t2, $t1, ${p.shiftAmount}\`。
   - 隨後再執行 \`add $t2, $t2, $s0\` 與 \`lw $t0, 0($t2)\` 完成存取。
          `
        };
      }
    }
  ]
};
