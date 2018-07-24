var fs = require('fs'),
    path  = require('path'),
    sidebar = require('../helpers/sidebar'),
    Models = require('../models/'),
    md5 = require('MD5');

module.exports = {
    index: function(req, res){
        var viewModel = {
            image: {},
            comments: []
        };

        Models.Image.findOne({ filename: { $regex: req.params.image_id}}, function(err, image) {
            if(err) throw err;
            
            if(image) {

                image.views = image.views + 1;
                viewModel.image = image;
                image.save();
                
                //getting comments
                Models.Comment.find({image_id: image._id}, {}, { sort:{ timestamp: 1}}, function(err, comments){
                    if(err) throw err;

                    viewModel.comments = comments;
                    sidebar(viewModel, function(viewModel){
                        res.render('image', viewModel);
                    });
                });

            }else {
                res.redirect('/');
            }
        });

    },
    create: function(req, res){

        function saveImage() {
            var posible = 'abcdefghijklmnopqrstuvwxyz0123456789',
                imgUrl = '';
            
            for(var i = 0; i < 6; i++) {
                imgUrl += posible.charAt(Math.floor(Math.random() * posible.length));
            }

            Models.Image.find({filename: imgUrl}, function(err, images){
                if(images.length > 0) {
                    saveImage();
                }else {

                    //do the work   
                    var tempPath = req.file.path,
                    ext = path.extname(req.file.originalname),
                    targetpath = path.resolve('./public/upload/' + imgUrl + ext);
            
                    if(ext === '.png' || ext === '.jpg' || ext === '.jpeg' || ext === '.gif') {
                        fs.rename(tempPath, targetpath, function(err){
                            if(err) throw err;
                            
                            var newImage  = new Models.Image({
                                title: req.body.title,
                                description: req.body.description,
                                filename: imgUrl + ext,
                            });

                            newImage.save(function(err, image) {
                                console.log('Successfully inserted image: ' + image.filename);
                                res.redirect('/images/'+  image.uniqueId);
                            });
                        });
                    }else {
                        fs.unlink(tempPath, function(err){
                            if(err) throw err;  
                            res.json(500, {error:'Only image files are allowed.'});
                        });
                    }
                }
            });

            
        }// saveImage
       
        saveImage();
    },
    like: function(req, res){

        Models.Image.findOne({filename: { $regex: req.params.image_id }}, function(err, image) {
            
            if( !err && image) {
                image.likes = image.likes + 1;
                image.save(function(err){
                    if(err) {
                        res.json(err);
                    }else {
                        res.json({likes: image.likes});
                    }
                });
            }
        });
    },
    comment: function(req, res) {

        Models.Image.findOne({filename: { $regex: req.params.image_id }}, function(err, image) {
            if(!err && image ){
                 
                var comment = new Models.Comment(req.body);
                comment.gravatar = md5(comment.email);
                comment.image_id = image._id;
                comment.save(function(err, comment){
                    if(err) throw err;
                    
                    res.redirect('/images/' + image.uniqueId + '#' + comment._id);
                });

            }else {
                res.redirect('/images/' + req.params.image_id);
            }
        });
    },
    remove: function(req, res) {
    
        Models.Image.findOne({ filename: { $regex: req.params.image_id } }, function(err, image){
            if(err) throw err;
            //if the image doesnt exist
            if(!image) {
                res.json(false);
                 return false;
            }
            //delete image
            fs.unlink(path.resolve('./public/upload/' + image.filename ), function(err){
                if(err) throw err;
                //delete images comments
                Models.Comment.remove({ image_id: image._id }, function(err, result){
                    image.remove(function(err){
                        if(!err){
                            res.json(true);
                        }else {
                            res.json(false);
                        }
                    });
                });
            });
        });
    }
}