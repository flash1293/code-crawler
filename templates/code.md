# code-* index

This index contains sloc information about files from definable GH repositories (see `config.js`).

It contains the following fields:
* block (number) number of lines of block comments
* blockEmpty (number) number of empty lines in block comments
* checkout (string) name of the thing checked out to record this file (e.g. `master` or `my_branch`)
* comment (number) number of comment lines
* commitDate (date) date of the commit
* commitHash (string) hash of the commit
* dir0 (string) name of the dir in the root folder of the repo (empty if the file is directly in the root folder)
* dir1 (string) name of the dir on level 1
* dir10 (string) name of the dir on level 10
* dir11 (string) name of the dir on level 11
* dir12 (string) name of the dir on level 12
* dir13 (string) name of the dir on level 13
* dir14 (string) name of the dir on level 14
* dir15 (string) name of the dir on level 15
* dir16 (string) name of the dir on level 16
* dir17 (string) name of the dir on level 17
* dir18 (string) name of the dir on level 18
* dir2 (string) name of the dir on level 2
* dir3 (string) name of the dir on level 3
* dir4 (string) name of the dir on level 4
* dir5 (string) name of the dir on level 5
* dir6 (string) name of the dir on level 6
* dir7 (string) name of the dir on level 7
* dir8 (string) name of the dir on level 8
* dir9 (string) name of the dir on level 9
* dirs (string) all dirs separated by `/` 
* empty (number) number of empty lines
* ext (string) file extension without the dot
* filename (string) name of the file without dir names
* fullFilename (string) name of the file relative to the repo root
* hasAngular (boolean) whether this file has angular references (kibana index only)
* hasUiPublic (boolean) whether this file has ui public references (kibana index only)
* indexDate (date) date of the indexing process
* isTestFile (boolean) whether the file name contains `.tests.` or `__test__`
* mixed (number) number of mixed lines (comment and code)
* repo (string) repo in which the file resides (e.g. `elastic/kibana`)
* single (number) number of single line comments
* source (number) number of source code lines
* todo (number) number of todo comments
* total (number) total number of lines
