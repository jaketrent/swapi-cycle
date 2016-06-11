import Cycle from '@cycle/core'
import { div, button, h1, ul, li, makeDOMDriver } from '@cycle/dom'
import { makeHTTPDriver } from '@cycle/http'
import { Observable } from 'rx'

const url = 'http://swapi.co/api/people/'
function main(sources) {
  const requestUsers$ = Observable.just({ url })

  const res$$ = sources.HTTP
          .filter(res$ => res$.request.url === url)

  const res$ = res$$.switch()
  const users$ = res$.map(res => res.body.results)

  return {
    DOM: users$.map(users => 
      ul(
        users.map(user => li(`${user.name} - ${user.homeworld}`))
      )
    ),
    HTTP: requestUsers$
  }
}
const drivers = {
  DOM: makeDOMDriver('#app'),
  HTTP: makeHTTPDriver()
}

Cycle.run(main, drivers)

