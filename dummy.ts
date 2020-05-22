// #!/usr/bin/env node
// -*- coding: utf-8 -*-
/** @module dummy */
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
// region  imports
import {IncomingMessage, ServerResponse} from 'http'
// endregion
/**
 * Dummy plugin interface implementing all available hooks.
 */
export class Dummy {
    /* eslint-disable no-unused-vars */
    /**
     * Hook to run on each request. After running this hook returned request
     * will be finished.
     * @param request - Request which comes from client.
     * @param response - Response object to use to perform a response to
     * client.
     * @returns Request object to finishe.
     */
    static serverRequest(
        request:IncomingMessage, response:ServerResponse
    ):IncomingMessage {
        return request
    }
    /**
     * Hook to run on stream.
     * @param stream - Current stream object.
     * @param headers - Current headers.
     * @returns Current Stream.
     */
    static serverStream(stream:Object, headers:Object):Object {
        return stream
    }
    /* eslint-enable no-unused-vars */
}
export default Dummy
// region vim modline
// vim: set tabstop=4 shiftwidth=4 expandtab:
// vim: foldmethod=marker foldmarker=region,endregion:
// endregion
