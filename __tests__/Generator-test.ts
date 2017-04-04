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
                const model2 = node.model2({
                    where: { field1: "test" },
                });
                return {
                    f: node.field1,
                    x: model2.field2.toFixed(),
                    y: model2.id.toLowerCase(),
                };
            });
            return {
                items,
                id: schemaObj.query.viewer.id,
            };
        });
        const query = generator.getQuery(execution);
        expect(query).toMatchSnapshot();
        const result = execution.schemaObj.fillData({
            viewer: {
                id: "15",
                model1: {
                    edges: [{
                        node: {
                            field1: "field1Value",
                            model2: {
                                field2: 100.888,
                                id: "11",
                            },
                        },
                    }],
                },
            },
        }, execution.executor);
        expect(result).toMatchSnapshot();
    });
});
