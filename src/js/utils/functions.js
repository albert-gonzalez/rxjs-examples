import axios from 'axios';

function getRandomRGBValue() {
    let random0To255Value = () => Math.floor(Math.random() * 255);
    return [random0To255Value(), random0To255Value(), random0To255Value()];
}

export function getElement(selector) {
    return document
        .querySelector(selector);
}

export function getValueFromElement(selector) {
    return document
        .querySelector(selector).value;
}

export function fillElementWithRandomColor(selector) {
    if (!document) {
        return;
    }

    const element = document
        .querySelector(selector);

    if (element){
        element.style.background = `rgb(${getRandomRGBValue().join(',')})`;
    }
}

export function calculateNextFibonacciArray(fibonacciArray) {
    const fibonacciArrayLength = fibonacciArray.length;
    return [
        ...fibonacciArray,
        fibonacciArray[fibonacciArrayLength - 1] + fibonacciArray[fibonacciArrayLength - 2]
    ];
}

export function writeArrayInElement(array, selector) {
    if (!document) {
        return;
    }

    const element = document
        .querySelectorAll(selector)
        .item(0);

    if (element){
        element.innerHTML = array.join(' ');
    }
}

export function increaseCounter(accumulator) {
    return accumulator + 1;
}

export function writeTextInElement(text, selector) {
    if (!document) {
        return;
    }

    const element = document
        .querySelector(selector);

    if (element){
        element.innerHTML = text;
    }
}

export function addChangeEventListenerToElement(selector, callback) {
    document.querySelector(selector)
        .addEventListener('change', callback);
}

export function addClickEventListenerToElement(selector, callback) {
    document.querySelector(selector)
        .addEventListener('click', callback);
}

export function addKeyupEventListenerToElement(selector, callback) {
    document.querySelector(selector)
        .addEventListener('keyup', callback);
}

export function getElementValueFromEvent(event) {
    return event.target.value;
}

export function searchSpecieAndWriteListInElement(query, selector) {
    writeTextInElement('Searching...', selector);
    axios
        .get(`http://api.gbif.org/v1/species/suggest?q=${query}&limit=5`)
        .then((response) => {
            const resultList = response.data.map((result) => {
                return `<li>${result.scientificName} (${result.canonicalName})</li>`;
            }).join('');
            writeTextInElement(resultList, selector);
        });
}
