var speak = require("./speakeasy-nlp");

// Analyze sentences at a basic level
// ------------------------------------- //
speak.classify("What is your name?")             //=> { action: "what", owner: "listener", subject: "name" }
speak.classify("Do you know what time it is?")   //=> { action: "what", owner: "it", subject: "time" }
