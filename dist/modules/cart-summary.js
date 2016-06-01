/// <reference path="./../typings/index.d.ts" />
"use strict";
var React = require("react");
var classes = require("classnames");
var lodash_1 = require("lodash");
function CartSummary(props) {
    var widths = [
        "xs-col-3-24",
        "xs-col-16-24 xs-col-24-offset-1",
        "xs-col-4-24"
    ];
    var totals = props.totals, coupons = props.coupons;
    var items = lodash_1.map(props.lineItems, function (item) {
        return React.createElement("div", {className: "ms-row vc zero-margin cart-item", key: lodash_1.uniqueId()}, React.createElement("div", {className: widths[0]}, React.createElement("img", {className: "img-responsive", src: item.ThumbnailUrl})), React.createElement("div", {className: classes(widths[1], "win-ellipses")}, item.Quantity + " \u2014 " + item.Title), React.createElement("div", {className: classes(widths[2], "text-right")}, "$" + item.Total.toFixed(2)));
    });
    var couponLines = lodash_1.map(coupons, function (coupon) {
        return React.createElement("div", {key: coupon.Id, className: "ms-row vc zero-margin subtotal"}, React.createElement("div", {className: "xs-col-18-24"}, !props.controls ? null :
            React.createElement("a", {href: "#", title: "Remove coupon", onClick: function (e) { return props.onRemoveDiscount(e, coupon); }}, React.createElement("i", {className: "fa fa-close fa-one-rem marRight5"})), coupon.Code + " \u2014 " + coupon.PercentOff + "% off"), React.createElement("div", {className: "xs-col-6-24 text-right"}, "-$" + totals.discountTotal.toFixed(2)));
    });
    return (React.createElement("section", {id: "cart-summary", className: "m-col-10-24 m-col-24-push-14"}, React.createElement("div", {className: "ms-row"}, React.createElement("div", {className: "m-col-22-24 m-col-24-offset-1"}, items, React.createElement("hr", null), props.controls, React.createElement("div", {className: "ms-row vc zero-margin subtotal"}, React.createElement("div", {className: "xs-col-6-24"}, "Subtotal"), React.createElement("div", {className: "xs-col-18-24 text-right"}, "$" + totals.subTotal.toFixed(2))), coupons, React.createElement("div", {className: "ms-row vc zero-margin tax-total"}, React.createElement("div", {className: "xs-col-6-24"}, "Tax"), React.createElement("div", {className: "xs-col-18-24 text-right"}, "$" + totals.taxTotal.toFixed(2))), React.createElement("div", {className: "ms-row vc zero-margin shipping-total"}, React.createElement("div", {className: "xs-col-6-24"}, "Shipping"), React.createElement("div", {className: "xs-col-18-24 text-right"}, "USD $" + props.totals.shippingTotal.toFixed(2))), React.createElement("hr", null), React.createElement("div", {className: "ms-row vc zero-margin grand-total"}, React.createElement("div", {className: "xs-col-6-24"}, "Total"), React.createElement("div", {className: "xs-col-18-24 text-right"}, "USD ", React.createElement("strong", null, "$" + totals.ultimateTotal.toFixed(2))))))));
}
exports.CartSummary = CartSummary;
