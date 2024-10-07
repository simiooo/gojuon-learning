import { RouteOptions } from "fastify"
import { getTTSVoice, getVocabulary } from "./vocabulary"

export const routes: RouteOptions[] = [
    getVocabulary,
    getTTSVoice,
] 