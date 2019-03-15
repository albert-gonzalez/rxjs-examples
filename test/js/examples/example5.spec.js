import { expect } from 'chai';
import sinon from 'sinon';
import * as example5 from '../../../src/js/examples/example5';
import { JSDOM, VirtualConsole } from 'jsdom';
import { Subscriber, Observable } from 'rxjs';
import * as creators from 'rxjs';
import * as operators from 'rxjs/operators';

describe('Example 5', () => {
    describe('initialize function', () => {
        let window;

        beforeEach(() => {
            const virtualConsole = new VirtualConsole();
            virtualConsole.on('error', () => {});
            window = new JSDOM('<input class="input_5"><div class="text_5"></div>', { virtualConsole }).window;
            global.window =  window;
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

                sinon.stub(creators, 'Observable').returns({ pipe: pipeStub, subscribe: subscribeSpy });
                sinon.spy(operators, 'map');
            });

            afterEach(() => {
                creators.Observable.restore();
                operators.map.restore();
            });

            it('should call new Observable with the argument: A function that receives an observer and configures the observable. See the examples page for more info (use addChangeEventListenerToElement and getElementValueFromEvent functions)', () => {
                example5.initialize();
                expect(creators.Observable.calledOnce, 'create not called').equal(true);
                expect(creators.Observable.args[0][0], 'First argument is not a function').to.be.a('function');
            });

            it('should call map with argument: A function that receives a number and return this number multiplied by 2', () => {
                example5.initialize();
                expect(operators.map.calledOnce, 'map not called').equal(true);
                expect(operators.map.args[0][0], 'First argument is not a function').to.be.a('function');
                expect(operators.map.args[0][0](5), 'First argument: Function does not return the received number multiplied by 2').to.equal(10);
            });

            it('should call subscribe with three arguments: 1) A function that writes the emitted value in a text; 2) A function that writes the error in a text; 3) A function that writes END in a text when Observable is completed (use writeTextInElement function)', () => {
                example5.initialize(Observable);
                expect(subscribeSpy.calledOnce, 'subscribe not called').equal(true);
                expect(subscribeSpy.args[0][0], 'First argument is not a function').to.be.a('function');
                expect(subscribeSpy.args[0][0], 'Second argument is not a function').to.be.a('function');
                expect(subscribeSpy.args[0][0], 'Third argument is not a function').to.be.a('function');
            });
        });

        describe('return', () => {
            it('should return an Observable and a Subscriber', () => {
                const [ customObservable, subscriber ] = example5.initialize();

                expect(customObservable, 'Observable not returned').to.be.an.instanceOf(Observable);
                expect(subscriber, 'Subscriber not returned').to.be.an.instanceOf(Subscriber);
            });
        });

        describe('observable behaviour', () => {
            let subscriberCallbackSpy;
            let subscriber;

            beforeEach(() => {
                subscriberCallbackSpy = sinon.spy();
            });

            afterEach(() => {
                subscriber.unsubscribe();
            });

            it('should emit the number written in the input box doubled when this input changes', () => {
                subscriber = initializeObservableWithSubscriber(123, subscriberCallbackSpy);

                expect(subscriberCallbackSpy.calledOnce, 'observable not emitted').equal(true);
                expect(subscriberCallbackSpy.args[0][0], 'emitted value not correct').equal(246);
            });

            it('should fail if the value written in the input is not a number', () => {
                subscriber = initializeObservableWithSubscriber('Cobi', null, subscriberCallbackSpy);

                expect(subscriberCallbackSpy.calledOnce, 'observable fail not emitted').equal(true);
                expect(subscriberCallbackSpy.args[0][0]).equal('CRITICAL ERROR: Not a number!');
            });

            it('should complete if the value written in the input is END', () => {
                subscriber = initializeObservableWithSubscriber('END', null, null, subscriberCallbackSpy);

                expect(subscriberCallbackSpy.calledOnce, 'observable not completed').equal(true);
            });
        });

        describe('subscriber behaviour', () => {
            it('should write in the result box the emitted value', () => {
                const textElement = document.querySelector('.text_5');

                expect(textElement.innerHTML, 'text_5 element not empty').equal('');

                initializeObservable(123);

                expect(textElement.innerHTML, 'text_5 element content incorrect').equal('246');
            });

            it('should write in the result box the error message if the observable fails', () => {
                const textElement = document.querySelector('.text_5');

                expect(textElement.innerHTML, 'text_5 element not empty').equal('');

                    initializeObservable('Cobi');

                expect(textElement.innerHTML, 'text_5 element content incorrect').equal('CRITICAL ERROR: Not a number!');
            });

            it('should write "COMPLETED" in the result box if the observable is completed', () => {
                const textElement = document.querySelector('.text_5');

                expect(textElement.innerHTML, 'text_5 element not empty').equal('');

                initializeObservable('END');

                expect(textElement.innerHTML, 'text_5 element not empty').equal('COMPLETED');
            });
        });
    });
});

function initializeObservableWithSubscriber(value, next, error, complete) {
    const inputElement = document.querySelector('.input_5');
    const [ customObservable ] = example5.initialize();
    const subscriber = customObservable.subscribe(next, error, complete);

    inputElement.value = value;
    inputElement.dispatchEvent(new window.Event('change'));

    return subscriber;
}

function initializeObservable(value) {
    const inputElement = document.querySelector('.input_5');
    document.querySelector('.text_5');
    example5.initialize();

    inputElement.value = value;
    inputElement.dispatchEvent(new window.Event('change'));
}
