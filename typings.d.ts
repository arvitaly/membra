import { Fields } from "graphql-fields-info";
export interface IQuery {
    text: string;
    fields: Fields;
    nodeFields: Fields;
    type: "node" | "connection";
}
