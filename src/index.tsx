import * as React from "react";
import * as classes from "classnames";
import * as creditcard from "creditcardutils";
import FontAwesome = require("react-fontawesome");
import { format as formatExpiry } from "cc-expiry";
import { Address, Coupon, LineItem, Totals } from "./types";
import { Countries } from "./data/countries";
import { CartSummary } from "./cart-summary";
import { AddressLine } from "./address-line";
import { v4 as guid } from "node-uuid";
import { compute, Option } from "@nozzlegear/railway";

declare var require: any;

// if (true === false)
// {
//
// }

export enum page {
    customerInformation = 0,
    shippingMethod = 1,
    paymentMethod = 2
}

export interface IProps extends React.Props<any> {
    items: LineItem[];

    totals: Totals;

    allowCoupons?: boolean;

    siteName: string;

    supportEmail: string;
}

export interface IState {
    page?: page;

    customer?: {
        email?: string;
        shippingAddress?: Address;
        error?: string;
    };

    summary?: {
        loading?: boolean;
        error?: string;
        code?: string;
        coupons?: Coupon[];
    };

    payment?: {
        loading?: boolean;
        sameBillingAddress?: boolean;
        error?: string;
        card?: {
            number?: string;
            name?: string;
            expiry?: string;
            cvv?: string;
        };
        billingAddress?: Address;
    };
}

export class CheckoutPage extends React.Component<IProps, IState> {
    constructor(props: IProps) {
        super(props);

        this.configureState(props, false);
    }

    public state: IState;

    // This is a static property to prevent items resizing on every re-render (selecting a form option, etc)
    private isMobile = window.innerWidth < 767;

    private configureState(props: IProps, useSetState: boolean) {
        const usa = Countries.filter(c => c.iso === "US")[0];

        let defaultAddress: Address = {
            City: undefined,
            CountryCode: usa.iso,
            Line1: undefined,
            Line2: undefined,
            Name: undefined,
            StateCode: usa.states[0].iso,
            Zip: undefined
        };

        let state: IState = {
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
                billingAddress: defaultAddress
            }
        };

        if (!useSetState) {
            this.state = state;

            return;
        }

