<?php

/**
 * Updates the text of an annotation. The annotation
 * is specified by an id number in a PUT request.
 * 
 */

if(!empty($_POST)) {
	require_once(__DIR__ . "../../../../config.php");
	require_login();

	global $CFG, $DB, $USER;
	$userid = $USER->id;
	if($userid == $_POST['userid']) {
		$annotation = new stdClass();
		$annotation->id = $_POST['id'];
		$annotation->annotation = htmlentities($_POST['text']);
		$annotation->timecreated = time();
		$annotation->tags = htmlentities(json_decode($_POST['tags'])); //TODO
		$table = "annotation_image";
		$DB->update_record($table, $annotation);

		echo json_encode($annotation);
	}
	else {
		echo "0";
	}
}