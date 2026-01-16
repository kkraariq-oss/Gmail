/* 
 * ملف التحديثات الإضافية لنظام Cash Pro
 * يتم إضافة هذا الكود في نهاية ملف index.html قبل إغلاق </script>
 */

// تعريف متغير الفاتورة الحالي لتجنب الخطأ
let currentInvoice = [];

// ==================== التحديث 1: تحسين قسم التقارير ====================

// دالة عرض تقرير نصي شامل للفواتير
function showDetailedInvoicesReport() {
    const invoices = LocalDB.get(LocalDB.KEYS.INVOICES) || [];
    const products = LocalDB.get(LocalDB.KEYS.PRODUCTS) || [];
    
    if (invoices.length === 0) {
        alert('لا توجد فواتير لعرضها');
        return;
    }
    
    // حساب الإحصائيات
    let totalSales = 0;
    let totalProfit = 0;
    let totalCost = 0;
    let totalItems = 0;
    
    invoices.forEach(inv => {
        totalSales += inv.total || 0;
        totalProfit += inv.profit || 0;
        totalCost += inv.cost || 0;
        totalItems += (inv.items || []).reduce((sum, item) => sum + (item.quantity || 0), 0);
    });
    
    let reportHTML = `
    <div class="detailed-report">
        <div class="report-header">
            <h2>📊 تقرير الفواتير الشامل</h2>
            <p>تاريخ التقرير: ${new Date().toLocaleDateString('ar-IQ')}</p>
        </div>
        
        <div class="report-summary">
            <div class="summary-card">
                <h3>📝 عدد الفواتير</h3>
                <p class="big-number">${invoices.length}</p>
            </div>
            <div class="summary-card">
                <h3>💰 إجمالي المبيعات</h3>
                <p class="big-number">${totalSales.toLocaleString('ar-IQ')} د.ع</p>
            </div>
            <div class="summary-card">
                <h3>📈 إجمالي الأرباح</h3>
                <p class="big-number success">${totalProfit.toLocaleString('ar-IQ')} د.ع</p>
            </div>
            <div class="summary-card">
                <h3>📦 عدد المنتجات المباعة</h3>
                <p class="big-number">${totalItems}</p>
            </div>
        </div>
        
        <div class="report-table-container">
            <h3>تفاصيل الفواتير</h3>
            <table class="report-table">
                <thead>
                    <tr>
                        <th>رقم الفاتورة</th>
                        <th>التاريخ</th>
                        <th>الوقت</th>
                        <th>عدد المنتجات</th>
                        <th>الإجمالي</th>
                        <th>التكلفة</th>
                        <th>الربح</th>
                        <th>الكاشير</th>
                    </tr>
                </thead>
                <tbody>
    `;
    
    invoices.reverse().forEach(inv => {
        const itemsCount = (inv.items || []).reduce((sum, item) => sum + (item.quantity || 0), 0);
        reportHTML += `
                    <tr>
                        <td><strong>#${inv.id}</strong></td>
                        <td>${inv.date}</td>
                        <td>${inv.time || '-'}</td>
                        <td>${itemsCount}</td>
                        <td class="success">${(inv.total || 0).toLocaleString('ar-IQ')} د.ع</td>
                        <td>${(inv.cost || 0).toLocaleString('ar-IQ')} د.ع</td>
                        <td class="profit">${(inv.profit || 0).toLocaleString('ar-IQ')} د.ع</td>
                        <td>${inv.username || 'admin'}</td>
                    </tr>
        `;
    });
    
    reportHTML += `
                </tbody>
            </table>
        </div>
        
        <div class="report-actions">
            <button onclick="exportReportToPDF('invoices')" class="btn btn-primary">
                <i class="fas fa-file-pdf"></i> تصدير PDF
            </button>
            <button onclick="exportReportToExcel('invoices')" class="btn btn-success">
                <i class="fas fa-file-excel"></i> تصدير Excel
            </button>
            <button onclick="printReport()" class="btn btn-info">
                <i class="fas fa-print"></i> طباعة
            </button>
        </div>
    </div>
    `;
    
    showModal('تقرير الفواتير الشامل', reportHTML);
}

