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

async function analyze(localPath, analyzer = () => ({})) {
  const rootDirDepth = localPath.split(path.sep).length;
  const files = await findFiles(localPath);
  return files
    .filter(file => fileExtensions.indexOf(path.extname(file)) !== -1)
    .map(file => {
      const code = fs.readFileSync(file, { encoding: "utf8" });
      const dirs = file.split(path.sep).slice(rootDirDepth);
      const filename = dirs.pop();
      const ext = path.extname(filename).slice(1);
      const attributes = {
        ...sloc(code, ext),
        isTestFile:
          dirs.includes("__tests__") || filename.indexOf(".test.") > -1,
        ext,
        filename,
        dirs: dirs.join(path.sep),
        fullFilename: [...dirs, filename].join(path.sep),
        ...analyzer(code, filename, dirs)
      };
      dirs.forEach((dir, i) => {
        attributes["dir" + i] = dir;
      });

      return attributes;
    });
}

function getIndexName(repo) {
  const owner = repo.split("/")[0];
  const repoName = repo.split("/")[1];
  return `code-${owner}-${repoName}`;
}

async function alreadyIndexed(repo, commitHash) {
  const entries = await client.search({
    index: getIndexName(repo),
    ignore_unavailable: true,
    size: 0,
    body: {
      query: {
        bool: {
          filter: [{ match: { commitHash } }, { match: { repo } }]
        }
      }
    }
  });

  // TODO check whether this is necessary (different ES versions?)
  return entries.hits.total > 0 || entries.hits.total.value > 0;
}

const getDocument = (commitHash, commitDate, repo, checkout) => file => {
  return {
    ...file,
    commitHash,
    commitDate,
    repo,
    checkout,
    indexDate: new Date().toISOString()
  };
};

async function indexFiles(files, repo) {
  const body = [];
  files.forEach(file => {
    body.push({ index: { _index: getIndexName(repo), _type: "_doc" } });
    body.push(file);
  });
  await client.bulk({
    body
  });
}

async function main() {
  for (const { repo, checkouts, checkoutAs, analyzer } of config.repos) {
    const tmpDir = tmp.dirSync();
    console.log(`Processing ${repo}, using ${tmpDir.name}`);
    const currentGit = git(tmpDir.name);
    try {
      await currentGit.clone(`https://github.com/${repo}.git`, tmpDir.name);
      for (const checkout of checkouts) {
        console.log(`Indexing current state of ${checkout}`);
        await currentGit.checkout(checkout);
        const commitHash = await currentGit.raw(["rev-parse", "HEAD"]);
        const commitDate = new Date(
          await currentGit.raw(["log", "-1", "--format=%cd"])
        ).toISOString();
        if (await alreadyIndexed(repo, commitHash)) {
          console.log(
            `${repo} ${checkout} (${commitHash}) already indexed, skipping`
          );
          continue;
        }
        const files = (await analyze(tmpDir.name, analyzer)).map(
          getDocument(commitHash, commitDate, repo, checkoutAs || checkout)
        );
        await indexFiles(files, repo);
      }
    } catch (e) {
      console.log(`Indexing ${repo} failed: `, e);
    }
    tmpDir.removeCallback();
  }
}

main();
