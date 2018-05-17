$(document).ready(function () {
    $('.delete-article').on('click', function (data) {
        $.ajax({
            type: 'DELETE',
            url: 'articles/' + $(this).data('id'),

            success: function(response){
                window.location.replace('/')
            },
            error: function(err) {
                alert('delete fail')
            }

        });

    })
});