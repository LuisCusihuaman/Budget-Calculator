const ENTER = 13;
const DOES_NOT_EXITS = -1;

//BUDGET CONTROLLER // MODEL/LOGIC CONTROLLER
var budgetController = (function() {

	var Expense = function(id, description, value) {
		this.id = id;
		this.description = description;
		this.value = value;
		this.percentage = -1;
	};

	Expense.prototype.calcPercentage = function(totalIncome){
		this.percentage = totalIncome > 0 ? Math.round((this.value / totalIncome) * 100) : DOES_NOT_EXITS;
	};
	Expense.prototype.getPercentage = function(){
		return this.percentage;
	}
	var Income = function(id, description, value) {
		this.id = id;
		this.description = description;
		this.value = value;
	};
	var data = {
		allItems: {
			exp: [],
			inc: []
		},
		totals: {
			exp: 0,
			inc: 0
		},
		budget: 0,
		percentage: DOES_NOT_EXITS
	};

	var calculateTotal = function(type){
		var sum = 0;
		data.allItems[type].forEach(function(current){
			sum += current.value;
		})
		data.totals[type] = sum;
	}

	return {
		addItem: function(typeItem, descriptionItem, valueItem) {
			var newItem, ID, lastItemIndex, selectedItem;
			lastItemIndex = data.allItems[typeItem].length - 1;
			selectedItem = data.allItems[typeItem];

			//Create new Id
			ID = 0;
			if (selectedItem.length > 0)
				ID = selectedItem[lastItemIndex].id + 1;

			//Create new item based on "inc" or "exp" type
			if (typeItem === "exp") {
				newItem = new Expense(ID, descriptionItem, valueItem);
			} else if (typeItem === "inc") {
				newItem = new Income(ID, descriptionItem, valueItem);
			}
			selectedItem.push(newItem);
			return newItem;
		},
		
		calculateBudget: function(){
			//calculate total income and expenses
			calculateTotal("exp");
			calculateTotal("inc");
			//calculate the budget: income-expenses
			data.budget = data.totals.inc - data.totals.exp;
			//calculate the percentage of income that we spent
			data.percentage = data.totals.inc > 0 ? Math.round((data.totals.exp / data.totals.inc) * 100) : DOES_NOT_EXITS;
		},
		getBudget: function(){
			return {
				budget: data.budget,
				totalInc: data.totals.inc,
				totalExp: data.totals.exp,
				percentage: data.percentage
			}
		},

		deleteItem: function(type,id) {
			var ids,index;
			var x = data.allItems
			ids = data.allItems[type].map((current) => current.id);
			index = ids.indexOf(id);
			if(index !== -1){
				data.allItems[type].splice(index,1);
			}
		},
		calculatePercentages : function(){
			data.allItems.exp.forEach(function(cur){
				current.calcPercentage(data.totals.inc);
			})
		},
		getPercentages: function(){
			var allPerc = data.allItems.exp.map(function(cur){
				return cur.getPercentage();
			})
			return allPerc;
		}
	};
})();

