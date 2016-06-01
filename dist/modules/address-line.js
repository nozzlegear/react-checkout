/// <reference path="./../typings/index.d.ts" />
"use strict";
var React = require("react");
function AddressLine(props) {
    var address = props.address;
    return (React.createElement("div", {className: "address-line"}, React.createElement("span", null, address.Name), React.createElement("span", null, address.Line1 + " " + (address.Line2 || "")), React.createElement("span", null, (address.City + (!!address.StateCode && address.StateCode ? "," : "")) + " " + (!!address.StateCode && address.StateCode || "") + " " + (!!address.Zip && address.Zip || "")), React.createElement("span", null, address.CountryCode), props.children));
}
exports.AddressLine = AddressLine;
