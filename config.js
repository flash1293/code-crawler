const repos = [
	// 'elastic/kibana',
	{ repo: 'elastic/eui', checkouts: ['v9.7.0', 'v9.6.0', 'v9.5.0', 'v9.4.0'] }
	// { repo: 'elastic/elastic-charts', checkouts: ['master', 'markov00-patch-1'] },
];

if (!process.env.ES_HOST || !process.env.ES_AUTH) {
	throw new Error('You need to specify ES_HOST and ES_AUTH env variables.');
}

const githubAuth = {
	type: 'oauth',
	token: process.env.GITHUB_OAUTH_TOKEN
};

const elasticsearch = {
	host: process.env.ES_HOST,
	httpAuth: process.env.ES_AUTH
};

module.exports = {
	elasticsearch,
	githubAuth,
	repos
};
