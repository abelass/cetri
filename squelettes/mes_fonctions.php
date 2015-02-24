<?php


// Personnalisation de la puce par défaut
$GLOBALS['puce'] = '<P class="tiret">';


//  le filtre : [(#ID_RUBRIQUE|auteurs_rubrique)]
//  retourne, sous forme de tableau, la liste des
//  id_auteur des auteurs ayant au moins un article publié
//  dans la rubrique concernée.
//  attention : SEULE la rubrique donnée en paramètre
//  du filtre est concernée ; PAS ses sous-rubriques.
function auteurs_rubrique($rub) {
 $aut_rub = array();
 $rub = intval($rub);
 $req = spip_query("SELECT spip_auteurs_articles.id_auteur AS aut
     FROM spip_auteurs_articles
     INNER JOIN spip_articles
     ON spip_auteurs_articles.id_article = spip_articles.id_article
     WHERE spip_articles.statut = 'publie'
     AND spip_articles.id_rubrique = '$rub'
     GROUP BY spip_auteurs_articles.id_auteur
     ORDER BY spip_auteurs_articles.id_auteur");
 while ($res = spip_fetch_array($req)) {
   $aut_rub[] = $res['aut'];
 }
 return (count($aut_rub) > 0) ? $aut_rub : '';
}

 // ---------------------------------------
// Filtre lastfirstletter
// extrait la première lettre du dernier mot et la passe en majuscules
// ex. marcel duchamp -> D
// ---------------------------------------
function lastfirstletter($texte) {

$texte = $texte{0};

  
  
	// remplacement des caractères accentués
	$texte = strtr($texte, "\xA1\xAA\xBA\xBF\xC0\xC1\xC2\xC3\xC5\xC7\xC8\xC9\xCA\xCB\xCC\xCD\xCE\xCF\xD0\xD1\xD2\xD3\xD4\xD5\xD8\xD9\xDA\xDB\xDD\xE0\xE1\xE2\xE3\xE5\xE7\xE8\xE9\xEA\xEB\xEC\xED\xEE\xEF\xF0\xF1\xF2\xF3\xF4\xF5\xF8\xF9\xFA\xFB\xFD\xFF", "!ao?AAAAACEEEEIIIIDNOOOOOUUUYaaaaaceeeeiiiidnooooouuuyy");
	$texte = strtr($texte, array("\xC4"=>"Ae", "\xC6"=>"AE", "\xD6"=>"Oe", "\xDC"=>"Ue", "\xDE"=>"TH", "\xDF"=>"ss", "\xE4"=>"ae", "\xE6"=>"ae", "\xF6"=>"oe", "\xFC"=>"ue", "\xFE"=>"th"));
	$texte = strtoupper($texte);          // tout en majuscules
	if (is_numeric($texte)) $texte = "";  // on supprime les chiffres
	return $texte;
	
} // lastfirstletter

// ajout filtre de tri de tableaux

function array_sort($tableau) {
	sort($tableau);
	return $tableau;
}



//squelettes/mes_fonctions.php
/* on retire les le la etc */
function sansle($texte) {
	$pattern[0]  = "#^Les |La |Le |Lo |The[[:space:]]?#";   
	$pattern[1]  = "#^Lâ€™?#"; //apostrophe utf8
	$pattern[3] = "#^&\#171;?#"; //guillemet
	$pattern[5] = "#^&?#"; //&
	$pattern[2]  = "#^&nbsp;?#"; //espace
	$pattern[6] = "#^[[:space:]]?#"; //&
	$pattern[4]  = "#Â«#"; //guillemet La Â«  
	$texte = preg_replace($pattern, '', $texte); 
	return $texte;
}


/* on ne garde que le la l'*/
function quele($texte){
$txtsanse=sansle(trim($texte));
if ($txtsanse!=trim($texte))
		$texte= str_replace("$txtsanse","","$texte");
		else $texte='';
return trim($texte); 
}

function onelettrebis($chaine) {
$chaine=sansle($chaine); 
$chaine=filtrer_entites($chaine); // si il y a des fois des accents en dur qui trainent
$chaine = unicode2charset(utf_8_to_unicode($chaine), 'iso-8859-1'); // on code en html ISO
    $a = "ÀÁÂÃÄÅàáâãäåÒÓÔÕÖØòóôõöøÈÉÊËèéêëÇçÌÍÎÏìíîïÙÚÛÜùúûüÿÑñ";
    $b = "AAAAAAaaaaaaOOOOOOooooooEEEEeeeeCcIIIIiiiiUUUUuuuuyNn";
$chaine=strtr($chaine, $a, $b); // on retire les accents
$chaine=strtoupper($chaine); // on passe en majuscules 
/// si débute par le fameux Œ ou œ
$pattern = "^(Œ|œ)";
if (eregi($pattern,$chaine,$regs)) 
$chaine='O';//$chaine= $regs[0]; //on va renvoyer la lettre O
else 
$chaine = $chaine{0}; 
    return $chaine ;
}



function couper_suite($texte, $id_article, $url, $titre, $taille=50) {
    $texte = couper($texte, $taille);
    $pattern = "\(\.\.\.\)";
    if(preg_match("'".$pattern."$'", $texte)) {
        $texte = ""
            . preg_replace("'".$pattern."$'", "", $texte)
            . "<a class='lire-suite' title='" . _T('Lire_la_suite_de_') . $titre
            . "' href='$url#texte_$id_article'>(..."
            . _T('Lire_la_suite)')."</a>\n";
    }
    return($texte);
}



/*Filter Name: Reduire_all_images
  Author: Renato Formato
  mail: renatoformato@virgilio.it
  Date: 6/6/2004
  License: GPL
  URL: www.spip-contrib.net?article.php3?id_article=550
*/

function reduire_all_images($texte, $taille = 120,$axes="both") {
  //a week in seconds
  $maint_delay = 3600*24*7; 
  //retrieve last mainteinance time
  $last_maint_date=@filemtime("IMG/last_maint.txt");
  //never done mainteinance. Create last_maint file
  if (!$last_maint_date) {
    $handle=fopen("IMG/last_maint.txt","w");
    fclose($handle);
    $last_maint_date=@filemtime("IMG/last_maint.txt");
  }
  //create resized images
  //Process images with descriptions
  $texte=preg_replace("!(<table .*<div class='spip_documents'>.*)?<img [^>]*src='[^>]*IMG/[^>]*>(?(1).*</table>)!eisU","reduire_image_check('$0',$taille,$axes,$last_maint_date,$maint_delay)",$texte);
  //check last mainteinance+delay<now
  if (($last_maint_date+$maint_delay)<time()) {
    //do maint
    //clear file cache to avoid deleting just touched files
    clearstatcache();
    do_maint("IMG/gif/resized",$last_maint_date);
    do_maint("IMG/jpg/resized",$last_maint_date);
    do_maint("IMG/png/resized",$last_maint_date);
    @touch("IMG/last_maint.txt");
  }
  return $texte;
}

function do_maint($maint_folder,$last_maint_date) {
  //open dir
  if ($handle=@opendir($maint_folder)) {
    //enumerate files in an array
    while (false !== ($file = readdir($handle))) {
      if ($file != "." && $file != "..") {
      $file_array[] = $file;
      }
    }
    closedir($handle);
    //process array of files
    @reset($file_array);
    while (list(,$filename)=@each($file_array)) {
      //check file time
      if (filemtime($maint_folder."/".$filename)<$last_maint_date) @unlink($maint_folder."/".$filename);
    }
  }
}

function reduire_image_check($img_code, $taille = 120,$axes="both",$last_maint_date,$maint_delay) {
  global $new_image_width;
  if (strlen($img_code) > 0) {
		if (substr($img_code,0,6)=="<table") {
      $img_code=preg_replace("!<img [^>]*src='[^>]*IMG/[^>]*>!ei","reduire_image_ex('$0',$taille,$axes,$last_maint_date,$maint_delay)",$img_code);
		  //Change table cell width value
      if ($new_image_width!=0) {
        $img_code=preg_replace("!(<td [^>]*)(width[^>]*)(>\n<div class='spip_documents'>.*</td>)!is","\\1width='$new_image_width'\\3",$img_code);  
      }
      return $img_code;
    } else return reduire_image_ex($img_code,$taille,$axes,$last_maint_date,$maint_delay);    
  }  
}

function reduire_image_ex($img, $taille = 120,$axes="both",$last_maint_date,$maint_delay) {
  global $new_image_width;
  $new_image_width=0;
  if (strlen($img) > 0) {
		
    // recuperer le nom du fichier
		if (eregi("src=\'([^']+)\'", $img, $regs)) $logo = $regs[1];
		if (eregi("align=\'([^']+)\'", $img, $regs)) $align = $regs[1];
		if (eregi("name=\'([^']+)\'", $img, $regs)) $name = $regs[1];
		if (eregi("hspace=\'([^']+)\'", $img, $regs)) $espace = $regs[1];

		if (file_exists($logo)) {
			$logo = substr($logo, 4, strlen($logo));
			// recuperer nom de l'image et sa terminaison
			$path = dirname($logo);
			if ($path!="") $path=$path."/resized/";
			if (!is_dir("IMG/$path")) @mkdir("IMG/$path");
      $basename = basename($logo);
      $nom = substr($basename, 0, strpos($basename, "."));
			$format = substr($basename, strlen($basename)-3, strlen($basename));
		
		  $axes=strtolower($axes);
		  if ($axes!="both" && $axes!="x" && $axes!="y") $axes="both";
			// test de recalcul en fonction des dates des fichiers
			// pour verifier si mise a jour plus recente du logo
			$imagefile="IMG/$path$taille-$axes-$nom.$format";
      if (file_exists($imagefile)) {
				$imagetime=filemtime($imagefile);
        if ($imagetime > filemtime("IMG/$logo")) {
					//check filetime and touch if filetime>last maiteinance time + half delay
          if ($imagetime<($last_maint_date+$maint_delay/2) and time()>($last_maint_date+$maint_delay/2)) touch($imagefile);
          //store image width
          list($new_image_width)=getimagesize($imagefile);
          return "<img src='$imagefile' name='$name' border='0' align='$align' alt='' hspace='$espace' vspace='$espace' class='spip_logos' />";
          $recalculer = false;
				}
				else {
					$recalculer = true;
				}
			} else {
				$recalculer = true;
			}
		
			$gd_formats = lire_meta("gd_formats");
			if ($recalculer AND ereg($format, $gd_formats)) {
				// Recuperer l'image d'origine
				if ($format == "jpg") {
					$srcImage = ImageCreateFromJPEG("IMG/$logo");
				}
				else if ($format == "gif"){
					$srcImage = ImageCreateFromGIF("IMG/$logo");
				}
				else if ($format == "png"){
					$srcImage = ImageCreateFromPNG("IMG/$logo");
				}
				if (!$srcImage) return;

				// Calculer le ratio
				$srcWidth = ImageSX($srcImage);
				$srcHeight = ImageSY($srcImage);
			
				if (($srcWidth > $taille && ($axes=="both" OR $axes=="x")) OR ($srcHeight > $taille && ($axes=="both" OR $axes=="y"))) {
          $ratioWidth = $srcWidth/$taille;
					$ratioHeight = $srcHeight/$taille;
				
					//Ridimensiono da altezza (solo se axes!=x)
          if ($ratioWidth < $ratioHeight && $axes!="x") {
						$destWidth = floor($srcWidth/$ratioHeight);
						$destHeight = $taille;
					}
					else {
						$destWidth = $taille;
						$destHeight = floor($srcHeight/$ratioWidth);
					}
					$new_image_width=$destWidth;
				} else {
					return $img;
				}
				
				// Initialisation de l'image destination
				if ($GLOBALS['flag_ImageCreateTrueColor'] AND $destFormat != "gif")
					$destImage = ImageCreateTrueColor($destWidth, $destHeight);
				if (!$destImage)
					$destImage = ImageCreate($destWidth, $destHeight);
				// Recopie de l'image d'origine avec adaptation de la taille
				$ok = false;
				if ($GLOBALS['flag_ImageCopyResampled'])
					$ok = ImageCopyResampled($destImage, $srcImage, 0, 0, 0, 0, $destWidth, $destHeight, $srcWidth, $srcHeight);
				if (!$ok)
					$ok = ImageCopyResized($destImage, $srcImage, 0, 0, 0, 0, $destWidth, $destHeight, $srcWidth, $srcHeight);
			
				// Sauvegarde de l'image destination
				$destination = $imagefile;
				if ($format == "jpg") {
					ImageJPEG($destImage, $destination, 70);
				}
				else if ($format == "gif") {
					ImageGIF($destImage, $destination);
				}
				else if ($format == "png") {
					ImagePNG($destImage, $destination);
				}
				ImageDestroy($srcImage);
				ImageDestroy($destImage);

				return "<img src='$destination' name='$name' border='0' align='$align' alt='' hspace='$espace' vspace='$espace' class='spip_logos' />";
			} else {
				$taille_origine = @getimagesize("IMG/$logo");
				if ($taille_origine) {
					// Calculer le ratio
					$srcWidth = $taille_origine[0];
					$srcHeight = $taille_origine[1];
				
					if (($srcWidth > $taille && ($axes=="both" OR $axes=="x")) OR ($srcHeight > $taille && ($axes=="both" OR $axes=="y"))) {
						$ratioWidth = $srcWidth/$taille;
						$ratioHeight = $srcHeight/$taille;
					
						if ($ratioWidth < $ratioHeight && $axes!="x") {
							$destWidth = floor($srcWidth/$ratioHeight);
              $destHeight = $taille;
						}
						else {
							$destWidth = $taille;
							$destHeight = floor($srcHeight/$ratioWidth);
						}
						$new_image_width=$destWidth;
					} else {
						$destWidth = $srcWidth;
						$destHeight = $srcHeight;
					}
					return "<img src='IMG/$logo' name='$name' width='$destWidth' height='$destHeight' border='0' align='$align' alt='' hspace='$espace' vspace='$espace' class='spip_logos' />";
				}
			}
		}
	}
}

?>
