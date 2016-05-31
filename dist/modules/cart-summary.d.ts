/// <reference path="../../typings/index.d.ts" />
import * as React from 'react';
import { Totals, LineItem, Coupon } from "../index";
export interface IProps extends React.Props<any> {
    totals: Totals;
    lineItems: LineItem[];
    coupons: Coupon[];
    controls: JSX.Element;
    onRemoveDiscount: (event: React.MouseEvent, coupon: Coupon) => void;
}
export interface IState {
}
export declare class CartSummary extends React.Component<IProps, IState> {
    constructor(props: IProps);
    state: IState;
    private configureState(props, useSetState);
    componentDidMount(): void;
    componentDidUpdate(): void;
    componentWillReceiveProps(props: IProps): void;
    render(): JSX.Element;
}
