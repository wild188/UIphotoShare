$(document).ready(function(){
        fetchPhotos();
        $('.modal').modal();
});


var selected = false;
var toDelete = [];
var multiMode = false;
var vis = "hidden";

(document.getElementById("delButton")).style.visibility = "collapse";
(document.getElementById("cancel")).style.visibility = "collapse";

function fetchPhotos()
{

    // get the div where the images should go
    var $tn_div = $("#thumbs");
    // just in case there's anything still in the thumbnails div, clear it out
    $tn_div.empty();

    // retrieve images from the database
    $endpoint = $path_to_backend + 'getPhotos.php';
    $.getJSON($endpoint, function(data)
    {
        jQuery.each(data, function(key, val)
        {
            //console.log($path_to_backend + val.tn_src);
            // append the images to the div, and make them clickable for details
            $("<img />")
                .attr("src", $path_to_backend + val.tn_src)
                .attr("id", val.id)
                .attr("class", "modal-trigger tn")
                .attr("onclick", "showPhoto(" + val.id + ")")  //
                //.attr("href", "#modal1")
                //.attr("width", "120")
                .css("padding", "12")
                .css("margin", "auto")
                .css("vertical-align", "middle").appendTo($tn_div)
                //.wrap('<a href="viewPhoto.html?id=' + val.id + '"></a>');

                if($("#"+val.id).height() > $("#"+val.id).width()){
                    $("#"+val.id).attr("height", "120");
                } else {
                    $("#"+val.id).attr("width", "120");                    
                }

                
            });
            
    });

    
};


// function fetchPhotos(src)
// {
//     document.getElementById("xImg").style.visibility = "collapse";
//
//     // get the div where the images should go
//     var $tn_div = $("#thumbs");
//     // just in case there's anything still in the thumbnails div, clear it out
//     $tn_div.empty();
//
//     // retrieve images from the database
//     $endpoint = $path_to_backend + 'getPhotos.php';
//     $.getJSON($endpoint, function(data)
//     {
//         jQuery.each(data, function(key, val)
//         {
//             //console.log($path_to_backend + val.tn_src);
//             // append the images to the div, and make them clickable for details
//             $("<img />")
//                 .attr("src", $path_to_backend + val.tn_src)
//                 .attr("src", src)
//                 .attr("height", "120")
//                // .attr("id", val.id)
//                 .attr("class", "modal-trigger tn")
//                 .css("padding", "12")
//                 .css("margin", "auto")
//                 .css("vertical-align", "middle").appendTo($tn_div);
//             //.wrap('<a href="viewPhoto.html?id=' + val.id + '"></a>');
//
//
//
//         });
//
//     });
//
//
// };

function showPhoto(photoID) {
    if (!multiMode) {
        $("#modal1").modal("open");
        getPhoto(photoID, $("#photoDiv"), $("#descriptionDiv"));
        $("#singleDelete").off("click");
        $("#singleDelete").click(function () {
            deletePhoto(photoID)
        });
        $("#singleDelete").removeClass("disabled");
        $("#exitModal").removeClass("disabled");
        $("#edit").off("click");
        $("#edit").click(function () {
            allowUpdate(photoID)
        });
        $("#edit").html("Edit");
    }
}

function getPhoto(photoID, imageTag, descriptionTag){
    $endpoint = $path_to_backend + 'viewPhoto.php' + '?id=' + photoID;
    modalheight = $("#modal1").height();
    $.getJSON($endpoint, function(data)
    {
        var photo = data[0];
        console.log(modalheight);
        imageTag.empty();
        $("<img />")
        .attr("src", $path_to_backend + photo.src)
        .attr("class", "photoView")
        .height(modalheight * .7)
        .appendTo(imageTag);

        descriptionTag.empty();
        $("<p />")
            .attr("id", "photoDescription")
            .html(photo.description)
            .appendTo(descriptionTag);
    });
}

