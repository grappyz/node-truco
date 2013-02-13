var truco = require('./lib/truco')


var p1 = new truco.BasicAIPlayer("Bob")
  , p2 = new truco.BasicAIPlayer("Alice")

truco.deal2PRound(new truco.Deck(), p1, p2, function(){})
