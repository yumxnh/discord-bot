const {ApplicationCommandType, ApplicationCommandOptionType, EmbedBuilder, PermissionFlagsBits, PermissionsBitField} = require('discord.js')
const wait = require('node:timers/promises').setTimeout

module.exports = {
    name: 'clear',
    description: '刪除指定數量的訊息',
    type: ApplicationCommandType.ChatInput,
    default_member_permissions: PermissionFlagsBits.Administrator,
    cooldown: 5,
    devs_only: false,
    
    options: [
        {
            name: 'amount',
            description: '刪除的數量',
            type: ApplicationCommandOptionType.Integer,
            min_value: 1,
            max_value: 100,
            required: true
        },
        
        {
            name: 'member',
            description: '刪除這個成員的訊息',
            type: ApplicationCommandOptionType.User
        }
    ],
    execute: async (interaction) => {
        if (!interaction.inGuild()) return

        const count = interaction.options.getInteger('amount')
        const user = interaction.options.getUser('member')
        
        const limit = user ? 100 : count
        let fetched = await interaction.channel.messages.fetch({ limit: limit })
        if (fetched.has(interaction.id)) fetched.delete(interaction.id)
        if (user) fetched = fetched.filter(msg => msg.author.id == user.id).first(count)

        const deleted = await interaction.channel.bulkDelete(fetched, true)
    
        await interaction.deferReply({ephemeral: true})
        await wait(1_000)
        if (deleted.size >= 1) {
            if (user) {
                await interaction.editReply({
                    embeds: [
                        new EmbedBuilder()
                        .setColor(0x00DC00)
                        .setTitle("清除成功")
                        .setDescription(`已成功為您刪除了${deleted.size}條來自${user.username}的訊息。`)
                    ]
                })
            } else {
                await interaction.editReply({
                    embeds: [
                        new EmbedBuilder()
                        .setColor(0x00DC00)
                        .setTitle("清除成功")
                        .setDescription(`已成功為您刪除了${deleted.size}條訊息。`)
                    ]
                })
            }
        } else {
            await interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                    .setColor(0xDC0000)
                    .setTitle("清除失敗")
                    .setDescription(`沒有刪除任何訊息`)
                ]
            })
        }
    }
}