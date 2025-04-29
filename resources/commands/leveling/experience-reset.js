const {ApplicationCommandType, ApplicationCommandOptionType, EmbedBuilder} = require('discord.js')
const {query} = require('../../database')

module.exports = {
    name: 'experience-reset',
    description: '重置經驗值或等級(此指令很危險，請謹慎使用!)',
    type: ApplicationCommandType.ChatInput,
    cooldown: 10,
    devs_only: true,
    options: [
        {
            name: "server",
            description: "重置全部成員的經驗值與等級(此指令很危險，請謹慎使用!)",
            type: ApplicationCommandOptionType.Subcommand,
        },
        {
            name: "user",
            description: "重置指定成員的經驗值與等級",
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: "user",
                    description: "使用者",
                    type: ApplicationCommandOptionType.User,
                }
            ]
        },
    ],
    execute: async (interaction) => {
		if (!interaction.inGuild()) return
		if (interaction.options._subcommand==="server") {
			await interaction.deferReply()
			const guild = interaction.guild
			await query('update users set level = default, experience = default, total_experience = default', [])
			.then(async () => {
				await interaction.editReply({
					embeds: [
						new EmbedBuilder()
						.setColor(0x00DC00)
						.setTitle("重置成功")
						.setDescription(`已重置${guild.name}全體成員的經驗與等級`)
					]
				})}
			).catch(async (error) => {
				await interaction.editReply({
					embeds: [
						new EmbedBuilder()
						.setColor(0xDC0000)
						.setTitle("重置失敗")
						.setDescription(`好像發生了一些錯誤ouo\n${error.message}`)
					]
				})}
			)
		}

		if (interaction.options._subcommand==="user") {
			await interaction.deferReply()
			const user = interaction.options?.getUser('user') || interaction.user
			const guild = interaction.guild

			if (user.bot||user.system) return await interaction.editReply({
				embeds: [
					new EmbedBuilder()
					.setColor(0xDC0000)
					.setTitle("重置失敗")
					.setDescription(`你不能對此類型的使用者進行此操作!`)
				]
			})

			if (!user) return await interaction.editReply({
				embeds: [
					new EmbedBuilder()
					.setColor(0xDC0000)
					.setTitle("重置失敗")
					.setDescription(`用戶不存在。`)
				]
			})

			await query('update users set level = default, experience = default, total_experience = default where user_id = ?', [user.id])
			.then(async () => {
				await interaction.editReply({
					embeds: [
						new EmbedBuilder()
						.setColor(0x00DC00)
						.setTitle("重置成功")
						.setDescription(`已重置<@${user.id}>的經驗與等級`)
					]
				})}
			).catch(async (error) => {
				await interaction.editReply({
					embeds: [
						new EmbedBuilder()
						.setColor(0xDC0000)
						.setTitle("重置失敗")
						.setDescription(`好像發生了一些錯誤ouo\n${error.message}`)
					]
				})}
			)
		}
    }
}