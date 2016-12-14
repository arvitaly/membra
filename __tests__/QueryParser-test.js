"use strict";
const schema2_1 = require("./../__fixtures__/schema2");
const QueryParser_1 = require("./../QueryParser");
// const schema = buildClientSchema(JSON.parse(readFileSync(__dirname + "/../__fixtures__/schema.json", "utf8")).data);
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
});
