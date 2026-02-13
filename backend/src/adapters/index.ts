/**
 * Adapters Layer
 * Inbound: HTTP controllers that handle request/response
 * Outbound: Repository implementations that persist to external systems
 */

export * from './inbound/http';
export * from './outbound/postgres';
