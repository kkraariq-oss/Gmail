// ===== تحديث واجهة نقطة البيع - عرض المنتجات كصور طولية =====

// CSS لواجهة نقطة البيع الجديدة
const posStyles = `
<style>
/* تخطيط نقطة البيع الجديد */
.pos-products-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 20px;
    padding: 20px;
    max-height: calc(100vh - 300px);
    overflow-y: auto;
}

/* بطاقة المنتج الجديدة - تصميم طولي */
.product-card-vertical {
    background: var(--bg-secondary);
    border-radius: 16px;
    overflow: hidden;
    box-shadow: var(--shadow-md);
    transition: all 0.3s ease;
    cursor: pointer;
    display: flex;
    flex-direction: column;
    height: 280px;
}

.product-card-vertical:hover {
    transform: translateY(-5px);
    box-shadow: var(--shadow-lg);
}

.product-card-vertical:active {
    transform: scale(0.98);
}

/* صورة المنتج */
.product-image-container {
    width: 100%;
    height: 160px;
    background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    overflow: hidden;
}

.product-image-container img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s ease;
}

.product-card-vertical:hover .product-image-container img {
    transform: scale(1.1);
}

/* أيقونة افتراضية إذا لم تكن هناك صورة */
.product-icon-placeholder {
    font-size: 60px;
    color: var(--primary-color);
    opacity: 0.6;
}

/* شارة المخزون */
.stock-badge {
    position: absolute;
    top: 10px;
    left: 10px;
    background: rgba(0, 0, 0, 0.7);
    color: white;
    padding: 4px 10px;
    border-radius: 20px;
    font-size: 11px;
    font-weight: 600;
}

.stock-badge.low-stock {
    background: var(--danger-color);
    animation: pulse 2s infinite;
}

@keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.7; }
}

/* شارة السعر */
.price-badge {
    position: absolute;
    bottom: 0;
    right: 0;
    background: var(--primary-color);
    color: white;
    padding: 8px 12px;
    font-size: 14px;
    font-weight: 700;
    border-top-left-radius: 12px;
}

/* معلومات المنتج */
.product-info-vertical {
    padding: 15px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    flex: 1;
}

.product-name-vertical {
    font-size: 15px;
    font-weight: 700;
    color: var(--text-primary);
    margin-bottom: 8px;
    line-height: 1.3;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
}

.product-category-badge {
    display: inline-block;
    font-size: 11px;
    padding: 3px 8px;
    background: var(--bg-tertiary);
    color: var(--text-secondary);
    border-radius: 6px;
    margin-top: auto;
}

/* فلتر الفئات */
.category-filter-bar {
    display: flex;
    gap: 10px;
    padding: 15px 20px;
    background: var(--bg-tertiary);
    border-radius: 12px;
    margin-bottom: 20px;
    overflow-x: auto;
    flex-wrap: wrap;
}

.category-filter-btn {
    padding: 10px 20px;
    border-radius: 25px;
    border: 2px solid var(--border-color);
    background: var(--bg-secondary);
    color: var(--text-primary);
    font-weight: 600;
    font-size: 13px;
    cursor: pointer;
    transition: all 0.3s ease;
    white-space: nowrap;
}

.category-filter-btn:hover {
    border-color: var(--primary-color);
    background: var(--bg-tertiary);
}

.category-filter-btn.active {
    background: var(--primary-color);
    color: white;
    border-color: var(--primary-color);
}

/* مربع البحث */
.product-search-box {
    width: 100%;
    padding: 12px 20px;
    border-radius: 25px;
    border: 2px solid var(--border-color);
    background: var(--bg-secondary);
    font-size: 14px;
    margin-bottom: 20px;
    transition: all 0.3s ease;
}

.product-search-box:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 4px rgba(124, 58, 237, 0.1);
}

/* تصميم السلة */
.cart-section {
    background: var(--bg-secondary);
    border-radius: 16px;
    padding: 20px;
    height: calc(100vh - 200px);
    display: flex;
    flex-direction: column;
}

.cart-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding-bottom: 15px;
    border-bottom: 2px solid var(--border-color);
}

.cart-items-list {
    flex: 1;
    overflow-y: auto;
    margin-bottom: 20px;
}

.cart-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 15px;
    background: var(--bg-tertiary);
    border-radius: 12px;
    margin-bottom: 10px;
    transition: all 0.3s ease;
}

.cart-item:hover {
    background: var(--bg-primary);
}

.cart-item-image {
    width: 50px;
    height: 50px;
    border-radius: 8px;
    object-fit: cover;
    background: var(--bg-secondary);
}

.cart-item-icon {
    width: 50px;
    height: 50px;
    border-radius: 8px;
    background: var(--primary-color);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 20px;
}

.cart-item-info {
    flex: 1;
}

.cart-item-name {
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 4px;
}

.cart-item-price {
    font-size: 13px;
    color: var(--text-secondary);
}

.cart-item-controls {
    display: flex;
    align-items: center;
    gap: 10px;
}

.quantity-btn {
    width: 32px;
    height: 32px;
    border-radius: 8px;
    border: none;
    background: var(--primary-color);
    color: white;
    font-size: 16px;
    cursor: pointer;
    transition: all 0.3s ease;
}

.quantity-btn:hover {
    background: var(--secondary-color);
    transform: scale(1.1);
}

.quantity-btn:active {
    transform: scale(0.95);
}

.quantity-display {
    min-width: 40px;
    text-align: center;
    font-weight: 700;
    font-size: 16px;
}

.remove-item-btn {
    width: 32px;
    height: 32px;
    border-radius: 8px;
    border: none;
    background: var(--danger-color);
    color: white;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.3s ease;
}

.remove-item-btn:hover {
    background: #c0392b;
    transform: scale(1.1);
}

.cart-summary {
    padding: 20px;
    background: var(--bg-tertiary);
    border-radius: 12px;
}

.summary-row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 12px;
    padding-bottom: 12px;
    border-bottom: 1px dashed var(--border-color);
}

.summary-row:last-child {
    border-bottom: none;
}

.summary-row.total {
    font-size: 20px;
    font-weight: 700;
    color: var(--primary-color);
    margin-top: 10px;
    padding-top: 15px;
    border-top: 2px solid var(--primary-color);
}

.checkout-btn {
    width: 100%;
    padding: 16px;
    border-radius: 12px;
    border: none;
    background: linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%);
    color: white;
    font-size: 18px;
    font-weight: 700;
    cursor: pointer;
    margin-top: 15px;
    transition: all 0.3s ease;
}

.checkout-btn:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-lg);
}

.checkout-btn:active {
    transform: scale(0.98);
}

.checkout-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

/* استجابة للشاشات الصغيرة */
@media (max-width: 768px) {
    .pos-products-grid {
        grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
        gap: 15px;
    }
    
    .product-card-vertical {
        height: 240px;
    }
    
    .product-image-container {
        height: 130px;
    }
}
</style>
`;

