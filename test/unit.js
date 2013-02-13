var vows = require('vows')
  , assert = require('assert')
  , truco = require('../lib/truco')

vows.describe('Division by Zero').addBatch({
  'Cards' : {
      topic: function(){ return new truco.Deck()}

    , 'have a trucoValue' : function(deck){
      var card = deck.draw()
      assert.equal(card.toString(), "[Card sword:1]");
      assert.equal(card.trucoValue(), 100);

      var card = deck.draw()
      assert.equal(card.toString(), "[Card sword:2]");
      assert.equal(card.trucoValue(), 15);
    }

    , 'can be compared by their truco value': function(deck){
      var c1 = deck.draw()
        , c2 = deck.draw()

      assert.equal(c1.toString(), "[Card sword:3]")
      assert.equal(c2.toString(), "[Card sword:4]")
      assert.equal(truco.trucoCompare(c1, c2), 12)

    }

    , 'envidoValue' : function(){
        var c1 = new truco.Card('sword', 1)
          , c2 = new truco.Card('sword', 7)
          , c3 = new truco.Card('cup', 10)

        assert.equal(truco.envidoScore(c1, c2, c3), 28)  

        var c1 = new truco.Card('sword', 1)
          , c2 = new truco.Card('club', 7)
          , c3 = new truco.Card('cup', 10)

        assert.equal(truco.envidoScore(c1, c2, c3), 7)  
    }
  }
}).run()
