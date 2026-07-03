// Cache del token DuckDuckGo per velocizzare
let duckToken = null
let tokenExpiry = 0

// fetchAI veloce con cache token + fallback
async function fetchAI(prompt) {
    // Se il token è scaduto o non c'è, lo richiedo
    if (!duckToken || Date.now() > tokenExpiry) {
        const statusRes = await fetch('https://duckduckgo.com/duckchat/v1/status', {
            headers: {
                'User-Agent': 'Mozilla/5.0',
                'x-vqd-accept': '1'
            },
            signal: AbortSignal.timeout(8000)
        }).catch(() => null)
        
        duckToken = statusRes?.headers.get('x-vqd-4')
        if (!duckToken) throw new Error('DuckDuckGo non risponde')
        tokenExpiry = Date.now() + 60000 // Token valido 1 minuto
    }

    const res = await fetch('https://duckduckgo.com/duckchat/v1/chat', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'Mozilla/5.0',
            'x-vqd-4': duckToken
        },
        body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [{ role: 'user', content: prompt }]
        }),
        signal: AbortSignal.timeout(20000)
    })

    if (!res.ok) {
        duckToken = null // Invalido il token se fallisce
        throw new Error(`DuckDuckGo ${res.status}`)
    }

    // Leggo lo stream in modo efficiente
    const text = await res.text()
    let risposta = ''
    for (const line of text.split('\n')) {
        if (line.startsWith('data: ') && line.length > 6) {
            const data = line.slice(6).trim()
            if (data === '[DONE]') break
            try {
                const json = JSON.parse(data)
                if (json.message) risposta += json.message
            } catch {}
        }
    }

    if (risposta.length < 2) throw new Error('Risposta vuota')
    return risposta.trim()
}

// Permessi gruppo senza crash
async function getPermessi(conn, m) {
    if (!m.isGroup) return { isGroup: false, isAdmin: false, isBotAdmin: false }
    try {
        const metadata = await conn.groupMetadata(m.chat)
        const user = metadata.participants.find(u => u.id === m.sender)
        const bot = metadata.participants.find(u => u.id === conn.user.jid)
        return {
            isGroup: true,
            isAdmin: !!user?.admin,
            isBotAdmin: !!bot?.admin
        }
    } catch {
        return { isGroup: true, isAdmin: false, isBotAdmin: false }
    }
}

let rispostaIA = async (m, { conn, text, isGroup, isAdmin, isBotAdmin }) => {
    if (!text) return m.reply('[BOT] Scrivi qualcosa dopo .bot, dannazione!')

    // Easter egg
    if (text.toLowerCase() === 'sono riley') {
        const frasi = [
            'OH FINALMENTE! Il capo! Che si fa, boss?',
            'RILEY! Comandi?',
            'ECCOLO! Dimmi cosa devo spaccare!',
            'Maledizione, sei tu! Sono pronto!'
        ]
        return m.reply('[BOT] ' + frasi[Math.random() * frasi.length | 0])
    }

    // Comando info gruppo
    const matchInfo = text.match(/^modifica (?:la )?info del gruppo scrivendo (.+)/i)
    if (matchInfo) {
        if (!isGroup) return m.reply('[BOT] Solo nei gruppi, idiota!')
        if (!isAdmin) return m.reply('[BOT] Solo gli admin possono!')
        if (!isBotAdmin) return m.reply('[BOT] Fammmi admin prima!')
        
        const nuovaInfo = matchInfo[1].trim()
        if (nuovaInfo.length > 512) return m.reply('[BOT] Max 512 caratteri!')
        
        await conn.groupUpdateDescription(m.chat, nuovaInfo).catch(() => {
            throw new Error('WhatsApp mi blocca')
        })
        return m.reply('[BOT] Fatto. Info cambiata.')
    }

    await conn.sendPresenceUpdate('composing', m.chat).catch(() => {})

    try {
        const prompt = `Sei un assistente incazzato. Rispondi SOLO in italiano. Tono sarcastico e aggressivo. Imprecazioni leggere: merda, dannazione. Sii breve e diretto. Domanda: ${text}`
        
        let risposta = await fetchAI(prompt)
        
        // Filtro anti-inglese
        if (/^I |^As an AI|^I'm sorry/i.test(risposta)) {
            risposta = 'PARLO SOLO ITALIANO! Riscrivi in italiano!'
        }
        
        await m.reply('[BOT] ' + risposta)

    } catch (e) {
        console.log('[BOT] Errore:', e.message)
        await m.reply('[BOT] È andato tutto a merda: ' + e.message)
    }
}

let handler = async (m, { conn, text }) => {
    const permessi = await getPermessi(conn, m)
    await rispostaIA(m, { conn, text, ...permessi })
}
handler.command = /^bot$/i
handler.help = ['bot <domanda>']
handler.tags = ['tools']

// Risponde solo quando quoti [BOT]
handler.before = async (m, { conn }) => {
    if (m.isBaileys || m.fromMe || !m.text || /^[.!#/]/.test(m.text)) return
    if (m.quoted?.fromMe && m.quoted.text?.startsWith('[BOT]')) {
        const permessi = await getPermessi(conn, m)
        await rispostaIA(m, { conn, text: m.text, ...permessi })
    }
}

export default handler