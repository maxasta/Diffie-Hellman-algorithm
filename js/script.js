let mode = null;
let p = 23;
let g = 5;
let timers = [];
let isStopped = false;
let currentStep = 0;

// Function to check if a number is prime
function isPrime(num) {
  if (num <= 1) return false;
  for (let i = 2; i <= Math.sqrt(num); i++) {
    if (num % i === 0) return false;
  }
  return true;
}

// Function to compute modular exponentiation
function modExp(base, exponent, modulus) {
  let result = 1;
  base = base % modulus;
  while (exponent > 0) {
    if (exponent & 1) {
      result = (result * base) % modulus;
    }
    base = (base * base) % modulus;
    exponent >>= 1;
  }
  return result;
}

// Function to find prime factors of a number
function getPrimeFactors(n) {
  let factors = [];
  for (let i = 2; i <= Math.sqrt(n); i++) {
    while (n % i === 0) {
      if (!factors.includes(i)) factors.push(i);
      n /= i;
    }
  }
  if (n > 1) factors.push(n);
  return factors;
}

// Function to find primitive roots of a prime p
function getPrimitiveRoots(p) {
  if (!isPrime(p)) return [];
  
  // Euler's totient function: φ(p) = p-1 for a prime p
  let phi = p - 1;
  
  // Get prime factors of φ(p)
  let primeFactors = getPrimeFactors(phi);
  
  let primitiveRoots = [];
  // Check each number from 2 to p-1
  for (let g = 2; g < p; g++) {
    let isPrimitive = true;
    // For each prime factor q of φ(p), check if g^(φ(p)/q) mod p ≠ 1
    for (let q of primeFactors) {
      let exponent = phi / q;
      if (modExp(g, exponent, p) === 1) {
        isPrimitive = false;
        break;
      }
    }
    if (isPrimitive) {
      primitiveRoots.push(g);
    }
  }
  return primitiveRoots;
}

// Function to update the g dropdown based on selected p
function updatePrimitiveRoots() {
  const pSelect = document.getElementById("param-p");
  p = parseInt(pSelect.value);
  const gSelect = document.getElementById("param-g");
  gSelect.innerHTML = ""; // Clear current options

  const primitiveRoots = getPrimitiveRoots(p);
  if (primitiveRoots.length === 0) {
    const option = document.createElement("option");
    option.value = "";
    option.textContent = "No primitive roots found";
    gSelect.appendChild(option);
    gSelect.disabled = true;
  } else {
    gSelect.disabled = false;
    primitiveRoots.forEach(root => {
      const option = document.createElement("option");
      option.value = root;
      option.textContent = root;
      gSelect.appendChild(option);
    });
    gSelect.value = primitiveRoots[0]; // Set default value
    g = parseInt(gSelect.value);
    validateG();
  }
  validateAllInputs();
}

// Validate p
function validateP(pValue) {
  const pError = document.getElementById("p-error");
  const pSuccess = document.getElementById("p-success");
  pError.classList.remove("active");
  pSuccess.classList.remove("active");

  if (pValue < 0) {
    pError.textContent = "Error: P cannot be negative!";
    pError.classList.add("active");
    return false;
  }
  if (!isPrime(pValue)) {
    pError.textContent = "Error: P must be a prime number!";
    pError.classList.add("active");
    return false;
  }
  if (!isPrime((pValue - 1) / 2)) {
    pError.textContent = "Error: (P-1)/2 must be a prime number!";
    pError.classList.add("active");
    return false;
  }
  pSuccess.textContent = "Success: P is valid!";
  pSuccess.classList.add("active");
  return true;
}

// Validate g (now selected from dropdown)
function validateG() {
  const gSelect = document.getElementById("param-g");
  const gValue = parseInt(gSelect.value) || null;
  const gError = document.getElementById("g-error");
  const gSuccess = document.getElementById("g-success");
  gError.classList.remove("active");
  gSuccess.classList.remove("active");

  if (gValue === null) {
    gError.textContent = "Error: Please select a valid g!";
    gError.classList.add("active");
    return false;
  }
  if (gValue < 0) {
    gError.textContent = "Error: g cannot be negative!";
    gError.classList.add("active");
    return false;
  }
  if (gValue >= p) {
    gError.textContent = `Error: g cannot be greater than or equal to P (${p})!`;
    gError.classList.add("active");
    return false;
  }
  gSuccess.textContent = "Success: g is valid!";
  gSuccess.classList.add("active");
  g = gValue;
  return true;
}

