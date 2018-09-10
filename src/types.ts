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

export interface Totals {
    taxRate: number;
    subTotal: number;
    taxTotal: number;
    shippingTotal: number;
    discountTotal: number;
    ultimateTotal: number;
}

export interface State {
    iso: string;
    name: string;
}

export interface Country {
    iso: string;
    name: string;
    hasPostalCodes: boolean;
    states: State[];
    zipRegex: string | number;
}
