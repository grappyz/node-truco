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



truco.deal2PRound = function(deck, p1, p2, cb){
  // P1 is dealer
  p1.announceDealer()

  deck.shuffleAll();
  
  [1,2,3].forEach(function(){
    p2.receiveCard(deck.draw())
    p1.receiveCard(deck.draw())
  })

  truco.do2PEnvido(deck, p1, p2, _.bind(truco.do2PRound, null, deck, p1, p2));
}

truco.do2PEnvido = function(deck, p1, p2, cb){
  
  var acceptBet = function(bet){
    return function(){
      if (bet == 0){
        cb();
      } else {
        var p1score = truco.envidoScore.apply(null, p1.cards)
          , p2score = truco.envidoScore.apply(null, p2.cards)
          , winner
          , betscore = (bet < 4) ? 4 : 15 // TODO Falta Envido

        winner = (p1score > p2score) ? p1 : p2;

        winner.winEnvido(betscore)

      }
    }
  }


  var offerUp = function(bet, a, b){
    return function(){
      if (bet < 4)
        a.quieroEnvido(bet, offerUp(bet+1, b, a), acceptBet(bet))
      else 
        acceptBet(bet)
    }
  }
  
  offerUp(0, p1, p2)()

}

truco.do2PRound = function(deck, p1, p2){
  truco.do2PTrick()
}

truco.do2PTrick = function(deck, p1, p2, cb){

}

truco.cleanUp2PRound = function(deck, p1, p2, cb){
  p1.returnCards()
  p2.returnCards()  

  truco.check2PWin();

  truco.deal2PRound(p2, p1, cb)
}



// == Basic AI Player ==
truco.BasicAIPlayer = function(name){
  this.name = name
  this.cards = []
  this.score = 0
}

truco.BasicAIPlayer.prototype.announceDealer = function(card){
  console.log(this.name, "deals...")
}
truco.BasicAIPlayer.prototype.receiveCard = function(card){
  this.cards.push(card)
  if (this.cards.length == 3)
    console.log(this.name, "was dealt : ", _.map(this.cards, function(x){return x.unicodeString()}))
}

truco.BasicAIPlayer.prototype.returnCards = function(card){
}

truco.BasicAIPlayer.prototype.quieroEnvido = function(bet, y, n){
  console.log("Quiero Envido", this.name, "?")
  var score = truco.envidoScore.apply(null, this.cards);
  if (score > 28){
    console.log("Quiero")
    y(1)
  }
  else {
    console.log("No Quiero.")
    n()
  }
}

truco.BasicAIPlayer.prototype.playTrick = function(cb){
  cb(this.cards.pop())
}

truco.BasicAIPlayer.prototype.winEnvido = function(score){
  console.log(this.name, " wins envido : ", score)
  this.score += score
}

