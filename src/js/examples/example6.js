import { Subject, fromEvent } from "rxjs";
import { debounceTime, map, filter } from 'rxjs/operators';

import {
    addClickEventListenerToElement,
    getElementValueFromEvent,
    searchSpecieAndWriteListInElement,
    getElement,
    getValueFromElement
} from '../utils/functions';

export function initialize(scheduler = undefined) {
    const fromKeyupEventObservable = configureObservable(scheduler);
    const fromButtonClickSubject = new Subject();

    addClickEventListenerToElement('.button_6', () => {
        fromButtonClickSubject.next(getValueFromElement('.input_6'));
    });

    fromKeyupEventObservable
        .subscribe(fromButtonClickSubject);

    const subscription = fromButtonClickSubject
        .subscribe((value) => {
            searchSpecieAndWriteListInElement(value, '.text_6');
        });

    return [ fromKeyupEventObservable, fromButtonClickSubject, subscription ];
}

function configureObservable(scheduler) {
    return fromEvent(getElement('.input_6'), 'keyup')
        .pipe(
            debounceTime(500, scheduler),
            map(((event) => getElementValueFromEvent(event))),
            filter((value) => value.length >= 3)
        );
}
