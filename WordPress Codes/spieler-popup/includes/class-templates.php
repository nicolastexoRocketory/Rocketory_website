<?php
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Tus_Kader_Templates {
	public static function init() {
		add_filter( 'single_template', array( __CLASS__, 'single_template' ) );
		add_filter( 'get_post_metadata', array( __CLASS__, 'filter_post_meta' ), 10, 4 );
		add_action( 'wp_enqueue_scripts', array( __CLASS__, 'assets' ) );
		add_filter( 'body_class', array( __CLASS__, 'body_class' ) );
	}

	public static function single_template( $template ) {
		if ( is_singular( TUS_KADER_CPT ) ) {
			return TUS_KADER_DIR . 'templates/single-teammitglied.php';
		}
		return $template;
	}

	public static function assets() {
		if ( ! is_singular( TUS_KADER_CPT ) ) {
			return;
		}
		wp_enqueue_style( 'tus-kader', TUS_KADER_URL . 'assets/kader.css', array(), TUS_KADER_VERSION );
		wp_enqueue_style( 'tus-kader-single', TUS_KADER_URL . 'assets/single.css', array( 'tus-kader' ), TUS_KADER_VERSION );
	}

	public static function body_class( $classes ) {
		if ( is_singular( TUS_KADER_CPT ) ) {
			$classes[] = 'tus-player-single';
		}
		return $classes;
	}

	public static function filter_post_meta( $value, $object_id, $meta_key, $single ) {
		if ( ! $object_id || get_post_type( $object_id ) !== TUS_KADER_CPT ) {
			return $value;
		}

		if ( 'mfn-post-hide-title' === $meta_key ) {
			return $single ? '1' : array( '1' );
		}

		if ( 'mfn-post-header-bg' === $meta_key ) {
			$url = tus_kader_hero_url();
			if ( $url ) {
				return $single ? $url : array( $url );
			}
		}

		return $value;
	}
}
