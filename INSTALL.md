# دليل التثبيت - Installation Guide

## المتطلبات الأساسية

1. **Node.js** - [تحميل Node.js](https://nodejs.org/)
   - الإصدار 16 أو أحدث
   - يتضمن npm تلقائياً

2. **Git** (اختياري) - [تحميل Git](https://git-scm.com/)

## خطوات التثبيت

### الطريقة الأولى: التثبيت العادي

1. **فك ضغط الملف**
   ```
   قم بفك ضغط المجلد المرفق
   ```

2. **فتح Terminal/CMD**
   ```bash
   cd restaurant-management-system
   ```

3. **تثبيت الحزم**
   ```bash
   npm install
   ```

4. **تشغيل التطبيق**
   ```bash
   npm start
   ```

### الطريقة الثانية: بناء التطبيق

لإنشاء ملف تنفيذي (.exe لـ Windows):

```bash
npm install
npm run build
```

ستجد الملف التنفيذي في مجلد `dist`

## إعداد Firebase (اختياري)

إذا كنت تريد النسخ الاحتياطي السحابي:

1. افتح https://console.firebase.google.com
2. أنشئ مشروع جديد
3. فعّل Realtime Database
4. افتح `src/js/firebase-config.js`
5. استبدل الإعدادات بإعداداتك

## أول استخدام

1. شغّل التطبيق
2. سجل دخول بـ:
   - اسم المستخدم: `admin`
   - كلمة المرور: `admin123`
3. غيّر كلمة المرور من "نظام الحماية"
4. ابدأ بإضافة المنتجات والتصنيفات

## المشاكل الشائعة

### خطأ: "npm not found"
- تأكد من تثبيت Node.js
- أعد تشغيل Terminal/CMD

### خطأ: "Cannot find module"
- شغّل `npm install` مرة أخرى

### التطبيق لا يفتح
- تأكد من عدم وجود تطبيق آخر يعمل
- تحقق من ملف الـ logs

## للمساعدة

اتصل بـ Digital Creativity Company
