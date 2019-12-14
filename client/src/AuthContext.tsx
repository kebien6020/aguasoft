import * as React from 'react'
import Auth from './Auth'

// The defaultValue argument is only used when a component does not have a
// matching Provider above it in the tree. This can be helpful for testing
// components in isolation without wrapping them.
// Note: passing undefined as a Provider value does not cause consuming
// components to use defaultValue.

const AuthContext = React.createContext<Auth>(null as unknown as Auth);

export default AuthContext
