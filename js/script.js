// Глобальные переменные
let mode = null;
let step = 0;
let p = 23;
let g = 5;
let timers = [];
let isStopped = false;
let currentStep = 0;

// Функция переключения темы
function toggleTheme() {
  const body = document.body;
  const themeSwitch = document.getElementById('theme-switch');
  body.classList.toggle('dark-theme', themeSwitch.checked);
  localStorage.setItem('theme', themeSwitch.checked ? 'dark' : 'light');
}

// Проверка простоты числа
function isPrime(n) {
  if (n < 2) return false;
  for (let i = 2; i <= Math.sqrt(n); i++) {
    if (n % i === 0) return false;
  }
  return true;
}

// Валидация p
function validateP(pValue) {
  const pError = document.getElementById("p-error");
  const pSuccess = document.getElementById("p-success");
  pError.classList.remove("active");
  pSuccess.classList.remove("active");

  if (pValue < 0) {
    pError.textContent = "Error: P cannot be negative! Use a number between 2 and 99.";
    pError.classList.add("active");
    return false;
  }
  if (pValue > 99) {
    pError.textContent = "Error: P cannot be greater than 99! Use a number between 2 and 99.";
    pError.classList.add("active");
    return false;
  }
  if (!isPrime(pValue)) {
    pError.textContent = "Error: P must be a prime number! Try 23, 47, or 83.";
    pError.classList.add("active");
    return false;
  }
  const halfPMinus1 = (pValue - 1) / 2;
  if (!Number.isInteger(halfPMinus1) || !isPrime(halfPMinus1)) {
    pError.textContent = "Error: (P-1)/2 must be a prime number! Try 23, 47, or 83.";
    pError.classList.add("active");
    return false;
  }
  pSuccess.textContent = "Success: P is valid!";
  pSuccess.classList.add("active");
  return true;
}

// Валидация g
function validateG(gValue) {
  const gError = document.getElementById("g-error");
  const gSuccess = document.getElementById("g-success");
  gError.classList.remove("active");
  gSuccess.classList.remove("active");

  // Получаем текущее значение p
  const pValue = parseInt(document.getElementById("param-p").value) || 23;

  if (gValue < 0) {
    gError.textContent = "Error: g cannot be negative! Use a number between 2 and 99.";
    gError.classList.add("active");
    return false;
  }
  if (gValue > 99) {
    gError.textContent = "Error: g cannot be greater than 99! Use a number between 2 and 99.";
    gError.classList.add("active");
    return false;
  }
  if (gValue < 2) {
    gError.textContent = `Error: g must be at least 2! Use a number between 2 and ${pValue - 1}.`;
    gError.classList.add("active");
    return false;
  }
  if (gValue >= pValue) {
    gError.textContent = `Error: g cannot be greater than or equal to P (${pValue})! Use a number between 2 and ${pValue - 1}.`;
    gError.classList.add("active");
    return false;
  }
  gSuccess.textContent = "Success: g is valid!";
  gSuccess.classList.add("active");
  return true;
}

// Установка режима (без автоматического запуска)
function setMode(m) {
  mode = m;
  document.getElementById("charlie").style.display = m === 3 ? "inline-block" : "none";
  document.getElementById("arrow2").style.display = m === 3 ? "inline-block" : "none";
  document.getElementById("start-button").disabled = false;
  updateExplanation("Mode selected. Click 'Start Exchange' to begin the key exchange process.");
}

// Модульное возведение в степень
function modExp(base, exp, mod) {
  let result = 1;
  base = base % mod;
  while (exp > 0) {
    if (exp % 2 === 1) result = (result * base) % mod;
    exp = Math.floor(exp / 2);
    base = (base * base) % mod;
  }
  return result;
}

// Обновление текста в explanation-text
function updateExplanation(text) {
  const explanation = document.getElementById("explanation-text");
  if (explanation) explanation.textContent = text;
}

// Подсветка элемента
function highlightElement(elementId) {
  const element = document.getElementById(elementId);
  if (element) {
    element.classList.remove("highlight");
    void element.offsetWidth;
    element.classList.add("highlight");
  }
}

// Анимация стрелки
function animateArrow(arrowId) {
  const arrow = document.getElementById(arrowId);
  if (arrow) arrow.classList.add("active");
}

// Очистка таймеров
function clearTimers() {
  timers.forEach(timer => clearTimeout(timer));
  timers = [];
}

// Генерация случайного приватного ключа
function getRandomPrivateKey() {
  return Math.floor(Math.random() * 9) + 2; // Случайное число от 2 до 10
}

