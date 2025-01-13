const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('savekey')
    .setDescription("Retrieve all your keys for all products."),

  async execute(interaction) {
    const user = interaction.user;

    const dataPath = path.join(__dirname, '../data/sub.json');
    const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

    const userKeys = data.filter(entry => entry.user === user.tag);

    if (userKeys.length === 0) {
      return interaction.reply({
        content: "You don't have any keys saved.",
        ephemeral: true,
      });
    }

    const keysByProduct = userKeys.reduce((acc, entry) => {
      if (!acc[entry.product]) acc[entry.product] = [];
      acc[entry.product].push(entry.key);
      return acc;
    }, {});

    const embed = new EmbedBuilder()
      .setTitle(`🔑 Your Saved Keys`)
      .setColor('Blue')
      .setDescription('Here are all your keys for the products you have access to.')
      .setThumbnail(user.displayAvatarURL({ dynamic: true }))
      .setFooter({ text: 'Key Management System', iconURL: interaction.client.user.displayAvatarURL() });

    for (const [product, keys] of Object.entries(keysByProduct)) {
      embed.addFields({
        name: product,
        value: keys.map((key, index) => `${index + 1}. ${key}`).join('\n'),
      });
    }

    try {
      await user.send({ embeds: [embed] });
      await interaction.reply({
        content: 'Your keys have been sent to your direct messages.',
        ephemeral: true,
      });
    } catch (error) {
      console.error('Failed to send DM:', error.message);
      await interaction.reply({
        content: "I couldn't send you a DM. Please check your DM settings.",
        ephemeral: true,
      });
    }
  },
};
