import * as React from "react";
import { Address } from "./types";

export interface AddressLineProps extends React.Props<any> {
    address: Address;
}

export function AddressLine({ address, children }: AddressLineProps) {
    const cityAndState = address.stateCode.map(stateCode => address.city + ", " + stateCode).defaultValue(address.city);

    return (
        <div className="address-line">
            <span>{address.name}</span>
            <span>{`${address.line1} ${address.line2}`}</span>
            <span>{`${cityAndState} ${address.zip.defaultValue("")}`}</span>
            <span>{address.countryCode}</span>
            {children}
        </div>
    );
}
