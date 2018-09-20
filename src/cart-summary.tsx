import * as React from "react";
import * as classes from "classnames";
import { LineItem, Coupon, Totals } from "./types";

export interface CartSummaryProps extends React.Props<any> {
    totals: Totals;

    lineItems: LineItem[];

    coupons: Coupon[];

    controls?: JSX.Element;

    onRemoveDiscount?: (event: React.MouseEvent, coupon: Coupon) => void;
}

export function CartSummary(props: CartSummaryProps) {
    const widths = ["xs-col-3-24", "xs-col-16-24 xs-col-24-offset-1", "xs-col-4-24"];

    const { totals, coupons } = props;

    const items = props.lineItems.map((item, index) => (
        <div className="ms-row vc zero-margin cart-item" key={`line-item-${index}`}>
            <div className={widths[0]}>
                <img className="img-responsive" src={item.thumbnailUrl} />
            </div>
            <div className={classes(widths[1], "win-ellipses")}>{`${item.quantity} — ${item.title}`}</div>
            <div className={classes(widths[2], "text-right")}>{`$${item.total.toFixed(2)}`}</div>
        </div>
    ));
    const couponLines = coupons.map(coupon => (
        <div key={coupon.id} className="ms-row vc zero-margin subtotal">
            <div className="xs-col-18-24">
                {!props.controls ? null : (
                    <a href="#" title="Remove coupon" onClick={e => props.onRemoveDiscount(e, coupon)}>
                        <i className="fa fa-close fa-one-rem marRight5" />
                    </a>
                )}
                {`${coupon.code} — ${coupon.percentOff}% off`}
            </div>
            <div className="xs-col-6-24 text-right">{`-$${totals.discountTotal.toFixed(2)}`}</div>
        </div>
    ));

    return (
        <section id="cart-summary" className="m-col-10-24 m-col-24-push-14">
            <div className="ms-row">
                <div className="m-col-22-24 m-col-24-offset-1">
                    {items}
                    <hr />
                    {props.controls}
                    <div className="ms-row vc zero-margin subtotal">
                        <div className="xs-col-6-24">{"Subtotal"}</div>
                        <div className="xs-col-18-24 text-right">{`$${totals.subTotal.toFixed(2)}`}</div>
                    </div>
                    {coupons}
                    <div className="ms-row vc zero-margin tax-total">
                        <div className="xs-col-6-24">{"Tax"}</div>
                        <div className="xs-col-18-24 text-right">{`$${totals.taxTotal.toFixed(2)}`}</div>
                    </div>
                    <div className="ms-row vc zero-margin shipping-total">
                        <div className="xs-col-6-24">{"Shipping"}</div>
                        <div className="xs-col-18-24 text-right">{`USD $${props.totals.shippingTotal.toFixed(2)}`}</div>
                    </div>
                    <hr />
                    <div className="ms-row vc zero-margin grand-total">
                        <div className="xs-col-6-24">{"Total"}</div>
                        <div className="xs-col-18-24 text-right">
                            {"USD "}
                            <strong>{`$${totals.ultimateTotal.toFixed(2)}`}</strong>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
