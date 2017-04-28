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

                expect(threeButtonsClickedObservable).to.be.an.instanceOf(Observable);
                expect(subscriber).to.be.an.instanceOf(Subscriber);
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
                expect(Observable.fromEvent.calledThrice).equal(true);
            });

            it('should call zip passing three observables as arguments', () => {
                example4.initialize(Observable);
                expect(Observable.zip.calledOnce).equal(true);
                expect(Observable.zip.args[0].length).equal(3);
                expect(Observable.zip.calledWith(...Observable.fromEvent.returnValues))
                        .equal(true);
            });

            it('should call scan', () => {
                example4.initialize(Observable);
                expect(scanStub.calledOnce).equal(true);
            });

            it('should call subscribe', () => {
                example4.initialize(Observable);
                expect(subscribeSpy.calledOnce).equal(true);
            });
        });

        describe('subscriber behaviour', () => {
            it('should increment counter by 1 when the three buttons are clicked', () => {
                const textElement = document.querySelector('.example4 .text');

                example4.initialize(Observable);

                document.querySelector('.button1').dispatchEvent(new window.Event('click'));
                expect(textElement.innerHTML).equal('');
                document.querySelector('.button2').dispatchEvent(new window.Event('click'));
                expect(textElement.innerHTML).equal('');
                document.querySelector('.button3').dispatchEvent(new window.Event('click'));
                expect(textElement.innerHTML).equal('1');

                document.querySelector('.button1').dispatchEvent(new window.Event('click'));
                document.querySelector('.button1').dispatchEvent(new window.Event('click'));
                expect(textElement.innerHTML).equal('1');

                document.querySelector('.button2').dispatchEvent(new window.Event('click'));
                document.querySelector('.button2').dispatchEvent(new window.Event('click'));
                expect(textElement.innerHTML).equal('1');

                document.querySelector('.button3').dispatchEvent(new window.Event('click'));
                expect(textElement.innerHTML).equal('2');
                document.querySelector('.button3').dispatchEvent(new window.Event('click'));
                expect(textElement.innerHTML).equal('3');
            });
        });
    });
});