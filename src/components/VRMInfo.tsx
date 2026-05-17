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
  if (!vrm) {
    return (
      <div className="text-center py-8 text-base-content/50">
        <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-sm">Load a model to see info</p>
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
      {/* Model Metadata */}
      {meta && (title || authors || version) && (
        <div className="card bg-base-300/50">
          <div className="card-body p-4">
            <h3 className="card-title text-sm">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Model Info
            </h3>

            <ul className="list bg-base-100 rounded-lg">
              {title && (
                <li className="list-row py-2">
                  <div className="text-base-content/50 text-xs w-20 shrink-0">Title</div>
                  <div className="font-medium text-sm truncate">{title}</div>
                </li>
              )}
              {authors && (
                <li className="list-row py-2">
                  <div className="text-base-content/50 text-xs w-20 shrink-0">Author</div>
                  <div className="text-sm truncate">{authors}</div>
                </li>
              )}
              {version && (
                <li className="list-row py-2">
                  <div className="text-base-content/50 text-xs w-20 shrink-0">Version</div>
                  <div className="text-sm">{version}</div>
                </li>
              )}
              {specVersion && (
                <li className="list-row py-2">
                  <div className="text-base-content/50 text-xs w-20 shrink-0">VRM Spec</div>
                  <div><span className="badge badge-primary badge-sm">{specVersion}</span></div>
                </li>
              )}
              {contact && (
                <li className="list-row py-2">
                  <div className="text-base-content/50 text-xs w-20 shrink-0">Contact</div>
                  <div className="text-sm truncate">{contact}</div>
                </li>
              )}
              {reference && (
                <li className="list-row py-2">
                  <div className="text-base-content/50 text-xs w-20 shrink-0">Reference</div>
                  <div className="text-sm truncate">{reference}</div>
                </li>
              )}
            </ul>
          </div>
        </div>
      )}

      {/* Features Stats */}
      <div className="card bg-base-300/50">
        <div className="card-body p-4">
          <h3 className="card-title text-sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Features
          </h3>

          <div className="grid grid-cols-3 gap-3">
            <div className="stat bg-base-100 rounded-lg py-3 px-2">
              <div className="stat-value text-primary text-xl">{availableBones.length}</div>
              <div className="stat-title text-xs">Bones</div>
            </div>
            <div className="stat bg-base-100 rounded-lg py-3 px-2">
              <div className="stat-value text-secondary text-xl">{expressionCount}</div>
              <div className="stat-title text-xs">Expressions</div>
            </div>
            <div className="stat bg-base-100 rounded-lg py-3 px-2">
              <div className="stat-value text-accent text-xl">{springBoneCount}</div>
              <div className="stat-title text-xs">Spring Bones</div>
            </div>
          </div>
        </div>
      </div>

      {/* Bones List */}
      {availableBones.length > 0 && (
        <div className="collapse collapse-arrow bg-base-300/50 rounded-lg">
          <input type="checkbox" />
          <div className="collapse-title text-sm font-medium">
            <div className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
              Humanoid Bones
            </div>
          </div>
          <div className="collapse-content">
            <div className="grid grid-cols-2 gap-1.5">
              {availableBones.map((boneName) => (
                <div key={boneName} className="badge badge-ghost badge-sm gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary/50"></div>
                  {boneDisplayNames[boneName] || boneName}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
