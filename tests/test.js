
import assert from 'assert';
import _ from 'lodash';
import constructor from '../src/constructor.js';

// Shorthand
const val = constructor.internal;

describe('constructor.js', function() {
    describe('constructor creation', function() {
        it('should return a function', function() {
            const construct = constructor();
            assert.strictEqual(typeof construct, 'function');
        });
    });
    
    describe('schema types', function() {
        const fixtures = [
            undefined,
            null,
            "foo",
            42,
            { x: "foo", y: 42 },
            ["foo", 42, null],
            function() {},
        ];
        
        it('should throw on an invalid schema', function() {
            const CustomType = function() {};
            const CustomObject = new CustomType();
            assert.throws(() => { constructor(CustomObject)(); }, /Invalid schema/);
        });
        
        describe('undefined', function() {
            const construct = constructor();
            
            it('should accept undefined as instance', function() {
                assert.strictEqual(construct()[val], undefined);
            });
            
            it('should not accept anything else as instance', function() {
                fixtures.filter(x => x !== undefined).forEach(candidate => {
                    assert.throws(() => { construct(candidate)[val]; }, /Failed to construct instance/);
                });
            });
        });
        
        describe('null', function() {
            const construct = constructor(null);
            
            it('should accept null as instance', function() {
                assert.strictEqual(construct(null)[val], null);
            });
            
            it('should not accept anything else as instance', function() {
                fixtures.filter(x => x !== null).forEach(candidate => {
                    assert.throws(() => { construct(candidate)[val]; }, /Failed to construct instance/);
                });
            });
        });
        
        describe('string', function() {
            const construct = constructor(String);
            
            it('should accept a string as instance', function() {
                assert.strictEqual(construct("foo")[val], "foo");
            });
            
            it('should not accept anything else as instance', function() {
                fixtures.filter(x => typeof x !== "string").forEach(candidate => {
                    assert.throws(() => { construct(candidate)[val]; }, /Failed to construct instance/);
                });
            });
        });
        
        describe('number', function() {
            const construct = constructor(Number);
            
            it('should accept a string as instance', function() {
                assert.strictEqual(construct(42)[val], 42);
            });
            
            it('should not accept anything else as instance', function() {
                fixtures.filter(x => typeof x !== "number").forEach(candidate => {
                    assert.throws(() => { construct(candidate)[val]; }, /Failed to construct instance/);
                });
            });
        });
        
        describe('object', function() {
            const construct = constructor({ x: String, y: Number });
            
            it('should accept a conformant object as instance', function() {
                assert.deepStrictEqual(construct({ x: "foo", y: 42 })[val], { x: "foo", y: 42 });
            });
            
            it('should not accept anything else as instance', function() {
                fixtures.filter(x => !_.isPlainObject(x)).forEach(candidate => {
                    assert.throws(() => { construct(candidate)[val]; }, /Failed to construct instance/);
                });
            });
        });
        
        describe('array', function() {
            const construct = constructor([ Number ]);
            
            it('should not accept a nonconformant array as instance', function() {
                assert.throws(() => { construct(["foo", "bar"]); }, /Failed to construct instance/);
            });
            
            it('should accept a conformant array as instance', function() {
                assert.deepStrictEqual(construct([0, 42, -1, 10])[val], [0, 42, -1, 10]);
            });
            
            it('should not accept anything else as instance', function() {
                fixtures.filter(x => !_.isArray(x)).forEach(candidate => {
                    assert.throws(() => { construct(candidate); }, /Failed to construct instance/);
                });
            });
        });
        
        describe('custom constructor', function() {
            const Type = function() {};
            const construct = constructor(Type);
            
            it('should accept an instance of the custom type as instance', function() {
                assert(construct(new Type())[val] instanceof Type);
            });
            
            it('should coerce anything else to an instance using the custom constructor', function() {
                fixtures.filter(x => !(x instanceof Type)).forEach(candidate => {
                    assert.doesNotThrow(() => { construct(candidate)[val]; });
                    assert(construct(candidate)[val] instanceof Type);
                });
            });
        });
    });
});
