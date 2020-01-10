let DOM = {
    inputType: '.add__type',
    inputDescription: '.add__description',
    inputValue: '.add__value',
    inputBtn: '.add__btn',
    incomeContainer: '.income__list',
    expenseContainer: '.expenses__list',
    budgetLabel: '.budget__value',
    incomeLabel: '.budget__income--value',
    expenseLabel: '.budget__expenses--value',
    percentageLabel: '.budget__expenses--percentage',
    container: '.container',
    expensesPercLabel: '.item__percentage',
    dateLabel: '.budget__title--month'
};

// BUDGET CONTROLLER
let budgetController = (function () {
    class Expense {
        constructor(id, description, value) {
            this.id = id;
            this.description = description;
            this.value = value;
            this.percentage = -1;
        }
    }

    Expense.prototype.calculatePercentage = function(totalIncome) {
        if (totalIncome > 0 )
            this.percentage = Math.round((this.value / totalIncome) * 100);
        else
            this.percentage = -1;
    };

    Expense.prototype.getPercentage = function() {
        return this.percentage;
    };

    class Income {
        constructor(id, description, value) {
            this.id = id;
            this.description = description;
            this.value = value;
        }
    }

    // Calculates total for expense or income
    let calculateTotal = function(type) {
        let sum = 0;
        data.allItems[type].forEach(function(item) {
            sum += item.value;
        });
        data.totals[type] = sum;
    }

    let data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1
    };

    return {
        addItem: function(type, desc, val) {
            // Variable to store new item
            let newItem;
            // Create next available id value
            if (data.allItems[type].length > 0) {
                id = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else {
                id = 0;
            }

            // Assign newItem as expense or income based on type
            if (type === 'exp') {
                newItem = new Expense(id, desc, val);
            } else {
                newItem = new Income(id, desc, val);
            }          
            
            // Push new item onto the appropriate array
            data.allItems[type].push(newItem);
            return newItem;            
        },

        deleteItem: function(type, id) {
            let ids = data.allItems[type].map(function(current) {
                return current.id;
            });
            let index = ids.indexOf(id);
            if (index !== -1) {
                data.allItems[type].splice(index, 1);
            }
        },

        calculateBudget: function() {
            // Calculate total expenses and incomes
            calculateTotal('exp');
            calculateTotal('inc');

            // Calculate budget and percentage
            data.budget = data.totals.inc - data.totals.exp;
            // Only calculate if there is income
            if (data.totals.inc > 0) 
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            else
                data.percentage = -1;
        },

        calculatePercentages: function() {
            data.allItems.exp.forEach(function(current) {
                current.calculatePercentage(data.totals.inc);
            });
        },

        getPercentages: function() {
            let allPercentages = data.allItems.exp.map(function(current) {
                return current.getPercentage();
            });
            return allPercentages;
        },

        getBudget: function() {
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            };
        }        
    };
})();

