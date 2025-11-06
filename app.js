document.addEventListener('DOMContentLoaded', async () => {
    let mealData = await getMealData();
    let filterInStock = false;

    let currentMeal = {
        mainProtein: null,
        cuts: null,
        fatSource: null,
        finisher: null,
        cuisine: null
    };

    const resultElements = {
        mainProtein: document.getElementById('mainProtein-result'),
        cuts: document.getElementById('cuts-result'),
        fatSource: document.getElementById('fatSource-result'),
        finisher: document.getElementById('finisher-result'),
        cuisine: document.getElementById('cuisine-result'),
        summary: document.getElementById('summary-result')
    };

    const placeholderElements = {
        mainProtein: '<span class="dice-placeholder">🥩</span>',
        cuts: '<span class="dice-placeholder">🔪</span>',
        fatSource: '<span class="dice-placeholder">🧈</span>',
        finisher: '<span class="dice-placeholder">🍳</span>',
        cuisine: '<span class="dice-placeholder">🌍</span>',
    }

    const rollAllBtn = document.getElementById('roll-all-btn');
    const resetBtn = document.getElementById('reset-btn');
    const individualRollBtns = document.querySelectorAll('.roll-btn');
    const inStockToggle = document.getElementById('in-stock-toggle');
    const removeCuisineBtn = document.getElementById('remove-cuisine-btn');

    function getCategorySettings() {
        const storedSettings = localStorage.getItem('categorySettings');
        return storedSettings ? JSON.parse(storedSettings) : {};
    }

    function getCuisineSettings() {
        const storedSettings = localStorage.getItem('cuisineSettings');
        return storedSettings ? JSON.parse(storedSettings) : {};
    }

    function getEnabledMainProteins() {
        const categorySettings = getCategorySettings();
        const cuisineSettings = getCuisineSettings();

        const enabledCuisines = Object.keys(cuisineSettings).filter(cuisine => cuisineSettings[cuisine]);

        return mealData.mainProtein.filter(protein => {
            const isCategoryEnabled = categorySettings[protein.name] !== undefined ? categorySettings[protein.name] : protein.enabledByDefault;
            if (!isCategoryEnabled) {
                return false;
            }

            if (enabledCuisines.length > 0) {
                return protein.cuisine && protein.cuisine.some(cuisine => enabledCuisines.includes(cuisine));
            }

            return true;
        });
    }


    function loadSettings() {
        const savedFilterInStock = localStorage.getItem('filterInStock');
        if (savedFilterInStock !== null) {
            filterInStock = savedFilterInStock === 'true';
            inStockToggle.checked = filterInStock;
        }
    }

    function getRandomElement(arr) {
        if (!arr || arr.length === 0) return "N/A";

        let filteredArr = arr;
        if (filterInStock) {
            filteredArr = arr.filter(item => item.inStock);
        }

        if (filteredArr.length === 0) return "N/A";

        const totalWeight = filteredArr.reduce((sum, item) => sum + item.weight, 0);
        let random = Math.random() * totalWeight;

        for (const item of filteredArr) {
            random -= item.weight;
            if (random < 0) {
                return item.name;
            }
        }

        return filteredArr[filteredArr.length - 1].name;
    }

     function getRandomCuisine(proteinName) {
        const protein = mealData.mainProtein.find(p => p.name === proteinName);
        if (!protein || !protein.cuisine || protein.cuisine.length === 0) {
            return "N/A";
        }
        const randomIndex = Math.floor(Math.random() * protein.cuisine.length);
        return protein.cuisine[randomIndex];
    }

    function rollCategory(categoryName) {
        let result = "";
        let dataList;

        if (categoryName === 'mainProtein') {
            dataList = getEnabledMainProteins();
            if (dataList.length === 0) {
                result = "No proteins match!";
            } else {
                result = getRandomElement(dataList);
            }
        } else if (categoryName === 'cuts') {
            if (!currentMeal.mainProtein || currentMeal.mainProtein === "No proteins match!" || currentMeal.mainProtein === "No categories enabled!") {
                rollCategory('mainProtein');
                 if (currentMeal.mainProtein === "No proteins match!" || currentMeal.mainProtein === "No categories enabled!") {
                    result = "N/A";
                    currentMeal.cuts = result;
                    resultElements.cuts.textContent = result;
                    animateRoll(resultElements.cuts);
                    return;
                }
            }
            dataList = mealData.cuts[currentMeal.mainProtein];
            result = getRandomElement(dataList);
        } else if (categoryName === 'cuisine') {
            if (!currentMeal.mainProtein || currentMeal.mainProtein === "No proteins match!" || currentMeal.mainProtein === "No categories enabled!") {
                rollCategory('mainProtein');
                if (currentMeal.mainProtein === "No proteins match!" || currentMeal.mainProtein === "No categories enabled!") {
                    result = "N/A";
                } else {
                    result = getRandomCuisine(currentMeal.mainProtein);
                }
            } else {
                 result = getRandomCuisine(currentMeal.mainProtein);
            }
        } else {
            dataList = mealData[categoryName];
            result = getRandomElement(dataList);
        }

        currentMeal[categoryName] = result;
        resultElements[categoryName].textContent = result;
        animateRoll(resultElements[categoryName]);
    }

    function animateRoll(element) {
        element.classList.add('opacity-0', 'transform', '-translate-y-2');
        setTimeout(() => {
            element.classList.remove('opacity-0', 'transform', '-translate-y-2');
            element.classList.add('transition-all', 'duration-300');
        }, 50);
    }

    function rollAll() {
        rollCategory('mainProtein');
        rollCategory('cuts');
        rollCategory('fatSource');
        rollCategory('finisher');
        rollCategory('cuisine');
        updateSummary();
    }

    function updateSummary() {
        const { mainProtein, cuts, fatSource, finisher, cuisine } = currentMeal;
        if (mainProtein && cuts && fatSource && finisher) {
             if (mainProtein === "No proteins match!" || mainProtein === "No categories enabled!") {
                resultElements.summary.innerHTML = `<p class="text-stone-500">Please check your category and cuisine settings!</p>`;
             } else {
                let summaryText = `You're having <strong class="text-green-800">${cuts}</strong> (from ${mainProtein}) cooked with <strong class="text-green-800">${fatSource}</strong> and finished with <strong class="text-green-800">${finisher}</strong>`;
                if (cuisine && cuisine !== "N/A") {
                    summaryText += `, in a <strong class="text-blue-800">${cuisine}</strong> style`;
                }
                summaryText += ". Enjoy!";
                resultElements.summary.innerHTML = summaryText;
             }
        } else {
             resultElements.summary.innerHTML = '<p class="text-stone-500">Roll all categories to see your meal!</p>';
        }
    }

    function resetAll() {
        currentMeal = {
            mainProtein: null,
            cuts: null,
            fatSource: null,
            finisher: null,
            cuisine: null
        };

        for (const category in resultElements) {
            if (category !== 'summary' && resultElements[category]) {
                 resultElements[category].innerHTML = placeholderElements[category];
            }
        }

        resultElements.summary.innerHTML = '<p class="text-stone-500">Roll the dice to see your meal!</p>';
    }

    rollAllBtn.addEventListener('click', rollAll);
    resetBtn.addEventListener('click', resetAll);

    individualRollBtns.forEach(button => {
        button.addEventListener('click', () => {
            const category = button.getAttribute('data-category');
            rollCategory(category);
            if (category === 'mainProtein') {
                currentMeal.cuts = null;
                resultElements.cuts.innerHTML = placeholderElements.cuts;
                currentMeal.cuisine = null;
                resultElements.cuisine.innerHTML = placeholderElements.cuisine;
            }
            updateSummary();
        });
    });

    removeCuisineBtn.addEventListener('click', () => {
        currentMeal.cuisine = null;
        resultElements.cuisine.innerHTML = placeholderElements.cuisine;
        updateSummary();
    });

    inStockToggle.addEventListener('change', () => {
        filterInStock = inStockToggle.checked;
        localStorage.setItem('filterInStock', filterInStock);
    });

    loadSettings();
});
