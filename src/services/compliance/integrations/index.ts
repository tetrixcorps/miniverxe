// Integration Connectors Exports
// Centralized exports for all integration connectors

export {
  crmConnectorService,
  type CRMConnectorConfig,
  type CallSummary
} from './crmConnector';

export {
  grcConnectorService,
  type GRCConnectorConfig,
  type ArchivePackage
} from './grcConnector';

export {
  ticketingConnectorService,
  type TicketingConnectorConfig,
  type TicketRequest,
  type Ticket
} from './ticketingConnector';
