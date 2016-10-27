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
import * as QUnit from 'qunit-cli'
// NOTE: Only needed for debugging this file.
try {
    module.require('source-map-support/register')
} catch (error) {}
import configuration from 'web-node/configurator.compiled'
import type {Services} from 'web-node/type'

import Index from './index'
// endregion
QUnit.module('index')
QUnit.load()
// region tests
QUnit.test('exit', async (assert:Object):Promise<void> => {
    let testValue:boolean = false
    const services:Services = {server: {close: (callback:Function):void => {
        testValue = true
        callback()
    }}}
    try {
    assert.deepEqual(await Index.exit(services, [], configuration), services)
    } catch (error) {console.error(error)}
    assert.ok(testValue)
})
QUnit.test('preLoadService', (assert:Object):void => assert.ok(
    Index.preLoadService({server: {}}, [], configuration).hasOwnProperty(
        'server')))
// endregion
// region vim modline
// vim: set tabstop=4 shiftwidth=4 expandtab:
// vim: foldmethod=marker foldmarker=region,endregion:
// endregion
