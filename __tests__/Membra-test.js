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
const graphql_relay_1 = require("graphql-relay");
const schema2_1 = require("./../__fixtures__/schema2");
const Membra_1 = require("./../Membra");
const QueryParser_1 = require("./../QueryParser");
describe("Relay tests", () => {
    it("live node", () => __awaiter(this, void 0, void 0, function* () {
        const globalId1 = graphql_relay_1.toGlobalId("Model1", "15");
        const parser = new QueryParser_1.default(schema2_1.default);
        const query = parser.parse `query Q1{
            node(id: "${globalId1}"){
                ...F1
            }
        }
        fragment F1 on Model1{
            field1
            model2{
                field2
            }                
        }        
        `;
        const unsubscribe = jest.fn();
        const resolver = {
            unsubscribe,
            fetch: jest.fn((q, vars, subscriptionId) => {
                expect({ q, vars, subscriptionId }).toMatchSnapshot();
                return {
                    node: {
                        id: globalId1,
                        field1: "field1Value",
                        model2: {
                            id: graphql_relay_1.toGlobalId("Model2", "100"),
                            field2: 15,
                        },
                    },
                };
            }),
        };
        const relay = new Membra_1.default(resolver);
        const data = yield relay.live(query);
        // First query
        let result = yield data.onemitter.wait();
        expect(result).toMatchSnapshot();
        relay.updateNode(data.id, globalId1, { field1: "field1Value4" });
        result = yield data.onemitter.wait();
        expect(result).toMatchSnapshot();
    }));
    it("live connection", () => __awaiter(this, void 0, void 0, function* () {
        const parser = new QueryParser_1.default(schema2_1.default);
        const query = parser.parse `            query Q1{
                viewer{
                    model1{
                        edges{
                            node{
                                field1
                                model2{
                                    field2
                                }
                            }
                        }
                    }
                }
            }`;
        const globalId1 = graphql_relay_1.toGlobalId("Model2", "50");
        const unsubscribe = jest.fn();
        const resolver = {
            unsubscribe,
            fetch: jest.fn((q, vars, subscriptionId) => {
                expect({ q, vars, subscriptionId }).toMatchSnapshot();
                return {
                    viewer: {
                        id: graphql_relay_1.toGlobalId("Viewer", ""),
                        model1: {
                            edges: [{
                                    node: {
                                        id: globalId1,
                                        field1: "field1Value",
                                        model2: {
                                            id: graphql_relay_1.toGlobalId("Model2", "100"),
                                            field2: 15,
                                        },
                                    },
                                }],
                        },
                    },
                };
            }),
        };
        const globalId2 = graphql_relay_1.toGlobalId("Model1", "533");
        const relay = new Membra_1.default(resolver);
        const data = yield relay.live(query);
        let result = yield data.onemitter.wait();
        expect(result).toMatchSnapshot();
        // Test add node
        relay.addNode(data.id, globalId2, { field1: "field1Value2", model2: { field2: 18 }, excess1: "hi" });
        result = yield data.onemitter.wait();
        expect(result).toMatchSnapshot();
        // Test update node
        relay.updateNode(data.id, globalId1, { field1: "field1Value3", model2: { field2: 19 }, excess2: "hi2" });
        result = yield data.onemitter.wait();
        expect(result).toMatchSnapshot();
        // Test remove node
        relay.removeNode(data.id, globalId1);
        result = yield data.onemitter.wait();
        expect(result).toMatchSnapshot();
        // Test unsubscribe
        yield relay.restoreAllLive();
        result = yield data.onemitter.wait();
        expect(result).toMatchSnapshot();
        data.remove();
        relay.addNode(data.id, globalId2, { field1: "field1Value26", model2: { field2: 180 }, excess1: "hi3" });
        expect(unsubscribe.mock.calls.length).toBe(1);
    }));
});
