// data.js

async function getDefaultMealData() {
    const response = await fetch('items.json');
    const data = await response.json();
    return data;
}

async function getMealData() {
    const storedData = localStorage.getItem('carnivoreMealData');
    if (storedData) {
        // an async function must return a promise
        return Promise.resolve(JSON.parse(storedData));
    }
    const defaultData = await getDefaultMealData();
    saveMealData(defaultData);
    return defaultData;
}

function saveMealData(data) {
    localStorage.setItem('carnivoreMealData', JSON.stringify(data));
}