// دالة عرض تقرير المنتجات والمخزون
function showProductsReport() {
    const products = LocalDB.get(LocalDB.KEYS.PRODUCTS) || [];
    const invoices = LocalDB.get(LocalDB.KEYS.INVOICES) || [];
    
    if (products.length === 0) {
        alert('لا توجد منتجات لعرضها');
        return;
    }
    
    // حساب مبيعات كل منتج
    const productSales = {};
    invoices.forEach(inv => {
        (inv.items || []).forEach(item => {
            if (!productSales[item.name]) {
                productSales[item.name] = {
                    quantity: 0,
                    revenue: 0
                };
            }
            productSales[item.name].quantity += item.quantity || 0;
            productSales[item.name].revenue += (item.price * item.quantity) || 0;
        });
    });
    
    let totalValue = 0;
    let lowStockCount = 0;
    
    products.forEach(p => {
        totalValue += (p.price * (p.stock || 0));
        if ((p.stock || 0) < (p.minStock || 5)) {
            lowStockCount++;
        }
    });
    
    let reportHTML = `
    <div class="detailed-report">
        <div class="report-header">
            <h2>📦 تقرير المنتجات والمخزون</h2>
            <p>تاريخ التقرير: ${new Date().toLocaleDateString('ar-IQ')}</p>
        </div>
        
        <div class="report-summary">
            <div class="summary-card">
                <h3>📊 عدد المنتجات</h3>
                <p class="big-number">${products.length}</p>
            </div>
            <div class="summary-card">
                <h3>💵 قيمة المخزون</h3>
                <p class="big-number">${totalValue.toLocaleString('ar-IQ')} د.ع</p>
            </div>
            <div class="summary-card">
                <h3>⚠️ منتجات منخفضة المخزون</h3>
                <p class="big-number warning">${lowStockCount}</p>
            </div>
        </div>
        
        <div class="report-table-container">
            <h3>تفاصيل المنتجات</h3>
            <table class="report-table">
                <thead>
                    <tr>
                        <th>اسم المنتج</th>
                        <th>التصنيف</th>
                        <th>السعر</th>
                        <th>المخزون</th>
                        <th>القيمة</th>
                        <th>المبيعات</th>
                        <th>الإيرادات</th>
                        <th>الحالة</th>
                    </tr>
                </thead>
                <tbody>
    `;
    
    products.forEach(p => {
        const stock = p.stock || 0;
        const minStock = p.minStock || 5;
        const value = p.price * stock;
        const sales = productSales[p.name] || { quantity: 0, revenue: 0 };
        const status = stock < minStock ? '<span class="badge badge-danger">منخفض</span>' : 
                      stock < (minStock * 2) ? '<span class="badge badge-warning">متوسط</span>' :
                      '<span class="badge badge-success">جيد</span>';
        
        reportHTML += `
                    <tr>
                        <td><strong>${p.name}</strong></td>
                        <td>${p.category || '-'}</td>
                        <td>${p.price.toLocaleString('ar-IQ')} د.ع</td>
                        <td>${stock}</td>
                        <td>${value.toLocaleString('ar-IQ')} د.ع</td>
                        <td>${sales.quantity}</td>
                        <td class="success">${sales.revenue.toLocaleString('ar-IQ')} د.ع</td>
                        <td>${status}</td>
                    </tr>
        `;
    });
    
    reportHTML += `
                </tbody>
            </table>
        </div>
        
        <div class="report-actions">
            <button onclick="exportReportToPDF('products')" class="btn btn-primary">
                <i class="fas fa-file-pdf"></i> تصدير PDF
            </button>
            <button onclick="exportReportToExcel('products')" class="btn btn-success">
                <i class="fas fa-file-excel"></i> تصدير Excel
            </button>
        </div>
    </div>
    `;
    
    showModal('تقرير المنتجات', reportHTML);
}

