// Import and require needed packages

const inquirer = require("inquirer");
const { Console } = require('console');

const pool = require('./server.js');
const { resolve } = require("path");


// questions for the first section
const mainQuestions = [
  {
      type: "list",
      name: "action", 
      message: "What would you like to do?",
      choices: ['View all departments', 'View all Roles', 'View all employees',  'Add department', 'Add role', 'Add an employee', 'Update an employee role', 'Quit']
  }
];

function renderTable(tableRows){
  console.log('\n')
  console.table(tableRows);
}
    
// Create a function to initialize app
function init() {
    
  // First inquirer will make the questions to perform the selected option
  inquirer.prompt(mainQuestions).then((options) => {

      let answer = options.action
      let queryFromAction = '';
      let keepAsking = answer !== 'Quit';

      if(keepAsking){

          switch(answer){
              case "View all departments":

                queryFromAction = 'SELECT * FROM department';
                break;

              case "View all Roles":

                queryFromAction = 'SELECT role.id, role.title, department.name as department, role.salary FROM role JOIN department ON role.department_id = department.id';
                break;

              case "View all employees":

                queryFromAction = 'SELECT * FROM employee JOIN role ON employee.role_id = role.id;';
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

          pool.query(queryFromAction, function (err, {rows}) {
            if(err){
              console.log(err)
            }
            renderTable(rows);
          });


          init();
      }else{
        console.log('Bye');
        pool.end();

      }

      
  });

};

// Function call to initialize app
init();
