document.addEventListener('DOMContentLoaded', () => {
    let mealData = getMealData();
    let filterInStock = false;

    let currentMeal = {
        mainProtein: null,
        cuts: null,
        fatSource: null,
        finisher: null
    };

    const resultElements = {
        mainProtein: document.getElementById('mainProtein-result'),
        cuts: document.getElementById('cuts-result'),
        fatSource: document.getElementById('fatSource-result'),
        finisher: document.getElementById('finisher-result'),
        summary: document.getElementById('summary-result')
    };

    const placeholderElements = {
        mainProtein: '<span class="dice-placeholder">🥩</span>',
        cuts: '<span class="dice-placeholder">🔪</span>',
        fatSource: '<span class="dice-placeholder">🧈</span>',
        finisher: '<span class="dice-placeholder">🍳</span>',
    }

    const rollAllBtn = document.getElementById('roll-all-btn');
    const resetBtn = document.getElementById('reset-btn');
    const individualRollBtns = document.querySelectorAll('.roll-btn');
    const inStockToggle = document.getElementById('in-stock-toggle');

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

    function rollCategory(categoryName) {
        let result = "";
        let dataList;

        if (categoryName === 'cuts') {
            if (!currentMeal.mainProtein) {
                rollCategory('mainProtein');
            }
            dataList = mealData.cuts[currentMeal.mainProtein];
        } else {
            dataList = mealData[categoryName];
        }

        result = getRandomElement(dataList);
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
        updateSummary();
    }

    function updateSummary() {
        const { mainProtein, cuts, fatSource, finisher } = currentMeal;
        if (mainProtein && cuts && fatSource && finisher) {
            resultElements.summary.innerHTML = `You're having <strong class="text-green-800">${cuts}</strong> (from ${mainProtein}) cooked with <strong class="text-green-800">${fatSource}</strong> and finished with <strong class="text-green-800">${finisher}</strong>. Enjoy!`;
        } else {
             resultElements.summary.innerHTML = '<p class="text-stone-500">Roll all categories to see your meal!</p>';
        }
    }

    function resetAll() {
        currentMeal = {
            mainProtein: null,
            cuts: null,
            fatSource: null,
            finisher: null
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
            }
            updateSummary();
        });
    });

    inStockToggle.addEventListener('change', () => {
        filterInStock = inStockToggle.checked;
        localStorage.setItem('filterInStock', filterInStock);
    });

    loadSettings();
});