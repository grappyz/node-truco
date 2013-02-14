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
        cb();
      }
    }
  }


  var offerUp = function(bet, a, b){
    return function(){
      if (bet < 4)
        a.quieroEnvido(bet, offerUp(bet+1, b, a), acceptBet(bet))
      else 
        acceptBet(bet)()
    }
  }
  
  offerUp(0, p1, p2)()

}

truco.do2PRound = function(deck, p1, p2){
  // TODO: Offer Truco
  var played = 0
  p1.tricks = 0
  p2.tricks = 0

  var playCards = function(w, l){
    if (played < 3 && w.tricks <= 2){
      played ++;
      truco.do2PTrick(deck, w, l, function(w, l){
        w.tricks ++
        playCards(w,l)
      })
    } else {
      var score = 1 // Todo Truco bets
      w.winHand(score)
      l.loseHand()

      truco.cleanUp2PRound(deck, p1, p2);
    }
  }

  playCards(p1, p2)
}

truco.do2PTrick = function(deck, p1, p2, cb){
  p1.playTrick(function(c1){
    p2.playTrick(function(c2){
      return (c1.envidoValue() > c2.envidoValue()) ? cb(p1, p2) : cb(p2, p1);
    })
  })
}

truco.cleanUp2PRound = function(deck, p1, p2){
  p1.returnCards()
  p2.returnCards()  

  truco.check2PWin(p1, p2);

  console.log("-- End of Hand -- \n Scores: ", p1.getScore(), p2.getScore(), "\n")
  truco.deal2PRound(deck, p2, p1)

}

truco.check2PWin = function(p1, p2){
  [p1, p2].forEach(function(x){
    if (x.score >= 30){
      x.winGame()
      process.exit(0)
    }
  })
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
  var card = this.cards.pop();
  console.log(this.name, "plays", card.unicodeString())
  cb(card)
}

truco.BasicAIPlayer.prototype.winEnvido = function(score){
  console.log(this.name, " wins envido : ", score)
  this.score += score
}

truco.BasicAIPlayer.prototype.winHand = function(score){
  this.score += score
  console.log(this.name, "won the hand")
}
truco.BasicAIPlayer.prototype.loseHand = function(){
}
truco.BasicAIPlayer.prototype.getScore = function(score){
  return this.name + " : " + this.score
}
truco.BasicAIPlayer.prototype.winGame = function(){
  console.log(this.name, "won the game !!")
}
