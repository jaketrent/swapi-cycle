import Cycle from '@cycle/core'
import { div, button, h1, ul, li, makeDOMDriver } from '@cycle/dom'
import { makeHTTPDriver } from '@cycle/http'
import { Observable } from 'rx'

function main(sources) {
  const sinks = {
    DOM: Observable.of(
      ul([
        li(`User 1 - Homeworld name`),
        li(`User 2 - Homeworld name`),
        li(`User 3 - Homeworld name`)
      ])
    )
  }
  return sinks
}
const drivers = {
  DOM: makeDOMDriver('#app'),
  // HTTP: makeHTTPDriver()
}

Cycle.run(main, drivers)
