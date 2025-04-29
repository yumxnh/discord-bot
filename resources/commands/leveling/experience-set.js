const {ApplicationCommandType, ApplicationCommandOptionType, EmbedBuilder, PermissionFlagsBits} = require('discord.js')
const {query} = require('../../database')
const {Role, Level} = require('../../utils/utils')

module.exports = {
    name: 'experience-set',
    description: '設置經驗值或等級',
    type: ApplicationCommandType.ChatInput,
    devs_only: true,
    options: [
        {
            name: 'type',
            description: '設置經驗值或是等級',
            type: ApplicationCommandOptionType.String,
            choices: [
                {name: 'level', value: 'level'},
                {name: 'experience', value: 'experience'}
            ],
            required: true
        },

        {
            name: 'amount',
            description: '設置的數量',
            type: ApplicationCommandOptionType.Integer,
            min_value: 1,
            required: true
        },

        {
            name: 'user',
            description: '使用者',
            type: ApplicationCommandOptionType.User
        }

    ],
    execute: async (interaction) => {
        if (!interaction.inGuild()) return
        await interaction.deferReply()
        const guild = interaction.guild
        const amount = interaction.options.getInteger('amount')
        const type = interaction.options.getString('type')
        const user = interaction.options?.getUser('user') || interaction.user
		
		if (user.bot||user.system) return await interaction.editReply({
            embeds: [
                new EmbedBuilder()
                .setColor(0xDC0000)
                .setTitle("設置失敗")
                .setDescription(`你不能對此類型的使用者進行此操作!`)
            ]
        })

        if (!user) return await interaction.editReply({
            embeds: [
                new EmbedBuilder()
                .setColor(0xDC0000)
                .setTitle("設置失敗")
                .setDescription(`用戶不存在。`)
            ]
        })

        let userData = { level: 1, experience: 0, total_experience: 0 }
        
        if (type==="experience") {
            userData.total_experience += amount
            userData.experience += amount
            while (userData.experience>=Level.required(userData.level)) {
                userData.experience -= Level.required(userData.level)
                userData.level += 1
            }
        }

        if (type==="level") {
            for (let i=1;i<amount;i++) {
                userData.total_experience += Level.required(i)
            }
            userData.level = amount
        }
	
		await query('insert into users (user_id, user_name, level, experience, total_experience) values(?, ?, ?, ?, ?) on duplicate key update level = value(level), experience = value(experience), total_experience = value(total_experience)', [user.id, user.username, userData.level, userData.experience, userData.total_experience])
        .then(async () => {
            let target = user.id == interaction.user.id ? "您" : `<@${user.id}>`
            let type_sentence = type=="experience" ? `經驗值至${amount.toLocaleString()}點` : `等級至${amount.toLocaleString()}等`
            await interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                    .setColor(0x00DC00)
                    .setTitle("設置成功")
                    .setDescription(`已成功為${target}設置${type_sentence}。`)
                    .addFields(
                        { name: '等級', value: `Lv.${userData.level}`, inline: true },
                        { name: '經驗值', value: `${userData.experience.toLocaleString()}`, inline: true },
                        { name: '總經驗值', value: `${userData.total_experience.toLocaleString()}`, inline: false }
                    )
                ]
            })}
        ).catch(async (error) => {
            await interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                    .setColor(0xDC0000)
                    .setTitle("設置失敗")
                    .setDescription(`好像發生了一些錯誤ouo\n${error.message}`)
                ]
            })
        })
	}
}