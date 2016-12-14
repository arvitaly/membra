"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
const onemitter_1 = require("onemitter");
class Relay {
    constructor(resolver) {
        this.resolver = resolver;
        this.data = {};
        this.id = 0;
    }
    live(query, vars) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = yield this.resolver.fetch(query.text, vars);
            const ids = this.getIds(data, query.fields);
            const o = onemitter_1.default();
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
        });
    }
    addNode(dataId, globalId, value) {
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
    updateNode(dataId, globalId, value) {
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
        }
        else {
            const edgesField = rootField.fields.find((f) => f.name === "edges");
            if (!edgesField) {
                throw new Error("Not found edges field in connection");
            }
            const nodeField = edgesField.fields.find((f) => f.name === "node");
            if (!nodeField) {
                throw new Error("Not found node field in connection");
            }
            rootNode.edges.filter((edge) => edge.node.id === globalId).map((edge) => {
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
        let ids = [];
        const edgesField = fields.find((f) => f.name === "edges");
        if (!edgesField) {
            throw new Error("Not found edges field in connection");
        }
        const nodeField = edgesField.fields.find((f) => f.name === "node");
        if (!nodeField) {
            throw new Error("Not found node field in connection");
        }
        data.edges.map((edge) => {
            ids = ids.concat(this.getIds(edge.node, nodeField.fields));
        });
        return ids;
    }
    getNewId() {
        return "" + ++this.id;
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Relay;
