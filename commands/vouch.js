const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('review')
    .setDescription('Submit a review for a product.')
    .addStringOption(option =>
      option.setName('product')
        .setDescription('Select the product you want to review.')
        .setRequired(true)
        .addChoices(
          { name: 'Fortnite Private', value: 'Fortnite Private' },
          { name: 'Temp Spoofer', value: 'Temp Spoofer' },
          { name: 'Perm Spoofer', value: 'Perm Spoofer' }
        )
    )
    .addStringOption(option =>
      option.setName('rating')
        .setDescription('Rate the product (from ⭐ to ⭐⭐⭐⭐⭐).')
        .setRequired(true)
        .addChoices(
          { name: '⭐', value: '⭐' },
          { name: '⭐⭐', value: '⭐⭐' },
          { name: '⭐⭐⭐', value: '⭐⭐⭐' },
          { name: '⭐⭐⭐⭐', value: '⭐⭐⭐⭐' },
          { name: '⭐⭐⭐⭐⭐', value: '⭐⭐⭐⭐⭐' }
        )
    )
    .addStringOption(option =>
      option.setName('review')
        .setDescription('Write your review for the product.')
        .setRequired(true)
    ),

  async execute(interaction) {
    const product = interaction.options.getString('product');
    const rating = interaction.options.getString('rating');
    const review = interaction.options.getString('review');
    const user = interaction.user;

    const productChannels = {
      'Fortnite Private': '1315407898951553043',
      'Temp Spoofer': '1315407898951553044',
      'Perm Spoofer': '1315407898951553045'
    };

    const channelId = productChannels[product];
    const productMention = channelId ? `<#${channelId}>` : `📗┃${product}`;

    const embed = new EmbedBuilder()
      .setTitle(`New Review Submitted By ${user.username} 🚀`)
      .setDescription(`**Reviewed By: <@${user.id}>**`)
      .setThumbnail(user.displayAvatarURL({ dynamic: true }))
      .setColor('Orange')
      .addFields(
        { name: 'Product:', value: productMention, inline: true },
        { name: 'Rating:', value: rating, inline: true },
        { name: 'Review:', value: review }
      )
      .setTimestamp()
      .setFooter({ text: 'Zisko | Reviews System', iconURL: interaction.client.user.displayAvatarURL() });

    const reviewChannel = interaction.guild.channels.cache.find(channel => channel.name === 'reviews');
    if (!reviewChannel) {
      return interaction.reply({
        content: 'The "reviews" channel does not exist. Please create it or contact an administrator.',
        ephemeral: true,
      });
    }

    await reviewChannel.send({ embeds: [embed] });
    await interaction.reply({
      content: 'Your review has been successfully submitted!',
      ephemeral: true,
    });
  },
};
