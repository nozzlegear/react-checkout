/// <reference path="./../typings/index.d.ts" />

import * as React from "react";
import * as ReactDOM from "react-dom";
import {CheckoutPage, TrackingPage, LineItem, Totals} from "../dist/index";

declare var require: any;

require("node_modules/winjs-grid/dist/css/min/mscom-grid.min.css");
//require("node_modules/winjs/css/ui-light.min.css");
require("styles/react-checkout.scss");

export function Render(type: "checkout" | "tracking")
{
    let page: JSX.Element;
    
    if (type === "checkout")
    {
        const props = {
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
            } as Totals,
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
            ] as LineItem[]
        }
        
         page = <CheckoutPage {...props} />
    }
    else
    {
        page = <TrackingPage />;
    }
    
    ReactDOM.render(page, document.getElementById("demo-container"));
}