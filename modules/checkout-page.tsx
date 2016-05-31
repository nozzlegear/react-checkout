/// <reference path="./../typings/index.d.ts" />

import * as React from 'react';
import * as dom from "react-dom";
import * as classes from "classnames";
import * as creditcard from "creditcardutils";
import {format as formatExpiry} from "cc-expiry";
import {Address, Coupon, LineItem, Totals} from "../index"; 
import {defaults, find, some, filter, clone, map, uniqueId, merge} from 'lodash';
import {Countries} from "../data/countries";
import {CartSummary} from "./cart-summary";
import {AddressLine} from "./address-line";
import {AutoPropComponent} from "auto-prop-component";

declare var require: any;

require("node_modules/winjs-grid/dist/css/min/mscom-grid.min.css");
require("node_modules/winjs/css/ui-light.min.css");
require("wwwroot/css/overrides.scss");
require("wwwroot/css/winjs-overrides.scss");
require("wwwroot/css/theme.scss");
require("wwwroot/css/checkout-and-tracking.scss");

export enum page
{
    customerInformation = 0,
    shippingMethod = 1,
    paymentMethod = 2
}

export interface IProps extends React.Props<any>
{
    items: LineItem[];
    
    totals: Totals;
    
    allowCoupons?: boolean;
    
    siteName: string;
    
    supportEmail: string;
}

export interface IState
{
    page?: page
    
    customer?: {
        email?: string,
        shippingAddress?: Address,
        error?: string,
    }
    
    summary?: {
        loading?: boolean;
        error?: string;
        code?: string;
        coupons?: Coupon[];
    }
    
    payment?: {
        loading?: boolean,
        sameBillingAddress?: boolean,        
        error?: string,        
        card?: {
            number?: string;
            name?: string;
            expiry?: string;
            cvv?: string;
        },        
        billingAddress?: Address
    }
}

export class CheckoutPage extends AutoPropComponent<IProps, IState>
{
    constructor(props: IProps)
    {
        super(props);

        this.configureState(props, false);
    }
    
    public state: IState;
    
    // This is a static property to prevent items resizing on every re-render (selecting a form option, etc)
    private isMobile = window.innerWidth < 767;
    
    //#region Utility functions
    