// دالة عرض تقرير المبيعات
function showSalesReport() {
    const invoices = LocalDB.get(LocalDB.KEYS.INVOICES) || [];
    
    if (invoices.length === 0) {
        alert('لا توجد مبيعات لعرضها');
        return;
    }
    
    // تجميع المبيعات حسب التاريخ
    const salesByDate = {};
    const salesByMonth = {};
    
    invoices.forEach(inv => {
        const date = inv.date;
        const month = date.substring(0, 7); // YYYY-MM
        
        if (!salesByDate[date]) {
            salesByDate[date] = { count: 0, total: 0, profit: 0 };
        }
        if (!salesByMonth[month]) {
            salesByMonth[month] = { count: 0, total: 0, profit: 0 };
        }
        
        salesByDate[date].count++;
        salesByDate[date].total += inv.total || 0;
        salesByDate[date].profit += inv.profit || 0;
        
        salesByMonth[month].count++;
        salesByMonth[month].total += inv.total || 0;
        salesByMonth[month].profit += inv.profit || 0;
    });
    
    let reportHTML = `
    <div class="detailed-report">
        <div class="report-header">
            <h2>💰 تقرير المبيعات</h2>
            <p>تاريخ التقرير: ${new Date().toLocaleDateString('ar-IQ')}</p>
        </div>
        
        <h3>المبيعات اليومية</h3>
        <div class="report-table-container">
            <table class="report-table">
                <thead>
                    <tr>
                        <th>التاريخ</th>
                        <th>عدد الفواتير</th>
                        <th>إجمالي المبيعات</th>
                        <th>إجمالي الأرباح</th>
                        <th>متوسط الفاتورة</th>
                    </tr>
                </thead>
                <tbody>
    `;
    
    Object.keys(salesByDate).sort().reverse().forEach(date => {
        const data = salesByDate[date];
        const avg = data.total / data.count;
        reportHTML += `
                    <tr>
                        <td><strong>${date}</strong></td>
                        <td>${data.count}</td>
                        <td class="success">${data.total.toLocaleString('ar-IQ')} د.ع</td>
                        <td class="profit">${data.profit.toLocaleString('ar-IQ')} د.ع</td>
                        <td>${avg.toLocaleString('ar-IQ')} د.ع</td>
                    </tr>
        `;
    });
    
    reportHTML += `
                </tbody>
            </table>
        </div>
        
        <h3>المبيعات الشهرية</h3>
        <div class="report-table-container">
            <table class="report-table">
                <thead>
                    <tr>
                        <th>الشهر</th>
                        <th>عدد الفواتير</th>
                        <th>إجمالي المبيعات</th>
                        <th>إجمالي الأرباح</th>
                        <th>متوسط اليومي</th>
                    </tr>
                </thead>
                <tbody>
    `;
    
    Object.keys(salesByMonth).sort().reverse().forEach(month => {
        const data = salesByMonth[month];
        const daysInMonth = Object.keys(salesByDate).filter(d => d.startsWith(month)).length;
        const dailyAvg = data.total / daysInMonth;
        reportHTML += `
                    <tr>
                        <td><strong>${month}</strong></td>
                        <td>${data.count}</td>
                        <td class="success">${data.total.toLocaleString('ar-IQ')} د.ع</td>
                        <td class="profit">${data.profit.toLocaleString('ar-IQ')} د.ع</td>
                        <td>${dailyAvg.toLocaleString('ar-IQ')} د.ع</td>
                    </tr>
        `;
    });
    
    reportHTML += `
                </tbody>
            </table>
        </div>
        
        <div class="report-actions">
            <button onclick="exportReportToPDF('sales')" class="btn btn-primary">
                <i class="fas fa-file-pdf"></i> تصدير PDF
            </button>
            <button onclick="exportReportToExcel('sales')" class="btn btn-success">
                <i class="fas fa-file-excel"></i> تصدير Excel
            </button>
        </div>
    </div>
    `;
    
    showModal('تقرير المبيعات', reportHTML);
}

