const { app, BrowserWindow, Menu, ipcMain } = require('electron')
const isDev = require('electron-is-dev')
const AppWindow = require('./src/AppWindow')
const menuTemplate = require('./src/menuTemplate')
const path = require('path')
let mainWindow, settingsWindow

app.on('ready', () => {
  const mainWindowConfig = {
    width: 1440,
    height: 768
  }
  const urlLocation = isDev ? 'http://localhost:3000' : 'dummyurl'
  mainWindow = new AppWindow(mainWindowConfig, urlLocation)
  mainWindow.on('close', () => {
    mainWindow = null
  })
  ipcMain.on('open-settings-window', () => {
    const settingsWindowConfig = {
      width: 500,
      height: 400,
      parent: mainWindow
    }
    const settingsFileLocation = `file://${path.join(__dirname, './settings/settings.html')}`
    settingsWindow = new AppWindow(settingsWindowConfig, settingsFileLocation)
    settingsWindow.removeMenu()
    settingsWindow.on('close', () => {
      settingsWindow = null
    })
  })
  const menu = Menu.buildFromTemplate(menuTemplate)
  Menu.setApplicationMenu(menu)
})