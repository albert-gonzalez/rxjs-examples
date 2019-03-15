import { expect } from 'chai';
import sinon from 'sinon';
import * as example3 from '../../../src/js/examples/example3';
import { JSDOM } from 'jsdom';
import { VirtualTimeScheduler, Observable, Subscriber } from 'rxjs'; // eslint-disable-line
import * as creators from 'rxjs'; // eslint-disable-line
import * as operators from 'rxjs/operators';

describe('Example 3', () => {
  describe('initialize function', () => {
    let window;

    beforeEach(() => {
      window = new JSDOM('<div class="text_3"></div>').window;
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

        sinon.stub(creators, 'interval')
          .withArgs(1000)
          .returns({ pipe: pipeStub, subscribe: subscribeSpy });

        sinon.spy(operators, 'take');
        sinon.spy(operators, 'scan');
      });

      afterEach(() => {
        creators.interval.restore();
        operators.take.restore();
        operators.scan.restore();
      });

      it('should call interval with arguments: 1000 and scheduler instance', () => {
        example3.initialize(new VirtualTimeScheduler());
        expect(creators.interval.calledOnce, 'interval with argument 1000 not called').equal(true);
        expect(creators.interval.args[0][1]).to.be.an.instanceOf(VirtualTimeScheduler);
      });

      it('should call scan with arguments: a function that receives an accumulator with a fibonacci array and calculates the next array (use calculateNextFibonacciArray)', () => {
        example3.initialize(Observable);
        expect(operators.scan.calledOnce, 'scan not called').equal(true);
        expect(operators.scan.args[0][0]).to.be.a('function');
        expect(operators.scan.args[0][0]([0, 1, 1, 2])).to.deep.equal([0, 1, 1, 2, 3]);
      });

      it('should call take with 10', () => {
        example3.initialize(Observable);
        expect(operators.take.calledOnce, 'take with argument 10 not called').equal(true);
      });

      it('should call subscribe with arguments: a function that receives the current fibonacci array and calls writeArrayInElement', () => {
        example3.initialize(Observable);
        expect(subscribeSpy.calledOnce, 'subscribe not called').equal(true);
      });
    });

    describe('return', () => {
      it('should return an Observable and a Subscriber', () => {
        const [ everyTwoSeconds, subscriber ] = example3.initialize();

        expect(everyTwoSeconds, 'Observable not returned').to.be.an.instanceOf(Observable);
        expect(subscriber, 'Subscriber not returned').to.be.an.instanceOf(Subscriber);
      });
    });

    describe('observable behaviour', () => {
      it('should emit 10 times every second and the final emitted value should be an array with the 12 first fibonacci values', () => {
        const scheduler = new VirtualTimeScheduler(undefined, 10000);
        const [ fibonacciObservable, subscriber ] = example3.initialize(scheduler);
        const subscriberSpy = sinon.spy();
        const fibonacciValues = [0, 1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89];

        const subscriberForCounting = fibonacciObservable.subscribe(subscriberSpy);

        scheduler.flush();

        expect(subscriberSpy.callCount, 'observer not emitted 10 times').to.equal(10);
        expect(subscriberSpy.getCall(9).args[0], 'observable not returned array with 12 values').to.deep.equal(fibonacciValues);

        subscriber.unsubscribe();
        subscriberForCounting.unsubscribe();
      });
    });

    describe('subscriber behaviour', () => {
      it('should write the 12 first fibonacci values after 10 seconds', () => {
        const scheduler = new VirtualTimeScheduler(undefined, 10000);
        const subscriber = example3.initialize(scheduler)[1];
        const textElement = document.querySelector('.text_3');
        const fibonacciValues = '0 1 1 2 3 5 8 13 21 34 55 89';

        expect(textElement.innerHTML, 'text_3 element not empty').equal('');
        scheduler.flush();

        expect(textElement.innerHTML, 'text_3 element not had fibonacci values').to.equal(fibonacciValues);

        subscriber.unsubscribe();
      });
    });
  });
});
