import { toGlobalId } from "graphql-relay";
import schema from "./../__fixtures__/schema2";
import Relay, { IResolver } from "./../Membra";
import QueryParser from "./../QueryParser";

describe("Relay tests", () => {
    it("live node", async () => {
        const globalId1 = toGlobalId("Model1", "15");
        const parser = new QueryParser(schema);
        const query = parser.parse`query Q1{
            node(id: "${globalId1}"){
                ...F1
            }
        }
        fragment F1 on Model1{
            field1
            model2{
                field2
            }
        }`;
        const unsubscribe = jest.fn();
        const resolver: IResolver = {
            unsubscribe,
            fetch: jest.fn((q: string, vars?: any, subscriptionId?: string) => {
                expect({ q, vars, subscriptionId }).toMatchSnapshot();
                return {
                    data: {
                        node: {
                            id: globalId1,
                            field1: "field1Value",
                            model2: {
                                id: toGlobalId("Model2", "100"),
                                field2: 15,
                            },
                        },
                    },
                };

            }),
        };
        const relay = new Relay(resolver);
        const data = await relay.live(query);
        // First query
        let result = await data.onemitter.wait();
        expect(result).toMatchSnapshot();
        relay.updateNode(data.id, globalId1, { field1: "field1Value4" });
        result = await data.onemitter.wait();
        expect(result).toMatchSnapshot();
    });
    it("live connection", async () => {
        const parser = new QueryParser(schema);
        const query = parser.parse`            query Q1{
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
        const globalId1 = toGlobalId("Model2", "50");
        const unsubscribe = jest.fn();
        const resolver: IResolver = {
            unsubscribe,
            fetch: jest.fn((q: string, vars?: any, subscriptionId?: string) => {
                expect({ q, vars, subscriptionId }).toMatchSnapshot();
                return {
                    data: {
                        viewer: {
                            id: toGlobalId("Viewer", ""),
                            model1: {
                                edges: [{
                                    node: {
                                        id: globalId1,
                                        field1: "field1Value",
                                        model2: {
                                            id: toGlobalId("Model2", "100"),
                                            field2: 15,
                                        },
                                    },
                                }],
                            },
                        },
                    },
                };
            }),
        };
        const globalId2 = toGlobalId("Model1", "533");
        const relay = new Relay(resolver);
        const data = await relay.live(query);
        let result = await data.onemitter.wait();
        expect(result).toMatchSnapshot();
        // Test add node
        relay.addNode(data.id, globalId2, { field1: "field1Value2", model2: { field2: 18 }, excess1: "hi" });
        result = await data.onemitter.wait();
        expect(result).toMatchSnapshot();
        // Test update node
        relay.updateNode(data.id, globalId1, { field1: "field1Value3", model2: { field2: 19 }, excess2: "hi2" });
        result = await data.onemitter.wait();
        expect(result).toMatchSnapshot();
        // Test remove node
        relay.removeNode(data.id, globalId1);
        result = await data.onemitter.wait();
        expect(result).toMatchSnapshot();
        // Test unsubscribe
        await relay.restoreAllLive();
        result = await data.onemitter.wait();
        expect(result).toMatchSnapshot();
        data.remove();
        relay.addNode(data.id, globalId2, { field1: "field1Value26", model2: { field2: 180 }, excess1: "hi3" });
        expect(unsubscribe.mock.calls.length).toBe(1);
    });
});
