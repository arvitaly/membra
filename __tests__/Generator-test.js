"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const schema2_1 = require("./../__fixtures__/schema2");
const Generator_1 = require("./../Generator");
fdescribe("Generator", () => {
    it("query", () => {
        const generator = new Generator_1.default(schema2_1.default);
        const execution = generator.generate((schemaObj) => {
            const items = schemaObj.query.viewer.model1({
                first: 10,
                after: "15",
                before: "15",
                last: 10,
            }).edges.map(({ node }) => {
                return {
                    f: node.field1,
                    x: node.model2.field2.toExponential(),
                    m: node.model2.id.big(),
                };
            });
            return {
                items,
                id: schemaObj.query.viewer.id,
            };
        });
        const query = generator.getQuery(execution);
        expect(query).toMatchSnapshot();
    });
});
