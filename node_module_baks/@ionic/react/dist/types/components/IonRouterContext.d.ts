import { AnimationBuilder } from '@ionic/core';
import React from 'react';
import { RouteAction, RouterDirection, RouterOptions } from '../models';
import { RouteInfo } from '../models/RouteInfo';
export interface IonRouterContextState {
    routeInfo: RouteInfo;
    push: (pathname: string, routerDirection?: RouterDirection, routeAction?: RouteAction, routerOptions?: RouterOptions, animationBuilder?: AnimationBuilder) => void;
    back: (animationBuilder?: AnimationBuilder) => void;
    canGoBack: () => boolean;
    nativeBack: () => void;
}
export declare const IonRouterContext: React.Context<IonRouterContextState>;
/**
 * A hook for more direct control over routing in an Ionic React applicaiton. Allows you to pass additional meta-data to the router before the call to the native router.
 */
export declare function useIonRouter(): UseIonRouterResult;
declare type UseIonRouterResult = {
    /**
     * @deprecated - Use goBack instead
     * @param animationBuilder - Optional - A custom transition animation to use
     */
    back(animationBuilder?: AnimationBuilder): void;
    /**
     * Navigates to a new pathname
     * @param pathname - The path to navigate to
     * @param routerDirection - Optional - The RouterDirection to use for transition purposes, defaults to 'forward'
     * @param routeAction - Optional - The RouteAction to use for history purposes, defaults to 'push'
     * @param routerOptions - Optional - Any additional parameters to pass to the router
     * @param animationBuilder - Optional - A custom transition animation to use
     */
    push(pathname: string, routerDirection?: RouterDirection, routeAction?: RouteAction, routerOptions?: RouterOptions, animationBuilder?: AnimationBuilder): void;
    /**
     * Navigates backwards in history, using the IonRouter to determine history
     * @param animationBuilder - Optional - A custom transition animation to use
     */
    goBack(animationBuilder?: AnimationBuilder): void;
    /**
     * Determines if there are any additional routes in the the Router's history. However, routing is not prevented if the browser's history has more entries. Returns true if more entries exist, false if not.
     */
    canGoBack(): boolean;
};
export {};
