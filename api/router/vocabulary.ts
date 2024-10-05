import { RouteOptions } from 'fastify'
import {S} from 'fluent-json-schema'



const getVocabularyBodyJsonSchema = S.object()
    .prop('pageSize', S.number().maximum(0x07fffffff).minimum(1).required().title("Hello"))
    .prop('current', S.number().maximum(0x07fffffff).minimum(1).required())
    .prop('kana', S.string())
    .prop('kanji', S.string())

export const getVocabulary: RouteOptions = {
    method: 'POST',
    url: '/api/v1/vocabulary',
    schema: {
        body: getVocabularyBodyJsonSchema,
        response: {
            200: {
                type: 'object',
                properties: {
                    current: { type: 'number' },
                    pageSize: { type: 'number' },
                    data: { type: 'array' },
                    status: {type: 'number'},
                    total: {tyep: 'number'}
                }
            }
        }
    },
    preHandler: async (request, reply) => {
        // E.g. check authentication
    },
    handler: async (request, reply,) => {
        const payload = request.body as { pageSize: number, current: number, kana?: string, kanji?: string }
        console.log(payload)
        const cursor = request.server.mongo.db?.collection('minano_nihonngo').find({
            "$or": [
                { 'word': { '$regex': new RegExp(`${payload["kanji"] ?? ''}`) }, },
                { "kana": { '$regex': new RegExp(`${payload["kana"] ?? ''}`) } }
            ],
        }).skip(payload["pageSize"] * (payload["current"] - 1)).limit(payload["pageSize"]).project({
            _id: 0,
        })
        const result = await cursor?.toArray()
        return { status: 200, data: result ?? [], current: payload.current, pageSize: payload.pageSize, total: await request.server.mongo.db?.collection('minano_nihonngo').countDocuments()}
    },
}