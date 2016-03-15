import Cycle from '@cycle/core'
import { div, button, h1, ul, li, makeDOMDriver } from '@cycle/dom'
import { makeHTTPDriver } from '@cycle/http'
import { Observable } from 'rx'

import Planet from './planet'

const byBrownHair = user => user.hair_color === 'brown'

function main(sources) {
  const peopleUrl = 'http://swapi.co/api/people/'
  const getUsers$ = Observable.just({ url: peopleUrl, method: 'GET' })

  const users$ = sources.HTTP
    .filter(res$ => res$.request.url === peopleUrl)
    .mergeAll()
    .map(res => res.body.results)
    .startWith([])

  // const planets$ = sources.HTTP
  //   .filter(res$ => res$.request.url.includes(planetUrl))
  //   .mergeAll()
  //   .map(res => {
  //     console.log("res.body", res.body)
  //     return res.body.results
  //   })
  //   .startWith(null)


  // const usersPlanets$ = brownHairUsers$
  //   .map(users => {
  //     console.log("users", users)
  //     return users.map(user => {
  //       return Observable.just({ url: user.homeworld, method: 'GET' })
  //     })
  //   })
  //   .map(thing => {
  //     console.log("thing", thing)
  //   })



  // const getPlanets$ = brownHairUsers$
  //   .map(users => {
  //     return users.map(user => {
  //       console.log("user.homeworld", user.homeworld)
  //       return Observable.just({ url: user.homeworld, method: 'GET' })
  //     })
  //   })
    // .mergeAll()

  // const requests$ = Observable.concat(getUsers$, getPlanets$)
  // console.log("requests$", requests$)

  const brownHairUsers$ = users$
    .map(users => users.filter(byBrownHair))

  const planetVtree$ = brownHairUsers$
    .map(users => {
      return users.map(user => {
        return Planet({
          url: user.homeworld,
          HTTP: sources.HTTP
        }).DOM
      })
    })

  const vtree$ = brownHairUsers$.combineLatest(planetVtree$).map((users, planetsVTree) =>
    div([
      users.length > 0
        ? [
            h1('Swapi users'),
            ul(
              users.map(user => li(user.name))
            ),
            ul(
              planetsVTree
            )
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
