 /* Global variables */
let mode = null;
let step = 0;
let p = 29;
let g = 2;
let timers = [];
let isStopped = false;
let currentStep = 0;

/* Toggle theme function */
function toggleTheme() {
  const body = document.body;
  const themeSwitch = document.getElementById('theme-switch');
  body.classList.toggle('dark-theme', themeSwitch.checked);
  localStorage.setItem('theme', themeSwitch.checked ? 'dark' : 'light');
}

/* Check if a number is prime */
function isPrime(n) {
  if (n < 2) return false;
  for (let i = 2; i <= Math.sqrt(n); i++) {
    if (n % i === 0) return false;
  }
  return true;
}

/* Validate p */
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
    pError.textContent = "Error: P must be a prime number! Try 23, 29, or 47.";
    pError.classList.add("active");
    return false;
  }
  const halfPMinus1 = (pValue - 1) / 2;
  if (!Number.isInteger(halfPMinus1) || !isPrime(halfPMinus1)) {
    pError.textContent = "Error: (P-1)/2 must be a prime number! Try 23, 29, or 47.";
    pError.classList.add("active");
    return false;
  }
  pSuccess.textContent = "Success: P is valid!";
  pSuccess.classList.add("active");
  return true;
}

/* Validate g */
function validateG(gValue) {
  const gError = document.getElementById("g-error");
  const gSuccess = document.getElementById("g-success");
  gError.classList.remove("active");
  gSuccess.classList.remove("active");

  const pValue = parseInt(document.getElementById("param-p").value) || 29;

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

/* Set mode (2 or 3 participants) */
function setMode(m) {
  mode = m;
  document.getElementById("charlie").style.display = m === 3 ? "inline-block" : "none";
  document.getElementById("arrow2").style.display = m === 3 ? "inline-block" : "none";
  document.getElementById("start-button").disabled = false;
  updateExplanation(`Mode selected: ${m} Participants. Click 'Start Exchange' to begin the key exchange process.`);
}

/* Modular exponentiation function */
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

/* Update explanation text with detailed steps */
function updateExplanation(text) {
  const explanation = document.getElementById("explanation-text");
  if (explanation) explanation.textContent = text;
}

/* Highlight an element */
function highlightElement(elementId) {
  const element = document.getElementById(elementId);
  if (element) {
    element.classList.remove("highlight");
    void element.offsetWidth;
    element.classList.add("highlight");
  }
}

/* Animate arrows */
function animateArrow(arrowId) {
  const arrow = document.getElementById(arrowId);
  if (arrow) arrow.classList.add("active");
}

/* Clear timers */
function clearTimers() {
  timers.forEach(timer => clearTimeout(timer));
  timers = [];
}

/* Generate a random private key */
function getRandomPrivateKey() {
  return Math.floor(Math.random() * 9) + 2; // Random number between 2 and 10
}

/* Start the key exchange process */
function startExchange() {
  if (!mode) {
    updateExplanation("Please select a mode (2 or 3 Participants) first!");
    return;
  }

  p = parseInt(document.getElementById("param-p").value) || 29;
  g = parseInt(document.getElementById("param-g").value) || 2;

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

  // Используем фиксированные приватные ключи для получения S = 19
  const a = 3; // Alice's private key
  const b = 3; // Bob's private key
  const c = 1; // Carol's private key

  // Compute public keys
  const A = modExp(g, a, p); // Alice's public key: 2^3 mod 29 = 8
  const B = modExp(g, b, p); // Bob's public key: 2^3 mod 29 = 8
  const C = modExp(g, c, p); // Carol's public key: 2^1 mod 29 = 2

  // Step 1: Agree on public parameters
  updateExplanation(`Step 1: Agreeing on public parameters. We use p = ${p} (a prime number) and g = ${g} (a generator). These are shared openly.`);
  timers.push(setTimeout(() => {
    currentStep = 1;
    document.getElementById("back-button").disabled = false;
  }, 500));

  // Step 2: Selecting private keys
  timers.push(setTimeout(() => {
    if (isStopped) return;
    updateExplanation(`Step 2: Selecting private keys. Alice picks a = ${a}, Bob picks b = ${b}, and Carol picks c = ${c}. These are secret and never shared.`);
    document.getElementById("alice-private").textContent = a;
    document.getElementById("alice-private-formula").textContent = `a = ${a}`;
    highlightElement("alice-private");
    document.getElementById("bob-private").textContent = b;
    document.getElementById("bob-private-formula").textContent = `b = ${b}`;
    highlightElement("bob-private");
    document.getElementById("charlie-private").textContent = c;
    document.getElementById("charlie-private-formula").textContent = `c = ${c}`;
    highlightElement("charlie-private");
    currentStep = 2;
  }, 2000));

  // Step 3: Computing public keys
  timers.push(setTimeout(() => {
    if (isStopped) return;
    updateExplanation(`Step 3: Computing public keys using the formula: Public Key = g^(Private Key) mod p.`);
    timers.push(setTimeout(() => {
      document.getElementById("alice-public").textContent = A;
      document.getElementById("alice-public-formula").textContent = `A = ${g}^${a} mod ${p} = ${A}`;
      updateExplanation(`Step 3: Alice computes her public key: A = ${g}^${a} mod ${p} = ${A}.`);
      highlightElement("alice-public");
    }, 500));

    timers.push(setTimeout(() => {
      document.getElementById("bob-public").textContent = B;
      document.getElementById("bob-public-formula").textContent = `B = ${g}^${b} mod ${p} = ${B}`;
      updateExplanation(`Step 3: Bob computes his public key: B = ${g}^${b} mod ${p} = ${B}.`);
      highlightElement("bob-public");
    }, 1500));

    timers.push(setTimeout(() => {
      document.getElementById("charlie-public").textContent = C;
      document.getElementById("charlie-public-formula").textContent = `C = ${g}^${c} mod ${p} = ${C}`;
      updateExplanation(`Step 3: Carol computes her public key: C = ${g}^${c} mod ${p} = ${C}.`);
      highlightElement("charlie-public");
    }, 2500));
    currentStep = 3;
  }, 4000));

  // Step 4: Exchanging public keys (cyclic exchange)
  timers.push(setTimeout(() => {
    if (isStopped) return;
    updateExplanation(`Step 4: Exchanging public keys in a cyclic order over an insecure channel.`);
    // Alice -> Bob
    const AB = modExp(A, b, p); // (ga)^b mod p
    timers.push(setTimeout(() => {
      updateExplanation(`Step 4: Alice sends A = ${A} to Bob. Bob computes (A)^b mod ${p} = ${AB} and sends to Carol.`);
      animateArrow("arrow1");
    }, 500));

    // Bob -> Carol
    const ABC = modExp(AB, c, p); // (gab)^c mod p
    timers.push(setTimeout(() => {
      updateExplanation(`Step 4: Bob sends ${AB} to Carol. Carol computes (${AB})^c mod ${p} = ${ABC} and sends to Alice.`);
      animateArrow("arrow2");
    }, 1500));

    // Bob -> Carol
    const BC = modExp(B, c, p); // (gb)^c mod p
    timers.push(setTimeout(() => {
      updateExplanation(`Step 4: Bob sends B = ${B} to Carol. Carol computes (B)^c mod ${p} = ${BC} and sends to Alice.`);
    }, 2500));

    // Carol -> Alice
    const BCA = modExp(BC, a, p); // (gbc)^a mod p
    timers.push(setTimeout(() => {
      updateExplanation(`Step 4: Carol sends ${BC} to Alice. Alice computes (${BC})^a mod ${p} = ${BCA}.`);
    }, 3500));

    // Carol -> Alice
    const CA = modExp(C, a, p); // (gc)^a mod p
    timers.push(setTimeout(() => {
      updateExplanation(`Step 4: Carol sends C = ${C} to Alice. Alice computes (C)^a mod ${p} = ${CA} and sends to Bob.`);
    }, 4500));

    // Alice -> Bob
    const CAB = modExp(CA, b, p); // (gca)^b mod p
    timers.push(setTimeout(() => {
      updateExplanation(`Step 4: Alice sends ${CA} to Bob. Bob computes (${CA})^b mod ${p} = ${CAB}.`);
    }, 5500));
    currentStep = 4;
  }, 6500));

  // Step 5: Computing shared secret
  timers.push(setTimeout(() => {
    if (isStopped) return;
    updateExplanation(`Step 5: Computing the shared secret using two steps for each participant.`);

    // Alice: Carol -> Alice -> Bob
    const CA_alice = modExp(C, a, p); // K1 = C^a mod p
    const CAB_alice = modExp(CA_alice, b, p); // S = (C^a)^b mod p

    // Bob: Alice -> Bob -> Carol
    const AB_bob = modExp(A, b, p); // K1 = A^b mod p
    const ABC_bob = modExp(AB_bob, c, p); // S = (A^b)^c mod p

    // Carol: Bob -> Carol -> Alice
    const BC_carol = modExp(B, c, p); // K1 = B^c mod p
    const BCA_carol = modExp(BC_carol, a, p); // S = (B^c)^a mod p

    const sharedSecret = CAB_alice; // All should get 19

    timers.push(setTimeout(() => {
      updateExplanation(`Step 5: Alice (Carol -> Alice -> Bob). First, intermediate key: K1 = ${C}^${a} mod ${p} = ${CA_alice}. Then final: S = (${CA_alice})^${b} mod ${p} = ${CAB_alice}.`);
      document.getElementById("alice-secret").textContent = sharedSecret;
      document.getElementById("alice-secret-formula").textContent = `K1 = ${C}^${a} mod ${p} = ${CA_alice}, S = (${CA_alice})^${b} mod ${p} = ${sharedSecret}`;
      highlightElement("alice-secret");
    }, 500));

    timers.push(setTimeout(() => {
      updateExplanation(`Step 5: Bob (Alice -> Bob -> Carol). First, intermediate key: K1 = ${A}^${b} mod ${p} = ${AB_bob}. Then final: S = (${AB_bob})^${c} mod ${p} = ${ABC_bob}.`);
      document.getElementById("bob-secret").textContent = sharedSecret;
      document.getElementById("bob-secret-formula").textContent = `K1 = ${A}^${b} mod ${p} = ${AB_bob}, S = (${AB_bob})^${c} mod ${p} = ${sharedSecret}`;
      highlightElement("bob-secret");
    }, 1500));

    timers.push(setTimeout(() => {
      updateExplanation(`Step 5: Carol (Bob -> Carol -> Alice). First, intermediate key: K1 = ${B}^${c} mod ${p} = ${BC_carol}. Then final: S = (${BC_carol})^${a} mod ${p} = ${BCA_carol}.`);
      document.getElementById("charlie-secret").textContent = sharedSecret;
      document.getElementById("charlie-secret-formula").textContent = `K1 = ${B}^${c} mod ${p} = ${BC_carol}, S = (${BC_carol})^${a} mod ${p} = ${sharedSecret}`;
      highlightElement("charlie-secret");
    }, 2500));

    timers.push(setTimeout(() => {
      updateExplanation(`Step 6: The shared secret is ${sharedSecret}. Alice, Bob, and Carol can now use this to encrypt messages securely!`);
      document.getElementById("stop-button").disabled = true;
      document.getElementById("back-button").disabled = true;
      document.getElementById("resume-button").disabled = true;
    }, 3500));
    currentStep = 5;
  }, 9000));
}

/* Stop the exchange process */
function stopExchange() {
  isStopped = true;
  clearTimers();
  document.getElementById("stop-button").disabled = true;
  document.getElementById("resume-button").disabled = false;
  updateExplanation(`Paused at Step ${currentStep}: ${getStepText(currentStep)}.`);
}

/* Go back one step */
function backStep() {
  if (currentStep > 1) {
    currentStep--;
    clearTimers();
    updateExplanation(`Returned to Step ${currentStep}: ${getStepText(currentStep)}.`);
    resumeExchange();
  } else {
    updateExplanation("Already at Step 1: Agreeing on public parameters.");
  }
  document.getElementById("back-button").disabled = currentStep <= 1;
}

/* Resume the exchange process */
function resumeExchange() {
  isStopped = false;
  document.getElementById("resume-button").disabled = true;
  document.getElementById("stop-button").disabled = false;
  startExchange();
}

/* Get step text for pausing/resuming */
function getStepText(step) {
  switch (step) {
    case 1: return "Agreeing on public parameters...";
    case 2: return "Selecting private keys...";
    case 3: return "Computing public keys...";
    case 4: return "Exchanging public keys...";
    case 5: return "Computing shared secret...";
    default: return "";
  }
}

/* Reset the state */
function reset() {
  clearTimers();
  mode = null;
  step = 0;
  isStopped = false;
  currentStep = 0;
  p = 29;
  g = 2;
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

/* Show theory modal */
function showTheory() {
  document.getElementById('theory-modal').style.display = 'block';
}

/* Hide theory modal */
function hideTheory() {
  document.getElementById('theory-modal').style.display = 'none';
}

/* Show theory for 2 participants (in English) */
function showTwoParticipantsTheory() {
  const modal = document.getElementById("two-participants-modal");
  const content = document.getElementById("two-participants-theory-content");
  
  content.innerHTML = `
    <p>Imagine you have two friends: <strong>Alice</strong> and <strong>Bob</strong>. They want to create a <em>secret code</em> so they can send messages to each other that no one else can read. But they’re talking over the internet, where there’s a <strong>mean Eve</strong> who might listen in! 😱 How can they make a secret that Eve can’t figure out? That’s where a <em>magic trick</em> called the <strong>Diffie-Hellman key exchange</strong> comes in. Let’s break it down step by step, like a fun game! 🎲</p>
    
    <p><strong>Step 1: Agree on Magic Numbers 🪄</strong></p>
    <p>Alice and Bob pick two numbers that everyone can know (even Eve):<br>
    - One number is called <em>p</em>, and it’s a <strong>big prime number</strong>. For example, <em>p = 23</em>.<br>
    - The second number is called <em>g</em>, and it’s a <strong>small number</strong>, like <em>g = 5</em>.<br>
    These numbers are like the rules of the game, and they don’t need to be hidden. Eve knows: <em>p = 23</em>, <em>g = 5</em>.</p>

    <p><strong>Step 2: Pick Secret Numbers 🤫</strong></p>
    <p>Now, each of them chooses a <em>secret number</em> that only they know:<br>
    - Alice picks <em>a = 4</em>. This is her secret!<br>
    - Bob picks <em>b = 3</em>. This is his secret!<br>
    Eve doesn’t know these numbers, and Alice and Bob don’t send them to each other.</p>

    <p><strong>Step 3: Make Public Keys 🔑</strong></p>
    <p>Alice and Bob use their secret numbers and the shared numbers <em>p</em> and <em>g</em> to make <em>public keys</em>. These are like magic boxes they’ll send to each other, but the secret is still hidden inside. The formula is:<br>
    <em>Public Key = g^(Secret Number) mod p</em><br>
    - Alice calculates: <em>5^4 = 81</em>, and <em>81 mod 17 = 13</em> → Alice’s public key is <strong>13</strong>.<br>
    - Bob calculates: <em>5^3 = 125</em>, and <em>125 mod 23 = 5</em> → Bob’s public key is <strong>5</strong>.<br>
    They send these public keys to each other. It’s okay if someone else sees these numbers—they’re not the secret!</p>

    <p><strong>Step 4: Share the Public Keys 📬</strong></p>
    <p>Alice sends her public key <strong>13</strong> to Bob, and Bob sends his public key <strong>5</strong> to Alice. Eve listens in and sees these numbers: <strong>13</strong> and <strong>5</strong>. But that’s okay because these numbers don’t reveal the secret!</p>

    <p><strong>Step 5: Create the Shared Secret 🔒</strong></p>
    <p>Now, they use each other’s public key and their own secret to find the same shared code:<br>
    - Alice takes Bob’s <strong>5</strong>: <em>5^4 = 625</em>, and <em>625 mod 23 = 6</em> → Alice’s secret is <strong>6</strong>.<br>
    - Bob takes Alice’s <strong>13</strong>: <em>13^3 = 2197</em>, and <em>2197 mod 23 = 6</em> → Bob’s secret is <strong>6</strong>.<br>
    Hooray! 🎉 <strong>Result:</strong> Both get the same number—<strong>6</strong>! This is their shared secret, which they can use as a key to lock and unlock messages.</p>

    <p><strong>Step 6: Use the Secret! 💬</strong></p>
    <p>Now Alice and Bob have a shared secret code — <strong>6</strong>. They can use it to lock their messages, and only they can unlock them. Eve doesn’t know the secret because she doesn’t know their secret numbers (<strong>4</strong> and <strong>3</strong>), and it’s really hard for her to guess! It’s like Alice and Bob have a <em>magic key</em> to a treasure chest that Eve can’t open. 🪙</p>

    <p><strong>Why Can’t Eve Figure Out the Secret? 🤔</strong></p>
    <p>Eve knows:<br>
    - <em>p = 23</em><br>
    - <em>g = 5</em><br>
    - The public keys: <strong>13</strong> and <strong>5</strong><br>
    But she doesn’t know the secrets: <strong>4</strong> and <strong>3</strong>. To find them, she’d need to solve a really hard math problem called the "discrete logarithm." With big numbers, this is super difficult—even for computers!</p>
  `;
  
  modal.style.display = "block";
}

/* Hide theory for 2 participants */
function hideTwoParticipantsTheory() {
  document.getElementById("two-participants-modal").style.display = "none";
}

/* Show theory for 3 participants (in English) */
function showThreeParticipantsTheory() {
  const modal = document.getElementById("three-participants-modal");
  const content = document.getElementById("three-participants-theory-content");
  
  content.innerHTML = `
    <p>Now we have three friends: <strong>Alice</strong>, <strong>Bob</strong>, and <strong>Carol</strong>. They want to create a <em>shared secret code</em> so they can send messages to each other that no one else can read, not even <strong>mean Eve</strong>! 😱 The <strong>Diffie-Hellman key exchange</strong> can work with three people using a cyclic exchange. Let’s break it down step by step! 🎲</p>

    <p><strong>Step 1: Agree on Magic Numbers 🪄</strong></p>
    <p>All three pick two numbers that everyone can know (even Eve):<br>
    - The first number is <em>p</em>, a big prime number, like <em>p = 29</em>.<br>
    - The second number is <em>g</em>, a small number, like <em>g = 2</em>.<br>
    These numbers are the rules of the game, and they don’t need to be hidden. Eve knows: <em>p = 29</em>, <em>g = 2</em>.</p>

    <p><strong>Step 2: Pick Secret Numbers 🤫</strong></p>
    <p>Each chooses a <em>secret number</em> that they don’t tell anyone:<br>
    - Alice picks <em>a = 3</em>.<br>
    - Bob picks <em>b = 3</em>.<br>
    - Carol picks <em>c = 1</em>.<br>
    Eve doesn’t know these numbers, and no one sends them to each other.</p>

    <p><strong>Step 3: Make Public Keys 🔑</strong></p>
    <p>Each uses their secret number and the shared numbers <em>p</em> and <em>g</em> to make <em>public keys</em>. The formula is: <em>Public Key = g^(Secret Number) mod p</em><br>
    - Alice: <em>2^3 mod 29 = 8</em> → Public key is <strong>8</strong>.<br>
    - Bob: <em>2^3 mod 29 = 8</em> → Public key is <strong>8</strong>.<br>
    - Carol: <em>2^1 mod 29 = 2</em> → Public key is <strong>2</strong>.<br>
    They send these to each other, and Eve can see: <strong>8</strong>, <strong>8</strong>, <strong>2</strong>.</p>

    <p><strong>Step 4: Share Public Keys in a Circle 📬</strong></p>
    <p>They send keys in a cycle:<br>
    - Alice sends <strong>8</strong> to Bob.<br>
    - Bob computes <em>8^3 mod 29 = 19</em> and sends <strong>19</strong> to Carol.<br>
    - Carol computes <em>19^1 mod 29 = 19</em> and sends <strong>19</strong> to Alice.<br>
    - Bob sends <strong>8</strong> to Carol.<br>
    - Carol computes <em>8^1 mod 29 = 8</em> and sends <strong>8</strong> to Alice.<br>
    - Alice computes <em>8^3 mod 29 = 19</strong>.<br>
    - Carol sends <strong>2</strong> to Alice.<br>
    - Alice computes <em>2^3 mod 29 = 8</em> and sends <strong>8</strong> to Bob.<br>
    - Bob computes <em>8^3 mod 29 = 19</strong>.<br>
    Eve sees all these numbers, but can’t find the secret!</p>

    <p><strong>Step 5: Create the Shared Secret 🔒</strong></p>
    <p>Each uses the cycle to find the secret:<br>
    - Alice: <em>K1 = 2^3 mod 29 = 8</em>, <em>S = 8^3 mod 29 = 19</em>.<br>
    - Bob: <em>K1 = 8^3 mod 29 = 19</em>, <em>S = 19^1 mod 29 = 19</em>.<br>
    - Carol: <em>K1 = 8^1 mod 29 = 8</em>, <em>S = 8^3 mod 29 = 19</em>.<br>
    Result: All get <strong>19</strong>!</p>

    <p><strong>Step 6: Use the Secret! 💬</strong></p>
    <p>With <strong>19</strong>, they can lock messages securely. Eve can’t guess it because she doesn’t know <em>a</em>, <em>b</em>, or <em>c</em>!</p>

    <p><strong>Why Can’t Eve Figure Out the Secret? 🤔</strong></p>
    <p>Eve knows <em>p = 29</em>, <em>g = 2</em>, and public exchanges, but the discrete logarithm problem makes it hard to find <em>a</em>, <em>b</em>, or <em>c</em>!</p>
  `;
  
  modal.style.display = "block";
}

/* Hide theory for 3 participants */
function hideThreeParticipantsTheory() {
  document.getElementById("three-participants-modal").style.display = "none";
}

/* Show theory for Alice's role */
function showAliceTheory() {
  const modal = document.getElementById("alice-theory-modal");
  const content = document.getElementById("alice-theory-content");
  
  content.innerHTML = `
    <p>Hi! I’m <strong>Alice</strong>, and I help create a <em>secret code</em> with Bob and Carol using the <strong>Diffie-Hellman key exchange</strong>! 😊 Let’s see my steps!</p>
    <ul>
      <li><strong>Step 1: Agree on Numbers</strong> 🪄<br>I agree with Bob and Carol on <em>p = 29</em> and <em>g = 2</em>.</li>
      <li><strong>Step 2: Pick Secret</strong> 🤫<br>I pick <em>a = 3</em>, my secret key.</li>
      <li><strong>Step 3: Make Public Key</strong> 🔑<br>I compute <em>2^3 mod 29 = 8</em>, so my public key is <strong>8</strong>.</li>
      <li><strong>Step 4: Share Keys</strong> 📬<br>I send <strong>8</strong> to Bob, get <strong>8</strong> from Bob (via Carol), and <strong>2</strong> from Carol.</li>
      <li><strong>Step 5: Create Secret</strong> 🔒<br>I compute <em>K1 = 2^3 mod 29 = 8</em>, then <em>8^3 mod 29 = 19</em>. My secret is <strong>19</strong>!</li>
      <li><strong>Step 6: Use Secret</strong> 💬<br>With <strong>19</strong>, we lock messages securely!</li>
    </ul>
  `;
  
  modal.style.display = "block";
}

/* Hide theory for Alice */
function hideAliceTheory() {
  document.getElementById("alice-theory-modal").style.display = "none";
}

/* Show theory for Bob's role */
function showBobTheory() {
  const modal = document.getElementById("bob-theory-modal");
  const content = document.getElementById("bob-theory-content");
  
  content.innerHTML = `
    <p>Hello! I’m <strong>Bob</strong>, and I help create a <em>secret code</em> with Alice and Carol! 😊 Here’s my role!</p>
    <ul>
      <li><strong>Step 1: Agree on Numbers</strong> 🪄<br>I agree on <em>p = 29</em> and <em>g = 2</em> with Alice and Carol.</li>
      <li><strong>Step 2: Pick Secret</strong> 🤫<br>I pick <em>b = 3</em>, my secret key.</li>
      <li><strong>Step 3: Make Public Key</strong> 🔑<br>I compute <em>2^3 mod 29 = 8</em>, so my public key is <strong>8</strong>.</li>
      <li><strong>Step 4: Share Keys</strong> 📬<br>I send <strong>8</strong> to Carol, get <strong>8</strong> from Alice (via Carol), and <strong>2</strong> from Carol.</li>
      <li><strong>Step 5: Create Secret</strong> 🔒<br>I compute <em>K1 = 8^3 mod 29 = 19</em>, then <em>19^1 mod 29 = 19</em>. My secret is <strong>19</strong>!</li>
      <li><strong>Step 6: Use Secret</strong> 💬<br>With <strong>19</strong>, we lock messages securely!</li>
    </ul>
  `;
  
  modal.style.display = "block";
}

/* Hide theory for Bob */
function hideBobTheory() {
  document.getElementById("bob-theory-modal").style.display = "none";
}

/* Show theory for Charlie's role (Carol in this case) */
function showCharlieTheory() {
  const modal = document.getElementById("charlie-theory-modal");
  const content = document.getElementById("charlie-theory-content");
  
  content.innerHTML = `
    <p>Hi! I’m <strong>Carol</strong>, and I help create a <em>secret code</em> with Alice and Bob! 😊 Here’s my role!</p>
    <ul>
      <li><strong>Step 1: Agree on Numbers</strong> 🪄<br>I agree on <em>p = 29</em> and <em>g = 2</em> with Alice and Bob.</li>
      <li><strong>Step 2: Pick Secret</strong> 🤫<br>I pick <em>c = 1</em>, my secret key.</li>
      <li><strong>Step 3: Make Public Key</strong> 🔑<br>I compute <em>2^1 mod 29 = 2</em>, so my public key is <strong>2</strong>.</li>
      <li><strong>Step 4: Share Keys</strong> 📬<br>I send <strong>2</strong> to Alice, get <strong>8</strong> from Bob, and <strong>8</strong> from Alice (via Bob).</li>
      <li><strong>Step 5: Create Secret</strong> 🔒<br>I compute <em>K1 = 8^1 mod 29 = 8</em>, then <em>8^3 mod 29 = 19</em>. My secret is <strong>19</strong>!</li>
      <li><strong>Step 6: Use Secret</strong> 💬<br>With <strong>19</strong>, we lock messages securely!</li>
    </ul>
  `;
  
  modal.style.display = "block";
}

/* Hide theory for Charlie (Carol) */
function hideCharlieTheory() {
  document.getElementById("charlie-theory-modal").style.display = "none";
}
