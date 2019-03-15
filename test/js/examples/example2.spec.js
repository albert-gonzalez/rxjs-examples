import { expect } from 'chai';
import sinon from 'sinon';
import * as example2 from '../../../src/js/examples/example2';
import { JSDOM } from 'jsdom';
import { VirtualTimeScheduler, Observable, Subscriber } from 'rxjs'; // eslint-disable-line
import * as creators from 'rxjs'; // eslint-disable-line
import * as operators from 'rxjs/operators';

describe('Example 2', () => {
  describe('initialize function', () => {
    let window;

    beforeEach(() => {
      window = new JSDOM('<div class="rectangle_2"></div>').window;
      global.window = window;
      global.document = window.document;
    });

    afterEach(() => {
      global.window = undefined;
      global.document = undefined;
    });

    describe('Observable configuration', () => {
      let subscribeSpy;
      let pipeStub;

      beforeEach(() => {
        subscribeSpy = sinon.spy();
        pipeStub = sinon.stub().returns({ subscribe: subscribeSpy });

        sinon.stub(creators, 'interval')
          .withArgs(2000)
          .returns({ pipe: pipeStub, subscribe: subscribeSpy });

        sinon.spy(operators, 'take');
      });

      afterEach(() => {
        creators.interval.restore();
        operators.take.restore();
      });

      it('should call creators.interval with arguments: 2000 and a scheduler instance', () => {
        example2.initialize(new VirtualTimeScheduler());
        expect(creators.interval.calledOnce, 'interval with argument 2000 not called').equal(true);
        expect(creators.interval.args[0][1]).to.be.an.instanceOf(VirtualTimeScheduler);
      });

      it('should call take with 5', () => {
        example2.initialize(Observable);
        expect(operators.take.calledOnce, 'take with argument 5 not called').equal(true);
      });

      it('should call subscribe with arguments: a function that calls fillElementWithRandomColor function to fill the .rectangle_2 element', () => {
        example2.initialize(Observable);
        expect(subscribeSpy.calledOnce, 'subscribe not called').equal(true);
        expect(subscribeSpy.args[0][0]).to.be.a('function');
      });
    });

    describe('return', () => {
      it('should return an Observable and a Subscriber', () => {
        const [ everyTwoSeconds, subscriber ] = example2.initialize();

        expect(everyTwoSeconds, 'Observable not returned').to.be.an.instanceOf(Observable);
        expect(subscriber, 'Subscriber not returned').to.be.an.instanceOf(Subscriber);
      });
    });

    describe('observable behaviour', () => {
      it('should emit a value every 2 seconds until it has emitted 5 times', () => {
        const scheduler = new VirtualTimeScheduler(undefined, 10000);
        const [ everyTwoSeconds, subscriber ] = example2.initialize(scheduler);
        const subscriberCallbackSpy = sinon.spy();

        const subscriberForCounting = everyTwoSeconds.subscribe(subscriberCallbackSpy);

        scheduler.flush();

        expect(subscriberCallbackSpy.callCount, 'observable not emitted 5 times').to.equal(5);

        subscriber.unsubscribe();
        subscriberForCounting.unsubscribe();
      });
    });

    describe('subscriber behaviour', () => {
      it('should set background of .rectangle_2 with a random rgb value in 2 seconds intervals', () => {
        const scheduler = new VirtualTimeScheduler(undefined, 10000);
        const subscriber = example2.initialize(scheduler)[1];
        const rectangleElement = document.querySelector('.rectangle_2');

        expect(rectangleElement.style.background, 'background not empty at the beginning').equal('');
        scheduler.flush();

        expect(rectangleElement.style.background, 'background not contained rgb value').to.contain('rgb');

        subscriber.unsubscribe();
      });
    });
  });
});
