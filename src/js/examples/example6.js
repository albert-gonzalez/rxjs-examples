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

}