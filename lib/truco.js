var cards = require('cards')
  , _ = require('underscore')

var truco = module.exports = {}

truco.Deck = cards.BarajaDeck
truco.Card = cards.Card

// Monkey Patch card to add a 'trucoValue' that can be used for comparator
cards.Card.prototype.trucoValue = function(){

  // Special cards
  if (this.suit == 'sword' && this.value == 1)
    return 100
  if (this.suit == 'club' && this.value == 1)
    return 99
  if (this.suit == 'sword' && this.value == 7)
    return 98
  if (this.suit == 'coin' && this.value == 7)
    return 97


  if (this.value < 4)
    return 13 + parseInt(this.value)
 
  return parseInt(this.value)
}

truco.trucoCompare = function(c1, c2){
  return c1.trucoValue() - c2.trucoValue()
}

// Monkey patch for envido value
cards.Card.prototype.envidoValue = function(){
  if (this.value > 9)
    return 0

  return this.value    
}



truco.envidoScore = function(c1, c2, c3){
  var suits = _.countBy([c1, c2, c3], 'suit')
    , suitsCt = _.size(suits)
    , score = 0

  if (suitsCt == 1){
    // flor
  } else if (suitsCt == 2){
    // 2 of a kind:
    var suit = _.invert(suits)[2]
    score = _.reduce(
        [c1, c2, c3], 
        function(a, b){return (b.suit == suit) ? (a + parseInt(b.value)) : a}, 
        0)
    score += 20
  } else {
    score = _.max(_.map([c1, c2, c3], function(x){return x.envidoValue()})) 
  }

  return score
}

