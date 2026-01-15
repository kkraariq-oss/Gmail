# 🔑 دليل إدارة أكواد الاشتراك - للشركة

<div dir="rtl">

## 📋 نظرة عامة

هذا الدليل مخصص **لموظفي شركة الإبداع الرقمي** لإدارة طلبات الاشتراك وإصدار أكواد التفعيل.

---

## 🔄 دورة الاشتراك

### 1. **العميل يسجل في التطبيق:**
   - يملأ بيانات المطعم
   - يرسل طلب اشتراك
   - تُحفظ البيانات في Firebase: `cloud_subscriptions/MACHINE_ID`

### 2. **الشركة تستلم إشعار WhatsApp:**
   ```
   🔔 طلب اشتراك جديد - النسخ السحابي
   ━━━━━━━━━━━━━━━━━━
   🏪 اسم المطعم: مطعم الياقوت
   👤 اسم المستخدم: أحمد علي
   📱 رقم الهاتف: 07701234567
   📍 العنوان: بغداد - الكرادة
   🖥️ معرف الجهاز: MACHINE_1705324800000_abc123
   🆔 معرف المستخدم: user_1705324800000
   📅 تاريخ الطلب: 15/01/2024
   ```

### 3. **الشركة تتحقق من الدفع:**
   - التواصل مع العميل
   - تأكيد الدفع (100 دولار)
   - إصدار كود التفعيل

### 4. **الشركة ترسل الكود:**
   - عبر WhatsApp
   - أو SMS

### 5. **العميل يفعّل الاشتراك:**
   - يفتح التطبيق
   - يضغط "تفعيل الاشتراك"
   - يدخل الكود
   - تبدأ المزامنة السحابية

---

## 🔧 إنشاء كود التفعيل

### الطريقة 1: باستخدام Firebase Console

#### الخطوات:

1. **افتح Firebase Console:**
   - https://console.firebase.google.com
   - اختر المشروع

2. **اذهب إلى Realtime Database:**
   - من القائمة الجانبية
   - Realtime Database

3. **انتقل إلى طلبات الاشتراك:**
   ```
   cloud_subscriptions/
   └── MACHINE_1705324800000_abc123/
       ├── username: "أحمد علي"
       ├── restaurantName: "مطعم الياقوت"
       ├── phone: "07701234567"
       ├── machineId: "MACHINE_1705324800000_abc123"
       ├── status: "pending"
       └── activated: false
   ```

4. **أضف كود التفعيل:**
   - انقر على `MACHINE_1705324800000_abc123`
   - اضغط ⊕ (Add child)
   - اسم الحقل: `activationCode`
   - القيمة: `CASHPRO-2024-ABCD1234` (توليد عشوائي)
   - احفظ

5. **تأكد من إضافة الحقول:**
   ```
   activationCode: "CASHPRO-2024-ABCD1234"
   codeGeneratedAt: "2024-01-15T10:30:00Z"
   codeGeneratedBy: "admin"
   ```

---

### الطريقة 2: باستخدام سكريبت Node.js

#### الكود:

```javascript
// generate-code.js
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "YOUR_DATABASE_URL"
});

const db = admin.database();

// دالة لتوليد كود عشوائي
function generateCode() {
  const prefix = 'CASHPRO';
  const year = new Date().getFullYear();
  const random = Math.random().toString(36).substring(2, 10).toUpperCase();
  return `${prefix}-${year}-${random}`;
}

// إصدار كود لعميل معين
async function issueCode(machineId) {
  const code = generateCode();
  const ref = db.ref(`cloud_subscriptions/${machineId}`);
  
  await ref.update({
    activationCode: code,
    codeGeneratedAt: new Date().toISOString(),
    codeGeneratedBy: 'admin',
    status: 'code_issued'
  });
  
  console.log(`✅ تم إصدار الكود: ${code}`);
  console.log(`📋 معرف الجهاز: ${machineId}`);
  
  return code;
}

// الاستخدام
const machineId = 'MACHINE_1705324800000_abc123';
issueCode(machineId)
  .then(() => process.exit(0))
  .catch(err => {
    console.error('❌ خطأ:', err);
    process.exit(1);
  });
```

