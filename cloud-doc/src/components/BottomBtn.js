import React from 'react'
import PropsType from 'prop-types'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

const BottomBtn = ({ text, colorClass, icon, onBtnClick }) => (
  <button
    type="button"
    className={`btn btn-block no-border ${colorClass}`}
    onClick={onBtnClick}
  >
    <FontAwesomeIcon
      className="mr-2"
      size="lg"
      icon={icon}
    />
    {text}
  </button>
)
BottomBtn.propTypes = {
  text: PropsType.string,
  colorClass: PropsType.string,
  icon: PropsType.element.isRequired,
  onBtnClick: PropsType.func
}
BottomBtn.defaultProps = {
  text: '新建'
}
export default BottomBtn