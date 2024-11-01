<?php
  /*
    Plugin Name: Shoppable Marketplace
    Description: Makes it easy to setup Shoppable Marketplace and display products and shopping cart. </strong>
    Version: 2.0.1
    Author: Shoppable
    Author URI: http://www.shoppable.com/
  */

// ------------------------------------------------------------------------
// REQUIRE MINIMUM VERSION OF WORDPRESS:
// ------------------------------------------------------------------------
// THIS IS USEFUL IF YOU REQUIRE A MINIMUM VERSION OF WORDPRESS TO RUN YOUR
// PLUGIN. IN THIS PLUGIN THE WP_EDITOR() FUNCTION REQUIRES WORDPRESS 3.3
// OR ABOVE. ANYTHING LESS SHOWS A WARNING AND THE PLUGIN IS DEACTIVATED.
// ------------------------------------------------------------------------

function shoppable_mp_requires_wordpress_version () {
  global $wp_version;
  $plugin = plugin_basename( __FILE__ );
  $plugin_data = get_plugin_data( __FILE__, false );

  if ( version_compare($wp_version, "3.3", "<" ) ) {
    if( is_plugin_active($plugin) ) {
      deactivate_plugins( $plugin );
      wp_die( "'".$plugin_data['Name']."' requires WordPress 3.3 or higher, and has been deactivated! Please upgrade WordPress and try again.<br /><br />Back to <a href='".admin_url()."'>WordPress admin</a>." );
    }
  }
}
add_action( 'admin_init', 'shoppable_mp_requires_wordpress_version' );

// ------------------------------------------------------------------------
// PLUGIN PREFIX:
// ------------------------------------------------------------------------
// 'shoppable_mp_' prefix is derived from Shoppable Marketplace
// ------------------------------------------------------------------------
// REGISTER HOOKS & CALLBACK FUNCTIONS:
// ------------------------------------------------------------------------
// Set-up Action and Filter Hooks

register_activation_hook( __FILE__, 'shoppable_mp_add_defaults' );
register_uninstall_hook( __FILE__, 'shoppable_mp_delete_plugin_options' );

add_action( 'admin_init', 'shoppable_mp_init' );
add_action( 'admin_menu', 'shoppable_mp_add_settings_page' );
add_filter( 'plugin_action_links', 'shoppable_mp_plugin_action_links', 10, 2 );
add_action( 'wp_head','shoppable_mp_inject_shopjs_script', 1);
add_action( 'wp_head','shoppable_mp_inject_css', 2);
add_action( 'wp_head', 'shoppable_mp_bundle');




// --------------------------------------------------------------------------------------
// CALLBACK FUNCTION FOR: register_uninstall_hook(__FILE__, 'shoppable_mp_delete_plugin_options')
// --------------------------------------------------------------------------------------

// Delete options table entries ONLY when plugin deactivated AND deleted
function shoppable_mp_delete_plugin_options () {
  delete_option( 'shoppable_mp_options' );
}

// ------------------------------------------------------------------------------
// CALLBACK FUNCTION FOR: register_activation_hook(__FILE__, 'shoppable_mp_add_defaults')
// ------------------------------------------------------------------------------

// Define default option settings
function shoppable_mp_add_defaults () {
  $tmp = get_option('shoppable_mp_options');
  // added the isset() because of unset array keys on activation
  if( isset( $tmp['chk_default_options_db'] ) && ( $tmp['chk_default_options_db']=='1' ) || ( !is_array($tmp) ) ) {
    delete_option('shoppable_mp_options'); // so we don't have to reset all the 'off' checkboxes too! (don't think this is needed but leave for now)
    $arr = array(
      "token" => "",
      "chk_default_options_db" => "",
      "order_complete_page" => "shoppable.com",
      "campaign" => "wordpress",
      "page_after_complete_page" => "www.shoppable.com",
      "mp_id" => "content",
      "productsPerRow" => 5,
      "rows" => 5
    );
    update_option('shoppable_mp_options', $arr);
  }
}

// ------------------------------------------------------------------------------
// CALLBACK FUNCTION FOR: add_action('admin_init', 'shoppable_mp_init' )
// ------------------------------------------------------------------------------

function shoppable_mp_init (){
  register_setting('shoppable_settings_options', 'shoppable_mp_options', 'shoppable_mp_validate_options');
}

// ------------------------------------------------------------------------------
// Hooks to inject proper Javascript and CSS assets:
// ------------------------------------------------------------------------------

// Inject frame embed script into head for shopping bag/product frame use
function shoppable_mp_inject_shopjs_script () {
  if(!is_admin()) {
    $options = get_option('shoppable_mp_options');
    $src = plugin_dir_url('') . 'shoppable/assets/js/marketplace_bundle.js';
    wp_enqueue_script("jquery");
    wp_register_script('mp_bundle_jquery', $src. "?token=" . $options['token'], array('jquery'), '1.7.1', false);
    wp_enqueue_script ('mp_bundle_jquery' );
  }
}

// inject styles
function shoppable_mp_inject_css() {
  wp_register_style ( 'shoppable_angular_syles', plugin_dir_url('') . 'shoppable/assets/css/angular-material.min.css' );
  wp_enqueue_style  ( 'shoppable_angular_syles' );
  wp_register_style ( 'shoppable_mp_syles', plugin_dir_url('') . 'shoppable/assets/css/marketplace.css' );
  wp_enqueue_style  ( 'shoppable_mp_syles' );
}