#### التشغيل:

```bash
# تثبيت Firebase Admin SDK
npm install firebase-admin

# تشغيل السكريبت
node generate-code.js
```

---

### الطريقة 3: صفحة ويب للشركة (الأسهل)

#### إنشاء صفحة إدارة:

```html
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
    <meta charset="UTF-8">
    <title>إدارة أكواد الاشتراك</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 1200px;
            margin: 50px auto;
            padding: 20px;
            background: #f5f5f5;
        }
        .container {
            background: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
        }
        th, td {
            padding: 12px;
            text-align: right;
            border-bottom: 1px solid #ddd;
        }
        th {
            background: #667eea;
            color: white;
        }
        button {
            background: #4caf50;
            color: white;
            border: none;
            padding: 8px 20px;
            border-radius: 5px;
            cursor: pointer;
        }
        button:hover {
            background: #45a049;
        }
        .pending {
            background: #fff3cd;
        }
        .active {
            background: #d4edda;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🔑 إدارة طلبات الاشتراك</h1>
        <div id="requests"></div>
    </div>

    <script src="https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js"></script>
    <script src="https://www.gstatic.com/firebasejs/9.0.0/firebase-database-compat.js"></script>
    <script>
        // إعداد Firebase
        const firebaseConfig = {
            apiKey: "YOUR_API_KEY",
            authDomain: "YOUR_AUTH_DOMAIN",
            databaseURL: "YOUR_DATABASE_URL",
            projectId: "YOUR_PROJECT_ID"
        };
        
        firebase.initializeApp(firebaseConfig);
        const db = firebase.database();

        // توليد كود عشوائي
        function generateCode() {
            const prefix = 'CASHPRO';
            const year = new Date().getFullYear();
            const random = Math.random().toString(36).substring(2, 10).toUpperCase();
            return `${prefix}-${year}-${random}`;
        }

        // تحميل الطلبات
        function loadRequests() {
            const ref = db.ref('cloud_subscriptions');
            ref.on('value', (snapshot) => {
                const data = snapshot.val();
                displayRequests(data);
            });
        }

        // عرض الطلبات
        function displayRequests(data) {
            const container = document.getElementById('requests');
            let html = '<table><thead><tr>';
            html += '<th>اسم المطعم</th>';
            html += '<th>المستخدم</th>';
            html += '<th>الهاتف</th>';
            html += '<th>تاريخ الطلب</th>';
            html += '<th>الحالة</th>';
            html += '<th>الكود</th>';
            html += '<th>إجراء</th>';
            html += '</tr></thead><tbody>';

            for (let machineId in data) {
                const req = data[machineId];
                const rowClass = req.activated ? 'active' : 'pending';
                
                html += `<tr class="${rowClass}">`;
                html += `<td>${req.restaurantName}</td>`;
                html += `<td>${req.username}</td>`;
                html += `<td>${req.phone}</td>`;
                html += `<td>${new Date(req.requestDate).toLocaleDateString('ar-IQ')}</td>`;
                html += `<td>${req.activated ? '✅ مفعّل' : '⏳ قيد الانتظار'}</td>`;
                html += `<td>${req.activationCode || '-'}</td>`;
                
                if (!req.activationCode) {
                    html += `<td><button onclick="issueCode('${machineId}')">إصدار كود</button></td>`;
                } else if (!req.activated) {
                    html += `<td><button onclick="copyCode('${req.activationCode}')">نسخ الكود</button></td>`;
                } else {
                    html += `<td>-</td>`;
                }
                
                html += '</tr>';
            }

            html += '</tbody></table>';
            container.innerHTML = html;
        }

        // إصدار كود
        function issueCode(machineId) {
            const code = generateCode();
            const ref = db.ref(`cloud_subscriptions/${machineId}`);
            
            ref.update({
                activationCode: code,
                codeGeneratedAt: new Date().toISOString(),
                codeGeneratedBy: 'admin',
                status: 'code_issued'
            }).then(() => {
                alert(`✅ تم إصدار الكود بنجاح:\n\n${code}\n\nيرجى إرساله للعميل`);
                copyCode(code);
            }).catch(err => {
                alert('❌ خطأ: ' + err.message);
            });
        }

        // نسخ الكود
        function copyCode(code) {
            navigator.clipboard.writeText(code).then(() => {
                alert('✅ تم نسخ الكود: ' + code);
            });
        }

        // تحميل عند بدء الصفحة
        loadRequests();
    </script>
</body>
</html>
```

