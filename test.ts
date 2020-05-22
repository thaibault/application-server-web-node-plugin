// #!/usr/bin/env node
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
import {configuration} from 'web-node'

import Index from './index'
import {HTTPServer, ServerServices} from './type'
// endregion
describe('server', async ():Promise<void> => {
    // region tests
    test('loadService', async ():Promise<void> =>
        expect(await Index.loadService(
            {server: new Promise(Tools.noop)},
            {server: {instance: {} as HTTPServer, sockets: [], streams: []}},
            configuration
        )).toBeNull()
    )
    test('preLoadService', ():void =>
        expect(Index.preLoadService(
            {server: {instance: {} as HTTPServer, sockets: [], streams: []}},
            configuration,
            []
        ).server.instance).toBeInstanceOf(Object)
    )
    test('shouldExit', async ():Promise<void> => {
        let testValue:boolean = false
        const services:ServerServices = {server: {
            instance: {close: (callback:Function|undefined):void => {
                testValue = true
                callback()
            }},
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
