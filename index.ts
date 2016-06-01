/// <reference path="./typings/index.d.ts" />

export interface Address {
    City: string;

    CountryCode: string;

    Line1: string;

    Line2: string;

    StateCode: string;

    Zip: string;

    Name: string;
}

export interface LineItem {
    
    Title: string;
    
    Total: number;
    
    Quantity: number;
    
    ThumbnailUrl: string;
}

export interface Coupon {
    Id?: number;

    Code: string;

    Created?: Date | string;

    PercentOff: number;

    TimesRedeemed?: number;

    Expiration?: Date | string;
}

export interface Totals
{
    taxRate: number;
    
    subTotal: number;
    
    taxTotal: number;
    
    shippingTotal: number;
    
    discountTotal: number;
    
    ultimateTotal: number;
}
 
export {AddressLine} from "./modules/address-line";
export {CartSummary} from "./modules/cart-summary";
export {CheckoutPage} from "./modules/checkout-page";
export {TrackingPage} from "./modules/tracking-page";
export {Countries, Country, State} from "./data/countries";