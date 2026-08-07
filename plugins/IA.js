import axios from 'axios'

let ON = false

let handler = async (m, {conn}) => {
    let text = m.text

    if (text === '.bot on') {
        ON = true
        return m.reply('✅ AI ATTIVA')
    }
    if (text === '.bot off') {
        ON = false
        return m.reply('❌ AI DISATTIVATA')
    }
    if (text.startsWith('.bot ')) {
        if (!ON) return
        let domanda = text.replace('.bot ', '')
        let risposta = await ia(domanda)
        return m.reply(risposta)
    }
}

handler.all = async (m) => {
    if (!ON) return
    if (m.fromMe) return
    if (m.text.startsWith('.')) return

    await conn.sendPresenceUpdate('composing', m.chat)
    let risposta = await ia(m.text)
    m.reply(risposta)
}

handler.command = /^bot$/i
export default handler

async function ia(prompt) {
    try {
        let {data} = await axios.get(`https://api.adviceslip.com/advice`) // TEST CONNESSIONE
        console.log("Connessione OK")

        let res = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
            model: "meta-llama/llama-3.2-3b-instruct:free",
            messages: [{role: "user", content: prompt}]
        }, {
            headers: {'Authorization': 'Bearer '},
            timeout: 20000
        })
        return res.data.choices[0].message.content
    } catch (e) {
        console.log("ERRORE DETTAGLIO:", e.message)
        return "Errore. Controlla internet"
    }
}