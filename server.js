const SERVER_PORT = process.env.PORT || 3000
const Hapi = require('hapi')
const Boom = require('boom')

// timezone
process.env.TZ = 'UTC'
require('app-module-path').addPath(__dirname)

// server
const server = Hapi.server({
  port: SERVER_PORT,
  host: 'localhost',
  router: {
    isCaseSensitive: true,
    stripTrailingSlash: true
  },
  routes: {
    cors: true,
    security: false
  }
})

// logging
server.events.on('log', (event, tags) => {
  console.log('event ============> ', event)
  if (tags.error) {
    console.log(`Server error: ${event.error ? event.error.message : 'unknown'}`)
  }
})

// error logging
const preResponse = function (request, h) {
  const response = request.response
  if (!response.isBoom) {
    return h.continue
  }

  const error = response
  console.error('error ============> ', error, error.stack)

  return error
}

server.ext('onPreResponse', preResponse)

const scheme = function (server, options) {
  return {
    api: {},
    authenticate: function (request, h) {
      const authorization = request.headers.authorization
      if (!authorization) {
        throw Boom.unauthorized(null, 'Custom')
      }

      if (authorization !== '97d46afd-cdbb-4292-ab03-31980851497b') {
        throw Boom.unauthorized('invalid token')
      }

      return h.authenticated({ credentials: { user: 'steve' } })
    }
  }
}

const init = async () => {
  // Auth
  server.auth.scheme('custom', scheme)
  server.auth.strategy('default', 'custom')

  // Auth Route
  await server.register({
    plugin: require('hapi-auto-route'),
    options: {
      routes_dir: './api/controllers',
      use_prefix: true
    }
  })

  // Register alive plugin
  await server.register({
    plugin: require('hapi-alive'),
    options: {
      path: '/health',
      tags: ['health', 'monitor'],
      responses: {
        healthy: {
          message: 'I\'m healthy!!!'
        },
        unhealthy: {
          statusCode: 400
        }
      },
      healthCheck: async function (_server) {
        await true
      },
      auth: false
    }
  })

  await server.register({
    plugin: require('blipp'),
    options: {
      showAuth: true,
      showScope: true,
      showStart: true
    }
  })

  await server.register({
    plugin: require('hapi-pino'),
    options: {
      prettyPrint: true,
      logEvents: ['response', 'onPostStart', 'request', 'request-error'] // 'onPostStop', 'log'
    }
  })

  await server.register({
    plugin: require('@gar/hapi-json-api'),
    options: {}
  })

  await server.start()
  console.log(`Server running at: ${server.info.uri}`)
}

process.on('unhandledRejection', async (err) => {
  console.error(`[unhandledRejection] ==> ${err}`)
  process.exit(1)
})

process.on('uncaughtException', async (err) => {
  console.error(`[uncaughtException] ==> ${err}`)
  process.exit(1)
})

init()
