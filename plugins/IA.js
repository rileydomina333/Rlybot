// API 2026 senza key e senza autenticazione
const API_LIST = [
    {
        name: 'HuggingFace',
        fetch: async (prompt) => {
            const res = await fetch('https://api-inference.huggingface.co/models/meta-llama/Meta-Llama-3-8B-Instruct', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    inputs: `<|begin_of_text|><|start_header_id|>system<|end_header_id|>\nSei un assistente incazzato. Rispondi SOLO in italiano. Tono sarcastico. Imprecazioni: merda, dannazione. Sii breve.<|eot_id|><|start_header_id|>user<|end_header_id|>\n${prompt}<|eot_id|><|start_header_id|>assistant<|end_header_id|>\n`,
                    parameters: { max_new_tokens: 200, temperature: 0.7, return_full_text: false }
                }),
                signal: AbortSignal.timeout(20000)
            })
            if (!res.ok) throw new Error(`HF ${res.status}`)
            const json = await res.json()
            const out = json[0]?.generated_text || ''
            if (!out) throw new Error('HF vuoto')
            return out
        }
    },
    {
        name: 'GroqFree',
        fetch: async (prompt) => {
            const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer gsk_free_tier' // Key pubblica free
                },
                body: JSON.stringify({
                    model: 'llama-3.1-8b-instant',
                    messages: [{ role: 'user', content: prompt }],
                    max_tokens: 200,
                    temperature: 0.7
                }),
                signal: AbortSignal.timeout(15000)
            })
            if (!res.ok) throw new Error(`Groq ${res.status}`)
            const json = await res.json()
            return json.choices?.[0]?.message?.content || ''
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
            return await res.text()
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
                return res.trim().replace(/<\|eot_id\|>$/g, '')
            }
        } catch (e) {
            errori.push(`${api.name}: ${e.message}`)
            continue
        }
    }
    throw new Error('Tutte morte: ' + errori.join(' | '))
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