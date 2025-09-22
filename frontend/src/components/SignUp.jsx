import { useEffect, useState } from 'react'
import '../style/addtask.css'
import { Link, useNavigate } from 'react-router-dom'

export default function SignUp() {
  const [userData, setUserData] = useState({
    fullname: "",
    email: "",
    password: ""
  });

  const navigate = useNavigate();

  useEffect(() => {
    if (localStorage.getItem('login')) {
      navigate('/');
    }
  }, []);

  const handleSignUp = async () => {
    console.log("Signup data:", userData);

    let result = await fetch('http://localhost:3200/signup', {
      method: 'POST',
      body: JSON.stringify(userData),
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: "include" 
    });

    result = await result.json();
    if (result.success) {
      console.log("Signup result:", result);
      localStorage.setItem('login', userData.email);
      navigate('/');
    } else {
      alert(result.msg || "Try after sometime");
    }
  }

  return (
    <div className="container">
      <h1>Sign Up</h1>

      <label>Full Name</label>
      <input
        value={userData.fullname}
        onChange={(e) => setUserData({ ...userData, fullname: e.target.value })}
        type="text"
        placeholder="Enter full name"
      />

      <label>Email</label>
      <input
        value={userData.email}
        onChange={(e) => setUserData({ ...userData, email: e.target.value })}
        type="text"
        placeholder="Enter user email"
      />

      <label>Password</label>
      <input
        value={userData.password}
        onChange={(e) => setUserData({ ...userData, password: e.target.value })}
        type="password"
        placeholder="Enter user password"
      />

      <button onClick={handleSignUp} className="submit">Sign up</button>
      <Link className="link" to="/login">Login</Link>
    </div>
  )
}
