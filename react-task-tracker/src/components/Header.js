import PropTypes from 'prop-types'
import Button from './Button'
const Header = ({ title }) => {
  const onClick = () => {
    console.log('Button clicked')
  }
  return (
    <header className="header">
      <h1>{title}</h1>
      <Button color="steelblue" onClick={onClick} text="Add" />
    </header>
  )
}

Header.defaultProps = { title: 'Task Tracker' }
Header.propsTypes = {
  title: PropTypes.string.isRequired,
}

export default Header
