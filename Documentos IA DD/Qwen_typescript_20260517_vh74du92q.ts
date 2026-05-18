// src/__tests__/integration/obp-payload-validator.test.ts (TDD)
import { validateOBPPayload } from '../../src/integration/obp/validator';
import { OBPExportPayloadSchema } from '../../src/integration/obp/schema';

describe('OBP Payload Validator (TDD)', () => {
  it('RECHAZA payload sin auditTrail (ADD: Security)', () => {
    const invalidPayload = {
      civicInitiativeId: 'test-123',
      // missing auditTrail → required by schema
    };
    
    const result = validateOBPPayload(invalidPayload);
    expect(result.success).toBe(false);
    expect(result.error?.issues).toContainEqual(
      expect.objectContaining({ path: ['auditTrail'], message: 'Required' })
    );
  });

  it('ACEPTA payload completo con firma criptográfica', () => {
    const validPayload = {
      civicInitiativeId: 'test-123',
      district: { id: 'hermosillo-d8', /* ... */ },
      auditTrail: [{
        timestamp: new Date().toISOString(),
        action: 'prediction_generated',
        hash: 'sha256:abc123...',
        compliantWith: ['LGPD', 'GDPR-local']
      }],
      signature: 'sha256:payload-signature...'
    };
    
    const result = validateOBPPayload(validPayload);
    expect(result.success).toBe(true);
    expect(result.data?.signature).toBeDefined();
  });
});