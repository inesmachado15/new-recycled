// Configuração dinâmica: WEB_BASE=/basket publica a versão web numa subpasta do site.
// Sem WEB_BASE (app no Expo Go / EAS Update) fica tudo como no app.json.
module.exports = ({ config }) =>
  process.env.WEB_BASE
    ? { ...config, experiments: { ...(config.experiments || {}), baseUrl: process.env.WEB_BASE } }
    : config;
