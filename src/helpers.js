function isFunction(o){
	return typeof o === "function";
}
function isObject(o){
    return typeof o === "object";
}
function isPlainObject(o){
	return o && isObject(o) && Object.getPrototypeOf(o) === Object.prototype;
}

var isArray = function(a){	return a instanceof Array; };

function toString(obj, stack){
	if(stack && (stack.length > 15 || stack.indexOf(obj) >= 0)){ return '...'; }
	if(obj == null){ return String(obj); }
	if(typeof obj == "string"){ return '"'+obj+'"'; }
	stack = [obj].concat(stack);
	if(isFunction(obj)){ return obj.name || obj.toString(stack); }
	if(isArray(obj)){
		return '[' + obj.map(function(item) {
				return toString(item, stack);
			}).join(', ') + ']';
	}
	if(obj && isObject(obj)){
		var indent = (new Array(stack.length-1)).join('\t');
		return '{' + Object.keys(obj).map(function(key){
				return '\n' + indent + key + ': ' + toString(obj[key], stack);
			}).join(',') + '\n' + '}';
	}
	return String(obj)
}

function bettertypeof(obj){
	return ({}).toString.call(obj).match(/\s([a-zA-Z]+)/)[1];
}

function cloneArray(arr){
	return Array.prototype.slice.call(arr);
}

function merge(target, src, deep) {
	Object.keys(src || {}).forEach(function(key){
		if(deep && isPlainObject(src[key])){
			var o = {};
			merge(o, target[key], deep);
			merge(o, src[key], deep);
			target[key] = o;
		} else {
			target[key] = src[key]
		}
	});
}

function define(obj, key, val, enumerable) {
	Object.defineProperty(obj, key, {
		value: val,
		enumerable: enumerable || !canSetProto,
		writable: true,
		configurable: true
	});
}

var canSetProto = !!Object.setPrototypeOf || {__proto__:[]} instanceof Array;
Object.getPrototypeOf = Object.getPrototypeOf || function(o){ return o[_PROTO] };
Object.setPrototypeOf = Object.setPrototypeOf || function(o, p){
	if(!canSetProto){
		for(var k in p){ o[k] = p[k]; }
	}
	define(o, _PROTO, p);
};

function setConstructor(model, constructor){
	Object.setPrototypeOf(model, constructor[PROTO]);
	define(model, CONSTRUCTOR, constructor);
}

function setConstructorProto(constructor, proto){
	constructor[PROTO] = Object.create(proto);
	canSetProto || define(constructor[PROTO], _PROTO, proto);
	constructor[PROTO][CONSTRUCTOR] = constructor;
}

var isProxySupported = isFunction(this.Proxy);

// shim for Function.name for browsers that don't support it. IE, I'm looking at you.
if (!("name" in Function.prototype && "name" in (function x() {}))) {
	Object.defineProperty(Function.prototype, "name", {
		get: function() {
			var results = Function.prototype.toString.call(this).match(/\s*function\s+([^\(\s]*)\s*/);
			return results && results[1];
		}
	});
}