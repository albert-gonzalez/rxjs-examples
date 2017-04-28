import { expect } from 'chai';
import sinon from 'sinon';
import * as example5 from '../../../src/js/examples/example5';
import { JSDOM } from 'jsdom';
import { VirtualTimeScheduler, Subscriber, Observable } from 'rxjs';

describe('Example 5', () => {
    describe('initialize function', () => {
        let window;

        beforeEach(() => {
            window = new JSDOM('<div class="example5"><input class="input1"><div class="text"></div></div>').window;
            global.window =  window;
            global.document = window.document;
        });

        afterEach(() => {
            global.window = undefined;
            global.document = undefined;
        });

        describe('return', () => {
            it('should return an Observable and a Subscriber', () => {
                const [ customObservable, subscriber ] = example5.initialize();

                expect(customObservable).to.be.an.instanceOf(Observable);
                expect(subscriber).to.be.an.instanceOf(Subscriber);
            });
        });

        describe('observable configuration', () => {
            let mapStub;
            let subscribeSpy;

            beforeEach(() => {
                subscribeSpy = sinon.spy();
                mapStub = sinon.stub().returns({ subscribe: subscribeSpy });

                sinon.stub(Observable, 'create').returns({ map: mapStub });
            });

            afterEach(() => {
                Observable.create.restore();
            });

            it('should call create', () => {
                example5.initialize(Observable);
                expect(Observable.create.calledOnce).equal(true);
            });

            it('should call map', () => {
                example5.initialize(Observable);
                expect(mapStub.calledOnce).equal(true);
            });

            it('should call subscribe', () => {
                example5.initialize(Observable);
                expect(subscribeSpy.calledOnce).equal(true);
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

            it('should emit the number written in the input box doubled when this changes', () => {
                subscriber = initializeObservableWithSubscriber(123, subscriberCallbackSpy);

                expect(subscriberCallbackSpy.calledOnce).equal(true);
                expect(subscriberCallbackSpy.args[0][0]).equal(246);
            });

            it('should fail if the value written is not a number', () => {
                subscriber = initializeObservableWithSubscriber('Cobi', null, subscriberCallbackSpy);

                expect(subscriberCallbackSpy.calledOnce).equal(true);
                expect(subscriberCallbackSpy.args[0][0]).equal('CRITICAL ERROR: Not a number!');
            });

            it('should fail if the value written is not a number', () => {
                subscriber = initializeObservableWithSubscriber('END', null, null, subscriberCallbackSpy);                

                expect(subscriberCallbackSpy.calledOnce).equal(true);
            });
        });

        describe('subscriber behaviour', () => {
            it('should write in the result box the emitted value', () => {
                const textElement = document.querySelector('.example5 .text');

                expect(textElement.innerHTML).equal('');

                initializeObservable(123);

                expect(textElement.innerHTML).equal('246');
            });

            it('should write in the result box the error message if the observable fails', () => {
                const textElement = document.querySelector('.example5 .text');

                expect(textElement.innerHTML).equal('');

                initializeObservable('Cobi');

                expect(textElement.innerHTML).equal('CRITICAL ERROR: Not a number!');
            });

            it('should write "COMPLETED" in the result box if the observable is completed', () => {
                const textElement = document.querySelector('.example5 .text');

                expect(textElement.innerHTML).equal('');

                initializeObservable('END');

                expect(textElement.innerHTML).equal('COMPLETED');
            });
        });
    });
});

function initializeObservableWithSubscriber(value, next, error, complete) {
    const inputElement = document.querySelector('.example5 .input1');
    const [ customObservable ] = example5.initialize();
    const subscriber = customObservable.subscribe(next, error, complete);

    inputElement.value = value;
    inputElement.dispatchEvent(new window.Event('change'));

    return subscriber;
}

function initializeObservable(value) {
    const inputElement = document.querySelector('.example5 .input1');
    const textElement = document.querySelector('.example5 .text');
    const [ customObservable ] = example5.initialize();

    inputElement.value = value;
    inputElement.dispatchEvent(new window.Event('change'));
}