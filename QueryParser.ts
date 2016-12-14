import { FieldNode, GraphQLID, GraphQLNonNull, GraphQLSchema } from "graphql";
import { Fields, fromQuery, GraphQLFieldsInfo } from "graphql-fields-info";
import { IQuery } from "./typings";
class QueryParser {
    constructor(protected schema: GraphQLSchema) { }
    public parse(literals: TemplateStringsArray, ...placeholders: any[]): IQuery {
        const query: string = literals.join("");
        const fieldsInfo = fromQuery(query, this.schema);
        this.addIds(fieldsInfo.getFields());
        const text: string = "" + fieldsInfo.print();
        const fields = fieldsInfo.getFields();
        let type: "node" | "connection";
        if (fields[0].fields[0].isNode) {
            type = "node";
        } else if (fields[0].fields[0].isConnection) {
            type = "connection";
        } else {
            throw new Error("Unknown query type");
        }
        return {
            text,
            fields,
            type,
        };
    }
    protected addIds(fields: Fields) {
        fields.map((field) => {
            if (field.isNode) {
                if (!field.fields.find((f) => f.name === "id")) {
                    const node: FieldNode = {
                        name: { value: "id", kind: "Name" },
                        kind: "Field",
                    };
                    const sel = (field.node as FieldNode).selectionSet;
                    if (sel) {
                        sel.selections.push(node);
                    }
                    field.fields.push({
                        args: [],
                        fields: [],
                        isFragment: false,
                        isConnection: false,
                        isNode: false,
                        node,
                        name: "id",
                        type: new GraphQLNonNull(GraphQLID),
                    });
                }
            }
            this.addIds(field.fields);
        });
    }
}
export default QueryParser;
