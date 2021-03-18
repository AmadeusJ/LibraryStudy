const { defineAbility } = require('@casl/ability');



module.exports = defineAbility((can, cannot) => {
  can('manage', 'all');        // 'all'에 대해 'manage'(casl에서는 아무 행위 모두를 지칭)할 수 있도록 허가
  cannot('delete', 'User');    // 'User'에 대해 'delete' 할 수 없게 미허가
});


// Condition 추가

/**
 * 
 * 
    can read any Article
    can update own Article's
    can leave a Comment for any Article
    can update own Comment
 * 
 * 
 */

import { defineAbility } from '@casl/ability';

// 위의 permissions 정의들을 user를 인자로 받은 함수에 사용할 수 있음
export default function defineAbilityFor(user) {
    return defineAbility((can) => {
    can('read', 'Article');

    if (user.isLoggedIn) {
        can('update', 'Article', { authorId: user.id });
        can('leave', 'Comment');
        can('update', 'Comment', { authorId: user.id });
    }
    });
}


// Subject의 타입을 지정 class로 지정
class Entity {
    constructor(attrs) {
      Object.assign(this, attrs);
    }
  }
  
  export class Article extends Entity {}

// 그럼 아래 처럼 이용이 가능 - 

import defineAbilityFor from './defineAbility';
import { Article } from './entities';

const user = { id: 1, isLoggedIn: true };           // 즉 db든 어딘가에서 가져온 user 정보가 있어야 한다.
const ownArticle = new Article({ authorId: user.id });
const anotherArticle = new Article({ authorId: 2 });
const ability = defineAbilityFor(user);             // definedAbilityFor에는 user가 가지고있는 permission code에 따른 제약/규약 정의들이 있어야함


ability.can('read', 'Article') // true
ability.can('update', 'Article') // true
ability.can('update', ownArticle) // true
ability.can('update', anotherArticle) // false, we can't update articles which were not written by us


// 좀더 디테일하게 접근/수정 가능한 fields를 지정해 줄 수 있다.

import { defineAbility } from '@casl/ability';

export default (user) => defineAbility((can) => {
  can('read', 'Article');
  can('update', 'Article', ['title', 'description'], { authorId: user.id })

  if (user.isModerator) {
    can('update', 'Article', ['published'])
  }
});

import defineAbilityFor from './defineAbility';
import { Article } from './entities';

const moderator = { id: 2, isModerator: true };
const ownArticle = new Article({ authorId: moderator.id });
const foreignArticle = new Article({ authorId: 10 });
const ability = defineAbilityFor(moderator);

ability.can('read', 'Article') // true
ability.can('update', 'Article', 'published') // true
ability.can('update', ownArticle, 'published') // true
ability.can('update', foreignArticle, 'title') // false


/**
 *  아래 예제를 보이면서 
 *  Inverted Rule을 사용하지 말라고 하고 있음 - 
 *  can 이 cannot을 override 해버리는 이유라고는 하는데,,,
 *  자세히는 잘 몰겠음...
 */

 const user = { id: 1 };
 const ability = defineAbility((can, cannot) => {
   cannot('read', 'all', { private: true });
   can('read', 'all', { authorId: user.id });
 });
 
 ability.can('read', { private: true }); // false
 ability.can('read', { authorId: user.id }); // true
 ability.can('read', { authorId: user.id, private: true }); // true!




 // Forbbiden되는 이유를 알려 줄 수도 있음

import { defineAbility } from '@casl/ability';

export default defineAbility((can, cannot) => {
  can('read', 'all');
  cannot('read', 'all', { private: true })
    .because('You are not allowed to read private information');
});

import { ForbiddenError } from '@casl/ability';
import ability from './defineAbility';

try {
  ForbiddenError.from(ability).throwUnlessCan('read', { private: true })
} catch (error) {
  if (error instanceof ForbiddenError) {
    console.log(error.message); // You are not allowed to read private information
  }

  throw error
}



// ability update도 가능. . .
import ability from './defineAbility';

ability.update([]); // forbids everything
ability.update([ // switch to readonly mode
  { action: 'read', subject: 'all' }
]);


import { Ability, AbilityBuilder } from '@casl/ability';

const ability = new Ability();

const { can, rules } = new AbilityBuilder();
can('read', 'all');

ability.update(rules);


const unsubscribe = ability.on('update', ({ rules, target }) => {
  // `rules` is an array passed to `update` method
  // `target` is an Ability instance that triggered event
})

unsubscribe() // removes subscription

