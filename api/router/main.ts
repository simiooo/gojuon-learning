import { RouteOptions } from "fastify"
import { getTTSVoice, getTTSVoiceByQuery, getVocabulary, getVocabularyCount } from "./vocabulary"
import { getGrammar } from "./grammar"

export const routes: RouteOptions[] = [
    getVocabulary,
    getTTSVoice,
    getVocabularyCount,
    getTTSVoiceByQuery,
    getGrammar,
] 