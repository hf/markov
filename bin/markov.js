#!/usr/bin/env node
var argv = require('optimist')
          .usage("Runs a Markov (normal) algorithm.\nUsage: $0 -i [input string] [algorithm_file.markov]")
          .demand(1)
          .string('i')
          .default('i', '')
          .default('t', 1)
          .describe('i', 'Input string on which to run the Markov algorithm, if not specified means empty string.')
          .describe('t', 'Time in seconds to step through the algorithm.')
          .argv;

var fs = require('fs')
  , colors = require('cli-color')
  , markov = require('../markov');

var algorithmFile = null;

try {
  algorithmFile = fs.readFileSync(argv._[0], 'UTF-8');
} catch (e) {
  if (e.errno == 34) {
    console.log(colors.red('No such file: \'' + argv._[0] + '\''));
  } else {
    console.log(colors.red('Unable to open file: \'' + argv._[0] + '\'; Reason: ' + colors.magentaBright(e.code)));
  }
}

var algorithm = new markov.Algorithm();

var statements = algorithmFile.split(/[\n\r]+/m);

statements.forEach(function(statement) {
  if (statement.length > 0) {
    try {
      statement = markov.Statement.compile(statement);
      algorithm.addStatement(statement);
    } catch (e) {
      console.log(colors.red(e.message));
      process.exit(1);
    }
  }
});

var runner = new markov.Runner(algorithm, argv.i);

runner.on('step', function(step) {
  var statementIndex = step.before.search(step.statement.fromRegExp);

  var before = step.before.slice(0, statementIndex) + colors.magenta(step.statement.from) + step.before.slice(statementIndex + step.statement.from.length);
  var after  = step.before.slice(0, statementIndex) + colors.yellow(step.statement.to) + step.before.slice(statementIndex + step.statement.to.length);

  console.log('  ' + (runner.steps.length - 1) + '. ' + before + '  -->  ' + after + '  |  ' + (step.statement.toString()));
});

runner.on('infinity', function(infinity) {
  console.log(colors.bgYellowBright(colors.red('∞ INFINITE CYCLE DETECTED!')));
  console.log('Context: \'' + infinity.context + '\'');
  console.log('Statement: \'' + infinity.statement.toString() + '\'');
  process.exit(1);
});

runner.on('done', function(){
  console.log('\n---- ' + colors.yellow('DONE') + ' ----');
  console.log('Original input: \'' + argv.i + '\'');
  console.log('Final output:   \'' + runner.context + '\'');
  console.log('Steps:          '   + (runner.steps.length - 1));
});

console.log('Running algorithm: \'' + argv._[0] + '\'' + ' on input string: \'' + argv.i + '\'' + '\n');

runner.run(argv.t * 1000);