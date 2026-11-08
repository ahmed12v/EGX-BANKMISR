const endpoints = {
  login: 'GetIConnectLogin',
  tracking: 'TrackDetails',
  'reference-search': 'AWBSearchDetailed',
  'reference-options': 'GetHelpData',
  complaints: 'SearchQuery',
  'complaint-types': 'MasterList',
  'complaint-number': 'GetNewComplaintNo',
  'account-details': 'GetAccountDetails',
  'create-complaint': 'CreateComplaint',
};

const connection = {
  target: 'https://egxpress.me',
  secure: true,
  changeOrigin: true,
  timeout: 30000,
  proxyTimeout: 30000,
};

const servicePath = '/IconnectSecure/IntegraOntrackService.svc';

module.exports = Object.fromEntries(
  Object.entries(endpoints).map(([alias, endpoint]) => {
    const pattern = `^/BANKMISR/${alias}$`;
    return [pattern, {
      ...connection,
      pathRewrite: { [pattern]: `${servicePath}/${endpoint}` },
    }];
  }),
);
