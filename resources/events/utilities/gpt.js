const {Events, Client, EmbedBuilder, Message} = require('discord.js')
const config = require('../../../config.json')
const client = require('../../../main')
const OpenAI = require('openai')

/**
* @param {Client} client
*/

module.exports = {
    name: Events.MessageCreate,
    execute: async (message) => {

        if (message.author.bot||message.author.system)  return
        if (!message.content.startsWith('!gpt'))        return
        if (message.channelId!=config.channel.gpt)      return

        let parts = message.content.split(/ (.+)/)
        if (!parts[1]) return

        let content = parts[1]

        const openAI = new OpenAI({
            apiKey: ''
        })

        const response = await openAI.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "user", 
                    content: `
                         給GPT的指示:
                        - 使用者多數是台灣人，預設使用繁體中文回覆。
                        - 如果偵測到使用者使用的是其他語言，請你也使用該語言進行回復。
                        - 這個 API 連接到 Discord，回應時可使用 Discord 支持的 Markdown 語法。使用標題、加粗、斜體、代碼區塊等簡單的格式來增強可讀性。
                        - 你可以適度加入幽默感，偶爾開個小玩笑，但保持專業，不要過於僵硬。讓回應聽起來更貼近現實對話。
                        - 當遇到涉及政治或其他敏感話題時，請保持中立，簡短回應。若不方便回答，可以輕描淡寫，並轉移話題。
                        - 以下是使用者的訊息內容:
                        ${content}
                    `
                }
            ],
          });
          if (response) message.reply(response.choices[0].message.content)
    }
}