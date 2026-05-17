import type { VRM, VRMMeta } from '@pixiv/three-vrm'

interface VRMInfoProps {
  vrm: VRM | null
}

const boneDisplayNames: Record<string, string> = {
  hips: 'Hips',
  spine: 'Spine',
  chest: 'Chest',
  upperChest: 'Upper Chest',
  neck: 'Neck',
  head: 'Head',
  leftEye: 'Left Eye',
  rightEye: 'Right Eye',
  jaw: 'Jaw',
  leftShoulder: 'L Shoulder',
  leftUpperArm: 'L Upper Arm',
  leftLowerArm: 'L Lower Arm',
  leftHand: 'L Hand',
  leftThumbMetacarpal: 'L Thumb Meta',
  leftThumbProximal: 'L Thumb Prox',
  leftThumbDistal: 'L Thumb Dist',
  leftIndexProximal: 'L Index Prox',
  leftIndexIntermediate: 'L Index Inter',
  leftIndexDistal: 'L Index Dist',
  leftMiddleProximal: 'L Middle Prox',
  leftMiddleIntermediate: 'L Middle Inter',
  leftMiddleDistal: 'L Middle Dist',
  leftRingProximal: 'L Ring Prox',
  leftRingIntermediate: 'L Ring Inter',
  leftRingDistal: 'L Ring Dist',
  leftLittleProximal: 'L Little Prox',
  leftLittleIntermediate: 'L Little Inter',
  leftLittleDistal: 'L Little Dist',
  rightShoulder: 'R Shoulder',
  rightUpperArm: 'R Upper Arm',
  rightLowerArm: 'R Lower Arm',
  rightHand: 'R Hand',
  rightThumbMetacarpal: 'R Thumb Meta',
  rightThumbProximal: 'R Thumb Prox',
  rightThumbDistal: 'R Thumb Dist',
  rightIndexProximal: 'R Index Prox',
  rightIndexIntermediate: 'R Index Inter',
  rightIndexDistal: 'R Index Dist',
  rightMiddleProximal: 'R Middle Prox',
  rightMiddleIntermediate: 'R Middle Inter',
  rightMiddleDistal: 'R Middle Dist',
  rightRingProximal: 'R Ring Prox',
  rightRingIntermediate: 'R Ring Inter',
  rightRingDistal: 'R Ring Dist',
  rightLittleProximal: 'R Little Prox',
  rightLittleIntermediate: 'R Little Inter',
  rightLittleDistal: 'R Little Dist',
  leftUpperLeg: 'L Upper Leg',
  leftLowerLeg: 'L Lower Leg',
  leftFoot: 'L Foot',
  leftToes: 'L Toes',
  rightUpperLeg: 'R Upper Leg',
  rightLowerLeg: 'R Lower Leg',
  rightFoot: 'R Foot',
  rightToes: 'R Toes',
}

function getMetaString(meta: VRMMeta | undefined, key: string): string | undefined {
  if (!meta) return undefined
  const v = (meta as unknown as Record<string, unknown>)[key]
  if (typeof v === 'string') return v
  if (Array.isArray(v) && v.length > 0 && typeof v[0] === 'string') return v[0]
  return undefined
}

export function VRMInfo({ vrm }: VRMInfoProps) {
  if (!vrm) return null

  const meta = vrm.meta
  const humanoid = vrm.humanoid
  const expressionManager = vrm.expressionManager
  const springBone = vrm.springBoneManager

  const availableBones = humanoid?.humanBones
    ? Object.entries(humanoid.humanBones)
        .filter(([, bone]) => bone !== null)
        .map(([name]) => name)
    : []

  const expressionCount = expressionManager?.expressions.length ?? 0
  const springBoneCount = springBone ? springBone.joints.size : 0

  const title = getMetaString(meta, 'title') || getMetaString(meta, 'name')
  const version = getMetaString(meta, 'version')
  const authors = getMetaString(meta, 'authors') || getMetaString(meta, 'author')
  const contact = getMetaString(meta, 'contactInformation') || getMetaString(meta, 'contact')
  const reference = getMetaString(meta, 'reference')
  const specVersion = getMetaString(meta, 'specVersion')

  return (
    <div className="space-y-4">
      {meta && (
        <div>
          <h4 className="text-white font-medium text-sm mb-2">Model Info</h4>
          <div className="space-y-1.5 text-xs">
            {title && (
              <div className="flex justify-between">
                <span className="text-white/50">Title</span>
                <span className="text-white/80">{title}</span>
              </div>
            )}
            {version && (
              <div className="flex justify-between">
                <span className="text-white/50">Version</span>
                <span className="text-white/80">{version}</span>
              </div>
            )}
            {authors && (
              <div className="flex justify-between">
                <span className="text-white/50">Author</span>
                <span className="text-white/80">{authors}</span>
              </div>
            )}
            {contact && (
              <div className="flex justify-between">
                <span className="text-white/50">Contact</span>
                <span className="text-white/80 truncate max-w-32">{contact}</span>
              </div>
            )}
            {reference && (
              <div className="flex justify-between">
                <span className="text-white/50">Reference</span>
                <span className="text-white/80 truncate max-w-32">{reference}</span>
              </div>
            )}
            {specVersion && (
              <div className="flex justify-between">
                <span className="text-white/50">VRM Spec</span>
                <span className="text-white/80">{specVersion}</span>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="border-t border-white/10 pt-3">
        <h4 className="text-white font-medium text-sm mb-2">Features</h4>
        <div className="space-y-1.5 text-xs">
          <div className="flex justify-between">
            <span className="text-white/50">Bones</span>
            <span className="text-white/80">{availableBones.length}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/50">Expressions</span>
            <span className="text-white/80">{expressionCount}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/50">Spring Bones</span>
            <span className="text-white/80">{springBoneCount}</span>
          </div>
        </div>
      </div>

      {availableBones.length > 0 && (
        <div className="border-t border-white/10 pt-3">
          <h4 className="text-white font-medium text-sm mb-2">Humanoid Bones</h4>
          <div className="grid grid-cols-2 gap-1 max-h-40 overflow-y-auto">
            {availableBones.map((boneName) => (
              <div key={boneName} className="text-xs text-white/60">
                {boneDisplayNames[boneName] || boneName}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
