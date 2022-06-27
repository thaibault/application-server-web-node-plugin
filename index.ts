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
import {PluginAPI} from 'web-node'
import {Plugin, PluginHandler} from 'web-node/type'

import {Configuration, Service, ServicePromises, Services} from './type'
// endregion
// region plugins/classes
/**
 * Launches an application server und triggers all some pluginable hooks on an
 * event.
 */
export class ApplicationServer implements PluginHandler {
    /**
     * Start database's child process and return a Promise which observes this
     * service.
     *
     * @returns A promise which correspond to the plugin specific continues
     * service.
     */
    static async loadService({configuration, services}):Promise<null|Service> {
        if (Object.prototype.hasOwnProperty.call(
            services, 'applicationServer'
        ))
            return await new Promise<Service>((
                resolve:(value:Service) => void, reject:(_reason:Error) => void
            ):void => {
                const parameters:Array<unknown> = []
                if (configuration.applicationServer.hostName)
                    parameters.push(configuration.applicationServer.hostName)
                parameters.push(():void => {
                    console.info(
                        'Starting application server to listen on port "' +
                        `${configuration.applicationServer.port}".`
                    )
                    resolve({
                        name: 'applicationServer',
                        promise: new Promise(():Services['server'] =>
                            services.applicationServer
                        )
                    })
                })

                try {
                    services.applicationServer.instance.listen(
                        configuration.applicationServer.port,
                        ...parameters as [() => void]
                    )
                } catch (error) {
                    // eslint-disable-next-line prefer-promise-reject-errors
                    reject(error as Error)
                }
            })

        return null
    }
    /**
     * Appends an application server to the web node services.
     * @param services - An object with stored service instances.
     * @param configuration - Mutable by plugins extended configuration object.
     * @param plugins - Topological sorted list of plugins.
     * @param pluginAPI - Plugin api reference.
     *
     * @returns Given and extended object of services.
     */
    static preLoadService(state:ServicesState):Promise<void> {
        const {
            configuration: {applicationServer: configuration},
            services: {applicationServer}
        } = state

        const onIncomingMessage = (
            request:HTTPServerRequest, response:HTTPServerResponse
        ):void => {
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

        applicationServer = {
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

        applicationServer.instance.on(
            'connection',
            (socket:Socket):void => {
                applicationServer.sockets.push(socket)

                socket.on('close', ():Array<Socket> =>
                    applicationServer.sockets.splice(
                        applicationServer.sockets.indexOf(socket), 1
                    )
                )
            }
        )

        applicationServer.instance.on(
            'stream',
            (stream:HTTPStream, headers:OutgoingHTTPHeaders):void => {
                applicationServer.streams.push(stream)

                void pluginAPI.callStack<ServicesState<{
                    headers:OutgoingHTTPHeaders
                    stream:HTTPStream
                }>>({
                    ...state,
                    data: {headers, stream},
                    hook: 'applicationServerStream'
                })

                stream.on('close', ():Array<HTTPStream> =>
                    applicationServer.streams.splice(
                        applicationServer.streams.indexOf(stream), 1
                    )
                )
            }
        )
    }
    /**
     * Application will be closed soon.
     * @param services - An object with stored service instances.
     *
     * @returns Given object of services.
     */
    static async shouldExit(services:Services):Promise<Services> {
        return new Promise<Services>((
            resolve:(services:Services) => void
        ):void => {
            services.applicationServer.instance.close(():void => {
                delete (services as {
                    applicationServer?:Services['applicationServer']
                }).applicationServer
                resolve(services)
            })

            for (const connections of [
                services.applicationServer.sockets,
                services.applicationServer.streams
            ])
                if (Array.isArray(connections))
                    for (const connection of connections)
                        connection.destroy()
        })
    }
}
export default ApplicationServer
// endregion
// region vim modline
// vim: set tabstop=4 shiftwidth=4 expandtab:
// vim: foldmethod=marker foldmarker=region,endregion:
// endregion
