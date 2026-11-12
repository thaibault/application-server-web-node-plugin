<!-- !/usr/bin/env markdown
-*- coding: utf-8 -*-
region header
Copyright Torben Sickert (info["~at~"]tsickert.com) 16.12.2012

License
-------

This library written by Torben Sickert stands under a creative commons naming
3.0 unported license. See https://creativecommons.org/licenses/by/3.0/deed.de
endregion -->

<!--|deDE:Projektstatus-->
<!--|frFR:État du projet-->
Project status
--------------

[![npm](https://img.shields.io/npm/v/application-server-web-node-plugin?color=%23d55e5d&label=npm%20package%20version&logoColor=%23d55e5d&style=for-the-badge)](https://www.npmjs.com/package/application-server-web-node-plugin)
[![npm downloads](https://img.shields.io/npm/dy/application-server-web-node-plugin.svg?style=for-the-badge)](https://www.npmjs.com/package/application-server-web-node-plugin)

[![build](https://img.shields.io/github/actions/workflow/status/thaibault/application-server-web-node-plugin/build.yaml?style=for-the-badge)](https://github.com/thaibault/application-server-web-node-plugin/actions/workflows/build.yaml)
[![build push package](https://img.shields.io/github/actions/workflow/status/thaibault/application-server-web-node-plugin/build-package-and-push.yaml?label=build%20push%20package&style=for-the-badge)](https://github.com/thaibault/application-server-web-node-plugin/actions/workflows/build-package-and-push.yaml)

[![check types](https://img.shields.io/github/actions/workflow/status/thaibault/application-server-web-node-plugin/check-types.yaml?label=check%20types&style=for-the-badge)](https://github.com/thaibault/application-server-web-node-plugin/actions/workflows/check-types.yaml)
[![lint](https://img.shields.io/github/actions/workflow/status/thaibault/application-server-web-node-plugin/lint.yaml?label=lint&style=for-the-badge)](https://github.com/thaibault/application-server-web-node-plugin/actions/workflows/lint.yaml)
[![test](https://img.shields.io/github/actions/workflow/status/thaibault/application-server-web-node-plugin/test-coverage-report.yaml?label=test&style=for-the-badge)](https://github.com/thaibault/application-server-web-node-plugin/actions/workflows/test-coverage-report.yaml)

[![code coverage](https://img.shields.io/coverallsCoverage/github/thaibault/application-server-web-node-plugin?label=code%20coverage&style=for-the-badge)](https://coveralls.io/github/thaibault/application-server-web-node-plugin)

[![deploy web documentation](https://img.shields.io/github/actions/workflow/status/thaibault/application-server-web-node-plugin/deploy-web-documentation.yaml?label=deploy%20web%20documentation&style=for-the-badge)](https://github.com/thaibault/application-server-web-node-plugin/actions/workflows/deploy-web-documentation.yaml)
[![web documentation](https://img.shields.io/website-up-down-green-red/https/tsickert.com/application-server-web-node-plugin.svg?label=web-documentation&style=for-the-badge)](https://tsickert.com/application-server-web-node-plugin)

[![Open in CodeSandbox](https://img.shields.io/badge/Open%20in-CodeSandbox-blue?style=for-the-badge&logo=codesandbox)](https://githubbox.com/thaibault/application-server-web-node-plugin)

<!--|deDE:Einsatzmöglichkeiten-->
<!--|frFR:Cas d'utilisation-->
Use case
--------

This [web-node](https://tsickert.com/web-node) plugin starts an HTTP server
and hands every incoming request to the plugin hook chain. It is the shared
foundation for web-node plugins and applications which answer HTTP requests.
<!--deDE:
    Dieses [web-node](https://tsickert.com/web-node)-Plugin startet einen
    HTTP-Server und reicht jede eingehende Anfrage an die Hook-Kette der
    Plugins weiter. Es ist die gemeinsame Grundlage für web-node-Plugins und
    -Anwendungen, die HTTP-Anfragen beantworten.
-->
<!--frFR:
    Ce plugin [web-node](https://tsickert.com/web-node) démarre un serveur
    HTTP et transmet chaque requête entrante à la chaîne de hooks des
    plugins. Il constitue la base commune des plugins et applications web-node
    qui répondent à des requêtes HTTP.
-->

Features included:
<!--deDE:Enthaltene Funktionen:-->
<!--frFR:Fonctionnalités incluses:-->

- Plain HTTP/1 server or encrypted HTTP/2 server as soon as a certificate is
  configured.<!--deDE:Einfacher HTTP/1-Server oder verschlüsselter HTTP/2-Server, sobald ein Zertifikat konfiguriert ist.--><!--frFR:Serveur HTTP/1 simple ou serveur HTTP/2 chiffré dès qu'un certificat est configuré.-->
- Hooks to handle requests and HTTP/2 streams in any other plugin.<!--deDE:Hooks, um Anfragen und HTTP/2-Streams in jedem anderen Plugin zu behandeln.--><!--frFR:Hooks permettant de traiter les requêtes et les flux HTTP/2 dans n'importe quel autre plugin.-->
- Graceful shutdown which closes all open sockets and streams.<!--deDE:Sauberes Herunterfahren, das alle offenen Sockets und Streams schließt.--><!--frFR:Arrêt propre qui ferme tous les sockets et flux ouverts.-->

<div class="wd-table-of-contents">
    <h2 id="content">Content<!--deDE:Inhalt--><!--frFR:Contenu--></h2>
    <!--wd-table-of-contents-->
</div>

Installation
------------

Install the plugin next to web-node. web-node discovers every installed
package whose name ends with "-web-node-plugin" automatically:
<!--deDE:
    Installieren Sie das Plugin neben web-node. web-node erkennt jedes
    installierte Paket, dessen Name auf "-web-node-plugin" endet,
    automatisch:
-->
<!--frFR:
    Installez le plugin à côté de web-node. web-node détecte automatiquement
    chaque paquet installé dont le nom se termine par "-web-node-plugin":
-->

```bash
yarn add web-node application-server-web-node-plugin
```

<!--|deDE:Konfiguration-->
<!--|frFR:Configuration-->
Configuration
-------------

Override the defaults in the "webNode" section of your application's
"package.json":
<!--deDE:
    Überschreiben Sie die Standardwerte im Abschnitt "webNode" der
    "package.json" Ihrer Anwendung:
-->
<!--frFR:
    Remplacez les valeurs par défaut dans la section "webNode" du
    "package.json" de votre application:
-->

```JSON
{
    "webNode": {
        "applicationServer": {
            "hostName": "0.0.0.0",
            "port": 443,
            "nodeServerOptions": {
                "allowHTTP1": true,
                "cert": "<certificate in PEM format>",
                "key": "<private key in PEM format>"
            }
        }
    }
}
```

- "hostName": Interface to listen on. Defaults to "127.0.0.1".<!--deDE:"hostName": Netzwerkschnittstelle, auf der gelauscht wird. Standardmäßig "127.0.0.1".--><!--frFR:"hostName": Interface réseau d'écoute. Par défaut "127.0.0.1".-->
- "port": Port to listen on. Defaults to "8080".<!--deDE:"port": Port, auf dem gelauscht wird. Standardmäßig "8080".--><!--frFR:"port": Port d'écoute. Par défaut "8080".-->
- "nodeServerOptions": Options passed to Node's
  "http2.createSecureServer". As soon as "cert" and "key" are given an
  encrypted HTTP/2 server is started, otherwise a plain HTTP/1 server.<!--deDE:"nodeServerOptions": Optionen für Nodes "http2.createSecureServer". Sobald "cert" und "key" angegeben sind, wird ein verschlüsselter HTTP/2-Server gestartet, andernfalls ein einfacher HTTP/1-Server.--><!--frFR:"nodeServerOptions": Options transmises à "http2.createSecureServer" de Node. Dès que "cert" et "key" sont fournis, un serveur HTTP/2 chiffré est démarré, sinon un simple serveur HTTP/1.-->

<!--|deDE:Anfragen behandeln-->
<!--|frFR:Traiter les requêtes-->
Handling requests
-----------------

Implement the hook "applicationServerRequest" in your application or plugin.
Each request runs through all plugins implementing it. The response is
finished automatically afterwards:
<!--deDE:
    Implementieren Sie den Hook "applicationServerRequest" in Ihrer Anwendung
    oder Ihrem Plugin. Jede Anfrage durchläuft alle Plugins, die ihn
    implementieren. Die Antwort wird anschließend automatisch abgeschlossen:
-->
<!--frFR:
    Implémentez le hook "applicationServerRequest" dans votre application ou
    votre plugin. Chaque requête traverse tous les plugins qui l'implémentent.
    La réponse est ensuite terminée automatiquement:
-->

```TypeScript
import type {
    PluginHandler, ServicePromisesState, RequestData
} from 'application-server-web-node-plugin/type'

export const plugin: PluginHandler = {
    applicationServerRequest: async (
        {data: {request, response}}: ServicePromisesState<RequestData>
    ): Promise<void> => {
        if (request.url === '/health')
            response.write('ok')
    }
}
```

Further hooks and services:
<!--deDE:Weitere Hooks und Dienste:-->
<!--frFR:Autres hooks et services:-->

- "applicationServerStream": Called for every HTTP/2 stream, only available on
  encrypted servers.<!--deDE:"applicationServerStream": Wird für jeden HTTP/2-Stream aufgerufen, nur bei verschlüsselten Servern verfügbar.--><!--frFR:"applicationServerStream": Appelé pour chaque flux HTTP/2, disponible uniquement sur les serveurs chiffrés.-->
- "services.applicationServer": Holds the Node server "instance" and its open
  "sockets" and "streams".<!--deDE:"services.applicationServer": Enthält die Node-Server-"instance" sowie deren offene "sockets" und "streams".--><!--frFR:"services.applicationServer": Contient l'"instance" du serveur Node ainsi que ses "sockets" et "streams" ouverts.-->

<!--|deDE:Entwicklung-->
<!--|frFR:Développement-->
Development
-----------

```bash
yarn install
yarn build
yarn test
```
