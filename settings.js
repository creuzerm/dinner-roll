document.addEventListener('DOMContentLoaded', async () => {
    let mealData = await getMealData();
    const settingsContainer = document.getElementById('settings-container');
    const categorySettingsContainer = document.getElementById('category-settings-container');
    const saveBtn = document.getElementById('save-settings-btn');
    const addItemBtn = document.getElementById('add-item-btn');
    const newItemNameInput = document.getElementById('new-item-name');
    const newItemWeightInput = document.getElementById('new-item-weight');
    const newItemCategorySelect = document.getElementById('new-item-category');

    function renderCategorySettings() {
        categorySettingsContainer.innerHTML = '';
        const categorySettings = getCategorySettings();

        mealData.mainProtein.forEach(protein => {
            const label = document.createElement('label');
            label.className = 'flex items-center space-x-2 p-2 rounded-lg hover:bg-stone-200 transition-colors';

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.className = 'h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded';
            checkbox.dataset.categoryName = protein.name;
            checkbox.checked = categorySettings[protein.name] !== undefined ? categorySettings[protein.name] : protein.enabledByDefault;

            const span = document.createElement('span');
            span.textContent = protein.name;

            label.appendChild(checkbox);
            label.appendChild(span);
            categorySettingsContainer.appendChild(label);
        });
    }

    function getCategorySettings() {
        const storedSettings = localStorage.getItem('categorySettings');
        return storedSettings ? JSON.parse(storedSettings) : {};
    }

    function saveCategorySettings() {
        const checkboxes = categorySettingsContainer.querySelectorAll('input[type="checkbox"]');
        const newSettings = {};
        checkboxes.forEach(checkbox => {
            newSettings[checkbox.dataset.categoryName] = checkbox.checked;
        });
        localStorage.setItem('categorySettings', JSON.stringify(newSettings));
    }

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
        row.dataset.itemRow = 'true';
        row.dataset.category = category;
        row.dataset.index = index;
        if (subCategory) {
            row.dataset.subCategory = subCategory;
        }

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

    function populateCategorySelect() {
        for (const category in mealData) {
            if (Array.isArray(mealData[category])) {
                const option = document.createElement('option');
                option.value = category;
                option.textContent = formatCategoryName(category);
                newItemCategorySelect.appendChild(option);
            } else {
                for (const subCategory in mealData[category]) {
                    const option = document.createElement('option');
                    option.value = `${category}.${subCategory}`;
                    option.textContent = `${formatCategoryName(category)} - ${subCategory}`;
                    newItemCategorySelect.appendChild(option);
                }
            }
        }
    }

    function saveSettings() {
        saveCategorySettings();
        const itemRows = document.querySelectorAll('[data-item-row]');

        itemRows.forEach(row => {
            const { category, index, subCategory } = row.dataset;
            const nameInput = row.querySelector('input[type="text"]');
            const weightInput = row.querySelector('input[type="number"]');
            const inStockCheckbox = row.querySelector('input[type="checkbox"]');

            const updatedItem = {
                name: nameInput.value,
                weight: parseInt(weightInput.value, 10),
                inStock: inStockCheckbox.checked
            };

            if (subCategory) {
                mealData[category][subCategory][index] = updatedItem;
            } else {
                mealData[category][index] = updatedItem;
            }
        });

        saveMealData(mealData);
        alert('Settings saved!');
    }

    function addNewItem() {
        const name = newItemNameInput.value.trim();
        if (!name) {
            alert('Please enter a name for the new item.');
            return;
        }

        const weight = parseInt(newItemWeightInput.value, 10);
        const categoryPath = newItemCategorySelect.value.split('.');
        const category = categoryPath[0];
        const subCategory = categoryPath.length > 1 ? categoryPath[1] : null;

        const newItem = {
            name,
            weight,
            inStock: true
        };

        if (subCategory) {
            mealData[category][subCategory].push(newItem);
        } else {
            mealData[category].push(newItem);
        }

        saveMealData(mealData);
        renderSettings();
        newItemNameInput.value = '';
        newItemWeightInput.value = '10';
    }

    saveBtn.addEventListener('click', saveSettings);
    addItemBtn.addEventListener('click', addNewItem);

    renderCategorySettings();
    populateCategorySelect();
    renderSettings();
});
