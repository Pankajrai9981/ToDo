import { useEffect, useState } from 'react'
import '../style/addtask.css'
import { useNavigate, useParams } from 'react-router-dom';

export default function UpdateTask() {
  const [taskData, setTaskData] = useState({
    id: null,
    task_heading: "",
    task: ""
  });
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    if (id) getTask(id);
  }, [id]);

  const getTask = async (id) => {
    let res = await fetch(`http://localhost:3200/task/${id}`, {
      credentials: 'include'
    });
    res = await res.json();
    if (res.success && res.result) {
      setTaskData({
        id: res.result.id,
        task_heading: res.result.task_heading,
        task: res.result.task
      });
    } else {
      alert(res.msg || "Try after sometime");
    }
  };

  const updateTask = async () => {
    // ensure id present
    if (!taskData.id) return alert("Task id missing");

    let res = await fetch("http://localhost:3200/update-task", {
      method: 'PUT',
      credentials: 'include',
      body: JSON.stringify({
        id: taskData.id,
        task_heading: taskData.task_heading,
        task: taskData.task
      }),
      headers: { 'Content-Type': 'application/json' }
    });

    res = await res.json();
    if (res.success) {
      navigate('/');
    } else {
      alert(res.msg || "Try after sometime");
    }
  };

  return (
    <div className="container">
      <h1>Update Task</h1>

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

      <button onClick={updateTask} className="submit">Update Task</button>
    </div>
  );
}
