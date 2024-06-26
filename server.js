// Import and require needed packages
const express = require('express');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 3001;

// Express middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Connect to database
const pool = new Pool(
  {
    user: 'postgres',
    password: '3Q2LnY1Z',
    host: 'localhost',
    database: 'employees_db'
  },
  console.log(`Connected to the employees_db database.`)
)

pool.connect();

// Default response for any other request (Not Found)
app.use((req, res) => {
    res.status(404).end();
});
    
app.listen(PORT, () => {
    // console.log(`Server running on port ${PORT}`);
});

module.exports = {pool, app};
