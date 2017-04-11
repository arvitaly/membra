"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const schema2_1 = require("./../../__fixtures__/schema2");
const SchemaObj_1 = require("./../../Generator/SchemaObj");
describe("SchemaObj", () => {
    const executor = ({ query: queryObj }) => {
        const node = queryObj.viewer.model1({
            first: 10,
        }).edges[1].node;
        const m1 = [{
                id: node.id,
                field1: node.field1,
                model2: node.model2({ where: { field1: ["test"] } }).id,
            }];
        const m2 = queryObj.viewer.model1({
            first: 15,
        }).edges.map(({ node: n }) => {
            return n.model2({ where: { field1: ["test5"] } }).field2;
        });
        return { m1, m2 };
    };
    it("get query", () => {
        const schemaObj = new SchemaObj_1.default(schema2_1.default);
        executor(schemaObj);
        expect(schemaObj.getQuery()).toMatchSnapshot();
    });
    it("fill data", () => {
        const schemaObj = new SchemaObj_1.default(schema2_1.default);
        expect(schemaObj.fillData({
            viewer: {
                f1: {
                    edges: [{
                            node: {
                                id: "ID22",
                                field1: "newValue",
                                model2: {
                                    field2: "Field2valueSame",
                                },
                            },
                        }],
                },
                model1: {
                    edges: [null, {
                            node: {
                                id: "ID11",
                                field1: "Test",
                                model2: {
                                    id: "ID56",
                                    field2: "Field2value",
                                },
                            },
                        }],
                },
            },
        }, executor)).toMatchSnapshot();
    });
});
