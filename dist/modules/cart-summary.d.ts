/// <reference path="../../typings/index.d.ts" />
import * as React from "react";
import { LineItem, Coupon, Totals } from "../index";
export interface IProps extends React.Props<any> {
    totals: Totals;
    lineItems: LineItem[];
    coupons: Coupon[];
    controls?: JSX.Element;
    onRemoveDiscount?: (event: React.MouseEvent, coupon: Coupon) => void;
}
export declare function CartSummary(props: IProps): JSX.Element;
