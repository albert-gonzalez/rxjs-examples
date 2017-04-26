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

        describe('return', () => {
            it('should return an Observable and a Subscriber', () => {
                const [ everyTwoSeconds, subscriber ] = example2.initialize();

                expect(everyTwoSeconds).to.be.an.instanceOf(Observable);
                expect(subscriber).to.be.an.instanceOf(Subscriber);
            });
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
                    .returns({ take: takeStub });
            });

            afterEach(() => {
                Observable.interval.restore();
            });

            it('should call interval', () => {
                example2.initialize(Observable);
                expect(Observable.interval.calledOnce).to.be.true;
            });

            it('should call take', () => {
                example2.initialize(Observable);
                expect(takeStub.calledOnce).to.be.true;
            });

            it('should call subscribe', () => {
                example2.initialize(Observable);
                expect(subscribeSpy.calledOnce).to.be.true;
            });
        });

        describe('result', () => {
            it('should set background of .rectangle1 with a random rgb value in 2 seconds intervals', () => {
                const scheduler = new VirtualTimeScheduler(undefined, 10000);
                const [ everyTwoSeconds, subscriber ] = example2.initialize(Observable, scheduler);
                const rectangleElement = document.querySelector('.example2 .rectangle1');
                const subscriberSpy = sinon.spy();

                const subscriberForCounting = everyTwoSeconds.subscribe(subscriberSpy);

                expect(rectangleElement.style.background).to.be.empty;
                scheduler.flush();

                expect(subscriberSpy.callCount).to.equal(5);
                expect(rectangleElement.style.background).to.contain('rgb');

                subscriber.unsubscribe();
                subscriberForCounting.unsubscribe();
            });
        });
    });
});