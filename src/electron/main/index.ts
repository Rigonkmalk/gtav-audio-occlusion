import { app, BrowserWindow, ipcMain, IpcMainEvent, dialog } from 'electron';
import * as path from 'path';

import { CodeWalkerFile } from '../../core/files/codewalker';
import { CMapData } from '../../core/files/codewalker/ymap';
import { CMloArchetypeDef } from '../../core/files/codewalker/ytyp';

import AudioOcclusion from '../../core/classes/audioOcclusion';

import * as XML from '../../core/types/xml';

function createWindow() {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    height: 700,
    width: 1100,
    title: 'GTA V Audio Occlusion Tool',
    backgroundColor: '#212121',
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:4000');
  } else {
    mainWindow.loadFile(path.join(__dirname, './renderer/index.html'));
  }

  mainWindow.on('page-title-updated', function (e) {
    e.preventDefault();
  });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
  createWindow();

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.

ipcMain.handle('showFolderDialog', async (event: IpcMainEvent) => {
  const fileSelection = await dialog.showOpenDialog({
    properties: ['openFile'],
  });

  return fileSelection;
});

let ymapPath: string;
let ytypPath: string;

let audioOcclusion: AudioOcclusion;

async function generateAudioOcclusion(): Promise<void> {
  const cwFile = new CodeWalkerFile();

  const parsedYmap = await cwFile.read<XML.Ymap>(ymapPath);
  const parsedYtyp = await cwFile.read<XML.Ytyp>(ytypPath);

  audioOcclusion = new AudioOcclusion({
    CMapData: new CMapData(parsedYmap),
    CMloArchetypeDef: new CMloArchetypeDef(parsedYtyp),
  });
}

ipcMain.on('fileImported', (event: IpcMainEvent, path: string) => {
  if (!ymapPath && path.includes('ymap')) {
    ymapPath = path;
  }

  if (!ytypPath && path.includes('ytyp')) {
    ytypPath = path;
  }

  if (ymapPath && ytypPath && !audioOcclusion) {
    generateAudioOcclusion();
  }
});

ipcMain.handle('getAudioOcclusion', (event: IpcMainEvent) => {
  return audioOcclusion;
});
