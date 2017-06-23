import { Observable as ObservableClass } from 'rxjs';
import { fillElementWithRandomColor, getElement } from '../utils/functions';

export function initialize(Observable = ObservableClass, scheduler = undefined) {
    const buttonClickedObservable =
        Observable
            .fromEvent(getElement('.button_1'), 'click')
            .delay(1000, scheduler);

    const subscriber = buttonClickedObservable.subscribe(() => {
        fillElementWithRandomColor('.rectangle_1');
    });

    return [ buttonClickedObservable, subscriber ];
}