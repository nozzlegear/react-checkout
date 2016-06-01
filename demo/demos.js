/// <reference path="./../typings/index.d.ts" />
"use strict";
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
var React = require("react");
var ReactDOM = require("react-dom");
var index_1 = require("../dist/index");
require("node_modules/winjs-grid/dist/css/min/mscom-grid.min.css");
//require("node_modules/winjs/css/ui-light.min.css");
require("styles/react-checkout.scss");
function Render(type) {
    var page;
    if (type === "checkout") {
        var props = {
            siteName: "React Checkout",
            supportEmail: "joshua@nozzlegear.com",
            allowCoupons: true,
            totals: {
                discountTotal: 0,
                shippingTotal: 10,
                subTotal: 100,
                taxRate: 0.07,
                taxTotal: 7,
                ultimateTotal: 117,
            },
            items: [
                {
                    Quantity: 1,
                    ThumbnailUrl: "http://placehold.it/50x50",
                    Title: "Fancy Line Item",
                    Total: 50
                },
                {
                    Quantity: 1,
                    ThumbnailUrl: "http://placehold.it/50x50",
                    Title: "Fancy Line Item",
                    Total: 50
                }
            ]
        };
        page = React.createElement(index_1.CheckoutPage, __assign({}, props));
    }
    else {
        page = React.createElement(index_1.TrackingPage, null);
    }
    ReactDOM.render(page, document.getElementById("demo-container"));
}
exports.Render = Render;
