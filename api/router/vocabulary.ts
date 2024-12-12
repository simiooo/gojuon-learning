import { RouteOptions } from 'fastify'
import { S } from 'fluent-json-schema'
import axios from 'axios'
import { authenticate } from '../middleware/auth'


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
    preHandler: [authenticate],
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
    handler: async (request, reply,) => {
        const payload = request.body as { pageSize: number, current: number, keywords?: string }
        const keywordPattern = new RegExp(payload?.keywords ?? '', 'i')
        const mongoQueryObject = {
            "$or" : [ 
                {
                    word: keywordPattern
                }, 
                {
                    kana: keywordPattern
                },
                {
                    wordClass: keywordPattern
                },
                {
                    chineseMeaning: {$elemMatch : {$regex: keywordPattern}}
                }
            ]
        }
        const cursor = request.server.mongo.WORDS.db?.collection('minano_nihonngo').find(mongoQueryObject).skip(payload["pageSize"] * (payload["current"] - 1)).limit(payload["pageSize"])
        
        const result = await cursor?.toArray()
        const total = await request.server.mongo.WORDS.db?.collection('minano_nihonngo').countDocuments(mongoQueryObject)
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
            total: await request.server.mongo.WORDS.db?.collection('minano_nihonngo').countDocuments()
        }
    }
}