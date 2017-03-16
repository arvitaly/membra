import { Fields, fromQuery } from "graphql-fields-info";
import onemitter, { Onemitter } from "onemitter";
import { IQuery } from "./typings";
export interface IResolver {
    fetch(query: string, vars?: any, subscriptionId?: string): Promise<any>;
    unsubscribe(id: string): Promise<void>;
}
export interface IQueryResult<T> {
    id: string;
    value: any;
    ids: string[];
    query: IQuery<T>;
    vars: any;
    isRemoved: boolean;
    onemitter: Onemitter<any>;
    remove: () => void;
}
export interface IMembraClient {
    live<T>(query: IQuery<T>, vars?: any): Promise<IQueryResult<T>>;
}
// interface ILiveQuery extends Onemitter<any> { }
class Membra {
    protected data: { [index: string]: IQueryResult<any> } = {};
    protected id = 0;
    constructor(protected resolver: IResolver) { }
    public async live<T>(query: IQuery<T>, vars?: any): Promise<IQueryResult<T>> {
        const id = this.getNewId();
        const o = onemitter<T>();
        this.data[id] = {
            id,
            value: null,
            ids: [],
            vars,
            query,
            isRemoved: false,
            onemitter: o,
            remove: async () => {
                this.data[id].isRemoved = true;
                o.removeAllListeners();
                await this.resolver.unsubscribe(id);
            },
        };
        await this.fillQuery(this.data[id]);
        setTimeout(() => {
            o.emit(this.data[id].value);
        });
        return this.data[id];
    }
    public addNode(dataId: string, globalId: string, value: any) {
        if (this.data[dataId].isRemoved) {
            return;
        }
        this.data[dataId].ids.push(globalId);
        const root = Object.keys(this.data[dataId].value)[0];
        const connection = Object.keys(this.data[dataId].value[root]).filter((o) => o !== "id")[0];
        const newValue = { id: globalId };
        this.fillNode(newValue, value, this.data[dataId].query.nodeFields);
        this.data[dataId].value[root][connection].edges.push({
            node: newValue,
        });
        setTimeout(() => {
            this.data[dataId].onemitter.emit(this.data[dataId].value);
        });
    }
    public updateNode(dataId: string, globalId: string, value: any) {
        if (this.data[dataId].isRemoved) {
            return;
        }
        const root = Object.keys(this.data[dataId].value)[0];
        const connection = Object.keys(this.data[dataId].value[root]).filter((o) => o !== "id")[0];
        const rootNode = this.data[dataId].value[root][connection];
        if (this.data[dataId].query.type === "node") {
            this.fillNode(rootNode, value, this.data[dataId].query.nodeFields);
        } else {
            rootNode.edges.filter((edge: any) => edge.node.id === globalId).map((edge: any) => {
                this.fillNode(edge.node, value, this.data[dataId].query.nodeFields);
            });
        }
        setTimeout(() => {
            this.data[dataId].onemitter.emit(this.data[dataId].value);
        });
    }
    public async restoreAllLive() {
        return Promise.all(Object.keys(this.data).map(async (id) => {
            await this.fillQuery(this.data[id]);
            setTimeout(() => {
                this.data[id].onemitter.emit(this.data[id].value);
            });
        }));
    }
    protected async fillQuery(data: IQueryResult<any>) {
        const value = await this.resolver.fetch(data.query.text, data.vars, data.id);
        const ids = this.getIds(value, data.query.fields);
        data.value = value;
        data.ids = ids;
    }
    protected fillNode(source: any, updatings: any, fields: Fields) {
        fields.map((field) => {
            if (typeof (updatings[field.name]) !== "undefined") {
                if (field.fields.length > 0) {
                    if (typeof (updatings[field.name]) === "object") {
                        if (typeof (source[field.name]) !== "object") {
                            source[field.name] = {};
                        }
                        this.fillNode(source[field.name], updatings[field.name], field.fields);
                    }
                } else {
                    if (field.name !== "id") {
                        source[field.name] = updatings[field.name];
                    }
                }
            }
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
        const ids: string[] = [];
        const edgesField = fields.find((f) => f.name === "edges");
        if (!edgesField) {
            throw new Error("Not found edges field in connection");
        }
        const nodeField = edgesField.fields.find((f) => f.name === "node");
        if (!nodeField) {
            throw new Error("Not found node field in connection");
        }
        // TEMPORARY CHANGE to FLAT getIds, need recoursivelly
        return data.edges.map((edge: any) => {
            // ids = ids.concat(this.getIds(edge.node, nodeField.fields));
            return edge.node.id;
        });
        // return ids;
    }
    protected getNewId() {
        return "" + ++this.id;
    }
}
export default Membra;
