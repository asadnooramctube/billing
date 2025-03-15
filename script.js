let products = JSON.parse(localStorage.getItem('products')) || [];
let cartSales = [];
let cartWholesale = [];
let salesHistory = JSON.parse(localStorage.getItem('salesHistory')) || [];

function showSection(sectionId) {
    document.querySelectorAll('main section').forEach(section => {
        section.classList.add('hidden');
    });
    document.getElementById(sectionId).classList.remove('hidden');
    if (sectionId === 'sales') {
        updateProductDropdownSales();
    } else if (sectionId === 'wholesale') {
        updateProductDropdownWholesale();
    } else if (sectionId === 'productManagement') {
        updateProductList();
    } else if (sectionId === 'salesHistory') {
        showSalesHistory();
    }
}

function addProduct() {
    const name = document.getElementById('productName').value;
    const price = document.getElementById('productPrice').value;
    const image = document.getElementById('productImage').files[0];

    if (name && price && image) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const product = { name, price, image: e.target.result };
            products.push(product);
            localStorage.setItem('products', JSON.stringify(products));
            updateProductList();
            updateProductDropdownSales();
            updateProductDropdownWholesale();
        };
        reader.readAsDataURL(image);
    } else {
        alert('পণ্যের নাম, মূল্য এবং ছবি অবশ্যই দিতে হবে!');
    }
}

function updateProductList() {
    const productList = document.getElementById('productList');
    productList.innerHTML = '';
    products.forEach((product, index) => {
        productList.innerHTML += `
            <div>
                <img src="${product.image}" alt="${product.name}" width="50">
                ${product.name} - ${product.price} টাকা
                <button onclick="deleteProduct(${index})">ডিলিট</button>
            </div>
        `;
    });
}

function deleteProduct(index) {
    if (confirm('আপনি কি এই পণ্য ডিলিট করতে চান?')) {
        products.splice(index, 1);
        localStorage.setItem('products', JSON.stringify(products));
        updateProductList();
        updateProductDropdownSales();
        updateProductDropdownWholesale();
    }
}

function updateProductDropdownSales() {
    const productSelect = document.getElementById('productSelectSales');
    productSelect.innerHTML = '';
    products.forEach((product, index) => {
        productSelect.innerHTML += `<option value="${index}">${product.name}</option>`;
    });
}

function updateProductDropdownWholesale() {
    const productSelectWholesale = document.getElementById('productSelectWholesale');
    productSelectWholesale.innerHTML = '';
    products.forEach((product, index) => {
        productSelectWholesale.innerHTML += `<option value="${index}">${product.name}</option>`;
    });
}

function searchProductSales() {
    const searchTerm = document.getElementById('searchProductSales').value.toLowerCase();
    const filteredProducts = products.filter(product => product.name.toLowerCase().includes(searchTerm));
    const productSelect = document.getElementById('productSelectSales');
    productSelect.innerHTML = '';
    filteredProducts.forEach((product, index) => {
        productSelect.innerHTML += `<option value="${index}">${product.name}</option>`;
    });
}

function searchProductWholesale() {
    const searchTerm = document.getElementById('searchProductWholesale').value.toLowerCase();
    const filteredProducts = products.filter(product => product.name.toLowerCase().includes(searchTerm));
    const productSelectWholesale = document.getElementById('productSelectWholesale');
    productSelectWholesale.innerHTML = '';
    filteredProducts.forEach((product, index) => {
        productSelectWholesale.innerHTML += `<option value="${index}">${product.name}</option>`;
    });
}

function addToCartSales() {
    const productIndex = document.getElementById('productSelectSales').value;
    const quantity = document.getElementById('quantitySales').value;
    const customerName = document.getElementById('customerName').value;

    if (productIndex && quantity > 0 && customerName) {
        const product = products[productIndex];
        const totalPrice = product.price * quantity;
        cartSales.push({ ...product, quantity, totalPrice, customerName });
        updateCartSales();
    } else {
        alert('পণ্য, পরিমাণ এবং কাস্টমারের নাম সঠিকভাবে নির্বাচন করুন!');
    }
}

function addCustomProductSales() {
    const name = document.getElementById('customProductName').value;
    const price = document.getElementById('customProductPrice').value;
    const quantity = document.getElementById('customProductQuantity').value;
    const customerName = document.getElementById('customerName').value;

    if (name && price && quantity && customerName) {
        const totalPrice = price * quantity;
        cartSales.push({ name, price, quantity, totalPrice, customerName });
        updateCartSales();
    } else {
        alert('কাস্টম পণ্যের নাম, দাম, পরিমাণ এবং কাস্টমারের নাম সঠিকভাবে লিখুন!');
    }
}

