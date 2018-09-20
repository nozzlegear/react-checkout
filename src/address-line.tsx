import * as React from "react";
import { Address } from "./types";

export interface AddressLineProps extends React.Props<any> {
    address: Address;
}

export function AddressLine({ address, children }: AddressLineProps) {
    return (
        <div className="address-line">
            <span>{address.name}</span>
            <span>{`${address.line1} ${address.line2 || ""}`}</span>
            <span>
                {`${address.city + (!!address.stateCode && address.stateCode ? "," : "")} ${(!!address.stateCode &&
                    address.stateCode) ||
                    ""} ${(!!address.zip && address.zip) || ""}`}
            </span>
            <span>{address.countryCode}</span>
            {children}
        </div>
    );
}
