// 數值計算求解器、隨機參數生成與答案比對驗證引擎

window.CO_SOLVER = {
  activeInstances: {},

  // 產生一道題目實例
  instantiateQuestion: function(problemDef) {
    const params = problemDef.generator();
    const renderedText = problemDef.render(params);
    const solution = problemDef.solve(params);

    const instance = {
      problemId: problemDef.id,
      title: problemDef.title,
      category: problemDef.category,
      params: params,
      renderedText: renderedText,
      solution: solution,
      userAnswer: null,
      isAnswered: false,
      isCorrect: false
    };

    this.activeInstances[problemDef.id] = instance;
    return instance;
  },

  // 清洗與標準化輸入
  normalizeInput: function(raw) {
    if (raw === undefined || raw === null) return "";
    let s = String(raw).trim();
    // 移除常見單位字串
    s = s.replace(/(ghz|mhz|khz|hz|ns|ps|ms|sec|seconds|cycles|bytes|byte|words|%|秒|個指令|指令)/gi, "").trim();
    return s;
  },

  // 比對使用者答案
  verify: function(problemId, userRawInput) {
    const instance = this.activeInstances[problemId];
    if (!instance) {
      return { isCorrect: false, message: "找不到題目實例，請重新整理。" };
    }

    const sol = instance.solution;
    const cleanUser = this.normalizeInput(userRawInput);

    if (cleanUser === "") {
      return { isCorrect: false, message: "請先輸入計算答案！" };
    }

    let isCorrect = false;

    // 輔助函式：比對單一目標值
    const checkMatch = (target) => {
      if (typeof target === "string") {
        const lowerTarget = target.trim().toLowerCase();
        const lowerUser = cleanUser.toLowerCase();

        // 十六進位比對
        if (lowerTarget.startsWith("0x")) {
          const hexT = lowerTarget.replace("0x", "");
          const hexU = lowerUser.replace("0x", "");
          return hexT === hexU;
        }

        // 文字比對（忽略空白與大小寫）
        const flatTarget = lowerTarget.replace(/\s+/g, "");
        const flatUser = lowerUser.replace(/\s+/g, "");
        if (flatTarget === flatUser) return true;

        // 中英關鍵字互通容錯
        if ((lowerTarget.includes("overflow") && (lowerUser.includes("overflow") || lowerUser.includes("溢位") || lowerUser === "是" || lowerUser === "yes" || lowerUser === "1")) ||
            (lowerTarget.includes("no overflow") && (lowerUser.includes("no") || lowerUser.includes("無") || lowerUser.includes("不溢位") || lowerUser === "否" || lowerUser === "0"))) {
          return true;
        }
      }

      // 數值比對 (含容許誤差與浮點數)
      const userNum = parseFloat(cleanUser);
      const targetNum = typeof target === "number" ? target : parseFloat(target);

      if (!isNaN(userNum) && !isNaN(targetNum)) {
        const tolerance = sol.tolerance !== undefined ? sol.tolerance : 0.05;
        const absDiff = Math.abs(userNum - targetNum);
        const relDiff = targetNum !== 0 ? absDiff / Math.abs(targetNum) : absDiff;
        if (absDiff <= tolerance || relDiff <= 0.015) {
          return true;
        }
      }

      return false;
    };

    // 1. 若正確答案為陣列（多重有效表示）
    if (Array.isArray(sol.correctValue)) {
      isCorrect = sol.correctValue.some(val => checkMatch(val));
    } else {
      isCorrect = checkMatch(sol.correctValue);
      if (!isCorrect && sol.altValue) {
        if (Array.isArray(sol.altValue)) {
          isCorrect = sol.altValue.some(val => checkMatch(val));
        } else {
          isCorrect = checkMatch(sol.altValue);
        }
      }
    }

    instance.userAnswer = userRawInput;
    instance.isAnswered = true;
    instance.isCorrect = isCorrect;

    const displayExpected = Array.isArray(sol.correctValue) ? sol.correctValue[0] : sol.correctValue;

    return {
      isCorrect: isCorrect,
      correctValue: displayExpected,
      unit: sol.unit || "",
      message: isCorrect 
        ? "答案正確！計算邏輯完全精準。" 
        : `答案有誤。您的輸入為「${userRawInput}」，正確答案為「${displayExpected} ${sol.unit || ""}」。請參考下方推導詳解。`
    };
  },

  // 渲染 LaTeX 輔助
  renderMath: function(element) {
    if (window.renderMathInElement) {
      try {
        window.renderMathInElement(element, {
          delimiters: [
            { left: "$$", right: "$$", display: true },
            { left: "$", right: "$", display: false },
            { left: "\\(", right: "\\)", display: false },
            { left: "\\[", right: "\\]", display: true }
          ],
          throwOnError: false
        });
      } catch (e) {
        console.warn("KaTeX render error:", e);
      }
    }
  }
};
