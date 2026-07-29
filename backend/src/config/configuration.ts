export default () => ({
  port: parseInt(process.env.PORT || '3001', 10),
  youtube: {
    apiKey: process.env.YOUTUBE_API_KEY || '',
  },
});
