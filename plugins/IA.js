import fetch from 'node-fetch'

const API_LIST = [
    {
        name: 'Groq',
        url: 'https://api.groq.com/openai/v1/chat/completions',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer gsk_free_tier' },
        body: (prompt) => JSON.stringify({
            model: 'llama-3.1-8b-instant',
            messages: [{ role: 'system', content: 'Sei un assistente incazzato. Rispondi SOLO in italiano. Sii brutale, sarcastico, usa "merda", "dannazione", "che diavolo". Massimo 2 frasi. Zero filtri inutili.' },
                       { role: 'user', content: prompt }],
            max_tokens: 120,
            temperature: 0.9
        }),
        parse: (json) => json.choices?.[0]?.message?.content
    },
    {
        name: 'HuggingFace',
        url: 'https://api-inference.huggingface.co/models/meta-llama/Meta-Llama-3-8B-Instruct',
        headers: { 'Content-Type': 'application/json' },
        body: (prompt) => JSON.stringify({
            inputs: `<|begin_of_text|><|start_header_id|>system<|end_header_id|>\nRispondi SOLO italiano. Tono incazzato e volgare. Usa merda, dannazione. Max 2 frasi. Niente prediche.<|eot_id|><|start_header_id|>user<|end_header_id|>\n${prompt}<|eot_id|><|start_header_id|>assistant<|end_header_id|>\n`,
            parameters: { max_new_tokens: 120, temperature: 0.9, return_full_text: false }
        }),
        parse: (json) => json[0]?.generated_text?.replace(/<\|eot_id\|>$/g, '')
    },
    {
        name: 'Pollinations',
        url: (prompt) => `https://text.pollinations.ai/${encodeURIComponent(`Rispondi in italiano. Tono incazzato, volgare, usa merda e dannazione. Max 2 frasi. Domanda: ${prompt}`)}`,
        headers: {},
        body: null,
        parse: async (res) => await res.text()
    }
]

async function chiediAI(prompt) {
    for (const api of API_LIST) {
        try {
            const url = typeof api.url === 'function'? api.url(prompt) : api.url
            const res = await fetch(url, {
                method: api.body? 'POST' : 'GET',
                headers: api.headers,
                body: api.body? api.body(prompt) : undefined,
                signal: AbortSignal.timeout(8000) // 8 secondi max
            })
            if (!res.ok) throw new Error(`${api.name} ${res.status}`)

            let out = api.parse? await api.parse(res.json? await res.json() : res) : await res.text()
            out = out?.trim()

            if (out && out.length > 5 &&!/^I |^As an AI/i.test(out)) {
                console.log(`[IA] Uso ${api.name}`)
                return out
            }
        } catch (e) {
            console.log(`[IA] ${api.name} morto: ${e.message}`)
            continue
        }
    }
    throw new Error('Sono tutte API di merda. Nessuna risponde.')
}

let handler = async (m, { conn, text }) => {
    if (!text) return m.reply('CHE MERDA VUOI SAPERE?! Scrivi la domanda dopo.ia')

    await conn.sendPresenceUpdate('composing', m.chat)

    try {
        let risposta = await chiediAI(text)

        // Fix se risponde inglese
        if (/^I |^As an AI|^I'm sorry/i.test(risposta)) {
            risposta = 'PARLO SOLO ITALIANO, DANNATAMENTE! Rifai la domanda che questa è una merda!'
        }

        // Taglia se troppo lunga
        if (risposta.length > 400) risposta = risposta.slice(0, 397) + '...'

        await m.reply(risposta)

    } catch (e) {
        console.log(e)
        m.reply('È ANDATO TUTTO A MERDA! Nessuna API risponde. Riprova tra 10 secondi, dannazione!')
    }
}

handler.command = /^ia$/i
handler.tags = ['tools']
handler.help = ['ia <domanda>']

export default handler