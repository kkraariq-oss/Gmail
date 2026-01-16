const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1400,
        height: 900,
        minWidth: 1200,
        minHeight: 700,
        frame: false, // استخدام إطار مخصص
        titleBarStyle: 'hidden',
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: false,
            contextIsolation: true,
            enableRemoteModule: false
        },
        icon: path.join(__dirname, 'icon.png'),
        backgroundColor: '#f5f7fa'
    });

    mainWindow.loadFile('index.html');

    // فتح أدوات المطور في وضع التطوير
    // mainWindow.webContents.openDevTools();

    mainWindow.on('closed', function () {
        mainWindow = null;
    });

    // التعامل مع أزرار النافذة المخصصة
    setupWindowControls();
}

function setupWindowControls() {
    ipcMain.on('minimize-window', () => {
        if (mainWindow) mainWindow.minimize();
    });

    ipcMain.on('maximize-window', () => {
        if (mainWindow) {
            if (mainWindow.isMaximized()) {
                mainWindow.unmaximize();
            } else {
                mainWindow.maximize();
            }
        }
    });

    ipcMain.on('close-window', () => {
        if (mainWindow) mainWindow.close();
    });

    // دعم الطباعة الحرارية
    ipcMain.on('print-thermal', (event, data) => {
        printThermal(data);
    });

    // حفظ ملف
    ipcMain.on('save-file', async (event, data) => {
        const result = await dialog.showSaveDialog(mainWindow, {
            defaultPath: data.filename,
            filters: data.filters || [
                { name: 'All Files', extensions: ['*'] }
            ]
        });

        if (!result.canceled) {
            fs.writeFileSync(result.filePath, data.content);
            event.reply('file-saved', { success: true, path: result.filePath });
        } else {
            event.reply('file-saved', { success: false });
        }
    });

    // فتح ملف
    ipcMain.on('open-file', async (event) => {
        const result = await dialog.showOpenDialog(mainWindow, {
            properties: ['openFile'],
            filters: [
                { name: 'JSON Files', extensions: ['json'] },
                { name: 'All Files', extensions: ['*'] }
            ]
        });

        if (!result.canceled && result.filePaths.length > 0) {
            const content = fs.readFileSync(result.filePaths[0], 'utf-8');
            event.reply('file-opened', { success: true, content });
        } else {
            event.reply('file-opened', { success: false });
        }
    });
}

// دالة الطباعة الحرارية
function printThermal(invoiceData) {
    const printWindow = new BrowserWindow({
        width: 800,
        height: 600,
        show: false,
        webPreferences: {
            nodeIntegration: true
        }
    });

    const thermalHTML = generateThermalHTML(invoiceData);
    printWindow.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(thermalHTML));

    printWindow.webContents.on('did-finish-load', () => {
        // إعدادات الطباعة للطابعة الحرارية (80mm)
        const options = {
            silent: false, // عرض نافذة الطباعة
            printBackground: true,
            deviceName: '', // اسم الطابعة - فارغ للطابعة الافتراضية
            pageSize: {
                width: 80000, // 80mm
                height: 120000 // 120mm (أو حسب طول الفاتورة)
            },
            margins: {
                marginType: 'none'
            }
        };

        printWindow.webContents.print(options, (success, failureReason) => {
            if (!success) {
                console.log('فشل الطباعة:', failureReason);
            }
            printWindow.close();
        });
    });
}

// توليد HTML للطباعة الحرارية
function generateThermalHTML(invoice) {
    return `
<!DOCTYPE html>
<html dir="rtl">
<head>
    <meta charset="UTF-8">
    <style>
        @page {
            margin: 0;
            size: 80mm auto;
        }
        body {
            font-family: 'Tajawal', 'Cairo', 'Arial', sans-serif;
            font-size: 13px;
            margin: 0;
            padding: 0 0 10px 0;
            width: 80mm;
            background: #fff;
        }
        .header {
            text-align: center;
            border-bottom: 2px dashed #000;
            padding: 10px 0 8px 0;
            margin-bottom: 8px;
        }
        .header .logo {
            width: 48px;
            height: 48px;
            margin: 0 auto 5px auto;
        }
        .header h2 {
            margin: 2px 0 3px 0;
            font-size: 19px;
            font-weight: bold;
        }
        .header .address, .header .phone {
            font-size: 12px;
            color: #444;
        }
        .info {
            margin-bottom: 8px;
            font-size: 12px;
            text-align: center;
        }
        .info span {
            display: inline-block;
            min-width: 90px;
        }
        .items {
            border-top: 1px dashed #000;
            border-bottom: 1px dashed #000;
            padding: 8px 0 6px 0;
        }
        .item {
            display: flex;
            justify-content: space-between;
            margin: 3px 0;
            font-size: 13px;
        }
        .item .qty {
            color: #888;
            font-size: 12px;
        }
        .total {
            text-align: center;
            font-size: 18px;
            font-weight: bold;
            margin: 12px 0 6px 0;
            letter-spacing: 1px;
            border-radius: 6px;
            background: #f7f7f7;
            padding: 6px 0;
            border: 1px solid #eee;
        }
        .footer {
            text-align: center;
            border-top: 2px dashed #000;
            padding-top: 8px;
            margin-top: 8px;
            font-size: 11px;
            color: #444;
        }
        .footer .brand {
            margin-top: 8px;
            font-size: 10px;
            color: #888;
        }
    </style>
</head>
<body>
    <div class="header">
        <!-- شعار (يمكنك وضع صورة شعار هنا إذا أردت) -->
        <!--<img src="${invoice.logo || ''}" class="logo" alt="logo">-->
        <h2>${invoice.restaurantName || 'مطعم Cash Pro'}</h2>
        <div class="address">${invoice.address || ''}</div>
        <div class="phone">${invoice.phone || ''}</div>
    </div>

    <div class="info">
        <span>فاتورة: ${invoice.id}</span>
        <span>التاريخ: ${invoice.date}</span>
        <span>الوقت: ${invoice.time}</span>
        <span>الكاشير: ${invoice.cashier || 'admin'}</span>
    </div>

    <div class="items">
        ${invoice.items.map(item => `
            <div class="item">
                <span>${item.name} <span class="qty">×${item.quantity}</span></span>
                <span>${(item.price * item.quantity).toLocaleString('ar-IQ')} د.ع</span>
            </div>
        `).join('')}
    </div>

    <div class="total">
        الإجمالي: ${invoice.total.toLocaleString('ar-IQ')} د.ع
    </div>

    <div class="footer">
        <div>${invoice.footerText || 'شكراً لزيارتكم - نتمنى لكم يوماً سعيداً'}</div>
        <div class="brand">Powered by Cash Pro | Digital Creativity Company</div>
    </div>
</body>
</html>
    `;
}

app.whenReady().then(createWindow);

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', function () {
    if (mainWindow === null) {
        createWindow();
    }
});