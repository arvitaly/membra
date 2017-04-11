import { FieldNode, GraphQLID, GraphQLNonNull, GraphQLSchema } from "graphql";
import { Fields, fromQuery } from "graphql-fields-info";
import { IQuery } from "./typings";
class QueryParser {
    constructor(protected schema: GraphQLSchema) { }
    public parse<T>(literals: TemplateStringsArray, ...placeholders: any[]): IQuery<T> {
        const query: string = literals.join("");
        const fieldsInfo = fromQuery(query, this.schema);
        this.addIds(fieldsInfo.getFields());
        const text: string = "" + fieldsInfo.print();
        const fields = fieldsInfo.getFields();
        let type: "node" | "connection" | "nodeInterface";
        let nodeFields: Fields;
        if (fields[0].isInterface) {
            type = "nodeInterface";
            nodeFields = fieldsInfo.getNodeInterfaceFields();
        } else if (fields[0].fields[0].isNode) {
            type = "node";
            nodeFields = fieldsInfo.getQueryOneFields();
        } else if (fields[0].fields[0].isConnection) {
            type = "connection";
            nodeFields = fieldsInfo.getQueryConnectionFields();
        } else {
            throw new Error("Unknown query type");
        }
        return {
            text,
            fields,
            nodeFields,
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
