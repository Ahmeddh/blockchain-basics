import Task from './Task'
const Tasks = ({ tasks, onDelete, onToggle }) => {
  return (
    <>
      {tasks.map((task) => (
        <Task key={task.id} task={task} onDelete={onDelete} onToggle={onToggle} />
        // <h4 key={task.id}>{task.day}</h4>
      ))}
    </>
  )
}

export default Tasks
