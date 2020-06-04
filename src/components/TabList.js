import React from 'react';
import PropType from 'prop-types'
import classNames from 'classnames'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTimes } from '@fortawesome/free-solid-svg-icons'
import './TabList.scss'
const TabList = ({ files, activeId, unsaveIds, onTabClick, onCloseTab}) => {
  return (
    <ul className="nav nav-pills tablist-component">
      {files.map(file => {
        const withUnsavedMark = unsaveIds.includes(file.id)
        const fClassName = classNames({
          'nav-link': true,
          'active': file.id === activeId,
          'withUnsaved': withUnsavedMark
        })
        return (
          <li className="nav-item" key={file.id}>
            <a 
              href="#"
              className={fClassName}
              onClick={(e) => {e.preventDefault(); onTabClick(file.id)}}
            >
              {file.title}
              <span 
                className="ml-2 close-icon"
                onClick={(e) => {e.stopPropagation(); onCloseTab(file.id)}}
              >
                <FontAwesomeIcon
                  title="关闭"
                  icon={faTimes}
                />
              </span>
              { withUnsavedMark && <span className="rounded-circle unsaved-icon ml-2">
                </span>}
            </a>
          </li>
        )
      })}
    </ul>
  )
}

TabList.propType = {
  files: PropType.array,
  activeId: PropType.string,
  unsaveIds: PropType.array,
  onTabClick: PropType.func,
  onCloseTab: PropType.func
}
TabList.defaultProps = {
  unsaveIds: []
}
export default TabList