import { Fields, fromQuery } from "graphql-fields-info";
import onemitter, { Onemitter } from "onemitter";
import { IQuery } from "./typings";
export interface IResolver {
    fetch(query: string, vars?: any): Promise<any>;
}
interface IData {
    id: string;
    value: any;
    ids: string[];
    query: IQuery;
    onemitter: Onemitter<any>;
}
interface ILiveQuery extends Onemitter<any> { }
class Relay {
    protected data: { [index: string]: IData } = {};
    protected id = 0;
    constructor(protected resolver: IResolver) { }
    public async live(query: IQuery, vars?: any): Promise<IData> {
        const data = await this.resolver.fetch(query.text, vars);
        const ids = this.getIds(data, query.fields);
        const o = onemitter();
        const id = this.getNewId();
        this.data[id] = {
            id,
            value: data,
            ids,
            query,
            onemitter: o,
        };

        setTimeout(() => {
            o.emit(data);
        });
        return this.data[id];
    }
    public addNode(dataId: string, globalId: string, value: any) {
        this.data[dataId].ids.push(globalId);
        const root = Object.keys(this.data[dataId].value)[0];
        const connection = Object.keys(this.data[dataId].value[root]).filter((o) => o !== "id")[0];
        this.data[dataId].value[root][connection].edges.push({
            node: value,
        });
        setTimeout(() => {
            this.data[dataId].onemitter.emit(this.data[dataId].value);
        });
    }
    public updateNode(dataId: string, globalId: string, value: any) {
        const rootField = this.data[dataId].query.fields[0].fields[0];
        const root = Object.keys(this.data[dataId].value)[0];
        const connection = Object.keys(this.data[dataId].value[root]).filter((o) => o !== "id")[0];
        const rootNode = this.data[dataId].value[root][connection];
        if (this.data[dataId].query.type === "node") {
            rootField.fields.map((field) => {
                if (typeof (value[field.name]) !== "undefined") {
                    rootNode[field.name] = value[field.name];
                }
            });
        } else {
            const edgesField = rootField.fields.find((f) => f.name === "edges");
            if (!edgesField) {
                throw new Error("Not found edges field in connection");
            }
            const nodeField = edgesField.fields.find((f) => f.name === "node");
            if (!nodeField) {
                throw new Error("Not found node field in connection");
            }
            rootNode.edges.filter((edge: any) => edge.node.id === globalId).map((edge: any) => {
                const node = edge.node;
                nodeField.fields.map((field) => {
                    if (typeof (value[field.name]) !== "undefined") {
                        node[field.name] = value[field.name];
                    }
                });
            });
        }
        setTimeout(() => {
            this.data[dataId].onemitter.emit(this.data[dataId].value);
        });
    }
    protected getIds(data: any, fields: Fields) {
        let ids: string[] = [];
        fields.map((field) => {
            if (field.isConnection) {
                ids = ids.concat(this.getIdsFromConnection(data[field.name], field.fields));
                return;
            }
            if (field.isNode) {
                ids.push(data[field.name].id);
            }
            ids = ids.concat(this.getIds(data[field.name], field.fields));
        });
        return ids;
    }
    protected getIdsFromConnection(data: any, fields: Fields) {
        let ids: string[] = [];
        const edgesField = fields.find((f) => f.name === "edges");
        if (!edgesField) {
            throw new Error("Not found edges field in connection");
        }
        const nodeField = edgesField.fields.find((f) => f.name === "node");
        if (!nodeField) {
            throw new Error("Not found node field in connection");
        }
        data.edges.map((edge: any) => {
            ids = ids.concat(this.getIds(edge.node, nodeField.fields));
        });
        return ids;
    }
    protected getNewId() {
        return "" + ++this.id;
    }
}
export default Relay;