// Validate private keys
function validatePrivateKey(key, id, name) {
  const error = document.getElementById(`${id}-error`);
  const success = document.getElementById(`${id}-success`);
  error.classList.remove("active");
  success.classList.remove("active");

  const pValue = parseInt(document.getElementById("param-p").value) || 23;

  if (!Number.isInteger(key) || key < 1) {
    error.textContent = `Error: ${name} must be a positive integer!`;
    error.classList.add("active");
    return false;
  }
  if (key > 100) {
    error.textContent = `Error: ${name} must be less than or equal to 100!`;
    error.classList.add("active");
    return false;
  }
  if (key >= pValue) {
    error.textContent = `Error: ${name} must be less than P (${pValue})!`;
    error.classList.add("active");
    return false;
  }
  success.textContent = `Success: ${name} is valid!`;
  success.classList.add("active");
  return true;
}

// Update explanation text
function updateExplanation(text) {
  const pValue = parseInt(document.getElementById("param-p").value) || 23;
  const gValue = parseInt(document.getElementById("param-g").value) || 5;
  let errorMessage = "";

  if (!validateP(pValue)) {
    errorMessage += document.getElementById("p-error").textContent + " ";
  }
  if (!validateG()) {
    errorMessage += document.getElementById("g-error").textContent + " ";
  }

  document.getElementById("explanation-text").textContent = `p: ${pValue} g: ${gValue} ${errorMessage}${text}`.trim();
}

function highlightElement(id) {
  const element = document.getElementById(id);
  element.classList.add("highlight");
  setTimeout(() => element.classList.remove("highlight"), 1000);
}

function animateArrow(id) {
  const arrow = document.getElementById(id);
  arrow.style.display = "inline";
  arrow.classList.add("highlight");
  setTimeout(() => {
    arrow.classList.remove("highlight");
    arrow.style.display = "none";
  }, 1000);
}

function clearTimers() {
  timers.forEach(clearTimeout);
  timers = [];
}

function resetFields() {
  document.getElementById("alice-private").textContent = "-";
  document.getElementById("alice-public").textContent = "-";
  document.getElementById("alice-k").textContent = "-";
  document.getElementById("alice-s").textContent = "-";
  document.getElementById("bob-private").textContent = "-";
  document.getElementById("bob-public").textContent = "-";
  document.getElementById("bob-k").textContent = "-";
  document.getElementById("bob-s").textContent = "-";
  document.getElementById("charlie-private").textContent = "-";
  document.getElementById("charlie-public").textContent = "-";
  document.getElementById("charlie-k").textContent = "-";
  document.getElementById("charlie-s").textContent = "-";
  document.getElementById("alice-private-formula").textContent = "-";
  document.getElementById("alice-public-formula").textContent = "-";
  document.getElementById("alice-k-formula").textContent = "-";
  document.getElementById("alice-s-formula").textContent = "-";
  document.getElementById("bob-private-formula").textContent = "-";
  document.getElementById("bob-public-formula").textContent = "-";
  document.getElementById("bob-k-formula").textContent = "-";
  document.getElementById("bob-s-formula").textContent = "-";
  document.getElementById("charlie-private-formula").textContent = "-";
  document.getElementById("charlie-public-formula").textContent = "-";
  document.getElementById("charlie-k-formula").textContent = "-";
  document.getElementById("charlie-s-formula").textContent = "-";
  document.getElementById("arrow1").style.display = "none";
  document.getElementById("arrow2").style.display = "none";
}

function toggleTheme() {
  const isDark = document.getElementById("theme-switch").checked;
  document.documentElement.setAttribute("data-theme", isDark ? "dark" : "light");
  localStorage.setItem("theme", isDark ? "dark" : "light");
}

function showTheory() {
  document.getElementById("theory-modal").style.display = "block";
}

function hideTheory() {
  document.getElementById("theory-modal").style.display = "none";
}

