<?php
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Tus_Kader_Shortcodes {
	public static function init() {
		add_shortcode( 'tus_kader', array( __CLASS__, 'kader' ) );
		add_shortcode( 'spieler_popup', array( __CLASS__, 'legacy_popup' ) );
		add_action( 'wp_enqueue_scripts', array( __CLASS__, 'register_assets' ) );
	}

	public static function register_assets() {
		wp_register_style( 'tus-kader', TUS_KADER_URL . 'assets/kader.css', array(), TUS_KADER_VERSION );
		wp_register_script( 'tus-kader', TUS_KADER_URL . 'assets/kader.js', array(), TUS_KADER_VERSION, true );
		wp_register_style( 'spieler-popup-css', TUS_KADER_URL . 'spieler.css', array(), TUS_KADER_VERSION );
		wp_register_script( 'spieler-popup-js', TUS_KADER_URL . 'spieler.js', array( 'jquery' ), TUS_KADER_VERSION, true );

		if ( is_page( 'team' ) ) {
			wp_enqueue_style( 'tus-kader' );
			wp_enqueue_script( 'tus-kader' );
		}
	}

	public static function kader() {
		wp_enqueue_style( 'tus-kader' );
		wp_enqueue_script( 'tus-kader' );

		$groups = tus_kader_groups();
		ob_start();
		?>
		<div class="pt-team-wrapper">
			<div class="pt-team-container">
				<?php
				$first = true;
				foreach ( $groups as $slug => $label ) :
					$players = tus_kader_query_players( $slug );
					if ( ! $players ) {
						continue;
					}
					?>
					<div class="pt-group<?php echo $first ? ' is-open' : ''; ?>">
						<h2 class="pt-group-title"><?php echo esc_html( $label ); ?></h2>
						<div class="pt-grid-wrapper">
							<div class="pt-grid">
								<?php foreach ( $players as $post ) : ?>
									<?php echo self::card_html( tus_kader_get_player( $post ) ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
								<?php endforeach; ?>
							</div>
						</div>
					</div>
					<?php
					$first = false;
				endforeach;
				?>
			</div>
			<?php echo self::modal_html(); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
		</div>
		<?php
		return ob_get_clean();
	}

	public static function card_html( $p ) {
		ob_start();
		?>
		<div class="pt-card"
			data-slug="<?php echo esc_attr( $p['slug'] ); ?>"
			data-name="<?php echo esc_attr( $p['name'] ); ?>"
			data-img="<?php echo esc_url( $p['img'] ); ?>"
			data-number="<?php echo esc_attr( $p['number'] ); ?>"
			data-position="<?php echo esc_attr( $p['position'] ); ?>"
			data-birthday="<?php echo esc_attr( $p['birthday'] ); ?>"
			data-nationality="<?php echo esc_attr( $p['nationality'] ); ?>"
			data-height="<?php echo esc_attr( $p['height'] ); ?>"
			data-sponsor="<?php echo esc_url( $p['sponsor'] ); ?>">
			<div class="pt-card-img-wrapper">
				<?php if ( $p['img'] ) : ?>
					<img class="pt-card-img" src="<?php echo esc_url( $p['img'] ); ?>" alt="<?php echo esc_attr( $p['name'] ); ?>">
				<?php endif; ?>
				<?php if ( $p['number'] !== '' ) : ?>
					<div class="pt-card-number"><?php echo esc_html( $p['number'] ); ?></div>
				<?php endif; ?>
			</div>
			<div class="pt-card-content">
				<h3 class="pt-card-title"><?php echo esc_html( $p['name'] ); ?></h3>
				<?php if ( $p['position'] !== '' ) : ?>
					<div class="pt-card-text"><?php echo esc_html( $p['position'] ); ?></div>
				<?php endif; ?>
				<?php if ( $p['sponsor'] ) : ?>
					<div class="pt-sponsor-card">
						<p class="pt-sponsor-title"><?php esc_html_e( 'Präsentiert von', 'spieler-popup' ); ?></p>
						<img class="pt-sponsor-logo" src="<?php echo esc_url( $p['sponsor'] ); ?>" alt="<?php esc_attr_e( 'Sponsor', 'spieler-popup' ); ?>">
					</div>
				<?php endif; ?>
			</div>
		</div>
		<?php
		return ob_get_clean();
	}

	public static function modal_html() {
		ob_start();
		?>
		<div class="pt-modal-wrapper" id="pt-modal" aria-hidden="true">
			<div class="pt-modal-overlay"></div>
			<div class="pt-modal-content" role="dialog" aria-modal="true" aria-labelledby="pt-modal-name">
				<button type="button" class="pt-modal-close" aria-label="<?php esc_attr_e( 'Schließen', 'spieler-popup' ); ?>">&times;</button>
				<div class="pt-modal-left">
					<img id="pt-modal-img" src="" alt="">
				</div>
				<div class="pt-modal-right">
					<h3 class="pt-modal-name" id="pt-modal-name"></h3>
					<ul class="pt-modal-stats-list">
						<li id="pt-modal-row-number"><strong><?php esc_html_e( 'Rückennummer', 'spieler-popup' ); ?></strong> <span id="pt-modal-number"></span></li>
						<li id="pt-modal-row-position"><strong><?php esc_html_e( 'Position', 'spieler-popup' ); ?></strong> <span id="pt-modal-position"></span></li>
						<li id="pt-modal-row-birthday"><strong><?php esc_html_e( 'Geburtstag', 'spieler-popup' ); ?></strong> <span id="pt-modal-birthday"></span></li>
						<li id="pt-modal-row-nationality"><strong><?php esc_html_e( 'Nationalität', 'spieler-popup' ); ?></strong> <span id="pt-modal-nationality"></span></li>
						<li id="pt-modal-row-height"><strong><?php esc_html_e( 'Größe', 'spieler-popup' ); ?></strong> <span id="pt-modal-height"></span></li>
					</ul>
					<div id="pt-modal-sponsor-wrapper" class="pt-sponsor-card" style="display:none;margin-top:0;">
						<p class="pt-sponsor-title"><?php esc_html_e( 'Präsentiert von', 'spieler-popup' ); ?></p>
						<img id="pt-modal-sponsor-img" class="pt-sponsor-logo" src="" alt="<?php esc_attr_e( 'Sponsor', 'spieler-popup' ); ?>">
					</div>
				</div>
			</div>
		</div>
		<?php
		return ob_get_clean();
	}

	public static function legacy_popup( $atts ) {
		wp_enqueue_style( 'spieler-popup-css' );
		wp_enqueue_script( 'spieler-popup-js' );

		$atts = shortcode_atts(
			array(
				'id'            => '',
				'name'          => '',
				'rueckennummer' => '',
				'position'      => '',
				'geburtstag'    => '',
				'nationalitaet' => '',
				'groesse'       => '',
				'bild'          => '',
			),
			$atts
		);

		ob_start();
		?>
		<div class="spieler-bild-wrapper">
			<img src="<?php echo esc_url( $atts['bild'] ); ?>" alt="<?php echo esc_attr( $atts['name'] ); ?>" class="spieler-bild" data-popup="<?php echo esc_attr( $atts['id'] ); ?>" />
		</div>
		<div id="popup-<?php echo esc_attr( $atts['id'] ); ?>" class="player-popup-overlay">
			<div class="player-popup-content">
				<span class="close-popup">&times;</span>
				<div class="popup-header"><?php echo esc_html( $atts['name'] ); ?></div>
				<div class="popup-body">
					<p><strong><?php esc_html_e( 'Rückennummer:', 'spieler-popup' ); ?></strong> <?php echo esc_html( $atts['rueckennummer'] ); ?></p>
					<p><strong><?php esc_html_e( 'Position:', 'spieler-popup' ); ?></strong> <?php echo esc_html( $atts['position'] ); ?></p>
					<p><strong><?php esc_html_e( 'Geburtstag:', 'spieler-popup' ); ?></strong> <?php echo esc_html( $atts['geburtstag'] ); ?></p>
					<p><strong><?php esc_html_e( 'Nationalität:', 'spieler-popup' ); ?></strong> <?php echo esc_html( $atts['nationalitaet'] ); ?></p>
					<p><strong><?php esc_html_e( 'Größe:', 'spieler-popup' ); ?></strong> <?php echo esc_html( $atts['groesse'] ); ?></p>
				</div>
			</div>
		</div>
		<?php
		return ob_get_clean();
	}
}
