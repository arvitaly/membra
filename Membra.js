"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const graphql_1 = require("graphql");
const onemitter_1 = require("onemitter");
const Generator_1 = require("./Generator");
// interface ILiveQuery extends Onemitter<any> { }
class Membra {
    constructor(resolver) {
        this.resolver = resolver;
        this.data = {};
        this.id = 0;
        this.queries = [];
    }
    live(query, vars) {
        return __awaiter(this, void 0, void 0, function* () {
            const id = this.getNewId();
            const o = onemitter_1.default();
            this.data[id] = {
                id,
                value: null,
                ids: [],
                vars,
                query,
                isRemoved: false,
                onemitter: o,
                remove: () => __awaiter(this, void 0, void 0, function* () {
                    this.data[id].isRemoved = true;
                    o.removeAllListeners();
                    yield this.resolver.unsubscribe(id);
                }),
            };
            yield this.fillQuery(this.data[id]);
            setTimeout(() => {
                o.emit(this.data[id].value);
            });
            return this.data[id];
        });
    }
    getClientSchema() {
        return __awaiter(this, void 0, void 0, function* () {
            const schemaJSON = yield this.resolver.fetch(graphql_1.introspectionQuery);
            return graphql_1.buildClientSchema(schemaJSON.data);
        });
    }
    execute(executor, vars) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.generator) {
                const schema = yield this.getClientSchema();
                this.generator = new Generator_1.default(schema);
            }
            const execution = this.generator.generate(executor);
            const data = yield this.fetch(execution.schemaObj.getQuery(), vars);
            return execution.schemaObj.fillData(data, execution.executor);
        });
    }
    addNode(dataId, globalId, value) {
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
    updateNode(dataId, globalId, value) {
        if (this.data[dataId].isRemoved) {
            return;
        }
        const root = Object.keys(this.data[dataId].value)[0];
        const connection = Object.keys(this.data[dataId].value[root]).filter((o) => o !== "id")[0];
        const rootNode = this.data[dataId].value[root][connection];
        if (this.data[dataId].query.type === "node") {
            this.fillNode(rootNode, value, this.data[dataId].query.nodeFields);
        }
        else if (this.data[dataId].query.type === "nodeInterface") {
            this.fillNode(this.data[dataId].value[root], value, this.data[dataId].query.nodeFields);
        }
        else {
            rootNode.edges.filter((edge) => edge.node.id === globalId).map((edge) => {
                this.fillNode(edge.node, value, this.data[dataId].query.nodeFields);
            });
        }
        setTimeout(() => {
            this.data[dataId].onemitter.emit(this.data[dataId].value);
        });
    }
    removeNode(dataId, globalId) {
        if (this.data[dataId].isRemoved) {
            return;
        }
        this.data[dataId].ids = this.data[dataId].ids.filter((id) => id !== globalId);
        const root = Object.keys(this.data[dataId].value)[0];
        const connection = Object.keys(this.data[dataId].value[root]).filter((o) => o !== "id")[0];
        this.data[dataId].value[root][connection].edges =
            this.data[dataId].value[root][connection].edges.filter((node) => {
                return node.node.id !== globalId;
            });
        setTimeout(() => {
            this.data[dataId].onemitter.emit(this.data[dataId].value);
        });
    }
    restoreAllLive() {
        return __awaiter(this, void 0, void 0, function* () {
            return Promise.all(Object.keys(this.data).map((id) => __awaiter(this, void 0, void 0, function* () {
                yield this.fillQuery(this.data[id]);
                setTimeout(() => {
                    this.data[id].onemitter.emit(this.data[id].value);
                });
            })));
        });
    }
    waitAll() {
        return __awaiter(this, void 0, void 0, function* () {
            yield Promise.all(this.queries);
        });
    }
    fetch(query, vars, subscriptionId) {
        return __awaiter(this, void 0, void 0, function* () {
            const pr = new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                try {
                    resolve(yield this.resolver.fetch(query, vars, subscriptionId));
                }
                catch (e) {
                    reject(e);
                }
            }));
            this.queries.push(pr);
            const body = yield pr;
            this.queries = this.queries.filter((p) => pr !== p);
            const data = body;
            if (data.errors) {
                throw new Error("Errors: " + JSON.stringify(data.errors));
            }
            return data.data;
        });
    }
    fillQuery(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const value = yield this.fetch(data.query.text, data.vars, data.id);
            const ids = this.getIds(value, data.query.fields);
            data.value = value;
            data.ids = ids;
        });
    }
    fillNode(source, updatings, fields) {
        fields.map((field) => {
            if (typeof (updatings[field.name]) !== "undefined") {
                if (field.fields.length > 0) {
                    if (typeof (updatings[field.name]) === "object") {
                        if (typeof (source[field.name]) !== "object") {
                            source[field.name] = {};
                        }
                        this.fillNode(source[field.name], updatings[field.name], field.fields);
                    }
                }
                else {
                    if (field.name !== "id") {
                        source[field.name] = updatings[field.name];
                    }
                }
            }
        });
    }
    getIds(data, fields) {
        let ids = [];
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
    getIdsFromConnection(data, fields) {
        // const ids: string[] = [];
        const edgesField = fields.find((f) => f.name === "edges");
        if (!edgesField) {
            throw new Error("Not found edges field in connection");
        }
        const nodeField = edgesField.fields.find((f) => f.name === "node");
        if (!nodeField) {
            throw new Error("Not found node field in connection");
        }
        // TEMPORARY CHANGE to FLAT getIds, need recoursivelly
        return data.edges.map((edge) => {
            // ids = ids.concat(this.getIds(edge.node, nodeField.fields));
            return edge.node.id;
        });
        // return ids;
    }
    getNewId() {
        return "" + ++this.id;
    }
}
exports.default = Membra;
