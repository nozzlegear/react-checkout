/// <reference path="./../typings/index.d.ts" />
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var React = require('react');
var lodash_1 = require('lodash');
var TrackingPage = (function (_super) {
    __extends(TrackingPage, _super);
    function TrackingPage(props) {
        _super.call(this, props);
        this.state = {};
        this.configureState(props, false);
    }
    //#region Utility functions
    TrackingPage.prototype.configureState = function (props, useSetState) {
        var state = lodash_1.clone(this.state);
        if (!useSetState) {
            this.state = state;
            return;
        }
        this.setState(state);
    };
    //#endregion
    TrackingPage.prototype.componentDidMount = function () {
    };
    TrackingPage.prototype.componentDidUpdate = function () {
    };
    TrackingPage.prototype.componentWillReceiveProps = function (props) {
        this.configureState(props, true);
    };
    TrackingPage.prototype.render = function () {
        return (React.createElement("div", null));
    };
    return TrackingPage;
}(React.Component));
exports.TrackingPage = TrackingPage;
