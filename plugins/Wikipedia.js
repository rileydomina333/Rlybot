import axios from 'axios'

let handler = async (m) => {
    let cerca = m.text.slice(6).trim()
    if(!cerca) return m.reply('Esempio:.wikipedia Palermo')
    
    let {data} = await axios.get(`https://it.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(cerca)}`)
    m.reply(`📚 *${data.title}*\n\n${data.extract}\n\n${data.content_urls.desktop.page}`)
}
handler.command = /^wikipedia$/i
export default handler