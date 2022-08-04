const PARCEL_SIZE = 16

export function toParcel(x: number, z: number): [number, number] {
  return [Math.floor(x / PARCEL_SIZE), Math.floor(z / PARCEL_SIZE)]
}
