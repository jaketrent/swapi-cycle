import Cycle from '@cycle/core'
import { div, button, h1, ul, li, makeDOMDriver } from '@cycle/dom'
import { makeHTTPDriver } from '@cycle/http'
import { Observable } from 'rx'

const url = 'http://swapi.co/api/people/1/'
function main(sources) {
  const requestUser$ = Observable.just({ url })

  const userRes$$ = sources.HTTP
    .filter(res$ => res$.request.url === url)

  const userRes$ = userRes$$.switch()
  const user$ = userRes$.map(res => res.body)

  const requestHomeworld$ = user$.map(user => {
    return { url: user.homeworld, id: 'homeworld' } 
  })

  const homeworldRes$$ = sources.HTTP
    .filter(res$ => res$.request.id === 'homeworld')

  const homeworldRes$ = homeworldRes$$.switch()
  const homeworld$ = homeworldRes$.map(res => res.body)

  return {
    DOM: Observable.combineLatest(user$, homeworld$, (user, homeworld) => {
      return li(`${user.name} - ${homeworld.name}`)
    }),

    HTTP: Observable.merge(requestUser$, requestHomeworld$)
  }
}
const drivers = {
  DOM: makeDOMDriver('#app'),
  HTTP: makeHTTPDriver({ eager: true })
}

Cycle.run(main, drivers)

