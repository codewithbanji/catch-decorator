
// originaly by https://github.com/enkot/catch-decorator/blob/master/src/index.ts

type HandlerFunction = (error: any, ctx?: any, args?: any[]) => void;
type Finalizer = (ctx?: any, args?: any[]) => void;

function handleError(
    ctx: any,
    errorClass: any,
    handler: HandlerFunction,
    error: any,
    args: any[]
) {


    // check if error is instance of passed error class
    if (typeof handler === 'function' && error instanceof errorClass) {
        // run handler with error object
        // and class context as second argument
        handler.call(null, error, ctx, args)
    } else {
        // throw error further,
        // next decorator in chain can catch it
        throw error
    }
}

// decorator factory function
export default (errorClass: any, handler: HandlerFunction, finalizer?: Finalizer): any => {
    return (
        target: any,
        propertyKey: string,
        descriptor: PropertyDescriptor,
    ) => {
        // save a reference to the original method
        const originalMethod = descriptor.value

        // rewrite original method with custom wrapper
        descriptor.value = function(...args: any[]) {
            let isPromise = false;
            try {
                const result = originalMethod.apply(this, args)

                // check if method is asynchronous
                if (result && typeof result.then === 'function' && typeof result.catch === 'function') {
                    isPromise = true;
                    // return promise
                    return result.catch((error: any) => {
                        handleError(this, errorClass, handler, error,args )
                    // and the finally block here:
                    }).finally(() => {if(finalizer) finalizer.call(null,this,args)});
                }

                // return actual result
                return result
            } catch (error) {
               handleError(this, errorClass, handler, error, args)
            } finally{
              if(!isPromise){
                if(finalizer) finalizer.call(null,args)
              }
            }
        }

        return descriptor
    }
}
