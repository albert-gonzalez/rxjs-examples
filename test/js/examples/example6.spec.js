import { expect } from 'chai';
import sinon from 'sinon';
import * as example6 from '../../../src/js/examples/example6';
import { JSDOM } from 'jsdom';
import { VirtualTimeScheduler, Subscriber, Observable, Subject } from 'rxjs';
import * as creators from 'rxjs';
import axios from 'axios';
import * as operators from 'rxjs/operators';

describe('Example 6', () => {
    describe('initialize function', () => {
        let window;

        beforeEach(() => {
            window = new JSDOM('<input class="input_6" /><button class="button_6">Send</button><div class="text_6"></div>').window;
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

        describe('subject configuration', () => {
            let subscribeSpy;

            beforeEach(() => {
                subscribeSpy = sinon.spy();

                sinon.stub(creators, 'Subject').returns({ subscribe: subscribeSpy });
            });

            afterEach(() => {
                creators.Subject.restore();
            });

            it('should create new Subject instance', () => {
                example6.initialize();
                expect(Subject.calledOnce, 'Subject instance not created').equal(true);
            });

            it('should call subscribe with arguments: A function. For now can be empty.', () => {
                example6.initialize();
                expect(subscribeSpy.calledOnce, 'subscribe not called').equal(true);
                expect(subscribeSpy.args[0][0], 'First argument is not a function').to.be.a('function');
            });
        });

        describe('observable configuration', () => {
            let subscribeSpy;
            let pipeStub;

            beforeEach(() => {
                subscribeSpy = sinon.spy();
                pipeStub = sinon.stub().returns({ subscribe: subscribeSpy });

                sinon.stub(creators, 'fromEvent').returns({ pipe: pipeStub, subscribe: subscribeSpy });
                sinon.spy(operators, 'filter');
                sinon.spy(operators, 'map');
                sinon.spy(operators, 'debounceTime');
            });

            afterEach(() => {
                creators.fromEvent.restore();
                operators.filter.restore();
                operators.map.restore();
                operators.debounceTime.restore();
            });

            it('should call creators.fromEvent with arguments: a HTMLInputElement instance with the class input_6 and the string "keyup" (use getElement function) ', () => {
                example6.initialize();
                expect(creators.fromEvent.calledOnce, 'fromEvent not called').equal(true);
                expect(creators.fromEvent.args[0][0]).to.be.an.instanceOf(window.HTMLInputElement, `FromEvent call: First argument is not a HTMLInputElement instance`);
                expect(creators.fromEvent.args[0][0].className).to.equal(`input_6`, `FromEvent call: First argument does not have the class "input_6"`);
                expect(creators.fromEvent.args[0][1]).to.equal('keyup', `FromEvent call: Second argument is not "keyup"`);
            });

            it('should call debounceTime with arguments: 500 and scheduler instance', () => {
                example6.initialize(new VirtualTimeScheduler());
                expect(operators.debounceTime.calledOnce, 'debounceTime not called').equal(true);
                expect(operators.debounceTime.args[0][0], 'First argument is not 500').equal(500);
                expect(operators.debounceTime.args[0][1], 'Second argument is not a scheduler instance').to.be.an.instanceOf(VirtualTimeScheduler);
            });

            it('should call map with argument: A function that receives an Event and returns the value from the event (use getValueFromElement function)', (done) => {
                example6.initialize();

                if (!operators.map.calledOnce) {
                    done(expect(operators.map.calledOnce, 'map not called').equal(true));
                }
                if (typeof operators.map.args[0][0] !== 'function') {
                    done(expect(operators.map.args[0][0], 'First argument is not a function').to.be.a('function'));
                }

                const inputElement = document.querySelector('.input_6');
                inputElement.value = 'Dog';
                const eventListener = function(event) {
                    const returnedValue = operators.map.args[0][0](event);
                    if (returnedValue !== 'Dog') {
                        done(new Error(`First argument: Function does not return the value from the event. Expecting Dog; Returned ${returnedValue}`));
                    } else {
                        done();
                    }
                };
                inputElement.addEventListener('keyup', eventListener);
                inputElement.dispatchEvent(new window.KeyboardEvent('keyup'));
                inputElement.removeEventListener('keyup', eventListener);
            });

            it('should call filter with arguments: Function that receives a string and returns true if the lenght of the string is > 2', () => {
                example6.initialize();
                expect(operators.filter.calledOnce, 'filter not called').equal(true);
                expect(operators.filter.args[0][0], 'First argument is not a function').to.be.a('function');
                expect(operators.filter.args[0][0]('ME'), 'First argument does not return false if the length of the received string is less than 3').to.equal(false);
                expect(operators.filter.args[0][0](''), 'First argument does not return false if the length of the received string is 0').to.equal(false);
                expect(operators.filter.args[0][0]('Dog'), 'First argument does not return true if the length of the received string is greater than 2').to.equal(true);
            });

            it('should call subscribe with argument: the Subject instance created before', () => {
                example6.initialize();
                expect(subscribeSpy.calledOnce, 'subscribe not called').equal(true);
                expect(subscribeSpy.args[0][0], 'First argument is not a Subject instance').to.be.an.instanceOf(Subject);
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

            it('should emit the text written in the input with a debounce time of 500ms when its length is greater than 2', () => {
                const [ subscriberLocal, scheduler ] = initializeObservableWithSubscriber(subscriberCallbackSpy);
                const inputElement = document.querySelector('.input_6');
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

            it('should emit the text written in the input when the button is clicked (use addClickEventListenerToElement and getValueFromElement functions. The listener callback function calls the instance function Subject.next to emit an event with the value of the input_6)', () => {
                const [ subscriberLocal, scheduler, subject ] = initializeSubjectWithSubscriber(subscriberCallbackSpy);
                const buttonElement = document.querySelector('.button_6');
                const inputElement = document.querySelector('.input_6');
                inputElement.value = 'Dog';
                buttonElement.dispatchEvent(new window.Event('click'));
                subscriber = subscriberLocal;

                expect(subscriberCallbackSpy.called, 'Not emitted on button click').equal(true);
                expect(subscriberCallbackSpy.args[0][0], 'Emitted value not correct').equal('Dog');
            });
        });

        describe('subscriber behaviour', () => {
            it('should make an Ajax call using Axios with the emitted value and write the result in a text box on keyup (use searchSpecieAndWriteListInElement function)', () => {
                const scheduler = new VirtualTimeScheduler(undefined, 500);
                example6.initialize(scheduler);
                const inputElement = document.querySelector('.input_6');
                const textElement = document.querySelector('.text_6');
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
                const buttonElement = document.querySelector('.button_6');
                const inputElement = document.querySelector('.input_6');
                const textElement = document.querySelector('.text_6');
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
    const [ suggestObservable, subject ] = example6.initialize(scheduler);
    const subscriber = suggestObservable.subscribe(observer);

    return [ subscriber, scheduler, subject ];
}

function initializeSubjectWithSubscriber(observer) {
    const [ suggestObservable, subject ] = example6.initialize();
    const subscriber = subject.subscribe(observer);

    return [ subscriber, subject ];
}
