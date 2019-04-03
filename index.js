const config = require("./config.js");

const tmp = require("tmp");
const sloc = require("sloc");
const fs = require("fs");
const path = require("path");
const find = require("find");
const elasticsearch = require("elasticsearch");

const git = require("simple-git/promise");

const client = new elasticsearch.Client(config.elasticsearch);

const fileExtensions = [".js", ".ts", ".jsx", ".tsx", ".html", ".css", ".scss"];

function findFiles(dir) {
  return new Promise(resolve => {
    find.file(dir, files => {
      resolve(files);
    });
  });
}

async function analyze(localPath) {
  const files = await findFiles(localPath);
  return files
    .filter(file => fileExtensions.indexOf(path.extname(file)) !== -1)
    .map(file => {
      const code = fs.readFileSync(file, { encoding: "utf8" });
      const dirs = file.split(path.sep).slice(2);
      const filename = dirs.pop();
      const ext = path.extname(filename);
      const attributes = {
        ...sloc(code, ext.substr(1)),
        isTestFile:
          dirs.includes("__tests__") || filename.indexOf(".test.") > -1,
        ext,
        filename
      };
      dirs.forEach((dir, i) => {
        attributes["dir" + i] = dir;
      });

      return attributes;
    });
}

const getDocument = (commitHash, commitDate, repo, checkout) => file => {
  return {
    ...file,
    commitHash,
    commitDate,
	repo,
	checkout
  };
};

async function indexFiles(files, repo) {
  const body = [];
  const owner = repo.split('/')[0];
  const repoName = repo.split('/')[1];
  files.forEach(file => {
    body.push({ index: { _index: `code-${owner}-${repoName}`, _type: "_doc" } });
    body.push(file);
  });
  await client.bulk({
    body
  });
}

async function main() {
  for (const { repo, checkouts } of config.repos) {
    console.log(`Cloning current ${repo}`);
    const tmpDir = tmp.dirSync();
    console.log(`Using ${tmpDir.name}`);
    const currentGit = git(tmpDir.name);
	await currentGit.clone(`https://github.com/${repo}.git`, tmpDir.name);
	for(const checkout of checkouts) {
		console.log(`Indexing current state of ${checkout}`);
		await currentGit.checkout(checkout);
		const commitHash = await currentGit.raw(["rev-parse", "HEAD"]);
		const commitDate = new Date(await currentGit.raw(["log", "-1", "--format=%cd"])).toISOString();
		const files = (await analyze(tmpDir.name)).map(
		getDocument(commitHash, commitDate, repo, checkout)
		);
		await indexFiles(files, repo);
	}
    tmpDir.removeCallback();
  }
}

main();
