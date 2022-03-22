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
     * @param servicePromises - An object with stored service promise
     * instances.
     * @param services - An object with stored service instances.
     * @param configuration - Mutable by plugins extended configuration object.
     *
     * @returns A promise which correspond to the plugin specific continues
     * service.
     */
    static async loadService(
        servicePromises:ServicePromises,
        services:Services,
        configuration:Configuration
    ):Promise<null|Service> {
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
    static preLoadService(
        services:Services,
        configuration:Configuration,
        plugins:Array<Plugin>,
        pluginAPI:typeof PluginAPI
    ):Promise<Services> {
        const onIncomingMessage = (
            request:HTTPServerRequest, response:HTTPServerResponse
        ):void => {
            void pluginAPI.callStack(
                'applicationServerRequest',
                plugins,
                configuration,
                request,
                response,
                services
            )
                .then(() => response.end())
        }

        services.applicationServer = {
            instance: (
                configuration.applicationServer.nodeServerOptions.cert &&
                configuration.applicationServer.nodeServerOptions.key
            ) ?
                createSecureServer(
                    configuration.applicationServer.nodeServerOptions,
                    onIncomingMessage
                ) :
                // NOTE: See import notice.
                (createHTTP1Server as unknown as typeof createServer)(
                    onIncomingMessage
                ),
            streams: [],
            sockets: []
        }

        services.applicationServer.instance.on(
            'connection',
            (socket:Socket):void => {
                services.applicationServer.sockets.push(socket)

                socket.on('close', ():Array<Socket> =>
                    services.applicationServer.sockets.splice(
                        services.applicationServer.sockets.indexOf(socket), 1
                    )
                )
            }
        )

        services.applicationServer.instance.on(
            'stream',
            (stream:HTTPStream, headers:OutgoingHTTPHeaders):void => {
                services.applicationServer.streams.push(stream)

                void pluginAPI.callStack(
                    'applicationServerStream',
                    plugins,
                    configuration,
                    stream,
                    headers,
                    services
                )

                stream.on('close', ():Array<HTTPStream> =>
                    services.applicationServer.streams.splice(
                        services.applicationServer.streams.indexOf(stream), 1
                    )
                )
            }
        )

        return Promise.resolve(services)
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