احفظ هذا الملف كـ `admin-panel.html` واستخدمه لإدارة الطلبات.

---

## 📝 نموذج كود الاشتراك

### الصيغة الموصى بها:

```
CASHPRO-YYYY-XXXXXXXX

مثال:
CASHPRO-2024-A3B7C9D2
```

### مكونات الكود:

1. **CASHPRO** - اسم التطبيق (ثابت)
2. **YYYY** - السنة (مثال: 2024)
3. **XXXXXXXX** - رمز عشوائي (8 أحرف/أرقام)

---

## 📧 نموذج رسالة إرسال الكود

### عبر WhatsApp:

```
🎉 *تم تفعيل اشتراكك في Cash Pro*
━━━━━━━━━━━━━━━━━━

عزيزي *[اسم العميل]*،

شكراً لك على اشتراكك في خدمة النسخ السحابي!

🔑 *كود التفعيل الخاص بك:*
`CASHPRO-2024-A3B7C9D2`

📋 *خطوات التفعيل:*
1. افتح تطبيق Cash Pro
2. اذهب إلى قسم "حسابي"
3. اضغط "تفعيل الاشتراك"
4. أدخل الكود أعلاه
5. ابدأ الاستخدام! 🎊

⚠️ *مهم:*
- احتفظ بهذا الكود في مكان آمن
- صالح لجهاز واحد فقط
- صالح لمدة سنة كاملة

📞 *للدعم الفني:*
WhatsApp: 07813798636

*شركة الإبداع الرقمي*
Digital Creativity Company
```

---

## 🔒 الأمان

### حماية الأكواد:

1. **عدم إعادة الاستخدام:**
   - كل كود لعميل واحد فقط
   - كود مستخدم = كود غير صالح

2. **تتبع الاستخدام:**
   ```javascript
   {
     activationCode: "CASHPRO-2024-A3B7C9D2",
     used: true,
     usedBy: "MACHINE_123",
     usedAt: "2024-01-15T12:00:00Z"
   }
   ```

3. **صلاحية الكود:**
   - الكود صالح حتى يتم استخدامه
   - بعد الاستخدام، لا يمكن استخدامه مرة أخرى

---

## 📊 التقارير

### تقرير يومي:

```sql
عدد الطلبات الجديدة: 5
عدد الأكواد المصدرة: 3
عدد الاشتراكات المفعلة: 2
الإيرادات: 200 دولار
```

### تقرير شهري:

- إجمالي الطلبات
- إجمالي الاشتراكات النشطة
- إجمالي الإيرادات
- الاشتراكات المنتهية

---

## 🔄 تجديد الاشتراك

عند انتهاء السنة:

1. العميل يتلقى إشعار
2. العميل يطلب التجديد
3. الشركة تصدر كود جديد
4. العميل يدخل الكود الجديد
5. يمتد الاشتراك لسنة إضافية

---

## 📞 معلومات الاتصال

**للاستفسارات الداخلية:**

📧 Email: admin@digitalcreativity.iq  
📱 Phone: 07813798636  
💼 Office: بغداد - الكرادة

**شركة الإبداع الرقمي**  
Digital Creativity Company

</div>
