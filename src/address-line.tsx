import * as React from "react";
import { Address } from "./types";

export interface AddressLineProps extends React.Props<any> {
    address: Address;
}

export function AddressLine({ address, children }: AddressLineProps) {
    return (
        <div className="address-line">
            <span>{address.Name}</span>
            <span>{`${address.Line1} ${address.Line2 || ""}`}</span>
            <span>
                {`${address.City + (!!address.StateCode && address.StateCode ? "," : "")} ${(!!address.StateCode &&
                    address.StateCode) ||
                    ""} ${(!!address.Zip && address.Zip) || ""}`}
            </span>
            <span>{address.CountryCode}</span>
            {children}
        </div>
    );
}
