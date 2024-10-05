// Import the framework and instantiate it
import Fastify from 'fastify'
import { routes } from './router/main'
import mongodb from '@fastify/mongodb'
import { JsonSchemaToTsProvider } from '@fastify/type-provider-json-schema-to-ts'

const mongo = {
    username: 'root',
    password: 'rootPwd123',
    host: '192.168.31.172:27017',
    db: 'japanese_words'
}

const serverInstance = Fastify({
    logger: true
}).withTypeProvider<JsonSchemaToTsProvider>()
serverInstance.register(mongodb, {
    forceClose: true,
    url: `mongodb://${encodeURIComponent(mongo.username)}:${encodeURIComponent(mongo.password)}@${mongo.host}/${mongo.db}?authSource=admin`,
})


routes.forEach(route => {
    serverInstance.route(route)
})

// ;(async () => {
//     try {
//         await serverInstance.listen({ port: 3000 })
//     } catch (err) {
//         serverInstance.log.error(err)
//         process.exit(1)
//     }
// })()

export default async (req: any, res: any) => {
    await serverInstance.ready();
    serverInstance.server.emit('request', req, res);
}