// Запуск обмена ключами
function startExchange() {
  if (!mode) {
    updateExplanation("Please select a mode (2 or 3 Participants) first!");
    return;
  }

  p = parseInt(document.getElementById("param-p").value) || 23;
  g = parseInt(document.getElementById("param-g").value) || 5;

  if (!validateP(p) || !validateG(g)) {
    updateExplanation("Error: Please check the values of P and g!");
    return;
  }

  clearTimers();
  step = 0;
  isStopped = false;
  currentStep = 0;

  document.getElementById("start-button").disabled = true;
  document.getElementById("stop-button").disabled = false;
  document.getElementById("back-button").disabled = true;
  document.getElementById("resume-button").disabled = true;

  const a = getRandomPrivateKey(); // Приватный ключ для Alice
  const b = getRandomPrivateKey(); // Приватный ключ для Bob
  let c = mode === 3 ? getRandomPrivateKey() : null; // Приватный ключ для Charlie

  // Вычисляем публичные ключи заранее
  const A = modExp(g, a, p); // Публичный ключ Alice
  const B = modExp(g, b, p); // Публичный ключ Bob
  let C = mode === 3 ? modExp(g, c, p) : null; // Публичный ключ Charlie

  // Шаг 1: Выбор приватных ключей
  updateExplanation("Step 1: Selecting private keys...");
  timers.push(setTimeout(() => {
    document.getElementById("alice-private").textContent = a;
    document.getElementById("alice-private-formula").textContent = `a = ${a}`;
    highlightElement("alice-private");
    document.getElementById("bob-private").textContent = b;
    document.getElementById("bob-private-formula").textContent = `b = ${b}`;
    highlightElement("bob-private");
    if (mode === 3) {
      document.getElementById("charlie-private").textContent = c;
      document.getElementById("charlie-private-formula").textContent = `c = ${c}`;
      highlightElement("charlie-private");
    }
    currentStep = 1;
    document.getElementById("back-button").disabled = false;
  }, 500));

  // Шаг 2: Вычисление публичных ключей
  timers.push(setTimeout(() => {
    if (isStopped) return;
    updateExplanation("Step 2: Computing public keys...");

    timers.push(setTimeout(() => {
      document.getElementById("alice-public").textContent = A;
      document.getElementById("alice-public-formula").textContent = `A = ${g}^${a} mod ${p} = ${A}`;
      highlightElement("alice-public");
    }, 500));

    timers.push(setTimeout(() => {
      document.getElementById("bob-public").textContent = B;
      document.getElementById("bob-public-formula").textContent = `B = ${g}^${b} mod ${p} = ${B}`;
      highlightElement("bob-public");
    }, 1500));

    if (mode === 3) {
      timers.push(setTimeout(() => {
        document.getElementById("charlie-public").textContent = C;
        document.getElementById("charlie-public-formula").textContent = `C = ${g}^${c} mod ${p} = ${C}`;
        highlightElement("charlie-public");
      }, 2500));
    }
    currentStep = 2;
  }, 2000));

  // Шаг 3: Обмен публичными ключами
  timers.push(setTimeout(() => {
    if (isStopped) return;
    updateExplanation("Step 3: Exchanging public keys...");
    animateArrow("arrow1");
    if (mode === 3) animateArrow("arrow2");
    currentStep = 3;
  }, 4500));

  // Шаг 4: Вычисление общего секрета
  timers.push(setTimeout(() => {
    if (isStopped) return;
    updateExplanation("Step 4: Computing shared secret...");
    let sharedSecret;

    if (mode === 2) {
      // Для 2 участников
      sharedSecret = modExp(B, a, p); // Алиса: S = B^a mod p
      const sharedBA = modExp(A, b, p); // Боб: S = A^b mod p

      timers.push(setTimeout(() => {
        document.getElementById("alice-secret").textContent = sharedSecret;
        document.getElementById("alice-secret-formula").textContent = `S = ${B}^${a} mod ${p} = ${sharedSecret}`;
        highlightElement("alice-secret");
      }, 500));

      timers.push(setTimeout(() => {
        document.getElementById("bob-secret").textContent = sharedBA;
        document.getElementById("bob-secret-formula").textContent = `S = ${A}^${b} mod ${p} = ${sharedBA}`;
        highlightElement("bob-secret");
      }, 1500));
    } else {
      // Для 3 участников
      const AB = modExp(A, b, p);
      const ABC = modExp(AB, c, p);

      const CB = modExp(C, b, p);
      const CBA = modExp(CB, a, p);

      const AC = modExp(A, c, p);
      const ACB = modExp(AC, b, p);

      sharedSecret = ABC;

      timers.push(setTimeout(() => {
        document.getElementById("alice-secret").textContent = sharedSecret;
        document.getElementById("alice-secret-formula").textContent = `S = (${CB})^${a} mod ${p} = ${sharedSecret}`;
        highlightElement("alice-secret");
      }, 500));

      timers.push(setTimeout(() => {
        document.getElementById("bob-secret").textContent = sharedSecret;
        document.getElementById("bob-secret-formula").textContent = `S = (${AC})^${b} mod ${p} = ${sharedSecret}`;
        highlightElement("bob-secret");
      }, 1500));

      timers.push(setTimeout(() => {
        document.getElementById("charlie-secret").textContent = sharedSecret;
        document.getElementById("charlie-secret-formula").textContent = `S = (${AB})^${c} mod ${p} = ${sharedSecret}`;
        highlightElement("charlie-secret");
      }, 2500));
    }

    timers.push(setTimeout(() => {
      updateExplanation(`Step 5: The shared secret is ${sharedSecret}.`);
      document.getElementById("stop-button").disabled = true;
      document.getElementById("back-button").disabled = true;
      document.getElementById("resume-button").disabled = true;
    }, mode === 2 ? 2500 : 3500));
    currentStep = 4;
  }, 6500));
}

