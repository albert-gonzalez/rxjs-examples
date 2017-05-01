import { expect } from 'chai';
import sinon from 'sinon';
import * as example2 from '../../../src/js/examples/example2';
import { JSDOM } from 'jsdom';
import { VirtualTimeScheduler, Observable, Subscriber } from 'rxjs';

describe('Example 2', () => {
    describe('initialize function', () => {
        let window;

        beforeEach(() => {
            window = new JSDOM('<div class="example2"><div class="rectangle1"></div></div>').window;
            global.window =  window;
            global.document = window.document;
        });

        afterEach(() => {
            global.window = undefined;
            global.document = undefined;
        });

        describe('stream configuration', () => {
            let subscribeSpy;
            let takeStub;

            beforeEach(() => {
                subscribeSpy = sinon.spy();
                takeStub = sinon.stub()
                    .withArgs(5)
                    .returns({ subscribe: subscribeSpy });

                sinon.stub(Observable, 'interval')
                    .withArgs(2000)
                    .returns({ take: takeStub, subscribe: subscribeSpy });
            });

            afterEach(() => {
                Observable.interval.restore();
            });

            it('should call interval with 2000 ms', () => {
                example2.initialize(Observable);
                expect(Observable.interval.calledOnce, 'interval with argument 2000 not called').equal(true);
            });

            it('should call take with 5', () => {
                example2.initialize(Observable);
                expect(takeStub.calledOnce, 'take with argument 5 not called').equal(true);
            });

            it('should call subscribe', () => {
                example2.initialize(Observable);
                expect(subscribeSpy.calledOnce, 'subscribe not called').equal(true);
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
            it('should emit a value every 2 seconds until it have emitted 5 times', () => {
                const scheduler = new VirtualTimeScheduler(undefined, 10000);
                const [ everyTwoSeconds, subscriber ] = example2.initialize(Observable, scheduler);
                const subscriberCallbackSpy = sinon.spy();

                const subscriberForCounting = everyTwoSeconds.subscribe(subscriberCallbackSpy);

                scheduler.flush();

                expect(subscriberCallbackSpy.callCount, 'observable not emitted 5 times').to.equal(5);

                subscriber.unsubscribe();
                subscriberForCounting.unsubscribe();
            });
        });

        describe('subscriber behaviour', () => {
            it('should set background of .rectangle1 with a random rgb value in 2 seconds intervals', () => {
                const scheduler = new VirtualTimeScheduler(undefined, 10000);
                const [ everyTwoSeconds, subscriber ] = example2.initialize(Observable, scheduler);
                const rectangleElement = document.querySelector('.example2 .rectangle1');
                const subscriberSpy = sinon.spy();

                expect(rectangleElement.style.background, 'background not empty at the beginning').equal('');
                scheduler.flush();

                expect(rectangleElement.style.background, 'background not contained rgb value').to.contain('rgb');

                subscriber.unsubscribe();
            });
        });
    });
});