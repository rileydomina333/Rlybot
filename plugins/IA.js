// 4 API gratis senza key. Se muore una, passa alla prossima in 2 secondi
const API_LIST = [
    {
        name: 'Blackbox',
        fetch: async (prompt) => {
            const res = await fetch('https://www.blackbox.ai/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: [{ role: 'user', content: prompt, id: 'bot' }],
                    id: 'bot',
                    previewToken: null,
                    userId: null,
                    codeModelMode: true,
                    agentMode: {},
                    trendingAgentMode: {},
                    isMicMode: false,
                    isChromeExt: false,
                    githubToken: null
                }),
                signal: AbortSignal.timeout(12000)
            })
            if (!res.ok) throw new Error('Blackbox down')
            return await res.text()
        }
    },
    {
        name: 'YouChat',
        fetch: async (prompt) => {
            const res = await fetch('https://you.com/api/streamingSearch', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    q: prompt,
                    page: 1,
                    count: 10,
                    safeSearch: 'Moderate',
                    onShoppingPage: false,
                    mkt: 'it-IT',
                    responseFilter: 'WebPages,Translations,TimeZone,Computation,RelatedSearches',
                    domain: 'youchat',
                    queryTraceId: null,
                    chat: []
                }),
                signal: AbortSignal.timeout(12000)
            })
            if (!res.ok) throw new Error('You down')
            const text = await res.text()
            // You.com manda eventi SSE, prendo solo la risposta
            const match = text.match(/"youChatToken":"(.*?)"/g)
            if (!match) throw new Error('You vuoto')
            return match.map(m => m.slice(16, -1).replace(/\\n/g, '\n')).join('')
        }
    },
    {
        name: 'Phind',
        fetch: async (prompt) => {
            const res = await fetch('https://api.phind.com/api/infer/answer', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    question: prompt,
                    options: { skill: 'intermediate', date: new Date().toISOString().split('T')[0] }
                }),
                signal: AbortSignal.timeout(12000)
            })
            if (!res.ok) throw new Error('Phind down')
            const text = await res.text()
            const lines = text.split('\r\n').filter(l => l.startsWith('data: '))
            let out = ''
            for (const line of lines) {
                const data = line.slice(6)
                if (data === '[DONE]') break
                try { out += JSON.parse(data).choices?.[0]?.delta?.content || '' } catch {}
            }
            if (!out) throw new Error('Phind vuoto')
            return out
        }
    },
    {
        name: 'Pollinations',
        fetch: async (prompt) => {
            const res = await fetch(`https://text.pollinations.ai/${encodeURIComponent(prompt)}`, {
                signal: AbortSignal.timeout(15000)
            })
            if (res.status === 429) throw new Error('Pollinations coda')
            if (!res.ok) throw new Error('Pollinations down')
            const txt = await res.text()
            if (!txt) throw new Error('Pollinations vuoto')
            return txt
        }
    }
]

async function fetchAI(prompt) {
    let errori = []
    for (const api of API_LIST) {
        try {
            const res = await api.fetch(prompt)
            if (res && res.length > 5) {
                console.log(`[BOT] Uso ${api.name}`)
                return res.trim()
            }
        } catch (e) {
            errori.push(`${api.name}: ${e.message}`)
            continue
        }
    }
    throw new Error('TUTTE MORTE. ' + errori.join(' | '))
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
        if (/^I |^As an AI|^I'm sorry/i.test(risposta)) risposta = 'PARLO SOLO ITALIANO!'
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