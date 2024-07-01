// Require needed packages
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

// Function to retrieve Employees as managers from the employee table
const getListEmployees = async () => {
  try {
    const result = await pool.query(`SELECT id, CONCAT(first_name, ' ', last_name) AS employee_name FROM employee`);

    const employeeChoices = result.rows.map(employee => ({
      name: employee.employee_name,
      value: employee.id,
    }));

    return employeeChoices;
  } catch (err) {
    console.error('Error retrieving managers:', err.stack);
    return [];
  }
};

// Function to add None for the managers list to the employees to choose from
const getListManagers = async (employeesList) => {

  try {
    const managers = await getListEmployees();
    managers.push({
      name: 'None',
      value: null,
    });
    return managers;
  } catch (err) {
    console.error('Error retrieving managers:', err.stack);
    return [];
  }

};


// Function to retrieve departments from the departments table
const getListRoles = async () => {
  try {
    const result = await pool.query('SELECT id, title FROM role');
    const roleChoices = result.rows.map(role => ({
      name: role.title,
      value: role.id,
    }));

    return roleChoices;
  } catch (err) {
    console.error('Error retrieving roles:', err.stack);
    return [];
  }
};


// questions for the first section
const mainQuestions = [
  {
      type: "list",
      name: "action", 
      message: "What would you like to do?",
      choices: ['View all departments', 'View all Roles', 'View all employees',  'Add department', 'Add role', 'Add an employee', 'Update an employee role', "Update an employee's manager", "View employees by manager", "View budget by department", 'Quit']
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
  },
  // if "add an employee" option selected, make these quesitons
  {
    when: input => {
      return input.action == 'Add an employee'
    },
    type: "input", 
    name: "employeeFirstName",
    message: "What is the employee's first name?"
  },
  {
    when: input => {
      return input.action == 'Add an employee'
    },
    type: "input", 
    name: "employeeLastName",
    message: "What is the employee's last name?"
  },
  {
    when: input => {
      return input.action == 'Add an employee'
    },
    type: "list", 
    name: "employeeRole",
    message: "What is the employee's role?",
    choices: getListRoles
  },
  {
    when: input => {
      return input.action == 'Add an employee'
    },
    type: "list", 
    name: "employeeManager",
    message: "Who is the employee's manager?",
    choices: getListManagers
  },
  // if "Update an employee role" option selected, make these quesitons
  // or `Update an employee's manager`
  {
    when: input => {
      return ((input.action == 'Update an employee role') || (input.action == "Update an employee's manager"))
    },
    type: "list", 
    name: "employeeChosen",
    message: "Which employee you want to update?",
    choices: getListEmployees
  },
  {
    when: input => {
      return input.action == 'Update an employee role'
    },
    type: "list", 
    name: "roleToChange",
    message: "Which role do you want to assign the selected employee?",
    choices: getListRoles
  },
  {
    when: input => {
      return input.action == "Update an employee's manager"
    },
    type: "list", 
    name: "managerToChange",
    message: "Who is the new employee's manager?",
    choices: getListManagers
  }
];



function actionQuery(sql, params, renderTable){
  pool.query(sql, params, (err, result) => {
    if (err) {
      console.log(err)
      return;
    };

    if (renderTable){

      console.log('\n');
      console.table(result.rows);
      console.log('\n');

    };
});
  
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

                actionQuery(queryFromAction, [], true);

                break;

              case "View all Roles":

                queryFromAction = 'SELECT role.id, role.title, department.name as department, role.salary FROM role JOIN department ON role.department_id = department.id';

                actionQuery(queryFromAction, [], true);

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

                manager_table AS (
                SELECT 
                  id AS manager_id, 
                  CONCAT(first_name, ' ', last_name) AS manager 
                FROM 
                  employee), 

                employee_role AS (
                SELECT 
                  * 
                FROM 
                  employee 
                JOIN 
                  department_roles
                ON 
                  employee.role_id = department_roles.role_id) 

                SELECT 
                  id, first_name, last_name, title, department, salary, manager 
                FROM 
                  employee_role 
                LEFT JOIN 
                  manager_table 
                ON 
                  employee_role.manager_id = manager_table.manager_id;`;

                actionQuery(queryFromAction, [], true);
            
                break;
                
              case "Add department":


                queryFromAction = `INSERT INTO department (name) VALUES ($1)`;
                params = [options.departmentName];

                actionQuery(queryFromAction, params, false);
                  
                break;

              case "Add role":

                queryFromAction = 'INSERT INTO role (title, salary, department_id) VALUES ($1, $2, $3)';

                params = [options.roleName, options.roleSalary, options.roleDepartment];

                actionQuery(queryFromAction, params, false);
                  
                break;

              case "Add an employee":

                queryFromAction = 'INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ($1, $2, $3, $4)';

                params = [options.employeeFirstName, options.employeeLastName, options.employeeRole, options.employeeManager];

                actionQuery(queryFromAction, params, false);
                  
                break;

              case "Update an employee role":

                queryFromAction = 'UPDATE employee SET role_id = $1 WHERE id = $2'

                params = [options.roleToChange, options.employeeChosen]

                actionQuery(queryFromAction, params, false);
                  
                break;

              case "Update an employee's manager":

                queryFromAction = 'UPDATE employee SET manager_id = $1 WHERE id = $2'
  
                params = [options.managerToChange, options.employeeChosen]
  
                actionQuery(queryFromAction, params, false);
                    
                break;

              case "View employees by manager":

                queryFromAction = `With
                manager_table AS (
                SELECT 
                  id AS manager_id, 
                  CONCAT(first_name, ' ', last_name) AS manager 
                FROM 
                  employee), 
                employee_table AS (
                SELECT 
                  id AS employee_id, 
                  CONCAT(first_name, ' ', last_name) AS employee_name , 
                  manager_id
                FROM 
                  employee)
                
                SELECT manager,  ARRAY_AGG(employee_name) AS employees
                FROM 
                  employee_table
                JOIN 
                  manager_table
                ON 
                  employee_table.manager_id = manager_table.manager_id
                GROUP BY 
                  manager_table.manager`

                actionQuery(queryFromAction, [], true);

                break;

              case "View budget by department":

                queryFromAction = `With 
                department_roles AS (
                SELECT 
                  role.id AS role_id, 
                  salary, 
                  department.name AS department 
                FROM 
                  role 
                JOIN 
                  department 
                ON 
                  role.department_id = department.id)


                SELECT 
                  department_roles.department,
                  SUM(department_roles.salary)
                FROM 
                  employee 
                JOIN 
                  department_roles
                ON 
                  employee.role_id = department_roles.role_id
                GROUP BY
                  department_roles.department
                  `

                actionQuery(queryFromAction, [], true);

              default:
                console.log("Error")
                break;
          }
          init();

      }else{

        pool.end();
        console.log('Database connection closed. Exiting the application.');
        process.exit();

      }

      
  });

};

// Function call to initialize app
init();
