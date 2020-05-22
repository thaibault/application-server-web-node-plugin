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
import {
    Http2SecureServer as HTTPSecureServer,
    Http2Server as HttpServer,
    Http2Stream as HTTPStream
} from 'http2'
import {Socket} from 'net'
import {Service, Services, ServicePromises} from 'web-node/type'
// endregion
// region exports
export type HTTPServer = HttpServer|HTTPSecureServer
export type ServerService = Service & {
    name:'server';
    promise:Promise<HTTPServer>;
}
export type ServerServices = Services & {server:{
    instance:HTTPServer;
    streams:Array<HTTPStream>;
    sockets:Array<Socket>;
}}
export type ServerServicePromises = ServicePromises & {
    server:Promise<HTTPServer>;
}
// endregion
// region vim modline
// vim: set tabstop=4 shiftwidth=4 expandtab:
// vim: foldmethod=marker foldmarker=region,endregion:
// endregion
