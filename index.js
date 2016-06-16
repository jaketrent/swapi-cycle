import Cycle from '@cycle/core'
import { ul, li, makeDOMDriver } from '@cycle/dom'
import { makeHTTPDriver } from '@cycle/http'
import { Observable } from 'rx'

function intent(HTTPSource) {
  const url = 'http://swapi.co/api/people/'
  const requestUsers$ = Observable.just({ url })

  const usersRes$$ = HTTPSource
          .filter(res$ => res$.request.url === url)

  const usersRes$ = usersRes$$.switch()
  const users$ = usersRes$.map(res => res.body.results)

  const requestHomeworlds$ = users$.flatMap(users => {
    return users.map(user => {
      return { url: user.homeworld, id: 'homeworld' } 
    })
  })

  const homeworldsRes$$ = HTTPSource
          .filter(res$ => res$.request.id === 'homeworld')

  const homeworldsRes$ = homeworldsRes$$.mergeAll()
  const homeworld$ = homeworldsRes$.map(res => {
    return res.body
  })

  const homeworlds$ = homeworld$.scan((acc, homeworld) => {
    acc = acc.concat(homeworld)
    return acc
  }, [])

  return { users$, homeworlds$, requestUsers$, requestHomeworlds$ }
}

function model(users$, homeworlds$) {
  return Observable.combineLatest(
    users$,
    homeworlds$,
    (users, homeworlds) => {
      return users.map(user => {
        const homeworld = homeworlds.filter(hw => hw.url === user.homeworld)[0]
        return { user, homeworld }
      })
    }
  )
}

function view(state$) {
  return state$.map(state =>
    ul(
      state.map(model =>
        li(`${model.user.name} - ${model.homeworld ? model.homeworld.name : 'UNKNOWN'}`)
      )
    )
  )
}

function main(sources) {
  const { users$, homeworlds$, requestUsers$, requestHomeworlds$ } = intent(sources.HTTP)
  const state$ = model(users$, homeworlds$)
  const vtree$ = view(state$)

  return {
    DOM: vtree$,
    HTTP: Observable.merge(requestUsers$, requestHomeworlds$)
  }
}
const drivers = {
  DOM: makeDOMDriver('#app'),
  HTTP: makeHTTPDriver({ eager: true })
}

Cycle.run(main, drivers)