function showTwoParticipantsTheory() {
  const modal = document.getElementById("two-participants-modal");
  const content = document.getElementById("two-participants-theory-content");
  
  const a = parseInt(document.getElementById("alice-private-key").value) || 13;
  const b = parseInt(document.getElementById("bob-private-key").value) || 5;
  const A = modExp(g, a, p);
  const B = modExp(g, b, p);
  const K_Alice = modExp(B, a, p);
  const S = modExp(g, a * b, p);

  content.innerHTML = `
    <p>Imagine two friends: <strong>Alice</strong> and <strong>Bob</strong>. They want to create a <em>secret code</em> using <strong>Diffie-Hellman</strong>. Here’s how:</p>

    <p><strong>Step 1: Agree on Magic Numbers 🪄</strong></p>
    <p>They pick:<br>
    - <em>p</em> = ${p}.<br>
    - <em>g</em> = ${g}.<br>
    These are public.</p>

    <p><strong>Step 2: Pick Secret Numbers 🤫</strong></p>
    <p>They choose:<br>
    - Alice: <em>a = ${a}</em>.<br>
    - Bob: <em>b = ${b}</em>.<br>
    These are private.</p>

    <p><strong>Step 3: Make Public Keys 🔑</strong></p>
    <p>They compute: <em>Public Key 1 = g^(Secret Number) mod p</em><br>
    - Alice: <em>${g}^${a} mod ${p} = ${A}</em> → <strong>${A}</strong>.<br>
    - Bob: <em>${g}^${b} mod ${p} = ${B}</em> → <strong>${B}</strong>.</p>

    <p><strong>Step 4: Share Public Keys 📬</strong></p>
    <p>Alice sends <strong>${A}</strong> to Bob, Bob sends <strong>${B}</strong> to Alice.</p>

    <p><strong>Step 5: Compute Public Key 2 🔒</strong></p>
    <p>They compute:<br>
    - Alice: <em>${B}^${a} mod ${p} = ${K_Alice}</em>.<br>
    - Bob: <em>${A}^${b} mod ${p} = ${K_Alice}</em>.</p>

    <p><strong>Step 6: Compute Shared Secret (S) 🔒</strong></p>
    <p>They compute: <em>S = g^(a*b) mod p</em><br>
    - <em>${g}^(${a}*${b}) mod ${p} = ${S}</em>.<br>
    Result: <strong>S = ${S}</strong>!</p>

    <p><strong>Step 7: Use the Secret! 💬</strong></p>
    <p>With <strong>${S}</strong>, they encrypt messages.</p>
  `;
  
  modal.style.display = "block";
}

function hideTwoParticipantsTheory() {
  document.getElementById("two-participants-modal").style.display = "none";
}

function showThreeParticipantsTheory() {
  const modal = document.getElementById("three-participants-modal");
  const content = document.getElementById("three-participants-theory-content");
  
  const a = parseInt(document.getElementById("alice-private-key").value) || 13;
  const b = parseInt(document.getElementById("bob-private-key").value) || 5;
  const c = parseInt(document.getElementById("charlie-private-key").value) || 12;
  const A = modExp(g, a, p);
  const B = modExp(g, b, p);
  const C = modExp(g, c, p);
  const K_Alice = modExp(C, a, p);
  const K_Bob = modExp(A, b, p);
  const K_Charlie = modExp(B, c, p);
  const S = modExp(g, a * b * c, p);

  content.innerHTML = `
    <p>Three friends: <strong>Alice</strong>, <strong>Bob</strong>, and <strong>Charlie</strong> create a <em>shared secret</em> using <strong>Diffie-Hellman</strong>.</p>

    <p><strong>Step 1: Agree on Magic Numbers 🪄</strong></p>
    <p>They pick:<br>
    - <em>p</em> = ${p}.<br>
    - <em>g</em> = ${g}.<br>
    These are public.</p>

    <p><strong>Step 2: Pick Secret Numbers 🤫</strong></p>
    <p>They choose:<br>
    - Alice: <em>a = ${a}</em>.<br>
    - Bob: <em>b = ${b}</em>.<br>
    - Charlie: <em>c = ${c}</em>.<br>
    These are private.</p>

    <p><strong>Step 3: Make Public Keys 🔑</strong></p>
    <p>They compute: <em>Public Key 1 = g^(Secret Number) mod p</em><br>
    - Alice: <em>${g}^${a} mod ${p} = ${A}</em> → <strong>${A}</strong>.<br>
    - Bob: <em>${g}^${b} mod ${p} = ${B}</em> → <strong>${B}</strong>.<br>
    - Charlie: <em>${g}^${c} mod ${p} = ${C}</em> → <strong>${C}</strong>.</p>

    <p><strong>Step 4: Share Public Keys in a Cycle 📬</strong></p>
    <p>They exchange:<br>
    - Alice sends <strong>${A}</strong> to Bob.<br>
    - Bob sends <strong>${B}</strong> to Charlie.<br>
    - Charlie sends <strong>${C}</strong> to Alice.</p>

    <p><strong>Step 5: Compute Public Key 2 🔒</strong></p>
    <p>They compute:<br>
    - Alice: <em>${C}^${a} mod ${p} = ${K_Alice}</em>.<br>
    - Bob: <em>${A}^${b} mod ${p} = ${K_Bob}</em>.<br>
    - Charlie: <em>${B}^${c} mod ${p} = ${K_Charlie}</em>.</p>

    <p><strong>Step 6: Compute Shared Secret (S) 🔒</strong></p>
    <p>They compute: <em>S = g^(a*b*c) mod p</em><br>
    - <em>${g}^(${a}*${b}*${c}) mod ${p} = ${S}</em>.<br>
    Result: <strong>S = ${S}</strong>!</p>

    <p><strong>Step 7: Use the Secret! 💬</strong></p>
    <p>With <strong>${S}</strong>, they encrypt messages.</p>
  `;
  
  modal.style.display = "block";
}

