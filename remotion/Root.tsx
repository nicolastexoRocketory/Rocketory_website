import { Composition } from 'remotion'

import { RocketoryShowreel } from './Showreel'
import { VIDEO } from './theme'

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="RocketoryShowreel"
      component={RocketoryShowreel}
      durationInFrames={VIDEO.durationInFrames}
      fps={VIDEO.fps}
      width={VIDEO.width}
      height={VIDEO.height}
    />
  )
}
