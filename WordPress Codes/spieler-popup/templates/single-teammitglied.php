<?php
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

get_header();

$player = tus_kader_get_player( get_the_ID() );
$hero   = tus_kader_hero_url();
$cta    = add_query_arg( 'spieler', $player['slug'], tus_kader_team_url() );

$all_in_group = tus_kader_query_players( $player['group'] );
$related      = array();
foreach ( $all_in_group as $rel_post ) {
	if ( (int) $rel_post->ID === (int) get_the_ID() ) {
		continue;
	}
	$related[] = $rel_post;
}
shuffle( $related );
$related = array_slice( $related, 0, 3 );

$stats = array(
	__( 'Rückennummer', 'spieler-popup' ) => $player['number'],
	__( 'Position', 'spieler-popup' )     => $player['position'],
	__( 'Geburtstag', 'spieler-popup' )   => $player['birthday'],
	__( 'Nationalität', 'spieler-popup' ) => $player['nationality'],
	__( 'Größe', 'spieler-popup' )        => $player['height'],
);
?>

<div id="Content" class="tus-player-page">
	<section class="tus-player-hero" style="background-image:url('<?php echo esc_url( $hero ); ?>');">
		<div class="tus-player-hero__overlay"></div>
		<div class="tus-player-hero__inner">
			<span class="tus-player-hero__tag"><?php echo esc_html( $player['group_label'] ); ?></span>
			<h1 class="tus-player-hero__title"><?php echo esc_html( $player['name'] ); ?></h1>
		</div>
	</section>

	<div class="tus-player-layout">
		<article class="tus-player-main">
			<?php if ( $player['img'] ) : ?>
				<figure class="tus-player-portrait">
					<img src="<?php echo esc_url( $player['img'] ); ?>" alt="<?php echo esc_attr( $player['name'] ); ?>">
				</figure>
			<?php endif; ?>

			<ul class="tus-player-stats">
				<?php foreach ( $stats as $label => $value ) : ?>
					<?php if ( $value !== '' ) : ?>
						<li><strong><?php echo esc_html( $label ); ?></strong> <span><?php echo esc_html( $value ); ?></span></li>
					<?php endif; ?>
				<?php endforeach; ?>
			</ul>

			<?php if ( $player['sponsor'] ) : ?>
				<div class="pt-sponsor-card tus-player-sponsor">
					<p class="pt-sponsor-title"><?php esc_html_e( 'Präsentiert von', 'spieler-popup' ); ?></p>
					<img class="pt-sponsor-logo" src="<?php echo esc_url( $player['sponsor'] ); ?>" alt="<?php esc_attr_e( 'Sponsor', 'spieler-popup' ); ?>">
				</div>
			<?php endif; ?>

			<?php if ( trim( wp_strip_all_tags( $player['content'] ) ) ) : ?>
				<div class="tus-player-bio">
					<?php echo apply_filters( 'the_content', $player['content'] ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
				</div>
			<?php endif; ?>

			<p class="tus-player-cta-wrap">
				<a class="tus-player-cta" href="<?php echo esc_url( $cta ); ?>"><?php esc_html_e( 'Im Kader ansehen', 'spieler-popup' ); ?></a>
			</p>
		</article>

		<aside class="tus-player-sidebar">
			<h3 class="tus-player-sidebar__title"><?php esc_html_e( 'Weitere Spieler', 'spieler-popup' ); ?></h3>
			<?php if ( $related ) : ?>
				<ul class="tus-player-related">
					<?php foreach ( $related as $rel_post ) : ?>
						<?php $rel = tus_kader_get_player( $rel_post ); ?>
						<li>
							<a href="<?php echo esc_url( $rel['permalink'] ); ?>">
								<?php if ( $rel['img'] ) : ?>
									<img src="<?php echo esc_url( $rel['img'] ); ?>" alt="<?php echo esc_attr( $rel['name'] ); ?>">
								<?php endif; ?>
								<span>
									<?php echo esc_html( $rel['name'] ); ?>
									<?php if ( $rel['position'] ) : ?>
										<small><?php echo esc_html( $rel['position'] ); ?></small>
									<?php endif; ?>
								</span>
							</a>
						</li>
					<?php endforeach; ?>
				</ul>
			<?php endif; ?>

			<h3 class="tus-player-sidebar__title"><?php esc_html_e( 'Alle Spieler', 'spieler-popup' ); ?></h3>
			<?php foreach ( tus_kader_groups() as $slug => $label ) : ?>
				<?php
				$list = tus_kader_query_players( $slug );
				if ( ! $list ) {
					continue;
				}
				?>
				<p class="tus-player-all__group"><?php echo esc_html( $label ); ?></p>
				<ul class="tus-player-all">
					<?php foreach ( $list as $item ) : ?>
						<li>
							<?php if ( (int) $item->ID === (int) get_the_ID() ) : ?>
								<strong><?php echo esc_html( get_the_title( $item ) ); ?></strong>
							<?php else : ?>
								<a href="<?php echo esc_url( get_permalink( $item ) ); ?>"><?php echo esc_html( get_the_title( $item ) ); ?></a>
							<?php endif; ?>
						</li>
					<?php endforeach; ?>
				</ul>
			<?php endforeach; ?>

			<p class="tus-player-sidebar__more">
				<a href="<?php echo esc_url( tus_kader_team_url() ); ?>"><?php esc_html_e( 'Zum Kader', 'spieler-popup' ); ?></a>
			</p>
		</aside>
	</div>
</div>

<?php
get_footer();
