import Cycle from '@cycle/core'
import { div, button, ul, li, makeDOMDriver } from '@cycle/dom'
import { makeHTTPDriver } from '@cycle/http'
import Rx from 'rx'

function main(sources) {
  const url = 'http://swapi.co/api/people/'
  const getUsers$ = Rx.Observable.just({ url, method: 'GET' })

  const users$ = sources.HTTP
    .filter(res$ => res$.request.url === url)
    .mergeAll()
    .map(res => res.body)
    .startWith(null)

  const vtree$ = users$.map(user =>
    div('swapi')
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
