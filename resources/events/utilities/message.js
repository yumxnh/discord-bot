const {Events, Client, EmbedBuilder, Message} = require('discord.js')
const config = require('../../../config.json')
const client = require('../../../main')

/**
* @param {Client} client
*/

module.exports = {
    name: Events.MessageCreate,
    execute: async (msg) => {
        // if (msg.content.startsWith('!msg')) {
        //     let time = 20
        //     for (let i=0;i<time;i++) {
        //     setTimeout(() => {
        //         const channel = client.channels.cache.get('')
        //         channel.send(`# <@805054956809617460>`)
        //     }, 1000)
        //     }
        // }
    }
}