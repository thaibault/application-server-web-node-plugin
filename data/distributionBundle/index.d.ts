import type { PluginPromises } from 'web-node/type';
import type { PluginHandler, ServicePromisesState, ServicesState } from './type';
import { Logger } from 'clientnode';
export declare const log: Logger;
/**
 * Launches an application server und triggers all some pluggable hooks on an
 * event.
 */
/**
 * Appends an application server to the web node services.
 * @param state - Application state.
 * @returns Promise resolving to nothing.
 */
export declare const preLoadService: (state: ServicesState) => Promise<void>;
/**
 * Start database's child process and return a Promise which observes this
 * service.
 * @param state - Application state.
 * @param state.configuration - Applications configuration.
 * @param state.configuration.applicationServer - Server configuration.
 * @param state.services - Application services.
 * @returns A mapping to promises which correspond to the plugin specific
 * continues services.
 */
export declare const loadService: ({ configuration: { applicationServer: configuration }, services }: ServicePromisesState) => Promise<null | PluginPromises>;
/**
 * Application will be closed soon.
 * @param state - Application state.
 * @param state.services - Application services.
 * @returns Promise resolving to nothing.
 */
export declare const shouldExit: ({ services }: ServicePromisesState) => Promise<void>;
export declare const applicationServer: PluginHandler;
export default applicationServer;
