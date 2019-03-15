import { expect } from 'chai';
import sinon from 'sinon';
import * as example4 from '../../../src/js/examples/example4';
import { JSDOM } from 'jsdom';
import { Subscriber, Observable } from 'rxjs'; // eslint-disable-line
import * as creators from 'rxjs'; // eslint-disable-line
import * as operators from 'rxjs/operators';

describe('Example 4', () => {
  describe('initialize function', () => {
    let window;

    beforeEach(() => {
      window = new JSDOM('<button class="button_4_1">Button</button><button class="button_4_2">Button</button><button class="button_4_3">Button</button><div class="text_4"></div>').window;
      global.window = window;
      global.document = window.document;
    });

    afterEach(() => {
      global.window = undefined;
      global.document = undefined;
    });

    describe('observable configuration', () => {
      let subscribeSpy;
      let pipeStub;

      beforeEach(() => {
        subscribeSpy = sinon.spy();
        pipeStub = sinon.stub().returns({ subscribe: subscribeSpy });

        sinon.stub(creators, 'fromEvent');
        sinon.stub(creators, 'zip').returns({ pipe: pipeStub, subscribe: subscribeSpy });
        sinon.spy(operators, 'scan');
      });

      afterEach(() => {
        creators.fromEvent.restore();
        creators.zip.restore();
        operators.scan.restore();
      });

      it('should call creators.fromEvent for every button (three times) with arguments: ButtonElement and "click" string (use getElement function)', () => {
        example4.initialize(Observable);
        expect(creators.fromEvent.calledThrice, 'fromEvent not called three times').equal(true);

        expectsForFromEventCall(1, 'First');
        expectsForFromEventCall(2, 'Second');
        expectsForFromEventCall(3, 'Third');
      });

      it('should call creators.zip passing the three button observables created before as arguments', () => {
        example4.initialize(Observable);
        expect(creators.zip.calledOnce, 'zip not called').equal(true);
        expect(creators.zip.args[0].length, 'zip not called with three arguments').equal(3);
        expect(creators.zip.calledWith(...creators.fromEvent.returnValues), 'zip not called passing three observable as arguments')
          .equal(true);
      });

      it('should call scan with two arguments: 1) A function that receives an an accumulator with the current count and increases it by one (use increaseCounter function); 2) The initial value 0 ', () => {
        example4.initialize(Observable);
        expect(operators.scan.calledOnce, 'scan not called').equal(true);

        expect(operators.scan.args[0][0], 'First argument is not a function').to.be.a('function');
        expect(operators.scan.args[0][0](4), 'First argument: The function does not return the accumulated value increased by one').to.equal(5);

        expect(operators.scan.args[0][1], 'Second value is not 0').to.equal(0);
      });

      it('should call subscribe with argument: A function that receives a value and writes it in a text box (use writeTextInElement function)', () => {
        example4.initialize(Observable);
        expect(subscribeSpy.calledOnce, 'subscribe not called').equal(true);
        expect(subscribeSpy.args[0][0], 'First argument is not a function').to.be.a('function');
      });
    });

    describe('return', () => {
      it('should return an Observable and a Subscriber', () => {
        const [ threeButtonsClickedObservable, subscriber ] = example4.initialize();

        expect(threeButtonsClickedObservable, 'Observable not returned').to.be.an.instanceOf(Observable);
        expect(subscriber, 'Subscriber not returned').to.be.an.instanceOf(Subscriber);
      });
    });

    describe('observable behaviour', () => {
      it('should emit a counter increased by 1 when the three buttons are clicked', () => {
        const [threeButtonsClickedObservable] = example4.initialize(Observable);
        const subscriberCallbackSpy = sinon.spy();
        const subscriber = threeButtonsClickedObservable.subscribe(subscriberCallbackSpy);

        document.querySelector('.button_4_1').dispatchEvent(new window.Event('click'));
        expect(subscriberCallbackSpy.notCalled, 'observable emitted after clicking the first button button').equal(true);
        document.querySelector('.button_4_2').dispatchEvent(new window.Event('click'));
        expect(subscriberCallbackSpy.notCalled, 'observable emitted after clicking the second button').equal(true);
        document.querySelector('.button_4_3').dispatchEvent(new window.Event('click'));
        expect(subscriberCallbackSpy.calledWith(1), 'observable not emitted with argument 1 after clicking the third button').equal(true);

        document.querySelector('.button_4_1').dispatchEvent(new window.Event('click'));
        document.querySelector('.button_4_1').dispatchEvent(new window.Event('click'));
        expect(subscriberCallbackSpy.calledOnce, 'observable emitted after clicking the first button').equal(true);

        document.querySelector('.button_4_2').dispatchEvent(new window.Event('click'));
        document.querySelector('.button_4_2').dispatchEvent(new window.Event('click'));
        expect(subscriberCallbackSpy.calledOnce, 'observable emitted after clicking the second button').equal(true);

        document.querySelector('.button_4_3').dispatchEvent(new window.Event('click'));
        expect(subscriberCallbackSpy.calledWith(2), 'observable not emitted with argument 2 after clicking the third button').equal(true);
        document.querySelector('.button_4_3').dispatchEvent(new window.Event('click'));
        expect(subscriberCallbackSpy.calledWith(3), 'observable not emitted with argument 3 after clicking the third button').equal(true);

        subscriber.unsubscribe();
      });
    });

    describe('subscriber behaviour', () => {
      it('should increase counter by 1 when the three buttons are clicked', () => {
        const textElement = document.querySelector('.text_4');

        example4.initialize(Observable);

        document.querySelector('.button_4_1').dispatchEvent(new window.Event('click'));
        expect(textElement.innerHTML, 'text_4 element not empty after clicking the first button').equal('');
        document.querySelector('.button_4_2').dispatchEvent(new window.Event('click'));
        expect(textElement.innerHTML, 'text_4 element not empty after clicking the second button').equal('');
        document.querySelector('.button_4_3').dispatchEvent(new window.Event('click'));
        expect(textElement.innerHTML, 'text_4 element not contained 1 after clicking the third button').equal('1');

        document.querySelector('.button_4_1').dispatchEvent(new window.Event('click'));
        document.querySelector('.button_4_1').dispatchEvent(new window.Event('click'));
        expect(textElement.innerHTML, 'text_4 element not contained 1 after clicking the first button').equal('1');

        document.querySelector('.button_4_2').dispatchEvent(new window.Event('click'));
        document.querySelector('.button_4_2').dispatchEvent(new window.Event('click'));
        expect(textElement.innerHTML, 'text_4 element not contained 1 after clicking the second button').equal('1');

        document.querySelector('.button_4_3').dispatchEvent(new window.Event('click'));
        expect(textElement.innerHTML, 'text_4 element not contained 2 after clicking the third button').equal('2');
        document.querySelector('.button_4_3').dispatchEvent(new window.Event('click'));
        expect(textElement.innerHTML, 'text_4 element not contained 3 after clicking the third button').equal('3');
      });
    });
  });

  function expectsForFromEventCall (number, name) {
    expect(creators.fromEvent.args[number - 1][0]).to.be.an.instanceOf(window.HTMLButtonElement, `${name} fromEvent call: First argument is not a HTMLButtonElement instance`);
    expect(creators.fromEvent.args[number - 1][0].className).to.equal(`button_4_${number}`, `${name} fromEvent call: First argument does not have the class "button${number}"`);
    expect(creators.fromEvent.args[number - 1][1]).to.equal('click', `${name} fromEvent call: Second argument is not "click"`);
  }
});
