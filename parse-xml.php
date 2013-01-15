<?php

// Sovereignty

$xml = simplexml_load_file('https://api.eveonline.com/map/Sovereignty.xml.aspx');

$alliances = array();

$data = array();

foreach($xml->result->rowset->row as $row) {

	$alliance = (int) $row['allianceID'];

	if ($alliance < 1) {
		continue;
	}

	$alliances[] = $alliance;

	$data[(int) $row['solarSystemID']] = $alliance;
}

// Remove dups
array_unique($alliances);

file_put_contents('public/shared/sovereignty.json', json_encode($data));

// Kills

$xml = simplexml_load_file('https://api.eveonline.com/map/Kills.xml.aspx');

$data = array();

foreach($xml->result->rowset->row as $row) {

	$shipkills = (int) $row['shipKills'];

	if ($shipkills < 1) {
		continue;
	}

	$data[(int) $row['solarSystemID']] = $shipkills;
}

file_put_contents('public/shared/kills.json', json_encode($data));

// Alliances

$xml = simplexml_load_file('https://api.eveonline.com/eve/AllianceList.xml.aspx');
$data = array();

foreach($xml->result->rowset->row as $row) {
	$alliance = (int) $row['allianceID'];

	if ($alliance < 1) {
		continue;
	}

	if (! in_array($alliance, $alliances)) {
		continue;
	}

	$data[$alliance] = (object) array(
		'name' => $row['name'],
		'shortName' => $row['shortName'],
	);
}

file_put_contents('public/shared/alliances.json', json_encode($data));
