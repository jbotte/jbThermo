<?php
/**
* Plugin Name: ThermoStat Ajax App
* Plugin URI: http://jbotte.com/
* Description: This simple plugin creates a quick admin page for managing desired thermostat temperatures. It utilizes wp_ajax to allow for endpoints where you can set desired temperature and fan speed via an app or mobile web as well as retrieve the current temperature. 
* Version: 1.0 
* Author: John Botte
* Author URI: jbotte.com
* License: W.E.
*/


header('Access-Control-Allow-Origin: *');  

add_action('wp_ajax_jbt_remoteLoginCheck','jbt_remoteLoginSuccess');
add_action('wp_ajax_nopriv_jbt_remoteLoginCheck','jbt_remoteLoginFail');
 
function jbt_remoteLoginSuccess() {
    
    echo 'true';
    die();
	
}

function jbt_remoteLoginFail() {
    
    echo 'false';
    die();
	
}

add_action('wp_ajax_jbt_remoteLogin','jbt_remoteLogin');
add_action('wp_ajax_nopriv_jbt_remoteLogin','jbt_remoteLogin');
 
function jbt_remoteLogin() {
    
    
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $creds = $_POST;
    }
    else
    {
        $creds = $_GET;
    }
    
    
    if($creds['user_login'])
    {
   
	$creds['remember'] = true;
	$user = wp_signon( $creds, false );
	    if ( is_wp_error($user) )
        {
            $result['status']= 'error';
            $result['message'] = $user->get_error_message();
        }
        else
        {
             $result['status']= 'success';
             $result['message'] = 'logged in!';
        }
    }
    else
    {
        $result['status']='error';
        $result['message']='you are missing params';
    }
    
    echo json_encode($result);
    die();
    
	
	
}


add_action('wp_ajax_nopriv_jbt_getCurrentTemp','jbt_getCurrentTemp');
add_action('wp_ajax_jbt_getCurrentTemp','jbt_getCurrentTemp');

function jbt_getCurrentTemp()
{
    echo trim(get_option('jbtCurrentTemp'));
    die();
} 

//allow for no priv since just a retrieval funciton no vunerability exposing this data
add_action('wp_ajax_nopriv_jbt_getCurrentSettings','jbt_getCurrentSettings');
add_action('wp_ajax_jbt_getCurrentSettings','jbt_getCurrentSettings');

function jbt_getCurrentSettings()
{
    //create an array of current settings
    $currentSettings = array();
    $currentSettings['desiredTemp'] = get_option('jbtDesiredTemp');
    $currentSettings['desiredFanSpeed'] = get_option('jbtDesiredFanSpeed');
    echo trim(json_encode($currentSettings));
    die();
}

//only using wp_ajax, not including wp_ajax_nopriv
//due to security, only want logged in user modifying thermostat
add_action('wp_ajax_jbt_setDesiredSettings','jbt_setDesiredSettings');

function jbt_setDesiredSettings()
{
    $desiredTemp = trim($_POST['jbtDesiredTemp']);
    $desiredFanSpeed = trim($_POST['jbtDesiredFanSpeed']);
    
    if($desiredTemp)
    {
        update_option('jbtDesiredTemp',$desiredTemp);
    }
    
    if($desiredFanSpeed)
    {
        update_option('jbtDesiredFanSpeed', $desiredFanSpeed);
    }
    
    die();
}






function jbtEnqueueJS()
{   
    wp_enqueue_script(
        //name the script (allows you to reference it later to use as dependency or to de-register
		'jbThermo',
        //reference the theme directory, if enqueuing using a plugin you are developing use plugins_url();
		 plugins_url( 'jbThermo.js', __FILE__ ),
        //list dependencies to load before your js is loaded
		array( 'jquery' ),
        //version
        '1.0',
        //set if the script is loaded in the header or footer (true for footer, false for header) 
        true
	);


    // Localize the script with new data
    $localized_data = array(
        'ajaxurl' => admin_url( 'admin-ajax.php' ),
        'logouturl' => wp_logout_url( home_url() )
    );

    wp_localize_script( 'jbThermo', 'jbThermo', $localized_data );

    
    
}

//hook the function you just wrote
add_action( 'wp_enqueue_scripts', 'jbtEnqueueJS' );






function jbThermo_activate()
{
    update_option('jbtDesiredTemp','75');
    update_option('jbtDesiredFanSpeed','1');
    update_option('jbtCurrentTemp', '77');
}


register_activation_hook( __FILE__, 'jbThermo_activate' );

?>