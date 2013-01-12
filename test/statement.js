var markov = require('../markov')
  , should  = require('should');

describe('markov.Statement', function() {

  describe('.compile', function() {

    it('should compile statements', function() {
      var test = function(stmt, from, to, closing) {
        var statement = stmt;

        (function(){
          statement = markov.Statement.compile(statement);
        }).should.not.throw(/^Invalid statement/i);

        should.exist(statement);

        statement.should.have.property('from', from);
        statement.should.have.property('to', to);
        statement.should.have.property('closing', !!closing);
      };

      test(' ! - > ! ', '', '', false);
      test(' ! = > ! ', '', '', false);
      test(' ! ->  ! . ', '', '', true);
      test(' ! -> !. ', '', '', true);
      test(' ab -> ba ', 'ab', 'ba', false);
      test(' cd => dc. ', 'cd', 'dc', true);
      test(' ef -> fe .', 'ef', 'fe', true);
    });

  it('should not compile statements', function() {
      var test = function(stmt) {
        (function(){
          markov.Statement.compile(stmt);
        }).should.throw(/^Invalid statement/i);
      };

      test(' !! -> something ');
      test(' . -> whatever. ');
      test(' extra -> !! ');
      test(' something. -> so.mething ');
      test(' wo.nderful ==> expected ');
      test(' wonderful = => expected ');
      test(' extra ');
      test(' -> stuff ');
      test(' - > ');
      test(' -- > ');
      test(' == > ');
  });

  });

});