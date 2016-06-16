import Cycle from '@cycle/core'
import { div, button, h1, ul, li, makeDOMDriver } from '@cycle/dom'
import { makeHTTPDriver } from '@cycle/http'
import { Observable } from 'rx'

const url = 'http://swapi.co/api/people/'
function main(sources) {
  const requestUsers$ = Observable.just({ url })

  const usersRes$$ = sources.HTTP
    .filter(res$ => res$.request.url === url)

  const usersRes$ = usersRes$$.switch()
  const users$ = usersRes$.map(res => res.body.results)

  const requestHomeworlds$ = users$.flatMap(users => {
    return users.map(user => {
      return { url: user.homeworld, id: 'homeworld' } 
    })
  })

  const homeworldsRes$$ = sources.HTTP
    .filter(res$ => res$.request.id === 'homeworld')

  const homeworldsRes$ = homeworldsRes$$.mergeAll()
  const homeworld$ = homeworldsRes$.map(res => {
    return res.body
  })

  const homeworlds$ = homeworld$.scan((acc, homeworld) => {
    acc = acc.concat(homeworld)
    return acc
  }, [])

  return {
    DOM: Observable.combineLatest(users$, homeworlds$, (users, homeworlds) => {
      return ul(
        users.map(user => {
          const homeworld = homeworlds.filter(hw => hw.url === user.homeworld)[0] || {}
          return li(`${user.name} - ${homeworld.name || 'UNKNOWN'}`)
        })
      )
    }),

    HTTP: Observable.merge(requestUsers$, requestHomeworlds$)
  }
}
const drivers = {
  DOM: makeDOMDriver('#app'),
  HTTP: makeHTTPDriver({ eager: true })
}

Cycle.run(main, drivers)

