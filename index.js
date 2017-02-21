// @flow
// #!/usr/bin/env node
// -*- coding: utf-8 -*-
/** @module serverWebNodePlugin */
'use strict'
/* !
    region header
    [Project page](http://torben.website/serverWebNodePlugin)

    Copyright Torben Sickert (info["~at~"]torben.website) 16.12.2012

    License
    -------

    This library written by Torben Sickert stand under a creative commons
    naming 3.0 unported license.
    See http://creativecommons.org/licenses/by/3.0/deed.de
    endregion
*/
// region imports
import {
    createServer, IncomingMessage, Server as HTTPServer, ServerResponse
} from 'http'
import {Socket} from 'net'
// NOTE: Only needed for debugging this file.
try {
    require('source-map-support/register')
} catch (error) {}
import WebNodePluginAPI from 'web-node/pluginAPI'
import type {Configuration, Plugin, Services} from 'web-node/type'
// endregion
// region plugins/classes
/**
 * Launches an application server und triggers all some pluginable hooks on
 * an event.
 */
export default class Server {
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
            for (const socket of services.server.sockets)
                socket.destroy()
        })
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
        services.server = {
            instance: createServer(async (
                request:IncomingMessage, response:ServerResponse
            ):any => {
                request = await WebNodePluginAPI.callStack(
                    'serverRequest', plugins, configuration, request, response,
                    services)
                response.end()
            }),
            sockets: []
        }
        services.server.instance.on('connection', (socket:Socket):void => {
            services.server.sockets.push(socket)
            socket.on('close', ():Array<Socket> =>
                services.server.sockets.splice(services.server.sockets.indexOf(
                    socket
                ), 1))
        })
        return services
    }
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
        servicePromises:{[key:string]:Promise<Object>}, services:Services,
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
                            instance:HTTPServer;
                            sockets:Array<Socket>;
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
}
// endregion
// region vim modline
// vim: set tabstop=4 shiftwidth=4 expandtab:
// vim: foldmethod=marker foldmarker=region,endregion:
// endregion
