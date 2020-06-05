import React, { useState, useEffect } from 'react'
import { faPlus, faFileImport, faSave } from '@fortawesome/free-solid-svg-icons'
import './App.css'
import uuidv4 from 'uuid/dist/v4'
import {objToArr, flattenArr} from './utils/helper'
import fileHelper from './utils/fileHelper'
import SimpleMDE from "react-simplemde-editor"
import 'bootstrap/dist/css/bootstrap.min.css'
import "easymde/dist/easymde.min.css"
import FileSearch from './components/FileSearch'
import FileList from './components/FileList'
import BottomBtn from './components/BottomBtn'
import TabList from './components/TabList'
import useIpcRenderer from './hooks/useIpcRender'
const { join, basename, extname, dirname } = window.require('path')
const { remote, ipcRenderer } = window.require('electron')
const Store = window.require('electron-store')
const fileStore = new Store({'name': 'Files Data'})
const settingsStore = new Store({name: 'Settings'})

const saveFilesToStore = (files) => {
  const filesStoreObj = objToArr(files).reduce((result, file) => {
    const { id, path, title, createdAt } = file
    result[id] = {
      id,
      path,
      title,
      createdAt
    }
    return result
  }, {})
  fileStore.set('files', filesStoreObj)
}
function App() {
  const [ files, setFiles ] = useState(fileStore.get('files') || {}) 
  const [ activeFileId, setActiveFileId ] = useState('')
  const [ openedFileIDs, setOpenedFileIDs ] = useState([])
  const [ unsavedFileIDs, setUnsavedFileIDs ] = useState([])
  const [ searchedFiles, setSearchedFiles ] = useState([])
  const filesArr = objToArr(files)
  const savedLocation = settingsStore.get('savedFileLocation') || remote.app.getPath('documents')
  const activeFile = files[activeFileId]
  const openedFiles = openedFileIDs.map(openID => {
    return files[openID]
  })
  const fileListArr = (searchedFiles.length > 0) ? searchedFiles : filesArr

  const fileClick = (fileID) => {
    setActiveFileId(fileID)
    const currentFile = files[fileID]
    if (!currentFile.isLoaded) {
      fileHelper.readFile(currentFile.path)
      .then(value => {
        const newFile = { ...files[fileID], body: value, isLoaded: true }
        setFiles({ ...files, [fileID]: newFile })
      })
      .catch((err) => {
        alert(err)
        const { [fileID]: value, ...afterDelete } = files
        setFiles(afterDelete)
        saveFilesToStore(afterDelete)
      })
    }
    if (openedFileIDs.indexOf(fileID) === -1) {
      setOpenedFileIDs([...openedFileIDs, fileID])
    } 
  }
  const tabClick = (fileID) => {
    setActiveFileId(fileID)
  }

  const tabClose = (id) => {
    const tabsWithout = openedFileIDs.filter(fileID => fileID !== id)
    setOpenedFileIDs(tabsWithout)
    if (tabsWithout.length > 0) {
      setActiveFileId(openedFileIDs[0])
    } else {
      setActiveFileId('')
    }
  }

  const fileChange = (id, value) => {
    if (value !== files[id].body) {
      const newFile = { ...files[id], body: value }
      setFiles({ ...files, [id]: newFile })
      if (!unsavedFileIDs.includes(id)) {
        setUnsavedFileIDs([...unsavedFileIDs, id])
      }
    }
  }
  const deleteFile = (id) => {
    if (files[id].isNew) {
      const { [id]: value, ...afterDelete } = files
      setFiles(afterDelete)
    } else {
      fileHelper.deleteFile(files[id].path).then(() => {
      const { [id]: value, ...afterDelete } = files
      setFiles(afterDelete)
      saveFilesToStore(afterDelete)
      tabClose(id)
      })
    }
  }
  const updateFileName = (id, title, isNew) => {
    const newPath = isNew ? join(savedLocation, `${title}.md`) : join(dirname(files[id].path), `${title}.md`)
    const modifiedFile = {...files[id], title, isNew: false, path: newPath }
    const newFiles = { ...files, [id]: modifiedFile }
    if (isNew) {
      fileHelper.writeFile(newPath, files[id].body).then(() => {
        setFiles(newFiles)
        saveFilesToStore(newFiles)
        setOpenedFileIDs([...openedFileIDs, id])
        setActiveFileId(id)
      })
    } else {
      const oldPath = files[id].path
      fileHelper.renameFile(oldPath, newPath)
      .then(() => {
        setFiles(newFiles)
        saveFilesToStore(newFiles)
      })
    }
  }
  const fileSearch = (keyword) => {
    const newFiles = filesArr.filter(file => file.title.includes(keyword))
    setSearchedFiles(newFiles)
  }

  const createNewFile = () => {
    const newID = uuidv4()
    let len = filesArr.length
    if (len === 0) {
      const newFile = {
        id: newID,
        title: '',
        body: '## 请输入 Mrakdown',
        createdAt: new Date().getTime(),
        isNew: true
    }
    setFiles({ ...files, [newID]: newFile})
    } else if (!filesArr[len-1].isNew) {
      const newFile = {
        id: newID,
        title: '',
        body: '## 请输入 Mrakdown',
        createdAt: new Date().getTime(),
        isNew: true
    }
      setFiles({ ...files, [newID]: newFile})
    }
  }
  const saveCurrentFile = () => {
    if (activeFileId) {
      fileHelper.writeFile(activeFile.path,activeFile.body)
      .then(() => {
        setUnsavedFileIDs(unsavedFileIDs.filter(id => id !== activeFileId))
      })
    }
    
  }
  const importFiles = () => {
    remote.dialog.showOpenDialog({
      title: '选择导入的 Markdown 文件',
      properties: ['openFile', 'multiSelections'],
      filters: [
        {name: 'Markdown files', extensions: ['md']}
      ]
    }, (paths) => {
      if (Array.isArray(paths)) {
        const filteredPath = paths.filter(path => {
          const alreadyAdded = Object.values(files).find(file => {
            return file.path === path
          })
          return !alreadyAdded
        })
        const importFilesArr = filteredPath.map(path => {
          return {
            id: uuidv4(),
            title: basename(path, extname(path)),
            createdAt: new Date().getTime(),
            path,
          }
        })
        console.log(importFilesArr)
        const newFiles = { ...files, ...flattenArr(importFilesArr)}
        console.log(newFiles)
        setFiles(newFiles)
        saveFilesToStore(newFiles)
        if (importFilesArr.length > 0) {
          remote.dialog.showMessageBox({
            type: 'info',
            title: `成功导入了${importFilesArr.length}个文件`,
            message: `成功导入了${importFilesArr.length}个文件`
          })
        }
      }
    })
  }
  useIpcRenderer({
    'create-new-file': createNewFile,
    'import-file': importFiles,
    'save-edit-file': saveCurrentFile
  })
  return (
    <div className="App container-fluid px-0">
      <div className="row no-gutters">
        <div className="col-3 bg-light left-panel">
          <FileSearch 
            title='my document'
            onFileSearch={fileSearch}
          />
          <FileList
            files={fileListArr}
            onFileClick={fileClick}
            onFileDelete={deleteFile}
            onSaveEdit={updateFileName}
          />
          <div className="row no-gutters button-group">
            <div className="col">
              <BottomBtn
                text="新建"
                colorClass="btn-primary"
                icon={faPlus}
                onBtnClick={createNewFile}
              />
            </div>
            <div className="col">
              <BottomBtn
                text="导入"
                colorClass="btn-success"
                icon={faFileImport}
                onBtnClick={importFiles}
              />
            </div>
          </div>
        </div> 
        <div className="col-9 right-panel">
          { !activeFile &&
            <div className="start-page">
                选择或者创建新的 Markdown文档
            </div>
          }
          { activeFile &&
          <>
            <TabList
              files={openedFiles}
              activeId={activeFileId}
              unsaveIds={unsavedFileIDs}
              onTabClick={tabClick}
              onCloseTab={tabClose}
            />
            <SimpleMDE
              key={activeFile && activeFile.id}
              value={activeFile && activeFile.body}
              onChange={(value) => {fileChange(activeFile.id, value)}}
              options={{
                minHeight: '515px'
              }}
            />
          </>
          }
        </div>
      </div>
    </div>
  );
}

export default App;
