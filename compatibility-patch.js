/*
 * ملف Patch للتوافق - يُضاف في index.html قبل cash-pro-updates.js
 * يوفر الدوال الأساسية المطلوبة إذا لم تكن موجودة
 */

// ==================== دالة showNotification ====================
if (typeof window.showNotification === 'undefined') {
    window.showNotification = function(message, type = 'info') {
        // إنشاء عنصر الإشعار
        const notification = document.createElement('div');
        notification.className = 'notification notification-' + type;
        notification.textContent = message;
        
        // الأيقونات حسب النوع
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };
        
        notification.innerHTML = `
            <span style="margin-right: 10px;">${icons[type] || 'ℹ️'}</span>
            <span>${message}</span>
        `;
        
        // تنسيق الإشعار
        notification.style.cssText = `
            position: fixed;
            top: 90px;
            right: 20px;
            z-index: 10000;
            padding: 15px 25px;
            border-radius: 12px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.2);
            font-size: 14px;
            font-weight: 500;
            animation: slideIn 0.3s ease;
            max-width: 400px;
            word-wrap: break-word;
        `;
        
        // الألوان حسب النوع
        const colors = {
            success: { bg: '#d4edda', text: '#155724', border: '#28a745' },
            error: { bg: '#f8d7da', text: '#721c24', border: '#e74c3c' },
            warning: { bg: '#fff3cd', text: '#856404', border: '#f39c12' },
            info: { bg: '#d1ecf1', text: '#0c5460', border: '#17a2b8' }
        };
        
        const color = colors[type] || colors.info;
        notification.style.background = color.bg;
        notification.style.color = color.text;
        notification.style.borderLeft = `4px solid ${color.border}`;
        
        document.body.appendChild(notification);
        
        // إزالة الإشعار بعد 3 ثواني
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);
    };
    
    // إضافة أنماط CSS للإشعارات
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(400px);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        @keyframes slideOut {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(400px);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
    
    console.log('✅ تم إنشاء دالة showNotification');
}

