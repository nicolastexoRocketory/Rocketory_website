<?php
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Tus_Kader_Admin {
	public static function init() {
		add_action( 'add_meta_boxes', array( __CLASS__, 'metaboxes' ) );
		add_action( 'save_post_' . TUS_KADER_CPT, array( __CLASS__, 'save_meta' ) );
		add_action( 'admin_menu', array( __CLASS__, 'menu' ) );
		add_action( 'admin_enqueue_scripts', array( __CLASS__, 'assets' ) );
		add_filter( 'manage_' . TUS_KADER_CPT . '_posts_columns', array( __CLASS__, 'columns' ) );
		add_action( 'manage_' . TUS_KADER_CPT . '_posts_custom_column', array( __CLASS__, 'column_content' ), 10, 2 );
		add_action( 'restrict_manage_posts', array( __CLASS__, 'group_filter' ) );
		add_filter( 'parse_query', array( __CLASS__, 'filter_query' ) );
	}

	public static function metaboxes() {
		add_meta_box(
			'tus_kader_daten',
			__( 'Spielerdaten', 'spieler-popup' ),
			array( __CLASS__, 'render_metabox' ),
			TUS_KADER_CPT,
			'normal',
			'high'
		);
	}

	public static function render_metabox( $post ) {
		wp_nonce_field( 'tus_kader_save', 'tus_kader_nonce' );
		$player = tus_kader_get_player( $post );
		$group  = $player['group'];
		?>
		<p>
			<label for="_tus_gruppe"><strong><?php esc_html_e( 'Gruppe', 'spieler-popup' ); ?></strong></label><br>
			<select name="_tus_gruppe" id="_tus_gruppe">
				<?php foreach ( tus_kader_groups() as $slug => $label ) : ?>
					<option value="<?php echo esc_attr( $slug ); ?>" <?php selected( $group, $slug ); ?>><?php echo esc_html( $label ); ?></option>
				<?php endforeach; ?>
			</select>
		</p>
		<p>
			<label for="_tus_nummer"><strong><?php esc_html_e( 'Rückennummer', 'spieler-popup' ); ?></strong></label><br>
			<input type="text" class="regular-text" name="_tus_nummer" id="_tus_nummer" value="<?php echo esc_attr( $player['number'] ); ?>">
		</p>
		<p>
			<label for="_tus_position"><strong><?php esc_html_e( 'Position / Rolle', 'spieler-popup' ); ?></strong></label><br>
			<input type="text" class="regular-text" name="_tus_position" id="_tus_position" value="<?php echo esc_attr( $player['position'] ); ?>">
		</p>
		<p>
			<label for="_tus_geburtstag"><strong><?php esc_html_e( 'Geburtstag', 'spieler-popup' ); ?></strong></label><br>
			<input type="text" class="regular-text" name="_tus_geburtstag" id="_tus_geburtstag" value="<?php echo esc_attr( $player['birthday'] ); ?>">
		</p>
		<p>
			<label for="_tus_nationalitaet"><strong><?php esc_html_e( 'Nationalität', 'spieler-popup' ); ?></strong></label><br>
			<input type="text" class="regular-text" name="_tus_nationalitaet" id="_tus_nationalitaet" value="<?php echo esc_attr( $player['nationality'] ); ?>">
		</p>
		<p>
			<label for="_tus_groesse"><strong><?php esc_html_e( 'Größe', 'spieler-popup' ); ?></strong></label><br>
			<input type="text" class="regular-text" name="_tus_groesse" id="_tus_groesse" value="<?php echo esc_attr( $player['height'] ); ?>">
		</p>
		<p>
			<label for="_tus_sponsor"><strong><?php esc_html_e( 'Sponsor-Logo (URL)', 'spieler-popup' ); ?></strong></label><br>
			<input type="url" class="large-text" name="_tus_sponsor" id="_tus_sponsor" value="<?php echo esc_attr( $player['sponsor'] ); ?>">
		</p>
		<p class="description"><?php esc_html_e( 'Das Porträt ist das Beitragsbild. Der Text darunter ist optional (Bio). Die Reihenfolge der Karten stellst du unter „Reihenfolge“ per Drag & Drop ein.', 'spieler-popup' ); ?></p>
		<?php
	}

	public static function save_meta( $post_id ) {
		if ( ! isset( $_POST['tus_kader_nonce'] ) || ! wp_verify_nonce( sanitize_text_field( wp_unslash( $_POST['tus_kader_nonce'] ) ), 'tus_kader_save' ) ) {
			return;
		}
		if ( defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE ) {
			return;
		}
		if ( ! current_user_can( 'edit_post', $post_id ) ) {
			return;
		}

		$fields = array( '_tus_nummer', '_tus_position', '_tus_geburtstag', '_tus_nationalitaet', '_tus_groesse', '_tus_sponsor' );
		foreach ( $fields as $field ) {
			if ( isset( $_POST[ $field ] ) ) {
				update_post_meta( $post_id, $field, sanitize_text_field( wp_unslash( $_POST[ $field ] ) ) );
			}
		}

		if ( isset( $_POST['_tus_gruppe'] ) ) {
			$group = sanitize_key( wp_unslash( $_POST['_tus_gruppe'] ) );
			if ( ! isset( tus_kader_groups()[ $group ] ) ) {
				$group = 'kader';
			}
			update_post_meta( $post_id, '_tus_gruppe', $group );
			wp_set_object_terms( $post_id, $group, TUS_KADER_TAX, false );
		}
	}

	public static function menu() {
		add_submenu_page(
			'edit.php?post_type=' . TUS_KADER_CPT,
			__( 'Reihenfolge', 'spieler-popup' ),
			__( 'Reihenfolge', 'spieler-popup' ),
			'edit_posts',
			'tus-kader-order',
			array( __CLASS__, 'order_page' )
		);

		add_submenu_page(
			'edit.php?post_type=' . TUS_KADER_CPT,
			__( 'Kader-Einstellungen', 'spieler-popup' ),
			__( 'Einstellungen', 'spieler-popup' ),
			'manage_options',
			'tus-kader-settings',
			array( __CLASS__, 'settings_page' )
		);
	}

	public static function assets( $hook ) {
		if ( false !== strpos( (string) $hook, 'tus-kader-settings' ) ) {
			wp_enqueue_media();
			wp_enqueue_script( 'tus-kader-admin', TUS_KADER_URL . 'assets/admin.js', array( 'jquery' ), TUS_KADER_VERSION, true );
		}

		if ( false !== strpos( (string) $hook, 'tus-kader-order' ) ) {
			wp_enqueue_script( 'jquery-ui-sortable' );
			wp_enqueue_script( 'tus-kader-order', TUS_KADER_URL . 'assets/order-admin.js', array( 'jquery', 'jquery-ui-sortable' ), TUS_KADER_VERSION, true );
			wp_enqueue_style( 'tus-kader-order', TUS_KADER_URL . 'assets/order-admin.css', array(), TUS_KADER_VERSION );
		}
	}

	public static function save_member_order( $order_map ) {
		if ( ! is_array( $order_map ) || empty( $order_map ) ) {
			return;
		}

		foreach ( $order_map as $post_id => $menu_order ) {
			$post_id = (int) $post_id;
			if ( $post_id <= 0 ) {
				continue;
			}
			if ( TUS_KADER_CPT !== get_post_type( $post_id ) ) {
				continue;
			}
			if ( ! current_user_can( 'edit_post', $post_id ) ) {
				continue;
			}
			// Nur menu_order anfassen – Titel, Meta, Bilder bleiben unverändert.
			wp_update_post(
				array(
					'ID'         => $post_id,
					'menu_order' => (int) $menu_order,
				)
			);
		}
	}

	public static function order_page() {
		if ( ! current_user_can( 'edit_posts' ) ) {
			return;
		}

		$notice = '';
		if ( isset( $_POST['tus_kader_order_nonce'] ) && wp_verify_nonce( sanitize_text_field( wp_unslash( $_POST['tus_kader_order_nonce'] ) ), 'tus_kader_order' ) ) {
			if ( isset( $_POST['member_order'] ) && is_array( $_POST['member_order'] ) ) {
				self::save_member_order( wp_unslash( $_POST['member_order'] ) );
				$notice = __( 'Reihenfolge gespeichert. Bestehende Spielerdaten wurden nicht verändert.', 'spieler-popup' );
			}
		}

		$groups = tus_kader_groups();
		?>
		<div class="wrap tus-kader-order-wrap">
			<h1><?php esc_html_e( 'Kader – Reihenfolge', 'spieler-popup' ); ?></h1>
			<?php if ( $notice ) : ?>
				<div class="notice notice-success is-dismissible"><p><?php echo esc_html( $notice ); ?></p></div>
			<?php endif; ?>
			<p class="description">
				<?php esc_html_e( 'Ziehe die Mitglieder je Liste (Kader, Youngsters, Staff) per Drag & Drop in die gewünschte Reihenfolge und speichere. Es wird nur die Sortierung geändert – keine Inhalte, Bilder oder Meta-Felder.', 'spieler-popup' ); ?>
			</p>

			<form method="post" action="">
				<?php wp_nonce_field( 'tus_kader_order', 'tus_kader_order_nonce' ); ?>

				<div class="tus-kader-order-groups">
					<?php foreach ( $groups as $slug => $label ) : ?>
						<?php $players = tus_kader_query_players( $slug ); ?>
						<div class="tus-kader-order-group">
							<h2 class="tus-kader-order-group__title"><?php echo esc_html( $label ); ?></h2>
							<?php if ( empty( $players ) ) : ?>
								<p class="tus-kader-order-empty"><em><?php esc_html_e( 'Keine Mitglieder in dieser Gruppe.', 'spieler-popup' ); ?></em></p>
							<?php else : ?>
								<table class="wp-list-table widefat fixed striped tus-kader-order-table">
									<thead>
										<tr>
											<th scope="col" class="column-order" style="width:48px;"></th>
											<th scope="col"><?php esc_html_e( 'Teammitglied', 'spieler-popup' ); ?></th>
											<th scope="col" style="width:90px;"><?php esc_html_e( 'Position', 'spieler-popup' ); ?></th>
											<th scope="col" style="width:70px;"><?php esc_html_e( 'Nr.', 'spieler-popup' ); ?></th>
										</tr>
									</thead>
									<tbody class="tus-kader-sortable" data-group="<?php echo esc_attr( $slug ); ?>">
										<?php
										$index = 0;
										foreach ( $players as $post ) :
											$player = tus_kader_get_player( $post );
											$thumb  = get_the_post_thumbnail( $post->ID, array( 40, 40 ), array( 'class' => 'tus-kader-order-thumb' ) );
											?>
											<tr class="tus-kader-order-row">
												<td class="tus-kader-drag-handle" aria-hidden="true">
													<span class="dashicons dashicons-menu" title="<?php esc_attr_e( 'Ziehen zum Sortieren', 'spieler-popup' ); ?>"></span>
												</td>
												<td>
													<div class="tus-kader-order-member">
														<?php if ( $thumb ) : ?>
															<?php echo $thumb; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
														<?php else : ?>
															<span class="tus-kader-order-thumb tus-kader-order-thumb--empty" aria-hidden="true"></span>
														<?php endif; ?>
														<strong><?php echo esc_html( $player['name'] ); ?></strong>
													</div>
													<input type="hidden" class="tus-kader-order-input" name="member_order[<?php echo esc_attr( (string) $post->ID ); ?>]" value="<?php echo esc_attr( (string) $index ); ?>">
												</td>
												<td><?php echo esc_html( $player['position'] !== '' ? $player['position'] : '—' ); ?></td>
												<td><?php echo esc_html( $player['number'] !== '' ? $player['number'] : '—' ); ?></td>
											</tr>
											<?php
											$index++;
										endforeach;
										?>
									</tbody>
								</table>
							<?php endif; ?>
						</div>
					<?php endforeach; ?>
				</div>

				<p class="submit tus-kader-order-submit">
					<button type="submit" name="tus_kader_save_order" class="button button-primary button-hero"><?php esc_html_e( 'Reihenfolge speichern', 'spieler-popup' ); ?></button>
				</p>
			</form>
		</div>
		<?php
	}

	public static function settings_page() {
		if ( ! current_user_can( 'manage_options' ) ) {
			return;
		}

		$notice = '';

		if ( isset( $_POST['tus_kader_settings_nonce'] ) && wp_verify_nonce( sanitize_text_field( wp_unslash( $_POST['tus_kader_settings_nonce'] ) ), 'tus_kader_settings' ) ) {
			if ( isset( $_POST['tus_kader_save_settings'] ) ) {
				update_option( 'tus_kader_hero_id', isset( $_POST['tus_kader_hero_id'] ) ? absint( $_POST['tus_kader_hero_id'] ) : 0 );
				$notice = __( 'Einstellungen gespeichert.', 'spieler-popup' );
			}
			if ( isset( $_POST['tus_kader_run_import'] ) ) {
				$result = Tus_Kader_Import::run( false );
				$notice = sprintf(
					/* translators: 1: created, 2: updated, 3: skipped */
					__( 'Import: %1$d angelegt, %2$d ergänzt, %3$d unverändert. Bestehende Inhalte wurden nicht überschrieben.', 'spieler-popup' ),
					$result['created'],
					$result['updated'],
					$result['skipped']
				);
			}
			if ( isset( $_POST['tus_kader_replace_team'] ) ) {
				$ok     = Tus_Kader_Team_Page::replace_elementor_widget();
				$notice = $ok
					? __( 'Team-Seite: Raster-HTML durch Shortcode [tus_kader] ersetzt. Bitte in Elementor öffnen und publizieren.', 'spieler-popup' )
					: __( 'Team-Seite: kein Elementor-HTML-Widget mit Raster gefunden (vielleicht schon umgestellt).', 'spieler-popup' );
			}
		}

		$hero_id  = (int) get_option( 'tus_kader_hero_id' );
		$hero_url = tus_kader_hero_url();
		?>
		<div class="wrap">
			<h1><?php esc_html_e( 'Kader-Einstellungen', 'spieler-popup' ); ?></h1>
			<?php if ( $notice ) : ?>
				<div class="notice notice-success"><p><?php echo esc_html( $notice ); ?></p></div>
			<?php endif; ?>

			<form method="post">
				<?php wp_nonce_field( 'tus_kader_settings', 'tus_kader_settings_nonce' ); ?>
				<table class="form-table">
					<tr>
						<th><?php esc_html_e( 'Kader-Hero-Bild', 'spieler-popup' ); ?></th>
						<td>
							<input type="hidden" id="tus_kader_hero_id" name="tus_kader_hero_id" value="<?php echo esc_attr( $hero_id ); ?>">
							<p>
								<img id="tus-kader-hero-preview" src="<?php echo esc_url( $hero_url ); ?>" alt="" style="max-width:320px;height:auto;display:block;margin-bottom:8px;">
							</p>
							<button type="button" class="button tus-kader-upload"><?php esc_html_e( 'Bild wählen', 'spieler-popup' ); ?></button>
							<p class="description"><?php esc_html_e( 'Hintergrund aller Spielerseiten (nicht das Porträt). Standard: Mannschaftsfoto.', 'spieler-popup' ); ?></p>
						</td>
					</tr>
					<tr>
						<th><?php esc_html_e( 'Shortcode', 'spieler-popup' ); ?></th>
						<td><code>[tus_kader]</code> <?php esc_html_e( 'auf der Team-Seite.', 'spieler-popup' ); ?></td>
					</tr>
					<tr>
						<th><?php esc_html_e( 'Reihenfolge', 'spieler-popup' ); ?></th>
						<td>
							<a class="button" href="<?php echo esc_url( admin_url( 'edit.php?post_type=' . TUS_KADER_CPT . '&page=tus-kader-order' ) ); ?>">
								<?php esc_html_e( 'Zur Drag-&-Drop-Reihenfolge', 'spieler-popup' ); ?>
							</a>
						</td>
					</tr>
				</table>
				<p>
					<button type="submit" name="tus_kader_save_settings" class="button button-primary"><?php esc_html_e( 'Speichern', 'spieler-popup' ); ?></button>
				</p>
				<hr>
				<p>
					<button type="submit" name="tus_kader_run_import" class="button"><?php esc_html_e( 'Bestehende Kaderdaten ergänzen', 'spieler-popup' ); ?></button>
					<span class="description"> <?php esc_html_e( 'Legt fehlende Mitglieder an und füllt nur leere Felder. Nichts wird gelöscht oder überschrieben.', 'spieler-popup' ); ?></span>
				</p>
				<p>
					<button type="submit" name="tus_kader_replace_team" class="button"><?php esc_html_e( 'Team-Seite auf Shortcode umstellen', 'spieler-popup' ); ?></button>
					<span class="description"> <?php esc_html_e( 'Ersetzt nur das Raster-HTML-Widget. Hero und restlicher Inhalt bleiben.', 'spieler-popup' ); ?></span>
				</p>
			</form>
		</div>
		<?php
	}

	public static function columns( $cols ) {
		$new = array();
		foreach ( $cols as $key => $label ) {
			$new[ $key ] = $label;
			if ( 'title' === $key ) {
				$new['tus_nummer']   = __( 'Nr.', 'spieler-popup' );
				$new['tus_position'] = __( 'Position', 'spieler-popup' );
				$new['menu_order']   = __( 'Reihenfolge', 'spieler-popup' );
			}
		}
		return $new;
	}

	public static function column_content( $column, $post_id ) {
		if ( 'tus_nummer' === $column ) {
			echo esc_html( tus_kader_meta( $post_id, '_tus_nummer' ) );
		}
		if ( 'tus_position' === $column ) {
			echo esc_html( tus_kader_meta( $post_id, '_tus_position' ) );
		}
		if ( 'menu_order' === $column ) {
			$post = get_post( $post_id );
			echo esc_html( $post ? (string) $post->menu_order : '' );
		}
	}

	public static function group_filter() {
		global $typenow;
		if ( TUS_KADER_CPT !== $typenow ) {
			return;
		}
		$current = isset( $_GET[ TUS_KADER_TAX ] ) ? sanitize_key( wp_unslash( $_GET[ TUS_KADER_TAX ] ) ) : '';
		echo '<select name="' . esc_attr( TUS_KADER_TAX ) . '">';
		echo '<option value="">' . esc_html__( 'Alle Gruppen', 'spieler-popup' ) . '</option>';
		foreach ( tus_kader_groups() as $slug => $label ) {
			printf( '<option value="%s"%s>%s</option>', esc_attr( $slug ), selected( $current, $slug, false ), esc_html( $label ) );
		}
		echo '</select>';
	}

	public static function filter_query( $query ) {
		global $pagenow;
		if ( ! is_admin() || 'edit.php' !== $pagenow || ! $query->is_main_query() ) {
			return $query;
		}
		return $query;
	}
}
