const fs = require('fs')
const path = require('path')

const plugins = []

const pluginFolder = path.join(__dirname, 'plugins')

fs.readdirSync(pluginFolder).forEach(file => {
  const plugin = require(path.join(pluginFolder, file))
  plugins.push(plugin)
})

async function handleMessage(sock, msg) {
  const body = msg.message?.conversation || ''

  if (!body.startsWith('.')) return

  const args = body.slice(1).trim().split(/ +/)
  const command = args.shift().toLowerCase()

  const plugin = plugins.find(p =>
    p.command.includes(command)
  )

  if (!plugin) return

  plugin.execute({
    sock,
    msg,
    args
  })
}

module.exports = handleMessage
