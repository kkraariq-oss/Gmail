// ==================== إصلاح نظام الاشتراك السحابي ====================

// دالة تحميل معلومات الحساب - نسخة محدثة
function loadAccountInfo() {
    const registration = LocalDB.get(LocalDB.KEYS.APP_REGISTRATION);
    const cloudConfig = LocalDB.get(LocalDB.KEYS.CLOUD_CONFIG);

    console.log('Loading account info...', {registration, cloudConfig});

    // ملء معلومات المطعم
    if (registration) {
        document.getElementById('accountRestaurantName').textContent = registration.restaurantName || 'مطعم Cash Pro';
        document.getElementById('accountOwnerName').textContent = registration.ownerName || 'المدير';
        document.getElementById('accountPhone').textContent = registration.phone || '07XXXXXXXXX';
        document.getElementById('accountAddress').textContent = registration.address || 'العراق - بغداد';
        document.getElementById('registrationDate').textContent = formatDate(registration.registrationDate);
        document.getElementById('trialEndDate').textContent = formatDate(registration.trialEndDate);

        // حساب الأيام المتبقية
        const now = new Date();
        const trialEnd = new Date(registration.trialEndDate);
        const daysLeft = Math.ceil((trialEnd - now) / (24 * 60 * 60 * 1000));

        const statusEl = document.getElementById('appStatus');
        const daysEl = document.getElementById('daysRemaining');
        
        if (registration.status === 'active') {
            statusEl.textContent = 'نشط (مفعّل)';
            statusEl.style.background = '#28a745';
            
            if (registration.subscriptionEndDate) {
                const subEnd = new Date(registration.subscriptionEndDate);
                const daysLeftSub = Math.ceil((subEnd - now) / (24 * 60 * 60 * 1000));
                document.getElementById('subscriptionEndDate').textContent = formatDate(registration.subscriptionEndDate);
                document.getElementById('subscriptionEndRow').style.display = 'flex';
                daysEl.textContent = daysLeftSub + ' يوم';
                daysEl.style.color = daysLeftSub < 30 ? '#dc3545' : '#28a745';
            }
            
            document.getElementById('yearlyActivationSection').style.display = 'none';
        } else if (registration.status === 'trial') {
            statusEl.textContent = 'فترة تجريبية';
            statusEl.style.background = '#ffc107';
            daysEl.textContent = daysLeft > 0 ? daysLeft + ' يوم' : 'انتهت';
            daysEl.style.color = daysLeft < 3 ? '#dc3545' : '#ffc107';
            
            if (daysLeft <= 3) {
                document.getElementById('yearlyActivationSection').style.display = 'block';
            }
        } else {
            statusEl.textContent = 'منتهي';
            statusEl.style.background = '#dc3545';
            daysEl.textContent = '0 يوم';
            daysEl.style.color = '#dc3545';
            document.getElementById('yearlyActivationSection').style.display = 'block';
        }
    } else {
        // بيانات افتراضية
        document.getElementById('accountRestaurantName').textContent = 'مطعم Cash Pro';
        document.getElementById('accountOwnerName').textContent = 'المدير';
        document.getElementById('accountPhone').textContent = '07XXXXXXXXX';
        document.getElementById('accountAddress').textContent = 'العراق - بغداد';
        document.getElementById('registrationDate').textContent = formatDate(new Date().toISOString());
        document.getElementById('trialEndDate').textContent = 'غير محدد';
        document.getElementById('appStatus').textContent = 'مفعّل';
        document.getElementById('appStatus').style.background = '#28a745';
        document.getElementById('daysRemaining').textContent = '∞';
    }

    // ملء معلومات النسخ السحابي
    const cloudStatusEl = document.getElementById('cloudBackupStatus');
    const cloudManagementButtons = document.getElementById('cloudManagementButtons');
    
    if (cloudConfig && cloudConfig.active) {
        // مفعّل
        cloudStatusEl.innerHTML = `
            <div style="padding: 15px; background: #d4edda; border-radius: 10px; margin-bottom: 15px; border: 2px solid #28a745;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                    <span style="font-weight: 600;">حالة النسخ السحابي:</span>
                    <span style="color: #28a745; font-weight: bold;">
                        <i class="fas fa-check-circle"></i> مفعّل
                    </span>
                </div>
            </div>
            <div style="display: grid; gap: 15px;">
                <div style="display: flex; justify-content: space-between; padding: 15px; background: #f8f9fa; border-radius: 10px;">
                    <span style="font-weight: 600; color: #666;">اسم المستخدم:</span>
                    <span style="font-weight: 700;">${cloudConfig.username}</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 15px; background: #f8f9fa; border-radius: 10px;">
                    <span style="font-weight: 600; color: #666;">اسم المطعم:</span>
                    <span style="font-weight: 700;">${cloudConfig.restaurantName}</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 15px; background: #f8f9fa; border-radius: 10px;">
                    <span style="font-weight: 600; color: #666;">رقم الهاتف:</span>
                    <span style="font-weight: 700; direction: ltr; text-align: right;">${cloudConfig.phone}</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 15px; background: #f8f9fa; border-radius: 10px;">
                    <span style="font-weight: 600; color: #666;">آخر مزامنة:</span>
                    <span style="font-weight: 700;">${cloudConfig.lastSync ? formatDate(cloudConfig.lastSync) : 'لم تتم بعد'}</span>
                </div>
                ${cloudConfig.activatedAt ? `
                <div style="display: flex; justify-content: space-between; padding: 15px; background: #f8f9fa; border-radius: 10px;">
                    <span style="font-weight: 600; color: #666;">تاريخ التفعيل:</span>
                    <span style="font-weight: 700;">${formatDate(cloudConfig.activatedAt)}</span>
                </div>
                ` : ''}
            </div>
        `;
        cloudManagementButtons.style.display = 'block';
    } else if (cloudConfig && cloudConfig.pending) {
        // طلب معلق
        cloudStatusEl.innerHTML = `
            <div style="padding: 20px; background: #fff3cd; border-radius: 10px; border: 2px solid #ffc107; text-align: center;">
                <i class="fas fa-clock" style="font-size: 50px; color: #ffc107; margin-bottom: 15px;"></i>
                <h4 style="color: #856404; margin-bottom: 10px;">⏳ في انتظار التفعيل</h4>
                <p style="color: #856404; margin-bottom: 15px;">تم إرسال طلب الاشتراك. يرجى انتظار رمز التفعيل من الشركة.</p>
                <button onclick="showActivateCloudModal()" class="btn btn-warning" style="padding: 12px 30px; font-weight: 700; background: #ffc107; border: none;">
                    <i class="fas fa-key"></i>
                    أدخل رمز التفعيل
                </button>
            </div>
        `;
        cloudManagementButtons.style.display = 'none';
    } else {
        // غير مشترك
        cloudStatusEl.innerHTML = `
            <div style="text-align: center; padding: 30px;">
                <i class="fas fa-cloud-upload-alt" style="font-size: 60px; color: #e0e0e0; margin-bottom: 15px;"></i>
                <p style="color: #666; margin-bottom: 20px;">لم تشترك في خدمة النسخ السحابي بعد</p>
                <button onclick="showCloudSubscribeModal()" class="btn btn-primary" style="padding: 12px 30px; font-weight: 700;">
                    <i class="fas fa-cloud"></i>
                    الاشتراك في النسخ السحابي
                </button>
            </div>
        `;
        cloudManagementButtons.style.display = 'none';
    }
}

