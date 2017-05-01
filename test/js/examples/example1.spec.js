import { expect } from 'chai';
import sinon from 'sinon';
import * as example1 from '../../../src/js/examples/example1';
import { JSDOM } from 'jsdom';
import { VirtualTimeScheduler, Subscriber, Observable } from 'rxjs';

describe('Example 1', () => {
    describe('initialize function', () => {
        let window;

        beforeEach(() => {
            window = new JSDOM('<div class="example1"><button class="button1">Button</button><div class="rectangle1"></div></div>').window;
            global.window =  window;
            global.document = window.document;
        });

        afterEach(() => {
            global.window = undefined;
            global.document = undefined;
        });

        describe('stream configuration', () => {
            let delayStub;
            let subscribeSpy;

            beforeEach(() => {
                subscribeSpy = sinon.spy();
                delayStub = sinon.stub().withArgs(1000).returns({ subscribe: subscribeSpy });

                sinon.stub(Observable, 'fromEvent').returns({ delay: delayStub });
            });

            afterEach(() => {
                Observable.fromEvent.restore();
            });

            it('should call fromEvent', () => {
                example1.initialize(Observable);
                expect(Observable.fromEvent.calledOnce, 'fromEvent not called once').equal(true);
            });

            it('should call delay with 1000 ms', () => {
                example1.initialize(Observable);
                expect(delayStub.calledOnce, 'delay not called once').equal(true);
            });

            it('should call subscribe', () => {
                example1.initialize(Observable);
                expect(subscribeSpy.calledOnce, 'subscribe not called once').equal(true);
            });
        });

        describe('return', () => {
            it('should return an Observable and a Subscriber', () => {
                const [ buttonClickedObservable, subscriber ] = example1.initialize();

                expect(buttonClickedObservable, 'Observable not returned').to.be.an.instanceOf(Observable);
                expect(subscriber, 'Subscriber not returned').to.be.an.instanceOf(Subscriber);
            });
        });

        describe('observable behaviour', () => {
            it('should emit after 1 second of clicking button', () => {
                const scheduler = new VirtualTimeScheduler(undefined, 1000);
                const rectangleElement = document.querySelector('.example1 .rectangle1');
                const [ buttonClickedObservable] = example1.initialize(Observable, scheduler);
                const subscriberCallbackSpy = sinon.spy();

                const subscriber = buttonClickedObservable.subscribe(subscriberCallbackSpy);

                document.querySelector('.button1').dispatchEvent(new window.Event('click'));
                expect(subscriberCallbackSpy.notCalled, 'Observable emitted a value').equal(true);

                scheduler.flush();

                expect(subscriberCallbackSpy.calledOnce, 'Observable not emitted a value').equal(true);
            });
        });

        describe('subscriber behaviour', () => {
            it('should set background of .rectangle1 with a random rgb value after 1 second of clicking button', () => {
                const scheduler = new VirtualTimeScheduler(undefined, 1000);
                const rectangleElement = document.querySelector('.example1 .rectangle1');

                example1.initialize(Observable, scheduler);

                document.querySelector('.button1').dispatchEvent(new window.Event('click'));
                expect(rectangleElement.style.background, 'rectangle not empty just after clicking button').equal('');

                scheduler.flush();

                expect(rectangleElement.style.background, 'rectangle not empty 1 second after clicking button').to.contain('rgb');
            });
        });
    });
});