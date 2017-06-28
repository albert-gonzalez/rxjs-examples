import { Observable as ObservableClass} from 'rxjs';
import {
    increaseCounter,
    writeTextInElement,
    getElement
} from '../utils/functions';

export function initialize(Observable = ObservableClass) {
    const button1ClickObservable = Observable
        .fromEvent(getElement('.button_4_1'), 'click');

    const button2ClickObservable = Observable
        .fromEvent(getElement('.button_4_2'), 'click');

    const button3ClickObservable = Observable
        .fromEvent(getElement('.button_4_3'), 'click');

    const threeButtonsClickedObservable = Observable.zip(
        button1ClickObservable,
        button2ClickObservable,
        button3ClickObservable
    ).scan((increaseCounter), 0);

    const subscriber = threeButtonsClickedObservable.subscribe((counter) => {
        writeTextInElement(counter, '.text_4');
    });

    return [ threeButtonsClickedObservable, subscriber ];
}