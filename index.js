const express = require("express");
const app = express();
const dotenv = require("dotenv").config();
const {  Pool } = require("pg");


const { PGHOST, PGDATABASE, PGUSER, PGPASSWORD } = process.env;
const pool = new Pool({
  host: PGHOST,
  database: PGDATABASE,
  user: PGUSER,
  password: PGPASSWORD,
  port: 5432, // default Postgres port
  ssl: {
    rejectUnauthorized: false,
  },
});

app.get("/", async (req, res) => {
  const client = await pool.connect();
  try{

    const result = await client.query("SELECT * FROM products");
    res.json(result.rows);

  }catch(error){
    console.log(error)
  }finally{
    client.release();
  }
  
});

// Start server
const port = 3000;
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
