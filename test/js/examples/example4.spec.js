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

        describe('stream configuration', () => {
            let scanStub;
            let subscribeSpy;

            beforeEach(() => {
                subscribeSpy = sinon.spy();
                scanStub = sinon.stub().returns({ subscribe: subscribeSpy });

                sinon.stub(Observable, 'fromEvent');
                sinon.stub(Observable, 'zip').returns({ scan: scanStub, subscribe: subscribeSpy });
            });

            afterEach(() => {
                Observable.fromEvent.restore();
                Observable.zip.restore();
            });

            it('should call fromEvent for every button (three times) with arguments: ButtonElement and "click" string (use fromEvent function)', () => {
                example4.initialize(Observable);
                expect(Observable.fromEvent.calledThrice, 'fromEvent not called three times').equal(true);

                expectsForFromEventCall(1, 'First');
                expectsForFromEventCall(2, 'Second');
                expectsForFromEventCall(3, 'Third');
            });

            it('should call zip passing three button observables as arguments', () => {
                example4.initialize(Observable);
                expect(Observable.zip.calledOnce, 'zip not called').equal(true);
                expect(Observable.zip.args[0].length, 'zip not called with three arguments').equal(3);
                expect(Observable.zip.calledWith(...Observable.fromEvent.returnValues), 'zip not called passing three observable as arguments')
                        .equal(true);
            });

            it('should call scan with two arguments: 1) A function that receives an an accumulator with the current count and increases it by one (use increaseCounter function); 2) The initial value 0 ', () => {
                example4.initialize(Observable);
                expect(scanStub.calledOnce, 'scan not called').equal(true);

                expect(scanStub.args[0][0], 'First argument is not a function').to.be.a('function');
                expect(scanStub.args[0][0](4), 'First argument: The function does not return the accumulated value increased by one').to.equal(5);

                expect(scanStub.args[0][1], 'Second value is not 0').to.equal(0);
            });

            it('should call subscribe with argument: A function that receives a value a writes it in a text box (use writeTextInElement function)', () => {
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

    function expectsForFromEventCall(number, name) {
        expect(Observable.fromEvent.args[number - 1][0]).to.be.an.instanceOf(window.HTMLButtonElement, `${name} fromEvent call: First argument is not a HTMLButtonElement instance`);
        expect(Observable.fromEvent.args[number - 1][0].className).to.equal(`button${number}`, `${name} fromEvent call: First argument does not have the class "button${number}"`);
        expect(Observable.fromEvent.args[number - 1][1]).to.equal('click', `${name} fromEvent call: Second argument is not "click"`);
    }
});