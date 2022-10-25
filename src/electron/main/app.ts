import { BrowserWindow } from 'electron';

import { CodeWalkerFormat } from '@/core/formats/codewalker';

import { ProjectManager } from './project-manager';

declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;

export class Application {
  private mainWindow: BrowserWindow;

  public codeWalkerFormat: CodeWalkerFormat;

  public projectManager: ProjectManager;

  constructor() {}

  public init() {
    if (this.mainWindow) {
      return;
    }

    this.codeWalkerFormat = new CodeWalkerFormat();

    this.projectManager = new ProjectManager(this.codeWalkerFormat);

    this.mainWindow = new BrowserWindow({
      height: 700,
      width: 1100,
      title: 'GTA V Audio Occlusion Tool',
      backgroundColor: '#212121',
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
      },
    });

    if (process.env.NODE_ENV === 'development') {
      this.mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);
    } else {
      this.mainWindow.loadFile(MAIN_WINDOW_WEBPACK_ENTRY);
    }

    this.mainWindow.on('page-title-updated', e => {
      e.preventDefault();
    });

    this.mainWindow.webContents.on('did-finish-load', () => {
      console.log('Finished loading main window');
    });
  }
}
