import './rocketory-brand.scss'

type Props = {
  variant?: 'logo' | 'icon'
}

export function RocketoryWordmark({ variant = 'logo' }: Props) {
  return (
    <span className={`rk-admin-wordmark rk-admin-wordmark--${variant}`} aria-label="Rocketory">
      Rocket<span className="rk-admin-wordmark-ory">ory</span>
    </span>
  )
}
