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
import {createServer, IncomingMessage, ServerResponse} from 'http'
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
        return new Promise((resolve:Function):void =>
            services.server.close(():void => {
                delete services.server
                resolve(services)
            }))
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
        // IgnoreTypeCheck
        services.server = createServer(async (
            request:IncomingMessage, response:ServerResponse
        ):Promise<any> => {
            request = await WebNodePluginAPI.callStack(
                'request', plugins, configuration, request, response)
            response.end()
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
    ):Promise<?Promise<Object>> {
        if (services.hasOwnProperty('server'))
            return Promise((resolve:Function, reject:Function):void => {
                const parameter:Array<any> = []
                if (configuration.server.application.hostName)
                    parameter.push(configuration.server.application.hostName)
                parameter.push(():void => console.error(
                    'Starting application server to listen on port "' +
                    `${configuration.server.application.port}".`))
                try {
                    services.server.listen(
                        configuration.server.application.port, ...parameter)
                } catch (error) {
                    reject(error)
                }
                resolve(services.server)
            })
        return null
    }
}
// endregion
// region vim modline
// vim: set tabstop=4 shiftwidth=4 expandtab:
// vim: foldmethod=marker foldmarker=region,endregion:
// endregion
