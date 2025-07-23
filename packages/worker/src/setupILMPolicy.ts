import { Client } from '@elastic/elasticsearch';

export const setupILMPolicy = async (esClient: Client) => {
    const policyName = 'logs_deletion_policy';
  const templateName = 'logs_template';

  try {
    console.log('[ILM] Checking for existing ILM policy...');
    // 1. Create the Index Lifecycle Management (ILM) Policy
    await esClient.ilm.putLifecycle({
      name: policyName,
      body: {
        policy: {
          phases: {
            hot: {
              min_age: '0ms',
              actions: {
                set_priority: {
                  priority: 100,
                }
              },
            },
            delete: {
              min_age: '30d', // Wait 30 days from index creation
              actions: {
                delete: {}, // Then, perform the delete action
              },
            },
          },
        },
      },
    });
    console.log(`[ILM] Policy '${policyName}' created or updated successfully.`);

    // 2. Create an Index Template
    await esClient.indices.putTemplate({
      name: templateName,
      body: {
        index_patterns: ['logs-*'],
        settings: {
          'index.lifecycle.name': policyName,
        },
      },
    });
    console.log(`[ILM] Index template '${templateName}' created or updated successfully.`);

  } catch (error) {
    console.error('[ILM] Error setting up ILM policy and template:', error);
  }
}