// فتح modal الاشتراك السحابي
function showCloudSubscribeModal() {
    console.log('Opening cloud subscribe modal...');
    
    // إعادة تعيين النموذج
    document.getElementById('subscriptionStep1').classList.remove('hidden');
    document.getElementById('subscriptionStep2').classList.add('hidden');
    
    // ملء البيانات من التسجيل الأولي
    const registration = LocalDB.get(LocalDB.KEYS.APP_REGISTRATION);
    if (registration) {
        document.getElementById('cloudUsername').value = registration.ownerName || '';
        document.getElementById('cloudPhone').value = registration.phone || '';
        document.getElementById('cloudRestaurantName').value = registration.restaurantName || '';
        document.getElementById('cloudAddress').value = registration.address || '';
    }
    
    openModal('cloudSubscribeModal');
}

// إرسال طلب الاشتراك السحابي
function submitCloudSubscription(event) {
    event.preventDefault();
    
    console.log('Submitting cloud subscription...');
    
    const username = document.getElementById('cloudUsername').value;
    const phone = document.getElementById('cloudPhone').value;
    const restaurantName = document.getElementById('cloudRestaurantName').value;
    const address = document.getElementById('cloudAddress').value;

    if (!username || !phone || !restaurantName || !address) {
        showNotification('يرجى ملء جميع الحقول', 'error');
        return;
    }

    // إنشاء معرف فريد
    const machineId = generateMachineId();
    const userId = 'user_' + Date.now();

    const cloudConfig = {
        username,
        phone,
        restaurantName,
        address,
        userId: userId,
        machineId: machineId,
        createdAt: new Date().toISOString(),
        active: false,
        pending: true,
        subscriptionRequested: true
    };

    // حفظ محلياً
    LocalDB.save(LocalDB.KEYS.CLOUD_CONFIG, cloudConfig);
    currentUserId = userId;

    console.log('Cloud config saved:', cloudConfig);

    // رفع إلى Firebase
    if (firebaseDB) {
        const subscriptionRef = firebaseDB.ref('cloud_subscriptions/' + machineId);
        subscriptionRef.set({
            username,
            phone,
            restaurantName,
            address,
            userId: userId,
            machineId: machineId,
            requestDate: new Date().toISOString(),
            status: 'pending',
            activated: false,
            activationCode: null
        }).then(() => {
            console.log('Data uploaded to Firebase successfully');
        }).catch(err => {
            console.error('Firebase upload error:', err);
        });
    }

    // إرسال رسالة WhatsApp
    sendCloudSubscriptionToWhatsApp(cloudConfig);

    // إظهار رسالة النجاح
    document.getElementById('subscriptionStep1').classList.add('hidden');
    document.getElementById('subscriptionStep2').classList.remove('hidden');

    // تحديث واجهة حسابي
    setTimeout(() => {
        closeModal('cloudSubscribeModal');
        loadAccountInfo();
        showNotification('تم إرسال طلب الاشتراك بنجاح! يرجى انتظار رمز التفعيل', 'success');
    }, 3000);
}

