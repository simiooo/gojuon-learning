import { RouteOptions } from "fastify"
import { getTTSVoice, getTTSVoiceByQuery, getVocabulary, getVocabularyCount } from "./vocabulary"

export const routes: RouteOptions[] = [
    getVocabulary,
    getTTSVoice,
    getVocabularyCount,
    getTTSVoiceByQuery,
] 