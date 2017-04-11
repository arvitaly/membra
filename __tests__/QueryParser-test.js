"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const schema2_1 = require("./../__fixtures__/schema2");
const QueryParser_1 = require("./../QueryParser");
describe("QueryParser", () => {
    it("simple", () => {
        const parser = new QueryParser_1.default(schema2_1.default);
        const query = parser.parse `
            query Q1{
                viewer{
                    model1{
                        edges{
                            node{
                                field1
                            }
                        }
                    }
                }
            }
        `;
        expect(query).toMatchSnapshot();
    });
    it("node", () => {
        const parser = new QueryParser_1.default(schema2_1.default);
        const query = parser.parse `
            query Q1{
                node(id: "1"){
                    ...F1
                }
            }
            fragment F1 on Model1{
                field1
            }
        `;
        expect(query).toMatchSnapshot();
    });
});