// JavaScript لواجهة نقطة البيع الجديدة
const posScripts = `
<script>
// متغيرات نقطة البيع
let posCart = [];
let currentCategory = 'all';

// تهيئة نقطة البيع
function initPOS() {
    renderCategoryFilter();
    renderProducts();
    renderCart();
}

// عرض فلتر الفئات
function renderCategoryFilter() {
    const categories = LocalDB.get(LocalDB.KEYS.CATEGORIES) || [];
    const filterBar = document.getElementById('categoryFilterBar');
    
    if (!filterBar) return;
    
    let html = \`
        <button class="category-filter-btn \${currentCategory === 'all' ? 'active' : ''}" 
                onclick="filterByCategory('all')">
            <i class="fas fa-th"></i> الكل
        </button>
    \`;
    
    categories.forEach(cat => {
        html += \`
            <button class="category-filter-btn \${currentCategory === cat.name ? 'active' : ''}" 
                    onclick="filterByCategory('\${cat.name}')">
                <i class="fas fa-folder"></i> \${cat.name}
            </button>
        \`;
    });
    
    filterBar.innerHTML = html;
}

// فلترة حسب الفئة
function filterByCategory(category) {
    currentCategory = category;
    renderCategoryFilter();
    renderProducts();
}

// عرض المنتجات
function renderProducts() {
    const products = LocalDB.get(LocalDB.KEYS.PRODUCTS) || [];
    const searchTerm = document.getElementById('productSearchBox')?.value.toLowerCase() || '';
    const productsGrid = document.getElementById('posProductsGrid');
    
    if (!productsGrid) return;
    
    // فلترة المنتجات
    let filteredProducts = products;
    
    if (currentCategory !== 'all') {
        filteredProducts = filteredProducts.filter(p => p.category === currentCategory);
    }
    
    if (searchTerm) {
        filteredProducts = filteredProducts.filter(p => 
            p.name.toLowerCase().includes(searchTerm) ||
            (p.category && p.category.toLowerCase().includes(searchTerm))
        );
    }
    
    // عرض المنتجات
    if (filteredProducts.length === 0) {
        productsGrid.innerHTML = \`
            <div class="no-data" style="grid-column: 1 / -1;">
                <i class="fas fa-box-open" style="font-size: 48px; color: var(--text-tertiary); margin-bottom: 15px;"></i>
                <p>لا توجد منتجات</p>
            </div>
        \`;
        return;
    }
    
    let html = '';
    filteredProducts.forEach(product => {
        const isLowStock = product.stock <= 10;
        html += \`
            <div class="product-card-vertical" onclick="addToCart('\${product.id}')">
                <div class="product-image-container">
                    \${product.image ? 
                        \`<img src="\${product.image}" alt="\${product.name}">\` :
                        \`<i class="product-icon-placeholder fas fa-utensils"></i>\`
                    }
                    <div class="stock-badge \${isLowStock ? 'low-stock' : ''}">
                        \${product.stock} متوفر
                    </div>
                    <div class="price-badge">
                        \${product.price.toLocaleString('ar-IQ')} د.ع
                    </div>
                </div>
                <div class="product-info-vertical">
                    <div class="product-name-vertical">\${product.name}</div>
                    \${product.category ? 
                        \`<span class="product-category-badge"><i class="fas fa-tag"></i> \${product.category}</span>\` :
                        ''
                    }
                </div>
            </div>
        \`;
    });
    
    productsGrid.innerHTML = html;
}

// إضافة منتج إلى السلة
function addToCart(productId) {
    const products = LocalDB.get(LocalDB.KEYS.PRODUCTS) || [];
    const product = products.find(p => p.id === productId);
    
    if (!product) {
        showNotification('المنتج غير موجود', 'error');
        return;
    }
    
    if (product.stock <= 0) {
        showNotification('المنتج غير متوفر في المخزون', 'error');
        return;
    }
    
    // البحث عن المنتج في السلة
    const existingItem = posCart.find(item => item.id === productId);
    
    if (existingItem) {
        if (existingItem.quantity >= product.stock) {
            showNotification('الكمية المطلوبة أكبر من المتوفر في المخزون', 'error');
            return;
        }
        existingItem.quantity++;
    } else {
        posCart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            quantity: 1,
            maxStock: product.stock
        });
    }
    
    renderCart();
    playAddSound(); // صوت عند الإضافة
}

// عرض السلة
function renderCart() {
    const cartItemsList = document.getElementById('cartItemsList');
    const cartSummary = document.getElementById('cartSummary');
    
    if (!cartItemsList || !cartSummary) return;
    
    // عرض العناصر
    if (posCart.length === 0) {
        cartItemsList.innerHTML = \`
            <div class="no-data">
                <i class="fas fa-shopping-cart" style="font-size: 48px; color: var(--text-tertiary); margin-bottom: 15px;"></i>
                <p>السلة فارغة</p>
            </div>
        \`;
    } else {
        let html = '';
        posCart.forEach((item, index) => {
            html += \`
                <div class="cart-item">
                    \${item.image ? 
                        \`<img src="\${item.image}" class="cart-item-image" alt="\${item.name}">\` :
                        \`<div class="cart-item-icon"><i class="fas fa-utensils"></i></div>\`
                    }
                    <div class="cart-item-info">
                        <div class="cart-item-name">\${item.name}</div>
                        <div class="cart-item-price">\${item.price.toLocaleString('ar-IQ')} د.ع</div>
                    </div>
                    <div class="cart-item-controls">
                        <button class="quantity-btn" onclick="decreaseQuantity(\${index})">
                            <i class="fas fa-minus"></i>
                        </button>
                        <div class="quantity-display">\${item.quantity}</div>
                        <button class="quantity-btn" onclick="increaseQuantity(\${index})">
                            <i class="fas fa-plus"></i>
                        </button>
                        <button class="remove-item-btn" onclick="removeFromCart(\${index})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            \`;
        });
        cartItemsList.innerHTML = html;
    }
    
    // حساب الملخص
    const subtotal = posCart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const discount = parseFloat(document.getElementById('posDiscount')?.value || 0);
    const total = subtotal - discount;
    
    cartSummary.innerHTML = \`
        <div class="summary-row">
            <span>المجموع الفرعي:</span>
            <span>\${subtotal.toLocaleString('ar-IQ')} د.ع</span>
        </div>
        \${discount > 0 ? \`
        <div class="summary-row">
            <span>الخصم:</span>
            <span style="color: var(--danger-color);">-\${discount.toLocaleString('ar-IQ')} د.ع</span>
        </div>
        \` : ''}
        <div class="summary-row total">
            <span>الإجمالي:</span>
            <span>\${total.toLocaleString('ar-IQ')} د.ع</span>
        </div>
    \`;
    
    // تحديث زر الدفع
    const checkoutBtn = document.getElementById('checkoutBtn');
    if (checkoutBtn) {
        checkoutBtn.disabled = posCart.length === 0;
    }
}

// زيادة الكمية
function increaseQuantity(index) {
    const item = posCart[index];
    if (item.quantity >= item.maxStock) {
        showNotification('الكمية المطلوبة أكبر من المتوفر في المخزون', 'error');
        return;
    }
    item.quantity++;
    renderCart();
}

// تقليل الكمية
function decreaseQuantity(index) {
    const item = posCart[index];
    if (item.quantity > 1) {
        item.quantity--;
        renderCart();
    } else {
        removeFromCart(index);
    }
}

// حذف من السلة
function removeFromCart(index) {
    posCart.splice(index, 1);
    renderCart();
}

// تنظيف السلة
function clearCart() {
    posCart = [];
    renderCart();
    if (document.getElementById('posDiscount')) {
        document.getElementById('posDiscount').value = 0;
    }
    if (document.getElementById('posNotes')) {
        document.getElementById('posNotes').value = '';
    }
}

// إتمام البيع
function completePOSSale() {
    if (posCart.length === 0) {
        showNotification('السلة فارغة!', 'error');
        return;
    }
    
    const subtotal = posCart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const discount = parseFloat(document.getElementById('posDiscount')?.value || 0);
    const total = subtotal - discount;
    
    if (total < 0) {
        showNotification('الخصم أكبر من المجموع!', 'error');
        return;
    }
    
    // إنشاء الفاتورة
    const now = new Date();
    const invoice = {
        id: 'INV-' + Date.now(),
        date: now.toLocaleDateString('ar-IQ'),
        time: now.toLocaleTimeString('ar-IQ', { hour: '2-digit', minute: '2-digit' }),
        items: posCart.map(item => ({
            name: item.name,
            price: item.price,
            quantity: item.quantity
        })),
        total: total,
        discount: discount,
        username: currentUser?.username || 'admin',
        cashier: currentUser?.fullName || currentUser?.username || 'admin',
        notes: document.getElementById('posNotes')?.value || ''
    };
    
    try {
        // حفظ الفاتورة
        const invoices = LocalDB.get(LocalDB.KEYS.INVOICES) || [];
        invoices.push(invoice);
        LocalDB.save(LocalDB.KEYS.INVOICES, invoices);
        
        // تحديث المخزون
        const products = LocalDB.get(LocalDB.KEYS.PRODUCTS) || [];
        posCart.forEach(cartItem => {
            const product = products.find(p => p.id === cartItem.id);
            if (product) {
                product.stock -= cartItem.quantity;
            }
        });
        LocalDB.save(LocalDB.KEYS.PRODUCTS, products);
        
        // طباعة الفاتورة تلقائياً
        printInvoiceAutomatically(invoice);
        
        // تنظيف السلة
        clearCart();
        renderProducts(); // تحديث عرض المنتجات
        
        showNotification('✅ تم إتمام عملية البيع وطباعة الفاتورة بنجاح!', 'success');
        
    } catch (error) {
        console.error('Error completing sale:', error);
        showNotification('حدث خطأ أثناء إتمام البيع', 'error');
    }
}

// صوت عند الإضافة (اختياري)
function playAddSound() {
    // يمكن إضافة صوت هنا إذا أردت
    // const audio = new Audio('sounds/add.mp3');
    // audio.play();
}

// البحث عن المنتجات
function searchProducts() {
    renderProducts();
}

// تهيئة عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    // إضافة مستمع للبحث
    const searchBox = document.getElementById('productSearchBox');
    if (searchBox) {
        searchBox.addEventListener('input', searchProducts);
    }
    
    // إضافة مستمع للخصم
    const discountInput = document.getElementById('posDiscount');
    if (discountInput) {
        discountInput.addEventListener('input', renderCart);
    }
    
    // تهيئة نقطة البيع
    initPOS();
});
</script>
`;

