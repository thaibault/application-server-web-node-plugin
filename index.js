// @flow
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
import {createServer} from 'http'
import {
    createSecureServer,
    IncomingMessage,
    Server as HTTPServer,
    ServerResponse
} from 'http2'
import {Socket} from 'net'
import {PluginAPI} from 'web-node'
import type {
    Configuration, Plugin, ServicePromises, Services
} from 'web-node/type'
// endregion
// region plugins/classes
/**
 * Launches an application server und triggers all some pluginable hooks on
 * an event.
 */
export class Server {
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
    ):Promise<?{promise:Promise<HTTPServer>}> {
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
                        `${configuration.server.application.port}".`)
                    resolve({
                        name: 'server',
                        promise: new Promise(():{
                            instance:Object;
                            sockets:Array<Socket>;
                            streams:Array<Object>;
                        } => services.server)
                    })
                })
                try {
                    services.server.instance.listen(
                        configuration.server.application.port, ...parameter)
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
    ):Services {
        const onIncomingMessage:Function = async (
            request:IncomingMessage, response:ServerResponse
        // IgnoreTypeCheck
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
                    configuration.server.options, onIncomingMessage) :
                createServer(onIncomingMessage),
            sockets: []
        }
        services.server.instance.on('connection', (socket:Socket):void => {
            services.server.sockets.push(socket)
            socket.on('close', ():Array<Socket> =>
                services.server.sockets.splice(
                    services.server.sockets.indexOf(socket), 1)
            )
        })
        services.server.instance.on('stream', async (
            stream:Object, headers:Array<Object>
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
            stream.on('close', ():Array<Object> =>
                services.server.streams.splice(
                    services.server.streams.indexOf(stream), 1)
            )
        })
        return services
    }
    /**
     * Application will be closed soon.
     * @param services - An object with stored service instances.
     * @returns Given object of services.
     */
    static async shouldExit(services:Services):Services {
        return new Promise((resolve:Function):void => {
            services.server.instance.close(():void => {
                delete services.server
                resolve(services)
            })
            for (const connections of [
                services.server.sockets, services.server.streams
            ])
                for (const socket of connections)
                    socket.destroy()
        })
    }
}
export default Server
// endregion
// region vim modline
// vim: set tabstop=4 shiftwidth=4 expandtab:
// vim: foldmethod=marker foldmarker=region,endregion:
// endregion
