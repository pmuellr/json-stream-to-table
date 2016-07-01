json-stream-to-table - convert a stream of JSON lines to tabular format
================================================================================

Read text content in application/x-json-stream format, and output as a table.

Example:

    $ json-stream-outputer
    {"a": 1, "b": "foo"}
    {"c": 3, "b": "bar"}

    $ json-stream-outputer | json-stream-to-table
    a  b    c
    -  ---  -
    1  foo
       bar  3


usage
================================================================================

    json-stream-to-table <options>

options:

    -h --help ?        -   print this help
    -d --debug         -   generate debug information
    -l --lines <num>   -   print a new legend every <num> lines
    -t --time  <num>   -   print a new legend every <num> seconds


install
================================================================================

    npm install -g https://github.com/pmuellr/json-stream-to-table.git


contributing
================================================================================

See the documents [CONTRIBUTING.md](CONTRIBUTING.md) and
[CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md).
