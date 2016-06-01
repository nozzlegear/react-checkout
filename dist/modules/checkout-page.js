/// <reference path="./../typings/index.d.ts" />
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var React = require('react');
var classes = require("classnames");
var creditcard = require("creditcardutils");
var cc_expiry_1 = require("cc-expiry");
var lodash_1 = require('lodash');
var countries_1 = require("../data/countries");
var cart_summary_1 = require("./cart-summary");
var address_line_1 = require("./address-line");
var auto_prop_component_1 = require("auto-prop-component");
if (true === false) {
    require("node_modules/winjs-grid/dist/css/min/mscom-grid.min.css");
    require("node_modules/winjs/css/ui-light.min.css");
}
(function (page) {
    page[page["customerInformation"] = 0] = "customerInformation";
    page[page["shippingMethod"] = 1] = "shippingMethod";
    page[page["paymentMethod"] = 2] = "paymentMethod";
})(exports.page || (exports.page = {}));
var page = exports.page;
var CheckoutPage = (function (_super) {
    __extends(CheckoutPage, _super);
    function CheckoutPage(props) {
        _super.call(this, props);
        // This is a static property to prevent items resizing on every re-render (selecting a form option, etc)
        this.isMobile = window.innerWidth < 767;
        this.configureState(props, false);
    }
    //#region Utility functions
    CheckoutPage.prototype.configureState = function (props, useSetState) {
        var usa = lodash_1.find(countries_1.Countries, function (c) { return c.iso === "US"; });
        var defaultAddress = {
            City: undefined,
            CountryCode: usa.iso,
            Line1: undefined,
            Line2: undefined,
            Name: undefined,
            StateCode: usa.states[0].iso,
            Zip: undefined
        };
        var state = {
            customer: {
                error: undefined,
                email: undefined,
                shippingAddress: defaultAddress
            },
            summary: {
                coupons: [],
                error: undefined,
                loading: false
            },
            page: page.customerInformation,
            payment: {
                error: undefined,
                loading: false,
                sameBillingAddress: true,
                card: {
                    number: undefined,
                    name: undefined,
                    expiry: undefined,
                    cvv: undefined
                },
                billingAddress: lodash_1.clone(defaultAddress)
            }
        };
        if (!useSetState) {
            this.state = state;
            return;
        }
        this.setState(state);
    };
    CheckoutPage.prototype.validateAddress = function (address) {
        var output = {
            success: false,
            message: undefined
        };
        var countryData = lodash_1.find(countries_1.Countries, function (c) { return c.iso === address.CountryCode; });
        // Ensure customer has selected a valid country
        if (!countryData) {
            output.message = "You must select a valid country.";
            return output;
        }
        if (countryData.states.length > 0) {
            // Ensure the selected state exists in the list of the country's states
            if (!lodash_1.some(countryData.states, function (s) { return s.iso === address.StateCode; })) {
                output.message = "You must select a valid state.";
                return output;
            }
        }
        if (!address.City) {
            output.message = "You must enter a city.";
            return output;
        }
        if (!address.Line1) {
            output.message = "You must enter a street address.";
            return output;
        }
        if (!address.Name) {
            output.message = "You must enter a name or company name for this address.";
            return output;
        }
        if (countryData.hasPostalCodes && countryData.zipRegex !== 0 && !new RegExp(countryData.zipRegex).test(address.Zip)) {
            output.message = "You must enter a valid Zip or Postal code.";
            return output;
        }
        output.success = true;
        return output;
    };
    //#endregion
    //#region Component generators
    CheckoutPage.prototype.generateHeader = function (forMobile) {
        var _this = this;
        if (forMobile === void 0) { forMobile = false; }
        var currentPage = this.state.page;
        var navigate = function (to) { return function (event) {
            event.preventDefault();
            _this.mergeState({ page: to === "customer" ? page.customerInformation : page.shippingMethod });
        }; };
        var Container = function (props) {
            var output;
            if (forMobile) {
                output = (React.createElement("section", {className: "xs-col-24-24 show-xs hide-sm hide-m hide-l hide-xl", id: "checkout-header"}, props.children));
            }
            else {
                output = (React.createElement("div", {className: "hide-xs show-sm show-m show-l show-xl"}, React.createElement("div", {className: "ms-row"}, React.createElement("div", {className: "col-1-1"}, props.children))));
            }
            return output;
        };
        return (React.createElement(Container, null, React.createElement("h1", {className: "page-title"}, this.props.siteName), React.createElement("ul", {id: "nav"}, React.createElement("li", null, React.createElement("a", {href: "/cart"}, "Cart")), React.createElement("li", {className: "chevron"}, React.createElement("i", {className: "fa fa-one-rem fa-chevron-right"})), React.createElement("li", {className: classes({ "active": currentPage === page.customerInformation })}, currentPage <= page.customerInformation ? "Customer Information" : React.createElement("a", {href: "#", onClick: navigate("customer")}, "Customer Information")), React.createElement("li", {className: "chevron"}, React.createElement("i", {className: "fa fa-one-rem fa-chevron-right"})), React.createElement("li", {className: classes({ "active": currentPage === page.shippingMethod })}, currentPage <= page.shippingMethod ? "Shipping Information" : React.createElement("a", {href: "#", onClick: navigate("shipping")}, "Shipping Information")), React.createElement("li", {className: "chevron"}, React.createElement("i", {className: "fa fa-one-rem fa-chevron-right"})), React.createElement("li", {className: classes({ "active": currentPage === page.paymentMethod })}, "Payment method"))));
    };
    CheckoutPage.prototype.generateCartSummary = function () {
        var _this = this;
        var _a = this.state, _b = _a.summary, loading = _b.loading, error = _b.error, coupons = _b.coupons, code = _b.code, CountryCode = _a.customer.shippingAddress.CountryCode;
        var controls = (React.createElement("div", null, React.createElement("div", {className: "ms-row vc zero-margin discount-form"}, React.createElement("div", {className: "xs-col-18-24 form-group", style: { "marginBottom": "0" }}, React.createElement("input", {className: "win-textbox", placeholder: "Discount Code", value: code, onChange: this.updateState(function (s, v) { return s.summary.code = v; })})), React.createElement("div", {className: "xs-col-6-24 text-center"}, React.createElement("button", {className: "win-button", onClick: function (e) { return _this.applyDiscount(e); }}, loading ? React.createElement("i", {key: lodash_1.uniqueId(), className: "fa fa-spinner fa-spin"}) : "Apply"))), error ? React.createElement("p", {className: "error red"}, error) : null, React.createElement("hr", null)));
        return (React.createElement(cart_summary_1.CartSummary, {totals: this.props.totals, coupons: coupons, lineItems: this.props.items, controls: controls, onRemoveDiscount: function (e, c) { return _this.removeDiscount(e, c); }}));
    };
    CheckoutPage.prototype.generateAddressForm = function (type) {
        /**
         * A function accessor that returns the correct prop depending on the address type.
         */
        var accessor = function (s) {
            //Ensure the given state has both payment.billingAddress and customer.shippingAddress props
            s = lodash_1.defaults(s, { payment: { billingAddress: {} }, customer: { shippingAddress: {} } });
            return type === "billing" ? s.payment.billingAddress : s.customer.shippingAddress;
        };
        /**
         * A function for selecting a new country and performing maintenance on its Zip and StateCode props.
         */
        var updateCountry = function (s, iso) {
            var countryData = lodash_1.find(countries_1.Countries, function (c) { return c.iso === iso; });
            var address = accessor(s);
            address.CountryCode = iso;
            //If the country has states, select the first one. If not, delete the state
            if (countryData.states.length > 0) {
                address.StateCode = countryData.states[0].iso;
            }
            else {
                address.StateCode = undefined;
            }
            //If the country doesn't have postal codes, delete it.
            if (countryData.hasPostalCodes === false) {
                address.Zip = undefined;
            }
        };
        var address = accessor(this.state);
        var StateCode = address.StateCode, CountryCode = address.CountryCode;
        var countryData = lodash_1.find(countries_1.Countries, function (c) { return c.iso === CountryCode; });
        var countries = lodash_1.map(countries_1.Countries, function (c) { return React.createElement("option", {key: c.iso, value: c.iso}, c.name); });
        var states = lodash_1.map(countryData.states, function (s) { return React.createElement("option", {key: lodash_1.uniqueId(), value: s.iso}, s.name); });
        return (React.createElement("div", {className: "address-form form-container ms-row"}, React.createElement("div", {className: "xs-col-24-24"}, React.createElement("input", {className: "win-textbox", type: "text", placeholder: "Name or company name", value: address.Name, onChange: this.updateState(function (s, v) { return accessor(s).Name = v; })}), React.createElement("div", {className: "ms-row vc"}, React.createElement("div", {className: "m-col-16-24"}, React.createElement("input", {className: "win-textbox", type: "text", placeholder: "Address", value: address.Line1, onChange: this.updateState(function (s, v) { return accessor(s).Line1 = v; })})), React.createElement("div", {className: "m-col-8-24"}, React.createElement("input", {className: "win-textbox", type: "text", placeholder: "Apt, suite, etc. (optional)", value: address.Line2, onChange: this.updateState(function (s, v) { return accessor(s).Line2 = v; })}))), React.createElement("div", {className: "ms-row vc"}, React.createElement("div", {className: "col-1-1"}, React.createElement("input", {className: "win-textbox", type: "text", placeholder: "City", value: address.City, onChange: this.updateState(function (s, v) { return accessor(s).City = v; })}))), React.createElement("div", {className: "ms-row vc"}, React.createElement("div", {className: "m-col-" + (states && states.length > 0 ? "8" : countryData.hasPostalCodes ? "12" : "24") + "-24"}, React.createElement("select", {className: "win-select", value: CountryCode, onChange: this.updateState(updateCountry)}, countries)), !states || states.length === 0 ? null :
            React.createElement("div", {className: "m-col-8-24"}, React.createElement("select", {className: "win-select", value: StateCode, onChange: this.updateState(function (s, v) { return accessor(s).StateCode = v; })}, states)), !countryData.hasPostalCodes ? null :
            React.createElement("div", {className: "m-col-" + (states && states.length > 0 ? "8" : "12") + "-24"}, React.createElement("input", {className: "win-textbox", type: "text", placeholder: "Postal code", value: address.Zip, onChange: this.updateState(function (s, v) { return accessor(s).Zip = v; })}))))));
    };
    CheckoutPage.prototype.generateCustomerInformation = function () {
        var _this = this;
        var _a = this.state.customer, email = _a.email, error = _a.error;
        return (React.createElement("section", {id: "customer-information"}, this.generateHeader(), React.createElement("form", null, React.createElement("div", {className: "form-group"}, React.createElement("label", {className: "control-label"}, "Customer information"), React.createElement("div", {className: "form-container ms-row"}, React.createElement("div", {className: "xs-col-24-24"}, React.createElement("input", {className: "win-textbox", type: "text", placeholder: "Email address", value: email, onChange: this.updateState(function (s, v) { return s.customer.email = v; })})))), React.createElement("div", {className: "form-group"}, React.createElement("label", {className: "control-label"}, "Shipping address"), this.generateAddressForm("shipping"))), error ? React.createElement("p", {className: "error red"}, error) : null, React.createElement("div", {className: "ms-row vc zero-margin"}, React.createElement("div", {className: "xs-col-8-24"}, React.createElement("a", {href: "/cart"}, React.createElement("i", {className: "fa fa-one-rem fa-chevron-left marRight5"}), "Return to cart")), React.createElement("div", {className: "xs-col-16-24 text-right"}, React.createElement("button", {className: "win-button win-button-primary", onClick: function (e) { return _this.continueToShipping(e); }}, "Continue to shipping method")))));
    };
    CheckoutPage.prototype.generateShippingInformation = function () {
        var _this = this;
        var back = function (event) {
            event.preventDefault();
            _this.mergeState({ page: page.customerInformation });
        };
        var address = this.state.customer.shippingAddress;
        var country = lodash_1.find(countries_1.Countries, function (c) { return c.iso === address.CountryCode; });
        return (React.createElement("section", {id: "shipping-information"}, this.generateHeader(), React.createElement("form", null, React.createElement("div", {id: "shipping-address", className: "form-group"}, React.createElement("label", {className: "control-label"}, "Shipping address"), React.createElement(address_line_1.AddressLine, {address: address}, React.createElement("a", {href: "#", onClick: back}, "Edit shipping address"))), React.createElement("div", {className: "form-group"}, React.createElement("label", {className: "control-label"}, "Shipping method"), React.createElement("div", {id: "shipping-method", className: "ms-row vc zero-margin"}, React.createElement("div", {className: "xs-col-2-24"}, React.createElement("input", {type: "radio", className: "win-radio", checked: true})), React.createElement("div", {className: "xs-col-12-24"}, address.CountryCode === "US" ? "Standard Shipping" : "International Shipping"), React.createElement("div", {className: "xs-col-9-24 text-right"}, address.CountryCode === "US" ? "Free" : "USD $35.00")))), React.createElement("div", {className: "ms-row vc zero-margin"}, React.createElement("div", {className: "xs-col-12-24"}, React.createElement("a", {href: "#", onClick: back}, React.createElement("i", {className: "fa fa-one-rem fa-chevron-left marRight5"}), "Return to customer information")), React.createElement("div", {className: "xs-col-12-24 text-right"}, React.createElement("button", {className: "win-button win-button-primary", onClick: function (e) { return _this.continueToPayment(e); }}, "Continue to payment method")))));
    };
    CheckoutPage.prototype.generatePaymentPage = function () {
        var _this = this;
        var _a = this.state.payment, _b = _a.card, number = _b.number, cvv = _b.cvv, expiry = _b.expiry, name = _b.name, error = _a.error, sameBillingAddress = _a.sameBillingAddress, loading = _a.loading;
        var back = function (event) {
            event.preventDefault();
            _this.setState({ page: page.shippingMethod });
        };
        return (React.createElement("section", {id: "payment-method"}, this.generateHeader(), React.createElement("form", null, "All transactions are secure and encrypted. Credit card information is never stored.", React.createElement("div", {className: "form-group"}, React.createElement("label", {className: "control-label"}, "Credit card", React.createElement("img", {src: "/resources/images/cards.png", className: "img-responsive pull-right"})), React.createElement("div", {className: "form-container ms-row"}, React.createElement("div", {className: "xs-col-24-24"}, React.createElement("input", {type: "text", className: "win-textbox", placeholder: "Card number", value: number, onChange: this.updateState(function (s, v) { return s.payment.card.number = creditcard.formatCardNumber(v); })}), React.createElement("div", {className: "ms-row vc"}, React.createElement("div", {className: "m-col-12-24"}, React.createElement("input", {type: "text", className: "win-textbox", placeholder: "Name on card", value: name, onChange: this.updateState(function (s, v) { return s.payment.card.name = v; })})), React.createElement("div", {className: "m-col-6-24"}, React.createElement("input", {type: "text", className: "win-textbox", placeholder: "MM / YY", value: expiry, onChange: this.updateState(function (s, v) { return s.payment.card.expiry = cc_expiry_1.format(v); })})), React.createElement("div", {className: "m-col-6-24"}, React.createElement("input", {type: "text", className: "win-textbox", placeholder: "CVV", maxLength: 4, value: cvv, onChange: this.updateState(function (s, v) { return s.payment.card.cvv = v; })})))))), React.createElement("div", {className: "form-group", id: "billing-address"}, React.createElement("label", {className: "control-label"}, "Billing address"), React.createElement("div", {className: "ms-row vc cursor-pointer", onClick: this.updateState(function (s) { return s.payment.sameBillingAddress = true; })}, React.createElement("div", {className: "xs-col-2-24"}, React.createElement("input", {type: "radio", name: "sameBillingAddress", className: "win-radio", checked: sameBillingAddress, onChange: this.updateState(function (s) { return s.payment.sameBillingAddress = true; })})), React.createElement("div", {className: "xs-col-20-24"}, "Same as shipping address")), React.createElement("div", {className: "ms-row vc cursor-pointer", onClick: this.updateState(function (s) { return s.payment.sameBillingAddress = false; })}, React.createElement("div", {className: "xs-col-2-24"}, React.createElement("input", {type: "radio", name: "sameBillingAddress", className: "win-radio", checked: !sameBillingAddress, onChange: this.updateState(function (s) { return s.payment.sameBillingAddress = false; })})), React.createElement("div", {className: "xs-col-20-24"}, "Use a different billing address")), !sameBillingAddress && this.generateAddressForm("billing"))), error ? React.createElement("p", {className: "error red"}, error) : null, React.createElement("div", {className: "ms-row vc zero-margin"}, React.createElement("div", {className: "xs-col-12-24"}, React.createElement("a", {href: "#", onClick: back}, React.createElement("i", {className: "fa fa-one-rem fa-chevron-left marRight5", onClick: back}), "Return to shipping method")), React.createElement("div", {className: "xs-col-12-24 text-right"}, React.createElement("button", {className: "win-button win-button-primary", onClick: function (e) { return _this.completeOrder(e); }}, loading ? [React.createElement("i", {key: lodash_1.uniqueId(), className: "fa fa-spinner fa-spin marRight5"}), "Placing order"] : "Complete order")))));
    };
    //#endregion
    //#region Event handlers
    CheckoutPage.prototype.applyDiscount = function (event) {
        event.preventDefault();
        // TODO: Call props.applyDiscount.then((coupon))
    };
    CheckoutPage.prototype.removeDiscount = function (event, coupon) {
        event.preventDefault();
        // TODO: Call props.removeDiscount.then((shouldRemove))
    };
    CheckoutPage.prototype.continueToShipping = function (event) {
        event.preventDefault();
        var state = lodash_1.clone(this.state);
        var _a = this.state.customer, email = _a.email, shippingAddress = _a.shippingAddress;
        var addressValidation = this.validateAddress(shippingAddress);
        if (!email || email.indexOf("@") === -1 || email.indexOf(".") === -1) {
            state.customer.error = "You must enter a valid email address.";
        }
        else if (!addressValidation.success) {
            state.customer.error = addressValidation.message;
        }
        else {
            state.customer.error = undefined;
            state.summary.error = undefined;
            state.page = page.shippingMethod;
        }
        this.mergeState(state);
    };
    CheckoutPage.prototype.continueToPayment = function (event) {
        event.preventDefault();
        this.mergeState({ page: page.paymentMethod });
    };
    CheckoutPage.prototype.completeOrder = function (event) {
        event.preventDefault();
        var _a = this.state, payment = _a.payment, card = _a.payment.card;
        if (payment.loading) {
            return;
        }
        var expiry = lodash_1.defaults(creditcard.parseCardExpiry(card.expiry || ""), { month: 0, year: 0 });
        var error = undefined;
        if (!payment.sameBillingAddress) {
            var validation = this.validateAddress(payment.billingAddress);
            if (!validation.success) {
                error = validation.message;
            }
        }
        // TODO: call props.completeOrder(card).then((valid))
        payment.error = error;
        payment.loading = !error;
        this.mergeState({ payment: payment, summary: { error: undefined } });
        if (error) {
            return;
        }
    };
    //#endregion
    CheckoutPage.prototype.componentDidMount = function () {
    };
    CheckoutPage.prototype.componentDidUpdate = function () {
    };
    CheckoutPage.prototype.componentWillUpdate = function (newProps, newState) {
        if (newState.page != this.state.page) {
            //Page changed, remove the coupon error
            newState.summary.error = undefined;
        }
    };
    CheckoutPage.prototype.componentWillReceiveProps = function (props) {
        this.configureState(props, true);
    };
    CheckoutPage.prototype.render = function () {
        var currentPage = this.state.page;
        var renderedPage;
        switch (currentPage) {
            default:
            case page.customerInformation:
                renderedPage = this.generateCustomerInformation();
                break;
            case page.shippingMethod:
                renderedPage = this.generateShippingInformation();
                break;
            case page.paymentMethod:
                renderedPage = this.generatePaymentPage();
                break;
        }
        return (React.createElement("main", {id: "checkout-page", className: "ms-grid"}, React.createElement("div", {className: "ms-row"}, this.generateHeader(true), this.generateCartSummary(), React.createElement("section", {id: "panels", className: "m-col-14-24 m-col-24-pull-10"}, React.createElement("div", {className: "ms-row"}, React.createElement("div", {className: "m-col-22-24 m-col-24-offset-1"}, renderedPage)), React.createElement("div", {className: "ms-row", id: "copyright"}, React.createElement("div", {className: "m-col-23-24 m-col-24-offset-1"}, React.createElement("p", null, "\u00A9 " + this.props.siteName + ", " + new Date().getUTCFullYear(), React.createElement("a", {href: "mailto:" + this.props.supportEmail, className: "pull-right"}, this.props.supportEmail))))))));
    };
    return CheckoutPage;
}(auto_prop_component_1.AutoPropComponent));
exports.CheckoutPage = CheckoutPage;
