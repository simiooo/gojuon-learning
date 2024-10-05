import { RouteOptions } from "fastify"
import { getVocabulary } from "./vocabulary"

export const routes: RouteOptions[] = [
    getVocabulary
] 