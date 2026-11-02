// ---------- 1. DOM: select the elements we need ----------
const display = document.getElementById('display');
const buttons = document.querySelector('.buttons');

// ---------- 2. State: what the calculator remembers ----------
let current = '0';      // the number on screen
let previous = null;    // the first number (before pressing + - × ÷)
let operator = null;    // the chosen operation
let startNew = false;   // true = next digit starts a fresh number

// ---------- 3. Logic: small functions ----------
function updateDisplay() {
  display.textContent = current;
}

function inputNumber(n) {
  if (startNew || current === 'Error') {
    current = '0';
    startNew = false;
  }
  if (current === '0') {
    current = (n === '00') ? '0' : n;   // avoid 000, 007
  } else {
    current += n;
  }
}

function inputDot() {
  if (startNew || current === 'Error') {
    current = '0';
    startNew = false;
  }
  if (!current.includes('.')) current += '.';
}

function chooseOperator(op) {
  if (current === 'Error') return;
  if (operator && !startNew) calculate();   // chain: 2 + 3 + ...
  previous = current;
  operator = op;
  startNew = true;
}

function calculate() {
  if (operator === null || previous === null) return;

  const a = parseFloat(previous);
  const b = parseFloat(current);
  let result;

  if (operator === '+') result = a + b;
  if (operator === '-') result = a - b;
  if (operator === '*') result = a * b;
  if (operator === '/') result = (b === 0) ? 'Error' : a / b;

  // round to avoid 0.1 + 0.2 = 0.30000000000000004
  current = (result === 'Error') ? 'Error' : String(parseFloat(result.toFixed(10)));
  previous = null;
  operator = null;
  startNew = true;
}

function percent() {
  if (current === 'Error') return;
  current = String(parseFloat(current) / 100);
}

function clearAll() {
  current = '0';
  previous = null;
  operator = null;
  startNew = false;
}

// ---------- 4. Event: ONE listener on the parent (delegation) ----------
buttons.addEventListener('click', (e) => {
  const btn = e.target.closest('button');
  if (!btn) return;                       // click wasn't on a button

  if (btn.dataset.num)      inputNumber(btn.dataset.num);
  else if (btn.dataset.op)  chooseOperator(btn.dataset.op);
  else if (btn.dataset.action === 'dot')     inputDot();
  else if (btn.dataset.action === 'equals')  calculate();
  else if (btn.dataset.action === 'percent') percent();
  else if (btn.dataset.action === 'clear')   clearAll();

  updateDisplay();
});
