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
import {createServer} from 'http'
import {IncomingMessage, ServerResponse} from 'http'
// NOTE: Only needed for debugging this file.
try {
    require('source-map-support/register')
} catch (error) {}
import WebNodeHelper from 'web-node/helper'
import type {Configuration, Services} from 'web-node/type'
// endregion
// region plugins/classes
/**
 * Launches an application server und triggers all some pluginable hooks on
 * an event.
 */
export default class Server {
    /**
     * Appends an application server to the web node services.
     * @param services - An object with stored service instances.
     * @param plugins - Topological sorted list of plugins.
     * @param configuration - Mutable by plugins extended configuration object.
     * @param baseConfiguration - Immutable base configuration which will be
     * extended by each plugin configuration.
     * @returns Given and extended object of services.
     */
    static preLoadService(
        services:Services, plugins:Array<Plugin>,
        baseConfiguration:Configuration, configuration:Configuration
    ):Services {
        services.server = createServer(async (
            request:IncomingMessage, response:ServerResponse
        ):Promise<any> => {
            request = await WebNodeHelper.callStack(
                'request', plugins, baseConfiguration, configuration, request,
                response)
            response.end()
        }).listen(
            configuration.server.application.port,
            configuration.server.application.hostName)
        return services
    }
}
// endregion
// region vim modline
// vim: set tabstop=4 shiftwidth=4 expandtab:
// vim: foldmethod=marker foldmarker=region,endregion:
// endregion
