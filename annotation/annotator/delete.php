<?php
// This file is part of mod_annotation
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// Moodle is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with Moodle.  If not, see <http://www.gnu.org/licenses/>.

/**
 * Deletes an annotation from the server
 * Sepecified by id number in POST request
 *
 * @package   mod_annotation
 * @copyright 2015 Jamie McGowan
 * @license   http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

if (!empty($_POST['id'])) {
    require_once(__DIR__ . "../../../../config.php");
    require_login();

    global $CFG, $DB, $USER;

    $userid = $USER->id; // Gets the current users id.
    $annotationid = $_POST['id'];

    $params = array(
                    "id" => $annotationid,
                    "userid" => $userid
                   );

    $table = "annotation_annotation";
    $count = $DB->count_records($table, $params);

    // If the user logged in didn't create the annotation $count will be 0.
    if ($count) {
        $result = $DB->delete_records($table, $params);

        // Delete the comments attatched to this annotaton.
        $sql = "DELETE FROM mdl_annotation_comment WHERE annotationid=?";
        $DB->execute($sql, array($annotationid));

        echo "1"; // Return success response.
    } else {
        echo "0"; // Return failure response.
    }
} else {
    http_response_code(400);
}