// HTML لنقطة البيع
const posHTML = `
<div class="pos-container" style="display: grid; grid-template-columns: 2fr 1fr; gap: 20px; padding: 20px;">
    <!-- قسم المنتجات -->
    <div class="pos-products-section">
        <!-- البحث -->
        <input type="text" id="productSearchBox" class="product-search-box" placeholder="🔍 ابحث عن منتج...">
        
        <!-- فلتر الفئات -->
        <div id="categoryFilterBar" class="category-filter-bar"></div>
        
        <!-- شبكة المنتجات -->
        <div id="posProductsGrid" class="pos-products-grid"></div>
    </div>
    
    <!-- قسم السلة -->
    <div class="cart-section">
        <div class="cart-header">
            <h3><i class="fas fa-shopping-cart"></i> السلة</h3>
            <button class="btn btn-sm btn-danger" onclick="clearCart()">
                <i class="fas fa-trash"></i> مسح
            </button>
        </div>
        
        <div id="cartItemsList" class="cart-items-list"></div>
        
        <div style="margin-bottom: 15px;">
            <label style="font-weight: 600; margin-bottom: 8px; display: block;">الخصم (د.ع):</label>
            <input type="number" id="posDiscount" class="form-control" value="0" min="0" step="1000">
        </div>
        
        <div style="margin-bottom: 15px;">
            <label style="font-weight: 600; margin-bottom: 8px; display: block;">ملاحظات:</label>
            <textarea id="posNotes" class="form-control" rows="2" placeholder="ملاحظات إضافية..."></textarea>
        </div>
        
        <div id="cartSummary" class="cart-summary"></div>
        
        <button id="checkoutBtn" class="checkout-btn" onclick="completePOSSale()" disabled>
            <i class="fas fa-check-circle"></i> إتمام البيع والطباعة
        </button>
    </div>
</div>
`;

console.log('✅ تم تحميل واجهة نقطة البيع المحدثة');
