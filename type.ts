// -*- coding: utf-8 -*-
/** @module type */
'use strict'
/* !
    region header
    Copyright Torben Sickert (info["~at~"]torben.website) 16.12.2012

    License
    -------

    This library written by Torben Sickert stand under a creative commons
    naming 3.0 unported license.
    See https://creativecommons.org/licenses/by/3.0/deed.de
    endregion
*/
// region imports
import {Mapping} from 'clientnode/type'
import {
    Http2SecureServer as HTTPSecureServer,
    Http2Server as HttpServer,
    Http2ServerResponse as HTTPServerResponse,
    Http2ServerRequest as HTTPServerRequest,
    Http2Stream as HTTPStream,
    OutgoingHttpHeaders as OutgoingHTTPHeaders,
    SecureServerOptions
} from 'http2'
import {Socket} from 'net'
import {PluginAPI} from 'web-node'
import {
    Configuration as BaseConfiguration,
    PluginHandler as BasePluginHandler,
    Service as BaseService,
    Services as BaseServices,
    ServicePromises as BaseServicePromises,
    ServicePromisesState as BaseServicePromisesState,
    ServicesState as BaseServicesState
} from 'web-node/type'
// endregion
// region exports
export type Configuration<PluginConfigurationType = Mapping<unknown>> =
    BaseConfiguration<{
        applicationServer:{
            authentication:{
                login:string
                password:string
                salt:string
                staticAssets:boolean
            }
            dynamicPathPrefix:string
            hostName:string
            hostNamePrefix:string
            hostNamePattern:string
            httpBasicAuthenticationCancelRedirectHTMLContent:string
            nodeServerOptions:SecureServerOptions
            port:number
            rootPath:string
        }
    }> &
    PluginConfigurationType

export type HTTPServer = HttpServer|HTTPSecureServer

export interface Service extends BaseService {
    name:'applicationServer'
    promise:Promise<HTTPServer>
}
export interface ApplicationServerService {
    instance:HTTPServer
    streams:Array<HTTPStream>
    sockets:Array<Socket>
}
export type Services<PluginServiceType = Mapping<unknown>> =
    BaseServices<{applicationServer:ApplicationServerService}> &
    PluginServiceType
export type ServicePromises<PluginServicePromiseType = Mapping<unknown>> =
    BaseServicePromises<{applicationServer:Promise<HTTPServer>}> &
    PluginServicePromiseType

export type ServicesState = BaseServicesState<
    {
        request:HTTPServerRequest
        response:HTTPServerResponse
    },
    Configuration,
    Services
>
export type ServicePromisesState = BaseServicePromisesState<
    {
        request:HTTPServerRequest
        response:HTTPServerResponse
    },
    Configuration,
    Services,
    ServicePromises
>

// TODO make ServicePromises State generic to support both hooks!
_stream:HTTPStream,
        _headers:OutgoingHTTPHeaders,

export interface PluginHandler extends BasePluginHandler {
    /**
     * Hook to run on each request. After running this hook returned request
     * will be finished.
     * @param state - Application state.
     *
     * @returns Promise resolving to nothing.
     */
    applicationServerRequest?(state:ServicePromisesState):Promise<void>
    /**
     * Hook to run on stream.
     * @param state - Application state.
     *
     * @returns Promise resolving to nothing.
     */
    applicationServerStream?(state:ServicePromisesState):Promise<void>
}
// endregion
// region vim modline
// vim: set tabstop=4 shiftwidth=4 expandtab:
// vim: foldmethod=marker foldmarker=region,endregion:
// endregion
