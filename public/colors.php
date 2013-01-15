<?php




function HSVtoRGB(array $hsv) {
    list($H,$S,$V) = $hsv;
    //1
    $H *= 6;
    //2
    $I = floor($H);
    $F = $H - $I;
    //3
    $M = $V * (1 - $S);
    $N = $V * (1 - $S * $F);
    $K = $V * (1 - $S * (1 - $F));
    //4
    switch ($I) {
        case 0:
            list($R,$G,$B) = array($V,$K,$M);
            break;
        case 1:
            list($R,$G,$B) = array($N,$V,$M);
            break;
        case 2:
            list($R,$G,$B) = array($M,$V,$K);
            break;
        case 3:
            list($R,$G,$B) = array($M,$N,$V);
            break;
        case 4:
            list($R,$G,$B) = array($K,$M,$V);
            break;
        case 5:
        case 6: //for when $H=1 is given
            list($R,$G,$B) = array($V,$M,$N);
            break;
    }
    return array($R, $G, $B);
}

function RGBtoHEX(array $rgb) {
    list($R,$G,$B) = $rgb;
    $R=str_pad(dechex($R*255), 2, '0', STR_PAD_LEFT);
    $G=str_pad(dechex($G*255), 2, '0', STR_PAD_LEFT);
    $B=str_pad(dechex($B*255), 2, '0', STR_PAD_LEFT);
    return $R.$G.$B;
}
/*
for($i = 0; $i < 5; $i++)
{

$HSV = array(mt_rand() / mt_getrandmax(), 1, 1);

print_r($HSV);

echo '<br>';
$RGB = HSVtoRGB($HSV);

print_r($RGB);

echo '<br>';

$HEX = RGBtoHEX($RGB);

print_r($HEX);


echo '<div style="background:#'.$HEX.';width:50px;height:50px;"></div>';
}
*/


// Load Alliance List.

class Alliance {
	public $id;
	public $name;

	public function __construct() {
		return;
	}
}


$xml = simplexml_load_file('shared/alliance.xml');

$data = array();
$c = 5;

foreach($xml->result->rowset->row as $row) {
#	echo '<pre>';
#	var_dump($row);
#	echo '</pre>';

	$alliance = (int) $row['allianceID'];

	if ($alliance < 1) {
		continue;
	}

	echo $alliance.'<br>';

	$HSV = array(mt_rand() / mt_getrandmax(), 1, 1);

print_r($HSV);

echo '<br>';
$RGB = HSVtoRGB($HSV);

print_r($RGB);

echo '<br>';

$HEX = RGBtoHEX($RGB);

print_r($HEX);

echo '<br>';
	echo $row['name'].'<br><img src="http://image.eveonline.com/Alliance/'.$alliance.'_64.png" alt=""><br>';
	echo '<div style="background:#'.$HEX.';width:50px;height:50px;"></div>';

	$c--;
	if (!$c) {
		break;
	}
}


