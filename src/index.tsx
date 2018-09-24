import * as React from "react";
import * as classes from "classnames";
import * as creditcard from "creditcardutils";
import FontAwesome = require("react-fontawesome");
import { format as formatExpiry } from "cc-expiry";
import { Address, Coupon, LineItem, Totals, Card, ShippingRate } from "./types";
import { Countries } from "./data/countries";
import { CartSummary } from "./cart-summary";
import { AddressLine } from "./address-line";
import { compute, Option, AsyncResult } from "@nozzlegear/railway";

enum page {
    customerInformation = 0,
    shippingMethod = 1,
    paymentMethod = 2
}

// Turn this module into a barrel by exporting all of the packages types
export * from "./address-line";
export * from "./cart-summary";
export * from "./types";

export interface CheckoutPageProps extends React.Props<any> {
    items: LineItem[];
    totals: Totals;
    allowCoupons?: boolean;
    siteName: string;
    supportEmail: string;
    backToCart: {
        url: string;
        onClick?: () => void;
    };
    onApplyCoupon?: (code: string) => AsyncResult<Coupon>;
    onCalculateShipping: (address: Address) => AsyncResult<ShippingRate[]>;
    onConfirmPayment: (
        card: Card,
        shippingRate: Option<ShippingRate>,
        coupons: Coupon[],
        billingAddress: Option<Address>
    ) => AsyncResult<{ url: string }>;
}

interface CheckoutPageState {
    page: page;
    loading: boolean;
    error: Option<string>;
    rates: ShippingRate[];
    selectedRate: Option<ShippingRate>;
    email: string;
    shippingAddress: Address;
    discountCode: Option<string>;
    coupons: Coupon[];
    sameBillingAddress: boolean;
    card: Card;
    billingAddress: Address;
}

export class CheckoutPage extends React.Component<CheckoutPageProps, CheckoutPageState> {
    constructor(props: CheckoutPageProps, context: unknown) {
        super(props, context);

        const usa = Countries.filter(c => c.iso === "US")[0];

        let defaultAddress: Address = {
            city: "",
            countryCode: usa.iso,
            line1: "",
            line2: "",
            name: "",
            stateCode: Option.ofSome(usa.states[0].iso),
            zip: Option.ofSome("")
        };

        this.state = {
            page: page.customerInformation,
            email: "",
            shippingAddress: defaultAddress,
            billingAddress: defaultAddress,
            selectedRate: Option.ofNone(),
            card: {
                number: "",
                cvv: "",
                expiry: "",
                name: ""
            },
            coupons: [],
            discountCode: Option.ofNone(),
            error: Option.ofNone(),
            loading: false,
            rates: [],
            sameBillingAddress: false
        };
    }

    state: CheckoutPageState;

    updateStateFromEvent: (
        callback: (state: CheckoutPageState, value: string) => void
    ) => (event: React.FormEvent<any>) => void = callback => {
        return event => {
            const value: string = event.currentTarget.value;
            let clonedState = { ...this.state };

            callback(clonedState, value);

            this.setState(clonedState);
        };
    };

    /**
     * Validates an address, returning Option.Some with an error message when validation fails.
     */
    private validateAddress(address: Address): Option<string> {
        const filteredCountries = Countries.filter(c => c.iso === address.countryCode);

        // Ensure customer has selected a valid country
        if (filteredCountries.length === 0) {
            return Option.ofSome("You must select a valid country.");
        }

        const countryData = filteredCountries[0];

        if (countryData.states.length > 0) {
            // Ensure the selected state exists in the list of the country's states
            if (!countryData.states.some(s => s.iso === address.stateCode.defaultValue(""))) {
                return Option.ofSome("You must select a valid state.");
            }
        }

        if (!address.city) {
            return Option.ofSome("You must enter a city.");
        }

        if (!address.line1) {
            return Option.ofSome("You must enter a street address.");
        }

        if (!address.name) {
            return Option.ofSome("You must enter a name or company name for this address.");
        }

        if (typeof countryData.zipRegex === "number" || countryData.hasPostalCodes === false) {
            return Option.ofNone();
        }

        const regex = countryData.zipRegex;
        const passesRegex = address.zip.map(z => new RegExp(regex).test(z)).defaultValue(false);

        return passesRegex ? Option.ofNone() : Option.ofSome("You must enter a valid ZIP or Postal code.");
    }

