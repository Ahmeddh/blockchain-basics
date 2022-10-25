import PropTypes from 'prop-types'
import { useLocation } from 'react-router-dom'
import Button from './Button'
const Header = ({ title, onAdd, showAdd }) => {
  const location = useLocation()
  return (
    <header className='header'>
      <h1>{title}</h1>
      {location.pathname === '/' && (
        <Button
          color={showAdd ? 'darkred' : 'steelblue'}
          onClick={onAdd}
          text={showAdd ? 'Close' : 'Add'}
        />
      )}
    </header>
  )
}

Header.defaultProps = { title: 'Task Tracker' }
Header.propsTypes = {
  title: PropTypes.string.isRequired,
}

export default Header
