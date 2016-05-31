/// <reference path="../../typings/index.d.ts" />
import * as React from 'react';
export interface IProps extends React.Props<any> {
}
export interface IState {
}
export declare class TrackingPage extends React.Component<IProps, IState> {
    constructor(props: IProps);
    state: IState;
    private configureState(props, useSetState);
    componentDidMount(): void;
    componentDidUpdate(): void;
    componentWillReceiveProps(props: IProps): void;
    render(): JSX.Element;
}
