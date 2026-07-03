let handler = async (m, { conn, text, usedPrefix, command }) => {
    let [url, ...name] = text.split(' ')
    if (!url) return m.reply(`*Uso:* ${usedPrefix + command} <link> <nome app>\n\n*Esempio:* ${usedPrefix + command} https://google.com Google`)
    if (!url.startsWith('http')) return m.reply('Il link deve iniziare con http o https, MANNAGGIA!')

    let nomeApp = name.join(' ') || 'LaMiaApp'
    
    // AppsGeyser permette di precompilare via URL
    let linkGeneratore = `https://www.appsgeyser.com/create/?url=${encodeURIComponent(url)}&name=${encodeURIComponent(nomeApp)}`
    
    let messaggio = `*GENERATORE APK WEBVIEW*\n\n` +
                    `*Sito:* ${url}\n` +
                    `*Nome App:* ${nomeApp}\n\n` +
                    `*STEP 1:* Clicca qui -> ${linkGeneratore}\n` +
                    `*STEP 2:* Premi "Create App" sul sito\n` +
                    `*STEP 3:* Aspetta 2 minuti e scarica l'APK\n\n` +
                    `Il sito è gratis ma ci mette un po'. Se vuoi APK istantaneo devi pagare, MANNAGGIA!`

    await m.reply(messaggio)
}

handler.help = ['apk <url> <nome>']
handler.tags = ['tools']
handler.command = ['apk', 'webview']
handler.register = true

export default handler