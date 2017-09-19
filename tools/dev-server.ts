import * as http from 'http'
import * as path from 'path'
import * as express from 'express'
import * as webpack from 'webpack'
import logs from '../src/util/logs'
import { initializeDefaultLogLevels } from '../src/util/logs'

const HTTP_SERVER: string = process.env.VXWEB_SERVER || 'http://localhost:9091'
const WS_SERVER = 'ws' + HTTP_SERVER.substr(4)
const defaultConfig = {
  port: 5280,
  serenityProxy: HTTP_SERVER,
  wsProxy: WS_SERVER,
}

const isProd = process.env.NODE_ENV === 'production'

export class DevServer {

  server: http.Server
  publicPath: string

  constructor(private config: { port: number, serenityProxy: string, wsProxy: string }) {
    this.initializeServer()
  }

  start(): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this.server.on('listening', () => {
        const serverUrl = `http://localhost:${this.config.port}${this.publicPath === '/' ? '' : this.publicPath}`
        logs.DEV_SERVER.info(`Server running at ${serverUrl}`)
        if (!isProd) {
          logs.DEV_SERVER.warn('Wait for valid webpack build...')
        }
        resolve()
      })

      this.server.on('error', reject)

      this.server.listen(this.config.port)
    })
  }

  stop(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.server.on('close', () => {
        logs.DEV_SERVER.info(`Server shutting down`)

        resolve()
      })

      this.server.on('error', reject)

      this.server.close()
    })
  }

  private initializeServer() {
    const app = express()

    const webpackConfigName = isProd ? 'webpack.prod' : 'webpack.dev'
    const webpackConfig = require(path.resolve(process.cwd(), webpackConfigName))
    this.publicPath = webpackConfig.output.publicPath

    if (isProd) {
      app.get('/', function (req, res) {
        res.redirect('/webconfig/portal')
      })

      logs.DEV_SERVER.info(`Starting PRODUCTION server for static content in dist`)
      app.use('/', express.static('dist'))
    } else {
      logs.DEV_SERVER.info(`Starting DEVELOPMENT server`)
      const compiler = webpack(webpackConfig)

      //// Serve Generated Code //////////////////////////////////////
      const webpackDevMiddleware = require('webpack-dev-middleware')(
        compiler, {
          noInfo: true,
          publicPath: webpackConfig.output.publicPath,
          silent: true,
          stats: 'errors-only',
        })
      app.use(webpackDevMiddleware)

      //// Service Hot Module Replacement Requests ///////////////////
      const webpackHotMiddleware = require('webpack-hot-middleware')(compiler)
      app.use(webpackHotMiddleware)
    }

    //// Serenity Proxy ////////////////////////////////////////////
    const wsProxyMiddleware = require('http-proxy-middleware')({
      target: this.config.wsProxy,
      changeOrigin: true,
      ws: true,
    })

    app.use('/eventsockets', wsProxyMiddleware)

    const httpProxyMiddleware = require('http-proxy-middleware')({
      target: this.config.serenityProxy,
      changeOrigin: true,
    })
    app.use('/system', httpProxyMiddleware)
    app.use('/mjpeg-pull', httpProxyMiddleware)
    app.use('/reset_password', httpProxyMiddleware)

    //// Default ///////////////////////////////////////////////////
    app.get('*', (req, res) => {
      res.status(404).send("Unhandled proxy request for '" + req.path + "'")
    })

    this.server = http.createServer(app)
    this.server.on('upgrade', wsProxyMiddleware.upgrade)
  }
}

export async function runDefaultDevServer() {
  initializeDefaultLogLevels()

  const devServer = new DevServer(defaultConfig)
  try {
    await devServer.start()
  } catch (error) {
    logs.DEV_SERVER.error('Error running dev server', error)
  }
}

if (require.main === module) {
  runDefaultDevServer()
}
