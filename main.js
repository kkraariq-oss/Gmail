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
                height: 0 // ارتفاع تلقائي
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
            font-family: 'Courier New', monospace;
            font-size: 12px;
            margin: 10px;
            padding: 0;
            width: 80mm;
        }
        .header {
            text-align: center;
            border-bottom: 2px dashed #000;
            padding-bottom: 10px;
            margin-bottom: 10px;
        }
        .header h2 {
            margin: 5px 0;
            font-size: 18px;
        }
        .info {
            margin-bottom: 10px;
            font-size: 11px;
        }
        .items {
            border-top: 1px dashed #000;
            border-bottom: 1px dashed #000;
            padding: 10px 0;
        }
        .item {
            display: flex;
            justify-content: space-between;
            margin: 5px 0;
        }
        .total {
            text-align: center;
            font-size: 16px;
            font-weight: bold;
            margin: 15px 0;
        }
        .footer {
            text-align: center;
            border-top: 2px dashed #000;
            padding-top: 10px;
            margin-top: 10px;
            font-size: 10px;
        }
    </style>
</head>
<body>
    <div class="header">
        <h2>${invoice.restaurantName || 'مطعم Cash Pro'}</h2>
        <div>${invoice.address || 'العنوان'}</div>
        <div>${invoice.phone || 'رقم الهاتف'}</div>
    </div>

    <div class="info">
        <div>رقم الفاتورة: ${invoice.id}</div>
        <div>التاريخ: ${invoice.date}</div>
        <div>الوقت: ${invoice.time}</div>
        <div>الكاشير: ${invoice.cashier || 'admin'}</div>
    </div>

    <div class="items">
        ${invoice.items.map(item => `
            <div class="item">
                <span>${item.name} × ${item.quantity}</span>
                <span>${(item.price * item.quantity).toLocaleString('ar-IQ')} د.ع</span>
            </div>
        `).join('')}
    </div>

    <div class="total">
        الإجمالي: ${invoice.total.toLocaleString('ar-IQ')} د.ع
    </div>

    <div class="footer">
        <div>شكراً لزيارتكم</div>
        <div>نتمنى لكم يوماً سعيداً</div>
        <div style="margin-top: 10px;">Powered by Cash Pro</div>
        <div>Digital Creativity Company</div>
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