// إرسال رسالة WhatsApp
function sendCloudSubscriptionToWhatsApp(config) {
    const message = `
🔔 *طلب اشتراك جديد - النسخ السحابي*
━━━━━━━━━━━━━━━━━━
🏪 *اسم المطعم:* ${config.restaurantName}
👤 *اسم المستخدم:* ${config.username}
📱 *رقم الهاتف:* ${config.phone}
📍 *العنوان:* ${config.address}
🖥️ *معرف الجهاز:* ${config.machineId}
🆔 *معرف المستخدم:* ${config.userId}
📅 *تاريخ الطلب:* ${formatDate(config.createdAt)}
━━━━━━━━━━━━━━━━━━
⚠️ *يرجى إنشاء رمز تفعيل وإضافته في Firebase*

للتفعيل:
1. اذهب إلى Firebase Console
2. cloud_subscriptions/${config.machineId}
3. أضف: activationCode: "CASHPRO-2024-XXXX"
    `.trim();

    const whatsappUrl = `https://wa.me/9647813798636?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
}

// فتح modal التفعيل
function showActivateCloudModal() {
    document.getElementById('cloudActivationCode').value = '';
    openModal('activateCloudModal');
}

// تفعيل الاشتراك بالكود
function activateCloudWithCode(event) {
    event.preventDefault();
    
    const code = document.getElementById('cloudActivationCode').value.trim().toUpperCase();
    const machineId = generateMachineId();
    const cloudConfig = LocalDB.get(LocalDB.KEYS.CLOUD_CONFIG);

    if (!code) {
        showNotification('يرجى إدخال رمز التفعيل', 'error');
        return;
    }

    if (!cloudConfig) {
        showNotification('لم يتم العثور على طلب اشتراك', 'error');
        return;
    }

    if (!firebaseDB) {
        showNotification('لا يمكن التحقق من الرمز بدون اتصال بالإنترنت', 'error');
        return;
    }

    // التحقق من الكود في Firebase
    const subscriptionRef = firebaseDB.ref('cloud_subscriptions/' + machineId);
    subscriptionRef.once('value').then(snapshot => {
        const data = snapshot.val();
        
        if (data && data.activationCode === code) {
            // كود صحيح - تفعيل الاشتراك
            cloudConfig.active = true;
            cloudConfig.pending = false;
            cloudConfig.activationCode = code;
            cloudConfig.activatedAt = new Date().toISOString();
            
            LocalDB.save(LocalDB.KEYS.CLOUD_CONFIG, cloudConfig);
            currentUserId = cloudConfig.userId;
            
            // تحديث في Firebase
            subscriptionRef.update({ 
                activated: true, 
                activatedAt: new Date().toISOString(),
                status: 'active'
            });
            
            closeModal('activateCloudModal');
            showNotification('تم تفعيل النسخ السحابي بنجاح! 🎉', 'success');
            
            // رفع البيانات للسحابة لأول مرة
            syncToCloud(true);
            
            // تحديث واجهة حسابي
            loadAccountInfo();
        } else {
            showNotification('رمز التفعيل غير صحيح', 'error');
        }
    }).catch(err => {
        console.error('Activation check error:', err);
        showNotification('خطأ في التحقق من رمز التفعيل', 'error');
    });
}

// قطع الاتصال من النسخ السحابي
function disconnectCloud() {
    if (confirm('هل أنت متأكد من قطع الاتصال بالنسخ السحابي؟\n\nيمكنك إعادة الاتصال لاحقاً باستخدام رمز التفعيل.')) {
        const cloudConfig = LocalDB.get(LocalDB.KEYS.CLOUD_CONFIG);
        if (cloudConfig) {
            cloudConfig.active = false;
            LocalDB.save(LocalDB.KEYS.CLOUD_CONFIG, cloudConfig);
            loadAccountInfo();
            showNotification('تم قطع الاتصال بالنسخ السحابي', 'info');
        }
    }
}