function hideThreeParticipantsTheory() {
  const modal = document.getElementById("three-participants-modal");
  modal.style.display = "none";
}

function showAliceTheory() {
  const modal = document.getElementById("alice-theory-modal");
  const content = document.getElementById("alice-theory-content");
  
  const a = parseInt(document.getElementById("alice-private-key").value) || 13;
  const A = modExp(g, a, p);
  const b = parseInt(document.getElementById("bob-private-key").value) || 5;
  const B = modExp(g, b, p);
  const c = parseInt(document.getElementById("charlie-private-key").value) || 12;
  const C = modExp(g, c, p);
  const K_Alice = mode === 3 ? modExp(C, a, p) : modExp(B, a, p);
  const S = mode === 3 ? modExp(g, a * b * c, p) : modExp(g, a * b, p);

  content.innerHTML = `
    <p>Hi! I’m <strong>Alice</strong>, creating a <em>secret code</em>! 😊 My role:</p>
    <ul>
      <li><strong>Step 1: Agree on Numbers</strong> 🪄<br><em>p = ${p}</em>, <em>g = ${g}</em>.</li>
      <li><strong>Step 2: Pick Secret</strong> 🤫<br><em>a = ${a}</em>.</li>
      <li><strong>Step 3: Make Public Key 1</strong> 🔑<br><em>${g}^${a} mod ${p} = ${A}</em> → <strong>${A}</strong>.</li>
      <li><strong>Step 4: Share Keys</strong> 📬<br>Send <strong>${A}</strong> to Bob, get <strong>${mode === 3 ? C : B}</strong> from ${mode === 3 ? "Charlie" : "Bob"}.</li>
      <li><strong>Step 5: Compute Public Key 2</strong> 🔒<br><em>${mode === 3 ? `${C}^${a}` : `${B}^${a}`} mod ${p} = ${K_Alice}</em> → <strong>${K_Alice}</strong>.</li>
      <li><strong>Step 6: Compute Shared Secret (S)</strong> 🔒<br><em>S = ${g}^(${mode === 3 ? `${a}*${b}*${c}` : `${a}*${b}`}) mod ${p} = ${S}</em> → <strong>${S}</strong>.</li>
      <li><strong>Step 7: Use Secret</strong> 💬<br>Encrypt with <strong>${S}</strong>!</li>
    </ul>
  `;
  
  modal.style.display = "block";
}

function hideAliceTheory() {
  document.getElementById("alice-theory-modal").style.display = "none";
}

function showBobTheory() {
  const modal = document.getElementById("bob-theory-modal");
  const content = document.getElementById("bob-theory-content");
  
  const b = parseInt(document.getElementById("bob-private-key").value) || 5;
  const B = modExp(g, b, p);
  const a = parseInt(document.getElementById("alice-private-key").value) || 13;
  const A = modExp(g, a, p);
  const c = parseInt(document.getElementById("charlie-private-key").value) || 12;
  const C = modExp(g, c, p);
  const K_Bob = mode === 3 ? modExp(A, b, p) : modExp(A, b, p);
  const S = mode === 3 ? modExp(g, a * b * c, p) : modExp(g, a * b, p);

  content.innerHTML = `
    <p>Hello! I’m <strong>Bob</strong>, creating a <em>secret code</em>! 😊 My role:</p>
    <ul>
      <li><strong>Step 1: Agree on Numbers</strong> 🪄<br><em>p = ${p}</em>, <em>g = ${g}</em>.</li>
      <li><strong>Step 2: Pick Secret</strong> 🤫<br><em>b = ${b}</em>.</li>
      <li><strong>Step 3: Make Public Key 1</strong> 🔑<br><em>${g}^${b} mod ${p} = ${B}</em> → <strong>${B}</strong>.</li>
      <li><strong>Step 4: Share Keys</strong> 📬<br>Send <strong>${B}</strong> to ${mode === 3 ? "Charlie" : "Alice"}, get <strong>${A}</strong> from Alice.</li>
      <li><strong>Step 5: Compute Public Key 2</strong> 🔒<br><em>${A}^${b} mod ${p} = ${K_Bob}</em> → <strong>${K_Bob}</strong>.</li>
      <li><strong>Step 6: Compute Shared Secret (S)</strong> 🔒<br><em>S = ${g}^(${mode === 3 ? `${a}*${b}*${c}` : `${a}*${b}`}) mod ${p} = ${S}</em> → <strong>${S}</strong>.</li>
      <li><strong>Step 7: Use Secret</strong> 💬<br>Encrypt with <strong>${S}</strong>!</li>
    </ul>
  `;
  
  modal.style.display = "block";
}

