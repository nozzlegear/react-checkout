/// <reference path="./../typings/index.d.ts" />

import * as React from 'react';
import {clone} from 'lodash';
import {Totals, LineItem, Coupon} from "../index";

export interface IProps extends React.Props<any>
{
    totals: Totals;
    lineItems: LineItem[];
    coupons: Coupon[];
    controls: JSX.Element;
    onRemoveDiscount: (event: React.MouseEvent, coupon: Coupon) => void
}

export interface IState
{
    
}

export class CartSummary extends React.Component<IProps, IState>
{
    constructor(props: IProps)
    {
        super(props);
        
        this.configureState(props, false);
    }
    
    public state: IState = {};
    
    //#region Utility functions
    
    private configureState(props: IProps, useSetState: boolean)
    {
        let state: IState = clone(this.state);
        
        if (!useSetState)
        {
            this.state = state;
            
            return;
        }
        
        this.setState(state);
    }
    
    //#endregion
    
    public componentDidMount()
    {
        
    }
    
    public componentDidUpdate()
    {
        
    }
    
    public componentWillReceiveProps(props: IProps)
    {
        this.configureState(props, true);
    }
    
    public render()
    {
        return (
            <div>
                
            </div>
        );
    }
}