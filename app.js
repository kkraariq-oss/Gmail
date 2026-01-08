// ====== تكوين Firebase ======
const firebaseConfig = {
    apiKey: "AIzaSyDGpAHia_wEmrhnmYjrPf1n1TrAzwEMiAI",
    authDomain: "messageemeapp.firebaseapp.com",
    databaseURL: "https://messageemeapp-default-rtdb.firebaseio.com",
    projectId: "messageemeapp",
    storageBucket: "messageemeapp.appspot.com",
    messagingSenderId: "255034474844",
    appId: "1:255034474844:web:5e3b7a6bc4b2fb94cc4199",
    measurementId: "G-4QBEWRC583"
};

// تهيئة Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();
const storage = firebase.storage();

// ====== متغيرات عامة ======
let currentUser = null;
let currentChat = null;
let logoClickCount = 0;
let logoClickTimer = null;
let messagesListener = null;
let isRecordingAudio = false;
let mediaRecorder = null;
let audioChunks = [];
let qrScanner = null;

// كود الأدمن
const ADMIN_CODE = 'ADMIN';

// ====== عناصر DOM ======
const fakeGmail = document.getElementById('fake-gmail');
const codeScreen = document.getElementById('code-screen');
const adminScreen = document.getElementById('admin-screen');
const chatScreen = document.getElementById('chat-screen');
const conversationScreen = document.getElementById('conversation-screen');
const storyViewer = document.getElementById('story-viewer');
const storyCreator = document.getElementById('story-creator');
const qrModal = document.getElementById('qr-modal');
const qrScannerDiv = document.getElementById('qr-scanner');
const imageViewer = document.getElementById('image-viewer');

// ====== وظائف مساعدة ======
function showScreen(screen) {
    [fakeGmail, codeScreen, adminScreen, chatScreen, conversationScreen, 
     storyViewer, storyCreator, qrModal, qrScannerDiv, imageViewer].forEach(s => {
        s.classList.add('hidden');
    });
    screen.classList.remove('hidden');
}

function showToast(message, duration = 3000) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'toastSlideDown 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, duration);
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatTime(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    // نفس اليوم
    if (date.toDateString() === now.toDateString()) {
        return date.toLocaleTimeString('ar-IQ', { hour: '2-digit', minute: '2-digit' });
    }
    
    // الأمس
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) {
        return 'أمس';
    }
    
    // خلال الأسبوع
    if (diff < 7 * 24 * 60 * 60 * 1000) {
        return date.toLocaleDateString('ar-IQ', { weekday: 'long' });
    }
    
    // قبل أسبوع
    return date.toLocaleDateString('ar-IQ', { day: 'numeric', month: 'short' });
}

function generateCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 5; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

function getChatId(userId1, userId2) {
    return [userId1, userId2].sort().join('_');
}

// ====== واجهة Gmail المزيفة - إنشاء رسائل واقعية ======
const fakeEmails = [
    {
        sender: 'Google',
        initial: 'G',
        subject: 'مرحباً بك في Gmail',
        preview: 'نشكرك على استخدام Gmail. إليك بعض النصائح للبدء...',
        time: Date.now() - 3600000
    },
    {
        sender: 'Facebook',
        initial: 'F',
        subject: 'لديك 3 طلبات صداقة جديدة',
        preview: 'أحمد محمد وآخرون يريدون إضافتك كصديق...',
        time: Date.now() - 7200000
    },
    {
        sender: 'Instagram',
        initial: 'I',
        subject: 'نشاط جديد على منشورك',
        preview: 'حصل منشورك على 15 إعجاب جديد و 3 تعليقات...',
        time: Date.now() - 10800000
    },
    {
        sender: 'Twitter',
        initial: 'T',
        subject: 'إشعارات جديدة',
        preview: 'لديك 8 إشعارات جديدة من متابعيك...',
        time: Date.now() - 14400000
    },
    {
        sender: 'LinkedIn',
        initial: 'L',
        subject: 'من شاهد ملفك الشخصي',
        preview: '12 شخصاً شاهدوا ملفك الشخصي هذا الأسبوع...',
        time: Date.now() - 18000000
    },
    {
        sender: 'Amazon',
        initial: 'A',
        subject: 'طلبك في الطريق',
        preview: 'طلبك #12345 سيصل غداً. تتبع الشحنة الآن...',
        time: Date.now() - 21600000
    },
    {
        sender: 'Netflix',
        initial: 'N',
        subject: 'محتوى جديد أضيف إلى قائمتك',
        preview: 'مسلسلات وأفلام جديدة تم إضافتها...',
        time: Date.now() - 25200000
    },
    {
        sender: 'PayPal',
        initial: 'P',
        subject: 'استلمت دفعة',
        preview: 'استلمت دفعة بقيمة $50.00 من علي أحمد...',
        time: Date.now() - 28800000
    }
];

