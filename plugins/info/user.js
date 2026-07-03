import fetch from 'node-fetch'

const siti = {
  'Instagram': 'https://instagram.com/{}',
  'TikTok': 'https://tiktok.com/@{}',
  'Twitter/X': 'https://x.com/{}',
  'GitHub': 'https://github.com/{}',
  'Reddit': 'https://reddit.com/user/{}',
  'Twitch': 'https://twitch.tv/{}',
  'YouTube': 'https://youtube.com/@{}',
  'Pinterest': 'https://pinterest.com/{}',
  'Telegram': 'https://t.me/{}',
  'Spotify': 'https://open.spotify.com/user/{}',
  'Steam': 'https://steamcommunity.com/id/{}',
  'Vimeo': 'https://vimeo.com/{}',
  'SoundCloud': 'https://soundcloud.com/{}',
  'Medium': 'https://medium.com/@{}',
  'DeviantArt': 'https://{}.deviantart.com',
  'Tumblr': 'https://{}.tumblr.com',
  'Facebook': 'https://facebook.com/{}',
  'Linkedin': 'https://linkedin.com/in/{}',
  'Snapchat': 'https://snapchat.com/add/{}',
  'Roblox': 'https://roblox.com/users/profile?username={}'
}

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) return m.reply(`*Uso:* ${usedPrefix + command} <username>\n\n*Esempio:* ${usedPrefix + command} mariorossi123`)
    
    let username = text.trim().toLowerCase().replace(/ /g, '')
    if (!/^[a-z0-9._-]+$/.test(username)) return m.reply('Username può contenere solo lettere, numeri, punto, trattino. MANNAGGIA!')
    if (username.length < 3) return m.reply('Username troppo corto, minimo 3 caratteri.')
    
    await m.reply(`Cerco "${username}" su ${Object.keys(siti).length} piattaforme...\nCi metto 10 secondi`)
    
    let trovati = []
    let nonTrovati = 0
    
    // Controllo parallelo per velocizzare
    await Promise.all(Object.entries(siti).map(async ([nome, url]) => {
        try {
            let urlCheck = url.replace('{}', username)
            let res = await fetch(urlCheck, { 
                method: 'HEAD', 
                timeout: 4000,
                headers: { 'User-Agent': 'Mozilla/5.0' }
            })
            // Molti siti danno 200 anche se non esiste, ma con redirect. Controllo base.
            if (res.status === 200 && !res.url.includes('/404') && !res.url.includes('/login')) {
                trovati.push(`✅ *${nome}*: ${urlCheck}`)
            } else {
                nonTrovati++
            }
        } catch {
            nonTrovati++
        }
    }))
    
    if (!trovati.length) {
        return m.reply(`❌ *NESSUN RISULTATO*\n\nL'username "${username}" non risulta registrato su nessuna delle piattaforme controllate.\n\n_Ovviamente controlla solo profili pubblici._`)
    }
    
    let txt = `*RISULTATI PER: ${username}*\n\n` +
              `Trovato su ${trovati.length}/${Object.keys(siti).length} piattaforme:\n\n` +
              `${trovati.join('\n')}\n\n` +
              `_Nota: Dice solo se l'URL esiste. Non garantisce che sia la stessa persona e non accede a contenuti privati._`
    
    m.reply(txt.trim())
}

handler.help = ['user <username>']
handler.tags = ['tools', 'osint']
handler.command = ['user', 'usearch', 'userfind']
handler.limit = true
handler.register = true

export default handler