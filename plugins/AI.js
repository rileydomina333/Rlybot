import axios from 'axios'

let handler = async (m) => {
    let domanda = m.text.slice(5).trim()
    if(!domanda) return m.reply('Esempio:.ask come si fa la pasta alla norma\n.ask spiegami cos’è il doxxing')

    m.reply('_RLY AI sta pensando alla risposta..._')

    try {
        // API free senza key
        let url = `https://text.pollinations.ai/${encodeURIComponent(domanda)}?model=llamav3`
        let {data} = await axios.get(url, {timeout: 15000})
        
        if(!data) throw new Error()
        
        m.reply(`🤖 *RLY ASK*\n\n${data}\n\n_Domanda: ${domanda}_`)
        
    } catch(e) {
        m.reply('Errore, riprova tra 10s. Le API free a volte sono lente.')
    }
}

handler.command = /^ask$/i
handler.help = ['ask <domanda>']
handler.tags = ['ai']
export default handler