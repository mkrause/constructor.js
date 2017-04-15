
import _ from 'lodash';
import assign from './assign.js';


export class InvalidSchemaException extends Error {
    constructor(reason) {
        super(`Invalid schema: ${reason}`);
    }
}

export class InvalidInstanceException extends Error {
    constructor(reason, value) {
        super(`Failed to construct instance: ${reason}, given '${JSON.stringify(value)}'`);
    }
}

// Take a schema (a JS value which describes other JS values), and a value. If the
// value does not correspond to the schema, we throw an exception. Otherwise, we return
// the valid instance.
const interpret = (schema, value) => {
    let interpretedValue = value;
    
    if (schema === undefined) {
        if (value !== undefined) {
            throw new InvalidInstanceException("Expected lack of argument", value);
        }
    } else if (schema === null) {
        if (value !== null) {
            throw new InvalidInstanceException("Expected null", value);
        }
    } else if (schema === String) {
        if (typeof value === 'string' || value instanceof String) {
            return value;
        } else {
            throw new InvalidInstanceException("Expected a string", value);
        }
    } else if (schema === Number) {
        if (typeof value === 'number' || value instanceof Number) {
            return value;
        } else {
            throw new InvalidInstanceException("Expected a number", value);
        }
    } else if (_.isPlainObject(schema)) {
        if (!_.isPlainObject(value)) {
            throw new InvalidInstanceException("Expected object", value);
        }
        
        const missingProperties = _.difference(
            Object.getOwnPropertyNames(schema),
            Object.getOwnPropertyNames(value)
        );
        
        if (missingProperties.length > 0) {
            const missingPropNames = missingProperties.map(prop => `'${prop}'`).join(', ');
            throw new InvalidInstanceException(`Missing properties: ${missingPropNames}`, value);
        }
        
        // Interpret of the each of the properties
        interpretedValue = _.mapValues(schema, (schemaProp, propName) =>
            interpret(schemaProp, value[propName])
        );
    } else if (_.isArray(schema) && schema.length === 1) {
        // XXX alternative idea: we could treat the array as a tuple (but objects would be better for that purpose)
        // if (!_.isArray(value)) {
        //     throw new InvalidInstanceException("Expected array", value);
        // } else if (value.length < schema.length) {
        //     throw new InvalidInstanceException("Missing array element", value);
        // } else if (value.length > schema.length) {
        //     throw new InvalidInstanceException("Superfluous array element given", value);
        // }
        
        const elementSchema = schema[0];
        
        if (!_.isArray(value)) {
            throw new InvalidInstanceException("Expected array", value);
        }
        
        // Interpret each of the array elements separately
        interpretedValue = value.map((element, index) => interpret(elementSchema, element));
    } else if (_.isFunction(schema)) {
        // Assume functions are (JavaScript) constructors
        if (value instanceof schema) {
            interpretedValue = value;
        } else {
            try {
                let ret;
                try {
                    ret = schema(value);
                } catch (e) {}
                
                if (ret instanceof schema) {
                    interpretedValue = ret;
                } else if (schema.hasOwnProperty('prototype')) {
                    interpretedValue = new schema(value);
                } else {
                    throw new Error("Unrecognized value");
                }
            } catch (e) {
                throw new InvalidInstanceException(e.message, value);
            }
        }
    } else {
        // Schema itself is invalid. This indicates a bug in the application itself.
        throw new InvalidSchemaException("Invalid schema");
    }
    
    return interpretedValue;
};

// Symbol used to store the internal value of an instance
const _internalValue = Symbol('internal-value');

// Take a schema (represented as a JS object), and return a JS constructor which constructs
// instances of that schema.
const constructor = (schema = undefined) => {
    let constrain;
    
    // Note: we create a new constructor function for each schema, so that we can extend it
    // dynamically (see `Constructor.extend`).
    const Constructor = function(value = undefined) {
        if (!(this instanceof Constructor)) {
            return new Constructor(value);
        }
        
        const instance = interpret(schema, value);
        
        if (constrain) {
            try {
                constrain(instance);
            } catch (e) {
                throw new InvalidInstanceException(e.message, instance);
            }
        }
        
        this[_internalValue] = instance;
    };
    
    // Expose the schema on the constructor
    Constructor.schema = schema;
    
    // Remove name of this constructor, such that the name "Constructor" does not show up
    // in console output. (We may want to make this customizable.)
    Object.defineProperty(Constructor, "name", { value: "" });
    
    Constructor.constrain = fn => { constrain = fn; return Constructor };
    
    // Extend this constructor with the given additional properties
    Constructor.extend = props => {
        assign(Constructor.prototype, props);
        return Constructor; // Allow for chaining
    };
    
    return Constructor;
};

constructor.value = _internalValue;
export default constructor;
