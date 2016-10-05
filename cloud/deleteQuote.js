
Parse.Cloud.afterDelete('Quote', function(request) {
  var quote = request.object

  var ToDoTable = Parse.Object.extend("ToDoTable");
  var queryTodoTable = new Parse.Query(ToDoTable);
  queryTodoTable.equalTo("quote", quote);
  console.log("Find todos for " + quote + ".");
  queryTodoTable.find().then(function(todos) {
    console.log("Will remove " + todos.length + " todo-s.");
    Parse.Object.destroyAll(todos).then(function(success) {
      console.log("All todo-s for related quote were removed!");
    });
  });

  var FreeQuoteTable = Parse.Object.extend("FreeQuote");
  var queryFreeQuoteTable = new Parse.Query(FreeQuoteTable);
  queryFreeQuoteTable.equalTo("quote", quote);
  console.log("Find free quotes for " + quote + ".");
  queryFreeQuoteTable.find().then(function(freeQuotes) {
    console.log("Will remove " + freeQuotes.length + " free quotes.");
    Parse.Object.destroyAll(freeQuotes).then(function(success) {
      console.log("All free quotes for related quote were removed!");
    });
  });
});
