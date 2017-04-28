function getRandomRGBValue() {
    let random0To255Value = () => Math.floor(Math.random() * 255);
    return [random0To255Value(), random0To255Value(), random0To255Value()];
}

export function fillElementWithRandomColor(exampleNumber, elementClass) {
    if (!document) {
        return;
    }

    const element = document
        .querySelectorAll(`.example${exampleNumber} .${elementClass}`)
        .item(0);

    if (element){
        let a = getRandomRGBValue();
        element.style.background = `rgb(${getRandomRGBValue().join(',')})`;
    }
}

export function calculateNextFibonacciArray(fibonaccyArray) {
    const fibonaccyArrayLength = fibonaccyArray.length;
    return [
        ...fibonaccyArray,
        fibonaccyArray[fibonaccyArrayLength - 1] + fibonaccyArray[fibonaccyArrayLength - 2]
    ];
}

export function writeArrayInElement(array, exampleNumber, elementClass) {
    if (!document) {
        return;
    }

    const element = document
        .querySelectorAll(`.example${exampleNumber} .${elementClass}`)
        .item(0);

    if (element){
        element.innerHTML = array.join(' ');
    }
}

export function increaseCounter(accumulator) {
    return accumulator + 1;
}

export function writeTextInElement(text, exampleNumber, elementClass) {
    if (!document) {
        return;
    }

    const element = document
        .querySelector(`.example${exampleNumber} .${elementClass}`);

    if (element){
        element.innerHTML = text;
    }
}

export function addChangeEventListenerToElement(exampleNumber, elementClass, callback) {
    document.querySelector('.example5 .input1')
        .addEventListener('change', callback);
}

export function getElementValueFromEvent(event) {
    return event.currentTarget.value;
}