function loadFakeGmail() {
    const content = document.getElementById('fake-gmail-content');
    content.innerHTML = '';
    
    // تحديث الوقت ديناميكياً
    fakeEmails.forEach(email => {
        const emailDiv = document.createElement('div');
        emailDiv.className = 'gmail-email';
        
        emailDiv.innerHTML = `
            <div class="gmail-email-avatar">${email.initial}</div>
            <div class="gmail-email-content">
                <div class="gmail-email-header">
                    <div class="gmail-email-sender">${email.sender}</div>
                    <div class="gmail-email-time">${formatTime(email.time)}</div>
                </div>
                <div class="gmail-email-subject">${email.subject}</div>
                <div class="gmail-email-preview">${email.preview}</div>
            </div>
        `;
        
        content.appendChild(emailDiv);
    });
}

// تحديث الأوقات كل دقيقة
setInterval(() => {
    if (!fakeGmail.classList.contains('hidden')) {
        loadFakeGmail();
    }
}, 60000);

// ====== تفعيل الشاشة المخفية ======
document.getElementById('gmail-logo').addEventListener('click', function() {
    logoClickCount++;
    
    if (logoClickTimer) {
        clearTimeout(logoClickTimer);
    }
    
    logoClickTimer = setTimeout(() => {
        logoClickCount = 0;
    }, 2000);
    
    if (logoClickCount >= 5) {
        logoClickCount = 0;
        showScreen(codeScreen);
    }
});

// ====== إدخال الكود ======
document.getElementById('code-submit').addEventListener('click', handleCodeSubmit);
document.getElementById('code-input').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        handleCodeSubmit();
    }
});

async function handleCodeSubmit() {
    const code = document.getElementById('code-input').value.trim().toUpperCase();
    const errorDiv = document.getElementById('code-error');
    
    if (!code) {
        showError('الرجاء إدخال الكود');
        return;
    }

    // كود الأدمن
    if (code === ADMIN_CODE) {
        currentUser = { 
            isAdmin: true, 
            name: 'المدير', 
            code: ADMIN_CODE,
            id: 'admin',
            avatar: 'https://ui-avatars.com/api/?name=Admin&background=667eea&color=fff&size=200'
        };
        showScreen(adminScreen);
        loadAdminScreen();
        return;
    }

    // كود مستخدم
    try {
        const snapshot = await database.ref('users').orderByChild('code').equalTo(code).once('value');
        const users = snapshot.val();
        
        if (users) {
            const userId = Object.keys(users)[0];
            const user = users[userId];
            
            // التحقق من حالة الحساب
            if (user.status === 'blocked') {
                showError('هذا الحساب محظور');
                return;
            }
            
            currentUser = { id: userId, ...user };
            showScreen(chatScreen);
            loadChatScreen();
        } else {
            showError('كود غير صحيح');
        }
    } catch (error) {
        console.error('Error:', error);
        showError('حدث خطأ، حاول مرة أخرى');
    }
}

function showError(message) {
    const errorDiv = document.getElementById('code-error');
    errorDiv.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;
    errorDiv.classList.remove('hidden');
    setTimeout(() => {
        errorDiv.classList.add('hidden');
    }, 3000);
}

// ====== QR Code Scanner ======
document.getElementById('qr-scan-btn').addEventListener('click', function() {
    showScreen(qrScannerDiv);
    startQRScanner();
});

document.getElementById('close-scanner').addEventListener('click', function() {
    stopQRScanner();
    showScreen(codeScreen);
});

function startQRScanner() {
    const videoElement = document.getElementById('qr-video');
    
    qrScanner = new Html5Qrcode("qr-video");
    
    qrScanner.start(
        { facingMode: "environment" },
        {
            fps: 10,
            qrbox: { width: 250, height: 250 }
        },
        async (decodedText) => {
            // نجحت القراءة
            stopQRScanner();
            document.getElementById('code-input').value = decodedText;
            showScreen(codeScreen);
            handleCodeSubmit();
        },
        (errorMessage) => {
            // خطأ في القراءة - تجاهل
        }
    ).catch(err => {
        console.error('QR Scanner error:', err);
        showToast('فشل تشغيل الكاميرا');
        showScreen(codeScreen);
    });
}

function stopQRScanner() {
    if (qrScanner) {
        qrScanner.stop().catch(err => console.error(err));
        qrScanner = null;
    }
}

// ====== تحميل Gmail المزيفة عند بدء التطبيق ======
loadFakeGmail();

// ====== Service Worker ======
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('service-worker.js')
        .then(() => console.log('Service Worker registered'))
        .catch(err => console.error('Service Worker registration failed:', err));
}
