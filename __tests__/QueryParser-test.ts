import { readFileSync } from "fs";
import { buildClientSchema } from "graphql";
import schema from "./../__fixtures__/schema2";
import QueryParser from "./../QueryParser";
// const schema = buildClientSchema(JSON.parse(readFileSync(__dirname + "/../__fixtures__/schema.json", "utf8")).data);
describe("QueryParser", () => {
    it("simple", () => {
        const parser = new QueryParser(schema);
        const query = parser.parse`
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
        const parser = new QueryParser(schema);
        const query = parser.parse`
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
