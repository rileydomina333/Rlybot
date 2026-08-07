import axios from 'axios'

let handler = async (m) => {
    let query = m.text.slice(11).trim()
    if(!query) return m.reply('Esempio:.pinterest sfondo anime')

    let url = `https://api.duckgo.com/i.js?l=it-it&o=json&q=${encodeURIComponent(query)}`
    let {data} = await axios.get(url, {headers: {'User-Agent': 'RlyBot/1.0'}})

    let img = data.results[0].image
    await conn.sendMessage(m.chat, {image: {url: img}, caption: `*${query}*`}, {quoted: m})
}
handler.command = /^pinterest$/i
export default handler