    private configureState(props: IProps, useSetState: boolean)
    {   
        const usa = find(Countries, (c) => c.iso === "US");
        
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
                billingAddress: clone(defaultAddress)
            }
        };
        
        if (!useSetState)
        {
            this.state = state;
            
            return;
        }
        
        this.setState(state);
    }
    
    private validateAddress(address: Address)
    {
        let output = {
            success: false,
            message: undefined
        };
        
        const countryData = find (Countries, c => c.iso === address.CountryCode);
        
        // Ensure customer has selected a valid country
        if (! countryData)
        {
            output.message = "You must select a valid country.";
            
            return output;
        }
        
        if (countryData.states.length > 0)
        {
            // Ensure the selected state exists in the list of the country's states
            if (! some (countryData.states, s => s.iso === address.StateCode))
            {
                output.message = "You must select a valid state.";
                
                return output;
            }
        }
        
        if (!address.City)
        {
            output.message = "You must enter a city.";
            
            return output;
        }
        
        if (!address.Line1)
        {
            output.message = "You must enter a street address.";
            
            return output;
        }
        
        if (!address.Name)
        {
            output.message = "You must enter a name or company name for this address.";
            
            return output;
        }
        
        if (countryData.hasPostalCodes && countryData.zipRegex !== 0 && ! new RegExp(countryData.zipRegex as string).test(address.Zip) )
        {
            output.message = "You must enter a valid Zip or Postal code.";
            
            return output;
        }
        
        output.success = true;
        
        return output;
    }

    //#endregion
    
    //#region Component generators
    
    private generateHeader(forMobile: boolean = false)
    {
        const currentPage = this.state.page;
        
        const navigate = (to: "customer" | "shipping") => (event: React.MouseEvent) =>
        {
            event.preventDefault();
            
            this.mergeState({page: to === "customer" ? page.customerInformation : page.shippingMethod});
        }
        
        const Container = (props: React.Props<any>) =>
        {
            let output: JSX.Element;
            
            if (forMobile)
            {
                output = (
                    <section className="xs-col-24-24 show-xs hide-sm hide-m hide-l hide-xl" id="checkout-header">
                        {props.children}
                    </section>
                );
            }
            else
            {
                output = (
                    <div className="hide-xs show-sm show-m show-l show-xl">
                        <div className="ms-row">
                            <div className="col-1-1">
                                {props.children}
                            </div>
                        </div>
                    </div>
                );
            }
            
            return output;
        }
        
        return (
            <Container>
                <h1 className="page-title">{"Pet Eternal"}</h1>
                <ul id="nav">
                    <li>
                        <a href="/cart">{"Cart"}</a> 
                    </li>
                    <li className="chevron">
                        <i className="fa fa-one-rem fa-chevron-right" />
                    </li>
                    <li className={classes({"active" : currentPage === page.customerInformation})}>
                        {currentPage <= page.customerInformation ? "Customer Information" : <a href="#" onClick={navigate("customer")}>{"Customer Information"}</a>}
                    </li>
                    <li className="chevron">
                        <i className="fa fa-one-rem fa-chevron-right" />
                    </li>
                    <li className={classes({"active" : currentPage === page.shippingMethod})}>
                        {currentPage <= page.shippingMethod ? "Shipping Information" : <a href="#" onClick={navigate("shipping")}>{"Shipping Information"}</a>}
                    </li>
                    <li className="chevron">
                        <i className="fa fa-one-rem fa-chevron-right" />
                    </li>
                    <li className={classes({"active" : currentPage === page.paymentMethod})}>
                        {"Payment method"}
                    </li>
                </ul>
            </Container>
        );
    }
    
    private generateCartSummary()
    {
        const {summary: { loading, error, coupons, code }, customer: {shippingAddress: {CountryCode}}} = this.state;
        
        const controls = (
            <div>
                <div className="ms-row vc zero-margin discount-form">
                    <div className="xs-col-18-24 form-group" style={{"marginBottom" : "0"}}>
                        <input className="win-textbox" placeholder="Discount Code" value={code} onChange={this.updateState((s, v) => s.summary.code = v)} />
                    </div>
                    <div className="xs-col-6-24 text-center">
                        <button className="win-button" onClick={(e) => this.applyDiscount(e)}>
                            {loading ? <i key={uniqueId()} className="fa fa-spinner fa-spin" /> : "Apply"}
                        </button>
                    </div>
                </div>
                {error ? <p className="error red">{error}</p> : null}
                <hr />
            </div>
        );
        
        return (
            <CartSummary totals={this.props.totals} coupons={coupons} lineItems={this.props.items} controls={controls} onRemoveDiscount={(e, c) => this.removeDiscount(e, c)} />
        )
    }
    
    private generateAddressForm(type: "billing" | "shipping")
    {
        /**
         * A function accessor that returns the correct prop depending on the address type.
         */
        const accessor = (s: IState) => 
        {
            //Ensure the given state has both payment.billingAddress and customer.shippingAddress props
            s = defaults(s, {payment: {billingAddress: { } as any}, customer: {shippingAddress: { } as any }} as IState);
            
            return type === "billing" ? s.payment.billingAddress : s.customer.shippingAddress;
        };
        
        /**
         * A function for selecting a new country and performing maintenance on its Zip and StateCode props.
         */
        const updateCountry = (s: IState, iso: string) =>
        {
            const countryData = find (Countries, c => c.iso === iso);
            let address = accessor(s);
            
            address.CountryCode = iso;
            
            //If the country has states, select the first one. If not, delete the state
            if (countryData.states.length > 0)
            {
                address.StateCode = countryData.states[0].iso;
            }
            else
            {
                address.StateCode = undefined;
            }
            
            //If the country doesn't have postal codes, delete it.
            if (countryData.hasPostalCodes === false)
            {
                address.Zip = undefined;
            }
        };
        
        const address = accessor(this.state);
        const {StateCode, CountryCode} = address;
        const countryData = find (Countries, c => c.iso === CountryCode);
        const countries = map(Countries, c => <option key={c.iso} value={c.iso}>{c.name}</option>);
        const states = map(countryData.states, s => <option key={uniqueId()} value={s.iso}>{s.name}</option>);
        
        return (
            <div className="address-form form-container ms-row">
                <div className="xs-col-24-24">
                    <input className="win-textbox" type="text" placeholder="Name or company name" value={address.Name} onChange={this.updateState((s, v) => accessor(s).Name = v)} />
                    <div className="ms-row vc">
                        <div className="m-col-16-24">
                            <input className="win-textbox" type="text" placeholder="Address" value={address.Line1} onChange={this.updateState((s, v) => accessor(s).Line1 = v)} />
                        </div>
                        <div className="m-col-8-24">
                            <input className="win-textbox" type="text" placeholder="Apt, suite, etc. (optional)" value={address.Line2} onChange={this.updateState((s, v) => accessor(s).Line2 = v)} />
                        </div>
                    </div>
                    <div className="ms-row vc">
                        <div className="col-1-1">
                            <input className="win-textbox" type="text" placeholder="City" value={address.City} onChange={this.updateState((s, v) => accessor(s).City = v)} />
                        </div>
                    </div>
                    <div className="ms-row vc">
                        <div className={`m-col-${states && states.length > 0 ? "8" : countryData.hasPostalCodes ? "12" : "24"}-24`}>
                            <select className="win-select" value={CountryCode} onChange={this.updateState(updateCountry)}>
                                {countries}
                            </select>
                        </div>
                        { 
                            !states || states.length === 0 ? null :
                            
                            <div className="m-col-8-24">
                                <select className="win-select" value={StateCode} onChange={this.updateState((s, v) => accessor(s).StateCode = v)}>
                                    {states}
                                </select>
                            </div>
                        }
                        {
                            !countryData.hasPostalCodes ? null :
                            
                            <div className={`m-col-${states && states.length > 0 ? "8" : "12"}-24`}>
                                <input className="win-textbox" type="text" placeholder="Postal code" value={address.Zip} onChange={this.updateState((s, v) => accessor(s).Zip = v)} />
                            </div>
                        }
                    </div>
                </div>
            </div>
        );
    }
    
    private generateCustomerInformation()
    {
        const {customer: {email, error}} = this.state;
        
        return (
            <section id="customer-information">
                {this.generateHeader()}
                <form>
                    <div className="form-group">
                        <label className="control-label">{"Customer information"}</label>
                        <div className="form-container ms-row">
                            <div className="xs-col-24-24">
                                <input className="win-textbox" type="text" placeholder="Email address" value={email} onChange={this.updateState((s, v) => s.customer.email = v)} />
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
                            <i className="fa fa-one-rem fa-chevron-left marRight5" />
                            Return to cart
                        </a>
                    </div>
                    <div className="xs-col-16-24 text-right">
                        <button className="win-button win-button-primary" onClick={(e) => this.continueToShipping(e)}>
                            Continue to shipping method
                        </button>
                    </div>
                </div>
            </section>
        )
    }   
    
    private generateShippingInformation()
    {
        const back = (event: React.MouseEvent) =>
        {
            event.preventDefault();
            
            this.mergeState({page: page.customerInformation});
        }
        
        const address = this.state.customer.shippingAddress;
        const country = find(Countries, c => c.iso === address.CountryCode);
        
        return (
            <section id="shipping-information">
                {this.generateHeader()}
                <form>
                    <div id="shipping-address" className="form-group">
                        <label className="control-label">{"Shipping address"}</label>
                        <AddressLine address={address} >
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
                                { address.CountryCode === "US" ? "Standard Shipping" : "International Shipping"}
                            </div>
                            <div className="xs-col-9-24 text-right">
                                { address.CountryCode === "US" ? "Free" : "USD $35.00"}
                            </div>
                        </div>
                    </div>
                </form>
                <div className="ms-row vc zero-margin">
                    <div className="xs-col-12-24">
                        <a href="#" onClick={back}>
                            <i className="fa fa-one-rem fa-chevron-left marRight5" />
                            Return to customer information
                        </a>
                    </div>
                    <div className="xs-col-12-24 text-right">
                        <button className="win-button win-button-primary" onClick={(e) => this.continueToPayment(e)}>
                            Continue to payment method
                        </button>
                    </div>
                </div>
            </section>
        )
    }
    
    private generatePaymentPage()
    {
        const {payment: {card: {number, cvv, expiry, name}, error, sameBillingAddress, loading}} = this.state;
        
        const back = (event: React.MouseEvent) =>
        {
            event.preventDefault();
            
            this.setState({page: page.shippingMethod});
        }
        
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
                                <input type="text" className="win-textbox" placeholder="Card number" value={number} onChange={this.updateState((s, v) => s.payment.card.number = creditcard.formatCardNumber(v))} />
                                <div className="ms-row vc">
                                    <div className="m-col-12-24">
                                        <input type="text" className="win-textbox" placeholder="Name on card" value={name} onChange={this.updateState((s, v) => s.payment.card.name = v)} />
                                    </div>
                                    <div className="m-col-6-24">
                                        <input type="text" className="win-textbox" placeholder="MM / YY" value={expiry} onChange={this.updateState((s, v) => s.payment.card.expiry = formatExpiry(v))} />
                                    </div>
                                    <div className="m-col-6-24">
                                        <input type="text" className="win-textbox" placeholder="CVV" maxLength={4} value={cvv} onChange={this.updateState((s, v) => s.payment.card.cvv = v)} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="form-group" id="billing-address">
                        <label className="control-label">{"Billing address"}</label>
                        <div className="ms-row vc cursor-pointer" onClick={this.updateState(s => s.payment.sameBillingAddress = true)}>
                            <div className="xs-col-2-24">
                                <input type="radio" name="sameBillingAddress" className="win-radio" checked={sameBillingAddress} onChange={this.updateState(s => s.payment.sameBillingAddress = true)} />
                            </div>
                            <div className="xs-col-20-24">
                                {"Same as shipping address"}
                            </div>
                        </div>
                        <div className="ms-row vc cursor-pointer" onClick={this.updateState(s => s.payment.sameBillingAddress = false)}>
                            <div className="xs-col-2-24">
                                <input type="radio" name="sameBillingAddress" className="win-radio" checked={!sameBillingAddress} onChange={this.updateState(s => s.payment.sameBillingAddress = false)} />
                            </div>
                            <div className="xs-col-20-24">
                                {"Use a different billing address"}
                            </div>
                        </div>
                        { !sameBillingAddress && this.generateAddressForm("billing") }
                    </div>
                </form>
                { error ? <p className="error red">{error}</p> : null }
                <div className="ms-row vc zero-margin">
                    <div className="xs-col-12-24">
                        <a href="#" onClick={back}>
                            <i className="fa fa-one-rem fa-chevron-left marRight5" onClick={back} />
                            Return to shipping method
                        </a>
                    </div>
                    <div className="xs-col-12-24 text-right">
                        <button className="win-button win-button-primary" onClick={(e) => this.completeOrder(e)}>
                            { loading ? [<i key={uniqueId()} className="fa fa-spinner fa-spin marRight5" />, "Placing order"] : "Complete order" }
                        </button>
                    </div>
                </div>
            </section>
        )
    }
    
    //#endregion
    
    //#region Event handlers
    
    private applyDiscount(event: React.MouseEvent)
    {
        event.preventDefault();
        
        // TODO: Call props.applyDiscount.then((coupon))
    }
    
    private removeDiscount(event: React.MouseEvent, coupon: Coupon)
    {
        event.preventDefault();
        
        // TODO: Call props.removeDiscount.then((shouldRemove))
    }
    
    private continueToShipping(event: React.MouseEvent)
    {
        event.preventDefault();
        
        let state: IState = clone(this.state);
        const {email, shippingAddress} = this.state.customer;
        const addressValidation = this.validateAddress(shippingAddress);
        
        if (!email || email.indexOf("@") === -1 || email.indexOf(".") === -1)
        {
            state.customer.error = "You must enter a valid email address.";
        }
        else if (!addressValidation.success)
        {
            state.customer.error = addressValidation.message;
        }
        else
        {
            state.customer.error = undefined;
            state.summary.error = undefined;
            state.page = page.shippingMethod;
        }
        
        this.mergeState(state);
    }
    
    private continueToPayment(event: React.MouseEvent)
    {
        event.preventDefault();
        
        this.mergeState({page: page.paymentMethod});
    }
    
    private completeOrder(event: React.MouseEvent)
    {
        event.preventDefault();
        
        const {payment, payment: {card}} = this.state;
        
        if (payment.loading)
        {
            return;
        }
        
        let expiry = defaults(creditcard.parseCardExpiry(card.expiry || ""), {month: 0, year: 0}) as {month: number, year: number};
        let error: string = undefined;
        
        if (! payment.sameBillingAddress)
        {
            let validation = this.validateAddress(payment.billingAddress);
            
            if (!validation.success)
            {
                error = validation.message;
            }
        }
        
        // TODO: call props.completeOrder(card).then((valid))
        
        payment.error = error;
        payment.loading = !error;
        
        this.mergeState({payment, summary: {error: undefined}});
        
        if (error)
        {
            return;
        }
    }

    //#endregion
    
    public componentDidMount()
    {
        
    }
    
    public componentDidUpdate()
    {
        
    }
    
    public componentWillUpdate(newProps: IProps, newState: IState)
    {
        if (newState.page != this.state.page)
        {
            //Page changed, remove the coupon error
            newState.summary.error = undefined;
        }
    }
    
    public componentWillReceiveProps(props: IProps)
    {
        this.configureState(props, true);
    }
    
    public render()
    {
        const currentPage = this.state.page;
        let renderedPage: JSX.Element;
        
        switch (currentPage)
        {
            default :
            case page.customerInformation :
                renderedPage = this.generateCustomerInformation();
                break;
                
            case page.shippingMethod : 
                renderedPage = this.generateShippingInformation();
                break;
                
            case page.paymentMethod :
                renderedPage = this.generatePaymentPage();
                break;
        }
        
        return (
            <main id="checkout-page" className="ms-grid">
                <div className="ms-row">
                    {this.generateHeader(true)}
                    {this.generateCartSummary()}
                    <section id="panels" className="m-col-14-24 m-col-24-pull-10">
                        <div className="ms-row">
                            <div className="m-col-22-24 m-col-24-offset-1">
                                {renderedPage}
                            </div>
                        </div>
                        <div className="ms-row" id="copyright">
                            <div className="m-col-23-24 m-col-24-offset-1">
                                <p>
                                    {`© ${this.props.siteName}, ${new Date().getUTCFullYear()}`}
                                    <a href={`mailto:${this.props.supportEmail}`} className="pull-right">
                                        {this.props.supportEmail}
                                    </a>
                                </p>
                            </div>
                        </div>
                    </section>
                </div>
            </main>
        );
    }
}