// GRC & Archiving Connector Service
// Integrates with GRC platforms (Smarsh, Archer) for compliance archiving

export interface GRCConnectorConfig {
  type: 'smarsh' | 'archer' | 'custom';
  apiKey: string;
  baseUrl: string;
  tenantId: string;
  archivePath?: string;
}

export interface ArchivePackage {
  callId: string;
  tenantId: string;
  recordingUrl?: string;
  transcriptUrl?: string;
  redactedTranscriptUrl?: string;
  auditTrailUrl: string;
  metadata: {
    from: string;
    to: string;
    duration: number;
    startTime: Date;
    endTime: Date;
    industry: string;
    region: string;
  };
}

class GRCConnectorService {
  private connectors: Map<string, GRCConnectorConfig> = new Map();

  /**
   * Register GRC connector for a tenant
   */
  registerConnector(tenantId: string, config: GRCConnectorConfig): void {
    this.connectors.set(tenantId, config);
  }

  /**
   * Archive call data to GRC platform
   */
  async archiveCall(tenantId: string, package: ArchivePackage): Promise<boolean> {
    const connector = this.connectors.get(tenantId);
    if (!connector) {
      console.warn(`No GRC connector configured for tenant ${tenantId}`);
      return false;
    }

    try {
      switch (connector.type) {
        case 'smarsh':
          return await this.archiveToSmarsh(connector, package);
        case 'archer':
          return await this.archiveToArcher(connector, package);
        default:
          return false;
      }
    } catch (error) {
      console.error(`Failed to archive call for tenant ${tenantId}:`, error);
      return false;
    }
  }

  /**
   * Archive to Smarsh
   */
  private async archiveToSmarsh(config: GRCConnectorConfig, package: ArchivePackage): Promise<boolean> {
    // Smarsh API integration
    const response = await fetch(`${config.baseUrl}/api/v1/archive`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        callId: package.callId,
        tenantId: package.tenantId,
        recordingUrl: package.recordingUrl,
        transcriptUrl: package.transcriptUrl,
        redactedTranscriptUrl: package.redactedTranscriptUrl,
        auditTrailUrl: package.auditTrailUrl,
        metadata: {
          ...package.metadata,
          archivedAt: new Date().toISOString()
        },
        archivePath: config.archivePath || '/compliance/voice'
      })
    });

    return response.ok;
  }

  /**
   * Archive to Archer
   */
  private async archiveToArcher(config: GRCConnectorConfig, package: ArchivePackage): Promise<boolean> {
    // Archer API integration
    const response = await fetch(`${config.baseUrl}/api/rest/content/record`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        moduleId: 'VoiceCompliance',
        fields: {
          'Call ID': package.callId,
          'Tenant ID': package.tenantId,
          'Recording URL': package.recordingUrl,
          'Transcript URL': package.transcriptUrl,
          'Redacted Transcript URL': package.redactedTranscriptUrl,
          'Audit Trail URL': package.auditTrailUrl,
          'From Number': package.metadata.from,
          'To Number': package.metadata.to,
          'Duration': package.metadata.duration,
          'Start Time': package.metadata.startTime.toISOString(),
          'End Time': package.metadata.endTime.toISOString(),
          'Industry': package.metadata.industry,
          'Region': package.metadata.region
        }
      })
    });

    return response.ok;
  }

  /**
   * Batch archive multiple calls (for scheduled jobs)
   */
  async batchArchive(tenantId: string, packages: ArchivePackage[]): Promise<{
    successful: number;
    failed: number;
    errors: string[];
  }> {
    const results = {
      successful: 0,
      failed: 0,
      errors: [] as string[]
    };

    for (const package of packages) {
      try {
        const success = await this.archiveCall(tenantId, package);
        if (success) {
          results.successful++;
        } else {
          results.failed++;
          results.errors.push(`Failed to archive call ${package.callId}`);
        }
      } catch (error) {
        results.failed++;
        results.errors.push(`Error archiving call ${package.callId}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    return results;
  }
}

export const grcConnectorService = new GRCConnectorService();
