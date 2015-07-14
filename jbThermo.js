function showLoginBox() {
    jQuery('#content').append(
        '<label>Login <input type="text" name="user_login" id="user_login"/></label><br/><br/>'
    );
    jQuery('#content').append(
        '<label>Pass  <input type="password" name="user_password" id="user_password"/></label><br/><br/>'
    );
    jQuery('#content').append(
        '<input type="submit" class="submitButton" value="Login"/>');
}

function hideLoginBox() {
    jQuery('#content').html('');
    jQuery('#content').append(
        '<input style="float:right;" type="submit" id="logout" value="Logout"/>'
    );
    jQuery('#content').append(
        '<div style="clear:both;"></div><table><tbody><tr><td>Current Temp</td><td><span class="currentTemp"></span></td></tr>' +
        '<tr><td>Desired Temp</td><td><input type="text" class="desiredTemp" name="desiredTemp"/></td></tr>' +
        '<tr><td>Fan Speed (1 , 2 , 3)</td><td><input type="text" class="fanSpeed" name="fanSpeed"/></td></tr></tbody></table><input type="submit" class="saveDesired" value="SAVE"/>'
    );
    getCurrentTemp();
    getCurrentSettings();
}

function displayMsg(msg) {
    jQuery('#infoBox').html(msg);
    jQuery('#infoBox').html(jQuery('#infoBox').text());
}

function checkLoggedIn() {
    jQuery.ajax({
        url: jbThermo.ajaxurl,
        method: 'post',
        data: {
            action: 'jbt_remoteLoginCheck',
        },
        success: function(response) {
            if (response.trim() == "false") {
                showLoginBox()
            } else {
                hideLoginBox();
            }
        }
    });
}

function getCurrentTemp() {
    jQuery.ajax({
        url: jbThermo.ajaxurl, //passed through wp_localize
        method: 'post', //set depending what your wp_ajax funcitons are expecting
        data: {
            action: 'jbt_getCurrentTemp', //the action name you specified in your plugins wp_ajax function
        },
        success: function(response) {
            jQuery('.currentTemp').text(response.trim()); //place the response on the page using jQuery
        },
        error: function() {
            displayMsg('You failed to retrieve currentTemp please try again');
        }
    });
}

function getCurrentSettings() {
    jQuery.ajax({
        url: jbThermo.ajaxurl,
        method: 'post',
        data: {
            action: 'jbt_getCurrentSettings',
        },
        success: function(response) {
            var rObj = jQuery.parseJSON(response.trim());
            jQuery('.desiredTemp').val(rObj.desiredTemp);
            jQuery('.fanSpeed').val(rObj.desiredFanSpeed);
        },
        error: function() {
            displayMsg(
                'You failed to retrieve settings, please try again.'
            );
        }
    });
}

function setDesiredSettings() {
    jQuery.ajax({
        url: jbThermo.ajaxurl,
        method: 'post',
        data: {
            action: 'jbt_setDesiredSettings',
            jbtDesiredTemp: jQuery('.desiredTemp').val(),
            jbtDesiredFanSpeed: jQuery('.fanSpeed').val()
        },
        success: function(response) {
            displayMsg(
                'Successfully saved thermostat settings!');
        },
        error: function() {
            displayMsg(
                'You failed to save settings, please try again.'
            );
        }
    });
}
jQuery('body').html(
    '<div id="jbtHead" style="width:100%;height:40px;background:#333;border-bottom:2px solid black;color:white;line-height:40px;font-size:20px;text-align:center;">ThermoStat</div><div id="content" style="width:98%;margin:0 auto;margin-top:10px;"></div><div id="infoBox" style="width:98%;margin:0 auto;margin-top:10px;"></div>'
);
jQuery(document).ready(function() {
    checkLoggedIn();
    jQuery(document).on('click', '.saveDesired', function() {
        setDesiredSettings();
    });
    jQuery(document).on('click', '#logout', function() {
        window.location = jbThermo.logouturl;
    });
    jQuery(document).on('click', '.submitButton', function() {
        displayMsg('attempting log in as: ' + jQuery(
            '#user_login').val());
        jQuery.ajax({
            url: jbThermo.ajaxurl,
            method: 'post',
            data: {
                action: 'jbt_remoteLogin',
                user_login: jQuery('#user_login').val(),
                user_password: jQuery('#user_password')
                    .val()
            },
            success: function(response) {
                var rObj = jQuery.parseJSON(
                    response.trim());
                if (rObj.status == 'success') {
                    displayMsg('');
                    checkLoggedIn();
                } else {
                    displayMsg(
                        'you didnt log in because of ' +
                        rObj.message);
                }
            },
            error: function() {
                displayMsg(
                    'You failed to login, please try again'
                );
            }
        });
    });
});