// ------------------------------------------------------------------------------
// Hooks to inject proper Javascript and CSS assets:
// ------------------------------------------------------------------------------

function shoppable_mp_bundle() {
  $options = get_option('shoppable_mp_options');
  $options_object = (object) $options;
  $options_object = json_encode ($options_object);
  $options_object = (string)$options_object;

  echo "<script>jQuery( document ).ready(function($) {console.log([4,$]); $('#".$options['mp_id']."').append('<div id=".'"'.shoppableMarketPlace.'"'."></div>'); Product.openMarketPlace(".$options['rows'].",'','','',".$options['productsPerRow']."); });</script>";
  echo "<p id='shoppable_bundle' options='".substr($options_object,1,-1)."' ></p>";
}


// ------------------------------------------------------------------------------
// CALLBACK FUNCTION FOR: add_action('admin_menu', 'shoppable_mp_add_settings_page');
// ------------------------------------------------------------------------------

// Add menu page
function shoppable_mp_add_settings_page() {
  add_options_page( 'Shoppable Frames Configurations Page', 'Shoppable', 'manage_options', 'shoppable_mp_options', 'shoppable_mp_render_help_settings' );
}

// ------------------------------------------------------------------------------
// CALLBACK FUNCTION SPECIFIED IN: add_options_page()
// ------------------------------------------------------------------------------
function shoppable_mp_render_help_settings () {
  ?>
    <div class="wrap">
      <h3>Requirements</h3>
      <ul>
        <h4>Your Shoppable Token.</h4>
        <p>To get set up with your Token please create an account with <a href="https://www.shoppable.com/new_sign_up">Shoppable</a>.</p>
      </ul>
      <h2>Shoppable Marketplace Options</h2>
      <form method="post" action="options.php">
        <?php settings_fields('shoppable_settings_options'); ?>
        <?php $options = get_option('shoppable_mp_options'); ?>
        <table class="form-table">
          <tr valign="top"><th scope="row">Token</th>
            <td>
              <input type="text" class="regular-text" name="shoppable_mp_options[token]" placeholder="Token" value="<?php echo $options['token']; ?>"/>
              <p class="description">Login to <a href="https://publishers.shoppable.com/account/login">Shoppable</a> to access your Token</p>
            </td>
          </tr>
          <tr valign="top"><th scope="row">HTML Element ID Where Marketplace Will Be Displayed</th>
            <td><input type="text" class="regular-text" placeholder='Element Id' name="shoppable_mp_options[mp_id]" value="<?php echo $options['mp_id']; ?>" /></td>
          </tr>
          <tr valign="top"><th scope="row">Products Displayed Per Row</th>
            <td>
              <select name="shoppable_mp_options[productsPerRow]" id = value="<?php echo $options['productsPerRow']; ?>">
                <?php
                  for ($x = 1; $x <= 10; $x++) {
                    if ($x == $options['productsPerRow']){
                      echo "<option value=$x selected='selected'>$x</option>";
                    }else{
                      echo "<option value=$x>$x</option>";
                    }
                  }
                 ?>
              </select>
            </td>
          </tr>
          <tr valign="top"><th scope="row">Product Rows Displayed</th>
            <td>
              <select name="shoppable_mp_options[rows]" id = value="<?php echo $options['rows']; ?>">
                <?php
                  for ($x = 1; $x <= 20; $x++) {
                    if ($x == $options['rows']){
                      echo "<option value=$x selected='selected'>$x</option>";
                    }else{
                      echo "<option value=$x>$x</option>";
                    }
                  }
                 ?>
              </select>
            </td>
          </tr>
          <tr valign="top"><th scope="row">Order Complete Redirect Page</th>
            <td><input type="text" class="regular-text" placeholder='www.your-site.com' name="shoppable_mp_options[page_after_complete_page]" value="<?php echo $options['page_after_complete_page']; ?>" /></td>
          </tr>
        </table>
        <p class="submit">
        <input type="submit" class="button-primary" value="<?php _e('Save Changes') ?>" />
        </p>
      </form>
    </div>
  <?php
  shoppable_mp_render_helper_copy();
}

// render helper copy
function shoppable_mp_render_helper_copy () {
?>

  <h3>More resources</h3>
  <ul>
    <li><a href="https://www.shoppable.com" target="_blank">Shoppable Home</a></li>
    <li><a href="http://docs.shoppable.com" target="_blank">Shoppable Documentation</a></li>
  </ul>
<?php
}

// Sanitize and validate input. Accepts an array, return a sanitized array.
function shoppable_mp_validate_options ( $input ) {
  return $input;
}

// Display a Settings link on the main Plugins page
function shoppable_mp_plugin_action_links ( $links, $file ) {

  if ( $file == plugin_basename( __FILE__ ) ) {
    $shoppable_mp_links = '<a href="'.get_admin_url().'options-general.php?page=shoppable_mp_options">'.__('Settings').'</a>';
    // make the 'Settings' link appear first
    array_unshift( $links, $shoppable_mp_links );
  }

  return $links;
}

///////////