    private generateHeader(forMobile: boolean = false) {
        const currentPage = this.state.page;
        const { backToCart } = this.props;

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

        function handleBackToCart(this: void, e: React.MouseEvent<any>) {
            if (typeof backToCart.onClick === "function") {
                e.preventDefault();

                backToCart.onClick();
            }
        }

        return (
            <Container>
                <h1 className="page-title">{this.props.siteName}</h1>
                <ul id="nav">
                    <li>
                        <a href={backToCart.url} onClick={e => handleBackToCart(e)}>
                            {"Cart"}
                        </a>
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
            loading,
            error,
            coupons,
            discountCode,
            shippingAddress: { countryCode }
        } = this.state;

        const setSummaryCode = (event: React.FormEvent<any>) => {
            const value = event.currentTarget.value;

            this.setState({ discountCode: value });
        };

        const controls =
            this.props.allowCoupons === true
                ? Option.ofSome(
                      <div>
                          <div className="ms-row vc zero-margin discount-form">
                              <div className="xs-col-18-24 form-group" style={{ marginBottom: "0px" }}>
                                  <input
                                      className="win-textbox"
                                      placeholder="Discount Code"
                                      value={discountCode.defaultValue("")}
                                      onChange={e => setSummaryCode(e)}
                                  />
                              </div>
                              <div className="xs-col-6-24 text-center">
                                  <button className="win-button" onClick={e => this.applyDiscount(e)}>
                                      {loading ? (
                                          <FontAwesome key={"apply-discount-spinner"} name="spinner" spin />
                                      ) : (
                                          "Apply"
                                      )}
                                  </button>
                              </div>
                          </div>
                          {error ? <p className="error red">{error}</p> : null}
                          <hr />
                      </div>
                  )
                : Option.ofNone();

        return (
            <CartSummary
                totals={this.props.totals}
                shippingTotal={this.state.selectedRate.bind(r => Option.ofSome(r.value))}
                coupons={coupons}
                lineItems={this.props.items}
                controls={controls}
                onRemoveDiscount={(e, c) => this.removeDiscount(e, c)}
            />
        );
    }

