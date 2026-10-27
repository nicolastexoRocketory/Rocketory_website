<?php
/**
 * Plugin Name: Spieler Popup
 * Description: Kader-Raster, Spieler-Popup und Spielerseiten (wie Blogbeiträge) aus einem Plugin.
 * Version: 2.1.0
 * Text Domain: spieler-popup
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

define( 'TUS_KADER_VERSION', '2.1.0' );
define( 'TUS_KADER_FILE', __FILE__ );
define( 'TUS_KADER_DIR', plugin_dir_path( __FILE__ ) );
define( 'TUS_KADER_URL', plugin_dir_url( __FILE__ ) );
define( 'TUS_KADER_CPT', 'teammitglied' );
define( 'TUS_KADER_TAX', 'tus_kader_gruppe' );

require_once TUS_KADER_DIR . 'includes/helpers.php';
require_once TUS_KADER_DIR . 'includes/class-cpt.php';
require_once TUS_KADER_DIR . 'includes/class-admin.php';
require_once TUS_KADER_DIR . 'includes/class-shortcodes.php';
require_once TUS_KADER_DIR . 'includes/class-templates.php';
require_once TUS_KADER_DIR . 'includes/class-import.php';
require_once TUS_KADER_DIR . 'includes/class-team-page.php';

register_activation_hook( __FILE__, 'tus_kader_activate' );
register_deactivation_hook( __FILE__, 'tus_kader_deactivate' );

function tus_kader_activate() {
	Tus_Kader_Cpt::register();
	flush_rewrite_rules();
	if ( ! get_option( 'tus_kader_imported' ) ) {
		Tus_Kader_Import::run( false );
		update_option( 'tus_kader_imported', 1 );
	}
}

function tus_kader_deactivate() {
	flush_rewrite_rules();
}

add_action( 'plugins_loaded', 'tus_kader_boot' );

function tus_kader_boot() {
	Tus_Kader_Cpt::init();
	Tus_Kader_Admin::init();
	Tus_Kader_Shortcodes::init();
	Tus_Kader_Templates::init();
	Tus_Kader_Team_Page::init();
}

add_action( 'init', 'tus_kader_maybe_upgrade', 20 );

function tus_kader_maybe_upgrade() {
	if ( get_option( 'tus_kader_version' ) !== TUS_KADER_VERSION ) {
		Tus_Kader_Cpt::register();
		flush_rewrite_rules( false );
		update_option( 'tus_kader_version', TUS_KADER_VERSION );
	}
	if ( ! get_option( 'tus_kader_imported' ) ) {
		Tus_Kader_Import::run( false );
		update_option( 'tus_kader_imported', 1 );
	}
}
