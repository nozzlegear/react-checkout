/// <reference path="./../typings/index.d.ts" />

import * as React from "react";
import {Address} from "../index";

export function AddressLine(props: { address : Address } & React.Props<any>)
{
    const {address} = props;
    
    return (
        <div className="address-line">
            <span>
                {address.Name}
            </span>
            <span>
                {`${address.Line1} ${address.Line2 || ""}`}
            </span>
            <span>
                {`${address.City + (!!address.StateCode && address.StateCode ? "," : "")} ${ !!address.StateCode && address.StateCode || ""} ${ !!address.Zip && address.Zip || ""}`}
            </span>
            <span>
                {address.CountryCode}
            </span>
            {props.children}
        </div>
    );
}