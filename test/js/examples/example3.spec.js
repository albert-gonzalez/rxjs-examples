import { expect } from 'chai';
import sinon from 'sinon';
import * as example3 from '../../../src/js/examples/example3';
import { JSDOM } from 'jsdom';
import { VirtualTimeScheduler, Observable, Subscriber } from 'rxjs';

describe('Example 3', () => {
    describe('initialize function', () => {
        let window;

        beforeEach(() => {
            window = new JSDOM('<div class="example3"><div class="text"></div></div>').window;
            global.window =  window;
            global.document = window.document;
        });

        afterEach(() => {
            global.window = undefined;
            global.document = undefined;
        });

        describe('observable configuration', () => {
            let subscribeSpy;
            let takeStub;
            let scanStub;

            beforeEach(() => {
                subscribeSpy = sinon.spy();
                takeStub = sinon.stub()
                    .withArgs(10)
                    .returns({ subscribe: subscribeSpy });

                scanStub = sinon.stub()
                    .returns({ take: takeStub, subscribe: subscribeSpy });

                takeStub = takeStub
                    .returns({ scan: scanStub, subscribe: subscribeSpy });

                sinon.stub(Observable, 'interval')
                    .withArgs(1000)
                    .returns({ scan: scanStub, take: takeStub, subscribe: subscribeSpy });
            });

            afterEach(() => {
                Observable.interval.restore();
            });

            it('should call Observable.interval with arguments: 1000 and scheduler instance', () => {
                example3.initialize(Observable, new VirtualTimeScheduler());
                expect(Observable.interval.calledOnce, 'interval with argument 1000 not called').equal(true);
                expect(Observable.interval.args[0][1]).to.be.an.instanceOf(VirtualTimeScheduler);
            });

            it('should call scan with arguments: a function that receives an accumulator with a fibonacci array and calculates the next array (use calculateNextFibonacciArray)', () => {
                example3.initialize(Observable);
                expect(scanStub.calledOnce, 'scan not called').equal(true);
                expect(scanStub.args[0][0]).to.be.a('function');
                expect(scanStub.args[0][0]([0,1,1,2])).to.deep.equal([0,1,1,2,3]);
            });

            it('should call take with 10', () => {
                example3.initialize(Observable);
                expect(takeStub.calledOnce, 'take with argument 10 not called').equal(true);
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
            it('should write the 12 first fibonacci values after 10 seconds', () => {
                const scheduler = new VirtualTimeScheduler(undefined, 10000);
                const [ fibonacciObservable, subscriber ] = example3.initialize(Observable, scheduler);
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
                const [ fibonacciObservable, subscriber ] = example3.initialize(Observable, scheduler);
                const textElement = document.querySelector('.example3 .text');
                const fibonacciValues = '0 1 1 2 3 5 8 13 21 34 55 89';

                expect(textElement.innerHTML, 'text element not empty').equal('');
                scheduler.flush();

                expect(textElement.innerHTML, 'text element not had fibonacci values').to.equal(fibonacciValues);

                subscriber.unsubscribe();
            });
        });
    });
});