import { Observable as ObservableClass} from 'rxjs';
import {
    writeTextInElement,
    addChangeEventListenerToElement,
    getElementValueFromEvent
} from '../utils/functions';

export function initialize(Observable = ObservableClass) {
    const customObservable = Observable
        .create(configureObserver)
        .map(doubleValue);

    const subscription = customObservable
        .subscribe(
            (value) => writeTextInElement(value, '.text_5'),
            (error) => writeTextInElement(error, '.text_5'),
            () => writeTextInElement('COMPLETED', '.text_5')
        );

    return [ customObservable, subscription ];
}

function configureObserver(observer) {
    addChangeEventListenerToElement('.input_5', (event) => {
        const value = getElementValueFromEvent(event);

        if (value === 'END') {
            observer.complete();
        } else if (!isNaN(value)) {
            observer.next(value);
        } else {
            observer.error('CRITICAL ERROR: Not a number!');
        }
    });
}

function doubleValue(value) {
   return value * 2;
}