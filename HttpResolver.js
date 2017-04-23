"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
class Resolver {
    constructor(config) {
        this.config = config;
    }
    fetch(query, vars, _) {
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield fetch(this.config.address, {
                method: "POST",
                body: JSON.stringify({
                    query,
                    vars,
                }),
                headers: {
                    "Content-Type": "application/json",
                },
            });
            return yield res.json();
        });
    }
    unsubscribe(_) {
        throw new Error("Not implemented");
    }
}
exports.default = Resolver;