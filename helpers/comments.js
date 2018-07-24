var Models = require('../models'),
    async = require('async');

module.exports = {
    newest: function(callbak){
        
        Models.Comment.find({},{},{ limit: 5, sort: { timestamp: -1 } }, function(err, comments){
            if(err) throw err;
          
            var attachImage = function(comment, next){
                
                Models.Image.findOne({ _id: comment.image_id }, function(err, image){
                    if(err) throw err;
                    comment._image = image;
                    next(err);    
                });
            };

            async.each(comments, attachImage, function(err){
                if(err) throw err;
                
                callbak(err, comments);
            });


        });
    }
};