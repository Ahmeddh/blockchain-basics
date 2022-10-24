import { useState } from 'react'
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
    {
      id: '4',
      text: 'Practice think and grow rich tactics',
      day: 'Oct 25th at 01:00 AM',
      reminder: false,
    },
  ])

  const deleteTask = (id) => {
    setTask(tasks.filter((task) => task.id !== id))
  }

  const toggleReminder = (id) => {
    setTask(tasks.map((task) => (task.id === id ? { ...task, reminder: !task.reminder } : task)))
  }

  return (
    <div className="container">
      <Header title={'Task Tracker'} />
      {tasks.length > 0 ? (
        <Tasks tasks={tasks} onDelete={deleteTask} onToggle={toggleReminder} />
      ) : (
        'No tasks to show'
      )}
    </div>
  )
}

export default App