function hideBobTheory() {
  document.getElementById("bob-theory-modal").style.display = "none";
}

function showCharlieTheory() {
  const modal = document.getElementById("charlie-theory-modal");
  const content = document.getElementById("charlie-theory-content");
  
  const c = parseInt(document.getElementById("charlie-private-key").value) || 12;
  const C = modExp(g, c, p);
  const a = parseInt(document.getElementById("alice-private-key").value) || 13;
  const A = modExp(g, a, p);
  const b = parseInt(document.getElementById("bob-private-key").value) || 5;
  const B = modExp(g, b, p);
  const K_Charlie = modExp(B, c, p);
  const S = modExp(g, a * b * c, p);

  content.innerHTML = `
    <p>Hi! I’m <strong>Charlie</strong>, creating a <em>secret code</em>! 😊 My role:</p>
    <ul>
      <li><strong>Step 1: Agree on Numbers</strong> 🪄<br><em>p = ${p}</em>, <em>g = ${g}</em>.</li>
      <li><strong>Step 2: Pick Secret</strong> 🤫<br><em>c = ${c}</em>.</li>
      <li><strong>Step 3: Make Public Key 1</strong> 🔑<br><em>${g}^${c} mod ${p} = ${C}</em> → <strong>${C}</strong>.</li>
      <li><strong>Step 4: Share Keys</strong> 📬<br>Send <strong>${C}</strong> to Alice, get <strong>${B}</strong> from Bob.</li>
      <li><strong>Step 5: Compute Public Key 2</strong> 🔒<br><em>${B}^${c} mod ${p} = ${K_Charlie}</em> → <strong>${K_Charlie}</strong>.</li>
      <li><strong>Step 6: Compute Shared Secret (S)</strong> 🔒<br><em>S = ${g}^(${a}*${b}*${c}) mod ${p} = ${S}</em> → <strong>${S}</strong>.</li>
      <li><strong>Step 7: Use Secret</strong> 💬<br>Encrypt with <strong>${S}</strong>!</li>
    </ul>
  `;
  
  modal.style.display = "block";
}

function hideCharlieTheory() {
  document.getElementById("charlie-theory-modal").style.display = "none";
}

function setMode(selectedMode) {
  mode = selectedMode;
  document.getElementById("start-button").disabled = false;
  document.getElementById("charlie").style.display = mode === 3 ? "block" : "none";
  document.getElementById("arrow2").style.display = mode === 3 ? "inline" : "none";

  updateExplanation(`Mode selected: ${mode} Participants. Press Start to begin the exchange.`);
  resetFields();
  validateAllInputs();
}

function validateAllInputs() {
  const pValue = parseInt(document.getElementById("param-p").value) || 23;
  const gValid = validateG();
  const pValid = validateP(pValue);
  const aliceValid = validatePrivateKey(parseInt(document.getElementById("alice-private-key").value) || 13, "a", "Alice's a");
  const bobValid = validatePrivateKey(parseInt(document.getElementById("bob-private-key").value) || 5, "b", "Bob's b");
  let charlieValid = true;
  if (mode === 3) {
    charlieValid = validatePrivateKey(parseInt(document.getElementById("charlie-private-key").value) || 12, "c", "Charlie's c");
  }
  // Enable Start button only if all validations pass
  document.getElementById("start-button").disabled = !(pValid && gValid && aliceValid && bobValid && charlieValid && mode !== null);
}

