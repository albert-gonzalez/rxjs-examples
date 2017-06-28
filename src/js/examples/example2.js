import { Observable as ObservableClass} from 'rxjs';
import { fillElementWithRandomColor } from '../utils/functions';

export function initialize(Observable = ObservableClass, scheduler = undefined) {
    const everyTwoSeconds = Observable
        .interval(2000, scheduler)
        .take(5);

    const subscriber = everyTwoSeconds.subscribe(() => {
        fillElementWithRandomColor('.rectangle_2');
    });

    return [ everyTwoSeconds, subscriber ];
}