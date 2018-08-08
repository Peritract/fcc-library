/*
*
*
*       Complete the API routing below
*       
*       
*/

'use strict';

var expect = require('chai').expect;
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectId;
const CONNECTION = "mongodb://" + process.env.USER +":" + process.env.KEY + "@" + process.env.HOST + "/" + process.env.DATABASE;


module.exports = function (app) {

  app.route('/api/books')
    .get(function (req, res){
      //response will be array of book objects
      //json res format: [{"_id": bookid, "title": book_title, "commentcount": num_of_comments },...]
    MongoClient.connect(CONNECTION, function(err, db){
      if (err) throw err;
      db.collection("books").find().toArray(function(err,books){
      if (err) throw err;
      for (let i=0; i < books.length; i++){
        books[i].commentcount = books[i].comments.length;
      } 
      res.send(books);
      })
    })
    })
    
    .post(function (req, res){
      var title = req.body.title;
      if (!title){
        res.send("missing title")
      } else {
        let book = {title: title,
                 comments: []}
      //response will contain new book object including atleast _id and title
      MongoClient.connect(CONNECTION, function(err, db){
      if (err) throw err;
      db.collection("books").insertOne(book, function(err,doc){
        if (err) throw err;
        book._id = doc.insertedId;
        res.json(book);
      }) 
      })
      }
      
    })
    
    .delete(function(req, res){
      //if successful response will be 'complete delete successful'
    MongoClient.connect(CONNECTION, function(err, db){
      if (err) throw err;
      db.collection("books").remove();
      res.send("complete delete successful")
    });
  });
    



  app.route('/api/books/:id')
    .get(function (req, res){
      var bookid = req.params.id;
    if (bookid.length < 24){
      res.send("no book exists");
    } else {
      let bid = new ObjectId(bookid)
      MongoClient.connect(CONNECTION, function(err, db){
        //expect(err, 'database error').to.not.exist;
      db.collection("books").find({_id: bid}).toArray(function(err, data){
        //expect(err, 'database find error').to.not.exist;
      if (data.length === 0){
        res.send("no book exists");
      } else {
        res.json(data[0]);
      }
      })
    })
    }
  })
  
  
    .post(function(req, res){
      var bookid = req.params.id;
      var comment = req.body.comment;
      let bid = new ObjectId(bookid);
      //json res format same as .get
      MongoClient.connect(CONNECTION, function(err, db){
        if (err) throw err;
        db.collection("books").findAndModify({_id: bid},false,{$push: { comments: comment }},{new: true, upsert: false}, function(err, data){
          if (err) throw err;
          res.json(data.value);
        });
    })
  })
    
    .delete(function(req, res){
      var bookid = req.params.id;
      //if successful response will be 'delete successful'
    MongoClient.connect(CONNECTION, function(err, db){
      if (err) throw err;
      db.collection("books").deleteOne({_id: bookid}, function(err, data){
      if (err) throw err;
      res.send("delete successful")
      })
    });
  })
};
