<?php
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Tus_Kader_Team_Page {
	public static function init() {
		add_filter( 'elementor/widget/render_content', array( __CLASS__, 'replace_html_widget' ), 10, 2 );
		add_filter( 'the_content', array( __CLASS__, 'replace_in_content' ), 8 );
	}

	public static function replace_html_widget( $content, $widget ) {
		if ( ! is_object( $widget ) || 'html' !== $widget->get_name() ) {
			return $content;
		}
		if ( false === strpos( $content, 'pt-team-wrapper' ) && false === strpos( $content, 'pt-card' ) ) {
			return $content;
		}
		$has_players = get_posts(
			array(
				'post_type'      => TUS_KADER_CPT,
				'post_status'    => 'publish',
				'posts_per_page' => 1,
				'fields'         => 'ids',
			)
		);
		if ( empty( $has_players ) ) {
			return $content;
		}
		return do_shortcode( '[tus_kader]' );
	}

	public static function replace_in_content( $content ) {
		return $content;
	}

	public static function team_page() {
		$page = get_page_by_path( 'team' );
		if ( $page ) {
			return $page;
		}
		$found = get_posts(
			array(
				'post_type'      => 'page',
				'name'           => 'team',
				'posts_per_page' => 1,
				'post_status'    => 'any',
			)
		);
		return $found ? $found[0] : null;
	}

	public static function replace_elementor_widget() {
		$page = self::team_page();
		if ( ! $page ) {
			return false;
		}

		$raw = get_post_meta( $page->ID, '_elementor_data', true );
		if ( ! $raw ) {
			return false;
		}

		$data = json_decode( $raw, true );
		if ( ! is_array( $data ) ) {
			$data = json_decode( wp_unslash( $raw ), true );
		}
		if ( ! is_array( $data ) ) {
			return false;
		}

		$changed = self::walk( $data );
		if ( ! $changed ) {
			return false;
		}

		update_post_meta( $page->ID, '_elementor_data', wp_slash( wp_json_encode( $data ) ) );
		if ( class_exists( '\Elementor\Plugin' ) ) {
			\Elementor\Plugin::$instance->files_manager->clear_cache();
		}
		return true;
	}

	protected static function walk( &$elements ) {
		$changed = false;
		foreach ( $elements as &$el ) {
			$type = isset( $el['widgetType'] ) ? $el['widgetType'] : '';
			$html = '';
			if ( isset( $el['settings']['html'] ) ) {
				$html = $el['settings']['html'];
			}
			if ( 'html' === $type && ( false !== strpos( $html, 'pt-team-wrapper' ) || false !== strpos( $html, 'pt-card' ) ) ) {
				if ( ! isset( $el['settings'] ) || ! is_array( $el['settings'] ) ) {
					$el['settings'] = array();
				}
				unset( $el['settings']['html'] );
				$el['elType']               = 'widget';
				$el['widgetType']           = 'shortcode';
				$el['settings']['shortcode'] = '[tus_kader]';
				$changed                    = true;
				continue;
			}
			if ( ! empty( $el['elements'] ) && is_array( $el['elements'] ) ) {
				if ( self::walk( $el['elements'] ) ) {
					$changed = true;
				}
			}
		}
		return $changed;
	}
}
