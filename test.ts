// #!/usr/bin/env babel-node
// -*- coding: utf-8 -*-
'use strict'
/* !
    region header
    Copyright Torben Sickert (info["~at~"]tsickert.com) 16.12.2012

    License
    -------

    This library written by Torben Sickert stands under a creative commons
    naming 3.0 unported license.
    See https://creativecommons.org/licenses/by/3.0/deed.de
    endregion
*/
// region imports
import type {AddressInfo} from 'net'

import type {
    Configuration, HTTPServer, ServicePromises, Services
} from './type'

import {NOOP} from 'clientnode'
import {EventEmitter, once} from 'events'
import {configuration, pluginAPI} from 'web-node'

import {expect, test} from '@jest/globals'

import {loadService, preLoadService, shouldExit} from './index'
// endregion
const baseConfiguration = configuration as Configuration
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

    expect(await loadService({
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
    })).toHaveProperty('applicationServer')
})
test('loadService without host name', async (): Promise<void> => {
    let listenParameters: Array<unknown> = []

    await expect(loadService({
        configuration: {
            ...baseConfiguration,
            applicationServer: {
                ...baseConfiguration.applicationServer, hostName: ''
            }
        } as Configuration,
        data: undefined,
        hook: 'load',
        pluginAPI,
        plugins: [],
        servicePromises: {} as ServicePromises,
        services: {applicationServer: {
            instance: {
                listen: (...parameters: Array<unknown>) => {
                    listenParameters = parameters;

                    (parameters[parameters.length - 1] as () => void)()
                }
            } as unknown as HTTPServer,
            sockets: [],
            streams: []
        }}
    })).resolves.toHaveProperty('applicationServer')

    expect(listenParameters).toHaveLength(2)
    expect(listenParameters[0])
        .toStrictEqual(baseConfiguration.applicationServer.port)
})
test('loadService rejects on listen error', async (): Promise<void> => {
    const error = new Error('Port in use.')

    await expect(loadService({
        configuration: baseConfiguration,
        data: undefined,
        hook: 'load',
        pluginAPI,
        plugins: [],
        servicePromises: {} as ServicePromises,
        services: {applicationServer: {
            instance: {
                listen: () => {
                    throw error
                }
            } as unknown as HTTPServer,
            sockets: [],
            streams: []
        }}
    })).rejects.toBe(error)
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
test('serve request and track connections', async (): Promise<void> => {
    const hooks: Array<string> = []
    const testPluginAPI = {
        ...pluginAPI,
        callStack: ({hook}: {hook: string}): Promise<void> => {
            hooks.push(hook)

            return Promise.resolve()
        }
    } as unknown as typeof pluginAPI
    const testConfiguration = {
        ...baseConfiguration,
        applicationServer: {...baseConfiguration.applicationServer, port: 0}
    } as Configuration
    const services = {} as Services

    await preLoadService({
        configuration: testConfiguration,
        data: undefined,
        hook: 'preLoad',
        pluginAPI: testPluginAPI,
        plugins: [],
        services
    })
    const server = services.applicationServer

    await expect(loadService({
        configuration: testConfiguration,
        data: undefined,
        hook: 'load',
        pluginAPI: testPluginAPI,
        plugins: [],
        servicePromises: {} as ServicePromises,
        services
    })).resolves.toHaveProperty('applicationServer')

    const {port} = server.instance.address() as AddressInfo
    const response = await fetch(
        `http://${testConfiguration.applicationServer.hostName}:` +
        String(port)
    )
    await response.text()

    expect(response.status).toStrictEqual(200)
    expect(hooks).toStrictEqual(['applicationServerRequest'])
    // NOTE: Fetch keeps the connection alive.
    expect(server.sockets).toHaveLength(1)

    const stream = new EventEmitter() as EventEmitter & {destroy: () => void}
    stream.destroy = (): void => {
        stream.emit('close')
    }
    server.instance.emit('stream', stream, {})

    expect(hooks).toStrictEqual(
        ['applicationServerRequest', 'applicationServerStream']
    )
    expect(server.streams).toStrictEqual([stream])

    const socketClosed = once(server.sockets[0], 'close')
    await expect(shouldExit({
        configuration: testConfiguration,
        data: undefined,
        hook: 'shouldExit',
        pluginAPI: testPluginAPI,
        plugins: [],
        servicePromises: {} as ServicePromises,
        services
    })).resolves.toBeUndefined()

    expect(services).toStrictEqual({})

    await socketClosed
    expect(server.sockets).toHaveLength(0)
    expect(server.streams).toHaveLength(0)
})
// endregion
