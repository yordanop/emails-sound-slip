// import and require inquirer
const inquirer = require("inquirer");

const questions = [
    {
        type: "list",
        name: "options", 
        message: "What would you like to do?",
        choices: ['View all departments', 'View all Roles', 'View all employees',  'Add department', 'Add role', 'Add an employee', 'Update an employee role', 'Quit']
    }
];


    // Create a function to initialize app
function init() {
    
    
    // First inquirer will make the questions to perform the selected option
    inquirer.prompt(questions).then((answer) => {

        let keepAsking = true ? answer.options !== 'Quit' : false;

        if(keepAsking){
            console.log(answer.options);
            init();
        }
        
    });

};


// Function call to initialize app
init();