import { interval } from "rxjs";
import { take } from 'rxjs/operators';

import { fillElementWithRandomColor } from '../utils/functions';

export function initialize(scheduler = undefined) {
    const everyTwoSeconds = interval(2000, scheduler).pipe(
            take(5)
        );

    const subscriber = everyTwoSeconds.subscribe(() => {
        fillElementWithRandomColor('.rectangle_2');
    });

    return [ everyTwoSeconds, subscriber ];
}
