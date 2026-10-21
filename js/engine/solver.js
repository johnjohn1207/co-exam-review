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
    s = s.replace(/(ghz|mhz|khz|hz|ns|ps|ms|s|sec|seconds|cycles|bytes|byte|words|%)/gi, "").trim();
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

    // 1. 十六進位字串比對 (e.g. 0x02324020 或 02324020)
    if (typeof sol.correctValue === "string" && (sol.correctValue.startsWith("0x") || sol.correctValue.startsWith("0X"))) {
      const standardHex = sol.correctValue.toLowerCase().replace("0x", "");
      const cleanUserHex = cleanUser.toLowerCase().replace("0x", "");
      if (cleanUserHex === standardHex) {
        isCorrect = true;
      } else if (sol.altValue && cleanUserHex === sol.altValue.toLowerCase().replace("0x", "")) {
        isCorrect = true;
      }
    } 
    // 2. 數值比對 (含容許誤差與科學記號)
    else {
      const userNum = parseFloat(cleanUser);
      const targetNum = typeof sol.correctValue === "number" ? sol.correctValue : parseFloat(sol.correctValue);

      if (isNaN(userNum)) {
        return { isCorrect: false, message: "無法解析為有效數值，請輸入阿拉伯數字。" };
      }

      const tolerance = sol.tolerance !== undefined ? sol.tolerance : 0.05;

      // 百分比誤差或絕對誤差
      const absDiff = Math.abs(userNum - targetNum);
      const relDiff = targetNum !== 0 ? absDiff / Math.abs(targetNum) : absDiff;

      if (absDiff <= tolerance || relDiff <= 0.01) {
        isCorrect = true;
      }
    }

    instance.userAnswer = userRawInput;
    instance.isAnswered = true;
    instance.isCorrect = isCorrect;

    return {
      isCorrect: isCorrect,
      correctValue: sol.correctValue,
      unit: sol.unit || "",
      message: isCorrect 
        ? "答案正確！計算邏輯完全精準。" 
        : `答案有誤。您的輸入為「${userRawInput}」，正確答案為「${sol.correctValue} ${sol.unit || ""}」。請參考下方推導詳解。`
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
