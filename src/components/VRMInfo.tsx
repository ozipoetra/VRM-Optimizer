import type { VRM, VRMMeta } from '@pixiv/three-vrm'
import { Info, Crosshair } from 'lucide-react'

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
  if (!vrm) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-base-content/40">
        <Info className="w-16 h-16 mb-4 opacity-50" strokeWidth={1.5} />
        <p className="text-sm font-medium">No model loaded</p>
        <p className="text-xs mt-1">Upload a VRM file to see info</p>
      </div>
    )
  }

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
    <div className="space-y-5">
      {(title || authors || version) && (
        <div className="space-y-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-base-content/50">Model Info</h3>

          <div className="card bg-base-100 border border-base-300 overflow-hidden">
            <div className="bg-gradient-to-r from-primary/10 to-secondary/10 p-4">
              <div className="flex items-center gap-3">
                <div className="avatar placeholder">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-secondary text-primary-content shadow-lg">
                    <span className="text-xl font-bold">{title ? title.charAt(0).toUpperCase() : '?'}</span>
                  </div>
                </div>
                <div>
                  <h4 className="font-bold text-base">{title || 'Unknown'}</h4>
                  {authors && <p className="text-xs text-base-content/60">{authors}</p>}
                </div>
              </div>
            </div>

            <div className="divide-y divide-base-200">
              {version && (
                <div className="flex justify-between items-center px-4 py-2.5">
                  <span className="text-xs text-base-content/50">Version</span>
                  <span className="text-sm font-medium">{version}</span>
                </div>
              )}
              {specVersion && (
                <div className="flex justify-between items-center px-4 py-2.5">
                  <span className="text-xs text-base-content/50">VRM Spec</span>
                  <span className="badge badge-primary badge-sm">{specVersion}</span>
                </div>
              )}
              {contact && (
                <div className="flex justify-between items-center px-4 py-2.5">
                  <span className="text-xs text-base-content/50">Contact</span>
                  <span className="text-xs text-base-content/70 truncate max-w-[200px]">{contact}</span>
                </div>
              )}
              {reference && (
                <div className="flex justify-between items-center px-4 py-2.5">
                  <span className="text-xs text-base-content/50">Reference</span>
                  <span className="text-xs text-base-content/70 truncate max-w-[200px]">{reference}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="space-y-3">
        <h3 className="text-sm font-bold uppercase tracking-wider text-base-content/50">Features</h3>

        <div className="grid grid-cols-3 gap-3">
          <div className="stat bg-base-100 border border-base-300 rounded-xl py-4 px-3">
            <div className="stat-title text-xs text-base-content/50">Bones</div>
            <div className="stat-value text-2xl text-primary">{availableBones.length}</div>
          </div>
          <div className="stat bg-base-100 border border-base-300 rounded-xl py-4 px-3">
            <div className="stat-title text-xs text-base-content/50">Expressions</div>
            <div className="stat-value text-2xl text-secondary">{expressionCount}</div>
          </div>
          <div className="stat bg-base-100 border border-base-300 rounded-xl py-4 px-3">
            <div className="stat-title text-xs text-base-content/50">Spring Bones</div>
            <div className="stat-value text-2xl text-accent">{springBoneCount}</div>
          </div>
        </div>
      </div>

      {availableBones.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-base-content/50">Humanoid Bones</h3>

          <div className="collapse collapse-arrow bg-base-100 rounded-xl border border-base-300">
            <input type="checkbox" />
            <div className="collapse-title text-sm font-medium">
              <div className="flex items-center gap-2">
                <Crosshair className="h-4 w-4 text-primary" />
                {availableBones.length} bones available
              </div>
            </div>
            <div className="collapse-content">
              <div className="flex flex-wrap gap-1.5">
                {availableBones.map((boneName) => (
                  <div key={boneName} className="badge badge-ghost badge-sm gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary/50"></div>
                    {boneDisplayNames[boneName] || boneName}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
