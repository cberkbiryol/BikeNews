$(".icon2").click(function () {
    var newsId = $(this).data('newsid');
    var href = $(this).data('target');
    $(href).data('newsId', newsId);
    getModal(newsId);
});

$(".newComment").on("submit", function (event) {
    event.preventDefault();
    var thisId = $("#commentModal").data("newsId");
    var newComment = {
        comment: $("#commentBody").val(),
        userName: $("#userName").val()
    }
    $.ajax("/news/" + thisId, {
        type: "POST",
        data: newComment
    }).then(function (data) {
        //update the modalv to display the new comment
        getModal(thisId)
        $("#commentBody").val("");
        $("#userName").val("");

    })
});

// reload page to update when closing the modal
$(".close1").on("click", function () {
    location.reload();
})

$(".modal").on("click",".close2",function () {
    var commentId = $(this).data("id");
    var newsId = $("#commentModal").data("newsId");    
    $.ajax("/clear/" + newsId + "/" + commentId, {
        type: "DELETE"
    }).then(function (data) {
        //update the modalv to display the new comment
        getModal(newsId)
    })
})

function getModal(id) {
    $.ajax({
        method: "GET",
        url: "/news/" + id
    })
        .then(function (data) {
            //console.log(data)
            $("#oldcomments").empty();
            if (data) {
                $("#oldcomments").append(data);
            } else {
                $("#oldcomments").append(`<h5 class="text-muted"> No Comments yet </h5>`);
            }

        });
}