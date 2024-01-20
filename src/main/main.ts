import {app, BrowserWindow, ipcMain, session} from 'electron';
import {join} from 'path';
import {GakujoApi} from './api/gakujoapi';

function createWindow () {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    }
  });

  mainWindow.setMenu(null)

  if (process.env.NODE_ENV === 'development') {
    const rendererPort = process.argv[2];
    mainWindow.loadURL(`http://localhost:${rendererPort}`);
  }
  else {
    mainWindow.loadFile(join(app.getAppPath(), 'renderer', 'index.html'));
  }
}

app.whenReady().then(() => {

  createWindow();

  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': ['script-src \'self\'']
      }
    })
  })

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
});

ipcMain.on('message', (event, message) => {
  console.log(message);
})

const gakujoApi = new GakujoApi()

ipcMain.handle('initApi', gakujoApi.init)
ipcMain.handle('getTitle', gakujoApi.getTitle)
ipcMain.handle('movePage', async(event, page) => await gakujoApi.movePage(page))
ipcMain.handle('getTable', gakujoApi.getTable)
ipcMain.handle('getTableData', gakujoApi.getTableData)
ipcMain.handle('getDetails', async(event, page, id) => await gakujoApi.getDetails(page, id))
ipcMain.handle('isReady', gakujoApi.isReady)
