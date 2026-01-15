import { tosi } from './xin-proxy'

const { x } = tosi({ x: { y: 17 } })

console.log('x.y:', x.y)
console.log('typeof x.y:', typeof x.y)
console.log('x.y.value:', x.y.value)
console.log('typeof x.y.value:', typeof x.y.value)
console.log('x.y.xinValue:', x.y.xinValue)
console.log('typeof x.y.xinValue:', typeof x.y.xinValue)
console.log('x.y.path:', x.y.path)
console.log('x.y.xinPath:', x.y.xinPath)
