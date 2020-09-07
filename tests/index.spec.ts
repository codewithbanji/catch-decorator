import Catch from '../src'
describe('catch-decorator', () => {
    let handler

    beforeEach(() => {
        handler = jest.fn()
    })
    
    it('calls handler with error object and context object arguments', () => {        
        class TestClass {
            @Catch(ReferenceError, handler)
            testMethod(a, b) {
                throw new ReferenceError("Error here")
                
                return 'Test'
            }
        }
        let args = [1,2];
        new TestClass().testMethod(1,2)

        expect(handler).toBeCalledWith(expect.any(ReferenceError),expect.any(TestClass),  args)
    })

    it('handle errors in async methods', async () => {        
        class TestClass {
            @Catch(ReferenceError, handler)
            async testMethod(a,b) {
                await Promise.reject(new ReferenceError("Error here"))
                
                return 'Test'
            }
        }
        let args = [1,2];
       await  new TestClass().testMethod(1,2)

        expect(handler).toBeCalledWith(expect.any(ReferenceError), expect.any(TestClass), args)
    })

    it('handle correct error with chained decorators', async () => {    
        class TestClass {
            @Catch(ReferenceError, handler)
            @Catch(TypeError, handler)
            testMethod(a,b) {
                throw new ReferenceError("Error here")
                throw new TypeError("Error here")

                return 'Test'
            }
        }
        new TestClass().testMethod()
        let args = [1,2];
        new TestClass().testMethod(1,2);
        expect(handler).toBeCalledWith(expect.any(ReferenceError),expect.any(TestClass),  args)
    })

    it('run "Error" handler if specific handler not registered', () => {        
        const handlerError = jest.fn()

        class TestClass {
            @Catch(Error, handlerError)
            @Catch(TypeError, handler)
            testMethod(a,b) {
                throw new ReferenceError("Error here")
                
                return 'Test'
            }
        }
        let args = [1,2];
        new TestClass().testMethod(1,2)

        expect(handlerError).toBeCalledWith(expect.any(ReferenceError),expect.any(TestClass),  args)
    })

    it('handle errors in static methods', () => {        
        class TestClass {
            @Catch(ReferenceError, handler)
            static testMethod(a,b) {
                throw new ReferenceError("Error here")
            }
        }
        let args = [1,2];
        TestClass.testMethod(1,2)

        expect(handler).toBeCalledWith(expect.any(ReferenceError),expect.any(Function),  args)
    })

    it('context passed correctly for regular function', () => { 
        handler = jest.fn(function (error, ctx, args){
            expect(this.param).toEqual(2);
        });
        class TestClass {
            param = 0;
            @Catch(ReferenceError, handler)
            testMethod(a,b) {
                this.param = 2;
                throw new ReferenceError("Error here")
            }
        }
        let args = [1,2];

        new TestClass().testMethod(1,2)

        expect(handler).toBeCalledWith(expect.any(ReferenceError),expect.any(TestClass),  args)
    })

    it('finalizer called with sync method', () => { 

        let finalizer = jest.fn();
        class TestClass {
            @Catch(ReferenceError, handler, finalizer)
            testMethod(a,b) {
                throw new ReferenceError("Error here")
            }
        }
        let args = [1,2];

        new TestClass().testMethod(1,2)

        expect(finalizer).toBeCalledWith(expect.any(TestClass),  args)
    })

    it('finalizer called in async method', async () => {    
        let finalizer = jest.fn();
    
        class TestClass {
            @Catch(ReferenceError, handler,finalizer)
            async testMethod(a,b) {
                await Promise.reject(new ReferenceError("Error here"))
                
                return 'Test'
            }
        }
        let args = [1,2];
       await  new TestClass().testMethod(1,2)

        expect(finalizer).toBeCalledWith(expect.any(TestClass), args)
    })

    it('context passed correctly for regular function in finalizer', () => { 
        let finalizer = jest.fn(function (ctx, args){
            expect(this.param).toEqual(2);
        });
        class TestClass {
            param = 0;
            @Catch(ReferenceError, handler, finalizer)
            testMethod(a,b) {
                this.param = 2;
                throw new ReferenceError("Error here")
            }
        }
        let args = [1,2];

        new TestClass().testMethod(1,2)

        expect(finalizer).toBeCalledWith(expect.any(TestClass),  args)
    })
})