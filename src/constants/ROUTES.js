import uniloc from 'uniloc'

export default uniloc({ 
  root:         		'GET /',
  dashboard: 			'GET /dashboard',
  depositsReports: 		'GET /depositsReports',
  batchReports:   		'GET /batchReports',
  batchReportsDetail:   'GET /batchReportsDetail/:id',
  authReports: 			'GET /authReports',
  gatewayLogin:      	'GET /gatewayLogin',
  pciLogin:             'GET /pciLogin',
  onlineCardDeposits:   'GET /onlineCardDeposits'
})
