"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var HttpResolver_1 = require("./HttpResolver");
exports.HttpResolver = HttpResolver_1.default;
var Membra_1 = require("./Membra");
exports.Membra = Membra_1.default;
var QueryParser_1 = require("./QueryParser");
exports.QueryParser = QueryParser_1.default;
var Generator_1 = require("./Generator");
exports.Generator = Generator_1.default;
function returnof(fn) {
    return null && fn();
}
exports.returnof = returnof;
function returnofPromise(fn) {
    return null && fn();
}
exports.returnofPromise = returnofPromise;
