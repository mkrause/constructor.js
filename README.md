
# constructor.js

Utility library to create JavaScript constructors based on a declarative schema.


## Usage:

Example:

```js
    import constructor from '@mkrause/constructor';
    
    const MyConstructor = constructor({ x: String, y: Number });
    const myInstance = MyConstructor({ x: "foo", y: 42 });
    myInstance instanceof MyConstructor; // true
    
    MyConstructor({ x: "foo", y: "42" }); // Throws `InvalidInstanceException`
```

Each instance stores the validated value in a property accessed through a special symbol `constructor.internal`:

```js
    const Person = constructor({ name: String, score: Number });
    const john = Person({ name: "John", score: 101 });
    
    john[constructor.internal]; // { name: "John", score: 101 }
```

This internal property is not supposed to be accessed by the consumer directly. Instead, a constructor should specify a public API through `extend()`:

```js
    const Person = constructor({ name: String, score: Number })
        .extend({
            get name() { return this[constructor.internal].name; },
            get score() { return this[constructor.internal].score; },
        });
    
    const john = Person({ name: "John", score: 101 });
    john.name; // "John"
```

Any JS constructor can be used as type in a schema, including other constructors defined using `constructor()`:

```js
    const Post = constructor({ author: Person, submitted: Date });
    const post = Post({ author: john, submitted: new Date("2017-01-01") });
```


## Similar libraries

- https://github.com/molnarg/js-schema
