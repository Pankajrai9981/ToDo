
import pg from "pg";

const { Pool } = pg;

const pool = new Pool({
  user: "postgres",        
  host: "localhost",      
  database: "todo",     
  password: "pankaj11",    
  port: 5432,             
});


pool.connect()
  .then(() => console.log(" Connected to PostgreSQL"))
  .catch((err) => console.error(" PostgreSQL connection error:", err));

export default pool;
