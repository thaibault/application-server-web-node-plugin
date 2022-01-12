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
import Tools from 'clientnode'
import {configuration, PluginAPI} from 'web-node'

import Index from './index'
import {Configuration, HTTPServer, ServicePromises, Services} from './type'
// endregion
describe('application-server', ():void => {
    // region tests
    test('loadService', async ():Promise<void> => {
        expect(await Index.loadService(
            {} as ServicePromises,
            {} as Services,
            configuration as Configuration
        )).toBeNull()

        const promise:Promise<HTTPServer> = new Promise(Tools.noop)

        expect(await Index.loadService(
            {applicationServer: promise},
            {applicationServer: {
                instance: {
                    listen: (
                        port:number, host:string, started:Function
                    ):void => started()
                } as unknown as HTTPServer,
                sockets: [],
                streams: []
            }},
            configuration as Configuration
        )).toStrictEqual({name: 'applicationServer', promise})
    })
    test('preLoadService', async ():Promise<void> =>
        expect(
            (
                await Index.preLoadService(
                    {applicationServer: {
                        instance: {} as HTTPServer, sockets: [], streams: []
                    }},
                    configuration as Configuration,
                    [],
                    PluginAPI
                )
            ).applicationServer.instance
        ).toHaveProperty('listen')
    )
    test('shouldExit', async ():Promise<void> => {
        let testValue = false
        const services:Services = {applicationServer: {
            instance: {close: (callback:Function|undefined):HTTPServer => {
                testValue = true
                if (callback)
                    callback()
                return {} as HTTPServer
            }} as HTTPServer,
            sockets: [],
            streams: []
        }}
        try {
            expect(await Index.shouldExit(services)).toStrictEqual(services)
        } catch (error) {
            console.error(error)
        }
        expect(services).toStrictEqual({})
        expect(testValue).toStrictEqual(true)
    })
    // endregion
})
// region vim modline
// vim: set tabstop=4 shiftwidth=4 expandtab:
// vim: foldmethod=marker foldmarker=region,endregion:
// endregion