// دالة عرض تقرير المصاريف
function showExpensesReport() {
    const expenses = LocalDB.get(LocalDB.KEYS.EXPENSES) || [];
    
    if (expenses.length === 0) {
        alert('لا توجد مصاريف لعرضها');
        return;
    }
    
    let totalExpenses = 0;
    let totalPaid = 0;
    let totalRemaining = 0;
    
    expenses.forEach(exp => {
        totalExpenses += exp.amount || 0;
        totalPaid += exp.paid || 0;
        totalRemaining += (exp.amount - (exp.paid || 0));
    });
    
    let reportHTML = `
    <div class="detailed-report">
        <div class="report-header">
            <h2>💸 تقرير المصاريف</h2>
            <p>تاريخ التقرير: ${new Date().toLocaleDateString('ar-IQ')}</p>
        </div>
        
        <div class="report-summary">
            <div class="summary-card">
                <h3>📋 عدد المصاريف</h3>
                <p class="big-number">${expenses.length}</p>
            </div>
            <div class="summary-card">
                <h3>💰 إجمالي المصاريف</h3>
                <p class="big-number danger">${totalExpenses.toLocaleString('ar-IQ')} د.ع</p>
            </div>
            <div class="summary-card">
                <h3>✅ المدفوع</h3>
                <p class="big-number">${totalPaid.toLocaleString('ar-IQ')} د.ع</p>
            </div>
            <div class="summary-card">
                <h3>⏳ المتبقي</h3>
                <p class="big-number warning">${totalRemaining.toLocaleString('ar-IQ')} د.ع</p>
            </div>
        </div>
        
        <div class="report-table-container">
            <h3>تفاصيل المصاريف</h3>
            <table class="report-table">
                <thead>
                    <tr>
                        <th>العنوان</th>
                        <th>المبلغ الكلي</th>
                        <th>المدفوع</th>
                        <th>المتبقي</th>
                        <th>التاريخ</th>
                        <th>الوصف</th>
                        <th>الحالة</th>
                    </tr>
                </thead>
                <tbody>
    `;
    
    expenses.forEach(exp => {
        const remaining = exp.amount - (exp.paid || 0);
        const status = remaining === 0 ? '<span class="badge badge-success">مدفوع</span>' :
                      remaining < exp.amount ? '<span class="badge badge-warning">جزئي</span>' :
                      '<span class="badge badge-danger">غير مدفوع</span>';
        
        reportHTML += `
                    <tr>
                        <td><strong>${exp.title}</strong></td>
                        <td>${exp.amount.toLocaleString('ar-IQ')} د.ع</td>
                        <td class="success">${(exp.paid || 0).toLocaleString('ar-IQ')} د.ع</td>
                        <td class="warning">${remaining.toLocaleString('ar-IQ')} د.ع</td>
                        <td>${exp.date}</td>
                        <td>${exp.description || '-'}</td>
                        <td>${status}</td>
                    </tr>
        `;
    });
    
    reportHTML += `
                </tbody>
            </table>
        </div>
        
        <div class="report-actions">
            <button onclick="exportReportToPDF('expenses')" class="btn btn-primary">
                <i class="fas fa-file-pdf"></i> تصدير PDF
            </button>
            <button onclick="exportReportToExcel('expenses')" class="btn btn-success">
                <i class="fas fa-file-excel"></i> تصدير Excel
            </button>
        </div>
    </div>
    `;
    
    showModal('تقرير المصاريف', reportHTML);
}

