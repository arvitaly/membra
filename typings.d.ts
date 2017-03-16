import { Fields } from "graphql-fields-info";
export interface IQuery<T> {
    text: string;
    fields: Fields;
    nodeFields: Fields;
    type: "node" | "connection" | "nodeInterface";
}
