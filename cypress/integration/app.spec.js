context('Window', () => {
  beforeEach(() => {
    cy.visit('http://localhost:8080')
  })

  it('let me search for a dependency', () => {
    cy.get('input[name=identifier]').type('react')
    cy.get('form').submit()
    cy.get('h2').should('contain', 'results for react@')
  })

  it('let me change my search', () => {
    cy.get('input[name=identifier]').type('apish')
    cy.get('form').submit()
    cy.get('h2').should('contain', 'results for apish@')

    cy.get('input[name=identifier]').clear().type('react')
    cy.get('form').submit()
    cy.get('h2').should('contain', 'results for react@')
  })

  it('handles packages without dependencies', () => {
    cy.get('input[name=identifier]').type('lodash@2')
    cy.get('form').submit()
    cy.get('h2').should('contain', 'results for lodash@')
    cy.get('p').should('contain', 'No dependencies')
  })

  it('marks circular dependencies', () => {
    cy.get('input[name=identifier]').type('webpack@4')
    cy.get('form').submit()
    cy.get('h2').should('contain', 'results for webpack@')
    cy.get('.warn').should('contain', 'Dependency loop detected')
  })

  it('handles non-existent package name', () => {
    cy.get('input[name=identifier]').type('@mycorp/zamboni')
    cy.get('form').submit()
    cy.get('h2').should('contain', 'Error: Package not found')
  })

  it('handles non-existent package version', () => {
    cy.get('input[name=identifier]').type('angular')
    cy.get('form').submit()
    cy.get('h2').should('contain', 'results for angular@')
    cy.get('input[name=identifier]').clear().type('angular@3')
    cy.get('form').submit()
    cy.get('h2').should('contain', 'Error: No matching version found for angular@3')
  })
})
