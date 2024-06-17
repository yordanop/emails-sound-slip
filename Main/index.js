// import and require inquirer
const inquirer = require("inquirer");

const questions = [
    {
        type: "list",
        name: "action", 
        message: "What would you like to do?",
        choices: ['View all departments', 'View all Roles', 'View all employees',  'Add department', 'Add role', 'Add an employee', 'Update an employee role', 'Quit']
    }
];


// Create a function to initialize app
function init() {
    
    // First inquirer will make the questions to perform the selected option
    inquirer.prompt(questions).then((options) => {

        let answer = options.action

        let keepAsking = true ? answer !== 'Quit' : false;

        if(keepAsking){

            switch(answer){
                case "View all departments":
                    pool.query('SELECT * FROM department', function (err, {rows}) {
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
        }
        
    });

};


// Function call to initialize app
init();