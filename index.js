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
// region  imports
import {createServer} from 'http'
import PouchDB from 'pouchdb'
// NOTE: Only needed for debugging this file.
try {
    require('source-map-support/register')
} catch (error) {}
import WebNodeHelper from 'webnode/helper'
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
     * @returns Given and extended object of services.
     */
    static postInitialize(services:{[key:string]:Object}):{
        [key:string]:Object
    } {
        services.server = createServer(async (
            request:Object, response:Object
        ):Promise<any> => {
            request = await WebNodeHelper.callPluginStack(
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
