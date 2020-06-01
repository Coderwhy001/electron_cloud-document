import React, { useState } from 'react'
import { faPlus, faFileImport } from '@fortawesome/free-solid-svg-icons'
import './App.css'
import uuidv4 from 'uuid/dist/v4'
import {flattenArr, objToArr} from './utils/helper'
import SimpleMDE from "react-simplemde-editor"
import 'bootstrap/dist/css/bootstrap.min.css'
import "easymde/dist/easymde.min.css"
import FileSearch from './components/FileSearch'
import FileList from './components/FileList'
import defaultFiles from './utils/defaultFiles'
import BottomBtn from './components/BottomBtn'
import TabList from './components/TabList'
function App() {
  const [ files, setFiles ] = useState(flattenArr(defaultFiles))
  console.log(files)
  const [ activeFileId, setActiveFileId ] = useState('')
  const [ openedFileIDs, setOpenedFileIDs ] = useState([])
  const [ unsavedFileIDs, setUnsavedFileIDs ] = useState([])
  const [ searchedFiles, setSearchedFiles ] = useState([])
  const filesArr = objToArr(files)
  console.log(filesArr)
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
    const newFile = { ...files[id], body: value }
    setFiles({ ...files, [id]: newFile })
    if (!unsavedFileIDs.includes(id)) {
      setUnsavedFileIDs([...unsavedFileIDs, id])
    }
  }
  const deleteFile = (id) => {
    delete files[id]
    setFiles(files)
    tabClose(id)
  }
  const updateFileName = (id, title) => {
    const modifiedFile = {...files[id], title, isNew: false }
    setFiles({ ...files, [id]: modifiedFile })
  }
  const fileSearch = (keyword) => {
    const newFiles = filesArr.filter(file => file.title.includes(keyword))
    setSearchedFiles(newFiles)
  }

  const createNewFile = () => {
    const newID = uuidv4()
    const newFile = {
        id: newID,
        title: '',
        body: '## 请输入 Mrakdown',
        createdAt: new Date().getTime(),
        isNew: true
    }
    setFiles({ ...files, [newID]: newFile})
  }
  const activeFile = files[activeFileId]
  const openedFiles = openedFileIDs.map(openID => {
    return files[openID]
  })
  const fileListArr = (searchedFiles.length > 0) ? searchedFiles : filesArr
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
