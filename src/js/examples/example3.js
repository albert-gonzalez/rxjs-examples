import { interval } from "rxjs";
import { scan, take } from 'rxjs/operators';

import {
    calculateNextFibonacciArray,
    writeArrayInElement
} from '../utils/functions';

const firstFibonacciValues = [0, 1];

export function initialize(scheduler = undefined) {
    const fibonacciObservable = interval(1000, scheduler)
        .pipe(
            scan(calculateNextFibonacciArray, firstFibonacciValues),
            take(10)
        );

    const subscriber = fibonacciObservable.subscribe((fibonacci) => {
        writeArrayInElement(fibonacci, '.text_3');
    });

    return [ fibonacciObservable, subscriber ];
}
