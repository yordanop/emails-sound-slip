// Import and require needed packages

const inquirer = require("inquirer");
const { Console } = require('console');

const { pool, app }= require('./server.js');
const { resolve } = require("path");

// Function to retrieve departments from the departments table
const getListDepartments = async () => {
  try {
    const result = await pool.query('SELECT id, name FROM department');
    const departments = result.rows;
    const departmentChoices = departments.map(dept => ({
      name: dept.name,
      value: dept.id,
    }));

    return departmentChoices;
  } catch (err) {
    console.error('Error retrieving departments:', err.stack);
    return [];
  }
};


// questions for the first section
const mainQuestions = [
  {
      type: "list",
      name: "action", 
      message: "What would you like to do?",
      choices: ['View all departments', 'View all Roles', 'View all employees',  'Add department', 'Add role', 'Add an employee', 'Update an employee role', 'Quit']
  },
  {
    // if "add department" option selected, make this quesiton
    when: input => {
      return input.action == 'Add department'
    },
    type: "input", 
    name: "departmentName",
    message: "What is the name of the department?"
  },
  // if "add role" option selected, make these quesitons
  {
    when: input => {
      return input.action == 'Add role'
    },
    type: "input", 
    name: "roleName",
    message: "What is the name of the role?"
  },
  {
    when: input => {
      return input.action == 'Add role'
    },
    type: "input", 
    name: "roleSalary",
    message: "What is the salary of the role?"
  },
  {
    when: input => {
      return input.action == 'Add role'
    },
    type: "list", 
    name: "roleDepartment",
    message: "Which department does the role belong to?",
    choices: getListDepartments
  }
];



function renderTable(tableRows){
  console.log('\n')
  console.table(tableRows);
}
    
// Create a function to initialize app
function init() {
    
  // First inquirer will make the questions to perform a query depending on the selected option
  inquirer.prompt(mainQuestions).then((options) => {
    

      let answer = options.action
      let queryFromAction = '';
      let params = []
      let keepAsking = answer !== 'Quit';

      if(keepAsking){

          switch(answer){
              case "View all departments":

                queryFromAction = 'SELECT * FROM department';

                pool.query(queryFromAction, function (err, {rows}) {
                  if(err){
                    res.status(500).json({ error: err.message });
                    return;
                  }
                  renderTable(rows);
                });

                break;

              case "View all Roles":

                queryFromAction = 'SELECT role.id, role.title, department.name as department, role.salary FROM role JOIN department ON role.department_id = department.id';

                pool.query(queryFromAction, function (err, {rows}) {
                  if(err){
                    res.status(500).json({ error: err.message });
                    return;
                  }
                  renderTable(rows);
                });

                break;

                
              case "View all employees":
                queryFromAction =  `With 
                department_roles AS (
                SELECT 
                  role.id AS role_id, 
                  title, 
                  salary, 
                  department.name AS department 
                FROM 
                  role 
                JOIN 
                  department 
                ON 
                  role.department_id = department.id), 

                manager_table as (
                SELECT 
                  id as manager_id, 
                  CONCAT(first_name, ' ', last_name) AS manager 
                FROM 
                  employee), 

                employee_role as (
                SELECT 
                  * 
                FROM 
                  employee 
                JOIN 
                  department_roles
                ON 
                  employee.role_id = department_roles.role_id) 

                SELECT id, first_name, last_name, title, department, salary, manager FROM employee_role LEFT JOIN manager_table ON employee_role.manager_id = manager_table.manager_id;`;

                pool.query(queryFromAction, function (err, {rows}) {
                  if(err){
                    console.log(err)
                    return;
                  }
                  renderTable(rows);
                });
            
                break;
                
              case "Add department":


                queryFromAction = `INSERT INTO department (name) VALUES ($1)`;
                params = [options.departmentName];

                pool.query(queryFromAction, params, (err, result) => {
                  if (err) {
                    console.log(err)
                    return;
                  }
              
                });
                  
                  break;
              case "Add role":
              queryFromAction = 'INSERT INTO role (title, salary, department_id) VALUES ($1, $2, $3)';
              params = [options.roleName, options.roleSalary, options.roleDepartment];

              pool.query(queryFromAction, params, (err, result) => {
                if (err) {
                  console.log(err)
                  return;
                }
            
              });
                  
                  break;
              case "Add an employee":
                  
                  break;
              case "Update an employee role":
                  
                  break;
              default:
                  console.log("Error")
                  break;
          }

          

          init();
      }else{
        console.log('Bye');
        pool.end();

      }

      
  });

};

// Function call to initialize app
init();