function startExchange() {
  if (!mode) {
    updateExplanation("Please select a mode (2 or 3 Participants) first!");
    return;
  }

  p = parseInt(document.getElementById("param-p").value) || 23;
  g = parseInt(document.getElementById("param-g").value);
  const a = parseInt(document.getElementById("alice-private-key").value);
  const b = parseInt(document.getElementById("bob-private-key").value);
  const c = mode === 3 ? parseInt(document.getElementById("charlie-private-key").value) : null;

  if (!validateP(p) || !validateG() ||
      !validatePrivateKey(a, "a", "Alice's a") ||
      !validatePrivateKey(b, "b", "Bob's b") ||
      (mode === 3 && !validatePrivateKey(c, "c", "Charlie's c"))) {
    updateExplanation("Error: Please check all input values!");
    return;
  }

  clearTimers();
  resetFields();
  isStopped = false;
  currentStep = 0;

  document.getElementById("start-button").disabled = true;
  document.getElementById("stop-button").disabled = false;
  document.getElementById("back-button").disabled = true;
  document.getElementById("resume-button").disabled = true;

  // Update private key displays immediately
  document.getElementById("alice-private").textContent = a;
  document.getElementById("alice-private-formula").textContent = `a = ${a}`;
  document.getElementById("bob-private").textContent = b;
  document.getElementById("bob-private-formula").textContent = `b = ${b}`;
  if (mode === 3) {
    document.getElementById("charlie-private").textContent = c;
    document.getElementById("charlie-private-formula").textContent = `c = ${c}`;
  }

  const A = modExp(g, a, p);
  const B = modExp(g, b, p);
  const C = mode === 3 ? modExp(g, c, p) : null;

  if (mode === 2) {
    updateExplanation(`Step 1: Agreeing on public parameters. We use p = ${p} (a prime number) and g = ${g} (a generator).`);
    timers.push(setTimeout(() => {
      currentStep = 1;
      document.getElementById("back-button").disabled = false;
    }, 500));

    timers.push(setTimeout(() => {
      if (isStopped) return;
      updateExplanation(`Step 2: Selecting private keys. Alice picks a = ${a}, Bob picks b = ${b}.`);
      highlightElement("alice-private");
      highlightElement("bob-private");
      currentStep = 2;
    }, 2000));

    timers.push(setTimeout(() => {
      if (isStopped) return;
      updateExplanation(`Step 3: Computing public keys: Public Key 1 = g^(Private Key) mod p.`);
      timers.push(setTimeout(() => {
        document.getElementById("alice-public").textContent = A;
        document.getElementById("alice-public-formula").textContent = `A = ${g}^${a} mod ${p} = ${A}`;
        updateExplanation(`Step 3: Alice computes: A = ${g}^${a} mod ${p} = ${A}.`);
        highlightElement("alice-public");
      }, 500));

      timers.push(setTimeout(() => {
        document.getElementById("bob-public").textContent = B;
        document.getElementById("bob-public-formula").textContent = `B = ${g}^${b} mod ${p} = ${B}`;
        updateExplanation(`Step 3: Bob computes: B = ${g}^${b} mod ${p} = ${B}.`);
        highlightElement("bob-public");
      }, 1500));
      currentStep = 3;
    }, 4000));

    timers.push(setTimeout(() => {
      if (isStopped) return;
      updateExplanation(`Step 4: Exchanging public keys over an insecure channel.`);
      timers.push(setTimeout(() => {
        updateExplanation(`Step 4: Alice sends A = ${A} to Bob.`);
        animateArrow("arrow1");
      }, 500));

      timers.push(setTimeout(() => {
        updateExplanation(`Step 4: Bob sends B = ${B} to Alice.`);
        animateArrow("arrow1");
      }, 1500));
      currentStep = 4;
    }, 6000));

    timers.push(setTimeout(() => {
      if (isStopped) return;
      const K_Alice = modExp(B, a, p);
      const K_Bob = modExp(A, b, p);
      updateExplanation(`Step 5: Computing Public Key 2.`);
      timers.push(setTimeout(() => {
        updateExplanation(`Step 5: Alice computes B^a mod ${p} = ${B}^${a} mod ${p} = ${K_Alice}.`);
        document.getElementById("alice-k").textContent = K_Alice;
        document.getElementById("alice-k-formula").textContent = `K = ${B}^${a} mod ${p} = ${K_Alice}`;
        highlightElement("alice-k");
      }, 500));

      timers.push(setTimeout(() => {
        updateExplanation(`Step 5: Bob computes A^b mod ${p} = ${A}^${b} mod ${p} = ${K_Bob}.`);
        document.getElementById("bob-k").textContent = K_Bob;
        document.getElementById("bob-k-formula").textContent = `K = ${A}^${b} mod ${p} = ${K_Bob}`;
        highlightElement("bob-k");
      }, 1500));

      timers.push(setTimeout(() => {
        const S = modExp(g, a * b, p);
        updateExplanation(`Step 6: Computing the shared secret S = g^(a*b) mod p.`);
        timers.push(setTimeout(() => {
          document.getElementById("alice-s").textContent = S;
          document.getElementById("alice-s-formula").textContent = `S = ${g}^(${a}*${b}) mod ${p} = ${S}`;
          document.getElementById("bob-s").textContent = S;
          document.getElementById("bob-s-formula").textContent = `S = ${g}^(${a}*${b}) mod ${p} = ${S}`;
          updateExplanation(`Step 6: Both compute S = ${g}^(${a}*${b}) mod ${p} = ${S}.`);
          highlightElement("alice-s");
          highlightElement("bob-s");
        }, 500));

        timers.push(setTimeout(() => {
          updateExplanation(`Step 7: The shared secret is S = ${S}. Alice and Bob can now encrypt messages!`);
          document.getElementById("stop-button").disabled = true;
          document.getElementById("back-button").disabled = true;
          document.getElementById("resume-button").disabled = true;
        }, 1500));
      }, 2500));
      currentStep = 5;
    }, 8000));
  } else {
    updateExplanation(`Step 1: Agreeing on public parameters. We use p = ${p} (a prime number) and g = ${g} (a generator).`);
    timers.push(setTimeout(() => {
      currentStep = 1;
      document.getElementById("back-button").disabled = false;
    }, 500));

    timers.push(setTimeout(() => {
      if (isStopped) return;
      updateExplanation(`Step 2: Selecting private keys. Alice picks a = ${a}, Bob picks b = ${b}, Charlie picks c = ${c}.`);
      highlightElement("alice-private");
      highlightElement("bob-private");
      highlightElement("charlie-private");
      currentStep = 2;
    }, 2000));

    timers.push(setTimeout(() => {
      if (isStopped) return;
      updateExplanation(`Step 3: Computing public keys: Public Key 1 = g^(Private Key) mod p.`);
      timers.push(setTimeout(() => {
        document.getElementById("alice-public").textContent = A;
        document.getElementById("alice-public-formula").textContent = `A = ${g}^${a} mod ${p} = ${A}`;
        updateExplanation(`Step 3: Alice computes: A = ${g}^${a} mod ${p} = ${A}.`);
        highlightElement("alice-public");
      }, 500));

      timers.push(setTimeout(() => {
        document.getElementById("bob-public").textContent = B;
        document.getElementById("bob-public-formula").textContent = `B = ${g}^${b} mod ${p} = ${B}`;
        updateExplanation(`Step 3: Bob computes: B = ${g}^${b} mod ${p} = ${B}.`);
        highlightElement("bob-public");
      }, 1500));

      timers.push(setTimeout(() => {
        document.getElementById("charlie-public").textContent = C;
        document.getElementById("charlie-public-formula").textContent = `C = ${g}^${c} mod ${p} = ${C}`;
        updateExplanation(`Step 3: Charlie computes: C = ${g}^${c} mod ${p} = ${C}.`);
        highlightElement("charlie-public");
      }, 2500));
      currentStep = 3;
    }, 4000));

    timers.push(setTimeout(() => {
      if (isStopped) return;
      updateExplanation(`Step 4: Exchanging public keys in a cycle over an insecure channel.`);
      timers.push(setTimeout(() => {
        updateExplanation(`Step 4: Alice sends A = ${A} to Bob.`);
        animateArrow("arrow1");
      }, 500));

      timers.push(setTimeout(() => {
        updateExplanation(`Step 4: Bob sends B = ${B} to Charlie.`);
        animateArrow("arrow2");
      }, 1500));

      timers.push(setTimeout(() => {
        updateExplanation(`Step 4: Charlie sends C = ${C} to Alice.`);
        animateArrow("arrow1");
      }, 2500));
      currentStep = 4;
    }, 7000));

    timers.push(setTimeout(() => {
      if (isStopped) return;
      const K_Alice = modExp(C, a, p);
      const K_Bob = modExp(A, b, p);
      const K_Charlie = modExp(B, c, p);
      updateExplanation(`Step 5: Computing Public Key 2.`);
      timers.push(setTimeout(() => {
        updateExplanation(`Step 5: Alice computes C^a mod ${p} = ${C}^${a} mod ${p} = ${K_Alice}.`);
        document.getElementById("alice-k").textContent = K_Alice;
        document.getElementById("alice-k-formula").textContent = `K = ${C}^${a} mod ${p} = ${K_Alice}`;
        highlightElement("alice-k");
      }, 500));

      timers.push(setTimeout(() => {
        updateExplanation(`Step 5: Bob computes A^b mod ${p} = ${A}^${b} mod ${p} = ${K_Bob}.`);
        document.getElementById("bob-k").textContent = K_Bob;
        document.getElementById("bob-k-formula").textContent = `K = ${A}^${b} mod ${p} = ${K_Bob}`;
        highlightElement("bob-k");
      }, 1500));

      timers.push(setTimeout(() => {
        updateExplanation(`Step 5: Charlie computes B^c mod ${p} = ${B}^${c} mod ${p} = ${K_Charlie}.`);
        document.getElementById("charlie-k").textContent = K_Charlie;
        document.getElementById("charlie-k-formula").textContent = `K = ${B}^${c} mod ${p} = ${K_Charlie}`;
        highlightElement("charlie-k");
      }, 2500));

      timers.push(setTimeout(() => {
        const S = modExp(g, a * b * c, p);
        updateExplanation(`Step 6: Computing the shared secret S = g^(a*b*c) mod p.`);
        timers.push(setTimeout(() => {
          document.getElementById("alice-s").textContent = S;
          document.getElementById("alice-s-formula").textContent = `S = ${g}^(${a}*${b}*${c}) mod ${p} = ${S}`;
          document.getElementById("bob-s").textContent = S;
          document.getElementById("bob-s-formula").textContent = `S = ${g}^(${a}*${b}*${c}) mod ${p} = ${S}`;
          document.getElementById("charlie-s").textContent = S;
          document.getElementById("charlie-s-formula").textContent = `S = ${g}^(${a}*${b}*${c}) mod ${p} = ${S}`;
          updateExplanation(`Step 6: All compute S = ${g}^(${a}*${b}*${c}) mod ${p} = ${S}.`);
          highlightElement("alice-s");
          highlightElement("bob-s");
          highlightElement("charlie-s");
        }, 500));

        timers.push(setTimeout(() => {
          updateExplanation(`Step 7: The shared secret is S = ${S}. All participants can now encrypt messages!`);
          document.getElementById("stop-button").disabled = true;
          document.getElementById("back-button").disabled = true;
          document.getElementById("resume-button").disabled = true;
        }, 1500));
      }, 3500));
      currentStep = 5;
    }, 10000));
  }
}

