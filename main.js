var selected = false;
var toDelete = [];
var multiMode = false;
var vis = "hidden";

$(document).ready(function(){
         fetchPhotos();
        $('.modal').modal();
        multiMode = false;
});


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



function showPhoto(photoID) {
    if (!multiMode) {
        $("#modal1").modal("open");
        getPhoto(photoID, $("#photoDiv"), $("#descriptionDiv"));
        $("#singleDelete").off("click");
        $("#singleDelete").html("Delete");
        //$("#singleDelete").addClass("modal-action modal-close");
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
    modalwidth =  $("#modal1").width();
    $.getJSON($endpoint, function(data)
    {
        var photo = data[0];
        console.log(modalheight);
        imageTag.empty();
        $("<img />")
        .attr("src", $path_to_backend + photo.src)
        .attr("class", "photoView")
        .css('max-height', modalheight * .7)
        .css('max-width', modalwidth * .9)
        //.height(modalheight * .7)
        //.width(modalwidth * .9)
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
    //$("#singleDelete").removeClass("modal-action modal-close");
    $("#singleDelete").html("Cancel");
    $("#singleDelete").off("click");
    $("#singleDelete").click(function(event){
        event.stopPropagation();
        showPhoto(photoID)});
    //$("#singleDelete").addClass("");
    //$("#exitModal").addClass("disabled");
    $("#edit").off("click");
    $("#edit").html("Submit Change");

    var oldDescription = $("#photoDescription").text();
    $("#descriptionDiv").empty();
    $("<input/>")
        .attr("id", "editDescription")
        //.attr("class", "disabled")
        .attr("type", "text")
        //.prop('disabled', true)//.attr("disabled")
        .val(oldDescription)
        //.html(photo.description)
        .appendTo($("#descriptionDiv"));
    
        console.log($("#photoDescription").text());
        $("#editDescription").focus();


    $("#edit").click(function(){
        updateDescription(photoID, $("#editDescription").val())
    });

}

function uploadPhoto(photoFile, description){
    $endpoint = $path_to_backend + 'uploadPhoto.php';
    $.post($endpoint, {fuplaod: photoFile, description: description}, function(data){
        console.log(data);
        //fetchPhotos();
    });
}

function deletePhoto(photoID){
    $endpoint = $path_to_backend + 'deletePhoto.php';
    $.post($endpoint, {id: photoID}, function(data){
        console.log(data);
    });
    if(!multiMode)
        fetchPhotos();
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

$(document.getElementById("fileinput")).change(function()
{
    var input = $("#fileinput");
    if(!input.prop("files")){
        console.log(input);
        return;
    }
    $("#uploadProgress").hide();
    $("#uploadsubmit").show();
    console.log($("#fileinput").prop("files")[0]);
    $("#uploadmodal").modal("open");
    modalheight = $("#uploadmodal").height();
    var imageTag = $("#uploadphotodiv");
    imageTag.empty();
    var reader = new FileReader();
    
    reader.onload = function (e) {
        $("<img />")
            .attr("src", e.target.result)
            .attr("class", "photoView")
            .height(modalheight * .7)
            .appendTo(imageTag);
    };
    
    reader.readAsDataURL(input.prop("files")[0]);
    $("#uploadDescriptionDiv").empty();
    $("<input/>")
        .attr("id", "uploadDescription")
        //.attr("class", "disabled")
        .attr("type", "text")
        //.prop('disabled', true)//.attr("disabled")
        //.html(photo.description)
        .appendTo($("#uploadDescriptionDiv"));
    $("#uploadDescription").focus();
});

$("#uploadsubmit").click(function(){
    var description = $("#uploadDescription").val();
    console.log("Submitting a photo: " + description);
    $("#description").val(description);
    $("#uploadsubmit").hide();
    $("#uploadProgress").show();
    $("#uploadPic").click();
});

//$(':button').on('click', function() 
$(document.getElementById("uploadPic")).on('click', function()
{
    // for data, we want to submit the photo and the description
    var photoFormData = new FormData(document.forms['uploader']);
    console.log(document.forms['uploader']);
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
                        var progress = (e.loaded * 100 / e.total) + "%"
                        console.log(progress);
                        $('#progress').width(progress);
                    }
                } , false);
            }
            myXhr.onreadystatechange = function()
            {
                if (myXhr.readyState == 4 && myXhr.status == 200)
                {
                    console.log(myXhr.responseText); // Another callback here
                    fetchPhotos();
                    $("#uploader")[0].reset();
                    $("#uploadmodal").modal("close");
                }
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

$(document.getElementById("tn")).on('click', function(){
    if(multiMode){

    }
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
            $(this).css("border", "solid red");

        } else {
            toDelete.splice(toDelete.indexOf(current), 1);
            //remove x
            $(this).css("border", "none");
            
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
// fetchPhotos();
    toDelete = [];
    (document.getElementById("delButton")).style.visibility = "hidden";
    (document.getElementById("cancel")).style.visibility = "hidden";

});

