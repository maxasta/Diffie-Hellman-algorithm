/* Global variables */
let mode = null;
let step = 0;
let p = 23;
let g = 5;
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

/* Validate g */
function validateG(gValue) {
  const gError = document.getElementById("g-error");
  const gSuccess = document.getElementById("g-success");
  gError.classList.remove("active");
  gSuccess.classList.remove("active");

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

  const a = getRandomPrivateKey(); // Alice's private key
  const b = getRandomPrivateKey(); // Bob's private key
  let c = mode === 3 ? getRandomPrivateKey() : null; // Charlie's private key

  // Compute public keys
  const A = modExp(g, a, p); // Alice's public key
  const B = modExp(g, b, p); // Bob's public key
  let C = mode === 3 ? modExp(g, c, p) : null; // Charlie's public key

  // Step 1: Agree on public parameters
  updateExplanation(`Step 1: Agreeing on public parameters. We use p = ${p} (a prime number) and g = ${g} (a generator). These are shared openly.`);
  timers.push(setTimeout(() => {
    currentStep = 1;
    document.getElementById("back-button").disabled = false;
  }, 500));

  // Step 2: Selecting private keys
  timers.push(setTimeout(() => {
    if (isStopped) return;
    updateExplanation(`Step 2: Selecting private keys. Alice picks a = ${a}, Bob picks b = ${b}${mode === 3 ? `, and Charlie picks c = ${c}` : ''}. These are secret and never shared.`);
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

    if (mode === 3) {
      timers.push(setTimeout(() => {
        document.getElementById("charlie-public").textContent = C;
        document.getElementById("charlie-public-formula").textContent = `C = ${g}^${c} mod ${p} = ${C}`;
        updateExplanation(`Step 3: Charlie computes his public key: C = ${g}^${c} mod ${p} = ${C}.`);
        highlightElement("charlie-public");
      }, 2500));
    }
    currentStep = 3;
  }, 4000));

  // Step 4: Exchanging public keys
  timers.push(setTimeout(() => {
    if (isStopped) return;
    updateExplanation(`Step 4: Exchanging public keys over an insecure channel. Alice sends A = ${A} to Bob, Bob sends B = ${B} to Alice${mode === 3 ? `, and Charlie sends C = ${C} to others` : ''}. Anyone can see these.`);
    animateArrow("arrow1");
    if (mode === 3) animateArrow("arrow2");
    currentStep = 4;
  }, 6500));

  // Step 5: Computing shared secret
  timers.push(setTimeout(() => {
    if (isStopped) return;
    updateExplanation(`Step 5: Computing the shared secret using the formula: Shared Secret = (Other's Public Key)^(Own Private Key) mod p.`);

    let sharedSecret;

    if (mode === 2) {
      // For 2 participants
      sharedSecret = modExp(B, a, p); // Alice: S = B^a mod p
      const sharedBA = modExp(A, b, p); // Bob: S = A^b mod p

      timers.push(setTimeout(() => {
        document.getElementById("alice-secret").textContent = sharedSecret;
        document.getElementById("alice-secret-formula").textContent = `S = ${B}^${a} mod ${p} = ${sharedSecret}`;
        updateExplanation(`Step 5: Alice computes the shared secret: S = ${B}^${a} mod ${p} = ${sharedSecret}.`);
        highlightElement("alice-secret");
      }, 500));

      timers.push(setTimeout(() => {
        document.getElementById("bob-secret").textContent = sharedBA;
        document.getElementById("bob-secret-formula").textContent = `S = ${A}^${b} mod ${p} = ${sharedBA}`;
        updateExplanation(`Step 5: Bob computes the shared secret: S = ${A}^${b} mod ${p} = ${sharedBA}. Notice that both Alice and Bob get the same secret!`);
        highlightElement("bob-secret");
      }, 1500));

      timers.push(setTimeout(() => {
        updateExplanation(`Step 6: The shared secret is ${sharedSecret}. Alice and Bob can now use this to encrypt messages securely!`);
        document.getElementById("stop-button").disabled = true;
        document.getElementById("back-button").disabled = true;
        document.getElementById("resume-button").disabled = true;
      }, 2500));
    } else {
      // For 3 participants
      const AB = modExp(A, b, p); // Bob computes (g^a)^b mod p
      const ABC = modExp(AB, c, p); // Charlie computes ((g^a)^b)^c mod p

      const CB = modExp(C, b, p); // Bob computes (g^c)^b mod p
      const CBA = modExp(CB, a, p); // Alice computes ((g^c)^b)^a mod p

      const AC = modExp(A, c, p); // Charlie computes (g^a)^c mod p
      const ACB = modExp(AC, b, p); // Bob computes ((g^a)^c)^b mod p

      sharedSecret = ABC;

      timers.push(setTimeout(() => {
        updateExplanation(`Step 5: Cyclic exchange - Alice → Bob → Charlie. Bob computes intermediate key: (${A})^${b} mod ${p} = ${AB}. Charlie computes final: (${AB})^${c} mod ${p} = ${ABC}.`);
        document.getElementById("charlie-secret").textContent = sharedSecret;
        document.getElementById("charlie-secret-formula").textContent = `S = (${AB})^${c} mod ${p} = ${sharedSecret}`;
        highlightElement("charlie-secret");
      }, 500));

      timers.push(setTimeout(() => {
        updateExplanation(`Step 5: Cyclic exchange - Charlie → Bob → Alice. Bob computes intermediate key: (${C})^${b} mod ${p} = ${CB}. Alice computes final: (${CB})^${a} mod ${p} = ${CBA}.`);
        document.getElementById("alice-secret").textContent = sharedSecret;
        document.getElementById("alice-secret-formula").textContent = `S = (${CB})^${a} mod ${p} = ${sharedSecret}`;
        highlightElement("alice-secret");
      }, 1500));

      timers.push(setTimeout(() => {
        updateExplanation(`Step 5: Cyclic exchange - Alice → Charlie → Bob. Charlie computes intermediate key: (${A})^${c} mod ${p} = ${AC}. Bob computes final: (${AC})^${b} mod ${p} = ${ACB}.`);
        document.getElementById("bob-secret").textContent = sharedSecret;
        document.getElementById("bob-secret-formula").textContent = `S = (${AC})^${b} mod ${p} = ${sharedSecret}`;
        highlightElement("bob-secret");
      }, 2500));

      timers.push(setTimeout(() => {
        updateExplanation(`Step 6: The shared secret is ${sharedSecret}. Alice, Bob, and Charlie can now use this to encrypt messages securely!`);
        document.getElementById("stop-button").disabled = true;
        document.getElementById("back-button").disabled = true;
        document.getElementById("resume-button").disabled = true;
      }, 3500));
    }
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
    - One number is called <em>p</em>, and it’s a <strong>big prime number</strong>. For example, <em>p = 23</em>. A prime number is a number that can only be divided by 1 and itself, like 3, 5, or 7.<br>
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
    <p>Now we have three friends: <strong>Alice</strong>, <strong>Bob</strong>, and <strong>Charlie</strong>. They also want to create a <em>shared secret code</em> so they can send messages to each other that no one else can read, not even <strong>mean Eve</strong>! 😱 But now there are three of them, so the game gets a bit trickier, but still super fun. Let’s break it down step by step! 🎲</p>

    <p><strong>Step 1: Agree on Magic Numbers 🪄</strong></p>
    <p>All three pick two numbers that everyone can know (even Eve):<br>
    - The first number is <em>p</em>, a big prime number, like <em>p = 23</em>. A prime number can only be divided by 1 and itself, like 5 or 7.<br>
    - The second number is <em>g</em>, a small number, like <em>g = 5</em>.<br>
    These numbers are like the rules of the game, and they don’t need to be hidden. Eve knows: <em>p = 23</em>, <em>g = 5</em>.</p>

    <p><strong>Step 2: Pick Secret Numbers 🤫</strong></p>
    <p>Each of them chooses a <em>secret number</em> that they don’t tell anyone:<br>
    - Alice picks <em>a = 4</em>. This is her secret!<br>
    - Bob picks <em>b = 3</em>. This is his secret!<br>
    - Charlie picks <em>c = 2</em>. This is his secret!<br>
    Eve doesn’t know these numbers, and no one sends them to each other.</p>

    <p><strong>Step 3: Make Public Keys 🔑</strong></p>
    <p>Each of them uses their secret number and the shared numbers <em>p</em> and <em>g</em> to make <em>public keys</em>. The formula is:<br>
    <em>Public Key = g^(Secret Number) mod p</em><br>
    - Alice calculates: <em>5^4 mod 23</em>. That’s <em>5 × 5 × 5 × 5 = 625</em>, then <em>625 ÷ 23 = 27</em> with a remainder of <strong>16</strong>. So, Alice’s public key is <strong>16</strong>.<br>
    - Bob calculates: <em>5^3 mod 23</em>. That’s <em>5 × 5 × 5 = 125</em>, then <em>125 ÷ 23 = 5</em> with a remainder of <strong>10</strong>. So, Bob’s public key is <strong>10</strong>.<br>
    - Charlie calculates: <em>5^2 mod 23</em>. That’s <em>5 × 5 = 25</em>, then <em>25 ÷ 23 = 1</em> with a remainder of <strong>2</strong>. So, Charlie’s public key is <strong>2</strong>.<br>
    They send these public keys to each other, and Eve can see them: <strong>16</strong>, <strong>10</strong>, and <strong>2</strong>.</p>

    <p><strong>Step 4: Share Public Keys in a Circle 📬</strong></p>
    <p>Now they send their public keys to each other, but they do it in a circle, like a game! They play three rounds:<br>
    - <em>Round 1: Alice → Bob → Charlie</em>. Alice sends <strong>16</strong> to Bob. Bob takes <strong>16</strong> and makes an intermediate key: <em>16^3 mod 23 = 4096 ÷ 23</em>, remainder <strong>4</strong>. Bob sends <strong>4</strong> to Charlie.<br>
    - <em>Round 2: Charlie → Bob → Alice</em>. Charlie sends <strong>2</strong> to Bob. Bob takes <strong>2</strong> and makes an intermediate key: <em>2^3 mod 23 = 8</em>. Bob sends <strong>8</strong> to Alice.<br>
    - <em>Round 3: Alice → Charlie → Bob</em>. Alice sends <strong>16</strong> to Charlie. Charlie takes <strong>16</strong> and makes an intermediate key: <em>16^2 mod 23 = 256 ÷ 23</em>, remainder <strong>3</strong>. Charlie sends <strong>3</strong> to Bob.<br>
    Eve sees all these numbers, but they won’t help her figure out the secret!</p>

    <p><strong>Step 5: Create the Shared Secret 🔒</strong></p>
    <p>Now each of them takes the last number they got and uses their own secret number to find the shared secret. The formula is:<br>
    <em>Shared Secret = (Received Number)^(Own Secret) mod p</em><br>
    - Charlie got <strong>4</strong> from Bob and calculates: <em>4^2 mod 23 = 16</em>. But this is an intermediate step, and he already got the shared secret.<br>
    - Alice got <strong>8</strong> from Bob and calculates: <em>8^4 mod 23 = 4096 ÷ 23</em>, remainder <strong>4</strong>.<br>
    - Bob got <strong>3</strong> from Charlie and calculates: <em>3^3 mod 23 = 27 ÷ 23</em>, remainder <strong>4</strong>.<br>
    Hooray! 🎉 They all got the same secret: <strong>4</strong>.</p>

    <p><strong>Step 6: Use the Secret! 💬</strong></p>
    <p>Now Alice, Bob, and Charlie have a shared secret code — <strong>4</strong>. They can use it to lock their messages, and only they can unlock them. Eve doesn’t know the secret because she doesn’t know their secret numbers (<strong>4</strong>, <strong>3</strong>, and <strong>2</strong>). It’s like they have a <em>magic key</em> to a shared treasure chest that Eve can’t open. 🪙</p>

    <p><strong>Why Can’t Eve Figure Out the Secret? 🤔</strong></p>
    <p>Eve knows <em>p = 23</em>, <em>g = 5</em>, and all the public keys: <strong>16</strong>, <strong>10</strong>, <strong>2</strong>. She even sees the intermediate numbers they send to each other. But to find the secret, she’d need to guess their secret numbers, and that’s really hard! It’s called the <em>discrete logarithm problem</em>, and even computers can’t solve it quickly if the numbers are big. So the secret is safe! 🔐</p>
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
    <p>Hi! I’m <strong>Alice</strong>, and I’m here to tell you about my special role in the <em>Diffie-Hellman key exchange</em>. It’s like a fun magic game where I help create a <em>secret code</em> with my friends, Bob and Charlie, so we can send secret messages that no one else can read—not even <strong>mean Eve</strong>! 😊 Let’s see what I do, step by step!</p>

    <p><strong>What Does Alice Do? 🧙‍♀️</strong></p>
    <p>I’m one of the friends in this game, and my job is to help make a shared secret code. I do some <em>magic math</em> with numbers to create keys that keep our messages safe. Here’s how I help:</p>

    <ul>
      <li><strong>Step 1: Agree on Magic Numbers</strong> 🪄<br>I start by agreeing with Bob (and Charlie, if he’s playing) on two special numbers: <em>p</em> (a big prime number, like 23) and <em>g</em> (a small number, like 5). These numbers are public, so even Eve can know them. They’re like the rules of our game!</li>
      <li><strong>Step 2: Pick My Secret Number</strong> 🤫<br>I choose a <em>secret number</em> that only I know. Let’s say I pick <em>a = 4</em>. I don’t tell anyone—not Bob, not Charlie, and definitely not Eve! This number is called my <em>private key</em>.</li>
      <li><strong>Step 3: Make My Public Key</strong> 🔑<br>Using my secret number and the shared numbers <em>p</em> and <em>g</em>, I create a <em>public key</em> that I can share with my friends. The formula is: <em>g^(my secret) mod p</em>. So, if <em>g = 5</em>, <em>a = 4</em>, and <em>p = 23</em>, I calculate: <em>5^4 mod 23</em>. That’s <em>5 × 5 × 5 × 5 = 625</em>, then <em>625 ÷ 23</em> leaves a remainder of <strong>16</strong>. My public key is <strong>16</strong>! I send this to Bob (and Charlie, if he’s in the game), and Eve can see it too, but that’s okay.</li>
      <li><strong>Step 4: Share My Public Key</strong> 📬<br>I send my public key <strong>16</strong> to Bob (and Charlie, if we’re playing with three people). In return, I get their public keys. For example, Bob might send me <strong>10</strong>, and Charlie might send <strong>2</strong>. Eve can see all these numbers, but she can’t figure out my secret!</li>
      <li><strong>Step 5: Create the Shared Secret</strong> 🔒<br>Now I use my friends’ public keys and my secret number to make our <em>shared secret</em>. The formula is: <em>(friend’s public key)^(my secret) mod p</em>. Let’s say I’m playing with just Bob, and his public key is <strong>10</strong>. I calculate: <em>10^4 mod 23</em>. That’s <em>10 × 10 × 10 × 10 = 10000</em>, then <em>10000 ÷ 23</em> leaves a remainder of <strong>4</strong>. So, our shared secret is <strong>4</strong>! Bob does the same with my public key, and he’ll get <strong>4</strong> too. If Charlie’s playing, we do this in a circle (Alice → Bob → Charlie, Charlie → Bob → Alice, etc.), and we all end up with the same secret!</li>
      <li><strong>Step 6: Use the Secret</strong> 💬<br>Now that we have our shared secret (<strong>4</strong>), we can use it to lock our messages so only we can read them. It’s like having a <em>magic key</em> to a treasure chest that only me and my friends can open! 🪙</li>
    </ul>

    <p><strong>Alice’s Functions in the Algorithm ⚙️</strong></p>
    <p>My role is super important because I help make sure we all get the same secret code, even if Eve is listening. Here’s what I do in the Diffie-Hellman algorithm:</p>
    <ul>
      <li><strong>Choose a Private Key:</strong> I pick a secret number (my <em>private key</em>, like 4) that no one else knows. This keeps our secret safe.</li>
      <li><strong>Create a Public Key:</strong> I use my secret number to make a public key (like <strong>16</strong>) that I share with my friends. This key hides my secret but lets us work together.</li>
      <li><strong>Share Securely:</strong> I send my public key to my friends and get theirs. Even if Eve sees these keys, she can’t figure out our secret because the math is too hard for her!</li>
      <li><strong>Calculate the Shared Secret:</strong> I use my friends’ public keys and my secret number to find our shared secret. This secret is the same for all of us, and we can use it to lock and unlock messages.</li>
    </ul>

    <p><strong>Why Is Alice Important? 🌟</strong></p>
    <p>Without me, the game wouldn’t work! I’m one of the players who helps create the shared secret. My secret number and public key are like pieces of a puzzle that fit together with Bob’s (and Charlie’s) pieces to make a secret code that only we know. Eve can’t break it because the math is like a super tricky riddle that keeps our messages safe! 🔐</p>
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
    <p>Hello! I’m <strong>Bob</strong>, and I’m here to tell you about my special role in the <em>Diffie-Hellman key exchange</em>. It’s like a fun magic game where I help create a <em>secret code</em> with my friends, Alice and Charlie, so we can send secret messages that no one else can read—not even <strong>mean Eve</strong>! 😊 Let’s see what I do, step by step!</p>

    <p><strong>What Does Bob Do? 🧙‍♂️</strong></p>
    <p>I’m one of the friends in this game, and my job is to help make a shared secret code. I do some <em>magic math</em> with numbers to create keys that keep our messages safe. Here’s how I help:</p>

    <ul>
      <li><strong>Step 1: Agree on Magic Numbers</strong> 🪄<br>I start by agreeing with Alice (and Charlie, if he’s playing) on two special numbers: <em>p</em> (a big prime number, like 23) and <em>g</em> (a small number, like 5). These numbers are public, so even Eve can know them. They’re like the rules of our game!</li>
      <li><strong>Step 2: Pick My Secret Number</strong> 🤫<br>I choose a <em>secret number</em> that only I know. Let’s say I pick <em>b = 3</em>. I don’t tell anyone—not Alice, not Charlie, and definitely not Eve! This number is called my <em>private key</em>.</li>
      <li><strong>Step 3: Make My Public Key</strong> 🔑<br>Using my secret number and the shared numbers <em>p</em> and <em>g</em>, I create a <em>public key</em> that I can share with my friends. The formula is: <em>g^(my secret) mod p</em>. So, if <em>g = 5</em>, <em>b = 3</em>, and <em>p = 23</em>, I calculate: <em>5^3 mod 23</em>. That’s <em>5 × 5 × 5 = 125</em>, then <em>125 ÷ 23</em> leaves a remainder of <strong>10</strong>. My public key is <strong>10</strong>! I send this to Alice (and Charlie, if he’s in the game), and Eve can see it too, but that’s okay.</li>
      <li><strong>Step 4: Share My Public Key</strong> 📬<br>I send my public key (<strong>10</strong>) to Alice (and Charlie, if we’re playing with three people). In return, I get their public keys. For example, Alice might send me <strong>16</strong>, and Charlie might send <strong>2</strong>. Eve can see all these numbers, but she can’t figure out my secret!</li>
      <li><strong>Step 5: Create the Shared Secret</strong> 🔒<br>Now I use my friends’ public keys and my secret number to make our <em>shared secret</em>. The formula is: <em>(friend’s public key)^(my secret) mod p</em>. Let’s say I’m playing with just Alice, and her public key is <strong>16</strong>. I calculate: <em>16^3 mod 23</em>. That’s <em>16 × 16 × 16 = 4096</em>, then <em>4096 ÷ 23</em> leaves a remainder of <strong>4</strong>. So, our shared secret is <strong>4</strong>! Alice does the same with my public key, and she’ll get <strong>4</strong> too. If Charlie’s playing, I also help in the circle exchange (like Alice → Bob → Charlie, or Charlie → Bob → Alice), and we all end up with the same secret!</li>
      <li><strong>Step 6: Use the Secret</strong> 💬<br>Now that we have our shared secret (<strong>4</strong>), we can use it to lock our messages so only we can read them. It’s like having a <em>magic key</em> to a treasure chest that only me and my friends can open! 🪙</li>
    </ul>

    <p><strong>Bob’s Functions in the Algorithm ⚙️</strong></p>
    <p>My role is super important because I help make sure we all get the same secret code, even if Eve is listening. Here’s what I do in the Diffie-Hellman algorithm:</p>
    <ul>
      <li><strong>Choose a Private Key:</strong> I pick a secret number (my <em>private key</em>, like 3) that no one else knows. This keeps our secret safe.</li>
      <li><strong>Create a Public Key:</strong> I use my secret number to make a public key (like <strong>10</strong>) that I share with my friends. This key hides my secret but lets us work together.</li>
      <li><strong>Share Securely:</strong> I send my public key to my friends and get theirs. Even if Eve sees these keys, she can’t figure out our secret because the math is too hard for her!</li>
      <li><strong>Help in the Circle (for 3 people):</strong> If Charlie’s playing, I help pass keys around in a circle. For example, I might take Alice’s key, do some math, and pass it to Charlie, or take Charlie’s key and pass it to Alice.</li>
      <li><strong>Calculate the Shared Secret:</strong> I use my friends’ public keys and my secret number to find our shared secret. This secret is the same for all of us, and we can use it to lock and unlock messages.</li>
    </ul>

    <p><strong>Why Is Bob Important? 🌟</strong></p>
    <p>Without me, the game wouldn’t work! I’m one of the players who helps create the shared secret. My secret number and public key are like pieces of a puzzle that fit together with Alice’s (and Charlie’s) pieces to make a secret code that only we know. Eve can’t break it because the math is like a super tricky riddle that keeps our messages safe! 🔐</p>
  `;
  
  modal.style.display = "block";
}

/* Hide theory for Bob */
function hideBobTheory() {
  document.getElementById("bob-theory-modal").style.display = "none";
}

/* Show theory for Charlie's role */
function showCharlieTheory() {
  const modal = document.getElementById("charlie-theory-modal");
  const content = document.getElementById("charlie-theory-content");
  
  content.innerHTML = `
    <p>Hi there! I’m <strong>Charlie</strong>, and I’m here to tell you about my special role in the <em>Diffie-Hellman key exchange</em>. It’s like a fun magic game where I help create a <em>secret code</em> with my friends, Alice and Bob, so we can send secret messages that no one else can read—not even <strong>mean Eve</strong>! 😊 I only play when we’re in the 3-person mode. Let’s see what I do, step by step!</p>

    <p><strong>What Does Charlie Do? 🧙</strong></p>
    <p>I’m one of the friends in this game, but I only join when we’re playing with three people. My job is to help make a shared secret code with Alice and Bob. I do some <em>magic math</em> with numbers to create keys that keep our messages safe. Here’s how I help:</p>

    <ul>
      <li><strong>Step 1: Agree on Magic Numbers</strong> 🪄<br>I join Alice and Bob to agree on two special numbers: <em>p</em> (a big prime number, like 23) and <em>g</em> (a small number, like 5). These numbers are public, so even Eve can know them. They’re like the rules of our game!</li>
      <li><strong>Step 2: Pick My Secret Number</strong> 🤫<br>I choose a <em>secret number</em> that only I know. Let’s say I pick <em>c = 2</em>. I don’t tell anyone—not Alice, not Bob, and definitely not Eve! This number is called my <em>private key</em>.</li>
      <li><strong>Step 3: Make My Public Key</strong> 🔑<br>Using my secret number and the shared numbers <em>p</em> and <em>g</em>, I create a <em>public key</em> that I can share with my friends. The formula is: <em>g^(my secret) mod p</em>. So, if <em>g = 5</em>, <em>c = 2</em>, and <em>p = 23</em>, I calculate: <em>5^2 mod 23</em>. That’s <em>5 × 5 = 25</em>, then <em>25 ÷ 23</em> leaves a remainder of <strong>2</strong>. My public key is <strong>2</strong>! I send this to Alice and Bob, and Eve can see it too, but that’s okay.</li>
      <li><strong>Step 4: Share My Public Key</strong> 📬<br>I send my public key (<strong>2</strong>) to Alice and Bob. In return, I get their public keys. For example, Alice might send me <strong>16</strong>, and Bob might send <strong>10</strong>. Eve can see all these numbers, but she can’t figure out my secret!</li>
      <li><strong>Step 5: Create the Shared Secret</strong> 🔒<br>Since we’re playing with three people, we pass keys around in a circle to make our <em>shared secret</em>. The formula is: <em>(friend’s public key)^(my secret) mod p</em>, and we do it step by step. For example, I might get a number from Bob (like <strong>4</strong>) and calculate: <em>4^2 mod 23</em>. That’s <em>4 × 4 = 16</em>, which is part of the process. After the circle (Alice → Bob → Charlie, Charlie → Bob → Alice, etc.), I end up with the same secret as my friends—let’s say <strong>4</strong>! Alice and Bob do similar math, and we all get the same secret!</li>
      <li><strong>Step 6: Use the Secret</strong> 💬<br>Now that we have our shared secret (<strong>4</strong>), we can use it to lock our messages so only we can read them. It’s like having a <em>magic key</em> to a treasure chest that only me, Alice, and Bob can open! 🪙</li>
    </ul>

    <p><strong>Charlie’s Functions in the Algorithm ⚙️</strong></p>
    <p>My role is super important when we’re playing with three people because I help make sure we all get the same secret code, even if Eve is listening. Here’s what I do in the Diffie-Hellman algorithm:</p>
    <ul>
      <li><strong>Choose a Private Key:</strong> I pick a secret number (my <em>private key</em>, like 2) that no one else knows. This keeps our secret safe.</li>
      <li><strong>Create a Public Key:</strong> I use my secret number to make a public key (like <strong>2</strong>) that I share with my friends. This key hides my secret but lets us work together.</li>
      <li><strong>Share Securely:</strong> I send my public key to Alice and Bob and get theirs. Even if Eve sees these keys, she can’t figure out our secret because the math is too hard for her!</li>
      <li><strong>Help in the Circle:</strong> I take keys from my friends, do some math, and pass them along. For example, I might get Alice’s key, work with it, and send it to Bob, or get Bob’s key and send it to Alice.</li>
      <li><strong>Calculate the Shared Secret:</strong> I use the keys I get in the circle and my secret number to find our shared secret. This secret is the same for all of us, and we can use it to lock and unlock messages.</li>
    </ul>

    <p><strong>Why Is Charlie Important? 🌟</strong></p>
    <p>Without me, the three-person game wouldn’t work! I’m the extra friend who joins Alice and Bob to create the shared secret. My secret number and public key are like pieces of a puzzle that fit with theirs to make a secret code that only we know. Eve can’t break it because the math is like a super tricky riddle that keeps our messages safe! 🔐</p>
  `;
  
  modal.style.display = "block";
}

/* Hide theory for Charlie */
function hideCharlieTheory() {
  document.getElementById("charlie-theory-modal").style.display = "none";
}
