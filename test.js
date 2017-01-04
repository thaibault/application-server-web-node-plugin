// @flow
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
    See http://creativecommons.org/licenses/by/3.0/deed.de
    endregion
*/
// region imports
import registerTest from 'clientnode/test'
import {Server} from 'http'
// NOTE: Only needed for debugging this file.
try {
    module.require('source-map-support/register')
} catch (error) {}
import configuration from 'web-node/configurator'
import type {Services} from 'web-node/type'

import Index from './index'
// endregion
registerTest(async function():Promise<void> {
    // region tests
    this.test('shouldExit', async (assert:Object):Promise<void> => {
        let testValue:boolean = false
        const services:Services = {server: {instance: {close: (
            callback:Function
        ):void => {
            testValue = true
            callback()
        }}}}
        try {
            assert.deepEqual(
                await Index.shouldExit(services, [], configuration), services)
        } catch (error) {
            console.error(error)
        }
        assert.deepEqual(services, {})
        assert.ok(testValue)
    })
    this.test('loadService', async (assert:Object):Promise<void> =>
        assert.strictEqual(
            await Index.loadService({}, {}, configuration), null))
    this.test('preLoadService', (assert:Object):void => assert.ok(
        Index.preLoadService({}, configuration, [
        ]).server.instance instanceof Server))
    // endregion
}, ['plain'])
// region vim modline
// vim: set tabstop=4 shiftwidth=4 expandtab:
// vim: foldmethod=marker foldmarker=region,endregion:
// endregion
