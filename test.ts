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
import {configuration, pluginAPI} from 'web-node'

import {loadService, preLoadService, shouldExit} from './index'
import {Configuration, HTTPServer, ServicePromises, Services} from './type'
// endregion
describe('application-server', (): void => {
    // region tests
    test('loadService', async (): Promise<void> => {
        await expect(loadService({
            configuration: configuration as Configuration,
            data: undefined,
            hook: 'load',
            plugins: [],
            pluginAPI,
            servicePromises: {} as ServicePromises,
            services: {} as Services
        })).resolves.toBeNull()

        const promise = new Promise<void>(NOOP)

        await expect(loadService({
            configuration: configuration as Configuration,
            data: undefined,
            hook: 'load',
            pluginAPI,
            plugins: [],
            servicePromises: {applicationServer: promise},
            services: {applicationServer: {
                instance: {
                    listen: (
                        port: number, host: string, started: () => void
                    ) => {
                        started()
                    }
                } as unknown as HTTPServer,
                sockets: [],
                streams: []
            }}
        })).resolves.toStrictEqual({applicationServer: promise})
    })
    test('preLoadService', async (): Promise<void> => {
        const services: Services = {applicationServer: {
            instance: {} as HTTPServer, sockets: [], streams: []
        }}

        await preLoadService({
            configuration: configuration as Configuration,
            data: undefined,
            hook: 'preLoad',
            pluginAPI,
            plugins: [],
            services
        })

        expect(services).toHaveProperty('applicationServer.instance.listen')
    })
    test('shouldExit', async (): Promise<void> => {
        let testValue = false
        const services: Services = {applicationServer: {
            instance: {
                close: (callback: (() => void) | undefined): HTTPServer => {
                    testValue = true
                    if (callback)
                        callback()

                    return {} as HTTPServer
                }
            } as HTTPServer,
            sockets: [],
            streams: []
        }}

        try {
            await expect(shouldExit({
                configuration: configuration as Configuration,
                data: undefined,
                hook: 'shouldExit',
                pluginAPI,
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
