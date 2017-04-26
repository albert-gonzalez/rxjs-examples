import { Observable as ObservableClass } from 'rxjs';
import { fillElementWithRandomColor } from '../utils/functions';

export function initialize(Observable = ObservableClass, scheduler = undefined) {
    const buttonClicked =
        Observable
            .fromEvent(document.querySelector('.button1'), 'click')
            .delay(1000, scheduler);

    const subscriber = buttonClicked.subscribe(() => {
        fillElementWithRandomColor(1, 'rectangle1');
    });

    return [ buttonClicked, subscriber ];
}