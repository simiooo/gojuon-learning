import { RouteOptions } from 'fastify'
import { S } from 'fluent-json-schema'
import axios from 'axios'


const getVocabularyBodyJsonSchema = S.object()
    .prop('pageSize', S.number().maximum(0x07fffffff).minimum(1).required().title("Hello"))
    .prop('current', S.number().maximum(0x07fffffff).minimum(1).required())
    .prop('kana', S.string())
    .prop('kanji', S.string())
    // .prop('rangeStart', S.number())
    // .prop('rnageEnd', S.number())

const getTTSVoiceQueryStringSchema = S.object()
    // .prop('voice', S.string().required())
    .prop('text', S.string().required())
    .prop('cache', S.boolean())

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
                    status: { type: 'number' },
                    total: { type: 'number' },
                    isEnd: {type: 'boolean'}
                }
            }
        }
    },
    preHandler: async (request, reply) => {
        // E.g. check authentication
    },
    handler: async (request, reply,) => {
        const payload = request.body as { pageSize: number, current: number, kana?: string, kanji?: string }
        const cursor = request.server.mongo.db?.collection('minano_nihonngo').find({
            "$or": [
                { 'word': { '$regex': new RegExp(`${payload["kanji"] ?? ''}`) }, },
                { "kana": { '$regex': new RegExp(`${payload["kana"] ?? ''}`) } }
            ],
        }).skip(payload["pageSize"] * (payload["current"] - 1)).limit(payload["pageSize"]).project({
            _id: 0,
        })
        
        const result = await cursor?.toArray()
        const total = await request.server.mongo.db?.collection('minano_nihonngo').countDocuments()
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

export const getTTSVoice: RouteOptions = {
    method: 'POST',
    url: '/api/tts',
    schema: {
        body: getTTSVoiceQueryStringSchema,
    },
    handler: async (request, reply) => {
        const payload = request.body as { voice?: string, text?: string, cache?: boolean } ?? {}
        const res = await axios.get("http://openTTS:5500/api/tts", {
            params: {
                ...payload,
                voice: 'coqui-tts:ja_kokoro'
            },
            responseType: 'arraybuffer'
        })
        return res.data
    }
}
export const getTTSVoiceByQuery: RouteOptions = {
    method: 'GET',
    url: '/api/tts',
    schema: {
        querystring: getTTSVoiceQueryStringSchema,
    },
    handler: async (request, reply) => {
        const payload = request.query as { voice?: string, text?: string, cache?: boolean } ?? {}
        const res = await axios.get("http://openTTS:5500/api/tts", {
            params: {
                ...payload,
                voice: 'coqui-tts:ja_kokoro'
            },
            responseType: 'arraybuffer'
        })
        return res.data
    }
}

export const getVocabularyCount: RouteOptions = {
    method: 'POST',
    url: '/api/v1/vocabularyCount',
    schema: {
        // body: getVocabularyBodyJsonSchema,
    },
    handler: async (request, reply) => {

        return {
            total: await request.server.mongo.db?.collection('minano_nihonngo').countDocuments()
        }
    }
}