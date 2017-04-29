// tslint:disable:member-ordering
export interface IMutation {
    createModel1(params?: IMutationcreateModel1Params): ICreateModel1Payload;
}
export interface IMutationcreateModel1Params {
    input?: ICreateMode1lInput | null;
}
export interface ICreateMode1lInput {
    setField1?: ICreateModel1InputSetField1 | null;
}
export interface ICreateModel1InputSetField1 {
    field1?: string | null;
}
export interface ICreateModel1Payload {
    test: string;
}
export interface IQuery {
    node(params: IQuerynodeParams): any;
    viewer: IViewer;
}
export interface IViewer {
    id: string;
    model1(params?: IViewermodel1Params): IModel1Connection;
}
export interface IViewermodel1Params {
    after?: string | null;
    first?: number | null;
    before?: string | null;
    last?: number | null;
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
    field1?: string[] | null;
    field3: IField2[];
    nullableField?: number | null;
}
export interface IField2 {
    field4: string;
}
export interface IModel2 {
    field2: number;
    id: string;
}
export interface IQuerynodeParams {
    id: string;
}
