// Import the framework and instantiate it
import Fastify from 'fastify'
import { routes } from './router/main'
import mongodb from '@fastify/mongodb'
import { JsonSchemaToTsProvider } from '@fastify/type-provider-json-schema-to-ts'
import { default as fastifyStatic } from '@fastify/static'
import path from 'node:path'
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url); // get the resolved path to the file
const __dirname = path.dirname(__filename); // get the name of the directory

const mongo = {
    username: process.env.MONGO_USERNAME ?? 'root',
    password: process.env.MONGO_PWD ?? 'rootPwd123',
    host: process.env.MONGO_HOST ?? '192.168.31.172:27017',
    db: process.env.MONGO_DBNAME ?? 'japanese_words'
}
const mongoConnectionString = `mongodb://${encodeURIComponent(mongo.username)}:${encodeURIComponent(mongo.password)}@${mongo.host}/${mongo.db}?authSource=admin`
console.log(mongoConnectionString);

const serverInstance = Fastify({
    logger: true
}).withTypeProvider<JsonSchemaToTsProvider>()
serverInstance.register(mongodb, {
    forceClose: true,
    url: mongoConnectionString,
})
console.log(path.join(__dirname, '../dist'));

serverInstance.register(fastifyStatic, {
    root: path.join(__dirname, '../dist'),
    // index: path.join(__dirname,'../dist/index.html'),
    // constraints: { host: 'jp-learning.squirrelso.top' } // optional: default {}
})

routes.forEach(route => {
    serverInstance.route(route)
})

    ; (async () => {
        try {
            await serverInstance.listen({
                host: '0.0.0.0',
                port: 8081
            })
        } catch (err) {
            serverInstance.log.error(err)
            process.exit(1)
        }
    })()
