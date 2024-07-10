// #!/usr/bin/env babel-node
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
import {describe, expect, test} from '@jest/globals'
import {NOOP} from 'clientnode'
import {configuration, PluginAPI} from 'web-node'

import Index from './index'
import {Configuration, HTTPServer, ServicePromises, Services} from './type'
// endregion
describe('application-server', ():void => {
    // region tests
    test('loadService', async ():Promise<void> => {
        await expect(Index.loadService({
            configuration: configuration as Configuration,
            hook: 'load',
            plugins: [],
            pluginAPI: PluginAPI,
            servicePromises: {} as ServicePromises,
            services: {} as Services
        })).resolves.toBeNull()

        const promise:Promise<void> = new Promise(NOOP)

        await expect(Index.loadService({
            configuration: configuration as Configuration,
            hook: 'load',
            pluginAPI: PluginAPI,
            plugins: [],
            servicePromises: {applicationServer: promise},
            services: {applicationServer: {
                instance: {
                    listen: (
                        port:number, host:string, started:() => void
                    ):void => started()
                } as unknown as HTTPServer,
                sockets: [],
                streams: []
            }}
        })).resolves.toStrictEqual({applicationServer: promise})
    })
    test('preLoadService', async ():Promise<void> => {
        const services:Services = {applicationServer: {
            instance: {} as HTTPServer, sockets: [], streams: []
        }}

        await Index.preLoadService({
            configuration: configuration as Configuration,
            hook: 'preLoad',
            pluginAPI: PluginAPI,
            plugins: [],
            services
        })

        expect(services).toHaveProperty('applicationServer.instance.listen')
    })
    test('shouldExit', async ():Promise<void> => {
        let testValue = false
        const services:Services = {applicationServer: {
            instance: {close: (callback:(() => void)|undefined):HTTPServer => {
                testValue = true
                if (callback)
                    callback()

                return {} as HTTPServer
            }} as HTTPServer,
            sockets: [],
            streams: []
        }}

        try {
            await expect(Index.shouldExit({
                configuration: configuration as Configuration,
                hook: 'shouldExit',
                pluginAPI: PluginAPI,
                plugins: [],
                servicePromises: {} as ServicePromises,
                services: services
            })).resolves.toBeUndefined()
        } catch (error) {
            console.error(error)
        }

        expect(services).toStrictEqual({})
        expect(testValue).toStrictEqual(true)
    })
    // endregion
})
