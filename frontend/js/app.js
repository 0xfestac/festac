const API = "http://localhost:5000/api";

// =====================
// TOKEN HANDLING
// =====================
function saveToken(token) {
  localStorage.setItem("token", token);
}

function getToken() {
  return localStorage.getItem("token");
}

// =====================
// HELPER
// =====================
function getInput(id) {
  return document.getElementById(id)?.value;
}

// =====================
// LOGIN
// =====================
async function login() {
  document.body.classList.add("loading");

  const email = getInput("email");
  const password = getInput("password");

  try {
    const res = await fetch(`${API}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    document.body.classList.remove("loading");

    if (data.token) {
      saveToken(data.token);
      window.location = "dashboard.html";
    } else {
      showToast("Login failed");
    }

  } catch (err) {
    document.body.classList.remove("loading");
    showToast("Error logging in");
  }
}

// =====================
// REGISTER
// =====================
async function register() {
  const email = getInput("email");
  const password = getInput("password");

  try {
    await fetch(`${API}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email, password })
    });

    showToast("Account created!");
    window.location = "index.html";

  } catch (err) {
    showToast failed");
  }
}

// =====================
// LOAD BALANCE
// =====================
async function loadBalance() {
  try {
    const res = await fetch(`${API}/wallet/balance`, {
      headers: {
        Authorization: getToken()
      }
    });

    const data = await res.json();

    const el = document.getElementById("balance");
    if (el) {
      el.innerText = `$${data.balance}`;
    }

  } catch (err) {
    console.log("Balance error");
  }
}

// =====================
// PIN MODAL
// =====================
function openPinModal() {
  document.getElementById("pinModal").style.display = "block";
}

function closeModal() {
  document.getElementById("pinModal").style.display = "none";
}

// =====================
// SEND MONEY (WITH PIN)
// =====================
async function confirmSend() {
  const toEmail = getInput("toEmail");
  const amount = getInput("amount");
  const pin = getInput("pinInput");

  if (!toEmail || !amount || !pin) {
    return alert("All fields required");
  }

  try {
    const res = await fetch(`${API}/wallet/send`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: getToken()
      },
      body: JSON.stringify({ toEmail, amount, pin })
    });

    const msg = await res.text();

    showToast;
    closeModal();

  } catch (err) {
    showToast("Transfer failed");
  }
}

// =====================
// LOAD TRANSACTIONS
// =====================
async function loadTransactions() {
  try {
    const res = await fetch(`${API}/wallet/transactions`, {
      headers: {
        Authorization: getToken()
      }
    });

    const data = await res.json();
    const list = document.getElementById("list");

    if (!list) return;

    list.innerHTML = "";

    data.forEach(tx => {
      const color = tx.type === "credit" ? "green" : "red";

      list.innerHTML += `
        <div class="tx">
          <b style="color:${color}">
            ${tx.type.toUpperCase()}
          </b>
          <p>$${tx.amount}</p>
        </div>
      `;
    });

  } catch (err) {
    console.log("Transaction error");
  }
}

// =====================
// NAVIGATION
// =====================
function goSend() {
  window.location = "send.html";
}

function goTransactions() {
  window.location = "transactions.html";
}

function logout() {
  localStorage.removeItem("token");
  window.location = "index.html";
}

// =====================
// AUTO LOAD PER PAGE
// =====================
if (window.location.pathname.includes("dashboard")) {
  loadBalance();
}

if (window.location.pathname.includes("transactions")) {
  loadTransactions();
}

// =====================
// FUND WALLET
// =====================
async function fundWallet() {
  const amount = getInput("amount");

  if (!amount) return showToast("Enter amount");

  try {
    const res = await fetch(`${API}/wallet/fund`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: getToken()
      },
      body: JSON.stringify({ amount })
    });

    const msg = await res.text();
    showToast(msg);

  } catch (err) {
    showToast("Funding failed");
  }
}

// NAV
function goFund() {
  window.location = "fund.html";
}
function showToast(message) {
  const toast = document.getElementById("toast");
  toast.innerText = message;
  toast.style.display = "block";

  setTimeout(() => {
    toast.style.display = "none";
  }, 3000);
}
app.use(cors());

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("sw.js")
    .then(() => console.log("SW registered"));
}
