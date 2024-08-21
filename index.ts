// #!/usr/bin/env babel-node
// -*- coding: utf-8 -*-
/** @module application-server-web-node-plugin */
'use strict'
/* !
    region header
    [Project page](https://torben.website/application-server-web-node-plugin)

    Copyright Torben Sickert (info["~at~"]torben.website) 16.12.2012

    License
    -------

    This library written by Torben Sickert stand under a creative commons
    naming 3.0 unported license.
    See https://creativecommons.org/licenses/by/3.0/deed.de
    endregion
*/
// region imports
import {NOOP} from 'clientnode'
// NOTE: http2 compatibility mode does work for unencrypted connections yet.
import {createServer as createHTTP1Server} from 'http'
import {
    createServer,
    createSecureServer,
    Http2ServerResponse as HTTPServerResponse,
    Http2ServerRequest as HTTPServerRequest,
    Http2Stream as HTTPStream,
    OutgoingHttpHeaders as OutgoingHTTPHeaders
} from 'http2'
import {Socket} from 'net'
import {PluginHandler, PluginPromises} from 'web-node/type'

import {Server, ServicePromisesState, Services, ServicesState} from './type'
// endregion
// region plugins/classes
/**
 * Launches an application server und triggers all some pluginable hooks on an
 * event.
 */
/**
 * Appends an application server to the web node services.
 * @param state - Application state.
 * @returns Promise resolving to nothing.
 */
export const preLoadService = (state:ServicesState):Promise<void> => {
    const {
        configuration: {applicationServer: configuration},
        pluginAPI,
        services
    } = state

    const onIncomingMessage = (
        request:HTTPServerRequest, response:HTTPServerResponse
    ) => {
        void pluginAPI.callStack<ServicesState<{
            request:HTTPServerRequest
            response:HTTPServerResponse
        }>>({
            ...state,
            data: {response, request},
            hook: 'applicationServerRequest'
        })
            .then(() => response.end())
    }

    const server:Server = {
        instance: (
            configuration.nodeServerOptions.cert &&
            configuration.nodeServerOptions.key
        ) ?
            createSecureServer(
                configuration.nodeServerOptions, onIncomingMessage
            ) :
            // NOTE: See import notice.
            (createHTTP1Server as unknown as typeof createServer)(
                onIncomingMessage
            ),
        streams: [],
        sockets: []
    }
    services.applicationServer = server

    server.instance.on(
        'connection',
        (socket:Socket):void => {
            server.sockets.push(socket)

            socket.on('close', ():Array<Socket> =>
                server.sockets.splice(server.sockets.indexOf(socket), 1)
            )
        }
    )

    server.instance.on(
        'stream',
        (stream:HTTPStream, headers:OutgoingHTTPHeaders):void => {
            server.streams.push(stream)

            void pluginAPI.callStack<ServicesState<{
                stream:HTTPStream,
                headers:OutgoingHTTPHeaders
            }>>({
                ...state,
                data: {headers, stream},
                hook: 'applicationServerStream'
            })

            stream.on('close', ():Array<HTTPStream> =>
                server.streams.splice(server.streams.indexOf(stream), 1)
            )
        }
    )

    return Promise.resolve()
}
/**
 * Start database's child process and return a Promise which observes this
 * service.
 * @param state - Application state.
 * @param state.configuration - Applications configuration.
 * @param state.configuration.applicationServer - Server configuration.
 * @param state.services - Application services.
 * @returns A mapping to promises which correspond to the plugin specific
 * continues services.
 */
export const loadService = ({
    configuration: {applicationServer: configuration}, services
}:ServicePromisesState):Promise<null|PluginPromises> => {
    if (Object.prototype.hasOwnProperty.call(
        services, 'applicationServer'
    ))
        return new Promise<PluginPromises>((
            resolve:(value:PluginPromises) => void,
            reject:(reason:Error) => void
        ):void => {
            const parameters:Array<unknown> = []

            if (configuration.hostName)
                parameters.push(configuration.hostName)

            parameters.push(():void => {
                console.info(
                    'Starting application server to listen on port "' +
                    `${String(configuration.port)}".`
                )

                resolve({applicationServer: new Promise<void>(NOOP)})
            })

            try {
                services.applicationServer.instance.listen(
                    configuration.port, ...parameters as [() => void]
                )
            } catch (error) {
                // eslint-disable-next-line prefer-promise-reject-errors
                reject(error as Error)
            }
        })

    return Promise.resolve(null)
}
/**
 * Application will be closed soon.
 * @param state - Application state.
 * @param state.services - Application services.
 * @returns Promise resolving to nothing.
 */
export const shouldExit = ({services}:ServicePromisesState):Promise<void> => {
    const {applicationServer: server} = services

    return new Promise<void>((resolve:() => void) => {
        server.instance.close(() => {
            delete (services as {
                applicationServer?:Services['applicationServer']
            }).applicationServer

            resolve()
        })

        for (const connections of [server.sockets, server.streams])
            if (Array.isArray(connections))
                for (const connection of connections)
                    connection.destroy()
    })
}

export const applicationServer:PluginHandler = module.exports
export default applicationServer
// endregion
