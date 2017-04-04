import { IQuery } from "./../__fixtures__/interfaces2";
import schema from "./../__fixtures__/schema2";
import Generator from "./../Generator";
fdescribe("Generator", () => {
    it("query", () => {
        const generator = new Generator<{ query: IQuery }>(schema);
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