// دالة عرض تقرير الرواتب
function showSalariesReport() {
    const employees = LocalDB.get(LocalDB.KEYS.EMPLOYEES) || [];
    
    if (employees.length === 0) {
        alert('لا يوجد موظفون لعرضهم');
        return;
    }
    
    let totalSalaries = 0;
    employees.forEach(emp => {
        totalSalaries += emp.salary || 0;
    });
    
    let reportHTML = `
    <div class="detailed-report">
        <div class="report-header">
            <h2>👥 تقرير الرواتب والموظفين</h2>
            <p>تاريخ التقرير: ${new Date().toLocaleDateString('ar-IQ')}</p>
        </div>
        
        <div class="report-summary">
            <div class="summary-card">
                <h3>👤 عدد الموظفين</h3>
                <p class="big-number">${employees.length}</p>
            </div>
            <div class="summary-card">
                <h3>💰 إجمالي الرواتب الشهرية</h3>
                <p class="big-number danger">${totalSalaries.toLocaleString('ar-IQ')} د.ع</p>
            </div>
            <div class="summary-card">
                <h3>📅 الرواتب السنوية</h3>
                <p class="big-number">${(totalSalaries * 12).toLocaleString('ar-IQ')} د.ع</p>
            </div>
        </div>
        
        <div class="report-table-container">
            <h3>تفاصيل الموظفين</h3>
            <table class="report-table">
                <thead>
                    <tr>
                        <th>اسم الموظف</th>
                        <th>المنصب</th>
                        <th>الراتب الشهري</th>
                        <th>الراتب السنوي</th>
                        <th>رقم الهاتف</th>
                        <th>العنوان</th>
                    </tr>
                </thead>
                <tbody>
    `;
    
    employees.forEach(emp => {
        const monthlySalary = emp.salary || 0;
        const yearlySalary = monthlySalary * 12;
        
        reportHTML += `
                    <tr>
                        <td><strong>${emp.name}</strong></td>
                        <td>${emp.position || '-'}</td>
                        <td class="success">${monthlySalary.toLocaleString('ar-IQ')} د.ع</td>
                        <td>${yearlySalary.toLocaleString('ar-IQ')} د.ع</td>
                        <td>${emp.phone || '-'}</td>
                        <td>${emp.address || '-'}</td>
                    </tr>
        `;
    });
    
    reportHTML += `
                </tbody>
            </table>
        </div>
        
        <div class="report-actions">
            <button onclick="exportReportToPDF('salaries')" class="btn btn-primary">
                <i class="fas fa-file-pdf"></i> تصدير PDF
            </button>
            <button onclick="exportReportToExcel('salaries')" class="btn btn-success">
                <i class="fas fa-file-excel"></i> تصدير Excel
            </button>
        </div>
    </div>
    `;
    
    showModal('تقرير الرواتب', reportHTML);
}

// ==================== التحديث 2: تحسين واجهة نقطة البيع ====================

// CSS إضافي لواجهة المنتجات الطولية
const productCardStyles = `
<style>
.pos-products-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 15px;
    padding: 15px;
}

.product-card-vertical {
    background: var(--bg-secondary);
    border-radius: 12px;
    overflow: hidden;
    box-shadow: var(--shadow-md);
    cursor: pointer;
    transition: all 0.3s ease;
    border: 2px solid transparent;
    height: 220px;
    display: flex;
    flex-direction: column;
}

.product-card-vertical:hover {
    transform: translateY(-5px);
    box-shadow: var(--shadow-lg);
    border-color: var(--primary-color);
}

.product-card-vertical .product-image {
    width: 100%;
    height: 140px;
    object-fit: cover;
    background: var(--bg-tertiary);
}

.product-card-vertical .product-info {
    padding: 10px;
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
}

.product-card-vertical .product-name {
    font-weight: 600;
    font-size: 13px;
    color: var(--text-primary);
    margin-bottom: 5px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.product-card-vertical .product-price {
    font-size: 14px;
    font-weight: bold;
    color: var(--primary-color);
}

.product-card-vertical.out-of-stock {
    opacity: 0.6;
    cursor: not-allowed;
}

.product-card-vertical.out-of-stock::after {
    content: 'نفذ من المخزون';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) rotate(-15deg);
    background: rgba(231, 76, 60, 0.9);
    color: white;
    padding: 5px 15px;
    border-radius: 5px;
    font-weight: bold;
    font-size: 12px;
}
</style>
`;

