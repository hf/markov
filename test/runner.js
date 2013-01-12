var markov = require('../markov')
  , should  = require('should');


describe('markov.Runner', function() {

  describe(':constructor', function() {
    it('should construct a new runner', function() {
      var runner = null
        , algorithm = new markov.Algorithm()
        , context   = 'Context';

      (function() {
        runner = new markov.Runner(algorithm, context);
      }).should.not.throw(/^Markov\.Runner/i);

      should.exist(runner);

      runner.should.have.property('algorithm', algorithm);
      runner.should.have.property('context', context);
      runner.should.have.property('steps');
      runner.steps.length.should.equal(0);
      runner.should.have.property('done', false);
    });

    it('should not construct a new runner', function() {
      var runner = null;

      (function() {
        runner = new markov.Runner(null, null);
      }).should.throw(/^Markov\.Runner/i);

      (function() {
        runner = new markov.Runner(undefined, undefined);
      }).should.throw(/^Markov\.Runner/i);

      (function() {
        runner = new markov.Runner(new markov.Algorithm(), 0);
      }).should.throw(/^Markov\.Runner/i);
    });
  });

  describe('#step', function() {
    it('should step through in a finite amount of steps', function() {
      var test = function(startContext, endContext, statements, steps, infinity) {
        var algorithm = new markov.Algorithm();

        for (var i = 0; i < statements.length; i++) {
          algorithm.addStatement(markov.Statement.compile(statements[i]));
        }

        var runner = new markov.Runner(algorithm, startContext)
          , i = 0
          , insideInfinity = false;

        runner.on('infinity', function() {
          runner.stop();
          insideInfinity = true;
        });

        while (!runner.done) {
          runner.step(); i++;
        }

        runner.should.have.property('done', true);
        runner.should.have.property('steps');
        runner.steps.length.should.equal(steps ? steps : i + 1);
        runner.should.have.property('context', endContext);

        if (infinity) {
          insideInfinity.should.be.true;
        }
      };

      test('', '', [' ! -> ! . ']);
      test('***', 'aaa', [ ' * -> a '], 4);
      test('101', '|||||', [ ' |0 -> 0|| ', ' 1 -> 0| ', ' 0 -> ! '], 9);
      test('', '', [ ' ! -> ! '], undefined, true);
    });
  });
});