// #!/usr/bin/env node
// -*- coding: utf-8 -*-
/** @module serverWebNodePlugin */
'use strict'
/* !
    region header
    [Project page](https://torben.website/serverWebNodePlugin)

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

import {
    Configuration, HTTPServer, Service, ServicePromises, Services
} from './type'
// endregion
// region plugins/classes
/**
 * Launches an application server und triggers all some pluginable hooks on
 * an event.
 */
export class Server implements PluginHandler {
    /**
     * Start database's child process and return a Promise which observes this
     * service.
     * @param servicePromises - An object with stored service promise
     * instances.
     * @param services - An object with stored service instances.
     * @param configuration - Mutable by plugins extended configuration object.
     * @returns A promise which correspond to the plugin specific continues
     * service.
     */
    static async loadService(
        servicePromises:ServicePromises,
        services:Services,
        configuration:Configuration
    ):Promise<null|Service> {
        if (services.hasOwnProperty('server'))
            return await new Promise((
                resolve:Function, reject:Function
            ):void => {
                const parameter:Array<any> = []
                if (configuration.server.application.hostName)
                    parameter.push(configuration.server.application.hostName)
                parameter.push(():void => {
                    console.info(
                        'Starting application server to listen on port "' +
                        `${configuration.server.application.port}".`
                    )
                    resolve({
                        name: 'server',
                        promise: new Promise(():Services['server'] =>
                            services.server
                        )
                    })
                })
                try {
                    services.server.instance.listen(
                        configuration.server.application.port, ...parameter
                    )
                } catch (error) {
                    reject(error)
                }
            })
        return null
    }
    /**
     * Appends an application server to the web node services.
     * @param services - An object with stored service instances.
     * @param configuration - Mutable by plugins extended configuration object.
     * @param plugins - Topological sorted list of plugins.
     * @returns Given and extended object of services.
     */
    static preLoadService(
        services:Services, configuration:Configuration, plugins:Array<Plugin>
    ):Promise<Services> {
        const onIncomingMessage = async (
            request:HTTPServerRequest, response:HTTPServerResponse
        ):Promise<void> => {
            await PluginAPI.callStack(
                'serverRequest',
                plugins,
                configuration,
                request,
                response,
                services
            )
            response.end()
        }
        services.server = {
            instance: (
                configuration.server.options.cert &&
                configuration.server.options.key
            ) ?
                createSecureServer(
                    configuration.server.options, onIncomingMessage
                ) :
                createServer(onIncomingMessage),
            streams: [],
            sockets: []
        }
        services.server.instance.on('connection', (socket:Socket):void => {
            services.server.sockets.push(socket)
            socket.on('close', ():Array<Socket> =>
                services.server.sockets.splice(
                    services.server.sockets.indexOf(socket), 1
                )
            )
        })
        services.server.instance.on(
            'stream',
            async (
                stream:HTTPStream,
                headers:OutgoingHTTPHeaders
            ):Promise<void> => {
                services.server.streams.push(stream)
                await PluginAPI.callStack(
                    'serverStream',
                    plugins,
                    configuration,
                    stream,
                    headers,
                    services
                )
                stream.on('close', ():Array<HTTPStream> =>
                    services.server.streams.splice(
                        services.server.streams.indexOf(stream), 1
                    )
                )
            }
        )
        return Promise.resolve(services)
    }
    /**
     * Application will be closed soon.
     * @param services - An object with stored service instances.
     * @returns Given object of services.
     */
    static async shouldExit(services:Services):Promise<Services> {
        return new Promise((resolve:Function):void => {
            services.server.instance.close(():void => {
                delete services.server
                resolve(services)
            })
            for (const connections of [
                services.server.sockets, services.server.streams
            ])
                if (Array.isArray(connections))
                    for (const connection of connections)
                        connection.destroy()
        })
    }
}
export default Server
// endregion
// region vim modline
// vim: set tabstop=4 shiftwidth=4 expandtab:
// vim: foldmethod=marker foldmarker=region,endregion:
// endregion