const transactions = JSON.parse(localStorage.getItem('transactions')) || [];

const formatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'IDR',
  signDisplay: 'always',
});

const list = document.getElementById('transactionList');
const form = document.getElementById('transactionForm');
const status = document.getElementById('status');
const balance = document.getElementById('balance');
const income = document.getElementById('income');
const expense = document.getElementById('expense');

form.addEventListener('submit', addTransaction);

function updateTotal() {
  const incomeTotal = transactions.filter((trx) => trx.type === 'income').reduce((total, trx) => total + trx.amount, 0);

  const expenseTotal = transactions.filter((trx) => trx.type === 'expense').reduce((total, trx) => total + trx.amount, 0);

  const balanceTotal = incomeTotal - expenseTotal;

  if (balanceTotal < 0) {
    balance.style.color = 'red';
  } else {
    balance.style.color = 'white';
  }

  const expensePercentage = (expenseTotal / incomeTotal) * 100;


  balance.textContent = formatter.format(balanceTotal).substring(1);
  income.textContent = formatter.format(incomeTotal);
  expense.textContent = formatter.format(expenseTotal * -1);
  const incomePercentageElement = document.getElementById('incomePercentage');
  incomePercentageElement.textContent = `${expensePercentage.toFixed(2)}%`;

  if (expensePercentage > 50) {
    incomePercentageElement.style.color = 'red';
  } else {
    incomePercentageElement.style.color = 'white';
  }
}

function renderList() {
  list.innerHTML = '';

  status.textContent = '';
  if (transactions.length === 0) {
    status.textContent = 'No transactions.';
    return;
  }

  transactions.forEach(({ id, name, amount, date, type }) => {
    const sign = 'income' === type ? 1 : -1;

    const li = document.createElement('li');

    li.innerHTML = `
      <div class="name">
        <h4>${name}</h4>
        <p>${new Date(date).toLocaleDateString()}</p>
      </div>

      <div class="amount ${type}">
        <span>${formatter.format(amount * sign)}</span>
      </div>
    
      <div class="action">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" onclick="deleteTransaction(${id})">
          <path stroke-linecap="round" stroke-linejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
    `;

    list.appendChild(li);
  });
}

renderList();
updateTotal();

function deleteTransaction(id) {
  const index = transactions.findIndex((trx) => trx.id === id);
  transactions.splice(index, 1);

  updateTotal();
  saveTransactions();
  renderList();
}

function addTransaction(e) {
  e.preventDefault();

  const formData = new FormData(this);

  transactions.push({
    id: transactions.length + 1,
    name: formData.get('name'),
    amount: parseFloat(formData.get('amount')),
    date: new Date(formData.get('date')),
    type: 'on' === formData.get('type') ? 'income' : 'expense',
  });

  this.reset();

  updateTotal();
  saveTransactions();
  renderList();
}

function saveTransactions() {
  transactions.sort((a, b) => new Date(b.date) - new Date(a.date));

  localStorage.setItem('transactions', JSON.stringify(transactions));
}
// Fungsi untuk menghasilkan laporan dalam format CSV
function generateCSVReport() {
  // Membuat header kolom
  const csvHeader = ['Date', 'Description', 'Amount', 'Type'];

  // Membuat data transaksi
  const csvData = transactions.map((trx) => [
    new Date(trx.date).toLocaleDateString(), // Tanggal (A2)
    trx.name, // Deskripsi (B2)
    trx.amount, // Jumlah (C2)
    trx.type === 'income' ? 'Income' : 'Expense', // Tipe (D2)
  ]);

  // Menghitung total income
  const incomeTotal = transactions
    .filter((trx) => trx.type === 'income')
    .reduce((total, trx) => total + trx.amount, 0);

  // Menghitung total expense
  const expenseTotal = transactions
    .filter((trx) => trx.type === 'expense')
    .reduce((total, trx) => total + trx.amount, 0);

  // Menghitung money used (total expense - total income)
  const moneyUsed = expenseTotal - incomeTotal;

  // Tambahkan total income, total expense, dan money used sebagai baris tambahan dalam laporan
  csvData.push(['', 'Total Income', incomeTotal, 'Income']);
  csvData.push(['', 'Total Expense', expenseTotal, 'Expense']);
  

  // Menggabungkan header dan data menjadi satu array
  const csvContent = [csvHeader, ...csvData];

// Menggabungkan header dan data menjadi satu array dengan titik koma sebagai pemisah
const csvString = csvContent.map((row) => row.join(';')).join('\n');

  // Buat objek Blob untuk laporan CSV
  const blob = new Blob([csvString], { type: 'text/csv' });

  // Buat tautan untuk mengunduh laporan
  const url = window.URL.createObjectURL(blob);

  // Buat elemen tautan untuk pengunduhan
  const downloadLink = document.createElement('a');
  downloadLink.href = url;
  downloadLink.download = 'balance_report.csv'; // Nama file saat diunduh

  // Klik tautan untuk memulai pengunduhan
  downloadLink.click();

  // Bebaskan sumber daya
  window.URL.revokeObjectURL(url);
}

// Menambahkan event listener untuk tombol "Unduh Laporan"
const downloadReportButton = document.getElementById('downloadReport');
downloadReportButton.addEventListener('click', generateCSVReport);



