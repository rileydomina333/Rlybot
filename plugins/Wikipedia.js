import axios from 'axios'

let handler = async (m) => {
    let cerca = m.text.slice(6).trim()
    if(!cerca) return m.reply('Esempio:.wiki Palermo')
    
    try {
        let {data} = await axios.get(`https://it.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(cerca)}`, {
            headers: {
                'User-Agent': 'RlyBot/1.0 (https://github.com/tuo_nome; bot per whatsapp)' // <--- AGGIUNGI QUESTO
            },
            timeout: 10000
        })
        
        m.reply(`📚 *${data.title}*\n\n${data.extract}\n\n${data.content_urls.desktop.page}`)
        
    } catch(e) {
        if(e.response?.status === 404) return m.reply('Pagina non trovata su Wikipedia')
        m.reply('Errore nel cercare su Wikipedia')
    }
}
handler.command = /^wikipedia$/i
export default handler