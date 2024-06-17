// Import and require needed packages
const express = require('express');
const inquirer = require("inquirer");
const { Pool } = require('pg');
const { Console } = require('console');

const PORT = process.env.PORT || 3001;
const app = express();

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

// questions for the first section
const mainQuestions = [
  {
      type: "list",
      name: "action", 
      message: "What would you like to do?",
      choices: ['View all departments', 'View all Roles', 'View all employees',  'Add department', 'Add role', 'Add an employee', 'Update an employee role', 'Quit']
  }
];




// Default response for any other request (Not Found)
app.use((req, res) => {
  res.status(404).end();
});
  
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
    
// Create a function to initialize app
function init() {
    
  // First inquirer will make the questions to perform the selected option
  inquirer.prompt(mainQuestions).then((options) => {

      let answer = options.action

      let keepAsking = true ? answer !== 'Quit' : false;

      if(keepAsking){

          switch(answer){
              case "View all departments":
                  pool.query('SELECT * FROM department', function (err, {rows}) {
                    pool.release()
                    console.table(rows);
                    });

                    
                  
                  break;
              case "View all Roles":
                  pool.query('SELECT role.id, role.title, department.name as department, role.salary FROM role JOIN department ON role.department_id = department.id', function (err, {rows}) {
                      console.log(rows);
                    });
                  
                  break;
              case "View all employees":
                  pool.query('SELECT COUNT(id) AS total_count FROM favorite_books GROUP BY in_stock', function (err, {rows}) {
                      console.log(rows);
                    });
                  
                  break;
              case "Add department":
                  
                  break;
              case "Add role":
                  
                  break;
              case "Add an employee":
                  
                  break;
              case "Update an employee role":
                  
                  break;
              default:
                  console.log("That's what you want it? You kill this app :(")
                  break;
          }

          init();
      }else{

        pool.end();

      }

      
  });

};

// Function call to initialize app
init();
