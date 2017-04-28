import { Observable as ObservableClass } from 'rxjs';
import { fillElementWithRandomColor } from '../utils/functions';

export function initialize(Observable = ObservableClass, scheduler = undefined) {
    const buttonClickedObservable =
        Observable
            .fromEvent(document.querySelector('.example1 .button1'), 'click')
            .delay(1000, scheduler);

    const subscriber = buttonClickedObservable.subscribe(() => {
        fillElementWithRandomColor(1, 'rectangle1');
    });

    return [ buttonClickedObservable, subscriber ];
}