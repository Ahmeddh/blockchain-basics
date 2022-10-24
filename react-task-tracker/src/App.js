import { useState } from 'react'
import AddTask from './components/AddTask'
import Tasks from './components/Tasks'
import Header from './components/Header'

function App() {
  const [tasks, setTask] = useState([
    {
      id: '1',
      text: 'Finish React course',
      day: 'Oct 23rd at 05:00 PM',
      reminder: false,
    },
    {
      id: '2',
      text: 'Finish Nextjs crush course',
      day: 'Oct 24th at 08:00 PM',
      reminder: false,
    },
    {
      id: '3',
      text: 'Read a book',
      day: 'Oct 25th at 05:00 PM',
      reminder: true,
    },
  ])

  const [showAddTask, setShowAddTask] = useState(false)
  //add task
  const addTask = (task) => {
    const id = Math.floor(Math.random() * 10000) + 1
    const newTask = { id, ...task }
    setTask([newTask, ...tasks])
    console.log('Task has been added succesfully')
  }

  //delete task
  const deleteTask = (id) => {
    setTask(tasks.filter((task) => task.id !== id))
  }

  //toggle reminder
  const toggleReminder = (id) => {
    setTask(tasks.map((task) => (task.id === id ? { ...task, reminder: !task.reminder } : task)))
  }

  return (
    <div className='container'>
      <Header
        title={'Task Tracker'}
        onAdd={() => {
          setShowAddTask(!showAddTask)
        }}
        showAdd={showAddTask}
      />
      {showAddTask && <AddTask onAdd={addTask} />}
      {tasks.length > 0 ? (
        <Tasks tasks={tasks} onDelete={deleteTask} onToggle={toggleReminder} />
      ) : (
        'No tasks to show'
      )}
    </div>
  )
}

export default App