// Остановка обмена
function stopExchange() {
  isStopped = true;
  clearTimers();
  document.getElementById("stop-button").disabled = true;
  document.getElementById("resume-button").disabled = false;
  updateExplanation(`Paused at Step ${currentStep}: ${getStepText(currentStep)}.`);
}

// Возврат на шаг назад
function backStep() {
  if (currentStep > 1) {
    currentStep--;
    clearTimers();
    updateExplanation(`Returned to Step ${currentStep}: ${getStepText(currentStep)}.`);
    resumeExchange();
  } else {
    updateExplanation("Already at Step 1: Selecting private keys.");
  }
  document.getElementById("back-button").disabled = currentStep <= 1;
}

// Возобновление обмена
function resumeExchange() {
  isStopped = false;
  document.getElementById("resume-button").disabled = true;
  document.getElementById("stop-button").disabled = false;
  startExchange();
}

// Текст шага
function getStepText(step) {
  switch (step) {
    case 1: return "Selecting private keys...";
    case 2: return "Computing public keys...";
    case 3: return "Exchanging public keys...";
    case 4: return "Computing shared secret...";
    default: return "";
  }
}

// Сброс состояния
function reset() {
  clearTimers();
  mode = null;
  step = 0;
  isStopped = false;
  currentStep = 0;
  p = 23;
  g = 5;
  document.getElementById("start-button").disabled = true;
  document.getElementById("stop-button").disabled = true;
  document.getElementById("back-button").disabled = true;
  document.getElementById("resume-button").disabled = true;
  ["alice", "bob", "charlie"].forEach(id => {
    ["private", "public", "secret"].forEach(field => {
      const el = document.getElementById(`${id}-${field}`);
      if (el) el.textContent = "";
      const formulaEl = document.getElementById(`${id}-${field}-formula`);
      if (formulaEl) formulaEl.textContent = "";
    });
  });
  document.getElementById("charlie").style.display = "none";
  document.getElementById("arrow2").style.display = "none";
  document.getElementById("p-error").classList.remove("active");
  document.getElementById("p-success").classList.remove("active");
  document.getElementById("g-error").classList.remove("active");
  document.getElementById("g-success").classList.remove("active");
  updateExplanation("⚠️ Please select a mode (2 or 3 Participants) to begin the key exchange process. This step is required to continue!");
}

// Инициализация при загрузке
window.onload = function() {
  document.getElementById("start-button").disabled = true;

  document.getElementById("param-p").addEventListener("input", function() {
    const pValue = parseInt(this.value) || 0;
    validateP(pValue);
    // После изменения p нужно повторно валидировать g
    const gValue = parseInt(document.getElementById("param-g").value) || 0;
    validateG(gValue);
  });

  document.getElementById("param-g").addEventListener("input", function() {
    const gValue = parseInt(this.value) || 0;
    validateG(gValue);
  });

  // Закрытие модального окна при клике вне его
  window.addEventListener('click', (event) => {
    const modal = document.getElementById('theory-modal');
    if (event.target === modal) {
      modal.style.display = 'none';
    }
  });
};

// Показ модального окна с теорией
function showTheory() {
  document.getElementById('theory-modal').style.display = 'block';
}

// Скрытие модального окна
function hideTheory() {
  document.getElementById('theory-modal').style.display = 'none';
}
