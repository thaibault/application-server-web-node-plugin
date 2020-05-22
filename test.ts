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
import registerTest from 'clientnode/test'
import {configuration} from 'web-node'
import {Services} from 'web-node/type'

import Index from './index'
// endregion
describe('server', async ():Promise<void> => {
    // region tests
    test('loadService', async ():Promise<void> =>
        expect(await Index.loadService({}, {}, configuration)).toBeNull()
    )
    test('preLoadService', ():void =>
        expect(Index.preLoadService({}, configuration, []).server.instance)
            .toBeInstanceOf(Object)
    )
    test('shouldExit', async ():Promise<void> => {
        let testValue:boolean = false
        const services:Services = {server: {instance: {close: (
            callback:Function
        ):void => {
            testValue = true
            callback()
        }}}}
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
