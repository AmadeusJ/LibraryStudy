const ability = require('./defineAbility');

console.log('can read Post', ability.can('read', 'Post')) // true
// ==> 'Post'를 'read'할 수있는 가 ?

console.log('can read User', ability.can('read', 'User')) // true
console.log('can update User', ability.can('update', 'User')) // true
console.log('can delete User', ability.can('delete', 'User')) // false
console.log('cannot delete User', ability.cannot('delete', 'User')) // true
// ==> 'User'를 'delete' 할 수 없는 가?


