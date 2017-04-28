import { expect } from 'chai';
import sinon from 'sinon';
import * as example4 from '../../../src/js/examples/example4';
import { JSDOM } from 'jsdom';
import { VirtualTimeScheduler, Subscriber, Observable } from 'rxjs';

describe('Example 4', () => {
    describe('initialize function', () => {
        let window;

        beforeEach(() => {
            window = new JSDOM('<div class="example4"><button class="button1">Button</button><button class="button2">Button</button><button class="button3">Button</button><div class="text"></div></div>').window;
            global.window =  window;
            global.document = window.document;
        });

        afterEach(() => {
            global.window = undefined;
            global.document = undefined;
        });

        describe('return', () => {
            it('should return an Observable and a Subscriber', () => {
                const [ threeButtonsClickedObservable, subscriber ] = example4.initialize();

                expect(threeButtonsClickedObservable, 'Observable not returned').to.be.an.instanceOf(Observable);
                expect(subscriber, 'Subscriber not returned').to.be.an.instanceOf(Subscriber);
            });
        });

        describe('stream configuration', () => {
            let scanStub;
            let subscribeSpy;

            beforeEach(() => {
                subscribeSpy = sinon.spy();
                scanStub = sinon.stub().returns({ subscribe: subscribeSpy });

                sinon.stub(Observable, 'fromEvent');
                sinon.stub(Observable, 'zip').returns({ scan: scanStub });
            });

            afterEach(() => {
                Observable.fromEvent.restore();
                Observable.zip.restore();
            });

            it('should call fromEvent', () => {
                example4.initialize(Observable);
                expect(Observable.fromEvent.calledThrice, 'fromEvent not called three times').equal(true);
            });

            it('should call zip passing three observables as arguments', () => {
                example4.initialize(Observable);
                expect(Observable.zip.calledOnce, 'zip not called').equal(true);
                expect(Observable.zip.args[0].length, 'zip not called with three arguments').equal(3);
                expect(Observable.zip.calledWith(...Observable.fromEvent.returnValues), 'zip not called passing three observable as arguments')
                        .equal(true);
            });

            it('should call scan', () => {
                example4.initialize(Observable);
                expect(scanStub.calledOnce, 'scan not called').equal(true);
            });

            it('should call subscribe', () => {
                example4.initialize(Observable);
                expect(subscribeSpy.calledOnce, 'subscribe not called').equal(true);
            });
        });

        describe('observable behaviour', () => {
            it('should emit a counter increased by 1 when the three buttons are clicked', () => {
                const [threeButtonsClickedObservable] = example4.initialize(Observable);
                const subscriberCallbackSpy = sinon.spy();
                const subscriber = threeButtonsClickedObservable.subscribe(subscriberCallbackSpy);

                document.querySelector('.button1').dispatchEvent(new window.Event('click'));
                expect(subscriberCallbackSpy.notCalled, 'observable emitted after clicking button').equal(true);
                document.querySelector('.button2').dispatchEvent(new window.Event('click'));
                expect(subscriberCallbackSpy.notCalled, 'observable emitted after clicking button').equal(true);
                document.querySelector('.button3').dispatchEvent(new window.Event('click'));
                expect(subscriberCallbackSpy.calledWith(1), 'observable not emitted with argument 1 after clicking button').equal(true);

                document.querySelector('.button1').dispatchEvent(new window.Event('click'));
                document.querySelector('.button1').dispatchEvent(new window.Event('click'));
                expect(subscriberCallbackSpy.calledOnce, 'observable emitted after clicking button').equal(true);

                document.querySelector('.button2').dispatchEvent(new window.Event('click'));
                document.querySelector('.button2').dispatchEvent(new window.Event('click'));
                expect(subscriberCallbackSpy.calledOnce, 'observable emitted after clicking button').equal(true);

                document.querySelector('.button3').dispatchEvent(new window.Event('click'));
                expect(subscriberCallbackSpy.calledWith(2), 'observable not emitted with argument 2 after clicking button').equal(true);
                document.querySelector('.button3').dispatchEvent(new window.Event('click'));
                expect(subscriberCallbackSpy.calledWith(3), 'observable not emitted with argument 3 after clicking button').equal(true);

                subscriber.unsubscribe();
            });
        });

        describe('subscriber behaviour', () => {
            it('should increase counter by 1 when the three buttons are clicked', () => {
                const textElement = document.querySelector('.example4 .text');

                example4.initialize(Observable);

                document.querySelector('.button1').dispatchEvent(new window.Event('click'));
                expect(textElement.innerHTML, 'text element not empty after clicking button').equal('');
                document.querySelector('.button2').dispatchEvent(new window.Event('click'));
                expect(textElement.innerHTML, 'text element not empty after clicking button').equal('');
                document.querySelector('.button3').dispatchEvent(new window.Event('click'));
                expect(textElement.innerHTML, 'text element not contained 1 after clicking button').equal('1');

                document.querySelector('.button1').dispatchEvent(new window.Event('click'));
                document.querySelector('.button1').dispatchEvent(new window.Event('click'));
                expect(textElement.innerHTML, 'text element not contained 1 after clicking button').equal('1');

                document.querySelector('.button2').dispatchEvent(new window.Event('click'));
                document.querySelector('.button2').dispatchEvent(new window.Event('click'));
                expect(textElement.innerHTML, 'text element not contained 1 after clicking button').equal('1');

                document.querySelector('.button3').dispatchEvent(new window.Event('click'));
                expect(textElement.innerHTML, 'text element not contained 2 after clicking button').equal('2');
                document.querySelector('.button3').dispatchEvent(new window.Event('click'));
                expect(textElement.innerHTML, 'text element not contained 3 after clicking button').equal('3');
            });
        });
    });
});