// UI CONTROLLER
let UIController = (function() {
    let formatNumber = function(num, type) {
        num = Math.abs(num);
        num = num.toFixed(2);

        numSplit = num.split('.');
        let int = numSplit[0];
        if (int.length > 3) {
            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3);
        }
        let dec = numSplit[1];
        return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;
    }
    
    return {
        getInput: function() {
            // Returns an object containing type, description, and value
            return {
                // type gets 'inc' for income or 'exp' for expense
                type: document.querySelector(DOM.inputType).value,
                description: document.querySelector(DOM.inputDescription).value,
                value: parseFloat(document.querySelector(DOM.inputValue).value)
            };
        },

        addListItem: function(obj, type) {
            let html, element;

            // Placeholder text for income or expense
            if (type === 'inc') {
                element = DOM.incomeContainer;
                html = `<div class="item clearfix" id="inc-${obj.id}">
                        <div class="item__description">${obj.description}</div>
                        <div class="right clearfix">
                        <div class="item__value">${formatNumber(obj.value, type)}</div>
                        <div class="item__delete">
                        <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>
                        </div></div></div>`;
            } else if (type === 'exp') {
                element = DOM.expenseContainer;
                html = `<div class="item clearfix" id="exp-${obj.id}">
                        <div class="item__description">${obj.description}</div>
                        <div class="right clearfix">
                        <div class="item__value">${formatNumber(obj.value, type)}</div>
                        <div class="item__percentage">21%</div>
                        <div class="item__delete">
                        <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>
                        </div></div></div>`;
            }         
            // Insert the HTML for the income / expense
            document.querySelector(element).insertAdjacentHTML('beforeend', html);            
        },

        deleteListItem: function(selectorId) {
            let deleteElement = document.getElementById(selectorId);
            deleteElement.parentNode.removeChild(deleteElement);
        },

        // Clears the fields and resets focus on description for new entry
        clearFields: function() {
            document.querySelector(DOM.inputDescription).value = "";
            document.querySelector(DOM.inputValue).value = "";
            document.querySelector(DOM.inputDescription).focus();
        },

        // Update UI values
        displayBudget: function(obj) {
            let type = obj.budget > 0 ? 'inc' : 'exp';
            
            document.querySelector(DOM.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOM.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
            document.querySelector(DOM.expenseLabel).textContent = formatNumber(obj.totalExp, 'exp');
            // Only display percentage if it is not 0
            if (obj.percentage > 0)
                document.querySelector(DOM.percentageLabel).textContent = obj.percentage + '%';
            else
                document.querySelector(DOM.percentageLabel).textContent = '---';
        },

        displayPercentages: function(percentages) {
            var fields = document.querySelectorAll(DOM.expensesPercLabel);
            let nodeListForEach = function(list, callback) {
                for (let i = 0; i < list.length; i++) {
                    callback(list[i], i);
                }
            };

            nodeListForEach(fields, function(current, index) {
                if (percentages[index] > 0)
                    current.textContent = percentages[index] + '%';
                else
                    current.textContent = '---';
            });

        },

        displayDate: function() {
            let now = new Date();
            let month = now.getMonth()
            let months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
            let year = now.getFullYear();
            document.querySelector(DOM.dateLabel).textContent = months[month] + ' ' + year;
        },
    }
})();

// GLOBAL APP CONTROLLER
let controller = (function(budgetCtrl, UICtrl) {
    let setupEventListeners = function() {
        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);

        // Add event listener to trigger on ENTER key press (ENTER is keyCode 13)
        document.addEventListener('keypress', function(event) {
            if (event.keyCode === 13) {
                ctrlAddItem();
            }
        });      

        // Sets up button for each item to delete item
        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
    }

    let updateBudget = function() {
        // Calculate the budget
        budgetCtrl.calculateBudget();

        // Return budget values
        let budget = budgetCtrl.getBudget();
        UICtrl.displayBudget(budget);

        // Update the percentages
        updatePercentages();
    };

    let updatePercentages = function() {
        budgetCtrl.calculatePercentages();
        let percentages = budgetCtrl.getPercentages();
        UICtrl.displayPercentages(percentages);
    }

    // ctrlAddItem is invoked if add button is clicked or enter pressed
    // Adds an item entry 
    let ctrlAddItem = function() {
        // Get field input data and store into input object
        let input = UICtrl.getInput();

        // Validate input and process if is correct
        if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
            // Add item to budget controller using input object
            let newItem = budgetCtrl.addItem(input.type, input.description, input.value);

            // Add the item to the UI and then clear the fields
            UICtrl.addListItem(newItem, input.type);
            UICtrl.clearFields();
            
            // Calculate the budget
            updateBudget();
        }
    };

    // Gets ID of item clicked and deletes the parentNode 4 parents above the button
    let ctrlDeleteItem = function(event) {
        // Get id of div node that contains the item we want to delete 
        let itemId = event.target.parentNode.parentNode.parentNode.parentNode.id;
        
        // Only take action if the itemId selected exists
        if (itemId) {
            // Split the class id into vars to adjust calculations
            let splitId = itemId.split('-');
            let type = splitId[0];              // Expense or Income
            let id = parseInt(splitId[1]);      // Id to delete
            
            // Delete the item from the array and UI, then update budget totals
            budgetCtrl.deleteItem(type, id);
            UICtrl.deleteListItem(itemId);
            updateBudget();
        }
    }

    // Initalization function
    return {
        init: function() {
            console.log('Application has started.');
            
            // Initalize the default values to display
            let budget = budgetCtrl.getBudget();
            UICtrl.displayBudget(budget);

            // Setup UI to show current month
            UICtrl.displayDate();
            
            // Initalize buttons and keypresses
            setupEventListeners();

            
        }
    }

}) (budgetController, UIController);

controller.init();