function updateDescription(photoID, description){
    console.log("Updating description");
    $endpoint = $path_to_backend + 'updatePhoto.php';
    $.post($endpoint, {id: photoID, description: description}, function(data){
        console.log(data);
        showPhoto(photoID);
    });
}

function allowUpdate(photoID){
    $("#singleDelete").addClass("disabled");
    //$("#singleDelete").off("click");
    $("#exitModal").addClass("disabled");
    $("#edit").off("click");
    $("#edit").html("Submit Change");

    $("#descriptionDiv").empty();
    $("<input/>")
        .attr("id", "editDescription")
        //.attr("class", "disabled")
        .attr("type", "text")
        //.prop('disabled', true)//.attr("disabled")
        .val($("#photoDescription").html())
        //.html(photo.description)
        .appendTo($("#descriptionDiv"));

    $("#edit").click(function(){
        updateDescription(photoID, $("#editDescription").val())
    });
}

function deletePhoto(photoID){
    $endpoint = $path_to_backend + 'deletePhoto.php';
    $.post($endpoint, {id: photoID}, function(data){
        console.log(data);
        if(multiMode)
            fetchPhotos();
    });
}

// verification for the file
$(':file').on('change', function() 
{
    var file = this.files[0];
    if (file.size > 10485760)
    {
        alert('Max upload size is 10 MB.');
    }
    // alert(file.name);
    // alert(file.type);
});

//$(':button').on('click', function() 
$(document.getElementById("uploadPic")).on('click', function()
{
    // for data, we want to submit the photo and the description
    var photoFormData = new FormData(document.forms['uploader']);
    $.ajax({
        url: $path_to_backend + 'uploadPhoto.php',
        type: 'POST',
        data: photoFormData,

        // some flags for jQuery
        cache: false,
        contentType: false,
        processData: false,

        // Custom XMLHttpRequest
        xhr: function() {
            var myXhr = $.ajaxSettings.xhr();
            if (myXhr.upload) {
                // For handling the progress of the upload
                myXhr.upload.addEventListener('progress', function(e) {
                    if (e.lengthComputable) {
                        $('progress').attr({
                            value: e.loaded,
                            max: e.total,
                        });
                    }
                } , false);
            }
            return myXhr;
        }
    });
});


$(document.getElementById("cancel")).on('click', function(){

    multiMode = false;
    $(".tn").off();
    toDelete = [];
    (document.getElementById("delButton")).style.visibility = "hidden";
    (document.getElementById("cancel")).style.visibility = "hidden";
    fetchPhotos();

});

$(document.getElementById("select")).on('click', function()
{
    if(vis == "visible")
        vis = "hidden";
    else
        vis = "visible";

    (document.getElementById("delButton")).style.visibility = vis;
    (document.getElementById("cancel")).style.visibility = vis;

    multiMode = true;
    $(".tn").on('click', function(){
        var current = $(this).attr('id');

        if(toDelete.indexOf(current) < 0){
            toDelete.push(current);
            
            //show x
            console.log("x pos: " + $(this).offset().left);
            console.log("y pos: " + $(this).offset().top);

        } else {
            toDelete.splice(toDelete.indexOf(current), 1);
            //remove x
            
        }
        console.log(toDelete);
        console.log(toDelete.length);
        if(toDelete.length > 0){
            (document.getElementById("delButton")).style.visibility = "visible";
            (document.getElementById("cancel")).style.visibility = "visible";
        }


    })
});


function deleteMultiPhoto(photos) {
    for (var i = 0; i < toDelete.length; i++) {
        deletePhoto(toDelete[i]);
    }
    fetchPhotos();
}


$(document.getElementById("delButton")).on('click', function(){

    deleteMultiPhoto(toDelete);
    multiMode = false;

    toDelete = [];
    (document.getElementById("delButton")).style.visibility = "hidden";
    (document.getElementById("cancel")).style.visibility = "hidden";

});

