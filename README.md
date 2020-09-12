# 🎣 catch-decorator

Allows you to handle exceptions in class methods with only one annotation
 (decorator). Idea of errors handling taken from Java.
Includes a finally block handler. Handlers receive all method parameters.

This is a fork of https://github.com/enkot/catch-decorator

To read about how it works:
https://codewithbanji.com/2020/08/04/angular-typescript-async-catch-finally-decorator/

And for other coding issues: 
https://codewithbanji.com

## Install

```bash
npm install catch-finally-decorator
```

## Why?
The main problem of handling errors are using "try/catch" blocks or "catch" methods for Promises. 
But if we use classes, for example for Vue components, why can't we use method decorators for handling errors? 

So, for example, instead of this:
```js
class Messenger {
    async getMessages() {
        try
            await api.getData() // <-- can throw ServerError
        } catch(err) {
            ...
        }   
    }
}
```
we can write this:
```js
import Catch from 'catch-decorator'

class Messenger {
    @Catch(ServerError, handler)
    async getMessages() {
        await api.getData() // <-- can throw custom ServerError
    }
}
```
much prettier, isn't it?


## How to use?
> `catch-decorator` works with any ECMAScript/Typescript classes. If you use Babel, [babel-plugin-transform-decorators-legacy](https://github.com/loganfsmyth/babel-plugin-transform-decorators-legacy) is needed. If you use TypeScript, enable `--experimentalDecorators` flag.

You can handle any thrown error:

```js
import Catch from 'catch-decorator'

const CatchAll = Catch(Error, (err: any) => console.log(err.message))

class Messenger {
    @CatchAll
    getMessages() {
        throw new TypeError('ReferenceError here!')
        ...
    }
}
```

or write decorators in stack to handle more than one errors type. In callback as second argument will be passed current instance object (context):
```js
class Messenger {
    @Catch(TypeError, (err, ctx) => {...})
    @Catch(ReferenceError, (err, ctx) => {...})
    getMessages() {
        throw new ReferenceError('ReferenceError here!')
        ...
    }
}
```

It also works with async methods:
```js
class Messenger {
    errorMessage = null

    @Catch(ServerError, (err, ctx) => ctx.errorMessage = err.message)
    getMessages() {
        return fetch(myRequest).then(response => { // can throw ServerError
            ...
        })
    }
}
```

The handler can accept the arguments of the method:
```js
import Catch from 'catch-decorator'

class Messenger {
    @Catch(SomeError, (error, ctx, args) => ctx.something(args /* args = [a,b] */))
    getMessages(a, b) {
        this.getData() // <-- can throw SomeError
    }
}
```

You can add a finally block like this:
```js
import Catch from 'catch-decorator'

class Messenger {
    @Catch(SomeError, handler, (ctx, args) => cts.something(args))
    getMessages() {
        this.getData() // <-- can throw SomeError
    }
}
```

## License:
MIT
