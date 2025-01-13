const fs = require('fs');
const path = require('path');
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const dataPath = path.join(__dirname, '../data/sub.json');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('checksub')
    .setDescription('View subscriptions grouped by category.'),

  async execute(interaction) {
    if (!interaction.member.permissions.has('Administrator')) {
      return interaction.reply({
        content: 'You do not have permission to use this command.',
        ephemeral: true,
      });
    }

    try {
      const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

      if (data.length === 0) {
        return interaction.reply({
          content: 'No subscriptions found.',
          ephemeral: true,
        });
      }

      const grouped = data.reduce((acc, entry) => {
        if (!acc[entry.product]) acc[entry.product] = [];
        acc[entry.product].push(entry);
        return acc;
      }, {});

      const embed = new EmbedBuilder()
        .setTitle('Subscriptions by Category')
        .setColor('Blue')
        .setTimestamp();

      for (const [product, subs] of Object.entries(grouped)) {
        const subDetails = subs
          .map(sub => `**Key**: ${sub.key}\n**User**: ${sub.user}\n**Expiry**: ${sub.expiry}`)
          .join('\n\n');
        embed.addFields({ name: product, value: subDetails });
      }

      await interaction.reply({ embeds: [embed], ephemeral: true });
    } catch (err) {
      console.error(err);
      await interaction.reply({
        content: 'An error occurred while retrieving subscriptions.',
        ephemeral: true,
      });
    }
  },
};
