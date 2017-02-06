<?php

header("Expires: Mon, 26 Jul 1997 05:00:00 GMT");
header("Last-Modified: ".gmdate("D, d M Y H:i:s")." GMT");
header("Cache-Control: no-cache, must-revalidate");
header("Pragma: no-cache");
header('Content-type: image/png');

try
{
	readfile('http://www.geomsp.qc/carto/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=orthos&STYLE=default&FORMAT=image/png&TILEMATRIXSET='.$_REQUEST['TILEMATRIXSET'].'&TILEMATRIX='.$_REQUEST['TILEMATRIX'].'&TILEROW='.$_REQUEST['TILEROW'].'&TILECOL='.$_REQUEST['TILECOL']);
}
catch (Exception $e)
{
    echo 'Caught exception: ',  $e->getMessage(), "\n";
}

?>