// ==================== دالة showModal ====================
if (typeof window.showModal === 'undefined') {
    window.showModal = function(title, content) {
        // إزالة أي مودال موجود
        const existingModal = document.getElementById('custom-modal-overlay');
        if (existingModal) {
            existingModal.remove();
        }
        
        // إنشاء overlay
        const overlay = document.createElement('div');
        overlay.id = 'custom-modal-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.7);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 9999;
            animation: fadeIn 0.2s ease;
        `;
        
        // إنشاء المودال
        const modal = document.createElement('div');
        modal.style.cssText = `
            background: var(--bg-secondary, #ffffff);
            border-radius: 16px;
            max-width: 90%;
            max-height: 90vh;
            overflow-y: auto;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
            animation: slideDown 0.3s ease;
            position: relative;
        `;
        
        // محتوى المودال
        modal.innerHTML = `
            <div style="position: sticky; top: 0; background: var(--bg-secondary, #ffffff); z-index: 1; border-bottom: 2px solid var(--border-color, #e1e8ed); padding: 20px; display: flex; justify-content: space-between; align-items: center;">
                <h2 style="margin: 0; font-size: 22px; color: var(--text-primary, #2c3e50);">${title}</h2>
                <button onclick="closeModal()" style="background: transparent; border: none; font-size: 28px; cursor: pointer; color: var(--text-secondary, #7f8c8d); width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; border-radius: 50%; transition: all 0.2s;">
                    ×
                </button>
            </div>
            <div style="padding: 30px;">
                ${content}
            </div>
        `;
        
        overlay.appendChild(modal);
        document.body.appendChild(overlay);
        
        // إغلاق عند النقر على الخلفية
        overlay.addEventListener('click', function(e) {
            if (e.target === overlay) {
                closeModal();
            }
        });
        
        // إضافة أنماط CSS
        if (!document.getElementById('modal-animations')) {
            const style = document.createElement('style');
            style.id = 'modal-animations';
            style.textContent = `
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                
                @keyframes slideDown {
                    from {
                        transform: translateY(-50px);
                        opacity: 0;
                    }
                    to {
                        transform: translateY(0);
                        opacity: 1;
                    }
                }
            `;
            document.head.appendChild(style);
        }
    };
    
    console.log('✅ تم إنشاء دالة showModal');
}

// ==================== دالة closeModal ====================
if (typeof window.closeModal === 'undefined') {
    window.closeModal = function() {
        const modal = document.getElementById('custom-modal-overlay');
        if (modal) {
            modal.style.animation = 'fadeOut 0.2s ease';
            setTimeout(() => {
                modal.remove();
            }, 200);
        }
        
        // إزالة أي مودال backup آخر
        const backupModal = document.getElementById('backup-modal');
        if (backupModal) {
            backupModal.remove();
        }
    };
    
    // إضافة أنيميشن fadeOut
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeOut {
            from { opacity: 1; }
            to { opacity: 0; }
        }
    `;
    document.head.appendChild(style);
    
    console.log('✅ تم إنشاء دالة closeModal');
}

// ==================== التحقق من LocalDB ====================
if (typeof window.LocalDB === 'undefined') {
    console.warn('⚠️ LocalDB غير معرّف! يجب تعريفه في index.html');
    
    // إنشاء LocalDB بسيط للطوارئ
    window.LocalDB = {
        KEYS: {
            PRODUCTS: 'restaurant_products',
            CATEGORIES: 'restaurant_categories',
            INVOICES: 'restaurant_invoices',
            EXPENSES: 'restaurant_expenses',
            EMPLOYEES: 'restaurant_employees',
            USERS: 'restaurant_users',
            SETTINGS: 'restaurant_settings'
        },
        
        get: function(key) {
            try {
                const data = localStorage.getItem(key);
                return data ? JSON.parse(data) : null;
            } catch (error) {
                console.error('خطأ في قراءة البيانات:', error);
                return null;
            }
        },
        
        save: function(key, data) {
            try {
                localStorage.setItem(key, JSON.stringify(data));
                return true;
            } catch (error) {
                console.error('خطأ في حفظ البيانات:', error);
                return false;
            }
        }
    };
    
    console.log('✅ تم إنشاء LocalDB أساسي للطوارئ');
}

// ==================== التحقق من currentUser ====================
if (typeof window.currentUser === 'undefined') {
    window.currentUser = {
        username: 'admin',
        fullName: 'المدير',
        role: 'admin'
    };
    console.log('✅ تم إنشاء currentUser افتراضي');
}

// ==================== التحقق من currentInvoice ====================
if (typeof window.currentInvoice === 'undefined') {
    window.currentInvoice = [];
    console.log('✅ تم تهيئة currentInvoice');
}

// ==================== دالة updateInvoiceDisplay ====================
if (typeof window.updateInvoiceDisplay === 'undefined') {
    window.updateInvoiceDisplay = function() {
        console.log('📝 تحديث عرض الفاتورة:', window.currentInvoice.length, 'عناصر');
        
        // محاولة تحديث العناصر في الواجهة
        const invoiceItems = document.querySelector('#invoice-items, .invoice-items, [id*="invoice"]');
        if (invoiceItems) {
            // تحديث عدد العناصر
            const totalItems = window.currentInvoice.reduce((sum, item) => sum + item.quantity, 0);
            const totalPrice = window.currentInvoice.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            
            console.log(`💰 الإجمالي: ${totalPrice.toLocaleString('ar-IQ')} د.ع`);
        }
    };
    
    console.log('✅ تم إنشاء دالة updateInvoiceDisplay');
}

// ==================== دالة loadProducts ====================
if (typeof window.loadProducts === 'undefined') {
    window.loadProducts = function() {
        console.log('📦 إعادة تحميل المنتجات...');
        // يمكن إضافة منطق إعادة تحميل المنتجات هنا
    };
    
    console.log('✅ تم إنشاء دالة loadProducts');
}

// ==================== رسالة التأكيد ====================
console.log('%c✅ تم تحميل ملف Patch بنجاح', 'color: #27ae60; font-size: 16px; font-weight: bold;');
console.log('%cجميع الدوال الأساسية متوفرة الآن', 'color: #3498db; font-size: 14px;');

// ==================== فحص شامل ====================
setTimeout(() => {
    const checks = {
        'showNotification': typeof window.showNotification !== 'undefined',
        'showModal': typeof window.showModal !== 'undefined',
        'closeModal': typeof window.closeModal !== 'undefined',
        'LocalDB': typeof window.LocalDB !== 'undefined',
        'currentUser': typeof window.currentUser !== 'undefined',
        'currentInvoice': typeof window.currentInvoice !== 'undefined',
        'updateInvoiceDisplay': typeof window.updateInvoiceDisplay !== 'undefined',
        'loadProducts': typeof window.loadProducts !== 'undefined'
    };
    
    console.log('🔍 فحص النظام:');
    Object.entries(checks).forEach(([name, status]) => {
        console.log(`  ${status ? '✅' : '❌'} ${name}: ${status ? 'متوفر' : 'غير متوفر'}`);
    });
    
    const allReady = Object.values(checks).every(v => v);
    if (allReady) {
        console.log('%c🎉 جميع المتطلبات متوفرة - النظام جاهز!', 'color: #27ae60; font-size: 16px; font-weight: bold;');
    } else {
        console.warn('%c⚠️ بعض المتطلبات مفقودة', 'color: #f39c12; font-size: 14px;');
    }
}, 500);