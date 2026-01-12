const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow;
let splashWindow;

function createSplashScreen() {
  splashWindow = new BrowserWindow({
    width: 600,
    height: 400,
    transparent: true,
    frame: false,
    alwaysOnTop: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  splashWindow.loadFile('src/pages/splash.html');
  splashWindow.center();
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 700,
    frame: false, // إزالة الإطار الافتراضي
    backgroundColor: '#1a1a2e',
    icon: path.join(__dirname, 'src/assets/icons/icon.png'),
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true
    },
    show: false
  });

  mainWindow.loadFile('src/index.html');
  
  // إظهار النافذة بعد التحميل
  mainWindow.once('ready-to-show', () => {
    setTimeout(() => {
      if (splashWindow) {
        splashWindow.close();
      }
      mainWindow.show();
      mainWindow.maximize();
    }, 3000); // 3 ثواني لشاشة الترحيب
  });

  mainWindow.on('closed', function () {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createSplashScreen();
  setTimeout(() => {
    createWindow();
  }, 100);

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) {
      createSplashScreen();
      setTimeout(createWindow, 100);
    }
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

// التحكم في النافذة
ipcMain.on('window-minimize', () => {
  if (mainWindow) mainWindow.minimize();
});

ipcMain.on('window-maximize', () => {
  if (mainWindow) {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow.maximize();
    }
  }
});

ipcMain.on('window-close', () => {
  if (mainWindow) mainWindow.close();
});

// معالجة الطباعة
ipcMain.on('print-receipt', (event, printData) => {
  const printerWindow = new BrowserWindow({
    show: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  printerWindow.loadFile('src/pages/print-template.html');
  
  printerWindow.webContents.on('did-finish-load', () => {
    printerWindow.webContents.send('print-data', printData);
    
    setTimeout(() => {
      printerWindow.webContents.print({
        silent: true,
        printBackground: true,
        deviceName: printData.printerName || ''
      }, (success, errorType) => {
        if (!success) {
          console.log('Print failed:', errorType);
        }
        printerWindow.close();
      });
    }, 500);
  });
});

// حفظ الملفات
ipcMain.on('save-file', (event, { filePath, data }) => {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    event.reply('file-saved', { success: true });
  } catch (error) {
    event.reply('file-saved', { success: false, error: error.message });
  }
});

// قراءة الملفات
ipcMain.on('read-file', (event, filePath) => {
  try {
    const data = fs.readFileSync(filePath, 'utf-8');
    event.reply('file-read', { success: true, data: JSON.parse(data) });
  } catch (error) {
    event.reply('file-read', { success: false, error: error.message });
  }
});
