// tslint:disable:member-ordering
export interface IQuery {
    node(params: IQuerynodeParams): any;
    viewer: IViewer;
}
export interface IViewer {
    id: string;
    model1(params?: IViewermodel1Params): IModel1Connection;
}
export interface IViewermodel1Params {
    after: string;
    first: number;
    before: string;
    last: number;
}
export interface IModel1Connection {
    edges: IModel1ConnectionEdge[];
    pageInfo: IModel1ConnectionPageInfo;
}
export interface IModel1ConnectionPageInfo {
    hasNextPage: boolean;
}
export interface IModel1ConnectionEdge {
    node: IModel1;
}
export interface IModel1 {
    id: string;
    field1: string;
    model2(params: IModel1model2Params): IModel2;
}
export interface IModel1model2Params {
    where: IWhere;
}
export interface IWhere {
    field1: string;
}
export interface IModel2 {
    field2: number;
    id: string;
}
export interface IQuerynodeParams {
    id: string;
}