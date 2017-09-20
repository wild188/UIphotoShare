$(document).ready(function(){
        fetchPhotos();
});


var selected = false;
var toDelete = [];

(document.getElementById("delButton")).style.visibility = "collapse";
(document.getElementById("cancel")).style.visibility = "collapse";

function fetchPhotos()
{

    // get the div where the i6ages should go
    var $tn_div = $("#thumbs");
    // just in case there's anything still in the thumbnails div, clear it out
    $tn_div.empty();

    // retrieve images from the database
    $endpoint = $path_to_backend + 'getPhotos.php';
    $.getJSON($endpoint, function(data)
    {
        jQuery.each(data, function(key, val)
        {
            console.log($path_to_backend + val.tn_src);
            // append the images to the div, and make them clickable for details
            $("<img />")
                .attr("src", $path_to_backend + val.tn_src)
                .attr("id", val.id).appendTo($tn_div)
                .attr("class", "tn")
                //.attr("width", "120")
                .css("padding", "12")
                .css("margin", "auto")
                .css("vertical-align", "middle");
                //.wrap('<a href="viewPhoto.html?id=' + val.id + '"></a>');

                if($("#"+val.id).height() > $("#"+val.id).width()){
                    $("#"+val.id).attr("height", "120");
                } else {
                    $("#"+val.id).attr("width", "120");                    
                }
            });
            
    });
    
};


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

    $(".tn").off();
    toDelete = [];
    (document.getElementById("delButton")).style.visibility = "hidden";
    (document.getElementById("cancel")).style.visibility = "hidden";

});

$(document.getElementById("select")).on('click', function()
{

    $(".tn").on('click', function(){
        toDelete.push($(this).attr('id'));
        console.log(toDelete);
        console.log(toDelete.length);
        if(toDelete.length > 0){
            (document.getElementById("delButton")).style.visibility = "visible";
            (document.getElementById("cancel")).style.visibility = "visible";
        }

        $(this).css("border-style", "solid");
        

    })
});