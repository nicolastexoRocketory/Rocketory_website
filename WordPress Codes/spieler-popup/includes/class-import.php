<?php
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Tus_Kader_Import {
	public static function roster() {
		$file = TUS_KADER_DIR . 'data/kader.json';
		if ( ! file_exists( $file ) ) {
			return array();
		}
		$data = json_decode( file_get_contents( $file ), true );
		return is_array( $data ) ? $data : array();
	}

	/**
	 * Additive import: never delete, never change existing slugs or filled fields.
	 */
	public static function run( $overwrite = false ) {
		$created = 0;
		$updated = 0;
		$skipped = 0;

		foreach ( self::roster() as $row ) {
			$post = self::find_existing( $row );
			$is_new = false;

			if ( ! $post ) {
				$post_id = wp_insert_post(
					array(
						'post_type'   => TUS_KADER_CPT,
						'post_status' => 'publish',
						'post_title'  => $row['name'],
						'post_name'   => $row['slug'],
						'post_content'=> '',
					),
					true
				);
				if ( is_wp_error( $post_id ) ) {
					continue;
				}
				$post    = get_post( $post_id );
				$is_new  = true;
				$created++;
			}

			$changed = self::fill_player( $post->ID, $row, $overwrite );
			if ( $is_new ) {
				continue;
			}
			if ( $changed ) {
				$updated++;
			} else {
				$skipped++;
			}
		}

		return compact( 'created', 'updated', 'skipped' );
	}

	protected static function find_existing( $row ) {
		$candidates = array_unique(
			array_filter(
				array(
					isset( $row['slug'] ) ? $row['slug'] : '',
					tus_kader_slug_from_name( $row['name'] ),
					sanitize_title( $row['name'] ),
					sanitize_title( remove_accents( $row['name'] ) ),
				)
			)
		);

		foreach ( $candidates as $slug ) {
			$found = get_posts(
				array(
					'name'           => $slug,
					'post_type'      => TUS_KADER_CPT,
					'post_status'    => array( 'publish', 'draft', 'pending', 'private' ),
					'posts_per_page' => 1,
				)
			);
			if ( $found ) {
				return $found[0];
			}
		}

		$found = get_posts(
			array(
				'post_type'      => TUS_KADER_CPT,
				'post_status'    => array( 'publish', 'draft', 'pending', 'private' ),
				'posts_per_page' => 1,
				'title'          => $row['name'],
			)
		);
		if ( $found ) {
			return $found[0];
		}

		global $wpdb;
		$id = $wpdb->get_var(
			$wpdb->prepare(
				"SELECT ID FROM {$wpdb->posts} WHERE post_type = %s AND post_title = %s AND post_status != 'trash' LIMIT 1",
				TUS_KADER_CPT,
				$row['name']
			)
		);
		return $id ? get_post( (int) $id ) : null;
	}

	protected static function fill_player( $post_id, $row, $overwrite ) {
		$changed = false;
		$map     = array(
			'_tus_nummer'        => isset( $row['number'] ) ? $row['number'] : '',
			'_tus_position'      => isset( $row['position'] ) ? $row['position'] : '',
			'_tus_geburtstag'    => isset( $row['birthday'] ) ? $row['birthday'] : '',
			'_tus_nationalitaet' => isset( $row['nationality'] ) ? $row['nationality'] : '',
			'_tus_groesse'       => isset( $row['height'] ) ? $row['height'] : '',
			'_tus_sponsor'       => isset( $row['sponsor'] ) ? $row['sponsor'] : '',
			'_tus_img'           => isset( $row['img'] ) ? $row['img'] : '',
			'_tus_gruppe'        => isset( $row['group'] ) ? $row['group'] : 'kader',
		);

		foreach ( $map as $key => $val ) {
			$current = get_post_meta( $post_id, $key, true );
			if ( ( $current === '' || $current === null || $overwrite ) && $val !== '' ) {
				update_post_meta( $post_id, $key, sanitize_text_field( $val ) );
				$changed = true;
			}
		}

		$group = isset( $row['group'] ) ? $row['group'] : 'kader';
		$terms = wp_get_post_terms( $post_id, TUS_KADER_TAX, array( 'fields' => 'slugs' ) );
		if ( is_wp_error( $terms ) || empty( $terms ) ) {
			wp_set_object_terms( $post_id, $group, TUS_KADER_TAX, false );
			$changed = true;
		}

		if ( ! has_post_thumbnail( $post_id ) && ! empty( $row['img'] ) ) {
			$att = tus_kader_attachment_id_from_url( $row['img'] );
			if ( $att ) {
				set_post_thumbnail( $post_id, $att );
				$changed = true;
			}
		}

		return $changed;
	}
}
