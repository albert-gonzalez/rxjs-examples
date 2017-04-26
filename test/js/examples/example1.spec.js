import { expect } from 'chai';
import sinon from 'sinon';
import * as example1 from '../../../src/js/examples/example1';
import { JSDOM } from 'jsdom';
import { TestScheduler, VirtualTimeScheduler, VirtualAction, Observable } from 'rxjs';

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

        describe('return', () => {
            it('should return an Observable', () => {
                const buttonClicked = example1.initialize();
                expect(buttonClicked).to.be.an.instanceOf(Observable);
            });
        });

        describe('stream configuration', () => {
            let delaySpy;
            let subscribeSpy;

            beforeEach(() => {
                subscribeSpy = sinon.spy();
                delaySpy = sinon.stub().withArgs(1000).returns({ subscribe: subscribeSpy });

                sinon.stub(Observable, 'fromEvent').returns({ delay: delaySpy });
            });

            afterEach(() => {
                Observable.fromEvent.restore();
            });

            it('should call fromEvent', () => {
                const buttonClicked = example1.initialize(Observable);
                expect(Observable.fromEvent.calledOnce).to.be.true;
            });

            it('should call delay with 1000 ms', () => {
                const buttonClicked = example1.initialize(Observable);
                expect(delaySpy.calledOnce).to.be.true;
            });

            it('should call subscribe', () => {
                const buttonClicked = example1.initialize(Observable);
                expect(subscribeSpy.calledOnce).to.be.true;
            });
        });

        describe('result', () => {
            it('should set background of .rectangle1 with a rgb value after 1 second of clicking button', () => {
                const scheduler = new VirtualTimeScheduler(VirtualAction, 1000);
                const buttonClicked = example1.initialize(Observable, scheduler);
                const rectangleElement = document.querySelector('.example1 .rectangle1');

                document.querySelector('.button1').dispatchEvent(new window.Event('click'));
                expect(rectangleElement.style.background).to.be.empty;

                scheduler.flush();
                expect(rectangleElement.style.background).to.contain('rgb');
            });
        });
    });
});