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
    } else if (sectionId === 'stockManagement') {
        updateStockList();
    }
}

function addProduct() {
    const name = document.getElementById('productName').value;
    const price = document.getElementById('productPrice').value;
    const image = document.getElementById('productImage').files[0];
    const stock = parseInt(document.getElementById('productStock').value);

    if (name && price && image && stock >= 0) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const product = { name, price, image: e.target.result, stock };
            products.push(product);
            localStorage.setItem('products', JSON.stringify(products));
            updateProductList();
            updateProductDropdownSales();
            updateProductDropdownWholesale();
            updateStockList();
        };
        reader.readAsDataURL(image);
    } else {
        alert('পণ্যের নাম, মূল্য, ছবি এবং স্টক পরিমাণ অবশ্যই দিতে হবে!');
    }
}

function updateProductList() {
    const productList = document.getElementById('productList');
    productList.innerHTML = '';
    products.forEach((product, index) => {
        productList.innerHTML += `
            <div>
                <img src="${product.image}" alt="${product.name}" width="50">
                ${product.name} - ${product.price} টাকা - স্টক: ${product.stock} টি
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
        updateStockList();
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
        if (product.stock >= quantity) {
            const totalPrice = product.price * quantity;
            cartSales.push({ ...product, quantity, totalPrice, customerName });
            product.stock -= quantity;
            localStorage.setItem('products', JSON.stringify(products));
            updateCartSales();
            updateStockList();
        } else {
            alert('স্টকে পর্যাপ্ত পণ্য নেই!');
        }
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
    const removedItem = cartSales.splice(index, 1)[0];
    const product = products.find(p => p.name === removedItem.name);
    if (product) {
        product.stock += removedItem.quantity;
        localStorage.setItem('products', JSON.stringify(products));
    }
    updateCartSales();
    updateStockList();
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

// স্টক ম্যানেজমেন্ট
function updateStockList() {
    const stockList = document.getElementById('stockList');
    stockList.innerHTML = '';
    products.forEach((product, index) => {
        stockList.innerHTML += `
            <div>
                ${product.name} - ${product.stock} টি
                <button onclick="editStock(${index})">স্টক এডিট</button>
            </div>
        `;
    });
}

function editStock(index) {
    const newStock = parseInt(prompt('নতুন স্টক পরিমাণ লিখুন:'));
    if (newStock >= 0) {
        products[index].stock = newStock;
        localStorage.setItem('products', JSON.stringify(products));
        updateStockList();
    } else {
        alert('স্টক পরিমাণ সঠিকভাবে লিখুন!');
    }
}

function searchStock() {
    const searchTerm = document.getElementById('searchStock').value.toLowerCase();
    const filteredStock = products.filter(product => product.name.toLowerCase().includes(searchTerm));
    const stockList = document.getElementById('stockList');
    stockList.innerHTML = '';
    filteredStock.forEach((product, index) => {
        stockList.innerHTML += `
            <div>
                ${product.name} - ${product.stock} টি
                <button onclick="editStock(${index})">স্টক এডিট</button>
            </div>
        `;
    });
}

// পাইকারি বিক্রি
function addToCartWholesale() {
    const productIndex = document.getElementById('productSelectWholesale').value;
    const quantity = document.getElementById('quantityWholesale').value;
    const customerName = document.getElementById('customerNameWholesale').value;
    const customPrice = document.getElementById('customPriceWholesale').value;

    if (productIndex && quantity > 0 && customerName) {
        const product = products[productIndex];
        if (product.stock >= quantity) {
            const totalPrice = (customPrice || product.price) * quantity;
            cartWholesale.push({ ...product, quantity, totalPrice, customerName, customPrice });
            product.stock -= quantity;
            localStorage.setItem('products', JSON.stringify(products));
            updateCartWholesale();
            updateStockList();
        } else {
            alert('স্টকে পর্যাপ্ত পণ্য নেই!');
        }
    } else {
        alert('পণ্য, পরিমাণ এবং কাস্টমারের নাম সঠিকভাবে নির্বাচন করুন!');
    }
}

function addCustomProductWholesale() {
    const name = document.getElementById('customProductNameWholesale').value;
    const price = document.getElementById('customProductPriceWholesale').value;
    const quantity = document.getElementById('customProductQuantityWholesale').value;
    const customerName = document.getElementById('customerNameWholesale').value;

    if (name && price && quantity && customerName) {
        const totalPrice = price * quantity;
        cartWholesale.push({ name, price, quantity, totalPrice, customerName });
        updateCartWholesale();
    } else {
        alert('কাস্টম পণ্যের নাম, দাম, পরিমাণ এবং কাস্টমারের নাম সঠিকভাবে লিখুন!');
    }
}

function updateCartWholesale() {
    const cartItems = document.getElementById('cartItemsWholesale');
    cartItems.innerHTML = '';
    let totalAmount = 0;
    cartWholesale.forEach((item, index) => {
        cartItems.innerHTML += `
            <div>
                ${item.name} x${item.quantity} - ${item.totalPrice} টাকা
                <button onclick="removeFromCartWholesale(${index})">রিমুভ</button>
            </div>
        `;
        totalAmount += item.totalPrice;
    });
    document.getElementById('totalAmountWholesale').innerText = `মোট মূল্য: ${totalAmount} টাকা`;
}

function removeFromCartWholesale(index) {
    const removedItem = cartWholesale.splice(index, 1)[0];
    const product = products.find(p => p.name === removedItem.name);
    if (product) {
        product.stock += removedItem.quantity;
        localStorage.setItem('products', JSON.stringify(products));
    }
    updateCartWholesale();
    updateStockList();
}

function generateBillWholesale() {
    const customerName = document.getElementById('customerNameWholesale').value;
    const discount = parseFloat(document.getElementById('discountWholesale').value) || 0;

    if (cartWholesale.length === 0 || !customerName) {
        alert('কার্টে পণ্য যোগ করুন এবং কাস্টমারের নাম লিখুন!');
        return;
    }

    const totalAmount = cartWholesale.reduce((sum, item) => sum + item.totalPrice, 0);
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
                ${cartWholesale.map(item => `
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
        items: cartWholesale,
        totalAmount,
        discount,
        discountedAmount
    };
    salesHistory.push(sale);
    localStorage.setItem('salesHistory', JSON.stringify(salesHistory));

    clearCartWholesale();
}

function clearCartWholesale() {
    cartWholesale = [];
    updateCartWholesale();
}

// Initialize
showSection('sales');
updateProductDropdownSales();
updateProductDropdownWholesale();
updateStockList();
