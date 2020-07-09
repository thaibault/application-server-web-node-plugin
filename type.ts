// #!/usr/bin/env node
// -*- coding: utf-8 -*-
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
import {
    Configuration as BaseConfiguration,
    PluginHandler as BasePluginHandler,
    Service as BaseService,
    Services as BaseServices,
    ServicePromises as BaseServicePromises
} from 'web-node/type'
// endregion
// region exports
export type Configuration = BaseConfiguration & {
    applicationServer:{
        authentication:{
            login:string;
            password:string;
            salt:string;
            staticAssets:boolean;
        };
        dynamicPathPrefix:string;
        hostName:string;
        hostNamePrefix:string;
        hostNamePattern:string;
        httpBasicAuthenticationCancelRedirectHTMLContent:string;
        nodeServerOptions:SecureServerOptions;
        port:number;
        rootPath:string;
    }
}
export type HTTPServer = HttpServer|HTTPSecureServer
export type Service = BaseService & {
    name:'application-server';
    promise:Promise<HTTPServer>;
}
export type Services = BaseServices & {applicationServer:{
    instance:HTTPServer;
    streams:Array<HTTPStream>;
    sockets:Array<Socket>;
}}
export type ServicePromises = BaseServicePromises & {
    applicationServer:Promise<HTTPServer>;
}
export interface PluginHandler extends BasePluginHandler {
    /**
     * Hook to run on each request. After running this hook returned request
     * will be finished.
     * @param request - Request which comes from client.
     * @param response - Response object to use to perform a response to
     * client.
     * @param configuration - Configuration object extended by each plugin
     * specific configuration.
     * @param plugins - Topological sorted list of plugins.
     * @returns Request object to finish.
     */
    applicationServerRequest?(
        request:HTTPServerRequest,
        response:HTTPServerResponse,
        configuration:Configuration,
        plugins:Array<Plugin>
    ):Promise<HTTPServerRequest>
    /**
     * Hook to run on stream.
     * @param stream - Current stream object.
     * @param headers - Current headers.
     * @param configuration - Configuration object extended by each plugin
     * specific configuration.
     * @param plugins - Topological sorted list of plugins.
     * @returns Current Stream.
     */
    applicationServerStream?(
        stream:HTTPStream,
        headers:OutgoingHTTPHeaders,
        configuration:Configuration,
        plugins:Array<Plugin>
    ):Promise<HTTPStream>
}
// endregion
// region vim modline
// vim: set tabstop=4 shiftwidth=4 expandtab:
// vim: foldmethod=marker foldmarker=region,endregion:
// endregion