    private generateCustomerInformation() {
        const { email, error, shippingAddress } = this.state;

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
                                    onChange={this.updateStateFromEvent((s, v) => (s.email = v))}
                                />
                            </div>
                        </div>
                    </div>
                    <div className="form-group">
                        <label className="control-label">{"Shipping address"}</label>
                        <AddressForm
                            type="shipping"
                            address={shippingAddress}
                            onChange={a => this.setState({ shippingAddress: a })}
                        />
                    </div>
                </form>
                {error.map(e => <p className="error red">{e}</p>).defaultValue(<span />)}
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

        const address = this.state.shippingAddress;
        const country = Countries.filter(c => c.iso === address.countryCode)[0];

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
                                {address.countryCode === "US" ? "Standard Shipping" : "International Shipping"}
                            </div>
                            <div className="xs-col-9-24 text-right">
                                {this.state.selectedRate.map(
                                    rate => `$${this.props.totals.currency.toUpperCase()} ${rate.value.toFixed(2)}`
                                )}
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
            card: { number, cvv, expiry, name },
            error,
            sameBillingAddress,
            loading,
            billingAddress
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
                                        (s, v) => (s.card.number = creditcard.formatCardNumber(v))
                                    )}
                                />
                                <div className="ms-row vc">
                                    <div className="m-col-12-24">
                                        <input
                                            type="text"
                                            className="win-textbox"
                                            placeholder="Name on card"
                                            value={name}
                                            onChange={this.updateStateFromEvent((s, v) => (s.card.name = v))}
                                        />
                                    </div>
                                    <div className="m-col-6-24">
                                        <input
                                            type="text"
                                            className="win-textbox"
                                            placeholder="MM / YY"
                                            value={expiry}
                                            onChange={this.updateStateFromEvent(
                                                (s, v) => (s.card.expiry = formatExpiry(v))
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
                                            onChange={this.updateStateFromEvent((s, v) => (s.card.cvv = v))}
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
                            onClick={this.updateStateFromEvent(s => (s.sameBillingAddress = true))}>
                            <div className="xs-col-2-24">
                                <input
                                    type="radio"
                                    name="sameBillingAddress"
                                    className="win-radio"
                                    checked={sameBillingAddress}
                                    onChange={this.updateStateFromEvent(s => (s.sameBillingAddress = true))}
                                />
                            </div>
                            <div className="xs-col-20-24">{"Same as shipping address"}</div>
                        </div>
                        <div
                            className="ms-row vc cursor-pointer"
                            onClick={this.updateStateFromEvent(s => (s.sameBillingAddress = false))}>
                            <div className="xs-col-2-24">
                                <input
                                    type="radio"
                                    name="sameBillingAddress"
                                    className="win-radio"
                                    checked={!sameBillingAddress}
                                    onChange={this.updateStateFromEvent(s => (s.sameBillingAddress = false))}
                                />
                            </div>
                            <div className="xs-col-20-24">{"Use a different billing address"}</div>
                        </div>
                        {!sameBillingAddress ? null : (
                            <AddressForm
                                type="billing"
                                address={billingAddress}
                                onChange={a => this.setState({ billingAddress: a })}
                            />
                        )}
                    </div>
                </form>
                {error.map(error => <p className="error red">{error}</p>).defaultValue(<span />)}
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
                                      <FontAwesome
                                          key={"placing-order-spinner"}
                                          name="spinner"
                                          className="marRight5"
                                          spin
                                      />,
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

    private async continueToShipping(event: React.MouseEvent) {
        event.preventDefault();

        const { email, shippingAddress, loading } = this.state;

        if (loading) {
            return;
        }

        if (!email || email.indexOf("@") === -1 || email.indexOf(".") === -1) {
            this.setState({ error: Option.ofSome("You must enter a valid email address.") });
            return;
        }

        const addressValidation = this.validateAddress(shippingAddress);

        if (addressValidation.isSome()) {
            this.setState({ error: addressValidation });
            return;
        }

        this.setState({ error: Option.ofNone(), loading: true });

        await this.props
            .onCalculateShipping(shippingAddress)
            .iter(rates => {
                this.setState({
                    rates,
                    selectedRate: rates.length > 0 ? Option.ofSome(rates[0]) : Option.ofNone(),
                    page: page.shippingMethod
                });
            })
            .iterError(error => {
                const message = error instanceof Error ? error.message : `Encountered unknown error: ${error}`;

                console.error("onCalculateShipping promise threw an error.", { message, error: error });
                this.setState({ error: Option.ofSome(message), loading: false });
            })
            .get();
    }

    private continueToPayment(event: React.MouseEvent) {
        event.preventDefault();

        this.setState({ page: page.paymentMethod });
    }

    private async completeOrder(event: React.MouseEvent) {
        event.preventDefault();

        const { card, loading, sameBillingAddress, billingAddress, shippingAddress, selectedRate, rates } = this.state;

        if (loading) {
            return;
        }

        if (rates.length > 0 && selectedRate.isNone()) {
            this.setState({ error: Option.ofSome("You must select a shipping rate.") });
            return;
        }

        if (!sameBillingAddress) {
            const validation = this.validateAddress(billingAddress);

            if (validation.isSome()) {
                this.setState({ error: validation });
                return;
            }
        }

        const expiry = compute<{ month: number; year: number }>(() => {
            const parsed = creditcard.parseCardExpiry(card.expiry || "");

            return {
                month: parsed && typeof parsed.month === "number" ? parsed.month : 0,
                year: parsed && typeof parsed.year === "number" ? parsed.year : 0
            };
        });

        this.setState({
            error: Option.ofNone(),
            loading: true
        });

        await this.props
            .onConfirmPayment(
                card,
                selectedRate,
                this.state.coupons,
                sameBillingAddress ? Option.ofSome(billingAddress) : Option.ofNone()
            )
            .iter(result => window.location.assign(result.url))
            .iterError(error => {
                const message = error instanceof Error ? error.message : `Encountered unknown error: ${error}`;

                console.error("onCofirmPayment promise threw an error.", { message, error: error });
                this.setState({ error: Option.ofSome(message), loading: false });
            })
            .get();
    }

    //#endregion

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

interface AddressFormProps extends React.Props<any> {
    type: "billing" | "shipping";
    address: Address;
    onChange: (address: Address) => void;
}

function AddressForm(this: void, { type, address, onChange }: AddressFormProps): JSX.Element {
    /**
     * A function for selecting a new country and performing maintenance on its Zip and StateCode props.
     */
    function updateCountry(iso: string) {
        const countryData = Countries.filter(c => c.iso === iso)[0];
        const a = { ...address };
        a.countryCode = iso;

        //If the country has states, select the first one. If not, delete the state
        if (countryData.states.length > 0) {
            a.stateCode = Option.ofSome(countryData.states[0].iso);
        } else {
            a.stateCode = Option.ofNone();
        }

        //If the country doesn't have postal codes, delete it.
        if (countryData.hasPostalCodes) {
            a.zip = a.zip.isSome() ? a.zip : Option.ofSome("");
        } else {
            a.zip = Option.ofNone();
        }

        onChange(a);
    }

    const countryData = Countries.filter(c => c.iso === address.countryCode)[0];
    const countries = Countries.map(c => (
        <option key={c.iso} value={c.iso}>
            {c.name}
        </option>
    ));
    const states = countryData.states.map(s => (
        <option key={s.iso} value={s.iso}>
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
                    value={address.name}
                    onChange={e => onChange({ ...address, name: e.currentTarget.value })}
                />
                <div className="ms-row vc">
                    <div className="m-col-16-24">
                        <input
                            className="win-textbox"
                            type="text"
                            placeholder="Address"
                            value={address.line1}
                            onChange={e => onChange({ ...address, line1: e.currentTarget.value })}
                        />
                    </div>
                    <div className="m-col-8-24">
                        <input
                            className="win-textbox"
                            type="text"
                            placeholder="Apt, suite, etc. (optional)"
                            value={address.line2}
                            onChange={e => onChange({ ...address, line2: e.currentTarget.value })}
                        />
                    </div>
                </div>
                <div className="ms-row vc">
                    <div className="col-1-1">
                        <input
                            className="win-textbox"
                            type="text"
                            placeholder="City"
                            value={address.city}
                            onChange={e => onChange({ ...address, city: e.currentTarget.value })}
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
                            value={address.countryCode}
                            onChange={e => updateCountry(e.currentTarget.value)}>
                            {countries}
                        </select>
                    </div>
                    {!states || states.length === 0 ? null : (
                        <div className="m-col-8-24">
                            <select
                                className="win-select"
                                value={address.stateCode.defaultValue(countryData.states[0].iso)}
                                onChange={e =>
                                    onChange({ ...address, stateCode: Option.ofSome(e.currentTarget.value) })
                                }>
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
                                value={address.zip.defaultValue("")}
                                onChange={e => onChange({ ...address, zip: Option.ofSome(e.currentTarget.value) })}
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
