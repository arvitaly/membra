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
const node_fetch_1 = require("node-fetch");
class Resolver {
    constructor(config) {
        this.config = config;
        this.fetchClient = this.config.fetch || node_fetch_1.default;
    }
    fetch(query, vars, _) {
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield this.fetchClient(this.config.address, {
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