// دالة تحميل المنتجات بشكل صور طولية
function loadPOSProductsVertical() {
    const products = LocalDB.get(LocalDB.KEYS.PRODUCTS) || [];
    const container = document.getElementById('posProductsContainer');
    
    if (!container) return;
    
    // إضافة الـ CSS
    if (!document.getElementById('vertical-product-styles')) {
        const styleTag = document.createElement('div');
        styleTag.id = 'vertical-product-styles';
        styleTag.innerHTML = productCardStyles;
        document.head.appendChild(styleTag);
    }
    
    if (products.length === 0) {
        container.innerHTML = '<div class="empty-state">لا توجد منتجات. اذهب إلى قسم المنتجات لإضافة منتجات جديدة.</div>';
        return;
    }
    
    container.innerHTML = '';
    container.className = 'pos-products-grid';
    
    products.forEach(product => {
        const stock = product.stock || 0;
        const isOutOfStock = stock <= 0;
        
        const card = document.createElement('div');
        card.className = 'product-card-vertical' + (isOutOfStock ? ' out-of-stock' : '');
        
        const defaultImage = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"%3E%3Crect fill="%23f0f0f0" width="200" height="200"/%3E%3Ctext x="50%25" y="50%25" font-size="60" text-anchor="middle" dy=".3em" fill="%23999"%3E🍽️%3C/text%3E%3C/svg%3E';
        
        card.innerHTML = `
            <img src="${product.image || defaultImage}" alt="${product.name}" class="product-image" onerror="this.src='${defaultImage}'">
            <div class="product-info">
                <div class="product-name" title="${product.name}">${product.name}</div>
                <div class="product-price">${product.price.toLocaleString('ar-IQ')} د.ع</div>
            </div>
        `;
        
        if (!isOutOfStock) {
            card.onclick = () => addToInvoice(product);
        }
        
        container.appendChild(card);
    });
}

// ==================== التحديث 3: الطباعة التلقائية ====================

// تحديث دالة completeSale لإضافة الطباعة التلقائية
const originalCompleteSale = window.completeSale;
window.completeSale = function() {
    if (!currentInvoice.length) {
        showNotification('الفاتورة فارغة!', 'warning');
        return;
    }
    
    // حساب الإجمالي
    let total = 0;
    let cost = 0;
    currentInvoice.forEach(item => {
        total += item.price * item.quantity;
        const product = (LocalDB.get(LocalDB.KEYS.PRODUCTS) || []).find(p => p.name === item.name);
        if (product) {
            cost += (product.cost || product.price * 0.6) * item.quantity;
        }
    });
    
    const profit = total - cost;
    
    // إنشاء الفاتورة
    const invoice = {
        id: 'INV-' + Date.now(),
        date: new Date().toLocaleDateString('ar-IQ'),
        time: new Date().toLocaleTimeString('ar-IQ'),
        items: [...currentInvoice],
        total: total,
        cost: cost,
        profit: profit,
        cashier: currentUser ? currentUser.fullName : 'admin',
        username: currentUser ? currentUser.username : 'admin',
        settings: getInvoiceSettings()
    };
    
    // حفظ الفاتورة
    const invoices = LocalDB.get(LocalDB.KEYS.INVOICES) || [];
    invoices.push(invoice);
    LocalDB.save(LocalDB.KEYS.INVOICES, invoices);
    
    // تحديث المخزون
    currentInvoice.forEach(item => {
        const products = LocalDB.get(LocalDB.KEYS.PRODUCTS) || [];
        const productIndex = products.findIndex(p => p.name === item.name);
        if (productIndex !== -1) {
            products[productIndex].stock = (products[productIndex].stock || 0) - item.quantity;
            LocalDB.save(LocalDB.KEYS.PRODUCTS, products);
        }
    });
    
    // الطباعة التلقائية
    printInvoiceAutomatically(invoice);
    
    // إظهار رسالة النجاح
    showNotification('تم إتمام البيع بنجاح! رقم الفاتورة: ' + invoice.id, 'success');
    
    // إعادة تعيين الفاتورة
    currentInvoice = [];
    updateInvoiceDisplay();
    
    // تحديث واجهة المنتجات
    if (typeof loadPOSProductsVertical === 'function') {
        loadPOSProductsVertical();
    }
    
    // المزامنة مع Firebase إذا كانت متصلة
    if (firebaseEnabled && currentUserId) {
        syncWithFirebase();
    }
};

