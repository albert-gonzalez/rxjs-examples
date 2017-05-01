import { expect } from 'chai';
import sinon from 'sinon';
import * as example6 from '../../../src/js/examples/example6';
import { JSDOM } from 'jsdom';
import { VirtualTimeScheduler, Subscriber, Observable, Subject } from 'rxjs';
import rxjs from 'rxjs';
import axios from 'axios';

describe('Example 6', () => {
    describe('initialize function', () => {
        let window;

        beforeEach(() => {
            window = new JSDOM('<div class="example6"><input class="input1" /><button class="button1">Send</button><div class="text"></div></div>').window;
            global.window =  window;
            global.document = window.document;
            sinon.stub(axios, 'get')
                .returns(Promise.resolve({
                    data: [{scientificName: 'AA', canonicalName: 'BB'}, {scientificName: 'CC', canonicalName: 'DD'}]
                }));
        });

        afterEach(() => {
            global.window = undefined;
            global.document = undefined;
            axios.get.restore();
        });

        describe('observable configuration', () => {
            let debounceTimeStub;
            let mapStub;
            let filterStub;
            let subscribeSpy;

            beforeEach(() => {
                subscribeSpy = sinon.spy();
                filterStub = sinon.stub().returns({ subscribe: subscribeSpy });
                mapStub = sinon.stub().returns({ filter: filterStub });
                debounceTimeStub = sinon.stub().withArgs(500).returns({ map: mapStub });

                sinon.stub(Observable, 'fromEvent').returns({ debounceTime: debounceTimeStub });
            });

            afterEach(() => {
                Observable.fromEvent.restore();
            });

            it('should call fromEvent', () => {
                example6.initialize(Observable);
                expect(Observable.fromEvent.calledOnce, 'fromEvent not called').equal(true);
            });

            it('should call debounceTime with argument 500', () => {
                example6.initialize(Observable);
                expect(debounceTimeStub.calledOnce, 'debounceTime not called').equal(true);
            });

            it('should call map', () => {
                example6.initialize(Observable);
                expect(mapStub.calledOnce, 'map not called').equal(true);
            });

            it('should call filter', () => {
                example6.initialize(Observable);
                expect(filterStub.calledOnce, 'filter not called').equal(true);
            });

            it('should call subscribe', () => {
                example6.initialize(Observable);
                expect(subscribeSpy.calledOnce, 'subscribe not called').equal(true);
            });
        });

        describe('subject configuration', () => {
            let subscribeSpy;

            beforeEach(() => {
                subscribeSpy = sinon.spy();

                sinon.stub(rxjs, 'Subject').returns({ subscribe: subscribeSpy });
            });

            afterEach(() => {
                rxjs.Subject.restore();
            });

            it('should create new Subject instance', () => {
                example6.initialize(undefined, Subject);
                expect(Subject.calledOnce, 'Subject instane not created').equal(true);
            });

            it('should call subscribe', () => {
                example6.initialize(undefined, Subject);
                expect(subscribeSpy.calledOnce, 'subscribe not called').equal(true);
            });
        });

        describe('return', () => {
            it('should return an Observable, a Subject and a Subscriber', () => {
                const [ customObservable, subject, subscriber ] = example6.initialize();

                expect(customObservable, 'Observable not returned').to.be.an.instanceOf(Observable);
                expect(subject, 'subject not returned').to.be.an.instanceOf(Subject);
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

            it('should emit the text written in the input with a debounce time of 500ms when its length is greather than 2', () => {
                const [ subscriberLocal, scheduler ] = initializeObservableWithSubscriber(subscriberCallbackSpy);
                const inputElement = document.querySelector('.example6 .input1');
                inputElement.value = 'Dog';
                inputElement.dispatchEvent(new window.KeyboardEvent('keyup'));
                inputElement.dispatchEvent(new window.KeyboardEvent('keyup'));
                subscriber = subscriberLocal;

                expect(subscriberCallbackSpy.called, 'emitted just after dispatched keyup events').equal(false);

                scheduler.flush();

                expect(subscriberCallbackSpy.called, 'Not emitted after 500 ms').equal(true);
                expect(subscriberCallbackSpy.calledOnce, 'Emitted more than once after 500ms').equal(true);
                expect(subscriberCallbackSpy.args[0][0]).equal('Dog');

                scheduler.frame = 0;
                inputElement.value = 'Do';
                inputElement.dispatchEvent(new window.KeyboardEvent('keyup'));
                scheduler.flush();

                expect(subscriberCallbackSpy.calledOnce, 'Emitted when input value length is less than 3').equal(true);
            });
        });

        describe('subject behaviour', () => {
            let subscriberCallbackSpy;
            let subscriber;

            beforeEach(() => {
                subscriberCallbackSpy = sinon.spy();
            });

            afterEach(() => {
                subscriber.unsubscribe();
            });

            it('should emit the text written in the input when the button is clicked', () => {
                const [ subscriberLocal, scheduler, subject ] = initializeSubjectWithSubscriber(subscriberCallbackSpy);
                const buttonElement = document.querySelector('.example6 .button1');
                const inputElement = document.querySelector('.example6 .input1');
                inputElement.value = 'Dog';
                buttonElement.dispatchEvent(new window.Event('click'));
                subscriber = subscriberLocal;

                expect(subscriberCallbackSpy.called, 'Not emitted on button click').equal(true);
                expect(subscriberCallbackSpy.args[0][0], 'Emitted value not correct').equal('Dog');
            });
        });

        describe('subscriber behaviour', () => {
            it('should make an axios get call with the emitted value and write the result in a text box on keyup', () => {
                const scheduler = new VirtualTimeScheduler(undefined, 500);
                const [ suggestObservable, subject ] = example6.initialize(undefined, undefined, scheduler);
                const inputElement = document.querySelector('.example6 .input1');
                const textElement = document.querySelector('.example6 .text');
                inputElement.value = 'Dog';

                expect(textElement.innerHTML, 'Text not empty before keyup').equal('');

                inputElement.dispatchEvent(new window.KeyboardEvent('keyup'));
                scheduler.flush();

                expect(axios.get.called, 'Axios get method not called').equal(true);
                expect(axios.get.args[0][0]).to.contain('q=Dog');

                return axios.get.returnValues[0].then(() =>  {
                    expect(textElement.innerHTML).equal('<li>AA (BB)</li><li>CC (DD)</li>');
                });
            });

            it('should make an axios get call with the emitted value and write the result in a text box on click', () => {
                const [ suggestObservable, subject ] = example6.initialize();
                const buttonElement = document.querySelector('.example6 .button1');
                const inputElement = document.querySelector('.example6 .input1');
                const textElement = document.querySelector('.example6 .text');
                inputElement.value = 'Dog';

                expect(textElement.innerHTML, 'Text not empty before clicking the button').equal('');

                buttonElement.dispatchEvent(new window.Event('click'));

                expect(axios.get.called, 'Axios get method not called').equal(true);
                expect(axios.get.args[0][0]).to.contain('q=Dog');

                return axios.get.returnValues[0].then(() =>  {
                    expect(textElement.innerHTML).equal('<li>AA (BB)</li><li>CC (DD)</li>');
                });
            });
        });
    });
});

function initializeObservableWithSubscriber(observer) {
    const scheduler = new VirtualTimeScheduler(undefined, 500);
    const [ suggestObservable, subject ] = example6.initialize(undefined, undefined, scheduler);
    const subscriber = suggestObservable.subscribe(observer);

    return [ subscriber, scheduler, subject ];
}

function initializeSubjectWithSubscriber(observer) {
    const [ suggestObservable, subject ] = example6.initialize();
    const subscriber = subject.subscribe(observer);

    return [ subscriber, subject ];
}