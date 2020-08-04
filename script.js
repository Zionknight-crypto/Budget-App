  ////////////////////////////7
  /*
// Budget Controller
 */
  ////////////////////////////7

  const budgetController = (function() {
      let Expense = function(id, description, value) { // function constructor for expense objects eg let exp = new Expense(1,'test', 100)
          this.id = id;
          this.description = description;
          this.value = value;
          this.percentage = -1;
      };

      Expense.prototype.calcPercentage = function(totalIncome) {
          if (totalIncome > 0) {
              this.percentage = Math.round((this.value / totalIncome) * 100);
          } else {
              this.percentage = -1;
          }
      };

      Expense.prototype.getPercentage = function() {
          return this.percentage;
      };

      let Income = function(id, description, value) { // function constructor for income objects
          this.id = id;
          this.description = description;
          this.value = value;
      };

      let calculateTotal = function(type) {
          let sum = 0;
          data.allItems[type].forEach(function(cur) {
              sum += cur.value;
          });
          data.totals[type] = sum;
          /*
          0
          [200,400,100]
          sum = 0 + 200
          sum = 200 + 400 
          sum = 600 + 100 = 700
          */
      };

      let data = { // Data structure to receive data
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
          addItem: function(type, des, val) {
              let newItem,
                  ID;
              // ID = last ID + 1   
              // create new ID
              // accessing the object, key and value (array) then the length of the array and last index.  
              if (data.allItems[type].length > 0) {
                  ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
              } else {
                  ID = 0;
              };
              // Create new item based on 'inc' or 'exp' type
              if (type === 'exp') {
                  newItem = new Expense(ID, des, val);
              } else if (type === 'inc') {
                  newItem = new Income(ID, des, val);
              };
              // Push it into the data structure
              data.allItems[type].push(newItem);
              // Return the new element
              return newItem;
          },

          deleteItem: function(type, id) {
              let ids, index;
              // id = 3
              // data.allItems[type][id];
              // [1 2 4 6 8]
              // index = 3
              ids = data.allItems[type].map(function(current) {
                  return current.id;
              });
              index = ids.indexOf(id); // retreaving the index of the element we want to remove

              if (index !== -1) {
                  data.allItems[type].splice(index, 1);
              }
          },
          calculateBudget: function() {
              // calculate total income and expenses
              calculateTotal('exp');
              calculateTotal('inc');
              // calculate the budget: income - expenses
              data.budget = data.totals.inc - data.totals.exp;
              // calculate the % of income that we spent
              if (data.totals.inc > 0) {
                  data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
                  // Expense = 100 and income of 200, spent 50% = 100/200 = 0.5 * 100
              } else {
                  data.percentage = -1;
              };
          },
          calculatePercentages: function() {
              data.allItems.exp.forEach(function(current) {
                  current.calcPercentage(data.totals.inc);
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
              }
          },
          testing: function() {
              console.log(data);
          }
      };
  })();

  ////////////////////////////7
  /*
// UI Controller
 */
  ////////////////////////////7

  const UIController = (function() {
      let DOMstrings = { // Here I saved the class strings all together so they can easily be modified in case.
          inputType: '.add__type',
          inputDescription: '.add__description',
          inputValue: '.add__value',
          inputBtn: '.add__btn',
          incomeContainer: '.income__list',
          expensesContainer: '.expenses__list',
          budgetLabel: '.budget__value',
          incomeLabel: '.budget__income--value',
          expensesLabel: '.budget__expenses--value',
          percentageLabel: '.budget__expenses--percentage',
          container: '.container',
          expensesPercLabel: '.item__percentage',
          dateLabel: '.budget__title--month'
      };

      let formatNumber = function(num, type) {
          let numSplit, int, dec;
          num = Math.abs(num);
          num = num.toFixed(2); // method of number prototype always puts 2 decimal places.

          numSplit = num.split('.');

          int = numSplit[0];
          if (int.length > 3) {
              int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3); // input 2310, output 2,310
          }
          dec = numSplit[1];

          return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;
          /* 
          + or - before number
          exactly 2 decimal points
          comma separating the thousands
          2310.4567 -> + 2, 310.46
          2000 -> 2000.00
          */
      };
      let nodeListForEach = function(list, callback) {
          for (let i = 0; i < list.length; i++) {
              callback(list[i], i);
          };
      };
      return {
          getinput: function() {
              return { // return all these values into an object
                  type: document.querySelector(DOMstrings.inputType).value, // Inside the type class, there were two selectors inc and exp 
                  description: document.querySelector(DOMstrings.inputDescription).value, // Will be a description of the input 
                  value: parseFloat(document.querySelector(DOMstrings.inputValue).value) // will be the number value of the input 
              };
          },
          addListItem: function(obj, type) {
              let html, newHTML, element;
              // create an html string with placeholder text
              if (type === 'inc') {
                  element = DOMstrings.incomeContainer;
                  html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
              } else if (type === 'exp') {
                  element = DOMstrings.expensesContainer;
                  html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21 %</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
              }
              // replace placeholder text with actua data from object
              newHTML = html.replace('%id%', obj.id);
              newHTML = newHTML.replace('%description%', obj.description);
              newHTML = newHTML.replace('%value%', formatNumber(obj.value, type));

              // Insert HTML into the DOM
              document.querySelector(element).insertAdjacentHTML('beforeend', newHTML);
          },

          deleteListItem: function(selectorID) {
              let el = document.getElementById(selectorID);
              el.parentNode.removeChild(el);
          },

          clearFields: function() {
              let fields, fieldsArr;
              fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue);
              fieldsArr = Array.prototype.slice.call(fields);
              // tricking the slice method into thinking that it is receiving an array and then making a copy of it.
              fieldsArr.forEach(function(current, index, array) {
                  current.value = '';
              });
              fieldsArr[0].focus(); // returns focus to input field!!
          },

          displayBudget: function(obj) {

              obj.budget > 0 ? type = 'inc' : type = 'exp';

              document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
              document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
              document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.totalExp, 'exp');

              if (obj.percentage > 0) {
                  document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
              } else {
                  document.querySelector(DOMstrings.percentageLabel).textContent = '---';
              }
          },

          displayPercentages: function(percentages) {

              let fields = document.querySelectorAll(DOMstrings.expensesPercLabel);

              nodeListForEach(fields, function(current, index) {
                  if (percentages[index] > 0) {
                      current.textContent = percentages[index] + '%';
                  } else {
                      current.textContent = '---';
                  };
              });
          },

          displayMonth: function() {
              let now, year, month, months;

              now = new Date();
              months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
              month = now.getMonth();
              year = now.getFullYear();
              document.querySelector(DOMstrings.dateLabel).textContent = months[month] + ' ' + year;
              // budget__title--month
          },

          changedType: function() {
              let fields = document.querySelectorAll(DOMstrings.inputType + ',' + DOMstrings.inputDescription + ',' + DOMstrings.inputValue);

              nodeListForEach(fields, function(cur) {
                  cur.classList.toggle('red-focus');
              });
              document.querySelector(DOMstrings.inputBtn).classList.toggle('red');
          },

          getDOMstrings: function() {
              return DOMstrings;
          }
      };
  })();

  /////////////////////////////
  /*
  // Global App Controller
  */
  /////////////////////////////

  const controller = (function(budgetCtrl, UICtrl) {
      let setupEventListeners = function() {
          let DOM = UICtrl.getDOMstrings();
          document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);
          document.addEventListener('keypress', function(event) {
              if (event.keyCode === 13 || event.which === 13) {
                  ctrlAddItem();
              }
          });
          document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
          document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);
      };

      let updatePercentages = function() {

          // Calculate the %
          budgetCtrl.calculatePercentages();
          // Read them from the budget controller
          let percentages = budgetCtrl.getPercentages();
          // update the UI
          UICtrl.displayPercentages(percentages);
      };

      let updateBudget = function() {
          // 1. Calculate the budget
          budgetCtrl.calculateBudget();
          // 2. Return the budget
          let budget = budgetCtrl.getBudget();
          // 3. Display the budget on the UI
          UICtrl.displayBudget(budget);
      };

      let ctrlAddItem = function() {
          let input, newItem;
          // 1. Get the filed input data
          input = UICtrl.getinput();
          if (input.description !== '' && !isNaN(input.value) && input.value > 0) {
              // checking if not a number, an empty string and 0 then if not will execute code.
              // 2. Add the item to the budget controller
              newItem = budgetCtrl.addItem(input.type, input.description, input.value);
              // 3. Add the new item to the UI
              UICtrl.addListItem(newItem, input.type);
              // 4. clear the fields
              UIController.clearFields();
              // 5. Calculate and update budget
              updateBudget();
              // 6. Calculate and update %
              updatePercentages();
          };
      };

      let ctrlDeleteItem = function(event) { // we only want things to happen if the ID is defined. It is only defined in the created DIVs
          let itemID, type, ID, splitID;
          itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
          if (itemID) {
              splitID = itemID.split('-'); // inc-1
              type = splitID[0];
              ID = parseInt(splitID[1]);
              // 1. delete the item from the datastructure
              budgetCtrl.deleteItem(type, ID);
              // 2. Delete the item from the UI
              UICtrl.deleteListItem(itemID);
              // 3. Update and show the new budget
              updateBudget();
              // 4. Calculate and update %
              updatePercentages();
          }
      };

      return {
          init: function() {
              UICtrl.displayMonth();
              UICtrl.displayBudget({
                  budget: 0,
                  totalInc: 0,
                  totalExp: 0,
                  percentage: -1
              });
              setupEventListeners();
          }
      };
  })(budgetController, UIController);
  controller.init(); // master controller method for eventlisteners