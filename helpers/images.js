Image = require('../models').Image;

module.exports = {
    popular: function(callback){
        Image.find({},{},{ $limit: 9, $sort: { timestamp: -1} },function(err, images){
            if(err) throw err;
            
            callback(err, images);
        });       
    }
}