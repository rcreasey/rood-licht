exports.config = {
  app_name : [process.env.APP_NAME],
  license_key : process.env.NEW_RELIC_LICENSE_KEY,
  agent_enabled : 'true',
  logging : {
    level : 'info'
  }
};
