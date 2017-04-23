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
const HttpResolver_1 = require("./../HttpResolver");
it("when fetch, should call global fetch with true params", () => __awaiter(this, void 0, void 0, function* () {
    const fetchFn = jest.fn();
    global.fetch = fetchFn;
    const address = "http://127.0.0.1:1337/graphql";
    const resolver = new HttpResolver_1.default({ address });
    fetchFn.mockImplementation(() => {
        return Promise.resolve({
            json: () => {
                return { test: 15 };
            },
        });
    });
    const result = yield resolver.fetch(`query Q1{
        viewer{
            users{
                edges{
                    node{
                        name
                    }
                }
            }
        }
    }`, { id: 1 });
    expect(fetchFn.mock.calls).toMatchSnapshot();
    expect(result).toMatchSnapshot();
}));
