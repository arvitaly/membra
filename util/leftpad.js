"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function pad(str, n, symbol = "    ") {
    return new Array(n).join(symbol) + str;
}
exports.default = pad;
