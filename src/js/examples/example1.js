import { fromEvent } from 'rxjs';
import { delay } from 'rxjs/operators';
import { fillElementWithRandomColor, getElement } from '../utils/functions';

export function initialize (scheduler = undefined) {
  const buttonClickedObservable =
        fromEvent(getElement('.button_1'), 'click').pipe(
          delay(1000, scheduler)
        );

  const subscriber = buttonClickedObservable.subscribe(() => {
    fillElementWithRandomColor('.rectangle_1');
  });

  return [ buttonClickedObservable, subscriber ];
}