        this.setState(state);
    }

    updateStateFromEvent: (
        callback: (state: IState, value: string) => void
    ) => (event: React.FormEvent<any>) => void = callback => {
        return event => {
            const value: string = event.currentTarget.value;
            let clonedState = { ...this.state };

            callback(clonedState, value);

            this.setState(clonedState);
        };
    };

    private validateAddress(address: Address) {
        let output = {
            success: false,
            message: undefined
        };

        const filteredCountries = Countries.filter(c => c.iso === address.CountryCode);

        // Ensure customer has selected a valid country
        if (filteredCountries.length === 0) {
            output.message = "You must select a valid country.";

            return output;
        }

        const countryData = filteredCountries[0];

        if (countryData.states.length > 0) {
            // Ensure the selected state exists in the list of the country's states
            if (!countryData.states.some(s => s.iso === address.StateCode)) {
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

        if (
            countryData.hasPostalCodes &&
            countryData.zipRegex !== 0 &&
            !new RegExp(countryData.zipRegex as string).test(address.Zip)
        ) {
            output.message = "You must enter a valid Zip or Postal code.";

            return output;
        }

        output.success = true;

        return output;
    }

    //#endregion

    //#region Component generators

    private generateHeader(forMobile: boolean = false) {
        const currentPage = this.state.page;

        const navigate = (to: "customer" | "shipping") => (event: React.MouseEvent) => {
            event.preventDefault();

            this.setState({ page: to === "customer" ? page.customerInformation : page.shippingMethod });
        };

        const Container = (props: React.Props<any>) => {
            let output: JSX.Element;

            if (forMobile) {
                output = (
                    <section className="xs-col-24-24 show-xs hide-sm hide-m hide-l hide-xl" id="checkout-header">
                        {props.children}
                    </section>
                );
            } else {
                output = (
                    <div className="hide-xs show-sm show-m show-l show-xl">
                        <div className="ms-row">
                            <div className="col-1-1">{props.children}</div>
                        </div>
                    </div>
                );
            }

            return output;
        };

        return (
            <Container>
                <h1 className="page-title">{this.props.siteName}</h1>
                <ul id="nav">
                    <li>
                        <a href="/cart">{"Cart"}</a>
                    </li>
                    <li className="chevron">
                        <FontAwesome name="chevron-right" className="fa-one-rem" />
                    </li>
                    <li className={classes({ active: currentPage === page.customerInformation })}>
                        {currentPage <= page.customerInformation ? (
                            "Customer Information"
                        ) : (
                            <a href="#" onClick={navigate("customer")}>
                                {"Customer Information"}
                            </a>
                        )}
                    </li>
                    <li className="chevron">
                        <FontAwesome name="chevron-right" className="fa-one-rem" />
                    </li>
                    <li className={classes({ active: currentPage === page.shippingMethod })}>
                        {currentPage <= page.shippingMethod ? (
                            "Shipping Information"
                        ) : (
                            <a href="#" onClick={navigate("shipping")}>
                                {"Shipping Information"}
                            </a>
                        )}
                    </li>
                    <li className="chevron">
                        <FontAwesome name="chevron-right" className="fa-one-rem" />
                    </li>
                    <li className={classes({ active: currentPage === page.paymentMethod })}>{"Payment method"}</li>
                </ul>
            </Container>
        );
    }

    private generateCartSummary() {
        const {
            summary: { loading, error, coupons, code },
            customer: {
                shippingAddress: { CountryCode }
            }
        } = this.state;

        const setSummaryCode = (event: React.FormEvent<any>) => {
            const value = event.currentTarget.value;

            this.setState({ summary: { ...this.state.summary, code: value } });
        };

        const controls = (
            <div>
                <div className="ms-row vc zero-margin discount-form">
                    <div className="xs-col-18-24 form-group" style={{ marginBottom: "0px" }}>
                        <input
                            className="win-textbox"
                            placeholder="Discount Code"
                            value={code}
                            onChange={e => setSummaryCode(e)}
                        />
                    </div>
                    <div className="xs-col-6-24 text-center">
                        <button className="win-button" onClick={e => this.applyDiscount(e)}>
                            {loading ? <FontAwesome key={"apply-discount-spinner"} name="spinner" spin /> : "Apply"}
                        </button>
                    </div>
                </div>
                {error ? <p className="error red">{error}</p> : null}
                <hr />
            </div>
        );

        return (
            <CartSummary
                totals={this.props.totals}
                coupons={coupons}
                lineItems={this.props.items}
                controls={controls}
                onRemoveDiscount={(e, c) => this.removeDiscount(e, c)}
            />
        );
    }

    private generateAddressForm(type: "billing" | "shipping") {
        /**
         * A function accessor that returns the correct prop depending on the address type.
         */
        const accessor = (s: IState) => {
            //Ensure the given state has both payment.billingAddress and customer.shippingAddress props
            const state = compute<IState>(() => {
                let output = { ...s };

                if (!output.payment) {
                    output.payment = { billingAddress: {} as any };
                }

                if (!output.customer) {
                    output.customer = { shippingAddress: {} as any };
                }

                return output;
            });

            const paymentBillingAddress: Partial<Address> =
                s.payment && s.payment.billingAddress ? s.payment.billingAddress : {};
            const customerShippingAddress: Partial<Address> =
                s.customer && s.customer.shippingAddress ? s.customer.shippingAddress : {};

            return type === "billing" ? paymentBillingAddress : customerShippingAddress;
        };

        /**
         * A function for selecting a new country and performing maintenance on its Zip and StateCode props.
         */
        const updateCountry = (s: IState, iso: string) => {
            const countryData = Countries.filter(c => c.iso === iso)[0];
            let address = accessor(s);

            address.CountryCode = iso;

            //If the country has states, select the first one. If not, delete the state
            if (countryData.states.length > 0) {
                address.StateCode = countryData.states[0].iso;
            } else {
                address.StateCode = undefined;
            }

            //If the country doesn't have postal codes, delete it.
            if (countryData.hasPostalCodes === false) {
                address.Zip = undefined;
            }
        };

        const address = accessor(this.state);
        const { StateCode, CountryCode } = address;
        const countryData = Countries.filter(c => c.iso === CountryCode)[0];
        const countries = Countries.map(c => (
            <option key={c.iso} value={c.iso}>
                {c.name}
            </option>
        ));
        const states = countryData.states.map(s => (
            <option key={guid()} value={s.iso}>
                {s.name}
            </option>
        ));

        return (
            <div className="address-form form-container ms-row">
                <div className="xs-col-24-24">
                    <input
                        className="win-textbox"
                        type="text"
                        placeholder="Name or company name"
                        value={address.Name}
                        onChange={this.updateStateFromEvent((s, v) => (accessor(s).Name = v))}
                    />
                    <div className="ms-row vc">
                        <div className="m-col-16-24">
                            <input
                                className="win-textbox"
                                type="text"
                                placeholder="Address"
                                value={address.Line1}
                                onChange={this.updateStateFromEvent((s, v) => (accessor(s).Line1 = v))}
                            />
                        </div>
                        <div className="m-col-8-24">
                            <input
                                className="win-textbox"
                                type="text"
                                placeholder="Apt, suite, etc. (optional)"
                                value={address.Line2}
                                onChange={this.updateStateFromEvent((s, v) => (accessor(s).Line2 = v))}
                            />
                        </div>
                    </div>
                    <div className="ms-row vc">
                        <div className="col-1-1">
                            <input
                                className="win-textbox"
                                type="text"
                                placeholder="City"
                                value={address.City}
                                onChange={this.updateStateFromEvent((s, v) => (accessor(s).City = v))}
                            />
                        </div>
                    </div>
                    <div className="ms-row vc">
                        <div
                            className={`m-col-${
                                states && states.length > 0 ? "8" : countryData.hasPostalCodes ? "12" : "24"
                            }-24`}>
                            <select
                                className="win-select"
                                value={CountryCode}
                                onChange={this.updateStateFromEvent(updateCountry)}>
                                {countries}
                            </select>
                        </div>
                        {!states || states.length === 0 ? null : (
                            <div className="m-col-8-24">
                                <select
                                    className="win-select"
                                    value={StateCode}
                                    onChange={this.updateStateFromEvent((s, v) => (accessor(s).StateCode = v))}>
                                    {states}
                                </select>
                            </div>
                        )}
                        {!countryData.hasPostalCodes ? null : (
                            <div className={`m-col-${states && states.length > 0 ? "8" : "12"}-24`}>
                                <input
                                    className="win-textbox"
                                    type="text"
                                    placeholder="Postal code"
                                    value={address.Zip}
                                    onChange={this.updateStateFromEvent((s, v) => (accessor(s).Zip = v))}
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    private generateCustomerInformation() {
        const {
            customer: { email, error }
        } = this.state;

        return (
            <section id="customer-information">
                {this.generateHeader()}
                <form>
                    <div className="form-group">
                        <label className="control-label">{"Customer information"}</label>
                        <div className="form-container ms-row">
                            <div className="xs-col-24-24">
                                <input
                                    className="win-textbox"
                                    type="text"
                                    placeholder="Email address"
                                    value={email}
                                    onChange={this.updateStateFromEvent((s, v) => (s.customer.email = v))}
                                />
                            </div>
                        </div>
                    </div>
                    <div className="form-group">
                        <label className="control-label">{"Shipping address"}</label>
                        {this.generateAddressForm("shipping")}
                    </div>
                </form>
                {error ? <p className="error red">{error}</p> : null}
                <div className="ms-row vc zero-margin">
                    <div className="xs-col-8-24">
                        <a href="/cart">
                            <FontAwesome name="chevron-left" className="marRight5 fa-one-rem" />
                            Return to cart
                        </a>
                    </div>
                    <div className="xs-col-16-24 text-right">
                        <button className="win-button win-button-primary" onClick={e => this.continueToShipping(e)}>
                            Continue to shipping method
                        </button>
                    </div>
                </div>
            </section>
        );
    }

    private generateShippingInformation() {
        const back = (event: React.MouseEvent) => {
            event.preventDefault();

            this.setState({ page: page.customerInformation });
        };

        const address = this.state.customer.shippingAddress;
        const country = Countries.filter(c => c.iso === address.CountryCode)[0];

        return (
            <section id="shipping-information">
                {this.generateHeader()}
                <form>
                    <div id="shipping-address" className="form-group">
                        <label className="control-label">{"Shipping address"}</label>
                        <AddressLine address={address}>
                            <a href="#" onClick={back}>
                                {"Edit shipping address"}
                            </a>
                        </AddressLine>
                    </div>
                    <div className="form-group">
                        <label className="control-label">{"Shipping method"}</label>
                        <div id="shipping-method" className="ms-row vc zero-margin">
                            <div className="xs-col-2-24">
                                <input type="radio" className="win-radio" checked={true} />
                            </div>
                            <div className="xs-col-12-24">
                                {address.CountryCode === "US" ? "Standard Shipping" : "International Shipping"}
                            </div>
                            <div className="xs-col-9-24 text-right">
                                {`USD $${this.props.totals.shippingTotal.toFixed(2)}`}
                            </div>
                        </div>
                    </div>
                </form>
                <div className="ms-row vc zero-margin">
                    <div className="xs-col-12-24">
                        <a href="#" onClick={back}>
                            <FontAwesome name="chevron-left" className="marRight5 fa-one-rem" />
                            Return to customer information
                        </a>
                    </div>
                    <div className="xs-col-12-24 text-right">
                        <button className="win-button win-button-primary" onClick={e => this.continueToPayment(e)}>
                            Continue to payment method
                        </button>
                    </div>
                </div>
            </section>
        );
    }

    private generatePaymentPage() {
        const {
            payment: {
                card: { number, cvv, expiry, name },
                error,
                sameBillingAddress,
                loading
            }
        } = this.state;

        const back = (event: React.MouseEvent) => {
            event.preventDefault();

            this.setState({ page: page.shippingMethod });
        };

        return (
            <section id="payment-method">
                {this.generateHeader()}
                <form>
                    {"All transactions are secure and encrypted. Credit card information is never stored."}
                    <div className="form-group">
                        <label className="control-label">
                            {"Credit card"}
                            <img src="/resources/images/cards.png" className="img-responsive pull-right" />
                        </label>
                        <div className="form-container ms-row">
                            <div className="xs-col-24-24">
                                <input
                                    type="text"
                                    className="win-textbox"
                                    placeholder="Card number"
                                    value={number}
                                    onChange={this.updateStateFromEvent(
                                        (s, v) => (s.payment.card.number = creditcard.formatCardNumber(v))
                                    )}
                                />
                                <div className="ms-row vc">
                                    <div className="m-col-12-24">
                                        <input
                                            type="text"
                                            className="win-textbox"
                                            placeholder="Name on card"
                                            value={name}
                                            onChange={this.updateStateFromEvent((s, v) => (s.payment.card.name = v))}
                                        />
                                    </div>
                                    <div className="m-col-6-24">
                                        <input
                                            type="text"
                                            className="win-textbox"
                                            placeholder="MM / YY"
                                            value={expiry}
                                            onChange={this.updateStateFromEvent(
                                                (s, v) => (s.payment.card.expiry = formatExpiry(v))
                                            )}
                                        />
                                    </div>
                                    <div className="m-col-6-24">
                                        <input
                                            type="text"
                                            className="win-textbox"
                                            placeholder="CVV"
                                            maxLength={4}
                                            value={cvv}
                                            onChange={this.updateStateFromEvent((s, v) => (s.payment.card.cvv = v))}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="form-group" id="billing-address">
                        <label className="control-label">{"Billing address"}</label>
                        <div
                            className="ms-row vc cursor-pointer"
                            onClick={this.updateStateFromEvent(s => (s.payment.sameBillingAddress = true))}>
                            <div className="xs-col-2-24">
                                <input
                                    type="radio"
                                    name="sameBillingAddress"
                                    className="win-radio"
                                    checked={sameBillingAddress}
                                    onChange={this.updateStateFromEvent(s => (s.payment.sameBillingAddress = true))}
                                />
                            </div>
                            <div className="xs-col-20-24">{"Same as shipping address"}</div>
                        </div>
                        <div
                            className="ms-row vc cursor-pointer"
                            onClick={this.updateStateFromEvent(s => (s.payment.sameBillingAddress = false))}>
                            <div className="xs-col-2-24">
                                <input
                                    type="radio"
                                    name="sameBillingAddress"
                                    className="win-radio"
                                    checked={!sameBillingAddress}
                                    onChange={this.updateStateFromEvent(s => (s.payment.sameBillingAddress = false))}
                                />
                            </div>
                            <div className="xs-col-20-24">{"Use a different billing address"}</div>
                        </div>
                        {!sameBillingAddress && this.generateAddressForm("billing")}
                    </div>
                </form>
                {error ? <p className="error red">{error}</p> : null}
                <div className="ms-row vc zero-margin">
                    <div className="xs-col-12-24">
                        <a href="#" onClick={back}>
                            <FontAwesome name="chevron-left" className="marRight5 fa-one-rem" />
                            Return to shipping method
                        </a>
                    </div>
                    <div className="xs-col-12-24 text-right">
                        <button className="win-button win-button-primary" onClick={e => this.completeOrder(e)}>
                            {loading
                                ? [
                                      <FontAwesome key={guid()} name="spinner" className="marRight5" spin />,
                                      "Placing order"
                                  ]
                                : "Complete order"}
                        </button>
                    </div>
                </div>
            </section>
        );
    }

    //#endregion

    //#region Event handlers

    private applyDiscount(event: React.MouseEvent) {
        event.preventDefault();

        // TODO: Call props.applyDiscount.then((coupon))
    }

    private removeDiscount(event: React.MouseEvent, coupon: Coupon) {
        event.preventDefault();

        // TODO: Call props.removeDiscount.then((shouldRemove))
    }

    private continueToShipping(event: React.MouseEvent) {
        event.preventDefault();

        const { email, shippingAddress } = this.state.customer;
        const addressValidation = this.validateAddress(shippingAddress);

        if (!email || email.indexOf("@") === -1 || email.indexOf(".") === -1) {
            this.setState({ customer: { ...this.state.customer, error: "You must enter a valid email address." } });
        } else if (!addressValidation.success) {
            this.setState({ customer: { ...this.state.customer, error: addressValidation.message } });
        } else {
            this.setState({
                customer: { ...this.state.customer, error: undefined },
                summary: { ...this.state.summary, error: undefined },
                page: page.shippingMethod
            });
        }
    }

    private continueToPayment(event: React.MouseEvent) {
        event.preventDefault();

        this.setState({ page: page.paymentMethod });
    }

    private completeOrder(event: React.MouseEvent) {
        event.preventDefault();

        const {
            payment,
            payment: { card }
        } = this.state;

        if (payment.loading) {
            return;
        }

        const expiry = compute<{ month: number; year: number }>(() => {
            const parsed = creditcard.parseCardExpiry(card.expiry || "");

            return {
                month: parsed && typeof parsed.month === "number" ? parsed.month : 0,
                year: parsed && typeof parsed.year === "number" ? parsed.year : 0
            };
        });
        const error = compute<Option<string>>(() => {
            if (!payment.sameBillingAddress) {
                const validation = this.validateAddress(payment.billingAddress);

                if (!validation.success) {
                    return Option.ofSome(validation.message);
                }
            }

            return Option.ofNone();
        });

        // TODO: call props.completeOrder(card).then((valid))
        this.setState({
            payment: {
                ...payment,
                error: error.defaultValue(undefined as any),
                loading: error.isNone()
            }
        });

        if (error.isSome()) {
            return;
        }
    }

    //#endregion

    public componentWillUpdate(newProps: IProps, newState: IState) {
        if (newState.page != this.state.page) {
            //Page changed, remove the coupon error
            newState.summary.error = undefined;
        }
    }

    public componentWillReceiveProps(props: IProps) {
        this.configureState(props, true);
    }

    public render() {
        const currentPage = this.state.page;
        let renderedPage: JSX.Element;

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

        // FontAwesome must be included with the page.
        const fontAwesome = (
            <link href="https://maxcdn.bootstrapcdn.com/font-awesome/4.6.3/css/font-awesome.min.css" rel="stylesheet" />
        );

        return (
            <main id="checkout-page" className="ms-grid">
                {fontAwesome}
                <div className="ms-row">
                    {this.generateHeader(true)}
                    {this.generateCartSummary()}
                    <section id="panels" className="m-col-14-24 m-col-24-pull-10">
                        <div className="ms-row">
                            <div className="m-col-22-24 m-col-24-offset-1">{renderedPage}</div>
                        </div>
                        <div id="copyright">
                            <p>
                                {`© ${this.props.siteName}, ${new Date().getUTCFullYear()}`}
                                <a href={`mailto:${this.props.supportEmail}`} className="pull-right">
                                    {this.props.supportEmail}
                                </a>
                            </p>
                        </div>
                    </section>
                </div>
            </main>
        );
    }
}
