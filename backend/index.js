
import express from "express";
import pool from "./dbconfig.js";
import cors from "cors";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";

const app = express();

app.use(express.json());
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));
app.use(cookieParser());


function verifyJWTToken(req, resp, next) {
  const token = req.cookies["token"];
  if (!token) {
    return resp.send({ msg: "No token provided", success: false });
  }

  jwt.verify(token, "Google", (error, decoded) => {
    if (error) {
      return resp.send({ msg: "Invalid token", success: false });
    }
    req.user = decoded;
    next();
  });
}


app.post("/login", async (req, resp) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return resp.send({
      success: false,
      msg: "Email and password are required",
    });
  }

  try {
    const result = await pool.query(
      "SELECT id, fullname, email FROM users WHERE email = $1 AND password = $2",
      [email, password]
    );

    if (result.rows.length > 0) {
      const user = result.rows[0];

      jwt.sign(
        { id: user.id, email: user.email },
        "Google",
        { expiresIn: "5d" },
        (error, token) => {
          if (error) {
            return resp.send({ success: false, msg: "Token generation failed" });
          }
          resp.cookie("token", token, { httpOnly: true });
          resp.send({
            success: true,
            msg: "Login successful",
            token,
            user,
          });
        }
      );
    } else {
      resp.send({
        success: false,
        msg: "User not found",
      });
    }
  } catch (error) {
    console.error("Login error:", error);
    resp.status(500).send({ success: false, msg: "Server error" });
  }
});


app.post("/signup", async (req, resp) => {
  const { fullname, email, password } = req.body;

  if (!email || !password) {
    return resp.send({ success: false, msg: "Email and password required" });
  }

  try {
    const result = await pool.query(
      "INSERT INTO users (fullname, email, password, created_at) VALUES ($1,$2,$3,NOW()) RETURNING id, fullname, email",
      [fullname, email, password]
    );

    const user = result.rows[0];

    jwt.sign({ id: user.id, email: user.email }, "Google", { expiresIn: "5d" }, (error, token) => {
      if (error) return resp.send({ success: false, msg: "Token error" });

      resp.cookie("token", token, { httpOnly: true });
      resp.send({ success: true, msg: "Signup successful", token, user });
    });
  } catch (err) {
    console.error("Signup error:", err);
    resp.status(500).send({ success: false, msg: "Server error" });
  }
});

// 🔹 Add Task
app.post("/add-task", verifyJWTToken, async (req, resp) => {
  const { task_heading, task } = req.body;

  try {
    const result = await pool.query(
      "INSERT INTO list (user_id, task_heading, task, created_at) VALUES ($1,$2,$3,NOW()) RETURNING *",
      [req.user.id, task_heading, task]
    );

    resp.send({ message: "New task added", success: true, result: result.rows[0] });
  } catch (err) {
    console.error("Add Task error:", err);
    resp.status(500).send({ success: false, msg: "Server error" });
  }
});


app.get("/tasks", verifyJWTToken, async (req, resp) => {
  try {
    const result = await pool.query(
      "SELECT * FROM list WHERE user_id = $1 ORDER BY created_at DESC",
      [req.user.id]
    );
    resp.send({ message: "Task list fetched", success: true, result: result.rows });
  } catch (err) {
    console.error("Fetch tasks error:", err);
    resp.status(500).send({ success: false, msg: "Server error" });
  }
});

app.get("/task/:id", verifyJWTToken, async (req, resp) => {
  try {
    const result = await pool.query(
      "SELECT * FROM list WHERE id = $1 AND user_id = $2",
      [req.params.id, req.user.id]
    );

    if (result.rows.length > 0) {
      resp.send({ message: "Task fetched", success: true, result: result.rows[0] });
    } else {
      resp.send({ message: "Task not found", success: false });
    }
  } catch (err) {
    console.error("Get task error:", err);
    resp.status(500).send({ success: false, msg: "Server error" });
  }
});


app.put("/update-task", verifyJWTToken, async (req, resp) => {
  const { id, task_heading, task } = req.body;

  try {
    const result = await pool.query(
      "UPDATE list SET task_heading = $1, task = $2 WHERE id = $3 AND user_id = $4 RETURNING *",
      [task_heading, task, id, req.user.id]
    );

    if (result.rows.length > 0) {
      resp.send({ message: "Task updated", success: true, result: result.rows[0] });
    } else {
      resp.send({ message: "Task not found or not yours", success: false });
    }
  } catch (err) {
    console.error("Update task error:", err);
    resp.status(500).send({ success: false, msg: "Server error" });
  }
});


app.delete("/delete/:id", verifyJWTToken, async (req, resp) => {
  try {
    const result = await pool.query(
      "DELETE FROM list WHERE id = $1 AND user_id = $2 RETURNING id",
      [req.params.id, req.user.id]
    );

    if (result.rowCount > 0) {
      resp.send({ message: "Task deleted", success: true });
    } else {
      resp.send({ message: "Task not found or not yours", success: false });
    }
  } catch (err) {
    console.error("Delete task error:", err);
    resp.status(500).send({ success: false, msg: "Server error" });
  }
});


app.delete("/delete-multiple", verifyJWTToken, async (req, resp) => {
  const { ids } = req.body; 

  try {
    const result = await pool.query(
      "DELETE FROM list WHERE id = ANY($1) AND user_id = $2 RETURNING id",
      [ids, req.user.id]
    );

    if (result.rowCount > 0) {
      resp.send({ message: "Tasks deleted", success: true, deleted: result.rows });
    } else {
      resp.send({ message: "No tasks deleted", success: false });
    }
  } catch (err) {
    console.error("Delete multiple tasks error:", err);
    resp.status(500).send({ success: false, msg: "Server error" });
  }
});


app.listen(3200, () => console.log("Server running on port 3200"));
