// Lista API in ordine di velocità. Se una fallisce, prova la prossima
const API_LIST = [
    {
        name: 'DuckDuckGo',
        fetch: async (prompt) => {
            const tokenRes = await fetch('https://duckduckgo.com/duckchat/v1/status', {
                headers: { 'User-Agent': 'Mozilla/5.0', 'x-vqd-accept': '1' },
                signal: AbortSignal.timeout(5000)
            })
            const token = tokenRes.headers.get('x-vqd-4')
            if (!token) throw new Error('No token')

            const res = await fetch('https://duckduckgo.com/duckchat/v1/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'x-vqd-4': token, 'User-Agent': 'Mozilla/5.0' },
                body: JSON.stringify({ model: 'gpt-4o-mini', messages: [{ role: 'user', content: prompt }] }),
                signal: AbortSignal.timeout(15000)
            })
            if (!res.ok) throw new Error('DDG down')

            const text = await res.text()
            let out = ''
            for (const line of text.split('\n')) {
                if (line.startsWith('data: ') && line.length > 6) {
                    const data = line.slice(6).trim()
                    if (data === '[DONE]') break
                    try { out += JSON.parse(data).message || '' } catch {}
                }
            }
            if (!out) throw new Error('DDG vuoto')
            return out
        }
    },
    {
        name: 'Pollinations',
        fetch: async (prompt) => {
            const res = await fetch(`https://text.pollinations.ai/${encodeURIComponent(prompt)}`, {
                signal: AbortSignal.timeout(12000)
            })
            if (res.status === 429) throw new Error('Pollinations coda')
            if (!res.ok) throw new Error('Pollinations down')
            const txt = await res.text()
            if (!txt) throw new Error('Pollinations vuoto')
            return txt
        }
    },
    {
        name: 'LlamaFree',
        fetch: async (prompt) => {
            const res = await fetch('https://api.deepinfra.com/v1/openai/chat/completions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: 'meta-llama/Meta-Llama-3-8B-Instruct',
                    messages: [{ role: 'user', content: prompt }],
                    stream: false
                }),
                signal: AbortSignal.timeout(15000)
            })
            if (!res.ok) throw new Error('Llama down')
            const json = await res.json()
            return json.choices?.[0]?.message?.content || ''
        }
    }
]

// fetchAI con fallback automatico
async function fetchAI(prompt) {
    let ultimoErrore = ''
    for (const api of API_LIST) {
        try {
            const res = await api.fetch(prompt)
            if (res && res.length > 3) return res.trim()
        } catch (e) {
            ultimoErrore = `${api.name}: ${e.message}`
            console.log(`[BOT] ${ultimoErrore}`)
            continue // Prova la prossima API
        }
    }
    throw new Error('Tutte le API sono morte. ' + ultimoErrore)
}

async function getPermessi(conn, m) {
    if (!m.isGroup) return { isGroup: false, isAdmin: false, isBotAdmin: false }
    try {
        const metadata = await conn.groupMetadata(m.chat)
        const user = metadata.participants.find(u => u.id === m.sender)
        const bot = metadata.participants.find(u => u.id === conn.user.jid)
        return { isGroup: true, isAdmin:!!user?.admin, isBotAdmin:!!bot?.admin }
    } catch {
        return { isGroup: true, isAdmin: false, isBotAdmin: false }
    }
}

let rispostaIA = async (m, { conn, text, isGroup, isAdmin, isBotAdmin }) => {
    if (!text) return m.reply('[BOT] Scrivi qualcosa dopo.bot!')

    if (text.toLowerCase() === 'sono riley') {
        const frasi = ['OH FINALMENTE! Che si fa, boss?', 'RILEY! Comandi?', 'ECCOLO! Dimmi cosa spaccare!', 'Sono pronto!']
        return m.reply('[BOT] ' + frasi[Math.random() * frasi.length | 0])
    }

    const matchInfo = text.match(/^modifica (?:la )?info del gruppo scrivendo (.+)/i)
    if (matchInfo) {
        if (!isGroup) return m.reply('[BOT] Solo nei gruppi!')
        if (!isAdmin) return m.reply('[BOT] Solo admin!')
        if (!isBotAdmin) return m.reply('[BOT] Fammmi admin!')
        const nuovaInfo = matchInfo[1].trim()
        if (nuovaInfo.length > 512) return m.reply('[BOT] Max 512 caratteri!')
        await conn.groupUpdateDescription(m.chat, nuovaInfo).catch(() => { throw new Error('WhatsApp mi blocca') })
        return m.reply('[BOT] Fatto.')
    }

    await conn.sendPresenceUpdate('composing', m.chat).catch(() => {})

    try {
        const prompt = `Sei un assistente incazzato. Rispondi SOLO in italiano. Tono sarcastico. Imprecazioni: merda, dannazione. Sii breve. Domanda: ${text}`
        let risposta = await fetchAI(prompt)
        if (/^I |^As an AI/i.test(risposta)) risposta = 'PARLO SOLO ITALIANO!'
        await m.reply('[BOT] ' + risposta)
    } catch (e) {
        await m.reply('[BOT] È andato tutto a merda: ' + e.message)
    }
}

let handler = async (m, { conn, text }) => {
    const permessi = await getPermessi(conn, m)
    await rispostaIA(m, { conn, text,...permessi })
}
handler.command = /^bot$/i
handler.help = ['bot <domanda>']
handler.tags = ['tools']

handler.before = async (m, { conn }) => {
    if (m.isBaileys || m.fromMe ||!m.text || /^[.!#/]/.test(m.text)) return
    if (m.quoted?.fromMe && m.quoted.text?.startsWith('[BOT]')) {
        const permessi = await getPermessi(conn, m)
        await rispostaIA(m, { conn, text: m.text,...permessi })
    }
}

export default handler