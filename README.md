
# constructor.js

Create JavaScript constructors using declarative schema definitions.

Utility library for creating JavaScript constructors. A "constructor" being a function that takes some argument and creates a new object of a certain type. Supports validation of the argument through a basic schema mechanism.


## Usage:

Example:

```js
    import constructor from 'constructor.js';
    
    const MyConstructor = constructor({ x: String, y: Number });
    const myInstance = MyConstructor({ x: "foo", y: 42 });
    myInstance instanceof MyConstructor; // true
    
    const myInstance = MyConstructor({ x: "foo", y: "42" }); // Throws `InvalidInstanceException`
```


## Similar libraries

- https://github.com/molnarg/js-schema
