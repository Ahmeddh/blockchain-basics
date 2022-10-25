import { useState, useEffect } from 'react'
import { BrowserRouter as Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
import Tasks from './components/Tasks'
import AddTask from './components/AddTask'
import About from './components/About'

function App() {
  const [tasks, setTasks] = useState([])

  const [showAddTask, setShowAddTask] = useState(false)

  useEffect(() => {
    const getData = async () => {
      const tasksFromServer = await fetchTasks()
      setTasks(tasksFromServer)
    }
    getData()
  }, [])

  //fetch Tasks
  const fetchTasks = async () => {
    const response = await fetch('http://localhost:3003/tasks')
    const tasks = await response.json()
    return tasks
  }

  //fetch Task
  const fetchTask = async (id) => {
    const response = await fetch(`http://localhost:3003/tasks/${id}`)
    const task = await response.json()
    return task
  }

  //add task
  const addTask = async (task) => {
    const response = await fetch('http://localhost:3003/tasks/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(task),
    })
    const newTask = await response.json()
    setTasks([newTask, ...tasks])
    console.log('Task has been added succesfully')
  }

  //delete task
  const deleteTask = async (id) => {
    await fetch(`http://localhost:3003/tasks/${id}`, { method: 'DELETE' })
    setTasks(tasks.filter((task) => task.id !== id))
  }

  //toggle reminder
  const toggleReminder = async (id) => {
    const taskToToggle = await fetchTask(id)
    const updatedTask = { ...taskToToggle, reminder: !taskToToggle.reminder }
    const response = await fetch(`http://localhost:3003/tasks/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedTask),
    })
    const data = await response.json()
    setTasks(tasks.map((task) => (task.id === id ? { ...task, reminder: data.reminder } : task)))
  }

  return (
    <Routes>
      <div className='container'>
        <Header
          title={'Task Tracker'}
          onAdd={() => {
            setShowAddTask(!showAddTask)
          }}
          showAdd={showAddTask}
        />

        <Route
          path='/'
          exact
          render={(props) => (
            <>
              {showAddTask && <AddTask onAdd={addTask} />}
              {tasks.length > 0 ? (
                <Tasks tasks={tasks} onDelete={deleteTask} onToggle={toggleReminder} />
              ) : (
                'No tasks to show'
              )}
            </>
          )}
        />
        <Route path='/about' component={About} />
        <Footer />
      </div>
    </Routes>
  )
}

export default App
