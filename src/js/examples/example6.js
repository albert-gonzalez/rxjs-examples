import { Observable as ObservableClass} from 'rxjs';
import { Subject as SubjectClass} from 'rxjs';
import axios from 'axios';
import {
    addClickEventListenerToElement,
    getElementValueFromEvent,
    searchSpecieAndWriteListInElement,
    getElement,
    getValueFromElement
} from '../utils/functions';

export function initialize(Observable = ObservableClass, Subject = SubjectClass, scheduler = undefined) {
    const fromKeyupEventObservable = configureObservable(Observable, scheduler);
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

function configureObservable(Observable, scheduler) {
    return Observable
        .fromEvent(getElement('.input_6'), 'keyup')
        .debounceTime(500, scheduler)
        .map(((event) => getElementValueFromEvent(event)))
        .filter((value) => value.length >= 3);
}