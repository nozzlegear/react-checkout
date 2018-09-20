export interface Address {
    city: string;
    countryCode: string;
    line1: string;
    line2: string;
    stateCode: string;
    zip: string;
    name: string;
}

export interface LineItem {
    title: string;
    total: number;
    quantity: number;
    thumbnailUrl: string;
}

export interface Coupon {
    id?: number;
    code: string;
    created?: Date | string;
    percentOff: number;
    timesRedeemed?: number;
    expiration?: Date | string;
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
