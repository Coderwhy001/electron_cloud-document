import React, { useState } from 'react'
import { faPlus, faFileImport } from '@fortawesome/free-solid-svg-icons'
import './App.css'
import SimpleMDE from "react-simplemde-editor"
import 'bootstrap/dist/css/bootstrap.min.css'
import "easymde/dist/easymde.min.css"
import FileSearch from './components/FileSearch'
import FileList from './components/FileList'
import defaultFiles from './utils/defaultFiles'
import BottomBtn from './components/BottomBtn'
import TabList from './components/TabList'
function App() {
  const [ files, setFiles ] = useState(defaultFiles)
  const [ activeFileId, setActiveFileId ] = useState('')
  const [ openedFileIDs, setOpenedFileIDs ] = useState([])
  const [ unsavedFileIDs, setUnsavedFileIDs ] = useState([])
  const [ searchedFiles, setSearchedFiles ] = useState([])
  
  const openedFiles = openedFileIDs.map(openID => {
    return files.find(file => file.id === openID)
  })
  const fileClick = (fileID) => {
    setActiveFileId(fileID)
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
    const newFiles = files.map(file => {
      if (file.id === id) {
        file.body = value
      }
      return file
    })
    setFiles(newFiles)
    if (!unsavedFileIDs.includes(id)) {
      setUnsavedFileIDs([...unsavedFileIDs, id])
    }
  }
  const deleteFile = (id) => {
    const newFiles = files.filter(file => file.id !== id)
    setFiles(newFiles)
    tabClose(id)
  }
  const updateFileName = (id, title) => {
    const newFiles = files.map(file => {
      if (file.id === id) {
        file.title = title
      }
      return file
    })
    setFiles(newFiles)
  }
  const fileSearch = (keyword) => {
    const newFiles = files.filter(file => file.title.includes(keyword))
    setSearchedFiles(newFiles)
  }
  const activeFile = files.find(file => file.id === activeFileId)
  const fileListArr = (searchedFiles.length > 0) ? searchedFiles : files
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
            onFileDelete={(id) => {deleteFile(id)}}
            onSaveEdit={(id, newValue) => {updateFileName(id, newValue)}}
          />
          <div className="row no-gutters button-group">
            <div className="col">
              <BottomBtn
                text="新建"
                colorClass="btn-primary"
                icon={faPlus}
              />
            </div>
            <div className="col">
              <BottomBtn
                text="导入"
                colorClass="btn-success"
                icon={faFileImport}
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
