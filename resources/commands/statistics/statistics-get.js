const {ApplicationCommandType, ApplicationCommandOptionType, EmbedBuilder} = require('discord.js')
const {query} = require('../../database')
const config = require('../../../config.json')
const { request } = require('undici')
const {createCanvas, Image, loadImage} = require('@napi-rs/canvas')

module.exports = {
    name: 'statistics-get',
    description: '獲得用戶的統計數據',
    type: ApplicationCommandType.ChatInput,
    options: [
        {
            name: 'user',
            description: '使用者',
            type: ApplicationCommandOptionType.User
        }

    ],
    execute: async (interaction) => {
        if (!interaction.inGuild()) return
        await interaction.deferReply()

        const user = interaction.options?.getUser('user') || interaction.user
        
        if (user.bot||user.system) return await interaction.editReply({
            embeds: [
                new EmbedBuilder()
                .setColor(0xDC0000)
                .setTitle("查詢失敗")
                .setDescription(`你不能對此類型的使用者進行此操作!`)
            ]
        })

        let userStatistics = (await query('select * from user_statistics where user_id = ?', [user.id]))[0] || {messages_sent: 0, voice_time: 0}

        let day     = Math.floor(userStatistics.voice_time / 1440) || 0
        let hour    = Math.floor(userStatistics.voice_time/60) % 24 || 0
        let minute  = (userStatistics.voice_time % 60) || 0

        let embed = new EmbedBuilder()
        .setTitle("統計數據查詢")
        .setDescription(`${interaction.user.id==user.id ? `${interaction.user}, 以下是您的統計數據` : `以下是${user}的統計數據`}`)
        .setColor(0x00DC00)
        .setFields(
            {
                name: "訊息發送數", value: userStatistics.messages_sent.toLocaleString(), inline: true
            },

            {
                name: "語音時間", value: `${`${day?`${day}天`:``}${hour?`${hour}時`:``}${minute?`${minute}分`:`0分`}`}`, inline: true
            }
        )
        .setFooter({ text: "統計查詢系統Beta" })

        interaction.editReply({ embeds: [embed] })
    }
}
