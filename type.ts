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
    ServicePromises as BaseServicePromises
} from 'web-node/type'
// endregion
// region exports
export type Configuration<PluginConfigurationType = {}> =
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
export type Services<PluginServiceType = {}> =
    BaseServices<{
        applicationServer:{
            instance:HTTPServer
            streams:Array<HTTPStream>
            sockets:Array<Socket>
        }
    }> &
    PluginServiceType
export type ServicePromises<PluginServicePromiseType = {}> =
    BaseServicePromises<{applicationServer:Promise<HTTPServer>}> &
    PluginServicePromiseType

export interface PluginHandler extends BasePluginHandler {
    /**
     * Hook to run on each request. After running this hook returned request
     * will be finished.
     * @param _request - Request which comes from client.
     * @param _response - Response object to use to perform a response to
     * client.
     * @param _configuration - Configuration object extended by each plugin
     * specific configuration.
     * @param _plugins - Topological sorted list of plugins.
     * @param _pluginAPI - Plugin api reference.
     *
     * @returns Request object to finish.
     */
    applicationServerRequest?(
        _request:HTTPServerRequest,
        _response:HTTPServerResponse,
        _configuration:Configuration,
        _plugins:Array<Plugin>,
        _pluginAPI:typeof PluginAPI
    ):Promise<HTTPServerRequest>
    /**
     * Hook to run on stream.
     * @param _stream - Current stream object.
     * @param _headers - Current headers.
     * @param _configuration - Configuration object extended by each plugin
     * specific configuration.
     * @param _plugins - Topological sorted list of plugins.
     * @param _pluginAPI - Plugin api reference.
     *
     * @returns Current Stream.
     */
    applicationServerStream?(
        _stream:HTTPStream,
        _headers:OutgoingHTTPHeaders,
        _configuration:Configuration,
        _plugins:Array<Plugin>,
        _pluginAPI:typeof PluginAPI
    ):Promise<HTTPStream>
}
// endregion
// region vim modline
// vim: set tabstop=4 shiftwidth=4 expandtab:
// vim: foldmethod=marker foldmarker=region,endregion:
// endregion
