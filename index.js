import Cycle from '@cycle/core'
import { div, button, h1, ul, li, makeDOMDriver } from '@cycle/dom'
import { makeHTTPDriver } from '@cycle/http'
import Rx from 'rx'

function main(sources) {
  const url = 'http://swapi.co/api/people/'
  const getUsers$ = Rx.Observable.just({ url, method: 'GET' })

  const users$ = sources.HTTP
    .filter(res$ => res$.request.url === url)
    .mergeAll()
    .map(res => res.body.results)
    .startWith([])

  const vtree$ = users$.map(users =>
    div([
      users.length > 0
        ? [
            h1('Swapi users'),
            ul(users.map(user => li(user.name)))
          ]
        : div('Loading...')
    ])
  )

  return {
    DOM: vtree$,
    HTTP: getUsers$
  }
}

const drivers = {
  DOM: makeDOMDriver('#app'),
  HTTP: makeHTTPDriver()
}

Cycle.run(main, drivers)
