import PropTypes from 'prop-types'
const Button = ({ color, text, onClick }) => {
  return (
    <>
      <button className="btn" onClick={onClick} style={{ backgroundColor: color }}>
        {text}
      </button>
    </>
  )
}
Button.defaultProps = {
  text: 'Save',
  color: 'skyblue',
}
Button.propTypes = { text: PropTypes.string, onClick: PropTypes.func.isRequired }
export default Button
