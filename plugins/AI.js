import 'dotenv/config' // <--- deve stare per primo
import axios from 'axios'

const GROQ_KEY = process.env.GROQ_KEY

let handler = async (m) => {
    let domanda = m.text.slice(5).trim()
    if(!domanda) return m.reply('Esempio:.ask scrivimi una ricetta')
    if(!GROQ_KEY) return m.reply('❌ Key non trovata. Controlla il file .env')

    await conn.sendMessage(m.chat, {text: '_RLY AI sta pensando..._'}, {quoted: m})

    try {
        let {data} = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
            model: "llama-3.1-8b-instant",
            messages: [
                {role: "system", content: "Sei RLY AI, un assistente italiano utile e diretto."},
                {role: "user", content: domanda}
            ],
            max_tokens: 600
        }, {
            headers: {'Authorization': `Bearer ${GROQ_KEY}`}
        })
        
        let risposta = data.choices[0].message.content
        m.reply(`🤖 *RLY ASK - Groq*\n\n${risposta}`)
        
    } catch(e) {
        console.log(e)
        m.reply('Errore API. Key sbagliata o crediti finiti.')
    }
}

handler.command = /^ask$/i
handler.help = ['ask <domanda>']
handler.tags = ['ai']
export default handler