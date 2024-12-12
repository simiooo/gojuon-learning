import { FastifyRequest, FastifyReply } from 'fastify'
import jwt from 'jsonwebtoken'

// FastifyRequestに型拡張を追加

export async function authenticate(request: FastifyRequest, reply: FastifyReply) {
  try {
    const token = request.headers.authorization?.replace('Bearer ', '')
    
    if (!token) {
      reply.code(401).send({ message: 'Authentication required' })
      return
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key')
    request.user = decoded

  } catch (error) {
    reply.code(401).send({ message: 'Invalid token' })
  }
} 