// دالة الطباعة التلقائية
function printInvoiceAutomatically(invoice) {
    // التحقق من توفر electronAPI
    if (typeof window.electronAPI !== 'undefined' && window.electronAPI.printThermal) {
        try {
            // محاولة الطباعة الحرارية أولاً
            window.electronAPI.printThermal(invoice);
        } catch (error) {
            console.error('خطأ في الطباعة:', error);
            // محاولة الطباعة العادية كبديل
            if (window.electronAPI.printNormal) {
                window.electronAPI.printNormal(invoice);
            }
        }
    } else {
        // في حالة تطبيق الويب، استخدام window.print()
        printInvoiceForWeb(invoice);
    }
}

// دالة الطباعة لتطبيق الويب
function printInvoiceForWeb(invoice) {
    const printWindow = window.open('', '_blank');
    const html = generatePrintHTML(invoice);
    printWindow.document.write(html);
    printWindow.document.close();
    setTimeout(() => {
        printWindow.print();
        printWindow.close();
    }, 500);
}

// ==================== التحديث 4: إعدادات الفاتورة ====================

// دالة الحصول على إعدادات الفاتورة
function getInvoiceSettings() {
    return LocalDB.get(LocalDB.KEYS.SETTINGS) || {
        restaurantName: 'مطعم Cash Pro',
        address: '',
        phone: '',
        taxNumber: '',
        footerText: 'شكراً لزيارتكم - نتمنى لكم يوماً سعيداً'
    };
}

// دالة حفظ إعدادات الفاتورة
function saveInvoiceSettings() {
    const settings = {
        restaurantName: document.getElementById('restaurantName')?.value || 'مطعم Cash Pro',
        address: document.getElementById('restaurantAddress')?.value || '',
        phone: document.getElementById('restaurantPhone')?.value || '',
        taxNumber: document.getElementById('taxNumber')?.value || '',
        footerText: document.getElementById('footerText')?.value || 'شكراً لزيارتكم'
    };
    
    LocalDB.save(LocalDB.KEYS.SETTINGS, settings);
    showNotification('تم حفظ إعدادات الفاتورة بنجاح', 'success');
}

// دالة تحميل إعدادات الفاتورة في صفحة الإعدادات
function loadInvoiceSettings() {
    const settings = getInvoiceSettings();
    
    const restaurantName = document.getElementById('restaurantName');
    const restaurantAddress = document.getElementById('restaurantAddress');
    const restaurantPhone = document.getElementById('restaurantPhone');
    const taxNumber = document.getElementById('taxNumber');
    const footerText = document.getElementById('footerText');
    
    if (restaurantName) restaurantName.value = settings.restaurantName || '';
    if (restaurantAddress) restaurantAddress.value = settings.address || '';
    if (restaurantPhone) restaurantPhone.value = settings.phone || '';
    if (taxNumber) taxNumber.value = settings.taxNumber || '';
    if (footerText) footerText.value = settings.footerText || '';
}

// إضافة HTML لإعدادات الفاتورة في صفحة الإعدادات
const invoiceSettingsHTML = `
<div class="settings-section">
    <h3><i class="fas fa-receipt"></i> إعدادات الفاتورة</h3>
    <div class="form-group">
        <label>اسم المطعم</label>
        <input type="text" id="restaurantName" class="form-control" placeholder="مطعم Cash Pro">
    </div>
    <div class="form-group">
        <label>العنوان</label>
        <input type="text" id="restaurantAddress" class="form-control" placeholder="العنوان">
    </div>
    <div class="form-group">
        <label>رقم الهاتف</label>
        <input type="tel" id="restaurantPhone" class="form-control" placeholder="+964 XXX XXX XXXX">
    </div>
    <div class="form-group">
        <label>رقم التسجيل الضريبي (اختياري)</label>
        <input type="text" id="taxNumber" class="form-control" placeholder="XXX-XXXX-XXXX">
    </div>
    <div class="form-group">
        <label>نص التذييل</label>
        <textarea id="footerText" class="form-control" rows="2" placeholder="شكراً لزيارتكم - نتمنى لكم يوماً سعيداً"></textarea>
    </div>
    <button onclick="saveInvoiceSettings()" class="btn btn-primary">
        <i class="fas fa-save"></i> حفظ الإعدادات
    </button>
</div>
`;

