
// Alternative implementation of Object.assign, with support for getters/setters.
// See e.g.
// - http://stackoverflow.com/questions/6039676/copying-javascript-getters-setters

export default (target, ...sources) => {
    for (let source of sources) {
        // Note: `Object.getOwnPropertyDescriptors()` includes both names and symbols
        const propDescriptors = Object.getOwnPropertyDescriptors(source);
        for (let key of Reflect.ownKeys(propDescriptors)) {
            Object.defineProperty(target, key, propDescriptors[key]);
        }
    }
    
    return target;
};
