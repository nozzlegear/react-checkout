/// <reference path="../../typings/index.d.ts" />
import * as React from 'react';
import { Address } from "../index";
export interface IProps extends React.Props<any> {
    address: Address;
}
export interface IState {
}
export declare class AddressLine extends React.Component<IProps, IState> {
    constructor(props: IProps);
    state: IState;
    private configureState(props, useSetState);
    componentDidMount(): void;
    componentDidUpdate(): void;
    componentWillReceiveProps(props: IProps): void;
    render(): JSX.Element;
}
