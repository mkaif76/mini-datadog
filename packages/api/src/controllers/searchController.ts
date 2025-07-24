// packages/api/src/controllers/searchController.ts

import { Request, Response } from 'express';
import { Client as ElasticsearchClient } from '@elastic/elasticsearch';

let esClient: ElasticsearchClient | null = null;

// This function allows our main index.ts to pass the Elasticsearch client to this controller.
export const initializeSearchDependencies = (client: ElasticsearchClient) => {
  esClient = client;
};

// The controller function for the /search endpoint.
export const searchLogs = async (req: Request, res: Response) => {
  if (!esClient) {
    return res.status(503).json({ error: 'Service unavailable: Search client is not ready.' });
  }
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const from = (page - 1) * limit;
    const { q, service, level, requestId, startTime, endTime } = req.query;
    const mustClauses: any[] = [];

    if (q && typeof q === 'string') { mustClauses.push({ match: { message: q } }); }
    if (service && typeof service === 'string') { mustClauses.push({ match: { service: service } }); }
    if (level && typeof level === 'string') { mustClauses.push({ match: { level: level } }); }
    if (requestId && typeof requestId === 'string') { mustClauses.push({ match: { 'metadata.requestId': requestId } }); }
    if (startTime || endTime) { mustClauses.push({ range: { '@timestamp': { gte: startTime, lte: endTime } } }); }

    const result = await esClient.search({
      index: 'logs-*',
      body: {
        from: from,
        size: limit,
        query: {
          bool: {
            must: mustClauses.length > 0 ? mustClauses : { match_all: {} },
          },
        },
        sort: [{ '@timestamp': { order: 'desc' } }],
      },
    });

    const logs = result.body.hits.hits.map((hit: { _source: any; }) => hit._source);
    const totalLogs = typeof result.body.hits.total === 'number' ? result.body.hits.total : result.body.hits.total?.value || 0;
    
    res.status(200).json({
      logs,
      total: totalLogs,
      page,
      limit,
      hasMore: from + logs.length < totalLogs,
    });
  } catch (error) {
    console.error('Error searching logs:', error);
    res.status(500).json({ error: 'Internal server error while searching logs.' });
  }
};