<?php
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Tus_Kader_Cpt {
	public static function init() {
		add_action( 'init', array( __CLASS__, 'register' ), 11 );
	}

	public static function register() {
		register_post_type(
			TUS_KADER_CPT,
			array(
				'labels'              => array(
					'name'               => __( 'Teammitglieder', 'spieler-popup' ),
					'singular_name'      => __( 'Teammitglied', 'spieler-popup' ),
					'add_new'            => __( 'Neu hinzufügen', 'spieler-popup' ),
					'add_new_item'       => __( 'Neues Teammitglied', 'spieler-popup' ),
					'edit_item'          => __( 'Teammitglied bearbeiten', 'spieler-popup' ),
					'new_item'           => __( 'Neues Teammitglied', 'spieler-popup' ),
					'view_item'          => __( 'Teammitglied ansehen', 'spieler-popup' ),
					'search_items'       => __( 'Teammitglieder suchen', 'spieler-popup' ),
					'not_found'          => __( 'Keine Teammitglieder gefunden', 'spieler-popup' ),
					'not_found_in_trash' => __( 'Keine Teammitglieder im Papierkorb', 'spieler-popup' ),
					'menu_name'          => __( 'Kader', 'spieler-popup' ),
				),
				'public'              => true,
				'publicly_queryable'  => true,
				'show_ui'             => true,
				'show_in_menu'        => true,
				'show_in_rest'        => true,
				'has_archive'         => false,
				'exclude_from_search' => false,
				'menu_icon'           => 'dashicons-groups',
				'menu_position'       => 21,
				'supports'            => array( 'title', 'editor', 'thumbnail', 'custom-fields', 'page-attributes' ),
				'rewrite'             => array(
					'slug'       => 'teammitglied',
					'with_front' => false,
				),
				'capability_type'     => 'post',
			)
		);

		register_taxonomy(
			TUS_KADER_TAX,
			TUS_KADER_CPT,
			array(
				'labels'            => array(
					'name'          => __( 'Gruppen', 'spieler-popup' ),
					'singular_name' => __( 'Gruppe', 'spieler-popup' ),
				),
				'public'            => true,
				'show_ui'           => true,
				'show_admin_column' => true,
				'show_in_rest'      => true,
				'hierarchical'      => true,
				'rewrite'           => false,
			)
		);

		foreach ( tus_kader_groups() as $slug => $label ) {
			if ( ! term_exists( $slug, TUS_KADER_TAX ) ) {
				wp_insert_term( $label, TUS_KADER_TAX, array( 'slug' => $slug ) );
			}
		}
	}
}
