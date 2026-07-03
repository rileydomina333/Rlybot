// fetchAI con DuckDuckGo - gratis, senza key, senza rate limit
async function fetchAI(prompt) {
    try {
        // 1. Prendo il token anonimo di DuckDuckGo
        const statusRes = await fetch('https://duckduckgo.com/duckchat/v1/status', {
            headers: { 'x-vqd-accept': '1' }
        })
        const token = statusRes.headers.get('x-vqd-4')
        if (!token) throw new Error('Token DuckDuckGo non trovato')

        // 2. Chiedo la risposta all'AI
        const res = await fetch('https://duckduckgo.com/duckchat/v1/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-vqd-4': token
            },
            body: JSON.stringify({
                model: 'gpt-4o-mini',
                messages: [{ role: 'user', content: prompt }]
            }),
            signal: AbortSignal.timeout(20000)
        })

        if (!res.ok) throw new Error(`Errore DuckDuckGo ${res.status}`)

        // DuckDuckGo manda lo stream, devo leggerlo tutto
        const reader = res.body.getReader()
        const decoder = new TextDecoder()
        let risposta = ''
        
        while (true) {
            const { done, value } = await reader.read()
            if (done) break
            const chunk = decoder.decode(value)
            const lines = chunk.split('\n')
            for (const line of lines) {
                if (line.startsWith('data: ')) {
                    const data = line.slice(6)
                    if (data === '[DONE]') break
                    try {
                        const json = JSON.parse(data)
                        if (json.message) risposta += json.message
                    } catch {}
                }
            }
        }

        if (!risposta || risposta.length < 3) throw new Error('Risposta vuota da DuckDuckGo')
        return risposta.trim()

    } catch (e) {
        if (e.name === 'TimeoutError') throw new Error('Timeout: DuckDuckGo lenta')
        throw e
    }
}

async function getPermessi(conn, m) {
    let data = { isGroup: m.isGroup, isAdmin: false, isBotAdmin: false }
    if (!m.isGroup) return data
    try {
        const metadata = await conn.groupMetadata(m.chat).catch(() => null)
        if (!metadata?.participants) return data
        const user = metadata.participants.find(u => u.id === m.sender)
        const bot = metadata.participants.find(u => u.id === conn.user?.jid || u.id === conn.user?.id)
        data.isAdmin = !!user?.admin
        data.isBotAdmin = !!bot?.admin
        return data
    } catch (e) {
        console.log('[BOT] Errore permessi:', e.message)
        return data
    }
}

let rispostaIA = async (m, { conn, text, isGroup, isAdmin, isBotAdmin }) => {
    if (!text) return m.reply('[BOT] CHE MERDA VUOI?! Scrivi dopo.bot!')

    // Easter egg
    if (text.toLowerCase().trim() === 'sono riley') {
        const frasi = [
            'OH FINALMENTE! Il capo! Che si fa, boss?',
            'RILEY! Ma che fine avevi fatto, dannazione?! Comandi?',
            'ECCOLO! Il mio creatore! Dimmi cosa devo spaccare!',
            'Maledizione, sei tu! Sono pronto agli ordini!'
        ]
        return m.reply('[BOT] ' + frasi[Math.floor(Math.random() * frasi.length)])
    }

    // Comando modifica info gruppo
    const regexInfo = /^modifica (?:la )?info del gruppo scrivendo (.+)/i
    const matchInfo = text.match(regexInfo)
    if (matchInfo) {
        if (!isGroup) return m.reply('[BOT] IDIOTA! Questo comando va in un gruppo!')
        if (!isAdmin) return m.reply('[BOT] MA CHI CAZZO SEI?! Solo admin toccano la info!')
        if (!isBotAdmin) return m.reply('[BOT] SONO SENZA POTERI! Fammmi admin!')

        const nuovaInfo = matchInfo[1].trim()
        if (nuovaInfo.length > 512) return m.reply('[BOT] TROPPO LUNGA! Max 512 caratteri!')

        try {
            await conn.groupUpdateDescription(m.chat, nuovaInfo)
            return m.reply('[BOT] FATTO! Info del gruppo cambiata.')
        } catch (e) {
            return m.reply('[BOT] WHATSAPP MI BLOCCA! Controlla che sono admin davvero.')
        }
    }

    await conn.sendPresenceUpdate('composing', m.chat).catch(() => {})

    try {
        const prompt = `Sei un assistente incazzato e scurrile. REGOLA ASSOLUTA: rispondi SOLO in italiano. Vietato inglese. Tono aggressivo e sarcastico. Imprecazioni leggere: "merda", "dannazione", "maledizione". Sii breve. Non insultare l'utente. Domanda: ${text}`

        let risposta = await fetchAI(prompt)

        // Filtro anti-inglese forzato
        if (/I cannot|I don't know|I'm sorry|As an AI|I'm an AI/i.test(risposta)) {
            risposta = 'PARLO SOLO ITALIANO, DANNATAMENTE! Riscrivi in italiano!'
        }

        await m.reply('[BOT] ' + risposta)

    } catch (e) {
        console.log('[BOT] Errore:', e.message)
        m.reply('[BOT] È ANDATO TUTTO A MERDA! Errore DuckDuckGo: ' + e.message)
    }
}

let handler = async (m, { conn, text }) => {
    const permessi = await getPermessi(conn, m)
    await rispostaIA(m, { conn, text, ...permessi })
}
handler.command = /^bot$/i
handler.tags = ['tools']
handler.help = ['bot <domanda>']

// Risponde solo se quoti un messaggio del bot che inizia con [BOT]
handler.before = async function (m, { conn }) {
    try {
        if (m.isBaileys || m.fromMe || !m.text || /^[.!#/]/.test(m.text)) return
        if (m.quoted?.fromMe && m.quoted.text?.startsWith('[BOT]')) {
            const permessi = await getPermessi(conn, m)
            await rispostaIA(m, { conn, text: m.text, ...permessi })
        }
    } catch (e) {
        console.log('[BOT] Errore before:', e.message)
    }
}

export default handler