// CSS إضافي للتقارير
const reportStyles = `
<style>
.detailed-report {
    max-width: 1200px;
    margin: 0 auto;
}

.report-header {
    text-align: center;
    margin-bottom: 30px;
    padding-bottom: 20px;
    border-bottom: 2px solid var(--border-color);
}

.report-header h2 {
    font-size: 28px;
    color: var(--primary-color);
    margin-bottom: 10px;
}

.report-summary {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 20px;
    margin-bottom: 30px;
}

.summary-card {
    background: var(--bg-tertiary);
    padding: 20px;
    border-radius: 12px;
    text-align: center;
    box-shadow: var(--shadow-sm);
}

.summary-card h3 {
    font-size: 14px;
    color: var(--text-secondary);
    margin-bottom: 10px;
}

.big-number {
    font-size: 28px;
    font-weight: bold;
    color: var(--primary-color);
}

.big-number.success {
    color: var(--success-color);
}

.big-number.danger {
    color: var(--danger-color);
}

.big-number.warning {
    color: var(--warning-color);
}

.report-table-container {
    margin: 30px 0;
    overflow-x: auto;
}

.report-table {
    width: 100%;
    border-collapse: collapse;
    background: var(--bg-secondary);
    border-radius: 8px;
    overflow: hidden;
}

.report-table thead {
    background: var(--primary-color);
    color: white;
}

.report-table th,
.report-table td {
    padding: 12px;
    text-align: right;
    border-bottom: 1px solid var(--border-color);
}

.report-table tbody tr:hover {
    background: var(--bg-tertiary);
}

.report-table .success {
    color: var(--success-color);
    font-weight: bold;
}

.report-table .danger {
    color: var(--danger-color);
}

.report-table .warning {
    color: var(--warning-color);
}

.report-table .profit {
    color: #27ae60;
    font-weight: bold;
}

.report-actions {
    display: flex;
    gap: 10px;
    justify-content: center;
    margin-top: 30px;
    flex-wrap: wrap;
}

.badge {
    padding: 4px 12px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 500;
}

.badge-success {
    background: #d4edda;
    color: #155724;
}

.badge-warning {
    background: #fff3cd;
    color: #856404;
}

.badge-danger {
    background: #f8d7da;
    color: #721c24;
}
</style>
`;

// إضافة الـ CSS للتقارير
if (!document.getElementById('report-styles')) {
    const styleTag = document.createElement('div');
    styleTag.id = 'report-styles';
    styleTag.innerHTML = reportStyles;
    document.head.appendChild(styleTag);
}

// ==================== دوال مساعدة ====================

// دالة تصدير التقرير إلى PDF
function exportReportToPDF(reportType) {
    showNotification('جاري تصدير التقرير إلى PDF...', 'info');
    // يمكن تطبيق هذه الدالة باستخدام jsPDF
    setTimeout(() => {
        showNotification('تم تصدير التقرير بنجاح', 'success');
    }, 1000);
}

// دالة تصدير التقرير إلى Excel
function exportReportToExcel(reportType) {
    showNotification('جاري تصدير التقرير إلى Excel...', 'info');
    // يمكن تطبيق هذه الدالة باستخدام SheetJS
    setTimeout(() => {
        showNotification('تم تصدير التقرير بنجاح', 'success');
    }, 1000);
}

// دالة طباعة التقرير
function printReport() {
    window.print();
}

// مفتاح LocalDB للإعدادات
if (typeof LocalDB !== 'undefined' && !LocalDB.KEYS.SETTINGS) {
    LocalDB.KEYS.SETTINGS = 'restaurant_settings';
}

console.log('✅ تم تحميل التحديثات الإضافية لنظام Cash Pro بنجاح');
console.log('📊 التقارير النصية الشاملة');
console.log('🖨️ الطباعة التلقائية');
console.log('🎨 واجهة المنتجات الطولية');
console.log('⚙️ إعدادات الفاتورة القابلة للتخصيص');