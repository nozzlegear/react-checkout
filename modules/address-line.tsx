/// <reference path="./../typings/index.d.ts" />

import * as React from 'react';
import {clone} from 'lodash';
import {Address} from "../index";

export interface IProps extends React.Props<any>
{
    address: Address;
}

export interface IState
{
    
}

export class AddressLine extends React.Component<IProps, IState>
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