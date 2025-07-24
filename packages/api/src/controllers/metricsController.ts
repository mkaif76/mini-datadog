// packages/api/src/controllers/metricsController.ts

import { Request, Response } from 'express';
import { Client as ElasticsearchClient } from '@elastic/elasticsearch';

let esClient: ElasticsearchClient | null = null;

// This function allows our main index.ts to pass the Elasticsearch client to this controller.
export const initializeMetricsDependencies = (client: ElasticsearchClient) => {
  esClient = client;
};

// The controller function for the /metrics endpoint.
export const getMetrics = async (req: Request, res: Response) => {
    if (!esClient) {
        return res.status(503).json({ error: 'Service unavailable: Search client is not ready.' });
    }
    try {
        const timeRange = (req.query.range as string) || '24h';
        const interval = (req.query.interval as string) || '1h';
        const result = await esClient.search({
            index: 'logs-*',
            body: {
                size: 0,
                query: { range: { '@timestamp': { gte: `now-${timeRange}`, lt: 'now' } } },
                aggs: {
                    // FIX: Use the .keyword field for exact term aggregation
                    logs_by_level: { terms: { field: 'level.keyword' } },
                    // FIX: Use the .keyword field for exact term aggregation
                    logs_by_service: { terms: { field: 'service.keyword', size: 10 } },
                    logs_over_time: { date_histogram: { field: '@timestamp', fixed_interval: interval, min_doc_count: 0 } },
                },
            },
        });
        res.status(200).json(result.body.aggregations);
    } catch (error) {
        console.error('Error fetching metrics:', error);
        res.status(500).json({ error: 'Internal server error while fetching metrics.' });
    }
};