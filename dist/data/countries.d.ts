/// <reference path="../../typings/index.d.ts" />
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
export declare const Countries: Country[];
