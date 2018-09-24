import { Option } from "@nozzlegear/railway";

export interface Address {
    city: string;
    countryCode: string;
    line1: string;
    line2: string;
    /**
     * Not all countries have provinces.
     */
    stateCode: Option<string>;
    /**
     * Not all countries have postal codes.
     */
    zip: Option<string>;
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
    currency: string;
    subTotal: string | number;
    taxTotal: string | number;
    discountTotal: string | number;
    ultimateTotal: string | number;
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

export interface Card {
    number: string;
    name: string;
    expiry: string;
    cvv: string;
}

export interface ShippingRate {
    id: string;
    name: string;
    value: number;
    expectedDelivery?: Date | [Date, Date];
    default: boolean;
}
