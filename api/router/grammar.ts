import { RouteOptions } from "fastify"
import S from "fluent-json-schema"

const getGrammarBodyJsonSchema = S.object()
    .prop('pageSize', S.number().maximum(0x07fffffff).minimum(1).required().title("Hello"))
    .prop('current', S.number().maximum(0x07fffffff).minimum(1).required())
    .prop('keywords', S.string())
export const getGrammar: RouteOptions = {
    method: 'POST',
    url: '/api/v1/grammar',
    schema: {
        body: getGrammarBodyJsonSchema,
        response: {
            200: {
                type: 'object',
                properties: {
                    current: { type: 'number' },
                    pageSize: { type: 'number' },
                    data: { type: 'array' },
                    status: { type: 'number' },
                    total: { type: 'number' },
                    isEnd: { type: 'boolean' }
                }
            }
        }
    },
    preHandler: async (request, reply) => {
        // E.g. check authentication
    },
    handler: async (request, reply,) => {
        const payload = request.body as { pageSize: number, current: number, keywords?: string }
        const keywordPattern = new RegExp(payload?.keywords ?? '', 'i')
        const mongoQueryObject = {
            "$or" : [ 
                {
                    grammarSchema: keywordPattern
                }, 
                {
                    explanation: {$elemMatch : {$or: [{content: keywordPattern}, {example: keywordPattern},{extra: keywordPattern}]}}
                }
            ]
        }
        const cursor = request.server.mongo.GRAMMAR.db?.collection('primary_grammar').find(mongoQueryObject).skip(payload["pageSize"] * (payload["current"] - 1)).limit(payload["pageSize"])

        const result = await cursor?.toArray()
        const total = await request.server.mongo.GRAMMAR.db?.collection('primary_grammar').countDocuments(mongoQueryObject)
        return {
            status: 200,
            data: result ?? [],
            current: payload.current,
            pageSize: payload.pageSize,
            total: total,
            isEnd: Math.max(payload.current - 1, 0) * payload.pageSize + (result?.length ?? 0) >= (total ?? 0),
        }
    },
}