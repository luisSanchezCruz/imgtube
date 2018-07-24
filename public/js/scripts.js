$(function(){

    $('#post-comment').hide();

    $('#btn-comment').click(function(e) {
        e.preventDefault();

        $('#post-comment').toggle('slow');
    });

    $('#btn-like').on('click', function(e){
        e.preventDefault();

        var imgId = $(this).data('id');
        $.post('/images/' + imgId + '/like').done(function(data){
            $('.likes-count').text(data.likes);
        });
    });

    $('#btn-delete').on('click', function(event){
        event.preventDefault();
        var btnDelete = this;
        var remove = confirm('Are you sure you want to delete this image?');
        
        if(remove){
            var imgId = $(this).data('id');
            //using some ajax to send a delete request
            $.ajax({
                url: '/images/' + imgId,
                type: 'DELETE'
            }).done(function(result){
                
                //if everything is ok
                if(result){
                    $(btnDelete).removeClass('btn-danger').addClass('btn-success');
                    $(btnDelete).find('i').removeClass('fa-times').addClass('fa-check');
                    $(btnDelete).append('<span> Deleted!</span>');
                }
            });
        }
    });

});