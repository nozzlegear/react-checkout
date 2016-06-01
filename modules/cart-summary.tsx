/// <reference path="./../typings/index.d.ts" />

import * as React from "react";
import * as classes from "classnames";
import {map, uniqueId} from "lodash";
import {LineItem, Coupon, Totals} from "../index";

export interface IProps extends React.Props<any>
{
    totals: Totals;
    
    lineItems: LineItem[];
    
    coupons: Coupon[];
    
    controls?: JSX.Element;
    
    onRemoveDiscount?: (event: React.MouseEvent, coupon: Coupon) => void;
}

export function CartSummary(props: IProps)
{
    const widths = [
        "xs-col-3-24",
        "xs-col-16-24 xs-col-24-offset-1",
        "xs-col-4-24"
    ];
    
    const {totals, coupons} = props;
    
    const items = map(props.lineItems, item =>
        <div className="ms-row vc zero-margin cart-item" key={uniqueId()}>
            <div className={widths[0]}>
                <img className="img-responsive" src={item.ThumbnailUrl} />
            </div>
            <div className={classes(widths[1], "win-ellipses")}>
                {`${item.Quantity} — ${item.Title}`}
            </div>
            <div className={classes(widths[2], "text-right")}>
                {`$${item.Total.toFixed(2)}`}
            </div>
        </div>
    );
    const couponLines = map(coupons, coupon => 
        <div key={coupon.Id} className="ms-row vc zero-margin subtotal">
            <div className="xs-col-18-24">
                { 
                    ! props.controls ? null :
                    
                    <a href="#" title="Remove coupon" onClick={(e) => props.onRemoveDiscount(e, coupon)}>
                        <i className="fa fa-close fa-one-rem marRight5" />
                    </a>
                }
                {`${coupon.Code} — ${coupon.PercentOff}% off`}
            </div>
            <div className="xs-col-6-24 text-right">
                {`-$${totals.discountTotal.toFixed(2)}`}
            </div>
        </div>
    );
    
    return (
        <section id="cart-summary" className="m-col-10-24 m-col-24-push-14">
            <div className="ms-row">
                <div className="m-col-22-24 m-col-24-offset-1">
                    {items}
                    <hr />
                    { props.controls }
                    <div className="ms-row vc zero-margin subtotal">
                        <div className="xs-col-6-24">
                            {"Subtotal"}
                        </div>
                        <div className="xs-col-18-24 text-right">
                            {`$${totals.subTotal.toFixed(2)}`}
                        </div>
                    </div>
                    {coupons}
                    <div className="ms-row vc zero-margin tax-total">
                        <div className="xs-col-6-24">
                            {"Tax"}
                        </div>
                        <div className="xs-col-18-24 text-right">
                            {`$${totals.taxTotal.toFixed(2)}`}
                        </div>
                    </div>
                    <div className="ms-row vc zero-margin shipping-total">
                        <div className="xs-col-6-24">
                            {"Shipping"}
                        </div>
                        <div className="xs-col-18-24 text-right">
                            {`USD $${props.totals.shippingTotal.toFixed(2)}`}
                        </div>
                    </div>
                    <hr />
                    <div className="ms-row vc zero-margin grand-total">
                        <div className="xs-col-6-24">
                            {"Total"}
                        </div>
                        <div className="xs-col-18-24 text-right">
                            {"USD "}
                            <strong>
                                {`$${totals.ultimateTotal.toFixed(2)}`}
                            </strong>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );    
}