function updateCartSales() {
    const cartItems = document.getElementById('cartItemsSales');
    cartItems.innerHTML = '';
    let totalAmount = 0;
    cartSales.forEach((item, index) => {
        cartItems.innerHTML += `
            <div>
                ${item.name} x${item.quantity} - ${item.totalPrice} টাকা
                <button onclick="removeFromCartSales(${index})">রিমুভ</button>
            </div>
        `;
        totalAmount += item.totalPrice;
    });
    document.getElementById('totalAmountSales').innerText = `মোট মূল্য: ${totalAmount} টাকা`;
}

function removeFromCartSales(index) {
    cartSales.splice(index, 1);
    updateCartSales();
}

function generateBillSales() {
    const customerName = document.getElementById('customerName').value;
    const discount = parseFloat(document.getElementById('discountSales').value) || 0;

    if (cartSales.length === 0 || !customerName) {
        alert('কার্টে পণ্য যোগ করুন এবং কাস্টমারের নাম লিখুন!');
        return;
    }

    const totalAmount = cartSales.reduce((sum, item) => sum + item.totalPrice, 0);
    const discountedAmount = totalAmount - discount;

    const billContent = `
        <h1>মা ডিজিটাল স্টুডিও</h1>
        <p>ধলাপাড়া বাজার, ঘাটাইল, টাংগাইল</p>
        <p>মোবাইল: +8801710-065644</p>
        <h2>বিল</h2>
        <p>কাস্টমার: ${customerName}</p>
        <table>
            <thead>
                <tr>
                    <th>পণ্যের নাম</th>
                    <th>পরিমাণ</th>
                    <th>মূল্য</th>
                </tr>
            </thead>
            <tbody>
                ${cartSales.map(item => `
                    <tr>
                        <td>${item.name}</td>
                        <td>${item.quantity}</td>
                        <td>${item.totalPrice} টাকা</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
        <h3>মোট টাকা: ${totalAmount} টাকা</h3>
        <h3>ডিসকাউন্ট: ${discount} টাকা</h3>
        <h3>মোট প্রদেয়: ${discountedAmount} টাকা</h3>
    `;

    const printWindow = window.open('', '', 'width=800,height=600');
    printWindow.document.write(`
        <html>
            <head>
                <title>বিল</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; padding: 20px; }
                    h1, h2, h3 { color: #333; }
                    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                    table, th, td { border: 1px solid #ddd; }
                    th, td { padding: 8px; text-align: left; }
                    th { background-color: #f2f2f2; }
                </style>
            </head>
            <body>
                ${billContent}
            </body>
        </html>
    `);
    printWindow.document.close();
    printWindow.print();

    // বিক্রির হিসাবে সংরক্ষণ
    const sale = {
        date: new Date().toLocaleString(),
        customerName,
        items: cartSales,
        totalAmount,
        discount,
        discountedAmount
    };
    salesHistory.push(sale);
    localStorage.setItem('salesHistory', JSON.stringify(salesHistory));

    clearCartSales();
}

function clearCartSales() {
    cartSales = [];
    updateCartSales();
}

function showDailySales() {
    const today = new Date().toLocaleDateString();
    const dailySales = salesHistory.filter(sale => new Date(sale.date).toLocaleDateString() === today);
    displaySalesReport(dailySales);
}

function showMonthlySales() {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const monthlySales = salesHistory.filter(sale => {
        const saleDate = new Date(sale.date);
        return saleDate.getMonth() === currentMonth && saleDate.getFullYear() === currentYear;
    });
    displaySalesReport(monthlySales);
}

function searchSalesHistory() {
    const searchTerm = document.getElementById('searchSalesHistory').value.toLowerCase();
    const filteredSales = salesHistory.filter(sale => 
        sale.customerName.toLowerCase().includes(searchTerm) || 
        sale.items.some(item => item.name.toLowerCase().includes(searchTerm))
    );
    displaySalesReport(filteredSales);
}

function displaySalesReport(sales) {
    const salesReport = document.getElementById('salesReport');
    salesReport.innerHTML = '';
    sales.sort((a, b) => new Date(b.date) - new Date(a.date)).forEach(sale => {
        salesReport.innerHTML += `
            <div>
                <p>তারিখ: ${sale.date}</p>
                <p>কাস্টমার: ${sale.customerName}</p>
                <p>মোট টাকা: ${sale.totalAmount} টাকা</p>
                <p>ডিসকাউন্ট: ${sale.discount} টাকা</p>
                <p>মোট প্রদেয়: ${sale.discountedAmount} টাকা</p>
            </div>
        `;
    });
}

// Initialize
showSection('sales');
updateProductDropdownSales();
updateProductDropdownWholesale();