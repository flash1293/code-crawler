const repos = [
  {
    repo: "elastic/kibana",
    checkouts: ["master"],
    analyzer: function(code, filename, dirs) {
      const angularTakeaways = [
        "uiModules",
        ".directive(",
        ".service(",
        ".controller(",
        "$scope",
        "Private(",
        "dangerouslyGetActiveInjector",
      ];
      return {
        hasAngular: angularTakeaways.some(searchString =>
          code.includes(searchString)
        ),
        hasUiPublic: code.includes("from 'ui/")
      };
    }
  },
  { repo: "elastic/elastic-charts", checkouts: ["master"] },
  { repo: "elastic/eui", checkouts: ["master"] }
];

if (!process.env.ES_HOST || !process.env.ES_AUTH) {
  throw new Error("You need to specify ES_HOST and ES_AUTH env variables.");
}

const githubAuth = {
  type: "oauth",
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
