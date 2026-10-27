<?php
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

function tus_kader_groups() {
	return array(
		'kader'      => __( 'Kader', 'spieler-popup' ),
		'youngsters' => __( 'Youngsters', 'spieler-popup' ),
		'staff'      => __( 'Trainerteam / Staff', 'spieler-popup' ),
	);
}

function tus_kader_slug_from_name( $name ) {
	$map = array(
		'ä' => 'ae',
		'ö' => 'oe',
		'ü' => 'ue',
		'Ä' => 'ae',
		'Ö' => 'oe',
		'Ü' => 'ue',
		'ß' => 'ss',
	);
	return sanitize_title( strtr( (string) $name, $map ) );
}

function tus_kader_team_url() {
	$page = get_page_by_path( 'team' );
	if ( $page ) {
		return get_permalink( $page );
	}
	return home_url( '/team/' );
}

function tus_kader_hero_url() {
	$id = (int) get_option( 'tus_kader_hero_id' );
	if ( $id ) {
		$url = wp_get_attachment_image_url( $id, 'full' );
		if ( $url ) {
			return $url;
		}
	}
	$stored = get_option( 'tus_kader_hero_url' );
	if ( $stored ) {
		return $stored;
	}
	return 'https://tus-n-luebbecke.de/wp-content/uploads/2026/07/TuS-N-Luebbecke_Teambild_45x29.jpeg';
}

function tus_kader_meta( $post_id, $key, $fallback_keys = array() ) {
	$val = get_post_meta( $post_id, $key, true );
	if ( $val !== '' && $val !== null ) {
		return $val;
	}
	foreach ( (array) $fallback_keys as $alt ) {
		$val = get_post_meta( $post_id, $alt, true );
		if ( $val !== '' && $val !== null ) {
			return $val;
		}
	}
	return '';
}

function tus_kader_get_group( $post_id ) {
	$terms = wp_get_post_terms( $post_id, TUS_KADER_TAX, array( 'fields' => 'slugs' ) );
	if ( ! is_wp_error( $terms ) && ! empty( $terms ) ) {
		return $terms[0];
	}
	$meta = tus_kader_meta( $post_id, '_tus_gruppe' );
	return $meta ? $meta : 'kader';
}

function tus_kader_get_player( $post ) {
	$post = get_post( $post );
	if ( ! $post ) {
		return array();
	}

	$img = get_the_post_thumbnail_url( $post, 'large' );
	if ( ! $img ) {
		$img = tus_kader_meta( $post->ID, '_tus_img' );
	}

	$group      = tus_kader_get_group( $post->ID );
	$groups     = tus_kader_groups();
	$group_label = isset( $groups[ $group ] ) ? $groups[ $group ] : $groups['kader'];

	return array(
		'id'           => $post->ID,
		'slug'         => $post->post_name,
		'name'         => get_the_title( $post ),
		'content'      => $post->post_content,
		'group'        => $group,
		'group_label'  => $group_label,
		'number'       => tus_kader_meta( $post->ID, '_tus_nummer', array( 'nummer', 'rueckennummer' ) ),
		'position'     => tus_kader_meta( $post->ID, '_tus_position', array( 'position' ) ),
		'birthday'     => tus_kader_meta( $post->ID, '_tus_geburtstag', array( 'geburtstag' ) ),
		'nationality'  => tus_kader_meta( $post->ID, '_tus_nationalitaet', array( 'nationalitaet' ) ),
		'height'       => tus_kader_meta( $post->ID, '_tus_groesse', array( 'groesse' ) ),
		'img'          => $img,
		'sponsor'      => tus_kader_meta( $post->ID, '_tus_sponsor' ),
		'permalink'    => get_permalink( $post ),
	);
}

function tus_kader_query_players( $group = '', $args = array() ) {
	$query = array(
		'post_type'      => TUS_KADER_CPT,
		'post_status'    => 'publish',
		'posts_per_page' => -1,
		'orderby'        => array(
			'menu_order' => 'ASC',
			'title'      => 'ASC',
		),
	);

	if ( $group ) {
		$query['tax_query'] = array(
			array(
				'taxonomy' => TUS_KADER_TAX,
				'field'    => 'slug',
				'terms'    => $group,
			),
		);
	}

	$query = array_merge( $query, $args );
	$posts = get_posts( $query );

	// Primär: manuelle Reihenfolge (menu_order). Bei Gleichstand: Rückennummer, dann Name.
	usort(
		$posts,
		function ( $a, $b ) {
			$mo = (int) $a->menu_order - (int) $b->menu_order;
			if ( 0 !== $mo ) {
				return $mo;
			}
			$na = tus_kader_meta( $a->ID, '_tus_nummer' );
			$nb = tus_kader_meta( $b->ID, '_tus_nummer' );
			$ia = ( $na === '' ) ? 9999 : intval( $na );
			$ib = ( $nb === '' ) ? 9999 : intval( $nb );
			if ( $ia === $ib ) {
				return strcasecmp( $a->post_title, $b->post_title );
			}
			return $ia - $ib;
		}
	);

	return $posts;
}

function tus_kader_attachment_id_from_url( $url ) {
	if ( ! $url ) {
		return 0;
	}
	$id = attachment_url_to_postid( $url );
	if ( $id ) {
		return (int) $id;
	}
	$path = wp_parse_url( $url, PHP_URL_PATH );
	if ( ! $path ) {
		return 0;
	}
	$base = basename( $path );
	$posts = get_posts(
		array(
			'post_type'      => 'attachment',
			'posts_per_page' => 1,
			'meta_key'       => '_wp_attached_file',
			'meta_value'     => $base,
			'meta_compare'   => 'LIKE',
			'fields'         => 'ids',
		)
	);
	return $posts ? (int) $posts[0] : 0;
}
