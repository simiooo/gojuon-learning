import { RouteOptions } from "fastify"
import { getTTSVoice, getTTSVoiceByQuery, getVocabulary, getVocabularyCount } from "./vocabulary"
import { getGrammar } from "./grammar"
import { loginRoute } from "./user"

export const routes: RouteOptions[] = [
    getVocabulary,
    getTTSVoice,
    getVocabularyCount,
    getTTSVoiceByQuery,
    getGrammar,
    loginRoute
] 