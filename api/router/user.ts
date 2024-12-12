import { RouteOptions } from "fastify";
import { S } from 'fluent-json-schema'
import jwt from 'jsonwebtoken'

const loginSchema = S.object()
  .prop('username', S.string().required())
  .prop('password', S.string().required())

export const loginRoute: RouteOptions = {
  method: 'POST',
  url: '/api/v1/login',
  schema: {
    body: loginSchema
  },
  handler: async (request, reply) => {
    const { username, password } = request.body as { username: string, password: string }
    
    // ここでユーザー認証のロジックを実装
    // 例: データベースでユーザーを確認
    const user = await request.server.mongo.WORDS.db?.collection('users')
      .findOne({ username, password }) 

    if (!user) {
      reply.code(401).send({ message: 'Invalid credentials' })
      return
    }

    // JWTトークンを生成
    const token = jwt.sign(
      { id: user._id, username: user.username },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    )

    return { token }
  }
}

function getProfile() {

}

// const loginByGoogleRoute: RouteOptions = {

// }

function signUpByGoogle() {

}

// const getRememberTaskInfoRoute: RouteOptions =  {

// }

// const setRememberTaskInfoRoute: RouteOptions = {

// }