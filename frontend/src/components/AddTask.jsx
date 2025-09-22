import { useState } from 'react'
import '../style/addtask.css'
import { useNavigate } from 'react-router-dom';

export default function AddTask() {
  const [taskData, setTaskData] = useState({
    task_heading: "",
    task: ""
  });
  const navigate = useNavigate();

  const handleAddTask = async () => {
    console.log("Task to add:", taskData);

    let result = await fetch('http://localhost:3200/add-task', {
      method: 'POST',
      body: JSON.stringify(taskData),
      credentials: 'include',   
      headers: {
        'Content-Type': 'application/json'
      }
    });

    result = await result.json();
    if (result.success) {
      console.log("New task added", result);
      navigate("/");
    } else {
      alert(result.msg || "Something went wrong");
    }
  };

  return (
    <div className="container">
      <h1>Add New Task</h1>

      <label>Title</label>
      <input
        value={taskData.task_heading}
        onChange={(e) => setTaskData({ ...taskData, task_heading: e.target.value })}
        type="text"
        placeholder="Enter task title"
      />

      <label>Description</label>
      <textarea
        value={taskData.task}
        onChange={(e) => setTaskData({ ...taskData, task: e.target.value })}
        rows={4}
        placeholder="Enter task description"
      />

      <button onClick={handleAddTask} className="submit">Add New Task</button>
    </div>
  )
}
