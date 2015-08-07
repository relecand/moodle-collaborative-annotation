require(['jquery'], function(jQuery) {
    //TODO: Rename the plugin after it is completed
    //TODO: Rewrite the subscriptions as functions to improve readability
    Annotator.Plugin.Storage = function(element) {
        return {
            pluginInit: function() {
                this.annotator.subscribe("beforeAnnotationCreated", function(annotation) {
                        annotation.url = getQueryVariables("id");
                    })
                    .subscribe("annotationCreated", function(annotation) {
                        jQuery.post("./annotator/create.php", JSON.parse(JSON.stringify(annotation)), function(data) {
                            data = JSON.parse(data);
                            annotation.username = data.username;
                            annotation.timecreated = timeConverter(data.timecreated);
                            annotation.id = data.id;
                            console.info("The annotation: %o has just been created!", annotation);
                        });
                    })
                    .subscribe("annotationUpdated", function(annotation) {
                        jQuery.post("./annotator/update.php", JSON.parse(JSON.stringify(annotation)), function(data) {
                            if (data == 0) {
                                //Incorrect user logged in
                                console.error("The annotation couldn't be updated");
                                alert("Warning: You cannot edit annotations created by others!");
                            } else {
                                annotation.timecreated = timeConverter(data); //Update the time displayed
                                console.info("The annotation: %o has just been updated! Any changes you make won't be saved!", annotation);
                            }
                        });
                    })
                    .subscribe("annotationDeleted", function(annotation) {
                        //Check if the annotation actually exists (workaround annotatorjs bug #258)
                        if (annotation.id) {
                            var post_data = {
                                id: annotation.id
                            };
                            jQuery.post("./annotator/delete.php", post_data, function(data) {
                                if (data == 1) {
                                    console.info("The annotation: %o has just been deleted!", annotation);
                                } else {
                                    console.error("The annotation couldn't be deleted");
                                    alert("Warning: You cannot delete annotations created by others! Any changes you make won't be saved!");
                                }
                            });
                        } else {
                            //Event was called when user clicked cancel. Do nothing.
                        }
                    })
                    /*.subscribe("annotationViewerTextField", function(field, annotation) {
                        field.innerHTML += "<br>";
                        field.innerHTML += "<span style='text-align:right'>" + annotation.username + "</span><br>";
                        field.innerHTML += "<span style='text-align:right'>" + annotation.timecreated + "</span>";
                    }) Use this if the other way takes up too much space*/
                    ;
            }
        }
    };

    /**
      * Simple plugin that displays the time an annotation was craeted and the user who created it
      */
    Annotator.Plugin.ExtraData = function(element) {
        var plugin = {};
        plugin.pluginInit = function() {
            this.annotator.viewer.addField({
                load: function(field, annotation) {
                    field.innerHTML = annotation.username;
                }
            })
            this.annotator.viewer.addField({
                load: function(field, annotation) {
                    field.innerHTML = annotation.timecreated;
                }
            })
        }
        return plugin;
    }


    var annotator_content = jQuery("#annotator-content").annotator();
    annotator_content.annotator('addPlugin', 'Filter'); //May need to rewrite the Filter plugin
    annotator_content.annotator('addPlugin', 'ExtraData');
    annotator_content.annotator('addPlugin', 'Storage');
    annotator_content.annotator('addPlugin', 'Tags');
    annotator_content.annotator('addPlugin', 'Unsupported');

    //Load the existing annotations when the page is loaded
    jQuery(document).ready(function() {
        var post_data = {
            url: getQueryVariables("id")
        }
        jQuery.post("./annotator/load.php", post_data, function(data) {
            //Load the annotations from the database
            data = JSON.parse(data);
            console.log('Data loaded from server: %o', data);
            for (var i = 0; i < data.length; i++) {
                var annotation = data[i];
                annotation.text = annotation.annotation;
                delete annotation.annotation;
                annotation.ranges = JSON.parse(annotation.ranges);
                annotation.highlights = JSON.parse(annotation.highlights);
                annotation.tags = JSON.parse(annotation.tags);
                annotation.timecreated = timeConverter(annotation.timecreated);

                //Load them one by one
                annotator_content.annotator('loadAnnotations', [annotation]);
            }
        });
    });
});

/**
  * Gets a GET variable from the current URL
  */
function getQueryVariables(variable) {
    var query = window.location.search.substring(1);
    var vars = query.split("&");
    for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split("=");
        if(pair[0] == variable) {
            return pair[1];
        }
    }
    return false;
}



/**
 * Converts a UNIX timestamp into readable format
 */
function timeConverter(UNIX_timestamp) {
    var a = new Date(UNIX_timestamp * 1000);
    var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    var year = a.getFullYear();
    var month = months[a.getMonth()];
    var date = a.getDate();
    var hour = a.getHours();
    if (hour < 10) {
        hour = "0" + hour;
    }
    var min = a.getMinutes();
    if (min < 10) {
        min = "0" + min;
    }
    var time = date + ' ' + month + ' ' + year + ' ' + hour + ':' + min;
    return time;
}