/// <reference path="../../typings/index.d.ts" />
import * as React from 'react';
import { Address, Coupon, LineItem, Totals } from "../index";
import { AutoPropComponent } from "auto-prop-component";
export declare enum page {
    customerInformation = 0,
    shippingMethod = 1,
    paymentMethod = 2,
}
export interface IProps extends React.Props<any> {
    items: LineItem[];
    totals: Totals;
    allowCoupons?: boolean;
    siteName: string;
    supportEmail: string;
}
export interface IState {
    page?: page;
    customer?: {
        email?: string;
        shippingAddress?: Address;
        error?: string;
    };
    summary?: {
        loading?: boolean;
        error?: string;
        code?: string;
        coupons?: Coupon[];
    };
    payment?: {
        loading?: boolean;
        sameBillingAddress?: boolean;
        error?: string;
        card?: {
            number?: string;
            name?: string;
            expiry?: string;
            cvv?: string;
        };
        billingAddress?: Address;
    };
}
export declare class CheckoutPage extends AutoPropComponent<IProps, IState> {
    constructor(props: IProps);
    state: IState;
    private isMobile;
    private configureState(props, useSetState);
    private validateAddress(address);
    private generateHeader(forMobile?);
    private generateCartSummary();
    private generateAddressForm(type);
    private generateCustomerInformation();
    private generateShippingInformation();
    private generatePaymentPage();
    private applyDiscount(event);
    private removeDiscount(event, coupon);
    private continueToShipping(event);
    private continueToPayment(event);
    private completeOrder(event);
    componentDidMount(): void;
    componentDidUpdate(): void;
    componentWillUpdate(newProps: IProps, newState: IState): void;
    componentWillReceiveProps(props: IProps): void;
    render(): JSX.Element;
}