//UI CONTROLLER
var UIController = (function() {
	
	var DOMstrings = {
		inputType: ".add__type",
		inputDescription: ".add__description",
		inputValue: ".add__value",
		inputBtn: ".add__btn",
		incomeContainer: ".income__list",
		expensesContainer: ".expenses__list",
		budgetLabel: ".budget__value",
		incomeLabel: ".budget__income--value",
		expensesLabel: ".budget__expenses--value",
		percentageLabel: ".budget__expenses--percentage",
		container: ".container",
		expensesPercLabel: ".item__percentage",
		dateLabel: ".budget__title--month"
	};

	return {
		getInput: function() {
			return {
				type: document.querySelector(DOMstrings.inputType).value,
				description: document.querySelector(DOMstrings.inputDescription)
					.value,
				value: parseFloat(
					document.querySelector(DOMstrings.inputValue).value
				)
			};
		},
		getDOMstrings: function() {
			return DOMstrings;
		},
		addListItem: function(object, type) {
			//Create HTML string with placeholder text
			var html, element;

			if (type === "inc") {
				element = DOMstrings.incomeContainer;
				html =
					'<div class="item clearfix" id="income-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
			} else if (type === "exp") {
				element = DOMstrings.expensesContainer;
				html =
					'<div class="item clearfix" id="expense%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">10%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></button></div></div></div>';
			}

			//Replace the placeholder text with some actual data
			newHtml = html.replace("%id%", object.id);
			newHtml = newHtml.replace("%description%", object.description);
			newHtml = newHtml.replace("%value%", object.value);

			//insert the HTML into the DOM
			document
				.querySelector(element)
				.insertAdjacentHTML("beforeend", newHtml);
		},
		deleteListItem: function(selectorID) {
			var el = document.getElementById(selectorID);
			el.parentNode.removeChild(el);
		},
		displayBudget: function(object) {
			document.querySelector(DOMstrings.budgetLabel).textContent =object.budget;
			document.querySelector(DOMstrings.incomeLabel).textContent =object.totalInc;
			document.querySelector(DOMstrings.expensesLabel).textContent =object.totalExp;
			if (object.percentage > 0) {
				document.querySelector(DOMstrings.percentageLabel).textContent = object.percentage + " %";
			} else {
				document.querySelector(DOMstrings.percentageLabel).textContent = "---";
			}
		},
		displayPercentages: function(percentages) {
			var fields = document.querySelectorAll(DOMString.expensesPercLabel);
			var nodeListForEach = function(list, callback) {
				for (let index = 0; index < list.length; index++) {
					callback(list[index], index);
				}
				nodeListForEach(fields, function(current, index) {
					current.textContent = percentages[index] + (percentages[index]>0 ? "%":"---");
				});
			};
		},
		clearFilds: function() {
			var fields;
			fields = document.querySelectorAll(
				DOMstrings.inputDescription + ", " + DOMstrings.inputValue
			);
			fieldsArr = Array.prototype.slice.call(fields);
			fieldsArr.forEach(function(current, index, array) {
				current.value = "";
			});
			fieldsArr[0].focus();
		},
		displayMonth: function() {
			var now, months, month, year;
            
            now = new Date();
            months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            month = now.getMonth();
            
            year = now.getFullYear();
            document.querySelector(DOMstrings.dateLabel).textContent = months[month] + ' ' + year;
		}
	};
})();

//GLOBAL APP CONTROLLER
var controller = (function(budgetCtrl, UICtrl) {

	var DOM = UICtrl.getDOMstrings();
	var ctrlDeleteItem = function (event) {
		var itemID, splitID, type, ID;
		itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
		if(itemID != null){
			splitID = itemID.split("-");
			type = splitID[0].slice(0,3);
			ID = parseInt(splitID[1]);
			//delete item from the structure
			budgetCtrl.deleteItem(type,ID);
			//delete item from ui
			UICtrl.deleteListItem(itemID);
			//Update and show the new budget
			updateBudget();
			//Calculate and update percentages
			updatePercentages();
		}

	};
	var inputIsValid = function(input) {
		return (
			input.description !== "" && !isNaN(input.value) && input.value > 0
		);
	};
	var ctrlAddItem = function() {
		var input, newItem;
		//1. Get the filed input data
		input = UICtrl.getInput();

		if (inputIsValid(input)) {
			//2. Add the item to the budget controller
			newItem = budgetCtrl.addItem(input.type,input.description,input.value);
			//3. Add the item to the UI
			UICtrl.addListItem(newItem, input.type);
			//4.Clean Fields
			UICtrl.clearFilds();
			//5. Calculate and update the budget
			updateBudget();
			//6. Display the budget on the UI
		}
	};
	var setupEventListeners = function() {
		document.querySelector(DOM.inputBtn).addEventListener("click", ctrlAddItem);
		document.addEventListener("keypress", function(event) {
			if (event.keyCode === ENTER || event.which === ENTER) {
				ctrlAddItem();
			}
		});
		document.querySelector(DOM.container).addEventListener("click",ctrlDeleteItem);
	};
	var updateBudget = function() {
		//1. Calculate the budget
		budgetCtrl.calculateBudget();
		//2. Return the budget
		var budget = budgetCtrl.getBudget();
		//3. Display the budget on the UI
		UICtrl.displayBudget(budget);
	};
	var updatePercentages = function(){
		budgetCtrl.calculatePercentages();
		var percentages = budgetCtrl.getPercentages();
		UICtrl.displayPercentages(percentages);
	}

	return {
		init: function() {
			console.log("App has started");
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

controller.init();
