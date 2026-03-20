const API = "http://localhost:5000/api";

// TOKEN
function saveToken(t) { localStorage.setItem("token", t); }
function getToken() { return localStorage.getItem("token"); }

// LOGIN
async function login() {
  const email = emailInput("email");
  const password = emailInput("password");

  const res = await fetch(`${API}/auth/login`, {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({ email, password })
  });

  const data = await res.json();
  saveToken(data.token);
  window.location = "dashboard.html";
}

// REGISTER
async function register() {
  const email = emailInput("email");
  const password = emailInput("password");

  await fetch(`${API}/auth/register`, {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({ email, password })
  });

  window.location = "index.html";
}

// BALANCE
async function loadBalance() {
  const res = await fetch(`${API}/wallet/balance`, {
    headers: { Authorization: getToken() }
  });

  const data = await res.json();
  document.getElementById("balance").innerText = `$${data.balance}`;
}

// SEND
async function sendMoney() {
  const toEmail = emailInput("toEmail");
  const amount = emailInput("amount");
  const pin = emailInput("pin");

  const res = await fetch(`${API}/wallet/send`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: getToken()
    },
    body: JSON.stringify({ toEmail, amount, pin })
  });

  alert(await res.text());
}

// TRANSACTIONS
async function loadTransactions() {
  const res = await fetch(`${API}/wallet/transactions`, {
    headers: { Authorization: getToken() }
  });

  const data = await res.json();

  const list = document.getElementById("list");
  list.innerHTML = "";

  data.forEach(tx => {
    list.innerHTML += `
      <div class="tx">
        ${tx.type.toUpperCase()} - $${tx.amount}
      </div>
    `;
  });
}

// NAV
function goSend() { window.location = "send.html"; }
function goTransactions() { window.location = "transactions.html"; }
function logout() {
  localStorage.removeItem("token");
  window.location = "index.html";
}

// HELPER
function emailInput(id) {
  return document.getElementById(id).value;
}

// AUTO LOAD
if (location.pathname.includes("dashboard")) loadBalance();
if (location.pathname.includes("transactions")) loadTransactions();