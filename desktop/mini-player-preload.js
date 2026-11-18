'use strict';
const { contextBridge, ipcRenderer } = require('electron');
const commands = new Set(['toggle', 'next', 'previous', 'restore', 'mv']);
contextBridge.exposeInMainWorld('mineradioMiniBridge', {
  command: (name) => {
    if (commands.has(name)) ipcRenderer.send('mineradio-mini-player-command', name);
  },
  onState: (callback) => {
    if (typeof callback !== 'function') return () => {};
    const listener = (_event, payload) => callback(payload || {});
    ipcRenderer.on('mineradio-mini-player-state', listener);
    return () => ipcRenderer.removeListener('mineradio-mini-player-state', listener);
  },
  ready: () => ipcRenderer.send('mineradio-mini-player-ready'),
});
