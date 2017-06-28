import { Observable as ObservableClass} from 'rxjs';
import {
    calculateNextFibonacciArray,
    writeArrayInElement
} from '../utils/functions';

const firstFibonacciValues = [0, 1];

export function initialize(Observable = ObservableClass, scheduler = undefined) {
    const fibonacciObservable = Observable
        .interval(1000, scheduler)
        .take(10)
        .scan(calculateNextFibonacciArray, firstFibonacciValues);

    const subscriber = fibonacciObservable.subscribe((fibonnaci) => {
        writeArrayInElement(fibonnaci, '.text_3');
    });

    return [ fibonacciObservable, subscriber ];
}