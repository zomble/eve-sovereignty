<?php

// Load system, and system jump data from tsv file generated from CCP data dump.

class System {
	public $id;
	public $name;

	public $x;
	public $y;
	public $z;

	public $jumps = array();
}

$cleanFloat = function ($v) { return (float) sprintf('%F', floatval($v) / 1000); };

$SystemMap = array(
	array('regionID', null),
	array('constellationID', null),
	array('solarSystemID', 'id', function ($v) { return (int) $v; }),
	array('solarSystemName', 'name'),
	array('x', 'x', $cleanFloat),
	array('y', 'y', $cleanFloat),
	array('z', 'z', $cleanFloat),
	array('xMin', null),
	array('xMax', null),
	array('yMin', null),
	array('yMax', null),
	array('zMin', null),
	array('zMax', null),
	array('luminosity', null), // 'size'),
	array('border', null),
	array('fringe', null),
	array('corridor', null),
	array('hub', null),
	array('international', null),
	array('regional', null),
	array('constellation', null),
	array('security', null),
	array('factionID', null), // 'faction'),
	array('radius', null),
	array('sunTypeID', null),
	array('securityClass', 'sec')
);

$Systems = array();

$row = 0;
if (($handle = fopen('eve-data/systems.tsv', 'r')) !== false) {
    while (($data = fgetcsv($handle, 0, "\t")) !== false) {
        $num = count($data);
    //    echo "<p> $num fields in line $row: <br /></p>\n";
        $row++;
		if ($row == 1) {
			continue;
		}
		$System = new System();
        for ($r = 0; $r < $num; $r++) {
         //   echo $data[$c] . " ";
			$prop = $SystemMap[$r][1];
			if (is_null($prop)) {
				continue;
			}

			$value =  $data[$r];

			if (isset( $SystemMap[$r][2]) && is_callable($SystemMap[$r][2])) {
				$value =  $SystemMap[$r][2]($value);
			}

			$System->$prop = $value;
        }

		if ($System->sec == 'NULL') {
			continue;
		}

		unset($System->sec);

		$id = (int) $System->id;
		unset($System->id);

		$Systems[$id] = $System;
		echo $row."\n";
    }
    fclose($handle);
}

$row = 0;
if (($handle = fopen('eve-data/system-jumps.tsv', 'r')) !== false) {
    while (($data = fgetcsv($handle, 0, "\t")) !== false) {
        $row++;
		if ($row == 1) {
			continue;
		}
		echo $row."\n";
		$id = (int) $data[2];

		if (!isset($Systems[$id])) {
			continue;
		}

		if (!isset($Systems[(int) $data[3]])) {
			continue;
		}

		// Need to remove duplicates.
		if (in_array($id, $Systems[(int) $data[3]]->jumps)) {
			continue;
		}

		$Systems[$id]->jumps[] = $data[3];
    }
    fclose($handle);
}

file_put_contents('public/shared/systems.json', json_encode($Systems));

