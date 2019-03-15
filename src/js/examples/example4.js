import { fromEvent, zip } from 'rxjs';
import { scan } from 'rxjs/operators';

import {
  increaseCounter,
  writeTextInElement,
  getElement
} from '../utils/functions';

export function initialize () {
  const button1ClickObservable = fromEvent(getElement('.button_4_1'), 'click');

  const button2ClickObservable = fromEvent(getElement('.button_4_2'), 'click');

  const button3ClickObservable = fromEvent(getElement('.button_4_3'), 'click');

  const threeButtonsClickedObservable = zip(
    button1ClickObservable,
    button2ClickObservable,
    button3ClickObservable
  ).pipe(
    scan((increaseCounter), 0)
  );

  const subscriber = threeButtonsClickedObservable.subscribe((counter) => {
    writeTextInElement(counter, '.text_4');
  });

  return [ threeButtonsClickedObservable, subscriber ];
}
