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
import {Mapping} from 'clientnode'
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
import {
    Configuration as BaseConfiguration,
    PluginHandler as BasePluginHandler,
    Services as BaseServices,
    ServicePromises as BaseServicePromises,
    ServicePromisesState as BaseServicePromisesState,
    ServicesState as BaseServicesState
} from 'web-node/type'
// endregion
// region exports
export type Configuration<PluginConfigurationType = Mapping<unknown>> =
    BaseConfiguration<{
        applicationServer: {
            authentication: {
                login: string
                password: string
                salt: string
                staticAssets: boolean
            }
            dynamicPathPrefix: string
            hostName: string
            hostNamePrefix: string
            hostNamePattern: string
            httpBasicAuthenticationCancelRedirectHTMLContent: string
            nodeServerOptions: SecureServerOptions
            port: number
            rootPath: string
        }
    }> &
    PluginConfigurationType

export type HTTPServer = HttpServer|HTTPSecureServer

export interface Server {
    instance: HTTPServer
    streams: Array<HTTPStream>
    sockets: Array<Socket>
}

export type ServicePromises<Type = Mapping<unknown>> =
    BaseServicePromises<{applicationServer: Promise<void>}> & Type
export type Services<Type = Mapping<unknown>> =
    BaseServices<{applicationServer: Server}> & Type

export interface RequestData {
    request: HTTPServerRequest
    response: HTTPServerResponse
}
export interface StreamData {
    stream: HTTPStream,
    headers: OutgoingHTTPHeaders
}

export type ServicesState<Type = undefined> = BaseServicesState<
    Type,
    Configuration,
    Services
>
export type ServicePromisesState<Type = undefined> = BaseServicePromisesState<
    Type,
    Configuration,
    Services,
    ServicePromises
>

export interface PluginHandler extends BasePluginHandler {
    /**
     * Hook to run on each request. After running this hook returned request
     * will be finished.
     * @param state - Application state.
     * @returns Promise resolving to nothing.
     */
    applicationServerRequest?(
        state: ServicePromisesState<RequestData>
    ): Promise<void>
    /**
     * Hook to run on stream.
     * @param state - Application state.
     * @returns Promise resolving to nothing.
     */
    applicationServerStream?(
        state: ServicePromisesState<StreamData>
    ): Promise<void>
}
// endregion
