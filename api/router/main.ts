import { RouteOptions } from "fastify"
import { getTTSVoice, getVocabulary, getVocabularyCount } from "./vocabulary"

export const routes: RouteOptions[] = [
    getVocabulary,
    getTTSVoice,
    getVocabularyCount,
] 