function stopExchange() {
  isStopped = true;
  document.getElementById("stop-button").disabled = true;
  document.getElementById("resume-button").disabled = false;
  document.getElementById("back-button").disabled = false;
  updateExplanation("Exchange paused. Use Resume to continue or Back to go to the previous step.");
}

function resumeExchange() {
  isStopped = false;
  document.getElementById("stop-button").disabled = false;
  document.getElementById("resume-button").disabled = true;
  startExchange();
}

function backStep() {
  clearTimers();
  isStopped = true;
  currentStep = Math.max(0, currentStep - 1);
  resetFields();
  startExchange();
}

function reset() {
  clearTimers();
  resetFields();
  mode = null;
  isStopped = false;
  currentStep = 0;
  document.getElementById("start-button").disabled = true;
  document.getElementById("stop-button").disabled = true;
  document.getElementById("back-button").disabled = true;
  document.getElementById("resume-button").disabled = true;
  document.getElementById("charlie").style.display = "none";
  document.getElementById("arrow2").style.display = "none";
  updateExplanation("⚠️ Please select a mode (2 or 3 Participants) to begin the key exchange process. This step is required to continue!");
}

// Initialize on page load
document.addEventListener("DOMContentLoaded", () => {
  updatePrimitiveRoots();

  // Add event listeners for input changes
  document.getElementById("param-p").addEventListener("change", () => {
    updatePrimitiveRoots();
  });

  document.getElementById("param-g").addEventListener("change", () => {
    g = parseInt(document.getElementById("param-g").value);
    validateG();
    validateAllInputs();
  });

  document.getElementById("alice-private-key").addEventListener("input", () => {
    validatePrivateKey(parseInt(document.getElementById("alice-private-key").value) || 13, "a", "Alice's a");
    validateAllInputs();
  });

  document.getElementById("bob-private-key").addEventListener("input", () => {
    validatePrivateKey(parseInt(document.getElementById("bob-private-key").value) || 5, "b", "Bob's b");
    validateAllInputs();
  });

  document.getElementById("charlie-private-key").addEventListener("input", () => {
    validatePrivateKey(parseInt(document.getElementById("charlie-private-key").value) || 12, "c", "Charlie's c");
    validateAllInputs();
  });
});
