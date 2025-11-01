document.addEventListener('DOMContentLoaded', () => {
    let mealData = getMealData();
    const settingsContainer = document.getElementById('settings-container');
    const saveBtn = document.getElementById('save-settings-btn');

    function renderSettings() {
        settingsContainer.innerHTML = '';
        for (const category in mealData) {
            const categoryContainer = document.createElement('div');
            categoryContainer.className = 'mb-6';

            const categoryTitle = document.createElement('h3');
            categoryTitle.className = 'text-xl font-semibold text-stone-800 mb-2';
            categoryTitle.textContent = formatCategoryName(category);
            categoryContainer.appendChild(categoryTitle);

            if (Array.isArray(mealData[category])) {
                mealData[category].forEach((item, index) => {
                    categoryContainer.appendChild(createSettingRow(category, index, item));
                });
            } else {
                for (const subCategory in mealData[category]) {
                    const subCategoryTitle = document.createElement('h4');
                    subCategoryTitle.className = 'text-lg font-semibold text-stone-700 mt-4 mb-2';
                    subCategoryTitle.textContent = subCategory;
                    categoryContainer.appendChild(subCategoryTitle);
                    mealData[category][subCategory].forEach((item, index) => {
                        categoryContainer.appendChild(createSettingRow(category, index, item, subCategory));
                    });
                }
            }
            settingsContainer.appendChild(categoryContainer);
        }
    }

    function createSettingRow(category, index, item, subCategory = null) {
        const row = document.createElement('div');
        row.className = 'flex items-center justify-between p-2 rounded-lg';

        const nameInput = document.createElement('input');
        nameInput.type = 'text';
        nameInput.value = item.name;
        nameInput.className = 'flex-grow p-1 border rounded-md';
        nameInput.dataset.category = category;
        nameInput.dataset.index = index;
        if (subCategory) {
            nameInput.dataset.subCategory = subCategory;
        }

        const weightInput = document.createElement('input');
        weightInput.type = 'number';
        weightInput.value = item.weight;
        weightInput.min = 0;
        weightInput.className = 'w-16 p-1 border rounded-md mx-2';
        weightInput.dataset.category = category;
        weightInput.dataset.index = index;
        if (subCategory) {
            weightInput.dataset.subCategory = subCategory;
        }

        const inStockCheckbox = document.createElement('input');
        inStockCheckbox.type = 'checkbox';
        inStockCheckbox.checked = item.inStock;
        inStockCheckbox.className = 'h-5 w-5 text-green-600 focus:ring-green-500 border-gray-300 rounded';
        inStockCheckbox.dataset.category = category;
        inStockCheckbox.dataset.index = index;
        if (subCategory) {
            inStockCheckbox.dataset.subCategory = subCategory;
        }

        row.appendChild(nameInput);
        row.appendChild(weightInput);
        row.appendChild(inStockCheckbox);

        return row;
    }

    function formatCategoryName(name) {
        return name.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
    }

    function saveSettings() {
        const nameInputs = document.querySelectorAll('input[type="text"]');
        const weightInputs = document.querySelectorAll('input[type="number"]');
        const inStockCheckboxes = document.querySelectorAll('input[type="checkbox"]');

        nameInputs.forEach((input, i) => {
            const { category, index, subCategory } = input.dataset;
            if (subCategory) {
                mealData[category][subCategory][index].name = input.value;
                mealData[category][subCategory][index].weight = parseInt(weightInputs[i].value, 10);
                mealData[category][subCategory][index].inStock = inStockCheckboxes[i].checked;
            } else {
                mealData[category][index].name = input.value;
                mealData[category][index].weight = parseInt(weightInputs[i].value, 10);
                mealData[category][index].inStock = inStockCheckboxes[i].checked;
            }
        });

        saveMealData(mealData);
        alert('Settings saved!');
    }

    saveBtn.addEventListener('click', saveSettings);

    renderSettings();
});